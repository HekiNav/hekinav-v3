"use client";
import { createContext } from "react";
import {TransitMode} from "./lib/__generated__/graphql"

export interface RoutingOption<T extends string> {
  name: string,
  desc: string,
  type: T
}

export interface IconToggleRoutingOption extends RoutingOption<"icon_toggle"> {
 icon: ReactNode,
 value: boolean
}

export interface HekinavConfig {
  advancedDepartures: boolean;
  routingOptions: {
    modes: {
      [k: TransitMode]: IconToggleRoutingOption
    }
  }
}
export const defaultConfig: HekinavConfig = {
  advancedDepartures: false,
  routingOptions: {
    modes: {
      BUS: {
        type: "icon_toggle",
        name: "Use buses in routing",
        desc: "",
        icon: 
        value: 
      }
    }
  }
};
export const ConfigContext = createContext<{ config: HekinavConfig; setConfig: <K extends keyof HekinavConfig>(key: K, value: HekinavConfig[K]) => void; }>({ config: defaultConfig, setConfig: () => { } });
