"use server"
import { ApolloClient, HttpLink, InMemoryCache, TypedDocumentNode, gql } from "@apollo/client";
import { PlanQueryQuery, PlanQueryQueryVariables } from "./layout.generated";
import { Sidebar } from "@/app/mapcontext";
import { Metadata, ResolvingMetadata } from "next";
import Context from "./provider";
import { headers } from "next/headers";
import { PlanLabeledLocationInput } from "@/app/lib/__generated__/graphql";


const GET_PLAN:
  TypedDocumentNode<PlanQueryQuery, PlanQueryQueryVariables> =
  gql`
  query PlanQuery($origin: PlanLabeledLocationInput!, $destination: PlanLabeledLocationInput!) {
    planConnection(
      origin: $origin,
      destination: $destination
    ) {
      routingErrors {
        code
        description
        inputField
      }
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
            headsign
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
                desc
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
                desc
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

export async function generateMetadata({
  params,
  searchParams
}: {
  params: Promise<{
    start: string
    end: string
  }>,
  searchParams: SearchParams;
},
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { end, start } = await params

  const h = await headers()

  const isHsl = h.get("hsl") != undefined
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
    return { title: "Failed to load routes - Hekinav Routing" }

  }

  return {
    title: `Routes from ${origin.label} to ${destination.label}`,
    description: `View routes and directions from ${origin.label} to ${destination.label} in Hekinav Routing`
  }
}

export default async function StopOrStation({
  params,
  searchParams,
  children,
}: {
  params: Promise<{
    start: string
    end: string
  }>,
  searchParams: SearchParams;
  children: React.ReactNode;
}) {
  const { start, end } = await params

  const h = await headers()
  const isHsl = h.get("hsl") != undefined


  function parseParam(t: string) {
    try {
      return JSON.parse(decodeURIComponent(t))
    } catch {
      return null
    }
  }
  const origin = parseParam(start)
  const destination = parseParam(end)

  const planPromise = getPlan(origin, destination, isHsl)

  return (
    <>
      <Sidebar>

        <Context
          destination={destination}
          origin={origin}
          isHsl={isHsl}
          planPromise={planPromise}
        >
          {children}
        </Context>

      </Sidebar>
    </>
  );
}

export async function getPlan(origin: PlanLabeledLocationInput, destination: PlanLabeledLocationInput, isHsl: boolean) {
  if (!origin || !destination) {
    console.log("NO ORIGIN OR DESTINATION")
    return null
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
    console.log(result.error)
    return null
  }
  const data = result.data.planConnection
  if (!data) {
    console.log("NO DATA")
    return null
  }
  return data
}





