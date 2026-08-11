"use server"

import { MapOverlay, Sidebar } from "../../mapcontext";
import IconItem from "@/app/components/iconitem";
import Skeleton from "react-loading-skeleton";



async function SkeletonDep() {
  return (
    <tr className={`px-1 border-t-3 border-white`}>
      {/* eslint-disable-next-line react-hooks/purity */}
      <td><Skeleton width={20 + Math.random() * 20}></Skeleton></td>
      {/* eslint-disable-next-line react-hooks/purity */}
      <td><Skeleton width={100 + Math.random() * 200}></Skeleton></td>
      <td className="text-end"><Skeleton width={40}></Skeleton></td>
    </tr>
  )
}


export default async function Loading() {

  return (
    <>
      <Sidebar>
        <IconItem icon={{ children: <Skeleton width={32} height={32}></Skeleton> }} className="text-lg"><span className="text-2xl"><Skeleton width={200}></Skeleton></span> <Skeleton width={40}></Skeleton></IconItem>
        <div className="text-sm"><Skeleton width={60}></Skeleton></div>
        <h2 className="text-lg"><Skeleton width={80}></Skeleton></h2>
        <table><tbody>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
          <SkeletonDep></SkeletonDep>
        </tbody>
        </table>
      </Sidebar>
      <MapOverlay>
        <div></div>
      </MapOverlay>
    </>
  );
}
