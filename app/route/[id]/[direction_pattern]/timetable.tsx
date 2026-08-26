"use client"

import { Suspense, use, useMemo, useState } from "react"
import { ContentProps } from "./content"
import { format } from "date-fns"
import { DayPicker } from "@daypicker/react"
import { getTimetable } from "./timetableServerPart"
import { RouteTimetableQueryQuery } from "./timetableServerPart.generated"
import Button from "@/app/components/button"
import Icon from "@/app/components/icon"
import { OpenInFullW700 } from "@material-symbols-svg/react/icons/open-in-full"
import Modal from "@/app/components/modal"

export default function RouteTimeTableContent({ data, isHsl, directionId }: ContentProps & { directionId: number }) {
    const [date, setDate] = useState<Date>(new Date())

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const timetable = useMemo(() => getTimetable({ data, date: format(date, "yyyy-MM-dd"), isHsl }), [date])
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
            <h1 className="text-3xl! mt-4 mb-1">Timetable</h1>
            <Suspense fallback={"Loading..."}><Timetable directionId={directionId} timetable={timetable}></Timetable></Suspense>
        </>
    )
}

export function Timetable({ timetable, directionId }: { timetable: Promise<RouteTimetableQueryQuery["route"]>, directionId: number }) {
    const data = use(timetable)?.patterns?.filter(p => directionId ? p?.directionId == directionId : true)
    if (!data) return "Failed to load"

    const stops = mergeStopSequences(data)

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [fullscreen, setFullscreen] = useState<boolean>(false)

    console.log(stops, data)

    const trips = data.flatMap(p => p?.tripsOnServiceDate)

    const table = <div className="w-full rounded-xl h-fit">
        <div className={`w-full h-full overflow-scroll rounded bg-white h-max grid`} style={{ gridTemplateColumns: `10em ${trips.map(() => "1fr").join(" ")}` }}>
            {stops.map((s, i) => {
                const borderClass = `border-t-3 border-r-3 border-gray ${i == stops.length - 1 && "border-b-3"}`
                return [
                    <div className={`sticky left-0 bg-white p-2 truncate border-l-3 ${borderClass}`} key={-1}>{s.name} {s.platformCode && `pl. ${s.platformCode}`}</div>,
                    trips.map((t, j) => {
                        const call = t?.stopCalls.find(e => e.stopLocation.__typename == "Stop" && e.stopLocation.gtfsId == s.gtfsId)
                        const callTimes = call?.schedule?.time && (call?.schedule?.time?.__typename == "ArrivalDepartureTime" ? [call.schedule.time.arrival, call.schedule.time.arrival] : [call.schedule.time.start, call.schedule.time.end])
                        const times = [...new Set(callTimes)]
                        return (
                            <div className={`p-2 text-center ${borderClass}`} key={j}>
                                {times.length ? times.map(t => format(t as string, "HH:mm")) : "—"}
                            </div>
                        )
                    })
                ]
            })}
        </div>
    </div>
    return (
        <>
            <Button onClick={() => setFullscreen(true)} className="w-min"><Icon><OpenInFullW700></OpenInFullW700></Icon></Button>
            {table}
            {fullscreen && <Modal className="max-w-9/10! max-h-8/10! w-fit! h-fit! p-2! bg-white" close={() => setFullscreen(false)} open={fullscreen}>
                {table}
            </Modal>}
        </>
    )
}

interface Stop {
    name: string
    gtfsId: string
    platformCode: string | null
    code: string | null
    desc: string | null
}

function mergeStopSequences(patterns: NonNullable<NonNullable<RouteTimetableQueryQuery["route"]>["patterns"]>): Stop[] {
    const stopsById = new Map<string, Stop>();
    const graph = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    const ensureNode = (id: string) => {
        if (!graph.has(id)) graph.set(id, new Set());
        if (!inDegree.has(id)) inDegree.set(id, 0);
    };

    for (const pattern of patterns) {
        if (!pattern || !pattern.tripsOnServiceDate) continue
        for (const trip of pattern.tripsOnServiceDate) {
            for (const stop of trip.stopCalls) {
                if (stop.stopLocation.__typename != "Stop" || !stop.stopLocation) continue
                stopsById.set(stop.stopLocation.gtfsId, stop.stopLocation);
                ensureNode(stop.stopLocation.gtfsId);
            }
        }
    }

    for (const pattern of patterns) {
        if (!pattern || !pattern.tripsOnServiceDate) continue
        for (const trip of pattern.tripsOnServiceDate) {
            const filter: (s: string) => s is "Stop" = s => s === "Stop"
            const stops = trip.stopCalls.filter((e) => filter(e.stopLocation.__typename))
            for (let i = 0; i < stops.length - 1; i++) {
                // @ts-expect-error checked above
                const from = stops[i].stopLocation.gtfsId;
                // @ts-expect-error checked above
                const to = stops[i + 1].stopLocation.gtfsId;
                if (!graph.get(from)!.has(to)) {
                    graph.get(from)!.add(to);
                    inDegree.set(to, (inDegree.get(to) ?? 0) + 1);
                }
            }
        }
    }

    const queue: string[] = [];
    for (const [id, deg] of inDegree) if (deg === 0) queue.push(id);

    const result: Stop[] = [];
    const branchWarnings: string[] = [];

    while (queue.length > 0) {
        if (queue.length > 1) {
            branchWarnings.push(`Ambiguous order between: ${queue.join(", ")}`);
        }
        const id = queue.shift()!;
        result.push(stopsById.get(id)!);

        for (const neighbor of graph.get(id)!) {
            inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
            if (inDegree.get(neighbor) === 0) queue.push(neighbor);
        }
    }

    if (result.length !== stopsById.size) {
        throw new Error("Cycle detected — patterns disagree on stop order");
    }

    if (branchWarnings.length > 0) {
        console.warn("Possible branching detected:", branchWarnings);
    }

    return result;
}