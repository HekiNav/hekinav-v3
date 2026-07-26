"use client"
import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onPress?: (e: React.KeyboardEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => void
}

export default function Button(propsWithOnPress: ButtonProps) {
    const {onPress, ...props} = propsWithOnPress
    const red = props.className?.includes("bg-red-600")
    return (<button
        {...{
            ...props,
            onClick: (e) => { if(props.onClick) props.onClick(e); if(onPress) onPress(e) },
            onKeyDown: (e) => { if(props.onKeyDown) props.onKeyDown(e); if(e.key == "Enter" && onPress) onPress(e) }, className: `${red ? "active:bg-red-700":"active:bg-green-700"} bg-green-600 cursor-pointer rounded shadow-xl/20 p-2 ${props.disabled ? red ? "bg-red-700":"bg-green-700" : ""} ${props.className}`
        }}
    >
        {props.children}
    </button>)
}
