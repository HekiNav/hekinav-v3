import { PropsWithChildren } from "react";




export interface LabelProps extends PropsWithChildren {
    className?: string,
    hidden?: boolean
}

export default function Label({children, hidden = false, className}:LabelProps) {
    return (
        <span hidden={hidden} className={`px-1 text-nowrap rounded-md ${className || "bg-gray"}`}>
            {children}
        </span>
    )
}