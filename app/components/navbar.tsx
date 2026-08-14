"use client"
import { HTMLAttributes } from "react"
import IconItem from "./iconitem"
import { GlobeW700 as Globe } from '@material-symbols-svg/react/icons/globe';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRegion } from "../hooks/useHsl";


export default function NavBar() {

    const region = useRegion()
    const router = useRouter()

    return (
        <div className="w-full flex flex-row justify-between items-center bg-green p-2">
            <div className="flex flex-row w-full h-full font-medium justify-between">
                <Link className="decoration-none text-white" href={region == "hsl" ? "/?hsl" : "/"}><h1 className='text-black pr-2 flex flex-nowrap font-thin! text-white'><img src="/logo_full.svg" alt="Hekinav Logo" /> Routing</h1></Link>
                <div className="px-4">
                    <IconItem className="h-full" icon={{children: <Globe className="text-white h-full"></Globe>}}>
                        <NavItem onClick={() => changeRegion("hsl")} className={region == "hsl" ? "active" : ""}>HSL</NavItem>
                        <NavItem onClick={() => changeRegion("finland")} className={region == "finland" ? "active" : ""}>Finland</NavItem>
                    </IconItem>
                </div>
            </div>
        </div>
    )
    function changeRegion(newRegion: "hsl" | "finland") {
        if (newRegion == region) return
        router.push(newRegion == "hsl" ? "./?hsl" : "./")
    }
}

function NavItem({children, className, ...props}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={`nav-item px-2 pt-[3px] flex text-xl text-white items-center flex-col ${className}`} {...props}>
            {children}
            <span className="indicator h-1 bg-white transition-all duration-200 ease-in-out"></span>
        </div>
    )
}