"use client";
import 'maplibre-gl/dist/maplibre-gl.css';

import { ReactElement, createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Map, MapProvider, MapRef, Popup, PopupProps } from "@vis.gl/react-maplibre";
import IconItem from './components/iconitem';
import { IconTable, Mode } from './lib/digitransit';
import { NotListedLocationW700 as NotListedLocation } from '@material-symbols-svg/react/icons/not-listed-location';
import { redirect } from 'next/navigation';
import { DirectionsBusW700 as DirectionsBus } from '@material-symbols-svg/react/icons/directions-bus';
import { TramW700 as Tram } from '@material-symbols-svg/react/icons/tram';
import { MetroW700 as Metro } from '@material-symbols-svg/react/icons/metro';
import { DirectionsBoatW700 as DirectionsBoat } from '@material-symbols-svg/react/icons/directions-boat';
import { FlightW700 as Flight } from '@material-symbols-svg/react/icons/flight';
import { TrainW700 as Train } from '@material-symbols-svg/react/icons/train';
import { LngLat } from 'maplibre-gl';
import { FocusContext } from './FocusContext';
import Link from 'next/link';
import { useIsHsl } from './hooks/useHsl';

type Slots = {
    overlay: HTMLDivElement | null
    sidebar: HTMLDivElement | null
}


