import { CalendarTodayW700 as CalendarToday } from '@material-symbols-svg/react/icons/calendar-today';
import { LocationOnW700 as LocationOn } from '@material-symbols-svg/react/icons/location-on';
import { MapW700 as MapIcon } from '@material-symbols-svg/react/icons/map';
import { MyLocationW700 as MyLocation } from '@material-symbols-svg/react/icons/my-location';
import { NotListedLocationW700 as NotListedLocation } from '@material-symbols-svg/react/icons/not-listed-location';
import { ScheduleW700 as Schedule } from '@material-symbols-svg/react/icons/schedule';
import { LngLat } from "maplibre-gl"

import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { useMap } from "@vis.gl/react-maplibre";
import toast from "react-hot-toast";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns-tz";
import { SettingsW700 as Settings } from '@material-symbols-svg/react/icons/settings';
import Modal from './modal';
import InputField, { Suggestion } from './inputfield';
import { isToday, isTomorrow } from 'date-fns';
import { FocusContext } from '../FocusContext';
import reverseGeocode from '../lib/geocoding';
import { useIsHsl } from '../hooks/useHsl';
import { MapOverlay, Sidebar } from '../mapcontext';
import Button from './button';
import Icon from './icon';
import { search } from '../lib/search';
import { AnyRoutingOption, ConfigContext, HekinavConfig, RoutingNode, RoutingOption } from '../HekinavConfig';
import { typedEntries } from '../lib/typedEntries';
import Toggle from './toggle';
import { redirect, useRouter } from 'next/navigation';


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

export type PlaceSuggestion = Suggestion<{ lat: number, lng: number }>


