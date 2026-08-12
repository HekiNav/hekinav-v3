import { Dispatch } from "react";

export interface ToggleProps {
    state: boolean,
    setState: Dispatch<boolean>,
    noColors?: boolean
}
export default function Toggle({ state, setState, noColors=false }: ToggleProps) {
    return (<div className="outline-gray outline-3 p-[2px] flex flex-col rounded-md h-5 w-9 m-1 mx-2" onClick={() => setState(!state)}>
        <div style={{
            transform: `translate(${state ? "100" : "0"}%,0)`
        }} className={`w-5/10 h-full rounded-sm transition duration-500 ease-in-out bg-gray ${state && !noColors ? "bg-green" : !noColors && "bg-red"}`}>

        </div>
    </div>)
}

