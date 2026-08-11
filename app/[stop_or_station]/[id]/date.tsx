"use client"
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns-tz";
import { ArrowRightAltW700 as ArrowRightAlt } from "@material-symbols-svg/react/arrow-right-alt"
import Icon from "@/app/components/icon";

export default function Date({time, day, scheduledTime, approx = false, showScheduled = false}: {time: number, day: number, scheduledTime: number, approx?: boolean, showScheduled?: boolean}) {
    const date = new TZDate((time + day) * 1000)
    const scheduledDate = new TZDate((scheduledTime + day) * 1000)
    return <>
        <span className="text-black" hidden={!showScheduled}>{format(scheduledDate,"HH:mm")}</span> <Icon hidden={!showScheduled}><ArrowRightAlt className="text-black" height={16}></ArrowRightAlt></Icon> {approx && "~"}{format(date,"HH:mm")}
    </>
}