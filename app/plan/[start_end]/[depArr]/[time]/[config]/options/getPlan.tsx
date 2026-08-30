"use server";
import { PlanLabeledLocationInput, PlanVisitViaLocationInput, TransitMode } from "@/app/lib/__generated__/graphql";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { GET_PLAN } from "./layout";
import { DTTransitModes, MotisTransitModes, RoutingConfig } from "@/app/lib/digitransit";
import { plan, PlanResponse } from "@motis-project/motis-client"
import { PlanQueryQuery } from "./layout.generated";
import { typedEntries } from "@/app/lib/typedEntries";
import { MotisTransitType } from "@/app/HekinavConfig";


export async function getPlan(origin: PlanLabeledLocationInput, destination: PlanLabeledLocationInput, via: PlanVisitViaLocationInput[], isHsl: boolean, config: RoutingConfig, dateTime: string, depArr: "dep" | "arr"): Promise<GetPlanResponse | null> {
  if (!origin || !destination) {
    console.log("NO ORIGIN OR DESTINATION");
    return null;
  }

  const client = new ApolloClient({
    link: new HttpLink({ uri: `https://api.digitransit.fi/routing/v2/${isHsl ? "hsl" : "finland"}/gtfs/v1/`, headers: { "digitransit-subscription-key": process.env.DIGITRANSIT_KEY || "" } }),
    cache: new InMemoryCache(),
  });

  const filter = config.includeExclude.reduce((p, c) => { const k = c.type == "agency" ? "agencies" : "routes"; return { ...p, [k]: [...(p[k] || []), c.id] } }, { agencies: null, routes: null } as { agencies: string[] | null, routes: string[] | null });

  const [result, motisResponse] = await Promise.all([
    config.routingEngines.digitransit ? client.query({
      query: GET_PLAN,
      variables: {
        destination,
        origin,
        preferences: {
          transit: {
            filters: filter.agencies && filter.routes ? [
              {
                include: config.include ? (filter.agencies && filter.routes ? [filter] : null) : null,
                exclude: config.include ? null : (filter.agencies && filter.routes ? [filter] : null)
              }
            ] : null,
            board: {
              waitReluctance: config.waitReluctance
            },
            transfer: {
              cost: config.transferCost
            }
          },
          street: {
            walk: {
              reluctance: config.walkReluctance,
              speed: config.walkSpeed / 3.6
            }
          }
        },
        modes: {
          transit: {
            transit: (typedEntries(config.modes).filter(([k]) => DTTransitModes.some(m => k == m)) as [TransitMode, number][]).map(([k, v]) => ({ mode: k, cost: { reluctance: v } })).filter(e => e.cost.reluctance != 0)
          }
        },
        via: via.map(e => ({ visit: e })),
        dateTime: { [depArr == "arr" ? "latestArrival" : "earliestDeparture"]: dateTime }
      }
    }) : null,
    (via.length == 0 && config.routingEngines.hekinav) ? plan({
      baseUrl: 'https://motis.hekinav.dev',
      querySerializer: {
        array: {
          explode: false,
          style: "form"
        }
      },
      query: {
        fromPlace: `${origin.location.coordinate?.latitude},${origin.location.coordinate?.longitude}`,
        toPlace: `${destination.location.coordinate?.latitude},${destination.location.coordinate?.longitude}`,
        numItineraries: 10,
        pedestrianSpeed: config.walkSpeed / 3.6,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        transitModes: [...(typedEntries(config.modes).filter(([k]) => MotisTransitModes.some(m => k == m)) as [MotisTransitType, number][]).filter(([_, v]) => v != 0).map(([k]) => k)],
        algorithm: config.motisAlgorithm,
        time: dateTime,
        arriveBy: depArr == "arr"
      }
    }) : null])


  if (result?.error || !result?.data) {
    console.log(result?.error);
    return null;
  }
  const data = result.data.planConnection;
  if (!data || !motisResponse || !motisResponse.data) {
    console.log("NO DATA");
    return null;
  }
  return { dt: data, motis: motisResponse.data };
}
export interface GetPlanResponse {
  dt: NonNullable<PlanQueryQuery["planConnection"]>,
  motis: PlanResponse
}
