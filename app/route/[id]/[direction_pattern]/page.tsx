"use server"

import { redirect } from "next/navigation";
import { getRouteColor, gtfsIdRegex } from "@/app/lib/digitransit";
import { ApolloClient, gql, HttpLink, InMemoryCache, TypedDocumentNode } from "@apollo/client";
import Toast from "@/app/components/toast";
import Link from "next/link";
import { Sidebar } from "@/app/mapcontext";
import { PatternMetadataQueryQuery, PatternQueryQuery, PatternQueryQueryVariables } from "./page.generated";
import Label from "@/app/components/label";
import Icon from "@/app/components/icon";
import { ArrowRightAltW700 as ArrowRightAlt } from '@material-symbols-svg/react/icons/arrow-right-alt';
import Dropdown, { DropdownItem } from "@/app/components/dropdown";
import { SyncAltW700 as SyncAlt } from '@material-symbols-svg/react/icons/sync-alt';
import DateEl from "@/app/components/Date";
import { Map } from "./Map";
import { Metadata } from "next";
import Content from "./content";

const GET_PATTERN:
  TypedDocumentNode<PatternQueryQuery, PatternQueryQueryVariables> =
  gql`
query PatternQuery($patternId: String!) {
  pattern(id: $patternId) {
    code
    name
    alerts {
      alertCause
      alertDescriptionText
      alertHeaderText
      alertSeverityLevel
      entities {
        __typename
        ... on Agency {
          name
        }
        ... on Route {
          shortName
          longName
          mode
          type
        }
        ... on RouteType {
          routeType
          routes {
            shortName
            longName
          }
        }
        ... on Stop {
          name
          code
          platformCode
          gtfsId
        }
        ... on Pattern {
          route {
            shortName
            longName
          }
          headsign
        }
      }
    }
    stops {
      name
      gtfsId
      code
      desc
      platformCode
      
      lat
      lon
      stopTimesForPattern(id: $patternId, numberOfDepartures: 2) {
        arrivalDelay
        realtimeArrival
        scheduledArrival
        serviceDay

        realtime
        departureDelay
        realtimeDeparture
        scheduledDeparture
      }
    }
    patternGeometry {
      length
      points
    }
    route {
      stops {
        name
        gtfsId
        code
        desc
        platformCode
      }
      gtfsId
      mode
      type
      shortName
      longName
      patterns {
        code
        directionId
        stops {
          name
        }
      }

    }
  }
}



    `

