import { DirectionsBoatW700 as DirectionsBoat } from '@material-symbols-svg/react/icons/directions-boat';
import { DirectionsBusW700 as DirectionsBus } from '@material-symbols-svg/react/icons/directions-bus';
import { FlightW700 as Flight } from '@material-symbols-svg/react/icons/flight';
import { MetroW700 as Metro } from '@material-symbols-svg/react/icons/metro';
import { TrainW700 as Train } from '@material-symbols-svg/react/icons/train';
import { TramW700 as Tram } from '@material-symbols-svg/react/icons/tram';
import { PedalBikeW700 as PedalBike } from '@material-symbols-svg/react/icons/pedal-bike';
import { DirectionsCarW700 as DirectionsCar } from '@material-symbols-svg/react/icons/directions-car';
import { DirectionsWalkW700 as DirectionsWalk } from '@material-symbols-svg/react/icons/directions-walk';
import { FunicularW700 as Funicular } from '@material-symbols-svg/react/icons/funicular';
import { GondolaLiftW700 as GondolaLift } from '@material-symbols-svg/react/icons/gondola-lift';
import { LocalTaxiW700 as LocalTaxi } from '@material-symbols-svg/react/icons/local-taxi';
import { MonorailW700 as Monorail } from '@material-symbols-svg/react/icons/monorail';
import { QuestionMarkW700 as QuestionMark } from '@material-symbols-svg/react/icons/question-mark';
import { ScooterW700 as Scooter } from '@material-symbols-svg/react/icons/scooter';

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
    "COACH": (<DirectionsBus className="text-darkblue border-darkblue"></DirectionsBus>),
    "SPEEDTRAM": (<Tram className="text-turqoise border-turqoise"></Tram>),
    "BUS": (<DirectionsBus className="text-blue border-blue"></DirectionsBus>),
    "TRANSIT": (<DirectionsBus className="text-blue border-blue"></DirectionsBus>),
    "RAIL": (<Train className="text-purple border-purple"></Train>),
    "SUBWAY": (<Metro className="text-orange border-orange"></Metro>),
    "TRAM": (<Tram className="text-green border-green"></Tram>),
    "TROLLEYBUS": (<Tram className="text-green border-green"></Tram>),
    "FERRY": (<DirectionsBoat className="text-cyan border-cyan"></DirectionsBoat>),
    "AIRPLANE": (<Flight className="text-darkblue border-darkblue"></Flight>),
    "BICYCLE": (<PedalBike className="text-yellow border-yellow"></PedalBike>),
    "CABLE_CAR": (<GondolaLift className="text-green border-green"></GondolaLift>),
    "GONDOLA": (<GondolaLift className="text-green border-green"></GondolaLift>),
    "FUNICULAR": (<Funicular className="text-green border-green"></Funicular>),
    "MONORAIL": (<Monorail className="text-green border-green"></Monorail>),
    "CAR": (<DirectionsCar className="text-green border-green"></DirectionsCar>),
    "TAXI": (<LocalTaxi className="text-green border-green"></LocalTaxi>),
    "CARPOOL": (<DirectionsCar className="text-green border-green"></DirectionsCar>),
    "SCOOTER": (<Scooter className="text-green border-green"></Scooter>),
    "FLEX": (<QuestionMark className="text-black border-black"></QuestionMark>),
    "FLEXIBLE": (<QuestionMark className="text-black border-black"></QuestionMark>),
    "LEG_SWITCH": (<QuestionMark className="text-black border-black"></QuestionMark>),
    "WALK": (<DirectionsWalk className="text-black border-black"></DirectionsWalk>),
}

export const gtfsIdRegex = /^(.*)\:(\d|[A-Z]|\Ä|\Ö|\Å|_|-)+$/

export function getRouteColor(type: "bg" | "border", mode: number, stringMode?: string) {
    switch (mode) {
        case 109:
            return type == "border" ? "border-purple" : "bg-purple"
        case 102:
            return type == "border" ? "border-green" : "bg-green"
        case 701:
        case 704:
        case 700:
        case 3:
            return type == "border" ? "border-blue" : "bg-blue"
        case 702:
            return type == "border" ? "border-orange" : "bg-orange"
        case 714:
            return type == "border" ? "border-blue" : "bg-blue"
        case 900:
            return type == "border" ? "border-turqoise" : "bg-turqoise"
        case 1104:
            return type == "border" ? "border-darkblue" : "bg-darkblue"
        case 0:
            return type == "border" ? "border-green" : "bg-green"
        case 1:
            return type == "border" ? "border-orange" : "bg-orange"
        case 4:
        case 1008:
            return type == "border" ? "border-cyan" : "bg-cyan"
        case -1:
            switch (stringMode) {
                case "BUS-EXPRESS": return type == "border" ? "border-darkblue" : "bg-darkblue"
                case "COACH": return type == "border" ? "border-darkblue" : "bg-darkblue"
                case "SPEEDTRAM": return type == "border" ? "border-turqoise" : "bg-turqoise"
                case "BUS": return type == "border" ? "border-blue" : "bg-blue"
                case "TRANSIT": return type == "border" ? "border-blue" : "bg-blue"
                case "RAIL": return type == "border" ? "border-purple" : "bg-purple"
                case "SUBWAY": return type == "border" ? "border-orange" : "bg-orange"
                case "TRAM": return type == "border" ? "border-green" : "bg-green"
                case "TROLLEYBUS": return type == "border" ? "border-green" : "bg-green"
                case "FERRY": return type == "border" ? "border-cyan" : "bg-cyan"
                case "AIRPLANE": return type == "border" ? "border-darkblue" : "bg-darkblue"
                case "BICYCLE": return type == "border" ? "border-yellow" : "bg-yellow"
                case "CABLE_CAR": return type == "border" ? "border-green" : "bg-green"
                case "GONDOLA": return type == "border" ? "border-green" : "bg-green"
                case "FUNICULAR": return type == "border" ? "border-green" : "bg-green"
                case "MONORAIL": return type == "border" ? "border-green" : "bg-green"
                case "CAR": return type == "border" ? "border-green" : "bg-green"
                case "TAXI": return type == "border" ? "border-green" : "bg-green"
                case "CARPOOL": return type == "border" ? "border-green" : "bg-green"
                case "SCOOTER": return type == "border" ? "border-green" : "bg-green"
                case "FLEX": return type == "border" ? "border-black" : "bg-black"
                case "FLEXIBLE": return type == "border" ? "border-black" : "bg-black"
                case "LEG_SWITCH": return type == "border" ? "border-black" : "bg-black"
                case "WALK": return type == "border" ? "border-black" : "bg-black"
            }
        default:
            console.log(mode)
            return type == "border" ? "border-gray" : "bg-gray"
    }
}