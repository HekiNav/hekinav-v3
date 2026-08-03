"use client";
import 'maplibre-gl/dist/maplibre-gl.css';

import { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Map, useMap } from "@vis.gl/react-maplibre";

type Slots = {
    overlay: HTMLDivElement | null
    sidebar: HTMLDivElement | null
}

const SlotContext = createContext<Slots>({ overlay: null, sidebar: null })
export const FocusContext = createContext<{ setFocus: Dispatch<SetStateAction<boolean | 0>> | null }>({ setFocus: null })

export function MapLayoutProvider({ children }: { children: React.ReactNode }) {
    const [overlay, setOverlay] = useState<HTMLDivElement | null>(null)
    const [sidebar, setSidebar] = useState<HTMLDivElement | null>(null)

    const [focus, setFocus] = useState<boolean | 0>(false)

    const { default: map } = useMap()

    useEffect(() => {
        if (!sidebar) return
        const focus = () => setFocus(true)
        const blur = () => setFocus(false)
        sidebar.addEventListener("click", focus)
        sidebar.addEventListener("mouseover", focus)
        sidebar.addEventListener("mouseout", blur)
        return () => { sidebar.removeEventListener("click", focus); sidebar.removeEventListener("mouseover", focus); sidebar.removeEventListener("mouseout", blur) }
    }, [sidebar])

    return (
        <SlotContext.Provider value={{ overlay, sidebar }}>
            <FocusContext.Provider value={{ setFocus }}>
                <main className="w-full md:flex md:flex-row md:h-screen relative" style={{ height: "calc(var(--vh, 1vh) * 120)" }}>
                    <div ref={setSidebar} onClick={() => setFocus(true)} onMouseEnter={() => !map?.isMoving() && setFocus(true)} onMouseLeave={() => setFocus(false)} className={`absolute ${focus ? "top-2/10" : "top-7/10"} ${focus ? "overflow-scroll" : "overflow-hidden!"} md:overflow-scroll ${focus === 0 && "top-10/10"} left-5 right-5 
       z-100 bg-white rounded-t-2xl shadow-[0_0_10px_#0008] p-4 flex flex-col gap-2
       md:static md:h-full! md:w-100 transition-all ease-in-out duration-1000 md:rounded-none overflow-scroll bottom-0 md:pb-4! pb-200`}>
                    </div>
                    <div className='h-screen' style={{ position: 'relative', flex: 1 }}>
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