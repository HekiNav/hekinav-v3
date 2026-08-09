"use server"

import { redirect } from "next/navigation";
import { MapOverlay, Sidebar } from "../../mapcontext";
import { IconTable, gtfsIdRegex } from "@/app/lib/digitransit";
import { ApolloClient, HttpLink, InMemoryCache, TypedDocumentNode, gql } from "@apollo/client";
import { StopQueryQuery, StopQueryQueryVariables } from "./page.generated";
import Toast from "@/app/components/toast";
import Label from "@/app/components/label";
import IconItem from "@/app/components/iconitem";


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
          stoptimesWithoutPatterns(numberOfDepartures: 10) {
            scheduledDeparture
            scheduledArrival
            realtimeArrival
            realtime
            realtimeDeparture
            headsign
            arrivalDelay
            departureDelay
            trip {
              routeShortName
              isReplacement
              route {
                gtfsId
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

  const client = new ApolloClient({
    link: new HttpLink({ uri: "https://api.digitransit.fi/routing/v2/finland/gtfs/v1/", headers: { "digitransit-subscription-key": process.env.DIGITRANSIT_KEY || "" } }),
    cache: new InMemoryCache(),
  });

  
  const result = await client.query({
    query: GET_STOP,
    variables: {
      stopId: decodeURIComponent(id)
    }
  })

  if (result.error || !result.data?.stop) {
    return (
      <>
        <Toast type="error" message={`Failed to get stop data: ${result.error?.message || "Unknown error"}`}></Toast>
      </>
    )
  }
  const stop = result.data.stop
  return (
    <>
      <Sidebar>
        <IconItem icon={{children: IconTable[stop.vehicleMode || "BUS"]}} className="text-lg"><span className="text-2xl">{stop.name}</span> {stop.platformCode && <Label className="bg-gray">{stop.platformCode}</Label>}</IconItem>
        <div className="text-sm">{stop.desc && <Label className="bg-gray">{stop.desc}</Label>} {stop.code && <Label className="bg-gray">{stop.code}</Label>}</div>
      
      </Sidebar>
      <MapOverlay>

      </MapOverlay>
    </>
  );
}
