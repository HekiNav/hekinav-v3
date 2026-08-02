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
            modes?: ("BUS" | "RAIL" | "BUS-EXPRESS" | "SUBWAY" | "SPEEDTRAM" | "TRAM" | "FERRY" | "AIRPLANE")[],
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

export interface GeocodingResponse {
    
}