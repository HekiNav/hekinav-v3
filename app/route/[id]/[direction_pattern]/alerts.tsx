"use client"

import IconItem from "@/app/components/iconitem"
import { ContentProps } from "./content"
import { AlertSeverityLevelType } from "@/app/lib/__generated__/graphql"
import { InfoW700 } from "@material-symbols-svg/react/icons/info"
import { WarningW700 } from "@material-symbols-svg/react/icons/warning"
import Label from "@/app/components/label"

export default function RouteAlerts({ data, isHsl }: ContentProps) {
    console.log(data.alerts)
    return (
        <>
            {data.alerts?.length == 0 && "No alerts"}
            {data.alerts?.map((e, i, a) => {
                return <IconItem className="border-3 p-2 rounded-xl gap-2 items-start" key={i} icon={{ children: getAlertIcon(e?.alertSeverityLevel || "INFO") }}>
                    <div>
                        <h3 className="text-xl">{e?.alertHeaderText}</h3>
                        <h4 className="text-lg text-green mr-2 mt-1">Affects: </h4>
                        <div className="flex flex-wrap gap-1 items-center mb-1">
                            {[...new Set(e?.entities?.map((d, i) => {
                                switch (d?.__typename) {
                                    case "Route":
                                        return <Label className="h-min px-1 bg-gray" key={i}>Route {(d.shortName || d.longName)}</Label>
                                    case "Pattern":
                                        return <Label className="h-min px-1 bg-gray" key={i}>Route {(d.route.shortName || d.route.longName)} towards {d.headsign}</Label>
                                    case "Stop":
                                        return <Label className="h-min px-1 bg-gray" key={i}>Stop {d.name} {d.platformCode && `pl. ${d.platformCode}`}</Label>
                                    default:
                                        return null
                                }
                            }).filter(d => d))]}
                        </div>
                        <p className="text-md">{e?.alertDescriptionText}</p>
                    </div>
                </IconItem>
            })}
        </>
    )
}
function getAlertIcon(alertType: AlertSeverityLevelType) {
    switch (alertType) {
        case "INFO":
        case "UNKNOWN_SEVERITY":
            return <InfoW700 width={32} height={32} className="text-blue"></InfoW700>
        case "WARNING":
            return <WarningW700 width={32} height={32} className="text-yellow"></WarningW700>
        case "SEVERE":
            return <WarningW700 width={32} height={32} className="text-red"></WarningW700>
    }
}