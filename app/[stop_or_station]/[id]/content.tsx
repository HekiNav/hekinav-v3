"use client"
import { IconTable, getRouteColor } from "@/app/lib/digitransit";
import Label from "@/app/components/label";
import IconItem from "@/app/components/iconitem";
import Date from "../../components/Date";
import Link from "next/link";
import Day from "./day";
import { ReactElement, useContext, useEffect } from "react";
import Toggle from "@/app/components/toggle";
import { ConfigContext } from "@/app/HekinavConfig";
import { StopQueryQuery } from "./page.generated";
import { useMap } from "@vis.gl/react-maplibre";
import { LngLat } from "maplibre-gl"

interface ContentProps {
    data: NonNullable<StopQueryQuery["stop"]>
    isHsl: boolean;
    stop_or_station: "stop" | "station";
}


export default function Content({ data,
    isHsl,
    stop_or_station }: ContentProps) {

    const { config, setConfig } = useContext(ConfigContext)

    const { default: map } = useMap()

    useEffect(() => {
        map?.flyTo({
            center: new LngLat(data.lon || 0, data.lat || 0),
            zoom: 15,
            duration: 3000
        })
    }, [data.lat, data.lon, map])

    return (
        <>
            <IconItem icon={{ boxed: stop_or_station == "station", children: IconTable[data.vehicleMode || "BUS"] }} className="text-lg"><span className="text-2xl">{data.name}</span> {data.platformCode && <Label className="bg-gray">{data.platformCode}</Label>}</IconItem>
            <div className="text-sm">{data.desc && <Label className="bg-gray">{data.desc}</Label>} {data.code && <Label className="bg-gray">{data.code}</Label>}</div>
            <h2 className="text-xl flex justify-between"><span>Departures</span><span className="flex flex-nowrap text-lg">Advanced<Toggle state={config.advancedDepartures} setState={(value) => setConfig(value,["advancedDepartures"])}></Toggle></span></h2>
            {data.stoptimesWithoutPatterns && data.stoptimesWithoutPatterns.length ? <table><tbody>
                <tr><th className="text-start text-sm font-medium text-darkgray">Route</th><th className="text-start text-sm font-medium text-darkgray">Destination</th><th className="text-center text-sm font-medium text-darkgray">Time</th>{stop_or_station == "station" && <th className="text-center text-sm font-medium text-darkgray">Plat.</th>}</tr>
                {
                    data.stoptimesWithoutPatterns?.reduce((p, s, i, a) => {
                        const delay = s ? (s.realtimeDeparture && s.scheduledDeparture ? s.realtimeDeparture - s.scheduledDeparture : s.realtimeArrival && s.scheduledArrival ? s.realtimeArrival - s.scheduledArrival : 0) : 0
                        const last = a[i - 1]
                        const url = `/route/${s?.trip?.route.gtfsId}/${s?.trip?.directionId || ""}-${s?.trip?.pattern?.code.split(":")[3]}${isHsl ? "?hsl" : ""}`

                        return [...p, (last && last.serviceDay != s?.serviceDay) ? (
                            <tr key={`h${i}`} className={`px-1 border-t-10 border-white`}>
                                <th className="text-start" colSpan={stop_or_station == "station" ? 4 : 3}><Day day={s?.serviceDay as number || 0}></Day></th>
                            </tr>) : [], (
                            <tr key={i} className={`px-1 border-t-3 border-white`}>
                                <td className={`${i % 2 == 1 ? "bg-[#eee]" : "bg-white"} rounded-l-lg ps-[2px]`}>
                                    <Link className="decoration-none mr-2" href={url}>
                                        <Label className={`text-white font-bold ${getRouteColor("bg", s?.trip?.route.type || -1, s?.trip?.route.mode || undefined)}`}>{s?.trip?.routeShortName}</Label>
                                    </Link>
                                </td>
                                <td className={`${i % 2 == 1 ? "bg-[#eee]" : "bg-white"} td-truncate`}>
                                    {s?.pickupType == "NONE" ? "Arriving / Terminus" : s?.headsign}
                                </td>
                                <td className={`${i % 2 == 1 ? "bg-[#eee]" : "bg-white"} ${stop_or_station == "station" ? "" : "rounded-r-lg"} items-center justify-end pr-1 flex flex-row flex-nowrap ${s?.realtime ? config.advancedDepartures ? getColorFromDelay(delay) : "text-green" : "text-black"}`}>
                                    <Date approx={!s?.realtime} showScheduled={config.advancedDepartures && (delay < -120 || delay > 120)} scheduledTime={s?.scheduledDeparture || s?.scheduledArrival || 0} time={s?.realtimeDeparture || s?.scheduledDeparture || s?.realtimeArrival || s?.scheduledArrival || 0} day={s?.serviceDay as number || 0}></Date>
                                </td>
                                {stop_or_station == "station" && <td className={`${i % 2 == 1 ? "bg-[#eee]" : "bg-white"} rounded-r-lg items-center justify-end pl-2 pr-1 text-center`}>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {(s as any).stop.platformCode ? <Label>{(s as any).stop.platformCode}</Label> : "-"}
                                </td>}
                            </tr>)
                        ].flat()
                    }, new Array<ReactElement>())
                }
            </tbody>
            </table> : "No departures"}
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
