"use client"

import { MapOverlay, Sidebar } from "@/app/mapcontext";
import Skeleton from "react-loading-skeleton";



function SkeletonStop({ first = false, last = false }: { first?: boolean, last?: boolean }) {
  return (
    <div className="flex flex-row w-full">
      <div className={`mx-4 w-3 relative h-full flex ${first ? "items-end" : last ? "items-start" : ""}`}>
        <div className={`w-full ${first || last ? "h-5/10" : "h-full"} bg-[#eee]`}></div>
        <div className="absolute -left-1.5 -right-1.5 top-0 bottom-0 flex justify-center items-center">
          <div className={`border-[#eee] border-[.25rem] bg-white h-6 w-6 rounded-full z-100`}></div>
        </div>
      </div>
      <div className="p-2 flex flex-row justify-between w-full mb-1">
        <div>
          {/* eslint-disable-next-line react-hooks/purity */}
          <span className="text-lgs"><Skeleton inline width={100 + Math.random() * 200}></Skeleton></span> <br />
          {/* eslint-disable-next-line react-hooks/purity */}
          <span className="text-sm"><Skeleton inline width={100 + Math.random() * 200}></Skeleton></span>
        </div>
        <div className="text-end">
          <Skeleton className="text-md" width={40} inline></Skeleton> <br />
          <Skeleton className="text-sm" width={60} inline></Skeleton>
        </div>
      </div>
    </div>)
}


export default function Loading() {

  return (
    <>
      <Sidebar>
        <span className="flex justify-start items-center gap-2 mb-4 pb-[1px]">
          <Skeleton className="text-3xl" width={60}></Skeleton>
          <Skeleton className="text-xl" width={150}></Skeleton>
          <Skeleton className="text-xl" width={150}></Skeleton>
        </span>
        <div className="flex w-full h-full flex-col">
          <SkeletonStop first></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop></SkeletonStop>
          <SkeletonStop last></SkeletonStop>
        </div>
      </Sidebar>
      <MapOverlay>
        <div></div>
      </MapOverlay>
    </>
  );
}
