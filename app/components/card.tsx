import { HTMLProps, PropsWithChildren, ReactNode } from "react";

export interface CardProps extends PropsWithChildren, HTMLProps<HTMLDivElement> {
    cardTitle?: ReactNode,
    small?: boolean,
}
export default function Card({ cardTitle, children, className , small = false, ...otherProps}: CardProps) {
    return (
        <div {...otherProps} className={`w-80 flex flex-col overflow-hidden ${small ? "rounded-lg" : "rounded-2xl"} border-black border-3 ${small ? "pb-2" : "pb-4 "} ` + className}>
            <div hidden={!cardTitle} className={`text-green text-2xl font-medium w-full ${small ? "py-1 px-2" : "p-4 "}`}>{cardTitle}</div>
            {children}
        </div>
    )
}