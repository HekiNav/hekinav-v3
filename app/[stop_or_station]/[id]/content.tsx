"use client"
import { IconTableLarge } from "@/app/lib/digitransit";
import Label from "@/app/components/label";
import IconItem from "@/app/components/iconitem";
import { useContext, useEffect, useState } from "react";
import { StopQueryQuery } from "./page.generated";
import { useMap } from "@vis.gl/react-maplibre";
import { LngLat } from "maplibre-gl"
import Selector from "@/app/components/selector";
import StopDepartures from "./deps";
import StopTimeTableContent from "./timetable";
import StopAlerts from "./alerts";
import Icon from "@/app/components/icon";
import { ConfigContext } from "@/app/HekinavConfig";
import { StarFillW700, StarW700 } from "@material-symbols-svg/react/icons/star";
import toast from "react-hot-toast";

export interface ContentProps {
    data: NonNullable<StopQueryQuery["stop"]>
    isHsl: boolean;
    stop_or_station: "stop" | "station";
}


export default function Content({ data,
    isHsl,
    stop_or_station }: ContentProps) {

    const { default: map } = useMap()
    const { config, setConfig } = useContext(ConfigContext)

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
        <StopTimeTableContent key={1} data={data} isHsl={isHsl} stop_or_station={stop_or_station}></StopTimeTableContent>,
        <StopAlerts key={0} data={data} isHsl={isHsl} stop_or_station={stop_or_station}></StopAlerts>
    ]



    return (
        <>
            <IconItem icon={{ boxed: stop_or_station == "station", children: IconTableLarge[data.vehicleMode || "BUS"], }} className="ml-12 mt-1"><span className="text-3xl">{data.name}</span> {data.platformCode && <Label className="bg-gray">{data.platformCode}</Label>}
                <Icon onMouseDownCapture={() => {setConfig(config.favourites[stop_or_station == "station" ? "stations" : "stops"].every(f => data?.gtfsId != f) ? [...config.favourites[stop_or_station == "station" ? "stations" : "stops"], data?.gtfsId] : config.favourites[stop_or_station == "station" ? "stations" : "stops"].filter(f => data?.gtfsId != f), ["favourites", stop_or_station == "station" ? "stations" : "stops"]) }} className="ml-auto cursor-pointer">{config.favourites[stop_or_station == "station" ? "stations" : "stops"].every(f => data?.gtfsId != f) ? <StarW700 className="hover:text-yellow"></StarW700> : <StarFillW700 className="text-yellow"></StarFillW700>}</Icon>
            </IconItem>
            <div className="text-sm">{data.desc && <Label className="bg-gray">{data.desc}</Label>} {data.code && <Label className="bg-gray">{data.code}</Label>}</div>
            <Selector selected={activePage} onSet={setActivePage} items={["Departures", "Timetable", "Alerts"]}></Selector>
            {pages[activePage]}
        </>
    );
}