export default function RoutingUi({iDateTime = new Date(), iDestination = null, iOrigin = null}: {iOrigin?: PlaceSuggestion | null, iDestination?: PlaceSuggestion | null, iDateTime?: Date}) {

    const [origin, setOrigin] = useState<PlaceSuggestion | null>(iOrigin)
    const [destination, setDestination] = useState<PlaceSuggestion | null>(iDestination)
    const [depArr, setDepArr] = useState<"dep" | "arr">("dep")
    const [date, setDate] = useState<TZDate>(new TZDate(iDateTime.getFullYear(), iDateTime.getMonth(), iDateTime.getDate()).withTimeZone("Europe/Helsinki"))
    const [time, setTime] = useState<TZDate>(new TZDate(1970, 0, 1, iDateTime.getHours(), Math.ceil(iDateTime.getMinutes() / 15) * 15).withTimeZone("Europe/Helsinki"))
    const [pickedLocation, setPickedLocation] = useState<LngLat | null | boolean>(null)
    const [pickedLocationTarget, setPickedLocationTarget] = useState<"origin" | "destination" | null>(null)
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false)

    const { setSidebarHidden } = useContext(FocusContext)



    const { default: map } = useMap()
    const router = useRouter()
    const isHsl = useIsHsl()
    const { config, setConfig } = useContext(ConfigContext)

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPickedLocation(null)
        setPickedLocationTarget(null)

        if (destination?.id == "choose_on_map") openMapLocationPicker("destination")
        if (origin?.id == "choose_on_map") openMapLocationPicker("origin")

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
    })

    function plan () {
        if (!origin || !destination) return
        const start = {label: origin.text, location: {coordinate: {latitude: origin.properties?.lat, longitude: origin.properties?.lng}}}
        const end = {label: destination.text, location: {coordinate: {latitude: destination.properties?.lat, longitude: destination.properties?.lng}}}
        router.push(`/plan/${JSON.stringify(start)}/${JSON.stringify(end)}/${isHsl ? "?hsl" : ""}`)
    }

    return (
        <>
            <Modal className='bg-white max-w-8/10 w-120 max-h-8/10' cardTitle={
                <div className="flex justify-between items-center">
                    <span>Settings</span><span className='text-nowrap flex flex-nowrap h-full items-center'><span className='text-lg font-normal text-black'>Advanced</span> <Toggle state={config.advancedRoutingOptionsEnabled} setState={(v) => setConfig(v, "advancedRoutingOptionsEnabled")}></Toggle></span>
                </div>
            } open={settingsOpen} close={() => setSettingsOpen(false)}>
                <div className="px-4 overflow-y-scroll">
                    {
                        ...typedEntries((config.advancedRoutingOptionsEnabled ? config.advancedRoutingOptions : config.routingOptions)).map(([k, v], i) => {
                            const parse = <O extends RoutingNode>(option: O, setValue: <T extends O>(value: T) => void, i?: number) => {
                                switch (option.type) {
                                    case "group":
                                        return <div key={i}>
                                            <h2 className='mb-1 text-lg'>{option.name}</h2>
                                            <div className={`flex ${option.direction == "horizontal" ? "flex-row" : "flex-col"} w-full gap-1`}>
                                                {
                                                    // @ts-expect-error idk
                                                    ...option.items.map((o, i) => <div key={i}>{parse<O, A>(o, (newO) => { const a: typeof option.items = [...option.items]; a.splice(i,1,newO); console.log(newO); setValue({ ...option, items: a }) }, i)}</div>)
                                                }
                                            </div>
                                        </div>
                                    case "toggle":
                                        return <div className="flex justify-between"><span>{option.name}</span><Toggle state={option.value} setState={(v) => setValue({...option, value: v})}></Toggle></div>
                                    case "icon_toggle":
                                        return <Button className='p-0' title={option.name} key={i} onClick={() => setValue({ ...option, value: !option.value })}><Icon className={`${option.value ? "text-gray!" : ""}`}>{{...option.icon, props: {...(option.icon.props as object), height: 32, width: 32, className: `${(option.icon.props as any).className} ${option.value ? "text-gray!": ""}`}}}</Icon></Button>
                                    default:
                                        return <div key={i}></div>
                                }
                            }

                            return <div key={i}>{parse<typeof v>(v, (v) => setConfig(v, config.advancedRoutingOptionsEnabled ? "advancedRoutingOptions" : "routingOptions", k), i)}</div>
                        })
                    }
                </div>
            </Modal>
            <Sidebar>
                <InputField initialValue={origin?.text} suggestionFunction={(t) => placeSearch(t, map?.getCenter() || new LngLat(24.94, 60.18), isHsl)} onlySuggestions placeholder='Origin' name='origin' onValueSet={(_t, v) => setOrigin(typeof v == "string" ? null : v)} icon={<LocationOn className='text-blue'></LocationOn>}></InputField>
                <InputField initialValue={destination?.text} suggestionFunction={(t) => placeSearch(t, map?.getCenter() || new LngLat(24.94, 60.18), isHsl)} onlySuggestions placeholder='Destination' name='destination' onValueSet={(_t, v) => setDestination(typeof v == "string" ? null : v)} icon={<LocationOn className='text-red'></LocationOn>}></InputField>
                <div className="flex flex-row gap-2">
                    <Button className="w-70 text-center h-min" onClick={() => setDepArr(depArr == "dep" ? "arr" : "dep")}>{depArr == "dep" ? "Departure" : "Arrival"}</Button>
                    <InputField className="h-min" name="date" initialValue={"Today"} suggestionFunction={async () => dateOptions} onlySuggestions onValueSet={(_n, v) => typeof v != "string" && setDate(new TZDate(v.id))} icon={<CalendarToday></CalendarToday>}></InputField>
                    <InputField className="h-min" name="time" focusClear initialValue={format(time, "H:mm")} suggestionFunction={async (t) => timeOptions.filter(o => o.text.includes(t))} onlySuggestions onValueSet={(_n, v) => typeof v != "string" && setTime(new TZDate(v.id))} icon={<Schedule></Schedule>}></InputField>
                    <Button onClick={() => setSettingsOpen(true)} className="w-min text-center text-darkgray h-min p-1.5!"><Icon><Settings height={28} width={28}></Settings></Icon></Button>
                </div>
                <Button onClick={plan} className='text-green text-2xl p-0.5!'>Search</Button>
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

