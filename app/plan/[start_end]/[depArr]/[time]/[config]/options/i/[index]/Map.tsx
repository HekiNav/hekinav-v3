"use client"
import { useMap } from "@vis.gl/react-maplibre"
import { useEffect, useState } from "react"
import { GeoJSONSource, LngLatBounds } from "maplibre-gl"
import { getColor, VPos } from "@/app/lib/digitransit"
import { PlanLabeledLocationInput, PlanVisitViaLocationInput } from "@/app/lib/__generated__/graphql"
import polyline from "@mapbox/polyline"
import { useIsHsl } from "@/app/hooks/useHsl"
import { textSize } from "@/app/route/[id]/[direction_pattern]/Map"
import { Edge } from "../../provider"
import { useSubscription } from "@/app/hooks/useMQTT"
import GtfsRealtimeBindings from "gtfs-realtime-bindings"

export function Map({ data, selectedRoute, destination, origin, via }: { data: Edge[], selectedRoute: number, destination: PlanLabeledLocationInput, origin: PlanLabeledLocationInput, via: PlanVisitViaLocationInput[] }) {
  const { default: map } = useMap()

  const isHsl = useIsHsl()

  const [vPosCache, setVposCache] = useState<VPos[]>([])

  const { message } = useSubscription(isHsl ?
    data[selectedRoute]?.legs.reduce<string[]>((p, c) => !c.transitLeg ? p : [...p, `/hfp/v2/journey/ongoing/vp/+/+/+/${(c.route?.gtfsId || "").split(":")[1]}/${typeof c.pattern?.directionId == "number" ? c.pattern.directionId + 1 : "+"}/+/${c.tripStartTime}/#`], []) || [] :
    data[selectedRoute]?.legs.reduce<string[]>((p, c) => !c.transitLeg ? p : [...p, `/gtfsrt/vp/${(c.tripId || "").split(":")[0]}/+/+/+/+/+/+/${(c.tripId || "").split(":")[1]}/#`], []) || []
  )
  useEffect(() => {
    if (!map) return
    const m = map.getMap()
    let cancelled = false

    const ensureLayers = () => {
      if (cancelled) return
      if (m.getSource("itinerary-s")) return

      const lines: [number, number][][] = data[selectedRoute].legs.map(l =>
        polyline.decode(l?.legGeometry?.points as string).map<[number, number]>(([lat, lng]) => data[selectedRoute].source == "DIGITRANSIT" ? [lng, lat] : [lng / 10, lat / 10])
      ) || []
      const bounds = lines.length > 0 && lines.flat().reduce((bounds, coord) => bounds.extend(coord), new LngLatBounds(lines[0][0], lines[0][1]))
      if (bounds) m.fitBounds(bounds, { padding: 100 })



      m.addSource("itinerary-s", { type: "geojson", data: { type: "FeatureCollection", features: generateGeoJSON(origin, destination, via, [], lines, data, selectedRoute) } })

      m.addLayer({
        id: "itinerary-s-walking",
        source: "itinerary-s",
        filter: ["all", ["==", ["get", "type"], "itinerary-s"], ["get", "walking"]],
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
        id: "itinerary-s",
        source: "itinerary-s",
        filter: ["all", ["==", ["get", "type"], "itinerary-s"], ["!", ["get", "walking"]]],
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
        id: "stop-outline", type: "circle", source: "itinerary-s", filter: ["==", ["get", "type"], "itinerary-s-stop"], paint: {
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
        id: "stop", type: "circle", source: "itinerary-s", filter: ["==", ["get", "type"], "itinerary-s-stop"], paint: {
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
        source: "itinerary-s",
        filter: ["==", ["get", "type"], "origin"],
        type: "symbol",
        layout: {
          "icon-image": "pin_blue",
          "icon-size": ["interpolate", ["exponential", 1.15], ["zoom"], 1, 0.1, 22, 1],
          "icon-overlap": "always",
          "icon-anchor": "bottom"
        }
      })
      m.addLayer({
        id: "via",
        source: "itinerary-s",
        filter: ["==", ["get", "type"], "via"],
        type: "symbol",
        layout: {
          "icon-image": "pin_darkgray",
          "icon-size": ["interpolate", ["exponential", 1.15], ["zoom"], 1, 0.1, 22, 1],
          "icon-overlap": "always",
          "icon-anchor": "bottom"
        }
      })
      m.addLayer({
        id: "destination",
        source: "itinerary-s",
        filter: ["==", ["get", "type"], "destination"],
        type: "symbol",
        layout: {
          "icon-image": "pin_red",
          "icon-size": ["interpolate", ["exponential", 1.15], ["zoom"], 1, 0.1, 22, 1],
          "icon-overlap": "always",
          "icon-anchor": "bottom"
        }
      })
      m.addLayer({
        id: "vehicle-outline", type: "circle", source: "itinerary-s", filter: ["==", ["get", "type"], "vehicle"], paint: {
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
            16,
            22,
            42
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
            4,
            22,
            8
          ],
          "circle-stroke-color": "white",
        }
      })

      m.addLayer({
        id: "vehicle", type: "circle", source: "itinerary-s", filter: ["==", ["get", "type"], "vehicle"], paint: {
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
            14,
            22,
            32
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
            4,
            22,
            16
          ],
        }
      })
      m.addLayer({
        id: "vehicle-text", type: "symbol", source: "itinerary-s", filter: ["==", ["get", "type"], "vehicle"], paint: {
          "text-color": "#111"
        },
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Host Grotesk Bold"],
          "text-size": ["get", "text_size"],
          "text-overlap": "cooperative"
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
      if (m.getLayer("origin")) m.removeLayer("origin")
      if (m.getLayer("stop")) m.removeLayer("stop")
      if (m.getLayer("stop-outline")) m.removeLayer("stop-outline")
      if (m.getLayer("destination")) m.removeLayer("destination")
      if (m.getLayer("via")) m.removeLayer("via")
      if (m.getLayer("itinerary-s")) m.removeLayer("itinerary-s")
      if (m.getLayer("itinerary-s-walking")) m.removeLayer("itinerary-s-walking")
      if (m.getLayer("vehicle")) m.removeLayer("vehicle")
      if (m.getLayer("vehicle-outline")) m.removeLayer("vehicle-outline")
      if (m.getLayer("vehicle-text")) m.removeLayer("vehicle-text")
      if (m.getSource("itinerary-s")) m.removeSource("itinerary-s")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  useEffect(() => {
    if (!map || !data) return
    const m = map.getMap()

    const lines: [number, number][][] = data[selectedRoute]?.legs.map(l =>
      polyline.decode(l?.legGeometry?.points as string).map<[number, number]>(([lat, lng]) => data[selectedRoute].source == "DIGITRANSIT" ? [lng, lat] : [lng / 10, lat / 10])
    ) || []

    if (!m.getSource("itinerary-s")) return

    let vPos: GeoJSON.Feature<GeoJSON.Point, { type: "vehicle", text_size: number, color: string } & VPos>[] = []

    try {
      if (isHsl) {
        const msg: { VP?: { lat: number, long: number, oper: number, desi: string, veh: number, seq: number } } | undefined = JSON.parse(message?.message?.toString() as string)
        if (!msg || !msg.VP) return

        const route = data[selectedRoute].legs.find(l => (l?.transitLeg && l.route?.shortName) == (msg.VP?.desi || "-"))?.route

        const veh = { id: `${msg.VP.oper}${msg.VP.veh}`, lat: msg.VP.lat, lng: msg.VP.long, name: msg.VP.desi, color: getColor(route?.type || -1, route?.mode || "") }
        const newVPos: VPos[] = [...vPosCache.filter(v => v.id != veh.id), veh]
        vPos = newVPos.map<GeoJSON.Feature<GeoJSON.Point, { type: "vehicle", text_size: number, color: string } & VPos>>(v => ({ geometry: { type: "Point", coordinates: [v.lng, v.lat] }, properties: { ...v, type: "vehicle", text_size: textSize(Math.max(...v.name.split("\n").map(e => e.length))) * (v.name.split("\n").length ? 0.75 : 1) }, type: "Feature" })).sort((a, b) => Number(a.properties.id) - Number(b.properties.id))
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVposCache(newVPos)
      } else {
        if (!message?.payload) return
        const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(message?.payload);
        feed.entity.forEach((entity) => {
          if (!entity.vehicle) return
          const route = data[selectedRoute].legs.find(l => l.route?.gtfsId.split(":")[1] == entity.vehicle?.trip?.routeId)?.route

          const veh = { id: `${entity.vehicle.vehicle?.id}${entity.vehicle.trip?.tripId}`, lat: entity.vehicle.position?.latitude || 0, lng: entity.vehicle.position?.longitude || 0, name: (route?.shortName || route?.longName || "").replaceAll(" ","\n"), color: getColor(route?.type || -1, route?.mode || "") }
          const newVPos: VPos[] = [...vPosCache.filter(v => v.id != veh.id), veh]
          vPos = newVPos.map<GeoJSON.Feature<GeoJSON.Point, { type: "vehicle", text_size: number, color: string } & VPos>>(v => ({ geometry: { type: "Point", coordinates: [v.lng, v.lat] }, properties: { ...v, type: "vehicle", text_size: textSize(Math.max(...v.name.split("\n").map(e => e.length))) * (v.name.split("\n").length ? 0.75 : 1) }, type: "Feature" })).sort((a, b) => Number(a.properties.id) - Number(b.properties.id))
          setVposCache(newVPos)
        });
      }
    } catch {
      return
    }


    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: generateGeoJSON(origin, destination, via, vPos, lines, data, selectedRoute)
    }

      ; (m.getSource("itinerary-s") as GeoJSONSource).setData(geojson)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, data, origin, destination, selectedRoute, message, isHsl])
  return null
}
function generateGeoJSON(origin: PlanLabeledLocationInput, destination: PlanLabeledLocationInput, via: PlanVisitViaLocationInput[], vPos: GeoJSON.Feature[], lines: [number, number][][], data: Edge[], selectedRoute: number): GeoJSON.Feature[] {
  return [
    ...vPos,
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
    ...via.map<GeoJSON.Feature>(e => ({
      type: "Feature" as const,
      geometry: {
        type: "Point",
        coordinates: [e.coordinate?.longitude as number || 0, e.coordinate?.latitude as number || 0]
      },
      properties: { type: "via" }
    })),
    ...lines.flatMap<GeoJSON.Feature>((l, i) => {
      const legs = data[selectedRoute]?.legs
      const leg = legs![i]
      const stopLabels = []
      //if (leg && (i == legs?.findIndex(l => l?.transitLeg) || leg?.trip?.route.type == 702)) stopLabels.push(leg.from)
      if (leg && leg.transitLeg) {
        stopLabels.push(leg.to)
        stopLabels.push(leg.from)
      }
      return [
        ...stopLabels.map<GeoJSON.Feature<GeoJSON.Point>>(l => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [l.lng, l.lat] },
          properties: {
            type: "itinerary-s-stop",
            index: i,
            color: getColor(leg.route?.type || -1, leg.route?.mode || ""),
          }
        })),
        {
          type: "Feature",
          geometry: { type: "LineString", coordinates: l },
          properties: {
            type: "itinerary-s",
            index: i,
            color: getColor(leg.route?.type || -1, leg.route?.mode || ""),
            walking: !(leg?.transitLeg)
          }
        }
      ]
    })
  ]
}

