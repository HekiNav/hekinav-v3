"use server"
import { ApolloClient, HttpLink, InMemoryCache, TypedDocumentNode, gql } from "@apollo/client";
import { PlanQueryQuery,PlanQueryQueryVariables } from "./page.generated";
import Toast from "@/app/components/toast";
import Content from "./content";
import { Map } from "./Map";
import { MapOverlay, Sidebar } from "@/app/mapcontext";


const GET_PLAN:
  TypedDocumentNode<PlanQueryQuery, PlanQueryQueryVariables> =
  gql`
  query PlanQuery($origin: PlanLabeledLocationInput!, $destination: PlanLabeledLocationInput!) {
    planConnection(
      origin: $origin,
      destination: $destination
    ) {
      edges {
        cursor
        node {
          start 
          end
          waitingTime
          walkDistance
          walkTime
          duration
          numberOfTransfers
          legs {
            transitLeg
            interlineWithPreviousLeg
            duration
            distance
            mode
            realTime
            realtimeState
            start {
              estimated {
                delay
                time
              }
              scheduledTime
            }
            end {
              estimated {
                delay
                time
              }
              scheduledTime
            }
            trip {
              pattern{
                code
                directionId
              }
              route {
                shortName
                longName
                gtfsId
                mode
                type
              }
            }
            legGeometry {
              length
              points
            }
            from {
              arrival {
                estimated {
                  delay
                  time
                }
                scheduledTime
              }
              departure {
                estimated {
                  delay
                  time
                }
                scheduledTime
              }
              stop {
                name
                platformCode
                code
                gtfsId
                locationType
              }
              lat
              lon
              name
              viaLocationType
            }
            to {
              arrival {
                estimated {
                  delay
                  time
                }
                scheduledTime
              }
              departure {
                estimated {
                  delay
                  time
                }
                scheduledTime
              }
              stop {
                name
                platformCode
                code
                gtfsId
                locationType
              }
              lat
              lon
              name
              viaLocationType
            }
          }
        }
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
    start: string
    end: string
  }>,
  searchParams: SearchParams;
}) {
  const { start, end } = await params

  const isHsl = (await searchParams).hsl != undefined

  function parseParam(t: string) {
    try {
      return JSON.parse(decodeURIComponent(t))
    } catch {
      return null
    }
  }
  const origin = parseParam(start)
  const destination = parseParam(end)

  if (!origin || !destination) {
    return (
      <Sidebar>
        Failed to load
        <Toast type="error" message={`Failed to get data: Invalid start or end`}></Toast>
      </Sidebar>
    )
  }

  const client = new ApolloClient({
    link: new HttpLink({ uri: `https://api.digitransit.fi/routing/v2/${isHsl ? "hsl" : "finland"}/gtfs/v1/`, headers: { "digitransit-subscription-key": process.env.DIGITRANSIT_KEY || "" } }),
    cache: new InMemoryCache(),
  });

  const result = await client.query({
    query: GET_PLAN,
    variables: {
      destination,
      origin
    }
  })

  if (result.error || !result.data) {
    return (
      <Sidebar>
        Failed to load stop
        <Toast type="error" message={`Failed to get stop data: ${result.error?.message || "Unknown error"}`}></Toast>
      </Sidebar>
    )
  }
  const data = result.data.planConnection
  if (!data) return

  return (
    <>
      <Sidebar>

        <Content
          data={data as NonNullable<PlanQueryQuery["planConnection"]>}
          isHsl={isHsl}
        />

      </Sidebar>
      <MapOverlay>
        <Map data={data as NonNullable<PlanQueryQuery["planConnection"]>}

        />
      </MapOverlay>
    </>
  );
}







