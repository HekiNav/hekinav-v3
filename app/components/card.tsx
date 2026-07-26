import { HTMLProps, PropsWithChildren, ReactNode } from "react";

export interface CardProps extends PropsWithChildren, HTMLProps<HTMLDivElement> {
    cardTitle?: ReactNode,
    imageCard?: boolean
    small?: boolean,
}
export default function Card({ cardTitle, children, className, imageCard = false , small = false, ...otherProps}: CardProps) {
    return (
        <div {...otherProps} className={`w-80 flex flex-col  ${small ? "rounded-lg shadow-lg/10" : "rounded-2xl shadow-xl/30"}  flex items-center flex-col ${small ? "pb-2" : "pb-4 "} font-sans ` + className}>
            <div hidden={!cardTitle} className={`bg-green-600 w-full  ${small ? "rounded-t-lg" : "rounded-t-2xl"} font-mono ${imageCard || small ? "" : "mb-4"} ${small ? "py-1 px-2" : "p-4 "}`}>{cardTitle}</div>
            {children}
        </div>
    )
}