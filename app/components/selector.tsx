'use client'

import { motion } from "framer-motion";
import { ReactNode } from "react";

export interface SelectorProps extends React.HTMLAttributes<HTMLDivElement> {
    items: ReactNode[],
    selected: number,
    onSet: (index: number) => void
    onPreSet?: (index: number) => void
}

export default function Selector(props: SelectorProps) {
    const { items, selected, onSet, ...otherProps } = props

    return (
        <div className="flex gap-1 border-3 p-0.5 rounded-xl" {...otherProps}>
      {items.map((e, i) => (
        <button
          key={i}
          onClick={() => onSet(i)}
          className="relative grow rounded-full px-2 py-0.5 text-lg"
        >
          {selected === i && (
            <motion.div
              layoutId="active"
              className="absolute inset-0 bg-green rounded-md"
              transition={{ type: "keyframes", duration: 0.5}}
            />
          )}
          <span className="relative z-10">{e}</span>
        </button>
      ))}
    </div>
    );
}