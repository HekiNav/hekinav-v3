"use server"
import { Suggestion } from "../components/inputfield";
import { AutoCompleteFeatProps, AutoCompleteResponse } from "./digitransit";
import { Signpost, LocationOn } from "@material-symbols-svg/react/w700"

export async function search(text: string): Promise<Suggestion[]> {
    return [... await searchDigitransit(text)]
}
async function searchDigitransit(text: string): Promise<Suggestion[]> {
    console.log("hdhd")
    const results = await (await fetch(`https://api.digitransit.fi/geocoding/v1/autocomplete?digitransit-subscription-key=${process.env.DIGITRANSIT_KEY}&text=${text}`)).json() as AutoCompleteResponse
    if (!results) return []
    return results.features.map((f => {
        return {
            text: f.properties.label,
            icon: getIconFromProps(f.properties),
            id: f.properties.gid
        }
    }))
}
function getIconFromProps(props: AutoCompleteFeatProps) {
    switch(props.layer) {
        case "address":
            return (<Signpost></Signpost>);
        default:
            return (<LocationOn></LocationOn>);
    }
}