const GET_PATTERN_METADATA:
  TypedDocumentNode<PatternMetadataQueryQuery, PatternQueryQueryVariables> =
  gql`
  query PatternMetadataQuery($patternId: String!) {
    pattern(id: $patternId) {
      name
      code
      route {
        shortName
        longName
      }
    }
  }
  
  
      `

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata({
  params,
  searchParams
}: {
  params: Promise<{
    direction_pattern: string
    id: string
  }>,
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { id, direction_pattern } = await params

  const [direction, pattern] = direction_pattern.split("-")

  const isHsl = (await searchParams).hsl != undefined

  if (!gtfsIdRegex.test(decodeURIComponent(id))) {
    return { title: "Unknown Route - Hekinav Routing" }
  }

  const client = new ApolloClient({
    link: new HttpLink({ uri: `https://api.digitransit.fi/routing/v2/${isHsl ? "hsl" : "finland"}/gtfs/v1/`, headers: { "digitransit-subscription-key": process.env.DIGITRANSIT_KEY || "" } }),
    cache: new InMemoryCache(),
  });

  const query = GET_PATTERN_METADATA
  const result = await client.query({
    query: query,
    variables: {
      patternId: `${decodeURIComponent(id)}:${direction}:${pattern}`
    }
  })

  if (result.error || !result.data) {
    return { title: "Unknown Route - Hekinav Routing" }
  }
  const data = result.data.pattern
  if (!data) return { title: "Unknown Route - Hekinav Routing" }

  return {
    title: `${data.route.shortName ? `[${data.route.shortName}]` : ""} ${data.route.longName || ""}`,
    description: `View stops and trips of ${data.route.shortName || ""} ${data.route.longName || ""} in Hekinav Routing`
  }
}


export default async function Route({
  params,
  searchParams
}: {
  params: Promise<{
    direction_pattern: string
    id: string
  }>,
  searchParams: SearchParams;
}) {
  const { id, direction_pattern } = await params

  const [direction, pattern] = direction_pattern.split("-")


  const isHsl = (await searchParams).hsl != undefined

  if (!gtfsIdRegex.test(decodeURIComponent(id))) {
    redirect(`/${isHsl ? "?hsl" : ""}`)
  }
  if (isHsl && id.slice(0, 3) != "HSL") {
    return (
      <Sidebar>
        Failed to load route
        <Toast type="error" message={<span>You are using the HSL-only mode. This route does not look like a HSL route. <Link className="text-green" href="/?hsl">Go to home</Link> or <Link className="text-green" href="./">Change to the Finland-wide version</Link> </span>}></Toast>
      </Sidebar>
    )
  }

  const client = new ApolloClient({
    link: new HttpLink({ uri: `https://api.digitransit.fi/routing/v2/${isHsl ? "hsl" : "finland"}/gtfs/v1/`, headers: { "digitransit-subscription-key": process.env.DIGITRANSIT_KEY || "" } }),
    cache: new InMemoryCache(),
  });

  const result = await client.query({
    query: GET_PATTERN,
    variables: {
      patternId: `${decodeURIComponent(id)}:${direction}:${pattern}`
    }
  })

  if (result.error || !result.data) {
    return (
      <Sidebar>
        Failed to load route
        <Toast type="error" message={`Failed to get route data: ${result.error?.message || "Unknown error"}`}></Toast>
      </Sidebar>
    )
  }
  const data = result.data.pattern
  if (!data || !data.stops) return (
    <Sidebar>
      Failed to load route
    </Sidebar>
  )

  const patternOptions: DropdownItem<string>[] = (result.data.pattern?.route.patterns || []).filter(p => p?.code != data.code).map(p => ({
    content: (p && <Link className="decoration-none" href={`/route/${id}/${p.directionId}-${p.code.split(":")[3]}/${isHsl ? "?hsl" : ""}`}><Pattern data={p as never}></Pattern></Link>), id: p?.code || ""
  }))

  const firstPattern = data.route.patterns && data.route.patterns.find(p => p?.code != data.code)


  return (
    <Sidebar>
        <span className="flex justify-start items-center gap-2 mb-2 ml-14 mt-1">
          <Label className={`text-2xl w-min ${getRouteColor("bg", data.route.type || -1, data.route.mode || "")} text-white font-bold`}>{data.route.shortName || data.route.longName}</Label>
          <Pattern data={data}></Pattern> {(patternOptions.length == 1 && firstPattern) && <Link className="decoration-none ml-auto" href={`/route/${id}/${firstPattern.directionId}-${firstPattern.code.split(":")[3]}/${isHsl ? "?hsl" : ""}`}><Icon boxed><SyncAlt></SyncAlt></Icon></Link>}
        </span>
        {patternOptions.length > 1 && <Dropdown initial={<span className="text-xl font-medium text-green">Other patterns</span>} items={patternOptions}></Dropdown>}
        <Content directionId={Number(direction)} data={data} isHsl={isHsl}></Content>
        <Map data={data} routeId={id} direction={Number(direction)} />
    </Sidebar>
  )
}

function Pattern({ data }: { data: Omit<NonNullable<PatternQueryQuery["pattern"]>, "route" | "name"> }) {
  if (!data.stops) return data.code
  return (
    <div className="flex justify-start items-center gap-1">
      <span className="font-medium text-xl">{data.stops[0].name}</span>
      <Icon><ArrowRightAlt height={24}></ArrowRightAlt></Icon>
      <span className="font-medium text-xl">{data.stops[data.stops.length - 1].name}</span>
    </div>
  )
}