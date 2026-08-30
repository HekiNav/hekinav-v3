"use client"
import IconItem from "./iconitem";
import { ChangeEvent, HTMLAttributes, ReactElement, ReactNode, useContext, useEffect, useState } from "react"
import Skeleton from "react-loading-skeleton";
import { ConfigContext } from "../HekinavConfig";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Suggestion<T = any> {
    icon: ReactElement,
    text: string,
    name?: ReactNode,
    desc?: ReactNode,
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
    initialValue?: string,
    focusClear?: boolean
}
export default function InputField({ icon, focusClear, suggestionFunction, onFocus, onValueSet, name, onlySuggestions = false, placeholder, initialValue = "", className, ...props }: InputFieldProps) {
    const [focus, setFocus] = useState(false)
    const [value, setValue] = useState<string>(initialValue)

    const { config } = useContext(ConfigContext)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (initialValue != value) setValue(initialValue)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValue])
    const [suggestions, setSuggestions] = useState(new Array<Suggestion | "skeleton">())

    useEffect(() => {
        if (suggestionFunction && focus) suggestionFunction(value).then(suggestions => {
            setTimeout(() => {
                setSuggestions(suggestions)
            }, 1)
        })
    }, [config])

    useEffect(() => {
        if (focusClear && focus) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setValue("")
        }
    }, [focus, focusClear])

    function onChange(e: ChangeEvent<HTMLInputElement>) {
        if (value == "Loading...") return
        setValue(e.target.value)
        if (suggestionFunction) {
            setTimeout(() => {
                setSuggestions(["skeleton", "skeleton", "skeleton", "skeleton", "skeleton", "skeleton", "skeleton", "skeleton", "skeleton", "skeleton"])
            }, 0)
            suggestionFunction(e.target.value).then(suggestions => {
                setTimeout(() => {
                    setSuggestions(suggestions)
                }, 1)
            })
        }
        if (!onlySuggestions) onValueSet<string>(name, e.target.value)
        else setSuggestions([])
    }
    function suggestionSelected(item: Suggestion) {
        setValue(item.text)
        onValueSet<Suggestion>(name, item)
        setSuggestions([])
    }
    return (
        <div className={`border-3 border-box p-2 w-full rounded-xl relative hover:cursor-text hover:border-green  ${focus && "border-green"} ${className}`} {...props}>
            <IconItem icon={{ children: icon }}>
                <input
                    value={value || ""}
                    onChange={onChange}
                    onFocus={(e) => {
                        if (onFocus) onFocus(e)
                        e.preventDefault()
                        setFocus(true)
                        e.target.select()
                        setTimeout(() => onChange(e), 10)
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
            <div className="rounded-b-xl absolute z-100 border-3 bg-white border-t-0 p-2 border-green max-h-60 overflow-scroll" style={{ right: "-.17em", left: "-.17em" }} hidden={suggestions.length == 0}>
                {suggestions.map((s: Suggestion | "skeleton", i) => {
                    const sk = s == "skeleton"
                    return (
                        <div key={`search-suggestion-${i}`} className="w-full" onMouseDown={() => !sk && suggestionSelected(s)}>
                            <IconItem icon={{ children: sk ? <Skeleton inline width={16} /> : s.icon }} >
                                <div className="flex flex-col w-full truncate">
                                    {/* eslint-disable-next-line react-hooks/purity */}
                                    {sk ? <Skeleton inline width={Math.floor(Math.random() * 200) + 20} /> : s.name || s.text}
                                    {/* eslint-disable-next-line react-hooks/purity */}
                                    <div hidden={!sk && !s.desc} className="text-xs text text-gray-500">{sk ? <Skeleton inline width={Math.floor(Math.random() * 200) + 20} /> : s.desc}</div>
                                </div>
                            </IconItem>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}