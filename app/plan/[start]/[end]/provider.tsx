"use client"

import { PropsWithChildren, Suspense, createContext, use } from "react";
import { PlanQueryQuery, PlanQueryQueryVariables } from "./page.generated";
import { getPlan } from "./layout";
import Loading from "./loading";

export const PlanContext = createContext<ContextType>(null)

export type ContextType = ({
    data: NonNullable<PlanQueryQuery["planConnection"]>
    isHsl: boolean
} & PlanQueryQueryVariables) | null

export default function Context({ children, ...value }: PropsWithChildren & PlanQueryQueryVariables & { isHsl: boolean, planPromise: Promise<PlanQueryQuery["planConnection"]> }) {
    return (<Suspense fallback={<Loading></Loading>}><PlanData value={value}>{children}</PlanData></Suspense>)
}

export function PlanData({ children, value }: PropsWithChildren & { value: PlanQueryQueryVariables & { isHsl: boolean, planPromise: Promise<PlanQueryQuery["planConnection"]> } }) {
    const data = use(value.planPromise)
    if (!data) return (
        "failed to load"
    )
    console.log(data)
    return (
        <PlanContext value={{ ...value, data: data }}>
            {children}
        </PlanContext>
    )
}