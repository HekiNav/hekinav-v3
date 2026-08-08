"use server"

import { redirect } from "next/navigation";
import { MapOverlay, Sidebar } from "../../mapcontext";


type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;


export default async function StopOrStation({
  params,
  searchParams
}: {
  params: Promise<{
    stop_or_station: string
    id: string
  }>,
  searchParams: SearchParams;
}) {
  const { id, stop_or_station } = await params

  const isHsl = (await searchParams).hsl != undefined
  if (stop_or_station != "stop" && stop_or_station != "station") {
    redirect(`/${isHsl ? "?hsl" : ""}`)
  }

  return (
    <>
      <Sidebar>
        test
      </Sidebar>
      <MapOverlay>

      </MapOverlay>
    </>
  );
}
