"use client"

import { PropsWithChildren, Suspense, createContext, use, useEffect, useMemo, useState } from "react";
import { PlanQueryQuery, PlanQueryQueryVariables } from "./layout.generated";
import { getPlan } from "./getPlan";
import Loading from "./loading";
import { useIsHsl } from "@/app/hooks/useHsl";
import { TZDate } from "@date-fns/tz";
import { RoutingConfig } from "@/app/lib/digitransit";

export const PlanContext = createContext<ContextType>(null)

export type ContextType = ({
    data: PlanQueryQuery["planConnection"]
    depArr: "dep" | "arr"
    dateTime: TZDate
    config: RoutingConfig
} & PlanQueryQueryVariables) | null

export default function Context({ children, end, start, config, depArr, time }: PropsWithChildren & { start: string, end: string, depArr: "dep" | "arr", config: string, time: string }) {
    const [a, setA] = useState<string>("idi")
    const [prev, setPrev] = useState<{ start: string, end: string }>({ end: "", start: "" })
    const isHsl = useIsHsl()

    function parseParam(t: string) {
        try {
            return JSON.parse(decodeURIComponent(t))
        } catch {
            return null
        }
    }
    const origin = parseParam(typeof start == "string" ? start : "")
    const destination = parseParam(typeof end == "string" ? end : "")
    const options: RoutingConfig = parseParam(config)
    const dateTime = new TZDate(Number(time), "UTC")

    console.log(dateTime)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (prev.end != end || prev.start != start) setA(end + Math.random().toString())
        console.log(prev.end != end || prev.start != start)
        setPrev({ end, start })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [end, start])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const planPromise = useMemo(() => getPlan(origin, destination, isHsl), [a])

    return (<Suspense fallback={<Loading></Loading>}><PlanData config={options} dateTime={dateTime} depArr={depArr} destination={destination} origin={origin} promise={planPromise}>{children}</PlanData></Suspense>)
}

export function PlanData({ children, promise, destination, origin, config, dateTime, depArr }: PropsWithChildren & PlanQueryQueryVariables & { promise: Promise<PlanQueryQuery["planConnection"]>, depArr: "dep" | "arr", dateTime: TZDate, config: RoutingConfig }) {
    const data = use(promise)

    const [rr, setRr] = useState<boolean>()

    console.log(data)

    useEffect(() => {
        if (rr) return
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRr(true)
    })

    return (
        <PlanContext value={{ data: data, destination, origin, depArr, dateTime, config }}>
            {children}
        </PlanContext>
    )
}