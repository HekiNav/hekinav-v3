import { PropsWithChildren, PropsWithoutRef} from "react";

export interface IconProps extends PropsWithChildren, PropsWithoutRef {
    boxed?: boolean
    small?: boolean
}

export default function Icon(props: IconProps) {
    return (
        <div className={`${props.className || ""} flex items-center`}>
            {props.children}
        </div>
    )
} 