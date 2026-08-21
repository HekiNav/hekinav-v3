import Icon from "./icon"
import { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRightW700 } from "@material-symbols-svg/react/icons/arrow-right"
import { ArrowLeftW700 } from "@material-symbols-svg/react/icons/arrow-left"

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
    const toomany = amount > 10
    const distanceFromEnd = amount - 1 - selected
    const distanceFromStart = Math.abs(0 - selected)
    const last = distanceFromStart < distanceFromEnd ? Math.min(amount, selected + Math.max(8 - distanceFromStart, 4)) : selected + 4
    const first = distanceFromStart > distanceFromEnd ? Math.max(0, selected - Math.max(8 - distanceFromEnd, 4)) : selected - 4

    for (let i = 0; i < amount; i++) {
        if (i < first || i > last) continue
        const isSelected = i == selected
        const isEdge = toomany && ((i == first && i != 0) || (i == last && i != amount - 1))
        const size = isSelected ? 16 : isEdge ? 8 : 12
        console.log(size)
        circles.push(
            <motion.div
                key={i}
                layout
                onClick={() => onClick(i)}
                initial={{ opacity: 0, width: 0, height: 0, margin: 0 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    width: size,
                    height: size,
                    margin: "calc(var(--spacing) * 0.5)",
                    backgroundColor: isSelected ? "#777" : "#ccc"
                }}
                exit={{ opacity: 0, width: 0, height: 0, margin: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className={`rounded-full ${!isSelected ? "cursor-pointer" : ""}`}
            />
        )
    }

    return (
        <div className="flex flex-row w-full items-center justify-center">
            <div className="w-60 flex flex-row items-center justify-between">
                <Icon
                    onClick={() => onClick(selected - 1)}
                    className={`py-1 ${selected == 0 ? "text-gray" : "text-darkgray cursor-pointer"}`}
                >
                    <ArrowLeftW700 height={32} width={32} />
                </Icon>
                <div className="flex flex-row flex-nowrap items-center justify-center">
                    <AnimatePresence initial={false}>
                        {circles}
                    </AnimatePresence>
                </div>
                <Icon
                    onClick={() => onClick(selected + 1)}
                    className={`py-1 ${selected == amount - 1 ? "text-gray" : "text-darkgray cursor-pointer"}`}
                >
                    <ArrowRightW700 height={32} width={32} />
                </Icon>
            </div>
        </div>
    )
}