"use client"

import { PropsWithChildren, Suspense, createContext, use, useEffect, useMemo, useState } from "react";
import { getPlan, GetPlanResponse } from "./getPlan";
import Loading from "./loading";
import { useIsHsl } from "@/app/hooks/useHsl";
import { TZDate } from "@date-fns/tz";
import { RoutingConfig } from "@/app/lib/digitransit";
import { PlanLabeledLocationInput, PlanVisitViaLocationInput } from "@/app/lib/__generated__/graphql";
import { Mode } from "@/app/lib/__generated__/graphql";
import { Mode as MotisMode } from "@motis-project/motis-client"
import { formatInTimeZone } from "date-fns-tz";


export const PlanContext = createContext<ContextType>(null)

export type ContextType = ({
    data: Edge[]
    depArr: "dep" | "arr"
    dateTime: TZDate
    config: RoutingConfig

    destination: PlanLabeledLocationInput
    via: PlanVisitViaLocationInput[]
    origin: PlanLabeledLocationInput
}) | null

export default function Context({ children, start_end, config, depArr, time }: PropsWithChildren & { start_end: string, depArr: "dep" | "arr", config: string, time: string }) {
    const [a, setA] = useState<string>("")
    const [prev, setPrev] = useState<string>("")
    const isHsl = useIsHsl()

    function parseParam(t: string) {
        try {
            return JSON.parse(decodeURIComponent(t))
        } catch {
            return null
        }
    }
    const [origin, destination, ...via] = parseParam(start_end) || []

    const options: RoutingConfig = parseParam(config)
    const dateTime = new TZDate(Number(time), "UTC")


    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (start_end + config + depArr + time != prev) setA(Math.random().toString())
        setPrev(start_end + config + depArr + time)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [start_end, options, config, depArr, time])

    console.log("data:\n", origin, "\n", destination, "\n", via, "\n", isHsl, "\n", options, "\n", dateTime, "\n", depArr, "\n")
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const planPromise = useMemo(() => getPlan(origin, destination, via, isHsl, options, dateTime.toISOString(), depArr), [a])


    return (<Suspense fallback={<Loading></Loading>}><PlanData via={via} config={options} dateTime={dateTime} depArr={depArr} destination={destination} origin={origin} promise={planPromise}>{children}</PlanData></Suspense>)
}

export interface Edge {
    source: "DIGITRANSIT" | "HEKINAV",
    legs: Leg[]
    duration: number,
    walkDistance: number,
    start: string,
    end: string
}

export interface Place {
    name: string,
    lat: number,
    lng: number
    stop: Stop | null
    viaType: "VISIT" | "VIA" | "PASS_THROUGH" | null
}

export interface Stop {
    gtfsId: string
    name: string,
    desc: string | null,
    code: string | null,
    platformCode: string | null,
}

export interface Time {
    estimated: string | null,
    scheduled: string
}

export interface Leg {
    tripId: string | null,
    tripStartTime: string | null,
    headsign: string,
    start: Time
    end: Time
    from: Place,
    to: Place,
    duration: number,
    distance: number,
    transitLeg: boolean
    route: Route | null,
    pattern: Pattern | null,
    mode: Mode | MotisMode | "",
    legGeometry: { points: string, length: number } | null,
}

export interface Route {
    shortName: string | null,
    longName: string | null,
    gtfsId: string,
    mode: string | null,
    type: number | null
}

export interface Pattern {
    code: string | null
    directionId: string
}

