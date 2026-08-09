"use client"
import { ReactElement, useEffect } from "react"
import toast from "react-hot-toast"

export default function Toast({type, message}: {type: "error" | "info", message: ReactElement | string}) {
    useEffect(() => {
        if (type == "info") toast(message)
            else toast[type](message)
    })
    return <div></div>
}