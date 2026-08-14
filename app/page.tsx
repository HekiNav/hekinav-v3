"use client"

import { CalendarTodayW700 as CalendarToday } from '@material-symbols-svg/react/icons/calendar-today';
import { LocationOnW700 as LocationOn } from '@material-symbols-svg/react/icons/location-on';
import { MapW700 as MapIcon } from '@material-symbols-svg/react/icons/map';
import { MyLocationW700 as MyLocation } from '@material-symbols-svg/react/icons/my-location';
import { NotListedLocationW700 as NotListedLocation } from '@material-symbols-svg/react/icons/not-listed-location';
import { ScheduleW700 as Schedule } from '@material-symbols-svg/react/icons/schedule';
import { LngLat } from "maplibre-gl"

import InputField, { Suggestion } from './components/inputfield';
import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { useMap } from "@vis.gl/react-maplibre";
import { search } from "./lib/search";
import Icon from "./components/icon";
import reverseGeocode from "./lib/geocoding";
import toast from "react-hot-toast";
import Button from "./components/button";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns-tz";
import { isToday, isTomorrow } from "date-fns";
import { MapOverlay, Sidebar } from "./mapcontext";
import { FocusContext } from './FocusContext';
import { useIsHsl } from './hooks/useHsl';
import { SearchW700 as Search } from '@material-symbols-svg/react/icons/search';
import { searchRoutes, searchStopsStations } from './lib/searchStopsStations';
import { getRouteColor, IconTable } from './lib/digitransit';
import Label from './components/label';
import MiniSearch from 'minisearch';
import { redirect } from 'next/navigation';
import { SettingsW700 as Settings } from '@material-symbols-svg/react/icons/settings';
import Modal from './components/modal';

const timeOptions: Suggestion<object>[] = []

for (let i = 0; i < 96; i++) {
  const date = new TZDate(1970, 0, 1, 0, i * 15, "Europe/Helsinki")
  timeOptions.push({
    icon: <></>,
    text: format(date, "H:mm"),
    id: date.toISOString()
  })
}

const dateOptions: Suggestion<object>[] = []
const startOfToday = new TZDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).withTimeZone("Europe/Helsinki")
for (let i = 0; i < 28; i++) {
  const date = new TZDate(startOfToday.getFullYear(), startOfToday.getMonth(), startOfToday.getDate() + i, "Europe/Helsinki")
  dateOptions.push({
    icon: <></>,
    text: isToday(date) ? "Today" : isTomorrow(date) ? "Tomorrow" : format(date, "ccc d.M."),
    id: date.toISOString()
  })
}

