"use server";
import { PlanLabeledLocationInput } from "@/app/lib/__generated__/graphql";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { GET_PLAN } from "./layout";


export async function getPlan(origin: PlanLabeledLocationInput, destination: PlanLabeledLocationInput, isHsl: boolean) {
  console.log("djjdj")
  if (!origin || !destination) {
    console.log("NO ORIGIN OR DESTINATION");
    return null;
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
  });

  if (result.error || !result.data) {
    console.log(result.error);
    return null;
  }
  const data = result.data.planConnection;
  if (!data) {
    console.log("NO DATA");
    return null;
  }
  return data;
}
