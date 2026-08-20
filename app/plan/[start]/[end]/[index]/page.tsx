"use client"
import { useContext } from "react";
import { PlanContext } from "../provider";
import { PlanQueryQuery } from "../page.generated";
import { Map } from "./Map";
import { useParams } from "next/navigation";
import { MapOverlay } from "@/app/mapcontext";


export default function Content() {

    const stuff = useContext(PlanContext)

    const { index } = useParams()

    const selectedRoute = Number(index?.slice(1,index.length))

    console.log(stuff, selectedRoute)

    if (!stuff || typeof selectedRoute != "number") return <>
        failed to load
    </>
    const { data, destination, origin } = stuff

    return (
        <>
            <div className="flex flex-col gap-2">
                details
            </div>
            <MapOverlay>
                <Map data={data as NonNullable<PlanQueryQuery["planConnection"]>}
                    destination={destination}
                    origin={origin}
                    selectedRoute={selectedRoute}
                />
            </MapOverlay>
        </>
    );
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
