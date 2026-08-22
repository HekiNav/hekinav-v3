"use client"

import { PropsWithChildren, Suspense, createContext, use, useEffect, useMemo, useState } from "react";
import { PlanQueryQuery, PlanQueryQueryVariables } from "./layout.generated";
import { getPlan } from "./getPlan";
import Loading from "./loading";
import { useIsHsl } from "@/app/hooks/useHsl";

export const PlanContext = createContext<ContextType>(null)

export type ContextType = ({
    data: NonNullable<PlanQueryQuery["planConnection"]>
} & PlanQueryQueryVariables) | null

export default function Context({ children, end, start }: PropsWithChildren & {start: string, end: string}) {
    const [a, setA] = useState<string>("idi")
    const [prev, setPrev] = useState<{start: string, end: string}>({end: "", start: ""})
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

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (prev.end != end || prev.start != start) setA(end)
        setPrev({end, start})
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [end, start])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const planPromise = useMemo(() => getPlan(origin, destination, isHsl), [a])

    if (typeof start != "string" || typeof end != "string") return (
        "failed to load"
    )

    return (<Suspense fallback={<Loading></Loading>}><PlanData destination={destination} origin={origin} promise={planPromise}>{children}</PlanData></Suspense>)
}

export function PlanData({ children, promise, destination, origin }: PropsWithChildren & PlanQueryQueryVariables & { promise: Promise<PlanQueryQuery["planConnection"]> }) {
    const data = use(promise)


    if (!data) return (
        "failed to load"
    )
    return (
        <PlanContext value={{ data: data, destination, origin }}>
            {children}
        </PlanContext>
    )
}