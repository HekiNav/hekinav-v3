"use server"

import { redirect } from "next/navigation";
import { MapOverlay, Sidebar } from "../../mapcontext";
import { IconTable, getRouteColor, gtfsIdRegex } from "@/app/lib/digitransit";
import { ApolloClient, HttpLink, InMemoryCache, TypedDocumentNode, gql } from "@apollo/client";
import { StationQueryQuery, StationQueryQueryVariables, StopQueryQuery, StopQueryQueryVariables } from "./page.generated";
import Toast from "@/app/components/toast";
import Label from "@/app/components/label";
import IconItem from "@/app/components/iconitem";
import Date from "./date";
import Link from "next/link";
import Day from "./day";
import { ReactElement } from "react";


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
  const data = stop_or_station == "stop" ? (result.data as StopQueryQuery).stop : (result.data as StationQueryQuery).station
  if (!data) return

  return (
    <>
      <Sidebar>
        <IconItem icon={{ boxed: stop_or_station == "station", children: IconTable[data.vehicleMode || "BUS"] }} className="text-lg"><span className="text-2xl">{data.name}</span> {data.platformCode && <Label className="bg-gray">{data.platformCode}</Label>}</IconItem>
        <div className="text-sm">{data.desc && <Label className="bg-gray">{data.desc}</Label>} {data.code && <Label className="bg-gray">{data.code}</Label>}</div>
        <h2 className="text-lg">Departures</h2>
        {data.stoptimesWithoutPatterns && data.stoptimesWithoutPatterns.length ? <table><tbody>
          {
            data.stoptimesWithoutPatterns?.reduce((p, s, i, a) => {
              const delay = (s?.departureDelay || s?.arrivalDelay || 0)
              const last = a[i - 1]
              const url = `/route/${s?.trip?.route.gtfsId}/${s?.trip?.directionId || ""}-${s?.trip?.pattern?.code.split(":")[3]}${isHsl ? "?hsl" : ""}`
              return [...p, (last && last.serviceDay != s?.serviceDay) ? (
                <tr key={`h${i}`} className={`px-1 border-t-10 border-white`}>
                  <th className="text-start" colSpan={3}><Day day={s?.serviceDay as number || 0}></Day></th>
                </tr>) : [], (
                <tr key={i} className={`px-1 border-t-3 border-white`}>
                  <td className={`${i % 2 == 1 ? "bg-[#eee]" : "bg-white"} rounded-l-lg ps-[2px]`}>
                    <Link className="decoration-none" href={url}>
                      <Label className={`text-white font-bold ${getRouteColor("bg", s?.trip?.route.type || -1, s?.trip?.route.mode || undefined)}`}>{s?.trip?.routeShortName}</Label>
                    </Link>
                  </td>
                  <td className={`${i % 2 == 1 ? "bg-[#eee]" : "bg-white"}`}>
                    <Link className="decoration-none" href={url}>{s?.pickupType == "NONE" ? "Arriving / Terminus" : s?.headsign}</Link>
                  </td>
                  <td className={`${i % 2 == 1 ? "bg-[#eee]" : "bg-white"} rounded-r-lg items-center justify-end pr-1 flex flex-row flex-nowrap ${s?.realtime ? getColorFromDelay(delay) : "text-black"}`}>
                    <Date approx={!s?.realtime} showScheduled={delay < -120 || delay > 120} scheduledTime={s?.scheduledDeparture || s?.scheduledArrival || 0} time={s?.realtimeDeparture || s?.scheduledDeparture || s?.realtimeArrival || s?.scheduledArrival || 0} day={s?.serviceDay as number || 0}></Date>
                  </td>
                </tr>)
              ].flat()
            }, new Array<ReactElement>())
          }
        </tbody>
        </table> : "No departures"}
      </Sidebar>
      <MapOverlay>
        <div></div>
      </MapOverlay>
    </>
  );
}

function getColorFromDelay(delay: number) {
  console.log(delay)
  if (delay > 600) {
    return "text-red"
  } else if (delay > 120) {
    return "text-orange"
  } else if (delay < -120) {
    return "text-cyan"
  } else {
    return "text-green"
  }
}
