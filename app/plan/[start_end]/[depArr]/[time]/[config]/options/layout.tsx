"use server"
import { TypedDocumentNode, gql } from "@apollo/client";
import { PlanQueryQuery, PlanQueryQueryVariables } from "./layout.generated";
import { Sidebar } from "@/app/mapcontext";
import { Metadata } from "next";
import Context from "./provider";


export const GET_PLAN:
  TypedDocumentNode<PlanQueryQuery, PlanQueryQueryVariables> =
  gql`
  query PlanQuery($origin: PlanLabeledLocationInput!, $destination: PlanLabeledLocationInput!, $preferences: PlanPreferencesInput!, $modes: PlanModesInput!, $dateTime: PlanDateTimeInput!, $via: [PlanViaLocationInput!]) {
    planConnection(
      origin: $origin,
      destination: $destination,
      preferences: $preferences,
      modes: $modes,
      dateTime: $dateTime,
      via: $via
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
              departureStoptime {
                scheduledDeparture
              }
              gtfsId
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
  params }: {
    params: Promise<{
      start_end: string
      time: string
      config: string
      depArr: string
    }>,
    searchParams: SearchParams;
  }): Promise<Metadata> {
  const { start_end } = await params

  const [origin, destination, ...via] = parseParam(start_end) || []

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
  params
}: {
  children: React.ReactNode;
  params: Promise<{
    start_end: string
    time: string
    config: string
    depArr: string
  }>,
}) {
  const { start_end, config, time, depArr } = await params



  if (typeof start_end != "string" || (depArr != "dep" && depArr != "arr")) {
    return (
      "failed to load"
    )
  }

  return (
    <>
      <Sidebar>

        <Context
          start_end={start_end}
          time={time}
          config={config}
          depArr={depArr}
        >
          {children}
        </Context>

      </Sidebar>
    </>
  );
}
function parseParam(t: string) {
  try {
    return JSON.parse(decodeURIComponent(t))
  } catch {
    return null
  }
}


