"use client"
import { useMap } from "@vis.gl/react-maplibre"
import { PlanQueryQuery } from "./page.generated"
import { useEffect } from "react"
import { GeoJSONSource } from "maplibre-gl"
import { getColor, Mode } from "@/app/lib/digitransit"

export function Map({ data }: { data: NonNullable<PlanQueryQuery["planConnection"]> }) {
  const { default: map } = useMap()
  useEffect(() => {
    if (!map) return
    const m = map.getMap()
    function loop(i: number) {
      if (i > 1000) return
      if (m.loaded()) {
        initMap()
      } else {
        setTimeout(() => loop(i + 1), 100)
      }
    }

    loop(0)
    return () => {
      if (m.getLayer("stop")) m.removeLayer("stop")
      if (m.getLayer("stop-outline")) m.removeLayer("stop-outline")
      if (m.getSource("stop")) m.removeSource("stop")
    }

    function initMap() {
      if (!map) return;
      
      /* const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection", features: [{
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [data.lon || 0, data.lat || 0]
          },
          properties: {
            type: "stop"
          }
        }]
      }
      if (m.getSource<GeoJSONSource>("stop")) {
        m.getSource<GeoJSONSource>("stop")!.setData(geojson)
      } else {
        m.addSource("stop", { type: "geojson", data: geojson })
        m.addLayer({
          id: "stop-outline", type: "circle", source: "stop", filter: ["==", ["get", "type"], "stop"], paint: {
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
              8,
              22,
              36
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
              5,
              22,
              10
            ],
            "circle-stroke-color": "white",
          }
        })
        m.addLayer({
          id: "stop", type: "circle", source: "stop", filter: ["==", ["get", "type"], "stop"], paint: {
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
              6,
              22,
              30
            ],
            "circle-color": "white",
            "circle-stroke-color": getColor(-1, data.vehicleMode as Mode),
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
              5,
              22,
              10
            ],
          }
        })
      } */
      return () => {
        if (m.getLayer("stop")) m.removeLayer("stop")
        if (m.getLayer("stop-outline")) m.removeLayer("stop-outline")
        if (m.getSource("stop")) m.removeSource("stop")
      }
    }
  }, [map, data])

  return null
}
