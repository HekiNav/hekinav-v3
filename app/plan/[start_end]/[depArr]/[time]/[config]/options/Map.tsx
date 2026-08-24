"use client"
import { useMap } from "@vis.gl/react-maplibre"
import { PlanQueryQuery } from "./layout.generated"
import { useEffect } from "react"
import { GeoJSONSource, LngLatBounds } from "maplibre-gl"
import { getColor } from "@/app/lib/digitransit"
import { LocationType, Mode, PlanLabeledLocationInput, RealtimeState, TransitMode, ViaLocationType } from "@/app/lib/__generated__/graphql"
import polyline from "@mapbox/polyline"

export function Map({ data, selectedRoute = null, destination, origin }: { data: NonNullable<PlanQueryQuery["planConnection"]>, selectedRoute?: number | null, destination: PlanLabeledLocationInput, origin: PlanLabeledLocationInput }) {
  const { default: map } = useMap()
  useEffect(() => {
    if (!map) return
    const m = map.getMap()
    let cancelled = false

    const ensureLayers = () => {
      if (cancelled) return

      if (m.getSource("itinerary")) return

      const lines: [number, number][][][] = data.edges?.map(e =>
        e?.node.legs.map(l =>
          polyline.decode(l?.legGeometry?.points as string).map<[number, number]>(([lat, lng]) => [lng, lat])
        ) || []
      ) || []

      const bounds = lines.length > 0 && lines.flat(2).reduce((bounds, coord) => bounds.extend(coord), new LngLatBounds(lines[0][0][0], lines[0][0][1]))
      if (bounds) m.fitBounds(bounds, { padding: 100 })



      m.addSource("itinerary", { type: "geojson", data: { type: "FeatureCollection", features: generateGeoJSON(origin, destination, lines, data, selectedRoute) } })


      m.addLayer({
        id: "itinerary",
        source: "itinerary",
        filter: ["all", ["==", ["get", "type"], "itinerary"], ["!", ["get", "selected"]]],
        type: "line",
        paint: {
          "line-width": ["interpolate", ["exponential", 1.15], ["zoom"], 10, 4, 22, 12],
          "line-color": "#555",
        },
        layout: {
          "line-cap": "round",
          "line-join": "round"
        }
      })
      m.addLayer({
        id: "itinerary-walking",
        source: "itinerary",
        filter: ["all", ["==", ["get", "type"], "itinerary"], ["get", "walking"], ["get", "selected"]],
        type: "line",
        paint: {
          "line-width": ["interpolate", ["exponential", 1.15], ["zoom"], 10, 6, 22, 18],
          "line-color": "#777",
          "line-dasharray": [0, 1.5]
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        }
      })
      m.addLayer({
        id: "itinerary-selected",
        source: "itinerary",
        filter: ["all", ["==", ["get", "type"], "itinerary"], ["get", "selected"], ["!", ["get", "walking"]]],
        type: "line",
        paint: {
          "line-width": ["interpolate", ["exponential", 1.15], ["zoom"], 10, 6, 22, 18],
          "line-color": ["get", "color"],
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        }
      })
      m.addLayer({
        id: "stop-outline", type: "circle", source: "itinerary", filter: ["==", ["get", "type"], "itinerary-stop"], paint: {
          "circle-radius": [
            "interpolate",
            [
              "exponential",
              1.15
            ],
            [
              "zoom"
            ],
            10,
            4,
            22,
            8
          ],
          "circle-stroke-width": [
            "interpolate",
            [
              "exponential",
              1.15
            ],
            [
              "zoom"
            ],
            10,
            2,
            22,
            4
          ],
          "circle-stroke-color": "white",
        }
      })
      m.addLayer({
        id: "stop", type: "circle", source: "itinerary", filter: ["==", ["get", "type"], "itinerary-stop"], paint: {
          "circle-radius": [
            "interpolate",
            [
              "exponential",
              1.15
            ],
            [
              "zoom"
            ],
            10,
            4,
            22,
            8
          ],
          "circle-color": "white",
          "circle-stroke-color": ["get", "color"],
          "circle-stroke-width": [
            "interpolate",
            [
              "exponential",
              1.15
            ],
            [
              "zoom"
            ],
            10,
            2,
            22,
            4
          ],
        }
      })
      m.addLayer({
        id: "origin",
        source: "itinerary",
        filter: ["==", ["get", "type"], "origin"],
        type: "symbol",
        layout: {
          "icon-image": "pin_blue",
          "icon-size": ["interpolate", ["exponential", 1.15], ["zoom"], 1, 0.1, 22, 1],
          "icon-overlap": "always"
        }
      })
      m.addLayer({
        id: "destination",
        source: "itinerary",
        filter: ["==", ["get", "type"], "destination"],
        type: "symbol",
        layout: {
          "icon-image": "pin_red",
          "icon-size": ["interpolate", ["exponential", 1.15], ["zoom"], 1, 0.1, 22, 1],
          "icon-overlap": "always"
        }
      })

    }

    function cycle(i: number) {
      if (i > 1000) return
      if (m.loaded()) {
        ensureLayers()
      } else {
        setTimeout(() => cycle(i + 1), 10)
      }
    }
    cycle(0)

    return () => {
      cancelled = true
      if (!m.loaded()) return
      if (m.getLayer("origin")) m.removeLayer("origin")
      if (m.getLayer("stop")) m.removeLayer("stop")
      if (m.getLayer("stop-outline")) m.removeLayer("stop-outline")
      if (m.getLayer("destination")) m.removeLayer("destination")
      if (m.getLayer("itinerary")) m.removeLayer("itinerary")
      if (m.getLayer("itinerary-selected")) m.removeLayer("itinerary-selected")
      if (m.getLayer("itinerary-walking")) m.removeLayer("itinerary-walking")
      if (m.getSource("itinerary")) m.removeSource("itinerary")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  useEffect(() => {
    if (!map || !data.edges) return
    const m = map.getMap()


    const lines: [number, number][][][] = data.edges.map(e =>
      e?.node.legs.map(l =>
        polyline.decode(l?.legGeometry?.points as string).map<[number, number]>(([lat, lng]) => [lng, lat])
      ) || []
    )

    const bounds = lines.length > 0 && lines.flat(2).reduce((bounds, coord) => bounds.extend(coord), new LngLatBounds(lines[0][0][0], lines[0][0][1]))
    if (bounds) m.fitBounds(bounds, { padding: 100 })

    if (!m.getSource("itinerary")) return


    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: generateGeoJSON(origin, destination, lines, data, selectedRoute)
    }

      ; (m.getSource("itinerary") as GeoJSONSource).setData(geojson)
  }, [map, data, origin, destination, selectedRoute])
  return null
}
function generateGeoJSON(origin: PlanLabeledLocationInput, destination: PlanLabeledLocationInput, lines: [number, number][][][], data: { __typename: "PlanConnection"; edges: Array<{ __typename: "PlanEdge"; cursor: string; node: { __typename: "Itinerary"; start: unknown; end: unknown; waitingTime: unknown; walkDistance: number | null; walkTime: unknown; duration: unknown; numberOfTransfers: number; legs: Array<{ __typename: "Leg"; transitLeg: boolean | null; interlineWithPreviousLeg: boolean | null; duration: number | null; distance: number | null; mode: Mode | null; realTime: boolean | null; realtimeState: RealtimeState | null; start: { __typename: "LegTime"; scheduledTime: unknown; estimated: { __typename: "RealTimeEstimate"; delay: unknown; time: unknown } | null }; end: { __typename: "LegTime"; scheduledTime: unknown; estimated: { __typename: "RealTimeEstimate"; delay: unknown; time: unknown } | null }; trip: { __typename: "Trip"; pattern: { __typename: "Pattern"; code: string; directionId: number | null } | null; route: { __typename: "Route"; shortName: string | null; longName: string | null; gtfsId: string; mode: TransitMode | null; type: number | null } } | null; legGeometry: { __typename: "Geometry"; length: number | null; points: unknown } | null; from: { __typename: "Place"; lat: number; lon: number; name: string | null; viaLocationType: ViaLocationType | null; arrival: { __typename: "LegTime"; scheduledTime: unknown; estimated: { __typename: "RealTimeEstimate"; delay: unknown; time: unknown } | null } | null; departure: { __typename: "LegTime"; scheduledTime: unknown; estimated: { __typename: "RealTimeEstimate"; delay: unknown; time: unknown } | null } | null; stop: { __typename: "Stop"; name: string; platformCode: string | null; code: string | null; gtfsId: string; locationType: LocationType | null } | null }; to: { __typename: "Place"; lat: number; lon: number; name: string | null; viaLocationType: ViaLocationType | null; arrival: { __typename: "LegTime"; scheduledTime: unknown; estimated: { __typename: "RealTimeEstimate"; delay: unknown; time: unknown } | null } | null; departure: { __typename: "LegTime"; scheduledTime: unknown; estimated: { __typename: "RealTimeEstimate"; delay: unknown; time: unknown } | null } | null; stop: { __typename: "Stop"; name: string; platformCode: string | null; code: string | null; gtfsId: string; locationType: LocationType | null } | null } } | null> } } | null> | null }, selectedRoute: number | null): GeoJSON.Feature[] {
  return [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [origin.location.coordinate?.longitude as number || 0, origin.location.coordinate?.latitude as number || 0]
      },
      properties: { type: "origin" }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [destination.location.coordinate?.longitude as number || 0, destination.location.coordinate?.latitude as number || 0]
      },
      properties: { type: "destination" }
    },
    ...lines.flatMap<GeoJSON.Feature<GeoJSON.LineString | GeoJSON.Point>>((e, i) => {
      const edge = data.edges![i]
      const selected = i == selectedRoute
      return e.flatMap((l, j) => {
        const leg = edge?.node.legs![j]
        const stopLabels = []
        //if (selected && leg && (j == legs?.findIndex(l => l?.transitLeg) || leg?.trip?.route.type == 702)) stopLabels.push(leg.from)
        if (selected && leg && leg.transitLeg) {
          stopLabels.push(leg.to)
          stopLabels.push(leg.from)
        }
        return [
          ...stopLabels.map<GeoJSON.Feature<GeoJSON.Point>>(l => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [l.lon, l.lat] },
            properties: {
              type: "itinerary-stop",
              index: i,
              color: getColor(leg?.trip?.route.type || -1, leg?.trip?.route.mode || ""),
              selected: selected
            }
          })),
          {
            type: "Feature",
            geometry: { type: "LineString", coordinates: l },
            properties: {
              type: "itinerary",
              index: i,
              color: selected ? getColor(leg?.trip?.route.type || -1, leg?.trip?.route.mode || "") : "#777",
              selected: selected,
              walking: !(leg?.transitLeg)
            }
          }
        ]
      })
    })
  ]
}

