"use client"
import { ReactNode, useContext } from "react"
import Link from "next/link"


export default function NavBar() {

    const items: { url: string, item: ReactNode }[] = [
        { url: "https://github.com/HekiNav/hekinav-v3", item: (<span>GitHub</span>) },
    ]

    return (
        <div className="w-full flex flex-row justify-between items-center bg-green p-2">
            <div className="flex flex-row w-full h-full font-medium">
                <h1 className='text-black pr-2'><img src="/logo_full.svg" alt="Hekinav Logo" /></h1>
                {...items.map(({ url, item }, i) => (
                    <div key={i} className="nav-item px-2 pt-2 flex text-xl text-white items-center flex-col">
                        <Link href={url} className="decoration-none">{item}</Link>
                        <span className="indicator h-1 bg-white transition-all duration-200 ease-in-out"></span>
                    </div>
                ))}
            </div>
        </div>
    )
}