import { DirectionsBoatW700 as DirectionsBoat } from '@material-symbols-svg/react/icons/directions-boat';
import { DirectionsBusW700 as DirectionsBus } from '@material-symbols-svg/react/icons/directions-bus';
import { FlightW700 as Flight } from '@material-symbols-svg/react/icons/flight';
import { MetroW700 as Metro } from '@material-symbols-svg/react/icons/metro';
import { TrainW700 as Train } from '@material-symbols-svg/react/icons/train';
import { TramW700 as Tram } from '@material-symbols-svg/react/icons/tram';

export type Mode = "BUS" | "RAIL" | "BUS-EXPRESS" | "SUBWAY" | "SPEEDTRAM" | "TRAM" | "FERRY" | "AIRPLANE"

export interface GeocodingFeatProps {
    id: string
    gid: string
    layer: "address" | "venue" | "street" | "stop" | "station" | "bikestation" | "neighbourhood" | "localadmin" | "region"
    source: string
    source_id: string
    name: string
    postalcode: string
    postalcode_gid: string
    confidence: number
    accuracy: string
    region: string
    region_gid: string
    localadmin: string
    localadmin_gid: string
    locality: string
    locality_gid: string
    label: string
    neighbourhood: string
    neighbourhood_gid: string
    addendum?: {
        GTFS: {
            code?: string
            modes?: Mode[],
            platform?: string
        }
    }
}

export interface GeocodingResponse {
    geocoding: {
        version: 0.2,
        attribution: string,
        warnings: string[
        ],
        engine: {
            name: string,
            author: string,
            version: number
        },
        timestamp: number
    },
    type: "FeatureCollection",
    features:
    {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [number, number]
        },
        properties: GeocodingFeatProps
    }[],
    bbox: [
        number, number, number, number
    ]
}

export const IconTable = {
    "BUS-EXPRESS": (<DirectionsBus className="text-darkblue border-darkblue"></DirectionsBus>),
    "SPEEDTRAM": (<Tram className="text-turqoise border-turqoise"></Tram>),
    "BUS": (<DirectionsBus className="text-blue border-blue"></DirectionsBus>),
    "RAIL": (<Train className="text-purple border-purple"></Train>),
    "SUBWAY": (<Metro className="text-orange border-orange"></Metro>),
    "TRAM": (<Tram className="text-green border-green"></Tram>),
    "FERRY": (<DirectionsBoat className="text-cyan border-cyan"></DirectionsBoat>),
    "AIRPLANE": (<Flight className="text-darkblue border-darkblue"></Flight>),
}
