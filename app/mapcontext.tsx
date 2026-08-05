"use client";
import 'maplibre-gl/dist/maplibre-gl.css';

import { Dispatch, SetStateAction, createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Map, MapProvider, MapRef, useMap } from "@vis.gl/react-maplibre";

type Slots = {
    overlay: HTMLDivElement | null
    sidebar: HTMLDivElement | null
}

const SlotContext = createContext<Slots>({ overlay: null, sidebar: null })
export const FocusContext = createContext<{ setSidebarHidden: Dispatch<SetStateAction<boolean>> | null }>({ setSidebarHidden: null })

export function MapLayoutProvider({ children }: { children: React.ReactNode }) {
    const [overlay, setOverlay] = useState<HTMLDivElement | null>(null)
    const [sidebar, setSidebar] = useState<HTMLDivElement | null>(null)


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
                                onClick={() => setFocus(false)}
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