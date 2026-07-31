"use server"
import { Road } from "@material-symbols-svg/react";
import { Suggestion } from "../components/inputfield";
import { AutoCompleteFeatProps, AutoCompleteResponse } from "./digitransit";
import { Signpost, LocationOn, PedalBike, Globe, HomeWork, DirectionsBus, Tram, Metro, Train } from "@material-symbols-svg/react/w700"
import { ReactElement } from "react";
import { LngLat } from "maplibre-gl";

export async function search(text: string, focusPoint: LngLat): Promise<Suggestion[]> {
    return [... await searchDigitransit(text, focusPoint)]
}
async function searchDigitransit(text: string, focusPoint: LngLat): Promise<Suggestion[]> {
    console.log("hdhd")

    const layers = [["address", "venue", "street"], ["stop", "station", "bikestation"], ["neighbourhood", "localadmin", "region"]]
    const responses = await Promise.all(layers.map(async l => {
        return await fetch(
            `https://api.digitransit.fi/geocoding/v1/autocomplete?digitransit-subscription-key=${process.env.DIGITRANSIT_KEY}&text=${encodeURIComponent(text)}&layers=${l.join(",")}&focus.point.lat=${focusPoint.lat}&focus.point.lon=${focusPoint.lng}`
        )
    }))
    const results: AutoCompleteResponse = await (await Promise.all(responses.map(r => r.json()))).reduce((p, c) => ({ ...p, features: [...(p.features || []), ...c.features] }), {})
    if (!results) return []
    const addressProperties: ("neighbourhood" | "locality" | "localadmin")[] = ["neighbourhood", "locality", "localadmin"]
    return results.features.sort((a,b) => b.properties.confidence - a.properties.confidence).map(f => ({
        id: f.properties?.gid,
        text: getNameFromProps(f.properties),
        icon: getIconFromProps(f.properties),
        layer: f.properties?.layer,
        desc: addressProperties.reduce((prev, key) => {
            const value = f.properties && f.properties[key]
            if (value && prev.split(", ").findLast(() => true) != value) return `${prev}${prev.length ? ", " : ""}${value}`
            return prev
        }, ""),
        properties: {
            lat: (f.geometry as GeoJSON.Point).coordinates[0],
            lon: (f.geometry as GeoJSON.Point).coordinates[1]
        }
    })).filter((value, index, self) =>
        index === self.findIndex(({ text, desc }) => (
            text == value.text && desc == value.desc
        ))
    )
}
function getNameFromProps({ layer, ...props }: { [key: string]: any }): string {
    console.log(layer)
    switch (layer) {
        case "stop":
        case "station":
            const gtfs = props.addendum.GTFS
            if (!gtfs) return props.name
            return `${props.name} ${gtfs.platform && "pl. " + gtfs.platform || ""} ${gtfs.code && "(" + gtfs.code + ")" || ""}`
        default:
            return props.name
    }
}
function getIconFromProps(props: AutoCompleteFeatProps) {
    switch (props.layer) {
        case "address":
            return (<Signpost></Signpost>);
        case "bikestation":
            return (<PedalBike className="text-yellow"></PedalBike>)
        case "localadmin":
            return (<Globe></Globe>)
        case "neighbourhood":
            return (<HomeWork></HomeWork>)
        case "region":
            return (<Globe></Globe>)
        case "station":
        case "stop":
            const gtfs = props.addendum?.GTFS
            if (!gtfs || !gtfs.modes) return (<DirectionsBus></DirectionsBus>)
            const table = {
                "BUS-EXPRESS": (<DirectionsBus className="text-darkblue"></DirectionsBus>),
                "SPEEDTRAM": (<Tram className="text-turqoise"></Tram>),
                "BUS": (<DirectionsBus className="text-blue"></DirectionsBus>),
                "RAIL": (<Train className="text-purple"></Train>),
                "SUBWAY": (<Metro className="text-orange"></Metro>),
                "TRAM": (<Tram className="text-green"></Tram>),
            }
            return Object.entries(table).reduce<ReactElement | null>((p, [k, v]) => !p && gtfs.modes?.some(m => m == k) ? v : p, null) || (<DirectionsBus></DirectionsBus>)
        case "street":
            return (<Road></Road>)
        default:
            return (<LocationOn></LocationOn>);
    }
}