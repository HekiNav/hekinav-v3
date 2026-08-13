"use client"
import { useMap } from "@vis.gl/react-maplibre"
import { PatternQueryQuery } from "./page.generated"
import { useEffect } from "react"
import { GeoJSONSource, LngLatBounds } from "maplibre-gl"
import polyline from "@mapbox/polyline"
import { getColor } from "@/app/lib/digitransit"
import { redirect } from "next/navigation"

export function Map({ data }: { data: NonNullable<PatternQueryQuery["pattern"]> }) {
  const { default: map } = useMap()
  useEffect(() => {
    if (!map) return
    const m = map.getMap()
    if (m.loaded()) {
      initMap()
    } else {
      setTimeout(() => initMap(),100)
    }
    return () => {
      if (m.getLayer("route")) m.removeLayer("route")
      if (m.getLayer("stop")) m.removeLayer("stop")
      if (m.getLayer("stop-outline")) m.removeLayer("stop-outline")
      if (m.getSource("route")) m.removeSource("route")
    }

    function initMap() {
      if (!map) return;

      const line: [number, number][] = polyline.decode(data.patternGeometry?.points as string).map(([lat, lng]) => [lng, lat])

      const bounds = line.reduce((bounds, coord) => {
        return bounds.extend(coord)
      }, new LngLatBounds(line[0], line[0]))

      m.fitBounds(bounds, { padding: 100 })

      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection", features: [{
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
      if (m.getSource<GeoJSONSource>("route")) {
        m.getSource<GeoJSONSource>("route")!.setData(geojson)
      } else {
        m.addSource("route", { type: "geojson", data: geojson })
        const color = getColor(data.route.type || -1, data.route.mode || "")
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

      }
    }
  }, [data.patternGeometry?.points, data.route.mode, data.route.type, data.stops, map])

  return null
}
