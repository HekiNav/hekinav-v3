"use client"

import { Suspense, use, useMemo, useState } from "react"
import { ContentProps } from "./content"
import { format } from "date-fns"
import { DayPicker } from "@daypicker/react"
import { getTimetable } from "./timetableServerPart"
import { StopTimetableQueryQuery } from "./timetableServerPart.generated"

export default function StopTimeTableContent({ data, isHsl, stop_or_station }: ContentProps) {
    const [date, setDate] = useState<Date>(new Date())

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const timetable = useMemo(() => getTimetable({ data, date: format(date, "yyyyMMdd"), isHsl, stop_or_station }), [date])
    const now = new Date()
    return (
        <>
            <div className="border-3 w-fit px-1 rounded-xl">
                <DayPicker
                    animate
                    required
                    mode="single"
                    weekStartsOn={1}
                    classNames={{
                        chevron: "fill-green",
                        selected: "inset-ring-green inset-ring-3 rounded-lg",
                        day_button: "h-full w-full",
                        day: "h-10 w-10",
                        outside: "border-3",
                        today: "text-green",
                        caption_label: "flex flex-row h-full items-center pl-3"
                    }}
                    disabled={[{ after: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()) }, { before: now }]}
                    selected={date}
                    onSelect={setDate}
                />
            </div>
            <h1 className="text-3xl! mt-4 mb-1">Departures by hour</h1>
            <Suspense fallback={"Loading..."}><Timetable timetable={timetable}></Timetable></Suspense>
        </>
    )
}

interface StopTime {
    minutes: number,
    route: string,
    hours: number,
    cancelled: boolean
}

type Hours = Map<number, StopTime[]>


export function Timetable({ timetable }: { timetable: Promise<StopTimetableQueryQuery["stop"]> }) {
    const data = use(timetable)
    if (!data || !data.stoptimesForServiceDate) return "Failed to load"



    const stopTimes: Hours = data.stoptimesForServiceDate.reduce<StopTime[]>((p, c) => [...p, ...(c?.stoptimes?.map(d => {
        const date = new Date((d?.scheduledDeparture || 0) * 1000 + (d?.serviceDay as number || 0) * 1000)
        return { hours: date.getHours(), minutes: date.getMinutes(), route: c.pattern?.route.shortName || "", cancelled: d?.realtimeState === "CANCELED" }
    }) || [])], [])?.reduce<Hours>((p, c) => {
        p.set(c.hours, [...(p.get(c.hours) || []), c])
        return p
    }, new Map<number, StopTime[]>()) || []
    return (
        <>
            {Array.from(stopTimes.entries()).sort((a, b) => (a[0] <= 4 ? 23 + a[0] : a[0]) - (b[0] <= 4 ? 23 + b[0] : b[0])).map(([k, v],i) => (
                <div key={i}>
                    <h2 className="font-extrabold text-2xl">{String(k).padStart(2, "0")}:</h2>
                    <div className="grid grid-cols-4 gap-2">{v.sort((a, b) => a.minutes - b.minutes).map((e, i) => (<span className={`font-medium text-lg ${e.cancelled && "line-through decoration-red decoration-2"}`} key={i}><span>{String(e.minutes).padStart(2, "0")}</span>/<span className="font-bold">{e.route}</span></span>))}</div>
                </div>
            ))}
        </>
    )
}