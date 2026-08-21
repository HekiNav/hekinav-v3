"use server"
import { TypedDocumentNode, gql } from "@apollo/client";
import { PlanQueryQuery, PlanQueryQueryVariables } from "./layout.generated";
import { Sidebar } from "@/app/mapcontext";
import { Metadata, ResolvingMetadata } from "next";
import Context from "./provider";
import { headers } from "next/headers";
import { getPlan } from "./getPlan";


export const GET_PLAN:
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

export default async function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <>
      <Sidebar>

        <Context
        >
          {children}
        </Context>

      </Sidebar>
    </>
  );
}


