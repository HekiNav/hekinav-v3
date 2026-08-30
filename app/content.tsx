"use client"

import { LngLat } from "maplibre-gl"

import InputField, { Suggestion } from './components/inputfield';
import { ReactNode, Suspense, useContext, useEffect, useState, useTransition } from 'react';
import { useMap } from "@vis.gl/react-maplibre";
import { Sidebar } from "./mapcontext";
import { useIsHsl } from './hooks/useHsl';
import { SearchW700 as Search } from '@material-symbols-svg/react/icons/search';
import { searchRoutes, searchStopsStations } from './lib/searchStopsStations';
import { getRouteColor, IconTable } from './lib/digitransit';
import Label from './components/label';
import MiniSearch from 'minisearch';
import { useRouter } from 'next/navigation';
import RoutingUi from './components/RoutingUi';
import { Metadata } from "next";
import Icon from "./components/icon";
import { StarFillW700, StarW700 } from "@material-symbols-svg/react/icons/star";
import { ConfigContext, HekinavConfig, SetHekinavConfigKey } from "./HekinavConfig";
import getFavourites from "./favourites";

export const metadata: Metadata = {
  title: "Hekinav Routing",
  description: "Hekinav Routing",
};


export default function HomeContent() {


  const [search, setSearch] = useState<SearchSuggestion | null>(null)
  const { default: map } = useMap()

  const { config, setConfig } = useContext(ConfigContext)

  const isHsl = useIsHsl()

  const router = useRouter()

  useEffect(() => {
    if (!search || !search.properties) return
    router.push(`${search.properties.type}/${search.properties.gtfsId}/${isHsl ? "?hsl" : ""}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])


  useEffect(() => {
    console.log(config)
  }, [config])


  return (
    <>


      <RoutingUi />

      <Sidebar>
        <h2 className='text-2xl mt-4'>Stations and routes</h2>
        <InputField name='search' suggestionFunction={(t) => searchStopStation(t, isHsl, map?.getCenter() || new LngLat(24.94, 60.18), config, setConfig)} onValueSet={(_t, v) => setSearch(typeof v == "string" ? null : v)} icon={<Search className='text-black'></Search>}></InputField>
        <h2 className='text-2xl mt-4'>Favourites</h2>
        <Favourites config={config} isHsl={isHsl} setConfig={setConfig}></Favourites>
      </Sidebar>
    </>
  );
}
function Favourites({ isHsl, config, setConfig }: { isHsl: boolean; config: HekinavConfig, setConfig: SetHekinavConfigKey }) {
  const [data, setData] = useState<null | { id: string, content: ReactNode, type: "stop" | "route" | "station" }[]>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    console.log(config)
    startTransition(async () => {
      const result = await getFavourites(config.favourites, isHsl);
      setData(result);
    });
  }, [config, isHsl]);

  if (isPending || !data) return "Loading favourites";
  return data.length ? (<div className="w-full rounded-xl flex flex-col gap-1 p-2 border-3 overflow-hidden">{data.map(({ content, id, type }) =>
    <div key={id} className="w-full flex flex-row flex-nowrap overflow-hidden items-start">
      {content}
      <Icon onClick={() => {
        console.log(config.favourites.routes.filter(r => r != id), config.favourites.routes)
        if (type == "route") setConfig(config.favourites.routes.filter(r => r != id), ["favourites", "routes"])
        if (type == "stop") setConfig(config.favourites.stops.filter(r => r != id), ["favourites", "stops"])
        if (type == "station") setConfig(config.favourites.stations.filter(r => r != id), ["favourites", "stations"])
      }} className="ml-auto cursor-pointer"><StarFillW700 className="text-yellow hover:text-black"></StarFillW700></Icon>
    </div>
  )}</div>) : "No favourites yet"
}

export type SearchSuggestion = Suggestion<{ type: "stop" | "station" | "route", gtfsId: string }>

const miniSearch = new MiniSearch<SearchSuggestion>({ fields: ["text"], storeFields: ["icon", "id", "name", "desc", "properties"] })
let searchIndex = 0


async function searchStopStation(text: string, isHsl: boolean, focusPoint: LngLat, config: HekinavConfig, setConfig: SetHekinavConfigKey): Promise<SearchSuggestion[]> {
  searchIndex++
  const index = searchIndex
  miniSearch.removeAll()
  if (text.length < 1) return []
  const [routes, stops] = await Promise.all([await searchRoutes(text, isHsl), await searchStopsStations(text, isHsl, focusPoint.toArray())])
  if (!routes || !stops) return []

  const regex = /GTFS:((?:.*)\:(?:\d|[A-Z]|\Ä|\Ö|\Å|_|-)+)/

  const parsed = [
    ...stops.features.map<SearchSuggestion>(s => ({
      icon: IconTable[s.properties.addendum?.GTFS.modes?.reduce((_p, c) => c) || "BUS"], id: `s${s.properties.gid}${s.properties.id}`, text: s.properties.name || "unnamed route", name: <span className="w-full items-center flex flex-row flex-nowrap overflow-hidden">
        <span className='ml-1 truncate mr-2'>{s.properties.name}</span>
        {s.properties.addendum?.GTFS.code && <Label>{s.properties.addendum.GTFS.code}</Label>}
        {s.properties.addendum?.GTFS.platform && <Label>{s.properties.addendum.GTFS.platform}</Label>}
        <Icon onMouseDownCapture={(e) => {
          const id = (regex.exec(s.properties.source_id) || [0, ""])[1];
          e.stopPropagation();
          e.preventDefault();
          if (s.properties.layer == "stop") setConfig(config.favourites.stops.every(f => id != f) ? [...config.favourites.stops, id] : config.favourites.stops.filter(f => id != f), ["favourites", "stops"])
          if (s.properties.layer == "station") setConfig(config.favourites.stations.every(f => id != f) ? [...config.favourites.stations, id] : config.favourites.stations.filter(f => id != f), ["favourites", "stations"])
        }} className="ml-auto cursor-pointer">{[...config.favourites.stops, ...config.favourites.stations].every(f => (regex.exec(s.properties.source_id) || [0, ""])[1] != f) ? <StarW700 className="hover:text-yellow"></StarW700> : <StarFillW700 className="text-yellow"></StarFillW700>}</Icon>
      </span>,
      properties: {
        gtfsId: (regex.exec(s.properties.source_id) || [0, ""])[1],
        type: s.properties.layer == "station" ? "station" : "stop"
      }
    })),
    ...routes.map<SearchSuggestion>(r => {
      const [feed, routeId, direction, patternId] = r?.patterns![0]?.code.split(":") || []
      return {
        icon: IconTable[r?.mode || "BUS"], id: `r${r?.gtfsId}`, text: r?.shortName || "" + r?.longName || "", name: <span className="w-full items-center flex flex-row flex-nowrap overflow-hidden">
          {r?.shortName && <Label className={`${getRouteColor("bg", r?.type || -1, r?.mode || "")} font-bold text-white`}>{r?.shortName}</Label>}
          <span className='ml-1 truncate mr-2 shrink'>{r?.longName}</span>
          <Icon onMouseDownCapture={(e) => { e.stopPropagation(); e.preventDefault(); setConfig(config.favourites.routes.every(f => r?.gtfsId != f) ? [...config.favourites.routes, r?.gtfsId] : config.favourites.routes.filter(f => r?.gtfsId != f), ["favourites", "routes"]) }} className="ml-auto cursor-pointer">{config.favourites.routes.every(f => r?.gtfsId != f) ? <StarW700 className="hover:text-yellow"></StarW700> : <StarFillW700 className="text-yellow hover:text-black"></StarFillW700>}</Icon>
        </span>,
        desc: !isHsl ? r?.agency?.name : undefined,
        properties: {
          type: "route",
          gtfsId: `${feed || r?.gtfsId.split(":")[1]}:${routeId || r?.gtfsId.split(":")[1]}/${direction || ""}-${patternId || ""}`
        }
      }
    })
  ]
  if (index < searchIndex) {
    return []
  }
  await miniSearch.addAllAsync(parsed)
  const results = miniSearch.search(text, { fuzzy: 0.8 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return results as any
}


