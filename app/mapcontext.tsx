"use client";
import 'maplibre-gl/dist/maplibre-gl.css';

import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Map, MapProvider, MapRef, Popup, PopupProps, useMap } from "@vis.gl/react-maplibre";
import IconItem from './components/iconitem';
import { IconTable, Mode } from './lib/digitransit';
import { NotListedLocationW700 as NotListedLocation } from '@material-symbols-svg/react/icons/not-listed-location';
import { redirect } from 'next/navigation';
import { DirectionsBusW700 as DirectionsBus } from '@material-symbols-svg/react/icons/directions-bus';
import { TramW700 as Tram } from '@material-symbols-svg/react/icons/tram';
import { BusRailwayW700 as BusRailway } from '@material-symbols-svg/react/icons/bus-railway';
import { MetroW700 as Metro } from '@material-symbols-svg/react/icons/metro';
import { DirectionsBoatW700 as DirectionsBoat } from '@material-symbols-svg/react/icons/directions-boat';
import { FlightW700 as Flight } from '@material-symbols-svg/react/icons/flight';
import { TrainW700 as Train } from '@material-symbols-svg/react/icons/train';

type Slots = {
    overlay: HTMLDivElement | null
    sidebar: HTMLDivElement | null
}


const SlotContext = createContext<Slots>({ overlay: null, sidebar: null })
export const FocusContext = createContext<{ setSidebarHidden: Dispatch<SetStateAction<boolean>> | null }>({ setSidebarHidden: null })

export function MapLayoutProvider({ children }: { children: React.ReactNode }) {
    const [overlay, setOverlay] = useState<HTMLDivElement | null>(null)
    const [sidebar, setSidebar] = useState<HTMLDivElement | null>(null)

    const [popup, setPopup] = useState<PopupProps | null>(null);


    const [focus, setFocus] = useState<boolean>(false)
    const [sidebarHidden, setSidebarHidden] = useState<boolean>(false)

    const map = useRef<MapRef>(null)

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
       z-100 bg-white rounded-t-2xl shadow-[0_0_10px_#0008] p-4 flex flex-col gap-2
       md:static md:h-full! md:w-100 transition-all ease-in-out duration-1000 md:rounded-none overflow-scroll bottom-0 md:pb-4! pb-200`}>
                        </div>
                        <div className='h-screen' style={{ position: 'relative', flex: 1 }}>
                            <Map
                                onClick={(e) => {
                                    setFocus(false)
                                    if (!map.current) return
                                    const pxBoxSize = 16
                                    const feats = map.current.queryRenderedFeatures([
                                        [e.point.x - pxBoxSize, e.point.y - pxBoxSize],
                                        [e.point.x + pxBoxSize, e.point.y + pxBoxSize]
                                    ], { layers: ["stops_airplane", "stops_rail", "stops_unknown", "stops_bus", "stops_trunk", "stops_ferry", "stops_tram", "stops_lrail", "stops_subway"] })
                                    //if (feats.length == 0) redirect(Object.hasOwn(feats[0].properties,"terminalId") ? `/terminal/${properties.}`)
                                    console.log(feats)
                                    setPopup({
                                        latitude: e.lngLat.lat,
                                        longitude: e.lngLat.lng,
                                        anchor: "bottom",
                                        onClose: () => setPopup(null),
                                        children:
                                            (<>
                                                {feats.map((f, i) => {
                                                    const props = f.properties as {
                                                        code: string
                                                        desc: string
                                                        gtfsId: string
                                                        name: string
                                                        parentStation?: string
                                                        platform?: string
                                                        routes: string
                                                        type: string
                                                    }


                                                    return (<div key={i} className='p-1 font-a'>
                                                        <IconItem icon={{ children: getIconFromRoutesString(props.routes) }}>
                                                            {`${props.name} ${props.platform && "pl. " + props.platform || ""} ${props.code && "(" + props.code + ")" || ""}`}
                                                        </IconItem>
                                                    </div>)
                                                })}
                                            </>),
                                    })
                                }}
                                ref={map}
                                initialViewState={{
                                    longitude: 24.94,
                                    latitude: 60.18,
                                    zoom: 13
                                }}
                                style={{ width: "100%", height: "100%" }}
                                mapStyle="/map_style.json"
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

function getIconFromRoutesString(json: string): ReactNode {
    const routes: { gtfsType: number }[] = JSON.parse(json)
    const routeId = routes.reduce((p, c) => c.gtfsType > p ? c.gtfsType : p, -1)
    switch (routeId) {
        case 109:
            return (<Train className="text-purple"></Train>)
        case 102:
            return (<Train className="text-green"></Train>)
        case 701:
        case 3:
            return (<DirectionsBus className="text-blue"></DirectionsBus>)
        case 702:
            return (<DirectionsBus className="text-orange"></DirectionsBus>)
        case 714:
            return (<BusRailway className="text-red"></BusRailway>)
        case 900:
            return (<Tram className="text-turqoise"></Tram>)
        case 1104:
            return (<Flight className="text-darkblue"></Flight>)
        case 0:
            return (<Tram className="text-green"></Tram>)
        case 1:
            return (<Metro className="text-orange"></Metro>)
        case 4:
            return (<DirectionsBoat className="text-cyan"></DirectionsBoat>)
        case -1:
            return (<NotListedLocation className='text-gray'></NotListedLocation>)
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