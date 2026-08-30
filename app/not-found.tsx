"use client"
import Link from "next/link";
import Button from "./components/button";


export default function NotFound() {
    return (
        <div className="p-4 border-3 rounded-2xl">
            <h1><span className="text-green">404 </span>Not found</h1>
            <p>This page does not exist</p>
            <Link href="/"><div className="w-full text-center mt-2"><Button>Go to home</Button></div></Link>
        </div>
    );
}
