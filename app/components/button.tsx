"use client"
import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onPress?: (e: React.KeyboardEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => void
}

export default function Button(propsWithOnPress: ButtonProps) {
    const {onPress, ...props} = propsWithOnPress
    return (<button
        {...{
            ...props,
            onClick: (e) => { if(props.onClick) props.onClick(e); if(onPress) onPress(e) },
            onKeyDown: (e) => { if(props.onKeyDown) props.onKeyDown(e); if(e.key == "Enter" && onPress) onPress(e) }, className: ` border-3 border-black rounded-xl font-a bg-white cursor-pointer rounded p-2 hover:border-green ${props.className}`
        }}
    >
        {props.children}
    </button>)
}