export default function Home() {
  const [origin, setOrigin] = useState<PlaceSuggestion | null>(null)
  const [destination, setDestination] = useState<PlaceSuggestion | null>(null)
  const [search, setSearch] = useState<SearchSuggestion | null>(null)
  const [depArr, setDepArr] = useState<"dep" | "arr">("dep")
  const [date, setDate] = useState<TZDate>(new TZDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).withTimeZone("Europe/Helsinki"))
  const [time, setTime] = useState<TZDate>(new TZDate(1970, 0, 1, new Date().getHours(), Math.ceil(new Date().getMinutes() / 15) * 15).withTimeZone("Europe/Helsinki"))
  const [pickedLocation, setPickedLocation] = useState<LngLat | null | boolean>(null)
  const [pickedLocationTarget, setPickedLocationTarget] = useState<"origin" | "destination" | null>(null)
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false)

  const { setSidebarHidden } = useContext(FocusContext)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPickedLocation(null)
    setPickedLocationTarget(null)
    // eslint-disable-next-line react-hooks/immutability
    if (destination?.id == "choose_on_map") openMapLocationPicker("destination")
    if (origin?.id == "choose_on_map") openMapLocationPicker("origin")
    // eslint-disable-next-line react-hooks/immutability
    if (origin?.id == "user_location") getUserLocation(setOrigin)
    if (destination?.id == "user_location") getUserLocation(setDestination)
  }, [destination, openMapLocationPicker, origin])

  useEffect(() => {
    if (typeof pickedLocation != "object" || pickedLocation == null) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    (pickedLocationTarget == "destination" ? setDestination : setOrigin)({ icon: <NotListedLocation></NotListedLocation>, id: "loading", text: "Loading...", properties: pickedLocation });
    setPickedLocation(true)
    reverseGeocode(pickedLocation.toArray()).then((data) => {
      if (data.length == 0) {
        toast.error("Failed to load address (routing will still work by coordinates)");
        (pickedLocationTarget == "destination" ? setDestination : setOrigin)({ icon: <NotListedLocation></NotListedLocation>, id: "unknown_location", text: "Somewhere", properties: pickedLocation });
        return
      }
      (pickedLocationTarget == "destination" ? setDestination : setOrigin)({ ...data[0], properties: pickedLocation })
      setPickedLocation(null)
      setPickedLocationTarget(null)
    });
    if (setSidebarHidden) setSidebarHidden(false)
  }, [pickedLocation, pickedLocationTarget, setSidebarHidden])

  const { default: map } = useMap()
  const isHsl = useIsHsl()

  function getUserLocation(fn: Dispatch<SetStateAction<PlaceSuggestion | null>>) {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (data) => {
          const { latitude, longitude } = data.coords
          fn({ icon: <NotListedLocation></NotListedLocation>, id: "loading", text: "Loading...", properties: { lat: latitude, lng: longitude } });

          reverseGeocode([longitude, latitude]).then((data) => {
            if (data.length == 0) {
              toast.error("Failed to load address (routing will still work by coordinates)");
              fn({ icon: <NotListedLocation></NotListedLocation>, id: "unknown_location", text: "Somewhere", properties: { lat: latitude, lng: longitude } });
              return
            }
            fn({ ...data[0], properties: { lat: latitude, lng: longitude } })
            setPickedLocation(null)
            setPickedLocationTarget(null)
          })
        },
        (err) => {
          toast.error(err.message)
          fn(null)
        }
      )
    } else {
      toast.error("Location not available")
      fn(null)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function openMapLocationPicker(target: "origin" | "destination") {
    setPickedLocation(false)
    setPickedLocationTarget(target)
    if (setSidebarHidden) setSidebarHidden(true)
  }

  useEffect(() => {
    if (!search || !search.properties) return
    redirect(`${search.properties.type}/${search.properties.gtfsId}/${isHsl ? "?hsl" : ""}`)
  }, [search])


  return (
    <>
      <Modal className='bg-white max-w-8/10 w-120 max-h-8/10' cardTitle="Settings" open={settingsOpen} close={() => setSettingsOpen(false)}>
        <div className="px-4 overflow-y-scroll">

        </div>
      </Modal>
      <Sidebar>
        <InputField initialValue={origin?.text} suggestionFunction={(t) => placeSearch(t, map?.getCenter() || new LngLat(24.94, 60.18), isHsl)} onlySuggestions placeholder='Origin' name='origin' onValueSet={(t, v) => setOrigin(typeof v == "string" ? null : v)} icon={<LocationOn className='text-blue'></LocationOn>}></InputField>
        <InputField initialValue={destination?.text} suggestionFunction={(t) => placeSearch(t, map?.getCenter() || new LngLat(24.94, 60.18), isHsl)} onlySuggestions placeholder='Destination' name='destination' onValueSet={(t, v) => setDestination(typeof v == "string" ? null : v)} icon={<LocationOn className='text-red'></LocationOn>}></InputField>
        <div className="flex flex-row gap-2">
          <Button className="w-70 text-center h-min" onClick={() => setDepArr(depArr == "dep" ? "arr" : "dep")}>{depArr == "dep" ? "Departure" : "Arrival"}</Button>
          <InputField className="h-min" name="date" initialValue={"Today"} suggestionFunction={async () => dateOptions} onlySuggestions onValueSet={(n, v) => typeof v != "string" && setDate(new TZDate(v.id))} icon={<CalendarToday></CalendarToday>}></InputField>
          <InputField className="h-min" name="time" focusClear initialValue={format(time, "H:mm")} suggestionFunction={async (t) => timeOptions.filter(o => o.text.includes(t))} onlySuggestions onValueSet={(n, v) => typeof v != "string" && setTime(new TZDate(v.id))} icon={<Schedule></Schedule>}></InputField>
          <Button onClick={() => setSettingsOpen(true)} className="w-min text-center text-darkgray h-min p-1.5!"><Icon><Settings height={28} width={28}></Settings></Icon></Button>
        </div>
        <Button className='text-green text-2xl p-0.5!'>Search</Button>
      </Sidebar>
      <Sidebar>
        <h2 className='text-2xl mt-4'>Stations and routes</h2>
        <InputField name='search' suggestionFunction={(t) => searchStopStation(t, isHsl, map?.getCenter() || new LngLat(24.94, 60.18))} onValueSet={(t, v) => setSearch(typeof v == "string" ? null : v)} icon={<Search className='text-black'></Search>}></InputField>
      </Sidebar>
      <MapOverlay>
        {pickedLocation == false && <>
          <div onClick={() => setPickedLocation(map?.getCenter() || new LngLat(0, 0))} className="absolute pt-16 left-0 right-0 flex z-100 px-4 py-2 pointer-events-auto text-lg justify-center font-a font-medium text-white bg-green" style={{ top: "calc(env(safe-area-inset-top) + calc(var(--spacing) * -14))" }}>
            Click here to confirm location
          </div>
          <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center z-100 justify-center pointer-events-none">
            <Icon><LocationOn className="-translate-y-1/2" size={48}></LocationOn></Icon>
          </div>
        </>}
      </MapOverlay>
    </>
  );
}

