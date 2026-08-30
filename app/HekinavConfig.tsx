"use client";
import { createContext, ReactElement } from "react";
import { TransitMode } from "./lib/__generated__/graphql"
import { IconTable } from "./lib/digitransit";

export type RoutingOption<T extends string, V> = {
  name: string,
  desc: string,
  type: T
  value: readonly [HekinavConfigPathTo<V>, ...HekinavConfigPathTo<V>[]]
}
export type MotisTransitType =
  "TRAM" |
  "SUBWAY" |
  "FERRY" |
  "AIRPLANE" |
  "BUS" |
  "COACH" |
  "RAIL" |
  "HIGHSPEED_RAIL" |
  "LONG_DISTANCE" |
  "NIGHT_RAIL" |
  "REGIONAL_FAST_RAIL" |
  "REGIONAL_RAIL" |
  "SUBURBAN" |
  "ODM" |
  "RIDE_SHARING" |
  "FUNICULAR" |
  "AERIAL_LIFT"

export type IconToggleRoutingOption = RoutingOption<"icon_toggle", boolean> & {
  icon: ReactElement
}

export type NumberIconToggleRoutingOption = RoutingOption<"icon_toggle_number", number> & {
  icon: ReactElement,
  on: number,
  off: number
}

export type RangeRoutingOption = RoutingOption<"range", number> & {
  min: number,
  max: number,
  step: number
}


export type ToggleRoutingOption = RoutingOption<"toggle", boolean>

export type ImportExportRoutingOption = RoutingOption<"import_export", boolean>


export type ExcludeRoutes = RoutingOption<"exclude_routes", IncludeExclude[]> & {
  secondaryValue: readonly [HekinavConfigPathTo<boolean>, ...HekinavConfigPathTo<boolean>[]]
}

export type ExcludeIncludeRoutes = RoutingOption<"exclude_include_routes", IncludeExclude[]> & {
  secondaryValue: readonly [HekinavConfigPathTo<boolean>, ...HekinavConfigPathTo<boolean>[]]
}

export type NumberToggleRoutingOption = RoutingOption<"toggle_number", number> & {
  on: number,
  off: number
}

export type DropdownRoutingOption<K extends string | number, T extends string> = RoutingOption<T, K> & {
  options: { id: K, content: string }[]
}

export interface RoutingOptionGroup<T = AnyRoutingOption> extends Omit<RoutingOption<"group", string>, "value" | "multiValue"> {
  direction: "vertical" | "horizontal",
  items: (T & { id: string })[]
}

export type RoutingNode<T = AnyRoutingOption> = RoutingOptionGroup<T> | T



export type AnyRoutingOption = IconToggleRoutingOption | ToggleRoutingOption | DropdownRoutingOption<number, "dropdown_number"> | DropdownRoutingOption<string, "dropdown"> | NumberIconToggleRoutingOption | NumberToggleRoutingOption | RangeRoutingOption | ImportExportRoutingOption | ExcludeRoutes | ExcludeIncludeRoutes

export interface HekinavConfig {
  advancedDepartures: boolean;
  advancedRoutingOptionsEnabled: boolean;
  favourites: {
    stops: string[],
    routes: string[],
    stations: string[],
  },
  routingOptions: {
    modes: { [key in TransitMode | MotisTransitType]: number }
    transferCost: number
    waitReluctance: number
    walkReluctance: number
    walkSpeed: number
    includeExclude: IncludeExclude[]
    include: boolean
    routingEngines: { digitransit: boolean, hekinav: boolean }
    motisAlgorithm: "PONG" | "RAPTOR" | "TB"
  }
}
export interface IncludeExclude {
  name: string,
  code: string,
  type: "route" | "agency",
  id: string,
  color: string
}

