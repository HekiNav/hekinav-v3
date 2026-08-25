"use client"

import Toggle from "@/app/components/toggle"
import { getRouteColor } from "@/app/lib/digitransit"
import { ReactElement, useContext } from "react"
import { ContentProps } from "./content"
import Day from "./day"
import DateEl from "@/app/components/Date"
import { ConfigContext } from "@/app/HekinavConfig"
import Link from "next/link"
import Label from "@/app/components/label"

export default function StopDepartures({ data, isHsl, stop_or_station }: ContentProps) {
    const { config, setConfig } = useContext(ConfigContext)
    return (
        <><span className="flex flex-nowrap text-lg justify-between">Advanced (Show delays)<Toggle state={config.advancedDepartures} setState={(value) => setConfig(value, ["advancedDepartures"])}></Toggle></span>
            {data.stoptimesWithoutPatterns && data.stoptimesWithoutPatterns.length ? <table><tbody>
                <tr><th className="text-start text-sm font-medium text-darkgray">Route</th><th className="text-start text-sm font-medium text-darkgray">Destination</th><th className="text-center text-sm font-medium text-darkgray">Time</th>{stop_or_station == "station" && <th className="text-center text-sm font-medium text-darkgray">Plat.</th>}</tr>
                {
                    data.stoptimesWithoutPatterns?.reduce((p, s, i, a) => {
                        const delay = s ? (s.realtimeDeparture && s.scheduledDeparture ? s.realtimeDeparture - s.scheduledDeparture : s.realtimeArrival && s.scheduledArrival ? s.realtimeArrival - s.scheduledArrival : 0) : 0
                        const last = a[i - 1]
                        const url = `/route/${s?.trip?.route.gtfsId}/${s?.trip?.directionId || ""}-${s?.trip?.pattern?.code.split(":")[3]}${isHsl ? "?hsl" : ""}`

                        return [...p, (last && last.serviceDay != s?.serviceDay) ? (
                            <tr key={`h${i}`} className={`px-1 border-t-10 border-white`}>
                                <th className="text-start" colSpan={stop_or_station == "station" ? 4 : 3}><Day day={s?.serviceDay as number || 0}></Day></th>
                            </tr>) : [], (
                            <tr key={i} className={`px-1 border-t-3 border-white`}>
                                <td className={`${i % 2 == 1 ? "bg-[#eee]" : "bg-white"} rounded-l-lg ps-[2px]`}>
                                    <Link className="decoration-none mr-2" href={url}>
                                        <Label className={`text-white font-bold ${getRouteColor("bg", s?.trip?.route.type || -1, s?.trip?.route.mode || undefined)}`}>{s?.trip?.routeShortName}</Label>
                                    </Link>
                                </td>
                                <td className={`${i % 2 == 1 ? "bg-[#eee]" : "bg-white"} td-truncate`}>
                                    <Link className="decoration-none mr-2" href={url}>
                                        {s?.pickupType == "NONE" ? "Arriving / Terminus" : s?.headsign}
                                    </Link>
                                </td>
                                <td className={`${i % 2 == 1 ? "bg-[#eee]" : "bg-white"} ${stop_or_station == "station" ? "" : "rounded-r-lg"} items-center justify-end pr-1 flex flex-row flex-nowrap ${s?.realtime ? config.advancedDepartures ? getColorFromDelay(delay) : "text-green" : "text-black"}`}>
                                    <DateEl approx={!s?.realtime} showScheduled={config.advancedDepartures && (delay < -120 || delay > 120)} scheduledTime={s?.scheduledDeparture || s?.scheduledArrival || 0} time={s?.realtimeDeparture || s?.scheduledDeparture || s?.realtimeArrival || s?.scheduledArrival || 0} day={s?.serviceDay as number || 0}></DateEl>
                                </td>
                                {stop_or_station == "station" && <td className={`${i % 2 == 1 ? "bg-[#eee]" : "bg-white"} rounded-r-lg items-center justify-end pl-2 pr-1 text-center`}>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {(s as any).stop.platformCode ? <Label>{(s as any).stop.platformCode}</Label> : "-"}
                                </td>}
                            </tr>)
                        ].flat()
                    }, new Array<ReactElement>())
                }
            </tbody>
            </table> : "No departures"}
        </>
    )
}

function getColorFromDelay(delay: number) {
    if (delay > 900) {
        return "text-red"
    } else if (delay > 120) {
        return "text-orange"
    } else if (delay < -120) {
        return "text-cyan"
    } else {
        return "text-green"
    }
}