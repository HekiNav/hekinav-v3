"use server"

import { ApolloClient, gql, HttpLink, InMemoryCache, TypedDocumentNode } from "@apollo/client";
import { SearchQuery, SearchQueryVariables } from "./searchStopsStations.generated";
import { searchDigitransit } from "./search";
import { LngLat } from "maplibre-gl";

const SEARCH:
  TypedDocumentNode<SearchQuery, SearchQueryVariables> =
  gql`
query Search ($text: String!) {
  routes (name: $text) {
    longName
    shortName
    type
    mode
    gtfsId
    agency {
      name
    }
    patterns {
      code
    }
  }
}
`

export async function searchRoutes(text: string, isHsl: boolean) {
  const client = new ApolloClient({
    link: new HttpLink({ uri: `https://api.digitransit.fi/routing/v2/${isHsl ? "hsl" : "finland"}/gtfs/v1/`, headers: { "digitransit-subscription-key": process.env.DIGITRANSIT_KEY || "" } }),
    cache: new InMemoryCache(),
  });

  const result = await client.query({
    query: SEARCH,
    variables: {
      text: text
    }
  })

  if (result.error || !result.data || !result.data.routes) return null

  return result.data.routes
}

export async function searchStopsStations(text: string, isHsl: boolean, focusPoint: [number,number]) {


  const result = await searchDigitransit(text, new LngLat(...focusPoint), isHsl, [["stop", "station"]])

  return result
}