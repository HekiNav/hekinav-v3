"use client"
import { useEffect } from "react"
import toast from "react-hot-toast"

export default function Toast({type, message}: {type: "error" | "info", message: string}) {
    useEffect(() => {
        if (type == "info") toast(message)
            else toast[type](message)
    })
    return <div></div>
}