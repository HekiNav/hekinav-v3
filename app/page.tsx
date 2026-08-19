"use server"

import { Metadata } from "next";
import HomeContent from "./content";


export const metadata: Metadata = {
  title: "Hekinav Routing",
  description: "View departures",
};


export default async function Home() {



  return (
    <>
      <HomeContent></HomeContent>
    </>
  );
}

