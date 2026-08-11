"use server"

import { redirect } from "next/navigation";
import { gtfsIdRegex } from "@/app/lib/digitransit";
import { ApolloClient, gql, HttpLink, InMemoryCache, TypedDocumentNode } from "@apollo/client";
import Toast from "@/app/components/toast";
import Link from "next/link";
import { Sidebar } from "@/app/mapcontext";

const GET_STATION:
  TypedDocumentNode<StationQueryQuery, StationQueryQueryVariables> =
  gql`
query PatternQuery($patternId: String!) {
  pattern(id: $patternId) {
    name
    stops {
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
      }
    }
    route {
      shortName
      longName
    }
  }
}
    `

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;


export default async function StopOrStation({
  params,
  searchParams
}: {
  params: Promise<{
    direction: string
    pattern: string
    id: string
  }>,
  searchParams: SearchParams;
}) {
  const { id, direction, pattern } = await params

  console.log(id,direction,pattern)

  const isHsl = (await searchParams).hsl != undefined
  
  if (!gtfsIdRegex.test(decodeURIComponent(id))) {
    redirect(`/${isHsl ? "?hsl" : ""}`)
  }
  if (isHsl && id.slice(0, 3) != "HSL") {
    return (
      <Sidebar>
        Failed to load stop
        <Toast type="error" message={<span>You are using the HSL-only mode. This stop does not look like a HSL route. <Link className="text-green" href="/?hsl">Go to home</Link> or <Link className="text-green" href="./">Change to the Finland-wide version</Link> </span>}></Toast>
      </Sidebar>
    )
  }

  const client = new ApolloClient({
    link: new HttpLink({ uri: `https://api.digitransit.fi/routing/v2/${isHsl ? "hsl" : "finland"}/gtfs/v1/`, headers: { "digitransit-subscription-key": process.env.DIGITRANSIT_KEY || "" } }),
    cache: new InMemoryCache(),
  });

  return (
    <Sidebar>
      Test
    </Sidebar>
  )

}