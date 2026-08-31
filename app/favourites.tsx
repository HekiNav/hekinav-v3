"use server"

import { ApolloClient, gql, HttpLink, InMemoryCache, TypedDocumentNode } from "@apollo/client";
import { HekinavConfig } from "./HekinavConfig";
import { FavouritesQueryQuery, FavouritesQueryQueryVariables } from "./favourites.generated";
import { ReactNode } from "react";
import Link from "next/link";
import { getRouteColor, IconTable } from "./lib/digitransit";
import Label from "./components/label";
import IconItem from "./components/iconitem";
import DateEl from "./components/Date";

const GET_FAVOURITES:
    TypedDocumentNode<FavouritesQueryQuery, FavouritesQueryQueryVariables> =
    gql`
query FavouritesQuery($stopIds: [String!],$stationIds: [String!]) {
  stations(ids: $stationIds) {
    locationType
    vehicleMode
    name
    platformCode
    gtfsId
    code
    desc
    stoptimesWithoutPatterns(numberOfDepartures: 5) {
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
  stops(ids: $stopIds) {
    locationType
    vehicleMode
    name
    platformCode
    gtfsId
    code
    desc
    stoptimesWithoutPatterns(numberOfDepartures: 5) {
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
  routes {
    gtfsId
    shortName
    longName
    mode
    type
    patterns {
      code
    }
  }
}
    `

export default async function getFavourites(config: HekinavConfig["favourites"], isHsl: boolean): Promise<{ id: string, content: ReactNode, type: "stop" | "route" | "station" }[]> {

    const client = new ApolloClient({
        link: new HttpLink({ uri: `https://api.digitransit.fi/routing/v2/${isHsl ? "hsl" : "finland"}/gtfs/v1/`, headers: { "digitransit-subscription-key": process.env.DIGITRANSIT_KEY || "" } }),
        cache: new InMemoryCache(),
    });

    const query = GET_FAVOURITES
    const result = await client.query({
        query: query,
        variables: {
            stationIds: config.stations,
            stopIds: config.stops
        }
    })

    if (result.error || !result.data) return []
    const { routes, stations, stops } = result.data
    if (routes === null || stations === null || stops === null) return []

    console.log("EEEE")

    return [
        ...routes.filter(r => config.routes.some(e => r?.gtfsId == e)).map((r) => {
            const pattern = r?.patterns![0] || { code: `${r?.gtfsId}:0:01` }
            return {
                id: r?.gtfsId || "",
                type: "route" as const,
                content: <Link key={r?.gtfsId} className="decoration-none w-9/10 font-medium shrink flex items-center" href={`/route/${r?.gtfsId}/${pattern.code.split(":")[2]}-${pattern.code.split(":")[3]}/${isHsl ? "?hsl" : ""}`}>
                    {r?.shortName ? <Label className={`font-bold text-white text-md h-min ${getRouteColor("bg", r.type || -1, r.mode || "")}`}>{r.shortName}</Label> : IconTable[r?.mode || "BUS"]}
                    <span className="ml-1 truncate shrink text-lg">{r?.longName}</span>
                </Link>
            }
        }),
        ...[...stops, ...stations].map((s) => {
            return {
                id: s?.gtfsId || "",
                type: (s?.locationType == "STATION" ? "station" as const : "stop" as const),
                content: <div>
                    <Link className="decoration-none" href={`/stop/${s?.gtfsId}/${isHsl ? "?hsl" : ""}`}>
                        <IconItem icon={{ children: IconTable[s?.vehicleMode || "BUS"] }}>
                            <div className="flex flex-col font-medium">
                                <div><span className="text-lg font-medium">{s?.name}</span> {s?.platformCode && <Label className="w-min bg-gray">pl. {s?.platformCode}</Label>}{s?.code && <Label className="text-sm bg-gray">{s?.code}</Label>}</div>
                            </div>
                        </IconItem>
                    </Link>
                    <div className="ml-4 w-full">
                        {s?.stoptimesWithoutPatterns?.map((e, i) => {
                            return <Link key={i} className="decoration-none w-full font-medium shrink flex items-center justify-between" href={`/route/${e?.trip?.route?.gtfsId}/${e?.trip?.pattern?.code.split(":")[2]}-${e?.trip?.pattern?.code.split(":")[3]}/${isHsl ? "?hsl" : ""}`}>
                                <div>
                                    {e?.trip?.routeShortName ? <Label className={`font-bold text-white text-sm h-min ${getRouteColor("bg", e.trip.route.type || -1, e.trip.route.mode || "")}`}>{e.trip.routeShortName}</Label> : IconTable[e?.trip?.route.mode || "BUS"]}
                                    <span className="ml-1 truncate shrink font-normal">{e?.headsign}</span>
                                </div>
                                <div className={`${e?.realtime ? "text-green" : ""}`}>
                                    <DateEl approx={!e?.realtime} scheduledTime={e?.scheduledDeparture || e?.scheduledArrival || 0} time={e?.realtimeDeparture || e?.scheduledDeparture || e?.realtimeArrival || e?.scheduledArrival || 0} day={e?.serviceDay as number || 0}></DateEl>
                                    {s.locationType == "STATION" && <span className={`text-black`}>
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {(e as any).stop.platformCode ? <Label>pl. {(e as any).stop.platformCode}</Label> : ""}
                                    </span>}
                                </div>
                            </Link>
                        })}
                    </div>
                </div>
            }
        })
    ]
}