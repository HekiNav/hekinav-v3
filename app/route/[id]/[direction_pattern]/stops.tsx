"use client"

import { getRouteColor } from "@/app/lib/digitransit"
import { ContentProps } from "./content"
import DateEl from "@/app/components/Date"
import Link from "next/link"
import Label from "@/app/components/label"

export default function RouteStops({ data, isHsl }: ContentProps) {
    return (
        <>
            <div className="stops flex flex-col">
                {
                    data.stops?.map((s, i, a) => {
                        const firstDep = s.stopTimesForPattern && s.stopTimesForPattern[0]
                        const secondDep = s.stopTimesForPattern && s.stopTimesForPattern[1]
                        return (
                            <Link className="h-full flex decoration-none" key={i} href={`/stop/${s.gtfsId}/${isHsl ? "?hsl" : ""}`}>
                                <div className="flex flex-row w-full">
                                    <div className={`mx-4 w-3 relative h-full flex ${i == 0 ? "items-end" : i == a.length - 1 ? "items-start" : ""}`}>
                                        <div className={`w-full ${i == 0 || i == a.length - 1 ? "h-5/10" : "h-full"} ${getRouteColor("bg", data.route.type || -1, data.route.mode || "")}`}></div>
                                        <div className="absolute -left-1.5 -right-1.5 top-0 bottom-0 flex justify-center items-center">
                                            <div className={`bg-white border-white absolute border-[.25rem] bg-white h-7 w-7 rounded-full z-100`}></div>
                                            <div className={`${getRouteColor("border", data.route.type || -1, data.route.mode || "")} border-[.25rem] bg-white h-6 w-6 rounded-full z-100`}></div>
                                        </div>
                                    </div>
                                    <div className="p-2 flex flex-row justify-between w-full">
                                        <div>
                                            <span className="text-lg font-medium">{s.name}</span> {s.platformCode && <Label>pl. {s.platformCode}</Label>} <br />
                                            <span className="text-sm">{s.desc}</span> {s.code && <Label className="text-xs bg-gray">{s.code}</Label>}
                                        </div>
                                        <div className="text-end">
                                            {firstDep && <span className={`text-md font-medium ${firstDep.realtime ? "text-green" : "text-black"}`}><DateEl showTime={false} day={firstDep.serviceDay as number || 0} time={firstDep.realtimeDeparture || firstDep.scheduledDeparture || 0}></DateEl></span>} <br />
                                            {secondDep && <span className={`text-sm font-medium ${secondDep.realtime ? "text-green" : "text-black"}`}>Next <DateEl showTime={false} day={secondDep.serviceDay as number || 0} time={secondDep.realtimeDeparture || secondDep.scheduledDeparture || 0}></DateEl></span>}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })
                }
            </div>
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