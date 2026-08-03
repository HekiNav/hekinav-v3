"use client";
import 'maplibre-gl/dist/maplibre-gl.css';

import { Dispatch, SetStateAction, createContext, useContext, useState } from "react";
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

    return (
        <SlotContext.Provider value={{ overlay, sidebar }}>
            <FocusContext.Provider value={{ setFocus }}>
                <main className="w-full md:flex md:flex-row md:h-screen relative" style={{ height: "calc(var(--vh, 1vh) * 120)" }}>
                    <div ref={setSidebar} onClick={() => setFocus(true)} onMouseOver={() => !map?.isMoving() && setFocus(true)} onMouseOut={() => setFocus(false)} className={`absolute ${focus ? "top-2/10" : "top-7/10"} ${focus ? "overflow-scroll" : "overflow-hidden!"} md:overflow-scroll ${focus == 0 && "top-10/10"} left-5 right-5 
      md:h-40 z-100 bg-white rounded-t-2xl shadow-[0_0_10px_#0008] p-4 flex flex-col gap-2
       md:static md:h-full md:w-160 transition-all ease-in-out duration-1000 md:rounded-none overflow-scroll md:min-h-screen bottom-[0lvh] pb-200`}>
                    </div>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Map />
                        <div
                            ref={setOverlay}
                            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                        />
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