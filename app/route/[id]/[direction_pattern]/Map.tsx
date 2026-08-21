"use client"
import { useMap } from "@vis.gl/react-maplibre"
import { PatternQueryQuery } from "./page.generated"
import { useEffect, useState } from "react"
import { GeoJSONSource, LngLatBounds } from "maplibre-gl"
import polyline from "@mapbox/polyline"
import { getColor, VPos } from "@/app/lib/digitransit"
import { redirect } from "next/navigation"
import { useSubscription } from "mqtt-react-hooks"
import { useIsHsl } from "@/app/hooks/useHsl"

export function Map({ data, direction, routeId }: { data: NonNullable<PatternQueryQuery["pattern"]>, direction?: number, routeId: string }) {
  const { default: map } = useMap()
  const isHsl = useIsHsl()

  const [vPosCache, setVposCache] = useState<VPos[]>([])

  const { message } = useSubscription(isHsl ? 
    `/hfp/v2/journey/ongoing/vp/+/+/+/${decodeURIComponent(routeId).split(":")[1]}/${direction ? direction + 1 : "+"}/#` : 
    `/gtfsrt/vp/${decodeURIComponent(routeId).split(":")[0]}/+/+/+/${decodeURIComponent(routeId).split(":")[1]}/${direction || "+"}/#`)
  useEffect(() => {
    if (!map) return
    const m = map.getMap()
    let cancelled = false

    const color = getColor(data.route.type || -1, data.route.mode || "")

    const ensureLayers = () => {
      if (cancelled) return
      if (m.getSource("route")) return

      const line: [number, number][] = polyline.decode(data.patternGeometry?.points as string).map<[number, number]>(([lat, lng]) => [lng, lat])
      const bounds = line.reduce((bounds, coord) => bounds.extend(coord), new LngLatBounds(line[0], line[0]))
      if (bounds) m.fitBounds(bounds, { padding: 40 })



      m.addSource("route", { type: "geojson", data: { type: "FeatureCollection", features: generateGeoJSON(data, []) } })

      m.addLayer({
        id: "route", type: "line", source: "route", filter: ["==", ["get", "type"], "route"], paint: {
          "line-width": [
            "interpolate",
            [
              "exponential",
              1.15
            ],
            [
              "zoom"
            ],
            10,
            5,
            22,
            15
          ],
          "line-color": color
        }
      })


      m.addLayer({
        id: "stop-outline", type: "circle", source: "route", filter: ["==", ["get", "type"], "stop"], paint: {
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
            5,
            22,
            10
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
      }).on("click", (e) => {
        const pxBoxSize = 4
        const feats = m.queryRenderedFeatures([
          [e.point.x - pxBoxSize, e.point.y - pxBoxSize],
          [e.point.x + pxBoxSize, e.point.y + pxBoxSize]
        ], {
          layers: ["stop"]
        })
        if (!feats[0]) return
        redirect(`/stop/${feats[0].properties.id}`)
      })
      m.addLayer({
        id: "stop", type: "circle", source: "route", filter: ["==", ["get", "type"], "stop"], paint: {
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
          "circle-stroke-color": color,
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
        id: "vehicle-outline", type: "circle", source: "route", filter: ["==", ["get", "type"], "vehicle"], paint: {
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
        id: "vehicle", type: "circle", source: "route", filter: ["==", ["get", "type"], "vehicle"], paint: {
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
          "circle-stroke-color": color,
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
        id: "vehicle-text", type: "symbol", source: "route", filter: ["==", ["get", "type"], "vehicle"], paint: {
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
      if (m.getLayer("route")) m.removeLayer("route")
      if (m.getLayer("stop")) m.removeLayer("stop")
      if (m.getLayer("stop-outline")) m.removeLayer("stop-outline")
      if (m.getLayer("vehicle")) m.removeLayer("vehicle")
      if (m.getLayer("vehicle-outline")) m.removeLayer("vehicle-outline")
      if (m.getLayer("vehicle-text")) m.removeLayer("vehicle-text")
      if (m.getSource("route")) m.removeSource("route")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  useEffect(() => {
    if (!map || !data) return
    const m = map.getMap()

    let vPos: GeoJSON.Feature<GeoJSON.Point, { type: "vehicle", text_size: number } & VPos>[] = []

    try {
      if (isHsl) {
        const data: { VP?: { lat: number, long: number, oper: number, desi: string, veh: number } } | undefined = JSON.parse(message?.message?.toString() as string)
        if (!data || !data.VP) return
        const veh = { id: `${data.VP.oper}${data.VP.veh}`, lat: data.VP.lat, lng: data.VP.long, name: data.VP.desi }
        const newVPos: VPos[] = [...vPosCache.filter(v => v.id != veh.id), veh]
        vPos = newVPos.map<GeoJSON.Feature<GeoJSON.Point, { type: "vehicle", text_size: number } & VPos>>(v => ({ geometry: { type: "Point", coordinates: [v.lng, v.lat] }, properties: { ...v, type: "vehicle", text_size: textSize(v.name.length) }, type: "Feature" })).sort((a, b) => Number(a.properties.id) - Number(b.properties.id))
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVposCache(newVPos)
      } else {
        console.log(message)
        /* const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
          new Uint8Array(buffer)
        );
        feed.entity.forEach((entity) => {
          if (entity.tripUpdate) {
            console.log(entity.tripUpdate);
          }
        }); */
      }
    } catch {
      return
    }



    if (!m.getSource("route")) return


    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: generateGeoJSON(data, vPos)
    }

      ; (m.getSource("route") as GeoJSONSource).setData(geojson)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, data, message])
  return null
}
function generateGeoJSON(data: NonNullable<PatternQueryQuery["pattern"]>, vPos: GeoJSON.Feature[]): GeoJSON.Feature[] {
  const line: [number, number][] = polyline.decode(data.patternGeometry?.points as string).map<[number, number]>(([lat, lng]) => [lng, lat])

  return [...vPos, {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: line
    },
    properties: {
      type: "route"
    }
  }, ...(data.stops?.map((s) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [s.lon || 0, s.lat || 0]
    },
    properties: {
      type: "stop",
      name: s.name,
      id: s.gtfsId
    }
  }) as GeoJSON.Feature) || [])
  ]
}

function textSize(length: number) {
  switch (length) {
    case 1:
      return 20
    case 2:
      return 16
    case 3:
      return 12
    case 4:
      return 10
    case 5:
      return 8
    default:
      return 20
  }
}

