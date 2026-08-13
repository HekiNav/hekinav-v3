"use client";
import { createContext } from "react";


export interface HekinavConfig {
  advancedDepartures: boolean;
}
export const defaultConfig: HekinavConfig = {
  advancedDepartures: false
};
export const ConfigContext = createContext<{ config: HekinavConfig; setConfig: <K extends keyof HekinavConfig>(key: K, value: HekinavConfig[K]) => void; }>({ config: defaultConfig, setConfig: () => { } });
