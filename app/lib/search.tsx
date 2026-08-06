"use server"
import { Road } from "@material-symbols-svg/react";
import { Suggestion } from "../components/inputfield";
import { GeocodingFeatProps, GeocodingResponse, IconTable } from "./digitransit";
import { SignpostW700 as Signpost } from '@material-symbols-svg/react/icons/signpost';
import { LocationOnW700 as LocationOn } from '@material-symbols-svg/react/icons/location-on';
import { PedalBikeW700 as PedalBike } from '@material-symbols-svg/react/icons/pedal-bike';
import { GlobeW700 as Globe } from '@material-symbols-svg/react/icons/globe';
import { HomeWorkW700 as HomeWork } from '@material-symbols-svg/react/icons/home-work';
import { DirectionsBusW700 as DirectionsBus } from '@material-symbols-svg/react/icons/directions-bus';
import { TramW700 as Tram } from '@material-symbols-svg/react/icons/tram';
import { MetroW700 as Metro } from '@material-symbols-svg/react/icons/metro';
import { TrainW700 as Train } from '@material-symbols-svg/react/icons/train';
import { ReactElement } from "react";
import { LngLat } from "maplibre-gl";

export async function search(text: string, focusPoint: [number,number]): Promise<Suggestion[]> {
    return [... await searchDigitransit(text, new LngLat(...focusPoint))]
}
async function searchDigitransit(text: string, focusPoint: LngLat): Promise<Suggestion[]> {
    console.log("hdhd")

    const layers = [["address", "venue", "street"], ["stop", "station", "bikestation"], ["neighbourhood", "localadmin", "region"]]
    const responses = await Promise.all(layers.map(async l => {
        return await fetch(
            `https://api.digitransit.fi/geocoding/v1/autocomplete?digitransit-subscription-key=${process.env.DIGITRANSIT_KEY}&text=${encodeURIComponent(text)}&layers=${l.join(",")}&focus.point.lat=${focusPoint.lat}&focus.point.lon=${focusPoint.lng}`
        )
    }))
    const results: GeocodingResponse = await (await Promise.all(responses.map(r => r.json()))).reduce((p, c) => ({ ...p, features: [...(p.features || []), ...c.features] }), {})
    return await geocodingResultsToSuggestions(results)
}
export async function geocodingResultsToSuggestions(results: GeocodingResponse) {
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
            if (!props.addendum) return props.name
            const gtfs = props.addendum.GTFS
            if (!gtfs) return props.name
            return `${props.name} ${gtfs.platform && "pl. " + gtfs.platform || ""} ${gtfs.code && "(" + gtfs.code + ")" || ""}`
        default:
            return props.name
    }
}
function getIconFromProps(props: GeocodingFeatProps) {
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
            
            return Object.entries(IconTable).reduce<ReactElement | null>((p, [k, v]) => !p && gtfs.modes?.some(m => m == k) ? v : p, null) || (<DirectionsBus></DirectionsBus>)
        case "street":
            return (<Road></Road>)
        default:
            return (<LocationOn></LocationOn>);
    }
}