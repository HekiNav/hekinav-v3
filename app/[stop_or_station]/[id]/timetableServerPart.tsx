"use server"

import { ApolloClient, HttpLink, InMemoryCache, TypedDocumentNode, gql } from "@apollo/client";
import { ContentProps } from "./content";
import { StationTimetableQueryQuery, StationTimetableQueryQueryVariables, StopTimetableQueryQuery, StopTimetableQueryQueryVariables } from "./timetableServerPart.generated";

const GET_STOP:
  TypedDocumentNode<StopTimetableQueryQuery, StopTimetableQueryQueryVariables> =
  gql`
    query StopTimetableQuery($stopId: String!, $date: String!) {
  stop(id: $stopId) {
    stoptimesForServiceDate(date: $date) {
      pattern {
        stops {
          name
        }
        route {
          shortName
          longName
          agency {
            name
          }
        }
      }
      stoptimes {
        scheduledDeparture
        realtimeState
        serviceDay
      }
    }
  }
}

    `

const GET_STATION:
  TypedDocumentNode<StationTimetableQueryQuery, StationTimetableQueryQueryVariables> =
  gql`
    query StationTimetableQuery($stopId: String!, $date: String!) {
  station(id: $stopId) {
    stoptimesForServiceDate(date: $date) {
      pattern {
        stops {
          name
        }
        route {
          shortName
          longName
          agency {
            name
          }
        }
      }
      stoptimes {
        scheduledDeparture
        realtimeState
        serviceDay
      }
    }
  }
}

    `


export async function getTimetable({
  data,
  isHsl,
  stop_or_station,
  date
}: ContentProps & {date: string}) {

  const client = new ApolloClient({
    link: new HttpLink({ uri: `https://api.digitransit.fi/routing/v2/${isHsl ? "hsl" : "finland"}/gtfs/v1/`, headers: { "digitransit-subscription-key": process.env.DIGITRANSIT_KEY || "" } }),
    cache: new InMemoryCache(),
  });

  const query = stop_or_station == "station" ? GET_STATION : GET_STOP
  const result = await client.query({
    query: query as TypedDocumentNode<StationTimetableQueryQuery | StopTimetableQueryQuery, StationTimetableQueryQueryVariables | StopTimetableQueryQueryVariables>,
    variables: {
      stopId: data.gtfsId,
      date: date
    }
  })

  if (result.error || !result.data) {
    return null
  }
  const timetable = (result.data as StopTimetableQueryQuery).stop || (result.data as StationTimetableQueryQuery).station
  if (!timetable) return null
  return timetable
}







