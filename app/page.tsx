"use client"

import { LngLat } from "maplibre-gl"

import InputField, { Suggestion } from './components/inputfield';
import { useEffect, useState } from 'react';
import { useMap } from "@vis.gl/react-maplibre";
import { Sidebar } from "./mapcontext";
import { useIsHsl } from './hooks/useHsl';
import { SearchW700 as Search } from '@material-symbols-svg/react/icons/search';
import { searchRoutes, searchStopsStations } from './lib/searchStopsStations';
import { getRouteColor, IconTable } from './lib/digitransit';
import Label from './components/label';
import MiniSearch from 'minisearch';
import { redirect } from 'next/navigation';
import RoutingUi from './components/RoutingUi';


export default function Home() {


  const [search, setSearch] = useState<SearchSuggestion | null>(null)
  const { default: map } = useMap()

  const isHsl = useIsHsl()

  useEffect(() => {
    if (!search || !search.properties) return
    redirect(`${search.properties.type}/${search.properties.gtfsId}/${isHsl ? "?hsl" : ""}`)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  return (
    <>


      <RoutingUi />

      <Sidebar>
        <h2 className='text-2xl mt-4'>Stations and routes</h2>
        <InputField name='search' suggestionFunction={(t) => searchStopStation(t, isHsl, map?.getCenter() || new LngLat(24.94, 60.18))} onValueSet={(_t, v) => setSearch(typeof v == "string" ? null : v)} icon={<Search className='text-black'></Search>}></InputField>
      </Sidebar>

    </>
  );
}

export type SearchSuggestion = Suggestion<{ type: "stop" | "station" | "route", gtfsId: string }>

const miniSearch = new MiniSearch<SearchSuggestion>({ fields: ["text"], storeFields: ["icon", "id", "name", "desc", "properties"] })
let searchIndex = 0


async function searchStopStation(text: string, isHsl: boolean, focusPoint: LngLat): Promise<SearchSuggestion[]> {
  searchIndex++
  const index = searchIndex
  miniSearch.removeAll()
  if (text.length < 1) return []
  const [routes, stops] = await Promise.all([await searchRoutes(text, isHsl), await searchStopsStations(text, isHsl, focusPoint.toArray())])
  if (!routes || !stops) return []

  const regex = /GTFS:((?:.*)\:(?:\d|[A-Z]|\Ä|\Ö|\Å|_|-)+)/

  const parsed = [
    ...stops.features.map<SearchSuggestion>(s => ({
      icon: IconTable[s.properties.addendum?.GTFS.modes?.reduce((_p, c) => c) || "BUS"], id: `s${s.properties.gid}${s.properties.id}`, text: s.properties.name || "unnamed route", name: <span>
        <span className='ml-1 truncate mr-2'>{s.properties.name}</span>
        {s.properties.addendum?.GTFS.code && <Label>{s.properties.addendum.GTFS.code}</Label>}
        {s.properties.addendum?.GTFS.platform && <Label>{s.properties.addendum.GTFS.platform}</Label>}
      </span>,
      properties: {
        gtfsId: (regex.exec(s.properties.source_id) || [0, ""])[1],
        type: s.properties.layer == "station" ? "station" : "stop"
      }
    })),
    ...routes.map<SearchSuggestion>(r => {
      const [feed, routeId, direction, patternId] = r?.patterns![0]?.code.split(":") || []
      return {
        icon: IconTable[r?.mode || "BUS"], id: `r${r?.gtfsId}`, text: r?.shortName || "" + r?.longName || "", name: <span>
          {r?.shortName && <Label className={`${getRouteColor("bg", r?.type || -1, r?.mode || "")} font-bold text-white`}>{r?.shortName}</Label>}
          <span className='ml-1 truncate mr-2'>{r?.longName}</span>
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