export const RoutingOptionsUiConfig: RoutingNode[] = [
  {
    type: "group",
    direction: "horizontal",
    desc: "",
    name: "Modes",
    items: [
      {
        type: "icon_toggle_number",
        on: 1,
        off: 0,
        name: "Use buses in routing",
        desc: "",
        icon: IconTable.BUS,
        value: [["routingOptions", "modes", "BUS"], ["routingOptions", "modes", "COACH"], ["routingOptions", "modes", "TROLLEYBUS"]],

        id: "bus"
      },
      {
        type: "icon_toggle_number",
        on: 1,
        off: 0,
        name: "Use trams in routing",
        desc: "",
        icon: IconTable.TRAM,
        value: [["routingOptions", "modes", "TRAM"], ["routingOptions", "modes", "FUNICULAR"]],

        id: "tram"
      },
      {
        type: "icon_toggle_number",
        on: 1,
        off: 0,
        name: "Use metro in routing",
        desc: "",
        icon: IconTable.SUBWAY,
        value: [["routingOptions", "modes", "SUBWAY"], ["routingOptions", "modes", "MONORAIL"]],

        id: "metro"
      },
      {
        type: "icon_toggle_number",
        on: 1,
        off: 0,
        name: "Use rail in routing",
        desc: "",
        icon: IconTable.RAIL,
        value: [["routingOptions", "modes", "RAIL"], ["routingOptions", "modes", "HIGHSPEED_RAIL"], ["routingOptions", "modes", "LONG_DISTANCE"], ["routingOptions", "modes", "NIGHT_RAIL"], ["routingOptions", "modes", "REGIONAL_FAST_RAIL"], ["routingOptions", "modes", "REGIONAL_RAIL"], ["routingOptions", "modes", "SUBURBAN"]],
        id: "rail"
      },
      {
        type: "icon_toggle_number",
        on: 1,
        off: 0,
        name: "Use ferries in routing",
        desc: "",
        icon: IconTable.FERRY,
        value: [["routingOptions", "modes", "FERRY"]],
        id: "ferry"
      },
      {
        type: "icon_toggle_number",
        on: 1,
        off: 0,
        name: "Use airplanes in routing",
        desc: "",
        icon: IconTable.AIRPLANE,
        value: [["routingOptions", "modes", "AIRPLANE"]],
        id: "airplane"
      }
    ]
  },
  {
    type: "group",
    direction: "vertical",
    name: "Routing engines",
    desc: "",
    items: [
      {
        type: "toggle",
        desc: "",
        id: "digitransit",
        name: "Digitransit",
        value: [["routingOptions", "routingEngines", "digitransit"]]
      },
      {
        type: "toggle",
        desc: "",
        id: "hekinav",
        name: "Hekinav",
        value: [["routingOptions", "routingEngines", "hekinav"]]
      }
    ]
  },
  {
    type: "exclude_routes",
    desc: "",
    name: "Exclude routes and agencies (Digitransit only)",
    value: [["routingOptions", "includeExclude"]],
    secondaryValue: [["routingOptions", "include"]]
  },
  {
    type: "dropdown_number",
    desc: "",
    name: "Walking speed",
    options: [
      {
        id: 2.5,
        content: "Slow (2.5 km/h)"
      },
      {
        id: 3.5,
        content: "Calm (3.5 km/h)"
      },
      {
        id: 4.5,
        content: "Average (4.5 km/h)"
      },
      {
        id: 6,
        content: "Rapid (6 km/h)"
      },
      {
        id: 8,
        content: "Fast (8 km/h)"
      }
    ],
    value: [["routingOptions", "walkSpeed"]]
  },
  {
    value: [["routingOptions", "transferCost"]],
    type: "toggle_number",
    off: 0,
    on: 2000,
    desc: "",
    name: "Avoid transfers",
  },
  {
    value: [["routingOptions", "walkReluctance"]],
    type: "toggle_number",
    off: 1.5,
    on: 5,
    desc: "",
    name: "Avoid walking (Digitransit only)",
  },
  {
    value: [["routingOptions", "waitReluctance"]],
    type: "toggle_number",
    off: 1,
    on: 3,
    desc: "",
    name: "Avoid waiting (Digitransit only)",
  }
]

