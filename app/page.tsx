"use client"

import { LocationOn, Map as MapIcon } from "@material-symbols-svg/react/w700"
import 'maplibre-gl/dist/maplibre-gl.css';

import InputField, { Suggestion } from './components/inputfield';
import { useState } from 'react';
import { LngLat, Map, useMap } from "@vis.gl/react-maplibre";
import { search } from "./lib/search";

export default function Home() {
  const [origin, setOrigin] = useState<PlaceSuggestion | null>(null)
  const [destination, setDestination] = useState<PlaceSuggestion | null>(null)
  const {current: map} = useMap()

  return (
    <main className="w-full h-full flex md:flex-row overflo-scroll">
      <div className="absolute bottom-0 left-5 right-5 md:h-40 z-100 bg-white rounded-t-2xl shadow-[0_0_10px_#0008] p-4 flex flex-col gap-2
       md:static md:h-full md:w-160 md:rounded-none">
        <h1 className='text-black'><img src="/logo_full.svg" alt="Hekinav Logo" /></h1>
        <InputField suggestionFunction={(t) => placeSearch(t, map?.getCenter() || {lng: 24.94, lat: 60.18} as LngLat)} onlySuggestions placeholder='Origin' name='origin' onValueSet={(t,v) => setOrigin(typeof v == "string" ? null : v)} icon={<LocationOn className='text-blue'></LocationOn>}></InputField>
        <InputField suggestionFunction={(t) => placeSearch(t, map?.getCenter() || {lng: 24.94, lat: 60.18} as LngLat)} onlySuggestions placeholder='Destination' name='destination' onValueSet={(t,v) => setDestination(typeof v == "string" ? null : v)} icon={<LocationOn className='text-red'></LocationOn>}></InputField>
      </div>
      <Map
        initialViewState={{
          longitude: 24.94,
          latitude: 60.18,
          zoom: 13
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="/map_style.json"
      />
    </main>
  );
}

export type PlaceSuggestion = Suggestion<{}>

async function placeSearch(text: string, focusPoint: LngLat): Promise<PlaceSuggestion[]> {
  console.log(text)
  if (text.length <= 1) {
    return [{
      icon: (<MapIcon></MapIcon>),
      text: "Choose on map",
      id: "choose_on_map"
    }]
  } else {
    const result = await search(text, focusPoint)
    return result
  }
}
