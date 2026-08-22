"use client"
import RoutingUi from "@/app/components/RoutingUi";
import Icon from "@/app/components/icon";
import { Sidebar } from "@/app/mapcontext";
import { ArrowForwardIosW700 } from "@material-symbols-svg/react/icons/arrow-forward-ios";
import Skeleton from "react-loading-skeleton";


export default function Loading() {
    return (
        <>
            <Sidebar>
                <h2 className="m-0 w-full text-center text-3xl my-1">Routing options</h2>
            </Sidebar>
            <RoutingUi iOrigin={{ icon: <></>, id: "origin", text: "Loading..." }} iDestination={{ icon: <></>, id: "origin", text: "Loading..." }}></RoutingUi>
            <div className="flex flex-col gap-2">
                <SkeletonItinerary></SkeletonItinerary>
                <SkeletonItinerary></SkeletonItinerary>
                <SkeletonItinerary></SkeletonItinerary>
                <SkeletonItinerary></SkeletonItinerary>
                <SkeletonItinerary></SkeletonItinerary>
                <SkeletonItinerary></SkeletonItinerary>
                <SkeletonItinerary></SkeletonItinerary>
            </div>
        </>
    );
}

type FakeLeg = {
    duration: number
}
function SkeletonItinerary() {
    const legs: FakeLeg[] = []

    while (legs.reduce((p, c) => p + c.duration, 0) < 200) {
        // eslint-disable-next-line react-hooks/purity
        legs.push({ duration: (legs[legs.length - 1] || { duration: 200 }).duration < 30 ? 20 + Math.random() * 150 : 5 + Math.random() * 40 })
    }


    return (
        <div className="border-3 focus:border-green rounded-xl flex flex-row gap-1">
            <div className="flex flex-col gap-1 shrink w-full py-1 px-2">
                <div className="w-full flex justify-between">
                    <span className="font-medium"><Skeleton width={100}></Skeleton></span>
                    <span className="gap-0! text-md font-medium"><Skeleton width={60}></Skeleton></span>
                </div>
                <div className="w-full h-5 flex flex-row gap-1">
                    {legs.map((l, i) => (
                        <div key={i} style={{ width: `${l?.duration}%` }}><Skeleton containerClassName="w-full h-full" className={`h-full w-full`}></Skeleton></div>
                    ))}
                </div>
                <div className="w-full flex justify-between items-end">
                    <Skeleton width={200}></Skeleton>
                    <Skeleton width={80}></Skeleton>
                </div>
            </div>
            <div className="flex items-center justify-center border-l-3 h-full">
                <Icon><ArrowForwardIosW700 height={32} width={32}></ArrowForwardIosW700></Icon>
            </div>
        </div>
    )
}

function getColorFromDelay(delay: number) {
    if (delay > 900) {
        return "text-red"
    } else if (delay > 120) {
        return "text-orange"
    } else if (delay < -120) {
        return "text-cyan"
    } else {
        return "text-green"
    }
}
