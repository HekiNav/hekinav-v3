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
import { ReactElement } from "react";
import { LngLat } from "maplibre-gl";

export async function search(text: string, focusPoint: [number,number], isHsl: boolean): Promise<Suggestion[]> {
    return [... await geocodingResultsToSuggestions(await searchDigitransit(text, new LngLat(...focusPoint),isHsl))]
}
export async function searchDigitransit(text: string, focusPoint: LngLat, isHsl: boolean, layers = [["address", "venue", "street"], ["stop", "station", "bikestation"], ["neighbourhood", "localadmin", "region"]]) {

    const responses = await Promise.all(layers.map(async l => {
        return await fetch(
            `https://api.digitransit.fi/geocoding/v1/search?digitransit-subscription-key=${process.env.DIGITRANSIT_KEY}&text=${encodeURIComponent(text)}&layers=${l.join(",")}${isHsl ? "&sources=gtfshsl" : ""}&focus.point.lat=${focusPoint.lat}&focus.point.lon=${focusPoint.lng}${isHsl ? "&boundary.polygon=25.5345 60.2592,25.3881 60.1693,25.3559 60.103,25.3293 59.9371,24.2831 59.78402,24.2721 59.95501,24.2899 60.00895,24.3087 60.01947,24.1994 60.12753,24.1362 60.1114,24.1305 60.12847,24.099 60.1405,24.0179 60.1512,24.0049 60.1901,24.0445 60.1918,24.0373 60.2036,24.0796 60.2298,24.1652 60.2428,24.3095 60.2965,24.3455 60.2488,24.428 60.3002,24.5015 60.2872,24.4888 60.3306,24.5625 60.3142,24.5957 60.3242,24.6264 60.3597,24.666 60.3638,24.7436 60.3441,24.9291 60.4523,24.974 60.5253,24.9355 60.5131,24.8971 60.562,25.0388 60.5806,25.1508 60.5167,25.2242 60.5016,25.3661 60.4118,25.3652 60.3756" : ""}`
        )
    }))
    const results: GeocodingResponse = await (await Promise.all(responses.map(r => r.json()))).reduce((p, c) => ({ ...p, features: [...(p.features || []), ...c.features] }), {})
    return results
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNameFromProps({ layer, ...props }: { [key: string]: any }): string {
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