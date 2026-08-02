"use client"

import { CalendarToday, LocationOn, Map as MapIcon, MyLocation, NotListedLocation, Schedule } from "@material-symbols-svg/react/w700"
import 'maplibre-gl/dist/maplibre-gl.css';
import { LngLat } from "maplibre-gl"

import InputField, { Suggestion } from './components/inputfield';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Map, useMap } from "@vis.gl/react-maplibre";
import { search } from "./lib/search";
import Icon from "./components/icon";
import reverseGeocode from "./lib/geocoding";
import toast from "react-hot-toast";
import Button from "./components/button";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns-tz";
import { isToday, isTomorrow } from "date-fns";

const timeOptions: Suggestion<{}>[] = []

for (let i = 0; i < 96; i++) {
  const date = new TZDate(1970, 0, 1, 0, i * 15, "Europe/Helsinki")
  timeOptions.push({
    icon: <></>,
    text: format(date, "H:mm"),
    id: date.toISOString()
  })
}

const dateOptions: Suggestion<{}>[] = []
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
  const [depArr, setDepArr] = useState<"dep" | "arr">("dep")
  const [date, setDate] = useState<TZDate>(new TZDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).withTimeZone("Europe/Helsinki"))
  const [time, setTime] = useState<TZDate>(new TZDate(1970, 0, 1, new Date().getHours(), Math.ceil(new Date().getMinutes() / 15) * 15).withTimeZone("Europe/Helsinki"))
  const [pickedLocation, setPickedLocation] = useState<LngLat | null | boolean>(null)
  const [pickedLocationTarget, setPickedLocationTarget] = useState<"origin" | "destination" | null>(null)

  const [focus, setFocus] = useState<boolean>(false)

  useEffect(() => {
    setPickedLocation(null)
    setPickedLocationTarget(null)
    if (destination?.id == "choose_on_map") openMapLocationPicker("destination")
    if (origin?.id == "choose_on_map") openMapLocationPicker("origin")
    if (origin?.id == "user_location") getUserLocation(setOrigin)
    if (destination?.id == "user_location") getUserLocation(setDestination)
  }, [destination, origin])

  useEffect(() => {
    if (typeof pickedLocation != "object" || pickedLocation == null) return

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
    })
  }, [pickedLocation])

  const { default: map } = useMap()

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
            console.log(data);
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

  function openMapLocationPicker(target: "origin" | "destination") {
    setPickedLocation(false)
    setPickedLocationTarget(target)
  }

  return (
    <main className="w-full h-screen flex md:flex-row">
      <div onClick={() => { setFocus(true); console.log("ee") }} className={`absolute ${focus ? "top-2/10" : "top-7/10"} ${pickedLocation == false && "top-10/10"} left-5 right-5 md:h-40 z-100 bg-white rounded-t-2xl shadow-[0_0_10px_#0008] p-4 flex flex-col gap-2
       md:static md:h-full md:w-160 transition-all ease-in-out duration-1000 md:rounded-none overflow-scroll md:min-h-screen min-h-[200vh]`}>
        <h1 className='text-black'><img src="/logo_full.svg" alt="Hekinav Logo" /></h1>
        <InputField initialValue={origin?.text} suggestionFunction={(t) => placeSearch(t, map?.getCenter() || new LngLat(24.94, 60.18))} onlySuggestions placeholder='Origin' name='origin' onValueSet={(t, v) => setOrigin(typeof v == "string" ? null : v)} icon={<LocationOn className='text-blue'></LocationOn>}></InputField>
        <InputField initialValue={destination?.text} suggestionFunction={(t) => placeSearch(t, map?.getCenter() || new LngLat(24.94, 60.18))} onlySuggestions placeholder='Destination' name='destination' onValueSet={(t, v) => setDestination(typeof v == "string" ? null : v)} icon={<LocationOn className='text-red'></LocationOn>}></InputField>
        <div className="flex flex-row gap-2">
          <Button className="w-70 text-center h-min" onClick={() => setDepArr(depArr == "dep" ? "arr" : "dep")}>{depArr == "dep" ? "Departure" : "Arrival"}</Button>
          <InputField className="h-min" name="date" initialValue={"Today"} suggestionFunction={async () => dateOptions} onlySuggestions onValueSet={(n, v) => typeof v != "string" && setDate(new TZDate(v.id))} icon={<CalendarToday></CalendarToday>}></InputField>
          <InputField className="h-min" name="time" focusClear initialValue={format(time, "H:mm")} suggestionFunction={async (t) => timeOptions.filter(o => o.text.includes(t))} onlySuggestions onValueSet={(n, v) => typeof v != "string" && setTime(new TZDate(v.id))} icon={<Schedule></Schedule>}></InputField>
        </div>
      </div>
      <Map
        onClick={() => setFocus(false)}
        initialViewState={{
          longitude: 24.94,
          latitude: 60.18,
          zoom: 13
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="/map_style.json"
        attributionControl={false}
      >
        {pickedLocation == false && <>
          <div onClick={() => setPickedLocation(map?.getCenter() || new LngLat(0, 0))} className="absolute -top-12 pt-16 left-0 right-0 flex z-100 px-4 py-2 pointer-events-auto text-lg justify-center font-a font-medium text-white bg-green">
            Click here to confirm location
          </div>
          <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center z-100 justify-center pointer-events-none">
            <Icon><LocationOn className="-translate-y-1/2" size={48}></LocationOn></Icon>
          </div>
        </>}
      </Map>
    </main>
  );
}

export type PlaceSuggestion = Suggestion<{ lat: number, lng: number }>

async function placeSearch(text: string, focusPoint: LngLat): Promise<PlaceSuggestion[]> {
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
    const result = await search(text, focusPoint.toArray())
    return result.length == 0 ? fallbackOptions : result
  }
}
