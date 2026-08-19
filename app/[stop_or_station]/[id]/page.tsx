"use server"

import { redirect } from "next/navigation";
import { MapOverlay, Sidebar } from "../../mapcontext";
import { gtfsIdRegex } from "@/app/lib/digitransit";
import { ApolloClient, HttpLink, InMemoryCache, TypedDocumentNode, gql } from "@apollo/client";
import { StationMetadataQueryQuery, StationQueryQuery, StationQueryQueryVariables, StopMatadataQueryQuery, StopMatadataQueryQueryVariables, StopQueryQuery, StopQueryQueryVariables } from "./page.generated";
import Toast from "@/app/components/toast";
import Link from "next/link";
import Content from "./content";
import { Map } from "./Map";
import { Metadata, ResolvingMetadata } from "next";


const GET_STOP_METADATA:
  TypedDocumentNode<StopQueryQuery, StopQueryQueryVariables> =
  gql`
    query StopMatadataQuery($stopId: String!) {
        stop(id: $stopId) {
          name
          platformCode
          code
        }
    }
    `
const GET_STATION_METADATA:
  TypedDocumentNode<StopQueryQuery, StopQueryQueryVariables> =
  gql`
    query StationMetadataQuery($stopId: String!) {
        station(id: $stopId) {
          name
          platformCode
          code
        }
    }
    `

const GET_STOP:
  TypedDocumentNode<StopQueryQuery, StopQueryQueryVariables> =
  gql`
    query StopQuery($stopId: String!) {
        stop(id: $stopId) {
          name
          lon
          lat
          locationType
          platformCode
          gtfsId
          parentStation {
            name
            gtfsId
          }
          vehicleMode
          code
          desc
          stoptimesWithoutPatterns(numberOfDepartures: 100,timeRange: 604800) {
            scheduledDeparture
            scheduledArrival
            realtimeArrival
            realtime
            realtimeDeparture
            dropoffType
            pickupType
            headsign
            serviceDay
            arrivalDelay
            departureDelay
            trip {
              routeShortName
              directionId
              isReplacement
              route {
                gtfsId
                type
                mode
              }
              pattern {
                code
              }
            }
          }
        }
    }
    `

const GET_STATION:
  TypedDocumentNode<StationQueryQuery, StationQueryQueryVariables> =
  gql`
    query StationQuery($stopId: String!) {
        station(id: $stopId) {
          name
          lon
          lat
          locationType
          platformCode
          gtfsId
          vehicleMode
          code
          desc
          stoptimesWithoutPatterns(numberOfDepartures: 100,timeRange: 604800) {
            scheduledDeparture
            scheduledArrival
            dropoffType
            pickupType
            realtimeArrival
            realtime
            realtimeDeparture
            headsign
            arrivalDelay
            departureDelay
            serviceDay
            stop {
              platformCode
            }
            trip {
              routeShortName
              directionId
              isReplacement
              route {
                gtfsId
                type
                mode
              }
              pattern {
                code
              }
            }
          }
        }
    }
    `

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

type Props = {
  params: Promise<{ id: string, stop_or_station: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export  async function generateMetadata({
  params,
  searchParams
}: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id, stop_or_station } = await params

  const isHsl = (await searchParams).hsl != undefined
  if (stop_or_station != "stop" && stop_or_station != "station") return {title: "Unknown Stop - Hekinav Routing"}

  if (!gtfsIdRegex.test(decodeURIComponent(id))) {
    return {title: "Unknown Stop - Hekinav Routing"}
  }
  

  const client = new ApolloClient({
    link: new HttpLink({ uri: `https://api.digitransit.fi/routing/v2/${isHsl ? "hsl" : "finland"}/gtfs/v1/`, headers: { "digitransit-subscription-key": process.env.DIGITRANSIT_KEY || "" } }),
    cache: new InMemoryCache(),
  });

  const query = stop_or_station == "station" ? GET_STATION_METADATA : GET_STOP_METADATA
  const result = await client.query({
    query: query as TypedDocumentNode<StopMatadataQueryQuery | StationMetadataQueryQuery, StopMatadataQueryQueryVariables>,
    variables: {
      stopId: decodeURIComponent(id)
    }
  })

  if (result.error || !result.data) {
    return {title: "Unknown Stop - Hekinav Routing"}
  }
  const data = (result.data as StopMatadataQueryQuery).stop || (result.data as StationMetadataQueryQuery).station
  if (!data) return {title: "Unknown Stop - Hekinav Routing"}

  return {
    title: `${data.name} ${data.platformCode ? `pl. ${data.platformCode}` : ""} ${data.code ? `(${data.code})` : ""}`,
    description: `View departures and routes of ${data.name} ${data.platformCode ? `pl. ${data.platformCode}` : ""} in Hekinav Routing`
  }
}

export default async function StopOrStation({
  params,
  searchParams
}: {
  params: Promise<{
    stop_or_station: string
    id: string
  }>,
  searchParams: SearchParams;
}) {
  const { id, stop_or_station } = await params

  const isHsl = (await searchParams).hsl != undefined
  if (stop_or_station != "stop" && stop_or_station != "station") {
    redirect(`/${isHsl ? "?hsl" : ""}`)
  }

  if (!gtfsIdRegex.test(decodeURIComponent(id))) {
    redirect(`/${isHsl ? "?hsl" : ""}`)
  }
  if (isHsl && id.slice(0, 3) != "HSL") {
    return (
      <Sidebar>
        Failed to load stop
        <Toast type="error" message={<span>You are using the HSL-only mode. This stop does not look like a HSL stop. <Link className="text-green" href="/?hsl">Go to home</Link> or <Link className="text-green" href="./">Change to the Finland-wide version</Link> </span>}></Toast>
      </Sidebar>
    )
  }

  const client = new ApolloClient({
    link: new HttpLink({ uri: `https://api.digitransit.fi/routing/v2/${isHsl ? "hsl" : "finland"}/gtfs/v1/`, headers: { "digitransit-subscription-key": process.env.DIGITRANSIT_KEY || "" } }),
    cache: new InMemoryCache(),
  });

  const query = stop_or_station == "station" ? GET_STATION : GET_STOP
  const result = await client.query({
    query: query as TypedDocumentNode<StationQueryQuery | StopQueryQuery, StationQueryQueryVariables | StopQueryQueryVariables>,
    variables: {
      stopId: decodeURIComponent(id)
    }
  })

  if (result.error || !result.data) {
    return (
      <Sidebar>
        Failed to load stop
        <Toast type="error" message={`Failed to get stop data: ${result.error?.message || "Unknown error"}`}></Toast>
      </Sidebar>
    )
  }
  const data = (result.data as StopQueryQuery).stop || (result.data as StationQueryQuery).station
  if (!data) return

  return (
    <>
      <Sidebar>

        <Content
          data={data as NonNullable<StopQueryQuery["stop"]>}
          isHsl={isHsl}
          stop_or_station={stop_or_station}
        />

      </Sidebar>
      <MapOverlay>
        <Map data={data as NonNullable<StopQueryQuery["stop"]>}

        />
      </MapOverlay>
    </>
  );
}







