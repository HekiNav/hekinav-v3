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

const GET_PATTERN:
  TypedDocumentNode<PatternQueryQuery, PatternQueryQueryVariables> =
  gql`
query PatternQuery($patternId: String!) {
  pattern(id: $patternId) {
    name
    code
    stops {
      lat
      lon
      name
      gtfsId
      code
      desc
      platformCode
      stopTimesForPattern(id: $patternId, numberOfDepartures: 2) {
        arrivalDelay
        realtimeArrival
        scheduledArrival

        realtime
        departureDelay
        realtimeDeparture
        scheduledDeparture
        serviceDay
      }
    }
    patternGeometry {
      length
      points
    }
    route {
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
      <div className="stops flex flex-col">
        {
          data.stops.map((s, i, a) => {
            const firstDep = s.stopTimesForPattern && s.stopTimesForPattern[0]
            const secondDep = s.stopTimesForPattern && s.stopTimesForPattern[1]
            return (
              <Link className="h-full flex decoration-none" key={i} href={`/stop/${s.gtfsId}/${isHsl ? "?hsl" : ""}`}>
                <div className="flex flex-row w-full">
                  <div className={`mx-4 w-3 relative h-full flex ${i == 0 ? "items-end" : i == a.length - 1 ? "items-start" : ""}`}>
                    <div className={`w-full ${i == 0 || i == a.length - 1 ? "h-5/10" : "h-full"} ${getRouteColor("bg", data.route.type || -1, data.route.mode || "")}`}></div>
                    <div className="absolute -left-1.5 -right-1.5 top-0 bottom-0 flex justify-center items-center">
                      <div className={`bg-white border-white absolute border-[.25rem] bg-white h-7 w-7 rounded-full z-100`}></div>
                      <div className={`${getRouteColor("border", data.route.type || -1, data.route.mode || "")} border-[.25rem] bg-white h-6 w-6 rounded-full z-100`}></div>
                    </div>
                  </div>
                  <div className="p-2 flex flex-row justify-between w-full">
                    <div>
                      <span className="text-lg font-medium">{s.name}</span> {s.platformCode && <Label>pl. {s.platformCode}</Label>} <br />
                      <span className="text-sm">{s.desc}</span> {s.code && <Label className="text-xs bg-gray">{s.code}</Label>}
                    </div>
                    <div className="text-end">
                      {firstDep && <span className={`text-md font-medium ${firstDep.realtime ? "text-green" : "text-black"}`}><DateEl showTime={false} day={firstDep.serviceDay as number || 0} time={firstDep.realtimeDeparture || firstDep.scheduledDeparture || 0}></DateEl></span>} <br />
                      {secondDep && <span className={`text-sm font-medium ${secondDep.realtime ? "text-green" : "text-black"}`}>Next <DateEl showTime={false} day={secondDep.serviceDay as number || 0} time={secondDep.realtimeDeparture || secondDep.scheduledDeparture || 0}></DateEl></span>}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        }
      </div>
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