"use client"
import IconItem from "./iconitem";
import { ChangeEvent, HTMLAttributes, InputHTMLAttributes, ReactElement, useState } from "react"
import { IconProps } from "./icon";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Suggestion<T = any> {
    icon: ReactElement,
    text: string,
    desc?: string,
    id: string,
    properties?: T
}

export interface InputFieldProps extends HTMLAttributes<HTMLDivElement> {
    icon: ReactElement,
    suggestionFunction?: (text: string) => Promise<Array<Suggestion>>,
    onValueSet: <T extends Suggestion | string>(name: string, value: T) => void,
    onlySuggestions?: boolean,
    placeholder?: string,
    name: string,
    initialValue?: string
}
export default function InputField({ icon, suggestionFunction, onValueSet, name, onlySuggestions = true, placeholder, initialValue = "", className, ...props }: InputFieldProps) {
    const [focus, setFocus] = useState(false)
    const [value, setValue] = useState(initialValue)
    const [suggestions, setSuggestions] = useState(new Array<Suggestion>())
    function onChange(e: ChangeEvent<HTMLInputElement>) {
        setValue(e.target.value)
        if (suggestionFunction) {
            suggestionFunction(e.target.value).then(suggestions => {
                setSuggestions(suggestions)
            })
        }
        if (!onlySuggestions) onValueSet<string>(name, value)
        else setSuggestions([])
    }
    function suggestionSelected(item: Suggestion) {
        setValue(item.text)
        onValueSet<Suggestion>(name, item)
        setSuggestions([])
    }
    return (
        <div className={`border-3 border-box p-2 w-full rounded-xl relative ${focus && "border-green"} ${className}`} {...props}>
            <IconItem icon={{children: icon}}>
                <input
                    value={value}
                    onChange={onChange}
                    onFocus={(e) => {
                        e.preventDefault()
                        setFocus(true)
                        e.target.select()
                        onChange(e)
                    }}
                    onClick={(e) => {
                        e.preventDefault()
                        setFocus(true);
                        (e.target as HTMLInputElement).select()
                    }}
                    onBlur={(e) => {
                        setFocus(false)
                        e.preventDefault()
                        setSuggestions([])
                    }}
                    type="text" className="outline-0 grow w-1 font-a" placeholder={placeholder} />
            </IconItem>
            <hr hidden={suggestions.length == 0} className={`border-1 m-1 ${focus && "border-green"}`} />
            <div className="rounded-b-xl absolute z-100 border-3 bg-white border-t-0 p-2 border-green" style={{ right: "calc(var(--spacing) * -0.6)", left: "calc(var(--spacing) * -0.6)" }} hidden={suggestions.length == 0}>
                {suggestions.map((s: Suggestion, i) => {
                    return (
                        <div key={`search-suggestion-${i}`} onMouseDown={() => suggestionSelected(s)}>
                            <IconItem icon={{children: s.icon}} >
                                <div className="flex flex-col">
                                    {s.text}
                                    <div hidden={!s.desc} className="text-xs text text-gray-500">{s.desc}</div>
                                </div>
                            </IconItem>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}