export type PlaceSuggestion = Suggestion<{ lat: number, lng: number }>
export type SearchSuggestion = Suggestion<{ type: "stop" | "station" | "route", gtfsId: string }>

const miniSearch = new MiniSearch<SearchSuggestion>({ fields: ["text"], storeFields: ["icon", "id", "name", "desc", "properties"] })
let searchIndex = 0

async function placeSearch(text: string, focusPoint: LngLat, isHsl: boolean): Promise<PlaceSuggestion[]> {
  const fallbackOptions = [{
    icon: (<MapIcon></MapIcon>),
    text: "Choose on map",
    id: "choose_on_map"
  },
  {
    icon: (<MyLocation></MyLocation>),
    text: "Use your location",
    id: "user_location"
  }];
  if (text.length <= 1) {
    return fallbackOptions
  } else {
    const result = await search(text, focusPoint.toArray(), isHsl)
    return result.length == 0 ? fallbackOptions : result
  }
}

async function searchStopStation(text: string, isHsl: boolean, focusPoint: LngLat): Promise<SearchSuggestion[]> {
  searchIndex++
  let index = searchIndex
  miniSearch.removeAll()
  if (text.length < 1) return []
  const [routes, stops] = await Promise.all([await searchRoutes(text, isHsl), await searchStopsStations(text, isHsl, focusPoint.toArray())])
  if (!routes || !stops) return []

  const regex = /GTFS:((?:.*)\:(?:\d|[A-Z]|\Ä|\Ö|\Å|_|-)+)/

  const parsed = [
    ...stops.features.map<SearchSuggestion>(s => ({
      icon: IconTable[s.properties.addendum?.GTFS.modes?.reduce((p, c) => c) || "BUS"], id: `s${s.properties.gid}${s.properties.id}`, text: s.properties.name || "unnamed route", name: <span>
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
      const [feed, routeId, direction, patternId] = r?.patterns![0]?.code.split(":")!
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

  return results as any
}
