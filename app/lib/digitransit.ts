export interface AutoCompleteFeatProps {
    id: string
    gid: string
    layer: "address" | "venue" | "street" | "stop" | "station" | "bikestation" | "neighbourhood" | "localadmin" | "region"
    source: string
    source_id: string
    name: string
    postalcode: string
    postalcode_gid: string
    confidence: string
    accuracy: string
    region: string
    region_gid: string
    localadmin: string
    localadmin_gid: string
    label: string
}

export interface AutoCompleteResponse {
    geocoding: {
        version: 0.2,
        attribution: number,
        query: {
            text: string,
            tokens: string[],
            size: number,
            private: boolean,
            "boundary.country": string[

            ],
            lang: string
        },
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
        properties: AutoCompleteFeatProps
    }[],
    bbox: [
        number, number, number, number
    ]
}