const SlotContext = createContext<Slots>({ overlay: null, sidebar: null })
export function MapLayoutProvider({ children }: { children: React.ReactNode }) {
    const [overlay, setOverlay] = useState<HTMLDivElement | null>(null)
    const [sidebar, setSidebar] = useState<HTMLDivElement | null>(null)

    const [popup, setPopup] = useState<PopupProps | null>(null);


    const [focus, setFocus] = useState<boolean>(false)
    const [sidebarHidden, setSidebarHidden] = useState<boolean>(false)

    const map = useRef<MapRef>(null)

    const isHsl = useIsHsl()

    const focusSidebar = () => !map.current?.isMoving() && setFocus(true)
    const blurSidebar = () => setFocus(false)

    useEffect(() => {
        if (!sidebar) return
        sidebar.addEventListener("click", focusSidebar)
        sidebar.addEventListener("mouseenter", focusSidebar)
        sidebar.addEventListener("mouseleave", blurSidebar)
        return () => { sidebar.removeEventListener("click", focusSidebar); sidebar.removeEventListener("mouseenter", focusSidebar); sidebar.removeEventListener("mouseleave", blurSidebar) }
    }, [sidebar])

    return (
        <MapProvider>
            <SlotContext.Provider value={{ overlay, sidebar }}>
                <FocusContext.Provider value={{ setSidebarHidden }}>
                    <main className="w-full md:flex md:flex-row md:h-screen relative" style={{ height: "calc(var(--vh, 1vh) * 120)" }}>
                        <div ref={setSidebar} className={`absolute ${focus ? "top-2/10" : "top-7/10"} ${focus ? "overflow-scroll" : "overflow-hidden!"} md:overflow-scroll ${sidebarHidden && "top-10/10"} left-5 right-5 
       z-100 bg-white rounded-t-2xl shadow-[0_0_10px_#0008] md:shadow-none p-4 flex flex-col gap-2
       md:static md:h-full! md:w-100 transition-all ease-in-out duration-1000 md:rounded-none overflow-scroll bottom-0 md:pb-4! pb-200`}>
                        </div>
                        <div className='h-screen' style={{ position: 'relative', flex: 1 }}>
                            <Map
                                onClick={(e) => {
                                    setFocus(false)
                                    if (!map.current) return
                                    const pxBoxSize = 16

                                    const distance = map.current.getZoom() > 10 ? 125 : 500

                                    const stations =
                                        isHsl
                                            ? map.current.querySourceFeatures("terminals", { sourceLayer: "terminals" }).filter(s => e.lngLat.distanceTo(new LngLat(...(s.geometry as GeoJSON.Point).coordinates as [number, number])) < distance)
                                            : map.current.querySourceFeatures("poi_transit", { sourceLayer: "stations" }).filter(s => e.lngLat.distanceTo(new LngLat(...(s.geometry as GeoJSON.Point).coordinates as [number, number])) < distance && s.properties.routes && JSON.parse(s.properties.routes).length > 1)

                                    const feats = map.current.queryRenderedFeatures([
                                        [e.point.x - pxBoxSize, e.point.y - pxBoxSize],
                                        [e.point.x + pxBoxSize, e.point.y + pxBoxSize]
                                    ], {
                                        layers:
                                            isHsl
                                                ? ["stops_rail", "stops_bus", "stops_trunk", "stops_ferry", "stops_tram", "stops_lrail", "stops_subway"]
                                                : ["stops_airplane", "stops_rail", "stops_unknown", "stops_bus", "stops_trunk", "stops_ferry", "stops_tram", "stops_lrail", "stops_subway"]
                                    })
                                    const combined = [...feats, ...stations];
                                    if (combined.length == 0) return
                                    if (combined.length == 1) {
                                        const first = combined[0]
                                        const isStation = stations.length == 1
                                        if (isHsl) {
                                            redirect(`/${isStation ? "station" : "stop"}/HSL:${isStation ? first.properties.terminalId : first.properties.stopId}/?hsl`)
                                        } else {
                                            redirect(`/${isStation ? "station" : "stop"}/${first.properties.gtfsId}/`)
                                        }
                                    }


                                    setPopup({
                                        latitude: e.lngLat.lat,
                                        longitude: e.lngLat.lng,
                                        anchor: "bottom",
                                        onClose: () => setPopup(null),
                                        children:
                                            (<div className='max-h-100 overflow-scroll font-medium'>
                                                {stations.filter((value, index, self) =>
                                                    index === self.findIndex((t) => (
                                                        t.properties.name === value.properties.name && t.properties.gtfsId === value.properties.gtfsId && t.properties.stopId === value.properties.stopId && t.properties.terminalId === value.properties.terminalId
                                                    ))
                                                ).map((s, i) => {
                                                    interface HslProperties {
                                                        mode: Mode
                                                        nameFi: string
                                                        nameSe: string
                                                        terminalId: string
                                                    }

                                                    interface FinlandProperties {
                                                        gtfsId: string
                                                        name: string
                                                        routes: string
                                                        stops: string
                                                        type: string
                                                    }

                                                    if (isHsl) {
                                                        const props = s.properties as HslProperties
                                                        return (<div key={i} className='p-1 font-a'>
                                                            <Link className='decoration-none text-sm' href={`/station/HSL:${props.terminalId}/?hsl`}>
                                                                <IconItem icon={{ boxed: true, children: IconTable[props.mode] }}>
                                                                    {`${props.nameFi}`}
                                                                </IconItem>
                                                            </Link>
                                                        </div>)
                                                    } else {
                                                        const props = s.properties as FinlandProperties
                                                        return (<div key={i} className='p-1 font-a'>
                                                            <Link className='decoration-none text-sm' href={`/station/${props.gtfsId}/`}>
                                                                <IconItem icon={{ boxed: true, children: getIconFromRoutesString(props.routes) }}>
                                                                    {`${props.name}`}
                                                                </IconItem>
                                                            </Link>
                                                        </div>)
                                                    }



                                                })}
                                                {feats.map((f, i) => {
                                                    interface HslProperties {
                                                        isTrunkStop: boolean
                                                        mode: Mode
                                                        nameFi: string
                                                        nameSe: string
                                                        shortId: string
                                                        platform: string
                                                        stopId: string
                                                        terminalId?: string
                                                    }
                                                    interface FinlandProperties {
                                                        code: string
                                                        desc: string
                                                        gtfsId: string
                                                        name: string
                                                        parentStation?: string
                                                        platform?: string
                                                        routes: string
                                                        type: string
                                                    }

                                                    if (isHsl) {
                                                        const props = f.properties as HslProperties
                                                        return (<div key={i} className='p-1 font-a'>
                                                            <Link className='decoration-none text-sm' href={`/stop/HSL:${props.stopId}/?hsl`}>
                                                                <IconItem icon={{ className: stations.length ? "m-[3px]" : "", children: IconTable[props.mode] }}>
                                                                    {`${props.nameFi} ${props.platform && "pl. " + props.platform || ""} ${props.shortId && "(" + props.shortId.replaceAll(" ", "") + ")" || ""}`}
                                                                </IconItem>
                                                            </Link>
                                                        </div>)
                                                    } else {
                                                        const props = f.properties as FinlandProperties
                                                        return (<div key={i} className='p-1 font-a'>
                                                            <Link className='decoration-none text-sm' href={`/stop/${props.gtfsId}/`}>
                                                                <IconItem icon={{ className: stations.length ? "m-[3px]" : "", children: getIconFromRoutesString(props.routes) }}>
                                                                    {`${props.name} ${props.platform && "pl. " + props.platform || ""} ${props.code && "(" + props.code + ")" || ""}`}
                                                                </IconItem>
                                                            </Link>
                                                        </div>)
                                                    }
                                                })}
                                            </div>),
                                    })
                                }}
                                ref={map}
                                initialViewState={{
                                    longitude: 24.94,
                                    latitude: 60.18,
                                    zoom: 13
                                }}
                                style={{ width: "100%", height: "100%" }}
                                mapStyle={isHsl ? "/map_style_hsl.json" : "/map_style.json"}
                                attributionControl={false}
                            >
                                {popup && <Popup {...popup}></Popup>}
                                <div
                                    ref={setOverlay}
                                    style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                                />
                            </Map>
                        </div>
                    </main>
                    {children}
                </FocusContext.Provider>
            </SlotContext.Provider>
        </MapProvider>
    )
}

