import { IconProps } from "./icon"
import Icon from "./icon"

export interface IconItemProps extends React.PropsWithChildren {
    icon: IconProps,
    reversed?: boolean
}
export default function IconItem({children, icon, reversed = false}: IconItemProps) {
    return (
        <div className={`flex ${reversed ? "flex-row-reverse" : "flex-row"} gap-2 items-center`}>
            <Icon {...icon}></Icon>
            {children}
        </div>
    )
}