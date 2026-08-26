"use client"
import { useState } from "react";
import { PatternQueryQuery } from "./page.generated";
import Selector from "@/app/components/selector";
import StopTimeTableContent from "./timetable";
import RouteStops from "./stops";
import RouteAlerts from "./alerts";

export interface ContentProps {
    data: NonNullable<PatternQueryQuery["pattern"]>
    isHsl: boolean;
}


export default function Content({ data,
    directionId,
    isHsl }: ContentProps & {directionId: number}) {

    const [activePage, setActivePage] = useState<number>(0)

    const pages = [
        <RouteStops key={0} data={data} isHsl={isHsl}></RouteStops>,
        <StopTimeTableContent directionId={directionId} key={1} data={data} isHsl={isHsl}></StopTimeTableContent>,
        <RouteAlerts key={0} data={data} isHsl={isHsl}></RouteAlerts>
    ]

    return (
        <>
            <Selector selected={activePage} onSet={setActivePage} items={["Departures", "Timetable","Alerts"]}></Selector>
            {pages[activePage]}
        </>
    );
}
