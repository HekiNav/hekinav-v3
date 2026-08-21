"use client"

import { PropsWithChildren, Suspense, createContext, use, useEffect, useMemo, useState } from "react";
import { PlanQueryQuery, PlanQueryQueryVariables } from "./layout.generated";
import { getPlan } from "./getPlan";
import Loading from "./loading";
import { useParams } from "next/navigation";
import { useIsHsl } from "@/app/hooks/useHsl";

export const PlanContext = createContext<ContextType>(null)

export type ContextType = ({
    data: NonNullable<PlanQueryQuery["planConnection"]>
} & PlanQueryQueryVariables) | null

export default function Context({ children }: PropsWithChildren) {
    const { start, end } = useParams()
    const [a, setA] = useState<string>("idi")
    const isHsl = useIsHsl()

    console.log("js")

    if (typeof start != "string" || typeof end != "string") return (
        "failed to load"
    )

    function parseParam(t: string) {
        try {
            return JSON.parse(decodeURIComponent(t))
        } catch {
            return null
        }
    }
    const origin = parseParam(start)
    const destination = parseParam(end)

    const planPromise = useMemo(() => getPlan(origin, destination, isHsl), [a])

    return (<Suspense fallback={<Loading></Loading>}><PlanData destination={destination} origin={origin} promise={planPromise}>{children}</PlanData></Suspense>)
}

export function PlanData({ children, promise, destination, origin }: PropsWithChildren & PlanQueryQueryVariables & { promise: Promise<PlanQueryQuery["planConnection"]> }) {
    const data = use(promise)

    console.log(data)

    console.log("js")

    if (!data) return (
        "failed to load"
    )
    return (
        <PlanContext value={{ data: data, destination, origin }}>
            {children}
        </PlanContext>
    )
}