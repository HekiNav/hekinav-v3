"use client"
import { useContext } from "react";
import { PlanContext } from "../provider";
import { PlanQueryQuery } from "../page.generated";
import { Map } from "./Map";
import { useParams } from "next/navigation";
import { MapOverlay } from "@/app/mapcontext";
import { getRouteColor } from "@/app/lib/digitransit";
import Image from "next/image";


export default function Content() {

    const stuff = useContext(PlanContext)

    const { index } = useParams()

    const selectedRoute = Number(index?.slice(1, index.length))


    if (!stuff || typeof selectedRoute != "number") return <>
        failed to load
    </>
    const { data, destination, origin } = stuff

    const node = data.edges![selectedRoute]?.node

    if (!node) return <>
        failed to load
    </>
    return (
        <>
            <div className="flex flex-col my-10 pb-20">
                {
                    node.legs.flatMap((l, i, a) => {

                        return [
                            <div className="flex flex-row w-full" key={i}>
                                <div className={`mx-4 w-3 relative h-full flex flex-col ${i == 0 ? "items-end" : i == a.length - 1 ? "items-start" : ""}`}>
                                    <div className={`w-full h-5/10 rounded-t-full ${getRouteColor("bg", l?.trip?.route.type || -1, l?.trip?.route.mode || "")}`}></div>
                                    <div className={`w-full h-5/10 rounded-b-full ${getRouteColor("bg", l?.trip?.route.type || -1, l?.trip?.route.mode || "")}`}></div>
                                    {i == 0 && <div className="absolute -left-3 -right-3 -top-6.5"><Image className="" src="/pin_blue.svg" alt="Pin"></Image></div>}
                                    {i == a.length - 1 && <div className="absolute -left-3 -right-3 -bottom-7.5"><Image className="" src="/pin_red.svg" alt="Pin"></Image></div>}
                                    {l?.transitLeg && (<><div className="absolute -left-1.5 -right-1.5 -top-3 flex justify-center items-center">
                                        <div className={`bg-white border-white absolute border-[.25rem] bg-white h-7 w-7 rounded-full z-100`}></div>
                                        <div className={`${getRouteColor("border", l?.trip?.route.type || -1, l?.trip?.route.mode || "")} border-[.25rem] bg-white h-6 w-6 rounded-full z-100`}></div>
                                    </div>
                                        <div className={`absolute -left-1.5 -right-1.5 -bottom-3 flex justify-center items-center ${l.trip?.route.type == 702 && "z-101"}`}>
                                            <div className={`bg-white border-white absolute border-[.25rem] bg-white h-7 w-7 rounded-full z-100`}></div>
                                            <div className={`${getRouteColor("border", l?.trip?.route.type || -1, l?.trip?.route.mode || "")} border-[.25rem] bg-white h-6 w-6 rounded-full z-100`}></div>
                                        </div></>)}
                                </div>
                                <div className="p-2 flex flex-row justify-between w-full">
                                    ee <br />
                                    ee <br />
                                </div>
                            </div>
                        ]
                    })
                }
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
