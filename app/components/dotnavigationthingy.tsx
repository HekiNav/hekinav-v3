import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons"
import Icon from "./icon"
import { ReactNode } from "react"

export interface DotNavigationThingyProps {
    onSet: (index: number) => void,
    amount: number,
    selected: number
}
export default function DotNavigationThingy({ onSet, amount, selected }: DotNavigationThingyProps) {
    function onClick(index: number) {
        onSet(Math.max(0, Math.min(index, amount - 1)))
    }
    const circles: ReactNode[] = []
    for (let i = 0; i < amount; i++) {
        circles.push(
            <div onClick={() => onClick(i)} className={`${i == selected ? "bg-stone-600 w-3 h-3" : "cursor-pointer"} rounded-full w-2 h-2 bg-stone-400`}>
                
            </div>
        )
    }
    return <div className="flex flex-row w-full items-center justify-center">
        <Icon onClick={() => onClick(selected - 1)} className={`py-1 pl-1 ${selected == 0 ? "text-stone-500" : "text-stone-800 cursor-pointer"}`} icon={faCaretLeft}></Icon>
        <div className="flex flex-row flex-nowrap gap-1 items-center justify-center">{...circles}</div>
        <Icon onClick={() => onClick(selected + 1)} className={`py-1 pl-1 ${selected == amount -1 ? "text-stone-500" : "text-stone-800 cursor-pointer"}`} icon={faCaretRight}></Icon>
    </div>
}