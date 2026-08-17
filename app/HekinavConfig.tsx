"use client";
import { createContext, ReactElement, ReactNode } from "react";
import { TransitMode } from "./lib/__generated__/graphql"
import { IconTable } from "./lib/digitransit";

export interface RoutingOption<T extends string> {
  name: string,
  desc: string,
  type: T
}

export interface IconToggleRoutingOption<T = undefined> extends RoutingOption<"icon_toggle"> {
  icon: ReactElement,
  value: boolean,
  properties: T
}

export interface ToggleRoutingOption extends RoutingOption<"toggle"> {
  value: boolean
}

export interface RoutingOptionGroup<T = AnyRoutingOption> extends RoutingOption<"group"> {
  direction: "vertical" | "horizontal",
  items: (T & {id: string})[]
}

export type RoutingNode<T = AnyRoutingOption> = RoutingOptionGroup<T> | T

type ModeRoutingOption = IconToggleRoutingOption<{
  modes: TransitMode[];
}>;

export type AnyRoutingOption = ModeRoutingOption | IconToggleRoutingOption | ToggleRoutingOption

export interface HekinavConfig {
  advancedDepartures: boolean;
  advancedRoutingOptionsEnabled: boolean;
  routingOptions: {
    modes: RoutingOptionGroup<ModeRoutingOption>
  },
  advancedRoutingOptions: {
    modes: RoutingOptionGroup<ToggleRoutingOption>
  }
}
export const defaultConfig: HekinavConfig = {
  advancedDepartures: false,
  advancedRoutingOptionsEnabled: false,
  advancedRoutingOptions: {
    modes: {
      type: "group",
      direction: "vertical",
      name: "Modes",
      desc: "",
      items: [
        {
          value: true,
          name: "Bus",
          desc: "",
          type: "toggle",
          id: "BUS"
        },
        {
          value: true,
          name: "Tram",
          desc: "",
          type: "toggle",
          id: "TRAM"
        },
        {
          value: true,
          name: "Rail",
          desc: "",
          type: "toggle",
          id: "RAIL"
        },
        {
          value: true,
          name: "Metro",
          desc: "",
          type: "toggle",
          id: "SUBWAY"
        },
        {
          value: true,
          name: "Ferry",
          desc: "",
          type: "toggle",
          id: "FERRY"
        },
        {
          value: true,
          name: "Airplane",
          desc: "",
          type: "toggle",
          id: "AIRPLANE"
        },
        {
          value: true,
          name: "Coach",
          desc: "",
          type: "toggle",
          id: "COACH"
        },
        {
          value: true,
          name: "Monorail",
          desc: "",
          type: "toggle",
          id: "MONORAIL"
        },
        {
          value: true,
          name: "Cable car",
          desc: "",
          type: "toggle",
          id: "CABLE_CAR"
        },
        {
          value: true,
          name: "Gondola",
          desc: "",
          type: "toggle",
          id: "GONDOLA"
        },
        {
          value: true,
          name: "Funicular",
          desc: "",
          type: "toggle",
          id: "FUNICULAR"
        },
        {
          value: true,
          name: "Carpool",
          desc: "",
          type: "toggle",
          id: "CARPOOL"
        },
        {
          value: true,
          name: "Taxi",
          desc: "",
          type: "toggle",
          id: "TAXI"
        },
        {
          value: true,
          name: "Trolleybus",
          desc: "",
          type: "toggle",
          id: "TROLLEYBUS"
        },
        {
          value: true,
          name: "Offroad snow and ice vehicle",
          desc: "",
          type: "toggle",
          id: "SNOW_AND_ICE"
        }
      ]
    }
  },
  routingOptions: {
    modes: {
      type: "group",
      direction: "horizontal",
      desc: "",
      name: "Modes",
      items: [
        {
          type: "icon_toggle",
          name: "Use buses in routing",
          desc: "",
          icon: IconTable.BUS,
          value: true,
          properties: { modes: ["BUS", "COACH", "TROLLEYBUS"] },
          id: "bus"
        },
        {
          type: "icon_toggle",
          name: "Use trams in routing",
          desc: "",
          icon: IconTable.TRAM,
          value: true,
          properties: { modes: ["TRAM", "FUNICULAR"] },
          id: "tram"
        },
        {
          type: "icon_toggle",
          name: "Use metro in routing",
          desc: "",
          icon: IconTable.SUBWAY,
          value: true,
          properties: { modes: ["SUBWAY", "MONORAIL"] },
          id: "metro"
        },
        {
          type: "icon_toggle",
          name: "Use rail in routing",
          desc: "",
          icon: IconTable.RAIL,
          value: true,
          properties: { modes: ["RAIL"] },
          id: "rail"
        },
        {
          type: "icon_toggle",
          name: "Use ferries in routing",
          desc: "",
          icon: IconTable.FERRY,
          value: true,
          properties: { modes: ["FERRY"] },
          id: "ferry"
        },
        {
          type: "icon_toggle",
          name: "Use airplanes in routing",
          desc: "",
          icon: IconTable.AIRPLANE,
          value: true,
          properties: { modes: ["AIRPLANE"] },
          id: "airplane"
        }
      ]
    }
  }
};


export type SetHekinavConfigKey = {
  <K1 extends keyof HekinavConfig>(
    value: HekinavConfig[K1],
    key1: K1
  ): void;

  <K1 extends keyof HekinavConfig, K2 extends keyof HekinavConfig[K1]>(
    value: HekinavConfig[K1][K2],
    key1: K1,
    key2: K2
  ): void;

  <
    K1 extends keyof HekinavConfig,
    K2 extends keyof HekinavConfig[K1],
    K3 extends keyof HekinavConfig[K1][K2]
  >(
    value: HekinavConfig[K1][K2][K3],
    key1: K1,
    key2: K2,
    key3: K3
  ): void;
};
export const ConfigContext = createContext<{ config: HekinavConfig; setConfig: SetHekinavConfigKey }>({ config: defaultConfig, setConfig: () => { } });