export function PlanData({ children, via, promise, destination, origin, config, dateTime, depArr }: PropsWithChildren & { promise: Promise<GetPlanResponse | null>, depArr: "dep" | "arr", dateTime: TZDate, config: RoutingConfig, origin: PlanLabeledLocationInput, via: PlanLabeledLocationInput[], destination: PlanLabeledLocationInput }) {
    const data = use(promise)


    const { dt, motis } = data || { motis: { itineraries: [] }, dt: { edges: [], routingErrors: [] } }

    console.log(dt.edges?.length, motis?.itineraries.length, motis, dt, data)

    const edges: Edge[] = [
        ...(motis?.itineraries || []).map<Edge>(e => {
            return {
                duration: e.duration,
                walkDistance: e.legs.reduce((p, c) => c.mode == "WALK" ? p + (c.distance || 0) : p, 0),
                source: "HEKINAV",
                start: e.startTime,
                end: e.endTime,
                legs: e.legs.map((l) => {
                    return {
                        headsign: l.headsign || "",
                        tripStartTime: l.tripId?.slice(9,14) || null,
                        tripId: fixMotisId(l.tripId?.slice(15)) || null,
                        pattern: {
                            code: null,
                            directionId: l.directionId || "-1"
                        },
                        duration: l.duration,
                        legGeometry: l.legGeometry,
                        mode: l.mode,
                        transitLeg: !!l.routeId,
                        distance: l?.distance || 0,
                        from: {
                            lat: l.from.lat,
                            lng: l.from.lon,
                            name: l.from.name,
                            viaType: l.from.stopId ? null : "VISIT",
                            stop: l.from.stopId ? {
                                code: l.from.stopCode || null,
                                name: l.from.name,
                                gtfsId: fixMotisId(l.from.stopId) || "",
                                desc: l.from.description || null,
                                platformCode: null
                            } : null
                        },
                        to: {
                            lat: l.to.lat,
                            lng: l.to.lon,
                            name: l.to.name,
                            viaType: l.to.stopId ? null : "VISIT",
                            stop: l.to.stopId ? {
                                code: l.to.stopCode || null,
                                name: l.to.name,
                                gtfsId: fixMotisId(l.to.stopId) || "",
                                desc: l.to.description || null,
                                platformCode: null
                            } : null
                        },
                        end: {
                            estimated: l.realTime ? l.endTime : null,
                            scheduled: l.scheduledEndTime
                        },
                        start: {
                            estimated: l.realTime ? l.startTime : null,
                            scheduled: l.scheduledStartTime
                        },
                        route: l.routeId ? {
                            gtfsId: fixMotisId(l.routeId) || "",
                            longName: l.routeLongName || null,
                            shortName: l.routeShortName || null,
                            mode: l.mode || "",
                            type: l.routeType || -1
                        } : null
                    }
                })
            }
        }),
        ...(motis?.direct?.map<Edge>(e => {
            return {
                duration: e.duration,
                walkDistance: e.legs.reduce((p, c) => c.mode == "WALK" ? p + (c.distance || 0) : p, 0),
                source: "HEKINAV",
                start: e.startTime,
                end: e.endTime,
                legs: e.legs.map((l) => {
                    return {
                        headsign: l.headsign || "",
                        tripStartTime: l.tripId?.slice(9,14) || null,
                        tripId: fixMotisId(l.tripId?.slice(15)) || null,
                        pattern: {
                            code: `${fixMotisId(l.routeId)}:${l.directionId || "-1"}:01`,
                            directionId: l.directionId || "-1"
                        },
                        duration: l.duration,
                        legGeometry: l.legGeometry,
                        mode: l.mode,
                        transitLeg: !!l.routeId,
                        distance: l?.distance || 0,
                        from: {
                            lat: l.from.lat,
                            lng: l.from.lon,
                            name: l.from.name,
                            viaType: l.from.stopId ? null : "VISIT",
                            stop: l.from.stopId ? {
                                code: l.from.stopCode || null,
                                name: l.from.name,
                                gtfsId: fixMotisId(l.from.stopId) || "",
                                desc: l.from.description || null,
                                platformCode: null
                            } : null
                        },
                        to: {
                            lat: l.to.lat,
                            lng: l.to.lon,
                            name: l.to.name,
                            viaType: l.to.stopId ? null : "VISIT",
                            stop: l.to.stopId ? {
                                code: l.to.stopCode || null,
                                name: l.to.name,
                                gtfsId: fixMotisId(l.to.stopId) || "",
                                desc: l.to.description || null,
                                platformCode: null
                            } : null
                        },
                        end: {
                            estimated: l.realTime ? l.endTime : null,
                            scheduled: l.scheduledEndTime
                        },
                        start: {
                            estimated: l.realTime ? l.startTime : null,
                            scheduled: l.scheduledStartTime
                        },
                        route: l.routeId ? {
                            gtfsId: fixMotisId(l.routeId) || "",
                            longName: l.routeLongName || null,
                            shortName: l.routeShortName || null,
                            mode: l.mode || "",
                            type: l.routeType || -1
                        } : null
                    }
                })
            }
        }) || []),
        ...(dt.edges?.map<Edge>((e) => {
            return {
                source: "DIGITRANSIT",
                duration: e?.node.duration as number || 0,
                end: e?.node.end as string || "",
                start: e?.node.start as string || "",
                walkDistance: e?.node.walkDistance as number || 0,
                legs: e?.node.legs.map<Leg>((l) => {
                    return {
                        tripStartTime: formatInTimeZone((l?.trip?.departureStoptime?.scheduledDeparture || 0) * 1000, "UTC","HH:mm"),
                        end: {
                            estimated: l?.end.estimated?.time as string || "",
                            scheduled: l?.end.scheduledTime as string || ""
                        },
                        start: {
                            estimated: l?.start.estimated?.time as string || "",
                            scheduled: l?.start.scheduledTime as string || ""
                        },
                        from: {
                            name: l?.from.name || "",
                            lat: l?.from.lat || 0,
                            lng: l?.from.lon || 0,
                            viaType: l?.from.viaLocationType || null,
                            stop: l?.from.stop || null
                        },
                        to: {
                            name: l?.to.name || "",
                            lat: l?.to.lat || 0,
                            lng: l?.to.lon || 0,
                            viaType: l?.to.viaLocationType || null,
                            stop: l?.to.stop || null
                        },
                        headsign: l?.headsign || "",
                        pattern: {
                            code: l?.trip?.pattern?.code || `${l?.trip?.route.gtfsId}:0:01`,
                            directionId: l?.trip?.pattern?.directionId?.toString() || "-1"
                        },
                        tripId: l?.trip?.gtfsId || null,
                        distance: l?.distance || 0,
                        mode: l?.mode || "",
                        duration: l?.duration as number || 0,
                        legGeometry: { points: l?.legGeometry?.points as string || "", length: l?.legGeometry?.length || 0 },
                        transitLeg: l?.transitLeg || false,
                        route: l?.trip?.route || null
                    }
                }) || []
            }
        }) || [])
    ].sort((a, b) =>
        (new Date(depArr == "arr" ? b.end : a.start).getTime()) -
        (new Date(depArr == "arr" ? a.end : b.start).getTime())
    )

    return (
        <PlanContext value={{ data: edges, destination, origin, depArr, dateTime, config, via }}>
            {children}
        </PlanContext>
    )
}

function fixMotisId(motisId: string | null | undefined) {
    if (!motisId) return null
    const [feed, ...rest] = motisId.split("_")
    return `${feed}:${rest.join("_")}`
}