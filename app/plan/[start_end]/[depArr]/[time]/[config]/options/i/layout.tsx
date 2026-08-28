"use client"
import { useParams, useRouter } from "next/navigation"
import DotNavigationThingy from "@/app/components/dotnavigationthingy"
import { useIsHsl } from "@/app/hooks/useHsl"
import { useContext } from "react"
import { PlanContext } from "../provider"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { index } = useParams()
  const router = useRouter()
  const isHsl = useIsHsl()
  const stuff = useContext(PlanContext)
  const selectedRoute = Number(index?.slice(1, index.length))

  return (
    <>
      <div className="">
        <DotNavigationThingy
          amount={stuff?.data.length || 1}
          selected={selectedRoute}
          onSet={(i) => router.replace(`../i${i}/${isHsl ? "?hsl" : ""}`)}
        />
        <h2 className="m-0 w-full text-center text-3xl mt-1">Route details</h2>
      </div>
      {children}
    </>
  )
}