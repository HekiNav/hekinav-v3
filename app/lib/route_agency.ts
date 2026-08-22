"use server"

import { ApolloClient, gql, HttpLink, InMemoryCache, TypedDocumentNode } from "@apollo/client"
import { SearchRouteAgencyQuery, SearchRouteAgencyQueryVariables } from "./route_agency.generated"

export const SEARCH:
    TypedDocumentNode<SearchRouteAgencyQuery, SearchRouteAgencyQueryVariables> =
    gql`
  query SearchRouteAgency ($text: String!) {
  routes (name: $text) {
    longName
    shortName
    type
    mode
    gtfsId
    agency {
      name
    }
  }
  agencies {
    name
    gtfsId
  }
}
  
    `

export async function searchRoutesAgencies(text: string, isHsl: boolean) {
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

    if (result.error || !result.data || !result.data.routes || !result.data.agencies) return null

    return result.data
}