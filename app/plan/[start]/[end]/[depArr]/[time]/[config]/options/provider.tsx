"use client"

import { PropsWithChildren, Suspense, createContext, use, useEffect, useMemo, useState } from "react";
import { PlanQueryQuery, PlanQueryQueryVariables } from "./layout.generated";
import { getPlan } from "./getPlan";
import Loading from "./loading";
import { useIsHsl } from "@/app/hooks/useHsl";
import { TZDate } from "@date-fns/tz";
import { RoutingConfig } from "@/app/lib/digitransit";
import { PlanLabeledLocationInput } from "@/app/lib/__generated__/graphql";
import { usePathname } from "next/navigation";

export const PlanContext = createContext<ContextType>(null)

export type ContextType = ({
    data: PlanQueryQuery["planConnection"]
    depArr: "dep" | "arr"
    dateTime: TZDate
    config: RoutingConfig

    destination: PlanLabeledLocationInput
    origin: PlanLabeledLocationInput
}) | null

export default function Context({ children, end, start, config, depArr, time }: PropsWithChildren & { start: string, end: string, depArr: "dep" | "arr", config: string, time: string }) {
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
    const origin = parseParam(typeof start == "string" ? start : "")
    const destination = parseParam(typeof end == "string" ? end : "")
    const options: RoutingConfig = parseParam(config)
    const dateTime = new TZDate(Number(time), "UTC")


    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (end + start + config + depArr + time != prev) setA(end + Math.random().toString())
        setPrev(end + start + config + depArr + time)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [end, start, options, config, depArr, time])

    console.log("data:\n", origin, "\n", destination, "\n", isHsl, "\n", options, "\n", dateTime, "\n", depArr, "\n")
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const planPromise = useMemo(() => getPlan(origin, destination, isHsl, options, dateTime, depArr), [a])

    //
    return (<Suspense fallback={<Loading></Loading>}><PlanData config={options} dateTime={dateTime} depArr={depArr} destination={destination} origin={origin} promise={planPromise}>{children}</PlanData></Suspense>)
}

export function PlanData({ children, promise, destination, origin, config, dateTime, depArr }: PropsWithChildren & { promise: Promise<PlanQueryQuery["planConnection"]>, depArr: "dep" | "arr", dateTime: TZDate, config: RoutingConfig, origin: PlanLabeledLocationInput, destination: PlanLabeledLocationInput }) {
    const data = use(promise)

    return (
        <PlanContext value={{ data: data, destination, origin, depArr, dateTime, config }}>
            {children}
        </PlanContext>
    )
}