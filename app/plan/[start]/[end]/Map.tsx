"use client"
import { useMap } from "@vis.gl/react-maplibre"
import { PlanQueryQuery } from "./page.generated"
import { useEffect } from "react"
import { GeoJSONSource } from "maplibre-gl"
import { getColor, Mode } from "@/app/lib/digitransit"
import { PlanLabeledLocationInput } from "@/app/lib/__generated__/graphql"

export function Map({ data, selectedRoute = null, destination, origin }: { data: NonNullable<PlanQueryQuery["planConnection"]>, selectedRoute?: number | null, destination: PlanLabeledLocationInput, origin: PlanLabeledLocationInput }) {
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
      if (m.getLayer("origin")) m.removeLayer("origin")
      if (m.getLayer("destination")) m.removeLayer("destination")
      if (m.getLayer("itinerary")) m.removeLayer("itinerary")
      if (m.getSource("itinerary")) m.removeSource("itinerary")
    }

    function initMap() {
      if (!map) return;

      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection", features: [{
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [origin.location.coordinate?.longitude as number || 0, origin.location.coordinate?.latitude as number || 0]
          },
          properties: {
            type: "origin"
          }
        }, {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [destination.location.coordinate?.longitude as number || 0, destination.location.coordinate?.latitude as number || 0]
          },
          properties: {
            type: "destination"
          }
        }]
      }
      if (m.getSource<GeoJSONSource>("itinerary")) {
        m.getSource<GeoJSONSource>("itinerary")!.setData(geojson)
      } else {
        m.addSource("itinerary", { type: "geojson", data: geojson })
        m.addLayer({
          id: "origin",
          source: "itinerary",
          filter: ["==", ["get", "type"], "origin"],
          type: "symbol",
          layout: {
            "icon-image": "pin_blue",
            "icon-size": 25,
            "icon-overlap": "always"
          }
          
        })
        /*  m.addLayer({
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
         }) */
      }
    }
  }, [map, data])

  return null
}