function getIconFromRoutesString(json: string): ReactElement {
    const routes: { gtfsType: number, mode: Mode }[] = JSON.parse(json)
    const routeId = routes.reduce((p, c) => c.gtfsType > p ? c.gtfsType : p, -1)
    const mode = routes.length && routes[0].mode
    switch (routeId) {
        case 109:
            return (<Train className="text-purple border-purple"></Train>)
        case 102:
            return (<Train className="text-green border-green"></Train>)
        case 701:
        case 700:
        case 3:
            return (<DirectionsBus className="text-blue border-blue"></DirectionsBus>)
        case 702:
            return (<DirectionsBus className="text-orange border-orange"></DirectionsBus>)
        case 714:
            return (<DirectionsBus className="text-blue border-blue"></DirectionsBus>)
        case 900:
            return (<Tram className="text-turqoise border-turqoise"></Tram>)
        case 1104:
            return (<Flight className="text-darkblue border-darkblue"></Flight>)
        case 0:
            return (<Tram className="text-green border-green"></Tram>)
        case 1:
            return (<Metro className="text-orange border-orange"></Metro>)
        case 4:
        case 1008:
            return (<DirectionsBoat className="text-cyan border-cyan"></DirectionsBoat>)
        case -1:
            return (<NotListedLocation className='text-gray border-gray'></NotListedLocation>)
        case null:
            return Object.entries(IconTable).reduce<ReactElement | null>((p, [k, v]) => !p && mode == k ? v : p, null) || (<NotListedLocation className='text-gray'></NotListedLocation>)
        default:
            console.log(routeId)
            return (<NotListedLocation></NotListedLocation>)
    }
}

export function Sidebar({ children }: { children: React.ReactNode }) {
    const { sidebar } = useContext(SlotContext)
    if (!sidebar) return null
    return createPortal(children, sidebar)
}

export function MapOverlay({ children }: { children: React.ReactNode }) {
    const { overlay } = useContext(SlotContext)
    if (!overlay) return null
    return createPortal(<div style={{ pointerEvents: 'auto' }}>{children}</div>, overlay)
}