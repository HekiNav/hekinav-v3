"use client"

import { PropsWithChildren, Suspense, createContext, use, useEffect, useMemo, useState } from "react";
import { PlanQueryQuery } from "./layout.generated";
import { getPlan } from "./getPlan";
import Loading from "./loading";
import { useIsHsl } from "@/app/hooks/useHsl";
import { TZDate } from "@date-fns/tz";
import { RoutingConfig } from "@/app/lib/digitransit";
import { PlanLabeledLocationInput, PlanVisitViaLocationInput } from "@/app/lib/__generated__/graphql";

export const PlanContext = createContext<ContextType>(null)

export type ContextType = ({
    data: PlanQueryQuery["planConnection"]
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
    const planPromise = useMemo(() => getPlan(origin, destination, via, isHsl, options, dateTime, depArr), [a])

    
    return (<Suspense fallback={<Loading></Loading>}><PlanData via={via} config={options} dateTime={dateTime} depArr={depArr} destination={destination} origin={origin} promise={planPromise}>{children}</PlanData></Suspense>)
}

export function PlanData({ children, via, promise, destination, origin, config, dateTime, depArr }: PropsWithChildren & { promise: Promise<PlanQueryQuery["planConnection"]>, depArr: "dep" | "arr", dateTime: TZDate, config: RoutingConfig, origin: PlanLabeledLocationInput, via: PlanLabeledLocationInput[], destination: PlanLabeledLocationInput }) {
    const data = use(promise)

    return (
        <PlanContext value={{ data: data, destination, origin, depArr, dateTime, config, via }}>
            {children}
        </PlanContext>
    )
}