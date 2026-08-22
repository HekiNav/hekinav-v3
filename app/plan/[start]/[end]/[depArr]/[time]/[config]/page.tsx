"use client"
import { useContext, useEffect, useState } from "react";
import { PlanQueryQuery } from "./layout.generated";
import RoutingUi from "@/app/components/RoutingUi";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns-tz";
import IconItem from "@/app/components/iconitem";
import { DirectionsWalkW700 as DirectionsWalk } from "@material-symbols-svg/react/directions-walk";
import { HourglassW700 as Hourglass } from "@material-symbols-svg/react/hourglass";
import { getRouteColor } from "@/app/lib/digitransit";
import Icon from "@/app/components/icon";
import { MapOverlay, Sidebar } from "@/app/mapcontext";
import { Map } from "./Map";
import { PlanContext } from "./provider";
import { ArrowForwardIosW700 } from "@material-symbols-svg/react/icons/arrow-forward-ios";
import Link from "next/link";
import { useIsHsl } from "@/app/hooks/useHsl";


export default function Content() {
    const stuff = useContext(PlanContext)
    const isHsl = useIsHsl()

    const [selectedRoute, setSelectedRoute] = useState<number | null>(null)


    if (!stuff) return <>
        failed to load
    </>

    const { data, destination, origin, config, dateTime, depArr } = stuff




    return (
        <>
            <Sidebar>
                <h2 className="m-0 w-full text-center text-3xl my-1">Routing options</h2>
            </Sidebar>

            <RoutingUi iDateTime={dateTime} iDepArr={depArr} iOrigin={{ icon: <></>, id: "origin", text: origin.label || "origin", properties: { lat: origin.location.coordinate?.latitude as number || 0, lng: origin.location.coordinate?.longitude as number || 0 } }} iDestination={{ icon: <></>, id: "origin", text: destination.label || "origin", properties: { lat: destination.location.coordinate?.latitude as number || 0, lng: destination.location.coordinate?.longitude as number || 0 } }}></RoutingUi>
            <div className="flex flex-col gap-2">
                {data?.edges?.map((e, i) => {
                    const walkDistance = (e?.node.walkDistance as number)
                    const firstTransitLeg = e?.node.legs.find(l => l?.transitLeg)
                    const duration = e?.node.duration as number || 0
                    return (
                        <div onMouseEnter={() => setSelectedRoute(i)} key={i} className="border-3 focus:border-green rounded-xl flex flex-row gap-1">
                            <div className="flex flex-col gap-1 shrink w-full py-1 px-2">
                                <div className="w-full flex justify-between">
                                    <span className="font-medium">{format(new TZDate(e?.node.start as number), "HH:mm")} - {format(new TZDate(e?.node.end as number), "HH:mm")}</span>
                                    <span className="gap-0! text-md font-medium">{duration >= 3600 && `${Math.floor(duration / 3600)}h `}{Math.floor(duration / 60 % 60)}min</span>
                                </div>
                                <div className="w-full h-5 flex flex-row gap-1">
                                    {e?.node.legs.map((l, j) => (
                                        <div key={j} style={{ width: `${l?.duration}%` }} title={l?.trip?.route.shortName || l?.trip?.route.longName || ""} className={`h-5 w-20 rounded-md text-white flex items-center truncate justify-start px-1 font-bold ${getRouteColor("bg", l?.trip?.route.type || -1, l?.mode || "")}`}>{l?.trip?.route.shortName || l?.trip?.route.longName || ""}{l?.mode == "WALK" && <><Icon><DirectionsWalk className="text-black -ml-0.5" height={16} width={16}></DirectionsWalk></Icon><span className="text-black font-normal">{Math.ceil((l.distance as number) / 60)}</span></>}</div>
                                    ))}
                                </div>
                                <div className="w-full flex justify-between items-end">
                                    {firstTransitLeg
                                        ? <span className="text-darkgray text-sm">Leaves at <span className={firstTransitLeg.start.estimated ? "text-green" : ""}>{format(new TZDate(firstTransitLeg.start.estimated?.time as number || firstTransitLeg.start.scheduledTime as number || 0), "HH:mm")}</span> from {firstTransitLeg.from.stop?.name} {firstTransitLeg.from.stop?.platformCode ? `pl. ${firstTransitLeg.from.stop?.platformCode}` : ""} {firstTransitLeg.from.stop?.code ? `(${firstTransitLeg.from.stop?.code})` : ""}</span>
                                        : <span className="text-darkgray text-sm">Leave whenever</span>
                                    }<span className="flex gap-1">
                                        {(e?.node.waitingTime as number) > 600 && <IconItem className="gap-1! text-md text-nowrap" icon={{ children: <Hourglass width={16} height={16}></Hourglass> }}>{Math.round((e?.node.waitingTime as number) / 60)} min</IconItem>}
                                        <IconItem className="gap-0! text-md text-nowrap" icon={{ children: <DirectionsWalk width={16} height={16}></DirectionsWalk> }}>{walkDistance >= 1100 ? Math.round(walkDistance / 100) / 10 + " km" : Math.round(walkDistance) + " m"}</IconItem>
                                    </span>
                                </div>
                            </div>
                            <Link prefetch={true} className="h-full" href={`./i/i${i}/${isHsl ? "?hsl" : ""}`}>
                                <div className="flex items-center justify-center border-l-3 h-full">
                                    <Icon><ArrowForwardIosW700 height={32} width={32}></ArrowForwardIosW700></Icon>
                                </div>
                            </Link>
                        </div>
                    )
                })}
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
