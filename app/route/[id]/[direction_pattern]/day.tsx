"use client"
import { TZDate } from "@date-fns/tz";
import { isToday, isTomorrow } from "date-fns";
import { format } from "date-fns-tz";

export default function Day({day}: {day: number}) {
    const date = new TZDate(day * 1000)
    return <>
        {isToday(date) ? "Today" : isTomorrow(date) ? "Tomorrow" : format(date, "ccc d.M.")}
    </>
}