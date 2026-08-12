"use client"
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns-tz";
import { ArrowRightAltW700 as ArrowRightAlt } from "@material-symbols-svg/react/arrow-right-alt"
import Icon from "@/app/components/icon";

export default function DateEl({ time, day, scheduledTime, approx = false, showScheduled = false }: { time: number, day: number, scheduledTime: number, approx?: boolean, showScheduled?: boolean }) {
    const date = new TZDate((time + day) * 1000)
    const scheduledDate = new TZDate((scheduledTime + day) * 1000)
    // eslint-disable-next-line react-hooks/purity
    const minFromNow = Math.floor((date.getTime() - Date.now()) / 60_000)
    // eslint-disable-next-line react-hooks/purity
    const minFromNowScheduled = Math.floor((scheduledDate.getTime() - Date.now()) / 60_000)
    return <>
        <span className="text-black text-nowrap" hidden={!showScheduled}>{minFromNow <= 10 ? minFromNowScheduled == 0 ? "now" : Math.abs(minFromNowScheduled) + (minFromNowScheduled < 0 ? " min ago" : " min") : format(scheduledDate, "HH:mm")}</span> <Icon hidden={!showScheduled}><ArrowRightAlt className="text-black" height={16}></ArrowRightAlt></Icon> <span className="mr-1.5 text-nowrap" hidden={approx || minFromNow > 10}>{minFromNow <= 0 ? "now" : minFromNow + " min"}</span> {approx && "~"}{format(date, "HH:mm")}
    </>
}