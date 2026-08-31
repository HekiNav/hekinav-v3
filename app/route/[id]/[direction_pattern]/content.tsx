"use client"
import { useContext, useState } from "react";
import { PatternQueryQuery } from "./page.generated";
import Selector from "@/app/components/selector";
import StopTimeTableContent from "./timetable";
import RouteStops from "./stops";
import RouteAlerts from "./alerts";
import { getRouteColor } from "@/app/lib/digitransit";
import Link from "next/link";
import Label from "@/app/components/label";
import Icon from "@/app/components/icon";
import { ArrowRightAltW700 as ArrowRightAlt } from '@material-symbols-svg/react/icons/arrow-right-alt';
import Dropdown, { DropdownItem } from "@/app/components/dropdown";
import { SyncAltW700 as SyncAlt } from '@material-symbols-svg/react/icons/sync-alt';
import { ConfigContext } from "@/app/HekinavConfig";
import { StarFillW700, StarW700 } from "@material-symbols-svg/react/icons/star";

export interface ContentProps {
    data: NonNullable<PatternQueryQuery["pattern"]>
    isHsl: boolean;
}


export default function Content({ data,
    directionId,
    isHsl }: ContentProps & { directionId: number }) {

    const [activePage, setActivePage] = useState<number>(0)

    const { config, setConfig } = useContext(ConfigContext)

    const pages = [
        <RouteStops key={0} data={data} isHsl={isHsl}></RouteStops>,
        <StopTimeTableContent directionId={directionId} key={1} data={data} isHsl={isHsl}></StopTimeTableContent>,
        <RouteAlerts key={0} data={data} isHsl={isHsl}></RouteAlerts>
    ]

    const patternOptions: DropdownItem<string>[] = (data.route.patterns || []).filter(p => p?.code != data.code).map(p => ({
        content: (p && <Link className="decoration-none" href={`/route/${data.route.gtfsId}/${p.directionId}-${p.code.split(":")[3]}/${isHsl ? "?hsl" : ""}`}><Pattern data={p as never}></Pattern></Link>), id: p?.code || ""
    }))

    const firstPattern = data.route.patterns && data.route.patterns.find(p => p?.code != data.code)



    return (
        <>
            <span className="flex justify-start items-center gap-2 mb-2 ml-14 mt-1">
                <Label className={`text-2xl w-min ${getRouteColor("bg", data.route.type || -1, data.route.mode || "")} text-white font-bold`}>{data.route.shortName || data.route.longName}</Label>
                <Pattern data={data}></Pattern> {(patternOptions.length == 1 && firstPattern) && <Link className="decoration-none ml-auto" href={`/route/${data.route.gtfsId}/${firstPattern.directionId}-${firstPattern.code.split(":")[3]}/${isHsl ? "?hsl" : ""}`}><Icon boxed><SyncAlt></SyncAlt></Icon></Link>}
                <Icon onMouseDownCapture={(e) => { setConfig(config.favourites.routes.every(f => data.route?.gtfsId != f) ? [...config.favourites.routes, data.route?.gtfsId] : config.favourites.routes.filter(f => data.route?.gtfsId != f), ["favourites", "routes"]) }} className="ml-auto cursor-pointer">{config.favourites.routes.every(f => data.route?.gtfsId != f) ? <StarW700 className="hover:text-yellow"></StarW700> : <StarFillW700 className="text-yellow"></StarFillW700>}</Icon>
            </span>
            {patternOptions.length > 1 && <Dropdown initial={<span className="text-xl font-medium text-green">Other patterns</span>} items={patternOptions}></Dropdown>}

            <Selector selected={activePage} onSet={setActivePage} items={["Departures", "Timetable", "Alerts"]}></Selector>
            {pages[activePage]}
        </>
    );
}

function Pattern({ data }: { data: Omit<NonNullable<PatternQueryQuery["pattern"]>, "route" | "name"> }) {
    if (!data.stops) return data.code
    return (
        <div className="flex justify-start items-center gap-1">
            <span className="font-medium text-xl">{data.stops[0].name}</span>
            <Icon><ArrowRightAlt height={24}></ArrowRightAlt></Icon>
            <span className="font-medium text-xl">{data.stops[data.stops.length - 1].name}</span>
        </div>
    )
}
