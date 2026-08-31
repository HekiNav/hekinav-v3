"use server"

import { redirect } from "next/navigation";
import { gtfsIdRegex } from "@/app/lib/digitransit";
import { ApolloClient, gql, HttpLink, InMemoryCache, TypedDocumentNode } from "@apollo/client";
import { Metadata } from "next";
import { RouteQueryQuery, RouteQueryQueryVariables } from "./page.generated";

const GET_ROUTE:
    TypedDocumentNode<RouteQueryQuery, RouteQueryQueryVariables> =
    gql`
query RouteQuery($routeId: String!) {
  route(id: $routeId) {
    patterns {
      code
      directionId
    }
  }
}

`

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Route({
    params,
    searchParams
}: {
    params: Promise<{
        id: string
    }>,
    searchParams: SearchParams;
}): Promise<Metadata> {
    const { id } = await params


    const isHsl = (await searchParams).hsl != undefined

    if (!gtfsIdRegex.test(decodeURIComponent(id))) {
        return { title: "Unknown Route - Hekinav Routing" }
    }

    const client = new ApolloClient({
        link: new HttpLink({ uri: `https://api.digitransit.fi/routing/v2/${isHsl ? "hsl" : "finland"}/gtfs/v1/`, headers: { "digitransit-subscription-key": process.env.DIGITRANSIT_KEY || "" } }),
        cache: new InMemoryCache(),
    });

    const result = await client.query({
        query: GET_ROUTE,
        variables: {
            routeId: decodeURIComponent(id)
        }
    })

    if (result.error || !result.data) {
        redirect("/")
    }
    const data = result.data?.route
    if (!data || !data.patterns || !data.patterns[0]) redirect("/")

    const pattern = data.patterns[0]
    redirect(`/route/${id}/${pattern.code.split(":")[2]}-${pattern.code.split(":")[3]}/${isHsl ? "?hsl" : ""}`)
}