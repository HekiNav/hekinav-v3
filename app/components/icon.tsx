import { HTMLAttributes, PropsWithoutRef, ReactElement} from "react";

export interface IconProps extends PropsWithoutRef<HTMLAttributes<HTMLDivElement>> {
    boxed?: boolean,
    children: ReactElement
}

export default function Icon(props: IconProps) {
    return (
        <div {...props} className={`${props.boxed && `rounded-lg border-3 ${(props.children.props as {className?: string}).className || ""}`} ${props.className || ""} flex items-center`}>
            {props.children}
        </div>
    )
} 