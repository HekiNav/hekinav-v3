"use server";
import { PlanLabeledLocationInput, PlanVisitViaLocationInput } from "@/app/lib/__generated__/graphql";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { GET_PLAN } from "./layout";
import { RoutingConfig } from "@/app/lib/digitransit";
import { TZDate } from "@date-fns/tz";
import { plan, PlanResponse } from "@motis-project/motis-client"
import { PlanQueryQuery } from "./layout.generated";


export async function getPlan(origin: PlanLabeledLocationInput, destination: PlanLabeledLocationInput, via: PlanVisitViaLocationInput[], isHsl: boolean, config: RoutingConfig, dateTime: TZDate, depArr: "dep" | "arr"): Promise<GetPlanResponse | null> {
  if (!origin || !destination) {
    console.log("NO ORIGIN OR DESTINATION");
    return null;
  }

  const client = new ApolloClient({
    link: new HttpLink({ uri: `https://api.digitransit.fi/routing/v2/${isHsl ? "hsl" : "finland"}/gtfs/v1/`, headers: { "digitransit-subscription-key": process.env.DIGITRANSIT_KEY || "" } }),
    cache: new InMemoryCache(),
  });



  const [result, motisResponse] = await Promise.all([client.query({
    query: GET_PLAN,
    variables: {
      destination,
      origin,
      ...config,
      via: via.map(e => ({ visit: e })),
      dateTime: { [depArr == "arr" ? "latestArrival" : "earliestDeparture"]: dateTime }
    }
  }),
  plan({
    throwOnError: true,
    baseUrl: 'https://motis.hekinav.dev',
    query: {
      fromPlace: `${origin.location.coordinate?.latitude},${origin.location.coordinate?.longitude}`,
      toPlace: `${destination.location.coordinate?.latitude},${destination.location.coordinate?.longitude}`
    }
  })])

  if (result.error || !result.data) {
    console.log(result.error);
    return null;
  }
  const data = result.data.planConnection;
  if (!data) {
    console.log("NO DATA");
    return null;
  }
  return { dt: data, motis: motisResponse.data };
}
export interface GetPlanResponse {
  dt: NonNullable<PlanQueryQuery["planConnection"]>,
  motis: PlanResponse
}
