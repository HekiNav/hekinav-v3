import { Dispatch, HTMLAttributes, PropsWithChildren, SetStateAction } from "react";

export interface CheckboxProps extends HTMLAttributes<HTMLInputElement>, PropsWithChildren {
    containerClass?: string,
    checked: boolean,
    setChecked: Dispatch<SetStateAction<boolean>>
}
export default function Checkbox(propsWithChildren: CheckboxProps) {
    const {children, containerClass, setChecked, ...props} = propsWithChildren
    return (
        <div className={`flex flex-row items-center accent-green-600 gap-1 ${containerClass}`}>
            <input type="checkbox" {...props} onChange={(e) => {if (props.onChange) props.onChange(e);setChecked(e.target.checked)}} />
            <label htmlFor={props.id}>{children}</label>
        </div>

    )
}
