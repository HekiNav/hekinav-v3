"use client"
import { IconTableLarge } from "@/app/lib/digitransit";
import Label from "@/app/components/label";
import IconItem from "@/app/components/iconitem";
import { useEffect, useState } from "react";
import { StopQueryQuery } from "./page.generated";
import { useMap } from "@vis.gl/react-maplibre";
import { LngLat } from "maplibre-gl"
import Selector from "@/app/components/selector";
import StopDepartures from "./deps";
import StopTimeTableContent from "./timetable";

export interface ContentProps {
    data: NonNullable<StopQueryQuery["stop"]>
    isHsl: boolean;
    stop_or_station: "stop" | "station";
}


export default function Content({ data,
    isHsl,
    stop_or_station }: ContentProps) {

    const { default: map } = useMap()

    const [activePage, setActivePage] = useState<number>(0)

    useEffect(() => {
        map?.flyTo({
            center: new LngLat(data.lon || 0, data.lat || 0),
            zoom: 15,
            duration: 3000
        })
    }, [data.lat, data.lon, map])

    const pages = [
        <StopDepartures key={0} data={data} isHsl={isHsl} stop_or_station={stop_or_station}></StopDepartures>,
        <StopTimeTableContent key={1} data={data} isHsl={isHsl} stop_or_station={stop_or_station}></StopTimeTableContent>
    ]

    return (
        <>
            <IconItem icon={{ boxed: stop_or_station == "station", children: IconTableLarge[data.vehicleMode || "BUS"],}} className="ml-12 mt-1"><span className="text-3xl">{data.name}</span> {data.platformCode && <Label className="bg-gray">{data.platformCode}</Label>}</IconItem>
            <div className="text-sm">{data.desc && <Label className="bg-gray">{data.desc}</Label>} {data.code && <Label className="bg-gray">{data.code}</Label>}</div>
            <Selector selected={activePage} onSet={setActivePage} items={["Departures", "Timetable","Alerts"]}></Selector>
            {pages[activePage]}
        </>
    );
}
