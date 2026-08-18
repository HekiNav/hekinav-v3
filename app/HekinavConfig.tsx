"use client";
import { createContext, ReactElement } from "react";
import { TransitMode } from "./lib/__generated__/graphql"
import { IconTable } from "./lib/digitransit";

export type RoutingOption<T extends string, V> = {
  name: string,
  desc: string,
  type: T
  value: HekinavConfigPathTo<V>[]
}

export type IconToggleRoutingOption = RoutingOption<"icon_toggle", boolean> & {
  icon: ReactElement
}

export type ToggleRoutingOption = RoutingOption<"toggle", boolean>

export type DropdownRoutingOption<K extends string | number> = RoutingOption<"dropdown", K> & {
  options: { id: K, content: string }[]
}

export interface RoutingOptionGroup<T = AnyRoutingOption> extends Omit<RoutingOption<"group", string>, "value" | "multiValue"> {
  direction: "vertical" | "horizontal",
  items: (T & { id: string })[]
}

export type RoutingNode<T = AnyRoutingOption> = RoutingOptionGroup<T> | T



export type AnyRoutingOption = IconToggleRoutingOption | ToggleRoutingOption | DropdownRoutingOption<string> | DropdownRoutingOption<number>

export interface HekinavConfig {
  advancedDepartures: boolean;
  advancedRoutingOptionsEnabled: boolean;
  routingOptions: {
    modes: { [key in TransitMode]: boolean }
    avoidTransfers: boolean
    avoidWalking: boolean
    avoidWaiting: boolean
    walkSpeed: number
  }
}

export const RoutingOptionsUiConfig: RoutingNode[] = [
  {
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
        value: [["routingOptions", "modes", "BUS"], ["routingOptions", "modes", "COACH"], ["routingOptions", "modes", "TROLLEYBUS"]],

        id: "bus"
      },
      {
        type: "icon_toggle",
        name: "Use trams in routing",
        desc: "",
        icon: IconTable.TRAM,
        value: [["routingOptions", "modes", "TRAM"], ["routingOptions", "modes", "FUNICULAR"]],

        id: "tram"
      },
      {
        type: "icon_toggle",
        name: "Use metro in routing",
        desc: "",
        icon: IconTable.SUBWAY,
        value: [["routingOptions", "modes", "SUBWAY"], ["routingOptions", "modes", "MONORAIL"]],

        id: "metro"
      },
      {
        type: "icon_toggle",
        name: "Use rail in routing",
        desc: "",
        icon: IconTable.RAIL,
        value: [["routingOptions", "modes", "RAIL"]],
        id: "rail"
      },
      {
        type: "icon_toggle",
        name: "Use ferries in routing",
        desc: "",
        icon: IconTable.FERRY,
        value: [["routingOptions", "modes", "FERRY"]],
        id: "ferry"
      },
      {
        type: "icon_toggle",
        name: "Use airplanes in routing",
        desc: "",
        icon: IconTable.AIRPLANE,
        value: [["routingOptions", "modes", "AIRPLANE"]],
        id: "airplane"
      }
    ]
  },
  {
    type: "dropdown",
    desc: "",
    name: "Walking speed",
    options: [
      {
        id: 2.5,
        content: "Slow (2.5)"
      },
      {
        id: 3.5,
        content: "Calm (3.5)"
      },
      {
        id: 4.6,
        content: "Average (4.6)"
      },
      {
        id: 6,
        content: "Rapid (6)"
      },
      {
        id: 8,
        content: "Fast (8)"
      }
    ],
    value: [["routingOptions", "walkSpeed"]]
  },
  {
    value: [["routingOptions", "avoidTransfers"]],
    type: "toggle",
    desc: "",
    name: "Avoid transfers",
  },
  {
    value: [["routingOptions", "avoidWalking"]],
    type: "toggle",
    desc: "",
    name: "Avoid walking",
  },
  {
    value: [["routingOptions", "avoidWaiting"]],
    type: "toggle",
    desc: "",
    name: "Avoid waiting",
  }
]

