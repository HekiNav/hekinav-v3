import { Dispatch, SetStateAction } from "react";

export interface ToggleProps {
    state: boolean,
    setState: Dispatch<SetStateAction<boolean>>,
    noColors?: boolean
}
export default function Toggle({ state, setState, noColors=false }: ToggleProps) {
    return (<div className="bg-gray-300 p-1 flex flex-col rounded-md h-6 w-10 m-1 mx-2" onClick={() => setState(!state)}>
        <div style={{
            transform: `translate(${state ? "100" : "0"}%,0)`
        }} className={`w-5/10 h-full rounded-sm transition duration-500 ease-in-out bg-gray-600 ${state && !noColors ? "bg-green-600" : !noColors && "bg-red-600"}`}>

        </div>
    </div>)
}

