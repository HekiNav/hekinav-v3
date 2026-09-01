import { CalendarTodayW700 as CalendarToday } from '@material-symbols-svg/react/icons/calendar-today';
import { LocationOnW700 as LocationOn } from '@material-symbols-svg/react/icons/location-on';
import { MapW700 as MapIcon } from '@material-symbols-svg/react/icons/map';
import { MyLocationW700 as MyLocation } from '@material-symbols-svg/react/icons/my-location';
import { NotListedLocationW700 as NotListedLocation } from '@material-symbols-svg/react/icons/not-listed-location';
import { ScheduleW700 as Schedule } from '@material-symbols-svg/react/icons/schedule';
import { LngLat } from "maplibre-gl"

import { useContext, useEffect, useRef, useState } from 'react';
import { useMap } from "@vis.gl/react-maplibre";
import toast from "react-hot-toast";
import { TZDate } from "@date-fns/tz";
import { formatInTimeZone } from "date-fns-tz";
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
import { AdvancedRoutingOptions, ConfigContext, defaultConfig, IncludeExclude, RoutingNode, RoutingOptionsUiConfig } from '../HekinavConfig';
import Toggle from './toggle';
import { useRouter } from 'next/navigation';
import Dropdown from './dropdown';
import { SyncAltW700 } from '@material-symbols-svg/react/icons/sync-alt';
import { getRouteColor, IconTable } from '../lib/digitransit';
import Slider from './range';
import { saveAs } from "file-saver"
import MiniSearch from 'minisearch';
import { searchRoutesAgencies } from '../lib/route_agency';
import Label from './label';
import { CorporateFareW700 } from '@material-symbols-svg/react/icons/corporate-fare';
import { PlanVisitViaLocationInput } from '../lib/__generated__/graphql';
import { AddLocationAltW700 } from '@material-symbols-svg/react/icons/add-location-alt';
import { DeleteW700 } from '@material-symbols-svg/react/icons/delete';

export type SearchSuggestion = Suggestion<IncludeExclude>

const miniSearch = new MiniSearch<SearchSuggestion>({ fields: ["text", "gtfsId"], storeFields: ["icon", "id", "name", "desc", "properties"] })

export type PlaceSuggestion = Suggestion<{ lat: number, lng: number }>