export const AdvancedRoutingOptions: RoutingNode[] = [
  {
    type: "group",
    direction: "vertical",
    name: "Modes",
    desc: "",
    items: [
      {
        value: [["routingOptions", "modes", "BUS"]],
        name: "Bus",
        desc: "",
        type: "toggle",
        id: "BUS"
      },
      {
        value: [["routingOptions", "modes", "TRAM"]],
        name: "Tram",
        desc: "",
        type: "toggle",
        id: "TRAM"
      },
      {
        value: [["routingOptions", "modes", "RAIL"]],
        name: "Rail",
        desc: "",
        type: "toggle",
        id: "RAIL"
      },
      {
        value: [["routingOptions", "modes", "SUBWAY"]],
        name: "Metro",
        desc: "",
        type: "toggle",
        id: "SUBWAY"
      },
      {
        value: [["routingOptions", "modes", "FERRY"]],
        name: "Ferry",
        desc: "",
        type: "toggle",
        id: "FERRY"
      },
      {
        value: [["routingOptions", "modes", "AIRPLANE"]],
        name: "Airplane",
        desc: "",
        type: "toggle",
        id: "AIRPLANE"
      },
      {
        value: [["routingOptions", "modes", "COACH"]],
        name: "Coach",
        desc: "",
        type: "toggle",
        id: "COACH"
      },
      {
        value: [["routingOptions", "modes", "MONORAIL"]],
        name: "Monorail",
        desc: "",
        type: "toggle",
        id: "MONORAIL"
      },
      {
        value: [["routingOptions", "modes", "CABLE_CAR"]],
        name: "Cable car",
        desc: "",
        type: "toggle",
        id: "CABLE_CAR"
      },
      {
        value: [["routingOptions", "modes", "GONDOLA"]],
        name: "Gondola",
        desc: "",
        type: "toggle",
        id: "GONDOLA"
      },
      {
        value: [["routingOptions", "modes", "FUNICULAR"]],
        name: "Funicular",
        desc: "",
        type: "toggle",
        id: "FUNICULAR"
      },
      {
        value: [["routingOptions", "modes", "CARPOOL"]],
        name: "Carpool",
        desc: "",
        type: "toggle",
        id: "CARPOOL"
      },
      {
        value: [["routingOptions", "modes", "TAXI"]],
        name: "Taxi",
        desc: "",
        type: "toggle",
        id: "TAXI"
      },
      {
        value: [["routingOptions", "modes", "TROLLEYBUS"]],
        name: "Trolleybus",
        desc: "",
        type: "toggle",
        id: "TROLLEYBUS"
      },
      {
        value: [["routingOptions", "modes", "SNOW_AND_ICE"]],
        name: "Offroad snow and ice vehicle",
        desc: "",
        type: "toggle",
        id: "SNOW_AND_ICE"
      }
    ]
  }
]

export const defaultConfig: HekinavConfig = {
  advancedDepartures: false,
  advancedRoutingOptionsEnabled: false,
  routingOptions: {
    modes: {
      AIRPLANE: true,
      BUS: true,
      CABLE_CAR: true,
      CARPOOL: false,
      COACH: true,
      FERRY: true,
      FUNICULAR: true,
      GONDOLA: true,
      MONORAIL: true,
      RAIL: true,
      SNOW_AND_ICE: false,
      SUBWAY: true,
      TAXI: false,
      TRAM: true,
      TROLLEYBUS: true
    },
    avoidTransfers: false,
    avoidWaiting: false,
    avoidWalking: false,
    walkSpeed: 4.6
  }

};


// crazy typescript magic in the following types
type PathsToValue<T, V, Prev extends readonly PropertyKey[] = []> = {
  [K in keyof T]-?: T[K] extends V
  ? readonly [...Prev, K]
  : T[K] extends object
  ? PathsToValue<T[K], V, readonly [...Prev, K]>
  : never;
}[keyof T];

type AllPaths<T> = T extends object
  ? {
    [K in keyof T]-?:
    | readonly [K]
    | (T[K] extends object ? readonly [K, ...AllPaths<T[K]>] : never);
  }[keyof T]
  : never;

type PathValue<T, P extends readonly PropertyKey[]> = P extends readonly [
  infer K,
  ...infer Rest
]
  ? K extends keyof T
  ? Rest extends readonly []
  ? T[K]
  : Rest extends readonly PropertyKey[]
  ? PathValue<T[K], Rest>
  : never
  : never
  : never;

export type HekinavConfigPathTo<V> = PathsToValue<HekinavConfig, V>;

export type SetHekinavConfigKey = <P extends AllPaths<HekinavConfig>>(
  value: PathValue<HekinavConfig, P>,
  ...path: P[]
) => void;

export type GetHekinavConfigKey = <P extends AllPaths<HekinavConfig>>(
  ...path: P[]
) => HekinavConfigPathTo<P>[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ConfigContext = createContext<{ config: HekinavConfig; setConfig: SetHekinavConfigKey; getConfig: GetHekinavConfigKey }>({ config: defaultConfig, setConfig: () => { }, getConfig: () => { return {} as any } });
