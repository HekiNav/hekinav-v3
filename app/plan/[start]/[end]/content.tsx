"use client"
import { useContext } from "react";
import { ConfigContext } from "@/app/HekinavConfig";
import { PlanQueryQuery } from "./page.generated";
import { useMap } from "@vis.gl/react-maplibre";

interface ContentProps {
    data: NonNullable<PlanQueryQuery["planConnection"]>
    isHsl: boolean;
}


export default function Content({ data,
    isHsl}: ContentProps) {

    const { config, setConfig } = useContext(ConfigContext)

    const { default: map } = useMap()


    return (
        <>
            plan
        </>
    );
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
