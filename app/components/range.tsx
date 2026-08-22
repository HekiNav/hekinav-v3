"use client"
import { HTMLAttributes } from "react"
import { Range } from "react-range"

export interface SliderProps {
    min: number,
    max: number,
    step: number,
    value: number,
    label: string
    track?: HTMLAttributes<HTMLDivElement>
    thumb?: HTMLAttributes<HTMLDivElement>
    setValue: (v: number) => void
}

export default function Slider({ max, min, setValue, step, value, label, thumb = {}, track = {} }: SliderProps) {

    return <Range
        label={label}
        step={step}
        min={min}
        max={max}
        values={[value]}
        onChange={(values) => setValue(values[0])}
        renderTrack={({ props, children }) => (
            <div
                {...props}
                {...track}
                className={`${track.className} border-3 w-full h-3 rounded`}
            >
                {children}
                {track.children}
            </div>
        )}
        renderThumb={({ props }) => (
            <div
                {...props}
                {...thumb}
                className={`${thumb.className} bg-green border-3 min-w-3 text-white border-black px-1 font-medium min-h-6 rounded`}
                key={props.key}

            >{thumb.children}</div>
        )}
    />
}