export const AdvancedRoutingOptions: RoutingNode[] = [
  {
    type: "import_export",
    desc: "",
    name: "Import and export",
    value: [["advancedDepartures"]] // not actually used
  },
  {
    type: "group",
    direction: "vertical",
    name: "Routing engines",
    desc: "",
    items: [
      {
        type: "toggle",
        desc: "",
        id: "digitransit",
        name: "Digitransit",
        value: [["routingOptions", "routingEngines", "digitransit"]]
      },
      {
        type: "toggle",
        desc: "",
        id: "hekinav",
        name: "Hekinav",
        value: [["routingOptions", "routingEngines", "hekinav"]]
      }
    ]
  },
  {
    type: "dropdown",
    name: "MOTIS Routing algorithm",
    desc: "",
    value: [["routingOptions", "motisAlgorithm"]],
    options: [
      {
        content: "RAPTOR",
        id: "RAPTOR",
      },
      {
        content: "PONG (Optimized RAPTOR) (Recommended)",
        id: "PONG",
      },
      {
        content: "Trip-based",
        id: "TB",
      }
    ]
  },
  {
    type: "group",
    direction: "vertical",
    name: "Modes",
    desc: "0: disabled, 1: baseline, 2: 2 times less preferred than baseline. * = only affects Hekinav Router. Hekinav Router does not use reluctance, so all 0 :disabled, >0: enabled",
    items: [
      {
        value: [["routingOptions", "modes", "BUS"]],
        name: "Bus",
        desc: "",
        type: "range",
        max: 10,
        min: 0,
        step: 0.2,
        id: "BUS"
      },
      {
        value: [["routingOptions", "modes", "TRAM"]],
        name: "Tram",
        desc: "",
        type: "range",
        max: 10,
        min: 0,
        step: 0.2,
        id: "TRAM"
      },
      {
        value: [["routingOptions", "modes", "RAIL"]],
        name: "Rail",
        desc: "",
        type: "range",
        max: 10,
        min: 0,
        step: 0.2,
        id: "RAIL"
      },
      {
        value: [["routingOptions", "modes", "HIGHSPEED_RAIL"]],
        name: "High-speed rail *",
        desc: "",
        type: "toggle_number",
        off: 0,
        on: 1,
        id: "HIGHSPEED_RAIL"
      },
      {
        value: [["routingOptions", "modes", "LONG_DISTANCE"]],
        name: "Long-distance rail *",
        desc: "",
        type: "toggle_number",
        off: 0,
        on: 1,
        id: "LONG_DISTANCE"
      },
      {
        value: [["routingOptions", "modes", "NIGHT_RAIL"]],
        name: "Night rail *",
        desc: "",
        type: "toggle_number",
        off: 0,
        on: 1,
        id: "NIGHT_RAIL"
      },
      {
        value: [["routingOptions", "modes", "REGIONAL_FAST_RAIL"], ["routingOptions", "modes", "REGIONAL_RAIL"]],
        name: "Regional rail *",
        desc: "",
        type: "toggle_number",
        off: 0,
        on: 1,
        id: "REGIONAL_RAIL"
      },
      {
        value: [["routingOptions", "modes", "SUBURBAN"]],
        name: "Suburban rail *",
        desc: "",
        type: "toggle_number",
        off: 0,
        on: 1,
        id: "SUBURBAN"
      },
      {
        value: [["routingOptions", "modes", "SUBWAY"]],
        name: "Metro",
        desc: "",
        type: "range",
        max: 10,
        min: 0,
        step: 0.2,
        id: "SUBWAY"
      },
      {
        value: [["routingOptions", "modes", "FERRY"]],
        name: "Ferry",
        desc: "",
        type: "range",
        max: 10,
        min: 0,
        step: 0.2,
        id: "FERRY"
      },
      {
        value: [["routingOptions", "modes", "AIRPLANE"]],
        name: "Airplane",
        desc: "",
        type: "range",
        max: 10,
        min: 0,
        step: 0.2,
        id: "AIRPLANE"
      },
      {
        value: [["routingOptions", "modes", "COACH"]],
        name: "Coach",
        desc: "",
        type: "range",
        max: 10,
        min: 0,
        step: 0.2,
        id: "COACH"
      },
      {
        value: [["routingOptions", "modes", "MONORAIL"]],
        name: "Monorail",
        desc: "",
        type: "range",
        max: 10,
        min: 0,
        step: 0.2,
        id: "MONORAIL"
      },
      {
        value: [["routingOptions", "modes", "CABLE_CAR"], ["routingOptions", "modes", "GONDOLA"], ["routingOptions", "modes", "AERIAL_LIFT"]],
        name: "Cable car",
        desc: "",
        type: "range",
        max: 10,
        min: 0,
        step: 0.2,
        id: "CABLE_CAR"
      },
      {
        value: [["routingOptions", "modes", "FUNICULAR"]],
        name: "Funicular",
        desc: "",
        type: "range",
        max: 10,
        min: 0,
        step: 0.2,
        id: "FUNICULAR"
      },
      {
        value: [["routingOptions", "modes", "CARPOOL"], ["routingOptions", "modes", "RIDE_SHARING"]],
        name: "Carpool",
        desc: "",
        type: "range",
        max: 10,
        min: 0,
        step: 0.2,
        id: "CARPOOL"
      },
      {
        value: [["routingOptions", "modes", "TAXI"]],
        name: "Taxi",
        desc: "",
        type: "range",
        max: 10,
        min: 0,
        step: 0.2,
        id: "TAXI"
      },
      {
        value: [["routingOptions", "modes", "TROLLEYBUS"]],
        name: "Trolleybus",
        desc: "",
        type: "range",
        max: 10,
        min: 0,
        step: 0.2,
        id: "TROLLEYBUS"
      },
      {
        value: [["routingOptions", "modes", "SNOW_AND_ICE"]],
        name: "Snow vehicles",
        desc: "",
        type: "range",
        max: 10,
        min: 0,
        step: 0.2,
        id: "SNOW_AND_ICE"
      }
    ]
  },
  {
    type: "exclude_include_routes",
    desc: "",
    name: "Exclude routes and agencies (Digitransit only)",
    value: [["routingOptions", "includeExclude"]],
    secondaryValue: [["routingOptions", "include"]]
  },
  {
    type: "range",
    desc: "km/h, average 4.5",
    name: "Walking speed",
    max: 15,
    min: 1,
    step: 0.5,
    value: [["routingOptions", "walkSpeed"]]
  },
  {
    type: "range",
    desc: "A multiplier for how bad waiting at a stop is compared to being in transit for equal lengths of time. (default 1) (Digitransit only)",
    name: "Wait Reluctance",
    max: 5,
    min: 0,
    step: 0.5,
    value: [["routingOptions", "waitReluctance"]]
  },
  {
    type: "range",
    desc: "A multiplier for how bad walking is compared to being in transit for equal lengths of time. (default 1.5) (Digitransit only)",
    name: "Walk Reluctance",
    max: 5,
    min: 0,
    step: 0.5,
    value: [["routingOptions", "walkReluctance"]]
  },
  {
    type: "range",
    desc: "A penalty for the routing, 0 = no penalty for transfer, 2000 = very large penalty for transfers (Digitransit only)",
    name: "Transfer cost",
    max: 2000,
    min: 0,
    step: 100,
    value: [["routingOptions", "transferCost"]]
  }
]

