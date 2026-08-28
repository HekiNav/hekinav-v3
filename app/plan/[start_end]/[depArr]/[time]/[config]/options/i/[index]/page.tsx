"use client"
import { useContext } from "react";
import { PlanContext } from "../../provider";
import { PlanQueryQuery } from "../../layout.generated";
import { Map } from "./Map";
import { useParams } from "next/navigation";
import { MapOverlay } from "@/app/mapcontext";
import { getRouteColor } from "@/app/lib/digitransit";
import Image from "next/image";
import Label from "@/app/components/label";
import { format } from "date-fns-tz";
import { TZDate } from "@date-fns/tz";
import Link from "next/link";
import { useIsHsl } from "@/app/hooks/useHsl";


export default function Content() {

    const stuff = useContext(PlanContext)

    const { index } = useParams()
    const isHsl = useIsHsl()

    const selectedRoute = Number(index?.slice(1, index.length))


    if (!stuff || typeof selectedRoute != "number") return <>
        failed to load
    </>
    const { data, destination, origin, via } = stuff

    if (!data) return

    const node = data[selectedRoute]

    console.log(node.legs)

    if (!node) return <>
        failed to load
    </>
    return (
        <>
            <div className="flex flex-col pb-20">
                {
                    node.legs.flatMap((l, i, a) => {
                        const prev = a[i - 1]
                        const next = a[i + 1]
                        const route = l.route
                        const prevRoute = prev?.route
                        const nextRoute = next?.route
                        const walkDistance = l?.distance || 0
                        const duration = l?.duration || 0


                        const timeBetweenPrevLeg = ((new Date(l.start.estimated || l.start.scheduled)).getTime() - (new Date(prev?.end.estimated || prev?.end.scheduled)).getTime()) / 1000
                        return [<div key={i} className="w-full h-full flex-col flex">
                            {(l?.transitLeg || i == 0) && <div className="flex flex-row w-full" key={i + "a"}>
                                <div className="flex w-12 flex-col font-medium my-2 items-end justify-center">
                                    {prev?.transitLeg && <>
                                        <div className={prev.end.estimated ? "text-green" : ""}>{format(new TZDate(prev.end.estimated || prev.end.scheduled || ""), "HH:mm")}</div>
                                        <div>{timeBetweenPrevLeg >= 3600 && `${Math.floor(timeBetweenPrevLeg / 3600)} h `}{Math.floor(timeBetweenPrevLeg / 60 % 60)} min</div>
                                    </>}
                                    <div className={l?.start.estimated ? "text-green" : ""}>{format(new TZDate(l.start.estimated || l?.start.scheduled || ""), "HH:mm")}</div>
                                </div>
                                <div className={`mx-4 w-3 relative h-full flex flex-col ${i == 0 ? "items-end" : i == a.length - 1 ? "items-start" : ""}`}>
                                    <div className={`w-full h-5/10 ${i == 0 ? "invisible" : getRouteColor("bg", prevRoute?.type || -1, (prev?.transitLeg ? prevRoute?.mode : "WALK") || "transparent")}`}></div>
                                    <div className={`w-full h-5/10 ${i == 0 && "rounded-t-full"} ${getRouteColor("bg", route?.type || -1, route?.mode || "")}`}></div>
                                    {i == 0 && <div className="absolute -left-3 -right-3 top-3.5"><Image className="" src="/pin_blue.svg" alt="Pin"></Image></div>}
                                    {l?.transitLeg && (<><div className="absolute -left-1.5 -right-1.5 top-0 bottom-0 flex justify-center items-center">
                                        <div className={`bg-white border-white absolute border-[.25rem] bg-white h-7 w-7 rounded-full z-100`}></div>
                                        <div className={`${getRouteColor("border", route?.type || -1, route?.mode || "")} border-[.25rem] bg-white h-6 w-6 rounded-full z-100`}></div>
                                    </div>
                                    </>)}
                                </div>
                                {l?.transitLeg ? <Link className="decoration-none" href={`/stop/${l.from.stop?.gtfsId}/${isHsl ? "?hsl" : ""}`}><div className="p-2 flex flex-col font-medium my-2">
                                    <div><span className="text-lg font-medium">{l.from.stop?.name}</span> {l.from.stop?.platformCode && <Label className="w-min bg-gray">pl. {l.from.stop?.platformCode}</Label>}</div>
                                    <div><span className="text-sm">{l.from.stop?.desc}</span> {l.from.stop?.code && <Label className="text-xs bg-gray">{l.from.stop?.code}</Label>}</div>
                                </div></Link> : <div className="p-2 flex flex-col font-medium my-2">
                                    <div><span className="text-lg font-medium">{l?.from.name}</span></div>
                                </div>}
                            </div>}
                            <div className="flex flex-row w-full" key={i + "b"}>
                                <div className="flex w-12 flex-col font-medium my-2 items-end justify-center">

                                </div>
                                <div className={`mx-4 w-3 relative h-full flex flex-col ${i == 0 ? "items-end" : i == a.length - 1 ? "items-start" : ""}`}>
                                    <div className={`w-full h-5/10 ${getRouteColor("bg", route?.type || -1, route?.mode || "")}`}></div>
                                    <div className={`w-full h-5/10 ${getRouteColor("bg", route?.type || -1, route?.mode || "")}`}></div>
                                </div>
                                <div className="p-2 flex flex-row gap-2 font-medium items-center h-full">
                                    {l?.transitLeg ? <>
                                        <Link className="decoration-none" href={`/route/${l.route?.gtfsId}/${l.pattern?.code.split(":")[2] || ""}-${l.pattern?.code.split(":")[3] || ""}/${isHsl ? "?hsl" : ""}`}><Label className={`font-bold text-white ${getRouteColor("bg", route?.type || -1, route?.mode || "")}`}>{route?.shortName || route?.longName || ""}</Label> {l.headsign}</Link>
                                    </> : <>
                                        Walk {walkDistance >= 1100 ? Math.round(walkDistance / 100) / 10 + " km " : Math.round(walkDistance) + " m "}({duration >= 3600 && `${Math.ceil(duration / 3600)} h `}{Math.ceil(duration / 60 % 60)} min)
                                    </>}
                                </div>
                            </div>
                            {(l?.transitLeg || i == a.length - 1 || l?.to.viaType) && !next?.transitLeg && <div className="flex flex-row w-full" key={i + "c"}>
                                <div className="flex w-12 flex-col font-medium my-2 items-end justify-center">
                                    <div className={l?.end.estimated ? "text-green" : ""}>{format(new TZDate(l.end.estimated || l.end.scheduled || ""), "HH:mm")}</div>
                                </div>
                                <div className={`mx-4 w-3 relative h-full flex flex-col ${i == 0 ? "items-end" : i == a.length - 1 ? "items-start" : ""}`}>
                                    <div className={`w-full h-5/10  ${i == a.length - 1 && "rounded-b-full"} ${getRouteColor("bg", route?.type || -1, route?.mode || "")}`}></div>
                                    {i != a.length - 1 && <div className={`w-full h-5/10 ${getRouteColor("bg", nextRoute?.type || -1, (next?.transitLeg ? nextRoute?.mode : "WALK") || "transparent")}`}></div>}
                                    {i == a.length - 1 && <div className="absolute -left-3 -right-3 bottom-2"><Image className="" src="/pin_red.svg" alt="Pin"></Image></div>}
                                    {l?.to.viaType && <div className="absolute -left-3 -right-3 bottom-2"><Image className="" src="/pin_darkgray.svg" alt="Pin"></Image></div>}
                                    {l?.transitLeg && (<><div className={`absolute -left-1.5 -right-1.5 bottom-0 top-0 flex justify-center items-center ${l.route?.type == 702 && "z-101"}`}>
                                        <div className={`bg-white border-white absolute border-[.25rem] bg-white h-7 w-7 rounded-full z-100`}></div>
                                        <div className={`${getRouteColor("border", route?.type || -1, route?.mode || "")} border-[.25rem] bg-white h-6 w-6 rounded-full z-100`}></div>
                                    </div></>)}
                                </div>
                                {l?.transitLeg ? <Link className="decoration-none" href={`/stop/${l.to.stop?.gtfsId}/${isHsl ? "?hsl" : ""}`}><div className="p-2 flex flex-col font-medium my-2">
                                    <div><span className="text-lg font-medium">{l.to.stop?.name}</span> {l.to.stop?.platformCode && <Label className="w-min bg-gray">pl. {l.to.stop?.platformCode}</Label>}</div>
                                    <div><span className="text-sm">{l.to.stop?.desc}</span> {l.to.stop?.code && <Label className="text-xs bg-gray">{l.to.stop?.code}</Label>}</div>
                                </div></Link> : <div className="p-2 flex flex-col font-medium my-2">
                                    <div><span className="text-lg font-medium">{l?.to.name}</span></div>
                                </div>}
                            </div>}
                        </div>
                        ]
                    })
                }
            </div>
            <MapOverlay>
                <Map data={data}
                    via={via}
                    destination={destination}
                    origin={origin}
                    selectedRoute={selectedRoute}
                />
            </MapOverlay>
        </>
    );
}


