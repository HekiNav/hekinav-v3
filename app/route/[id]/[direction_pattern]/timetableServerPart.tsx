"use server"

import { ApolloClient, HttpLink, InMemoryCache, TypedDocumentNode, gql } from "@apollo/client";
import { ContentProps } from "./content";
import { RouteTimetableQueryQuery, RouteTimetableQueryQueryVariables } from "./timetableServerPart.generated";


const GET_PATTERN_TIMETABLE:
  TypedDocumentNode<RouteTimetableQueryQuery, RouteTimetableQueryQueryVariables> =
  gql`
query RouteTimetableQuery($routeId: String!, $date: LocalDate!) {
  route(id: $routeId) {
    patterns {
      directionId
      tripsOnServiceDate(serviceDate: $date) {
        stopCalls {
          stopLocation {
            __typename
            ... on Stop {
              name
              gtfsId
              platformCode
              code
              desc
            }
          }
          schedule {
            time {
              __typename
              ... on ArrivalDepartureTime {
                arrival
                departure
              }
              ... on TimeWindow {
                start
                end
              }
            }
          }
        }
      }
    }
  }
}


`


export async function getTimetable({
  data,
  isHsl,
  date
}: ContentProps & {date: string}) {

  const client = new ApolloClient({
    link: new HttpLink({ uri: `https://api.digitransit.fi/routing/v2/${isHsl ? "hsl" : "finland"}/gtfs/v1/`, headers: { "digitransit-subscription-key": process.env.DIGITRANSIT_KEY || "" } }),
    cache: new InMemoryCache(),
  });

  const result = await client.query({
    query: GET_PATTERN_TIMETABLE,
    variables: {
      routeId: data.route.gtfsId,
      date: date
    }
  })

  if (result.error || !result.data) {
    return null
  }
  const timetable = result.data.route
  if (!timetable) return null
  return timetable
}