export default function RoutingUi({ iDateTime = new Date(), iDestination = null, iViaPoints = [], iOrigin = null, iDepArr = "dep" }: { iOrigin?: PlaceSuggestion | null, iDestination?: PlaceSuggestion | null, iDateTime?: Date, iDepArr?: "dep" | "arr" | "loading", iViaPoints?: PlaceSuggestion[] }) {

    const [origin, setOrigin] = useState<PlaceSuggestion | null>(iOrigin)
    const [viaPoints, setViaPoints] = useState<(PlaceSuggestion | null)[]>([])
    const [destination, setDestination] = useState<PlaceSuggestion | null>(iDestination)
    const [depArr, setDepArr] = useState<"dep" | "arr" | "loading">(iDepArr)
    const [date, setDate] = useState<TZDate>(new TZDate(iDateTime.getUTCFullYear(), iDateTime.getUTCMonth(), iDateTime.getUTCDate(), "UTC"))
    const [time, setTime] = useState<TZDate>(new TZDate(iDateTime.getUTCFullYear(), iDateTime.getUTCMonth(), iDateTime.getUTCDate(), iDateTime.getUTCHours(), iDateTime.getUTCMinutes(), "UTC"))
    const [pickedLocation, setPickedLocation] = useState<LngLat | null | boolean>(null)
    const [pickedLocationTarget, setPickedLocationTarget] = useState<number | null>(null)
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false)


    const { config, setConfig, getConfig } = useContext(ConfigContext)

    const { setSidebarHidden } = useContext(FocusContext)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const startOfToday = new Date()


    const timeOptions: Suggestion<object>[] = [{
        icon: <></>,
        id: new TZDate(startOfToday.getUTCFullYear(), startOfToday.getUTCMonth(), startOfToday.getUTCDate(), startOfToday.getUTCHours(), startOfToday.getUTCMinutes(), "UTC").toISOString(),
        text: "now",

    }]


    const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone


    for (let i = 0; i < 96; i++) {
        const date = new TZDate(startOfToday.getUTCFullYear(), startOfToday.getUTCMonth(), startOfToday.getUTCDate(), 0, i * 15, "UTC")
        timeOptions.push({
            icon: <></>,
            text: formatInTimeZone(date, currentTimeZone, "H:mm"),
            id: date.toISOString()
        })
    }

    const dateOptions: Suggestion<object>[] = []
    for (let i = 0; i < 28; i++) {
        const date = new TZDate(startOfToday.getFullYear(), startOfToday.getMonth(), startOfToday.getDate() + i, "UTC")
        dateOptions.push({
            icon: <></>,
            text: isToday(date.withTimeZone(currentTimeZone)) ? "Today" : isTomorrow(date.withTimeZone(currentTimeZone)) ? "Tomorrow" : formatInTimeZone(date, currentTimeZone, "ccc d.M."),
            id: date.toISOString()
        })
    }



    const { default: map } = useMap()
    const router = useRouter()
    const isHsl = useIsHsl()

    useEffect(() => {
        if (iViaPoints.length > 0 && iViaPoints.some((e, i) => e.id != viaPoints[i]?.id)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setViaPoints(iViaPoints)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [iViaPoints])

    function getUserLocation(fn: (e: PlaceSuggestion | null) => void) {
        setPickedLocation(null)
        setPickedLocationTarget(null)
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

    function openMapLocationPicker(target: number) {
        setPickedLocation(false)
        setPickedLocationTarget(target)
        if (setSidebarHidden) setSidebarHidden(true)
    }

    useEffect(() => {

        viaPoints.forEach((p, i) => {
            if (p?.id == "choose_on_map") openMapLocationPicker(i)
            if (p?.id == "user_location") getUserLocation((e) => setViaPoints(prev => prev.map((v, idx) => idx === i ? e : v)))
        })

        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (destination?.id == "choose_on_map") openMapLocationPicker(-2)
        if (origin?.id == "choose_on_map") openMapLocationPicker(-1)

        if (origin?.id == "user_location") getUserLocation((v) => setOrigin(v))
        if (destination?.id == "user_location") getUserLocation((v) => setDestination(v))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [origin, destination, viaPoints])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (typeof pickedLocation !== "object" || pickedLocation === null || pickedLocationTarget === null) return;

        const setter = pickedLocationTarget == -2 ? setDestination : pickedLocationTarget == -1 ? setOrigin : (e: PlaceSuggestion) => setViaPoints(prev => prev.map((v, idx) => idx === pickedLocationTarget ? e : v))

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setter({ icon: <NotListedLocation></NotListedLocation>, id: "loading", text: "Loading...", properties: pickedLocation });
        setPickedLocation(true)
        reverseGeocode(pickedLocation.toArray()).then((data) => {
            if (data.length == 0) {
                toast.error("Failed to load address (routing will still work by coordinates)");
                setter({ icon: <NotListedLocation></NotListedLocation>, id: "unknown_location", text: "Somewhere", properties: pickedLocation });
                return
            }
            setter({ ...data[0], properties: pickedLocation })
            setPickedLocation(null)
            setPickedLocationTarget(null)
        });
        if (setSidebarHidden) setSidebarHidden(false)
    })

    function plan() {
        if (!origin || !origin.properties) return toast("Select a valid origin")
        if (!destination || !destination.properties) return toast("Select a valid destination")
        if (viaPoints.some(v => !v || !v.properties)) return toast("Select a valid location foll all via points")

        const dateTime = new TZDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), time.getUTCHours(), time.getUTCMinutes(), "UTC")
        const start = { label: origin.text, location: { coordinate: { latitude: origin.properties?.lat, longitude: origin.properties?.lng } } }
        const end = { label: destination.text, location: { coordinate: { latitude: destination.properties?.lat, longitude: destination.properties?.lng } } }
        const via: PlanVisitViaLocationInput[] = viaPoints.map(e => ({ label: e?.text, coordinate: { latitude: e?.properties?.lat, longitude: e?.properties?.lng } }))

        const locs = [start.location.coordinate, end.location.coordinate, ...via.map(v => v.coordinate)].map(l => String(l?.latitude) + String(l?.longitude))

        if (new Set(locs).size !== locs.length) {
            toast.error("One or more locations are not unique. Please only use unique locations")
            return
        }


        const url = `/plan/${JSON.stringify([start, end, ...via])}/${depArr}/${dateTime.getTime()}/${/* this is to minify the json */JSON.stringify(JSON.parse(JSON.stringify(config.routingOptions)))}/options/${isHsl ? "?hsl" : ""}`;

        router.push(url)
    }

    function importConfig() {
        const files = fileInputRef.current?.files
        if (!files?.length) return
        toast.promise(files[0].text(), {
            loading: "Importing config",
            error: "Failed to import config",
            success: (data) => {
                try {
                    setConfig(JSON.parse(data), ["routingOptions"])

                } catch {
                    return "Successfully failed to import config"
                }
                return "Successfully imported config"
            },
        })
    }
    useEffect(() => {
        if (!config.advancedRoutingOptionsEnabled && config.routingOptions.include) setConfig(false, ["routingOptions", "include"])
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config.advancedRoutingOptionsEnabled])

    return (
        <>
            <Modal className='bg-white max-w-8/10 w-120 max-h-7/10 pb-0!' cardTitle={
                <div className="flex justify-between items-center">
                    <span>Settings</span><span className='text-nowrap flex flex-nowrap h-full items-center'><span className='text-lg font-normal text-black'>Advanced</span> <Toggle state={config.advancedRoutingOptionsEnabled} setState={(v) => setConfig(v, ["advancedRoutingOptionsEnabled"])}></Toggle></span>
                </div>
            } open={settingsOpen} close={() => setSettingsOpen(false)}>
                <div className="px-4 overflow-y-scroll flex flex-col gap-2 pb-4">
                    {
                        ...(config.advancedRoutingOptionsEnabled ? AdvancedRoutingOptions : RoutingOptionsUiConfig).map((v, i) => {
                            const parse = <O extends RoutingNode>(option: O, i?: number) => {
                                switch (option.type) {
                                    case "group":
                                        return <div key={i}>
                                            <h2 className='font-medium mb-1 text-lg'>{option.name}</h2>
                                            {option.desc && <p>{option.desc}</p>}
                                            <div className={`flex ${option.direction == "horizontal" ? "flex-row" : "flex-col"} w-full gap-1`}>
                                                {
                                                    // @ts-expect-error idk
                                                    ...option.items.map((o, i) => <div key={i}>{parse<O, A>(o, (newO) => { const a: typeof option.items = [...option.items]; a.splice(i, 1, newO); setValue({ ...option, items: a }) }, i)}</div>)
                                                }
                                            </div>
                                        </div>
                                    case "exclude_include_routes":
                                    case "exclude_routes":
                                        return <>
                                            <h2 className='font-medium mb-1 text-lg mt-4'>{option.name}</h2>
                                            {option.type == "exclude_include_routes" && <>
                                                <div className="flex justify-between items-center mb-2">List type
                                                    <div className="flex w-min items-center">Exclude<Toggle state={getConfig(...option.secondaryValue).every(v => v)} setState={(v) => {
                                                        setConfig(v, ...option.secondaryValue)
                                                    }}></Toggle>Include</div>
                                                </div>
                                            </>}
                                            {(getConfig(...option.value).length > 0) && (<div className='flex flex-col gap-1 mb-2'>
                                                <div className='text-lg font-medium'>{getConfig(...option.secondaryValue).every(v => v) ? "Included" : "Excluded"}</div>
                                                {...getConfig(...option.value).flat().map((e, i) =>
                                                    <div className='flex w-full truncate items-center justify-between' key={i}>
                                                        <div className='shrink truncate'>
                                                            {e.code.length && <Label className={`${e.color} font-bold text-white`}>{e.code}</Label>}
                                                            <span className='ml-1 truncate mr-2'>{e.name}</span>
                                                        </div>
                                                        <Button className='px-1! rounded-md! text-black hover:border-red! hover:text-red! p-0! flex items-center justify-center' onClick={() => {

                                                            const excludedIncluded = getConfig(...option.value).flat()

                                                            const i = excludedIncluded.findIndex(t => e.id == t.id)
                                                            if (i < 0) return
                                                            excludedIncluded.splice(i, 1)
                                                            setConfig(excludedIncluded, ...option.value)

                                                        }}>Remove</Button></div>)}
                                            </div>)}
                                            <InputField suggestionFunction={(t) => searchRouteAgency(t, isHsl, getConfig(...option.value).flat().map(e => e.id))} icon={<></>} name='agency_route_search' placeholder='Route or agency' onValueSet={(n, v) => {
                                                if (typeof v == "string") return;
                                                if (option.type == "exclude_routes") {
                                                    setConfig(false, ...option.secondaryValue)
                                                }

                                                const excludedIncluded = getConfig(...option.value).flat()

                                                const i = excludedIncluded.findIndex(t => v.id == t.id)
                                                if (i < 0) {
                                                    setConfig([...excludedIncluded, v.properties], ...option.value)
                                                } else {
                                                    excludedIncluded.splice(i, 1)
                                                    setConfig(excludedIncluded, ...option.value)
                                                }
                                            }}></InputField>
                                        </>
                                    case "import_export":
                                        return <>
                                            <div className="flex justify-between items-center"><span className={option.desc ? 'font-medium text-lg' : ""}>{option.name}</span>
                                                <span className='flex flex-row gap-2'>
                                                    <Button onClick={() => saveAs(new Blob([JSON.stringify(config.routingOptions)], { type: "application/json" }), "config.hekinav.json")}>Export</Button>
                                                    <Button className='relative'>Import <input onChange={() => importConfig()} ref={fileInputRef} type='file' accept='.hekinav.json' className='absolute top-0 bottom-0 left-0 right-0 opacity-0'></input></Button>
                                                </span>
                                            </div>
                                        </>
                                    case "range":
                                        return <>
                                            <div className={`flex justify-between items-center ${option.desc && "mt-4"}`}><span className={option.desc ? 'font-medium text-lg' : ""}>{option.name}</span><Slider thumb={{ children: Math.max(...getConfig(...option.value)) }} track={{ className: "w-5/10! my-2 mr-4" }} label='' max={option.max} min={option.min} step={option.step} value={Math.max(...getConfig(...option.value))} setValue={(v) => setConfig(v, ...option.value)}></Slider></div>
                                            {option.desc && <p>{option.desc}</p>}
                                        </>
                                    case "toggle_number":
                                        return <div className="flex justify-between"><span>{option.name}</span><Toggle state={getConfig(...option.value).every(v => v >= option.on)} setState={(v) => setConfig(v ? option.on : option.off, ...option.value)}></Toggle></div>
                                    case "toggle":
                                        return <div className="flex justify-between"><span>{option.name}</span><Toggle state={getConfig(...option.value).every(v => v)} setState={(v) => setConfig(v, ...option.value)}></Toggle></div>
                                    case "icon_toggle":
                                        return <Button className='p-0' title={option.name} key={i} onClick={() => {
                                            const value = getConfig(...option.value).every(v => v)
                                            setConfig(!value, ...option.value)
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        }}><Icon>{{ ...option.icon, props: { ...(option.icon.props as object), height: 28, width: 28, className: `${(option.icon.props as any).className} ${getConfig(...option.value).every(v => v) ? "" : "text-gray!"}` } }}</Icon></Button>
                                    case "icon_toggle_number":
                                        return <Button className='p-0' title={option.name} key={i} onClick={() => {
                                            const value = getConfig(...option.value).every(v => v >= option.on)
                                            setConfig(value ? option.off : option.on, ...option.value)
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        }}><Icon>{{ ...option.icon, props: { ...(option.icon.props as object), height: 28, width: 28, className: `${(option.icon.props as any).className} ${getConfig(...option.value).every(v => v) ? "" : "text-gray!"}` } }}</Icon></Button>
                                    case "dropdown":
                                    case "dropdown_number":
                                        return <div>
                                            <div className="text-lg font-medium">{option.name}</div>
                                            <Dropdown<number | string> key={i} initial={option.type == "dropdown_number" ? `${Math.max(...getConfig(...option.value))} km/h` : option.options.find(o => o.id == getConfig(...option.value)[0])?.content} onSet={(i) => option.type == "dropdown_number" ? (typeof i.id == "number" && setConfig(i.id, ...option.value)) : (typeof i.id == "string" && setConfig(i.id, ...option.value))} items={option.options}></Dropdown>
                                        </div>
                                    default:
                                        return <div key={i}></div>
                                }
                            }

                            return <div key={i}>{parse<typeof v>(v, i)}</div>
                        })

                    }
                </div>
                <div className="p-4 w-full flex flex-row justify-between">
                    <Button onClick={() => setSettingsOpen(false)}>Close</Button>
                    {JSON.stringify(config.routingOptions) !== JSON.stringify(defaultConfig.routingOptions) && <Button onClick={() => setConfig(structuredClone(defaultConfig).routingOptions, ["routingOptions"])} className='hover:border-red'>Reset to default</Button>}
                </div>
            </Modal>
            <Sidebar>
                <div className='flex flex-row gap-2'>
                    <InputField initialValue={origin?.text} suggestionFunction={(t) => placeSearch(t, map?.getCenter() || new LngLat(24.94, 60.18), isHsl)} onlySuggestions placeholder='Origin' name='origin' onValueSet={(_t, v) => setOrigin(typeof v == "string" ? null : v)} icon={<LocationOn className='text-blue'></LocationOn>}></InputField>
                    <Button onClick={() => { const tempOrigin = origin; setOrigin(destination); setDestination(tempOrigin); setViaPoints(viaPoints.toReversed()) }} className="w-min text-center text-green h-min p-1.5!"><Icon><SyncAltW700 style={{ transform: "rotate(90deg)" }} height={28} width={28}></SyncAltW700></Icon></Button>
                </div>
                {viaPoints.map((p, i) => {
                    return <div key={i} className='flex flex-row gap-2'>
                        <InputField initialValue={p !== null ? p.text : ""} suggestionFunction={(t) => placeSearch(t, map?.getCenter() || new LngLat(24.94, 60.18), isHsl)} onlySuggestions placeholder="Via point" name='via_point' onValueSet={(_t, e) => setViaPoints(prev => prev.map((v, idx) => idx === i ? (typeof e == "string" ? null : e) as PlaceSuggestion | null : v))} icon={<LocationOn className='text-darkgray'></LocationOn>}></InputField>
                        <Button onClick={() => setViaPoints(prev => prev.filter((_, j) => j !== i))} className="w-min text-center text-darkgray h-min p-1.5!"><Icon><DeleteW700 height={28} width={28}></DeleteW700></Icon></Button>
                    </div>
                })}
                <div className='flex flex-row gap-2'>
                    <InputField initialValue={destination?.text} suggestionFunction={(t) => placeSearch(t, map?.getCenter() || new LngLat(24.94, 60.18), isHsl)} onlySuggestions placeholder='Destination' name='destination' onValueSet={(_t, v) => setDestination(typeof v == "string" ? null : v)} icon={<LocationOn className='text-red'></LocationOn>}></InputField>
                    <Button onClick={() => viaPoints.length >= 5 ? toast.error("Too many via points") : setViaPoints([...viaPoints, null])} className="w-min text-center text-green h-min p-1.5!"><Icon><AddLocationAltW700 height={28} width={28}></AddLocationAltW700></Icon></Button>
                </div>
                <div className="flex flex-row gap-2">
                    <Button className="w-70 text-center h-min" onClick={() => setDepArr(depArr == "dep" ? "arr" : "dep")}>{depArr == "dep" ? "Departure" : "Arrival"}</Button>
                    <InputField className="h-min" name="date" initialValue={isToday(date.withTimeZone(currentTimeZone)) ? "Today" : isTomorrow(date.withTimeZone(currentTimeZone)) ? "Tomorrow" : formatInTimeZone(date, currentTimeZone, "ccc d.M.")} suggestionFunction={async () => dateOptions} onlySuggestions onValueSet={(_n, v) => typeof v != "string" && setDate(new TZDate(v.id))} icon={<CalendarToday></CalendarToday>}></InputField>
                    <InputField className="h-min" name="time" focusClear initialValue={formatInTimeZone(time, currentTimeZone, "H:mm")} suggestionFunction={async (t) => timeOptions.sort((a, b) => Number(a.text.replaceAll(":", "")) - Number(b.text.replaceAll(":", ""))).filter(o => o.text.includes(t))} onValueSet={(n, v) => {
                        if (typeof v == "string") {
                            const dt = new Date()
                            const [hours, mins] = v.split(":").map(e => Number(e))
                            const time = new TZDate(dt.getFullYear(), dt.getMonth(), dt.getDate(), hours, mins)
                            if (!isNaN(time.getTime()) && v.split(":")[1] && v.split(":")[1].length == 2) setTime(new TZDate(time))
                        } else setTime(new TZDate(v.id, "UTC"))
                    }} icon={<Schedule></Schedule>}></InputField>
                    <Button onClick={() => setSettingsOpen(true)} className="w-min text-center text-darkgray h-min p-1.5!"><Icon><Settings height={28} width={28}></Settings></Icon></Button>
                </div>
                <Button onClick={plan} className='text-green text-2xl p-0.5!'>Search</Button>
            </Sidebar>
            <MapOverlay>
                {pickedLocation === false && <>
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

let searchIndex = 0


async function searchRouteAgency(text: string, isHsl: boolean, ignore: string[]): Promise<SearchSuggestion[]> {
    searchIndex++
    const index = searchIndex
    miniSearch.removeAll()
    if (text.length < 1) return []
    const items = await searchRoutesAgencies(text, isHsl)
    if (!items || !items.agencies || !items.routes) return []


    const parsed = [
        ...items.routes.map<SearchSuggestion>(r => {

            return {
                icon: IconTable[r?.mode || "BUS"], id: `${r?.gtfsId}`, text: r?.shortName || "" + r?.longName || "", name: <span>
                    {r?.shortName && <Label className={`${getRouteColor("bg", r?.type || -1, r?.mode || "")} font-bold text-white`}>{r?.shortName}</Label>}
                    <span className='ml-1 truncate mr-2'>{r?.longName}</span>
                </span>,
                desc: !isHsl ? r?.agency?.name : undefined,
                properties: {
                    code: r?.shortName || "",
                    id: r?.gtfsId || "",
                    color: getRouteColor("bg", r?.type || -1, r?.mode || ""),
                    type: "route",
                    name: r?.longName || ""
                }
            }
        }),
        ...items.agencies.map<SearchSuggestion>(a => {
            return {
                icon: <CorporateFareW700></CorporateFareW700>, id: `${a?.gtfsId}`, text: `${a?.name || ""} ${a?.gtfsId.split(":")[0] || ""} `,
                name: a?.name || "",
                properties: {
                    code: a?.gtfsId.split(":")[0] || "",
                    id: a?.gtfsId || "",
                    color: "bg-gray",
                    type: "agency",
                    name: a?.name || "",
                }
            }
        })
    ]
    if (index < searchIndex || miniSearch.termCount > 0) {
        return []
    }

    const filtered = parsed.filter((value, index, self) =>
        index === self.findIndex((t) => (
            t.id === value.id
        ))
    )

    await miniSearch.addAllAsync(filtered)
    const results = miniSearch.search(text, { fuzzy: 0.2, prefix: true, boost: { text: 5 } })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return results.filter(r => ignore.every(s => s != r.id)) as any
}

