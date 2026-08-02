"use server"

import { LngLat } from "maplibre-gl";
import { GeocodingResponse } from "./digitransit";
import { geocodingResultsToSuggestions } from "./search";

export default async function reverseGeocode(coords: [number,number]) {
    const response: GeocodingResponse = await (await fetch(`https://api.digitransit.fi/geocoding/v1/reverse?digitransit-subscription-key=${process.env.DIGITRANSIT_KEY}&point.lat=${coords[1]}&point.lon=${coords[0]}&size=1&layers=address,stop,station,neighbourhood,localadmin,region`)).json()
    console.log(`https://api.digitransit.fi/geocoding/v1/reverse?digitransit-subscription-key=${process.env.DIGITRANSIT_KEY}&point.lat=${coords[1]}&point.lon=${coords[0]}&size=1&layers=address,stop,station,neighbourhood,localadmin,region`)
    return await geocodingResultsToSuggestions(response)
}