export const defaultConfig: Readonly<HekinavConfig> = {
  advancedDepartures: false,
  advancedRoutingOptionsEnabled: false,
  favourites: {
    routes: [],
    stops: [],
    stations: [],
  },
  routingOptions: {
    modes: {
      AIRPLANE: 1,
      BUS: 1,
      CABLE_CAR: 1,
      CARPOOL: 0,
      COACH: 1,
      FERRY: 1,
      FUNICULAR: 1,
      GONDOLA: 1,
      MONORAIL: 1,
      RAIL: 1,
      SNOW_AND_ICE: 0,
      SUBWAY: 1,
      TAXI: 0,
      TRAM: 1,
      TROLLEYBUS: 1,

      AERIAL_LIFT: 1,
      HIGHSPEED_RAIL: 1,
      LONG_DISTANCE: 1,
      NIGHT_RAIL: 1,
      REGIONAL_FAST_RAIL: 1,
      REGIONAL_RAIL: 1,
      ODM: 1,
      RIDE_SHARING: 0,
      SUBURBAN: 1
    },
    motisAlgorithm: "PONG",
    includeExclude: [],
    include: false,
    transferCost: 0,
    walkReluctance: 1.5,
    waitReluctance: 1,
    walkSpeed: 4.5,
    routingEngines: {
      digitransit: true,
      hekinav: true
    }
  }

};



// crazy typescript magic in the following types

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AllPaths<T> = T extends readonly any[]
  ? never // arrays are leaves, not walkable objects
  : T extends object
  ? {
    [K in keyof T]-?:
    | readonly [K]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | (T[K] extends readonly any[]
      ? never
      : T[K] extends object
      ? readonly [K, ...AllPaths<T[K]>]
      : never);
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PathsToValue<T, V, Prev extends readonly PropertyKey[] = []> = T extends readonly any[]
  ? T extends V
  ? readonly [...Prev]
  : never
  : {
    [K in keyof T]-?: T[K] extends V
    ? readonly [...Prev, K]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : T[K] extends readonly any[]
    ? never
    : T[K] extends object
    ? PathsToValue<T[K], V, readonly [...Prev, K]>
    : never;
  }[keyof T];

export type HekinavConfigPathTo<V> = PathsToValue<HekinavConfig, V>;



export type SetHekinavConfigKey = <V>(
  value: V,
  ...paths: readonly [HekinavConfigPathTo<V>, ...HekinavConfigPathTo<V>[]]
) => void;

export type GetHekinavConfigKey = <P1 extends AllPaths<HekinavConfig>, V = PathValue<HekinavConfig, P1>> (
  ...paths: readonly [P1, ...HekinavConfigPathTo<V>[]]
) => V[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ConfigContext = createContext<{ config: HekinavConfig; setConfig: SetHekinavConfigKey; getConfig: GetHekinavConfigKey }>({ config: structuredClone(defaultConfig), setConfig: () => { }, getConfig: () => { return {} as any } });
