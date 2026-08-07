"use client"
import Button from "./components/button";
import "./globals.css";

import { Host_Grotesk } from "next/font/google";

const hostGrotesk = Host_Grotesk({
    variable: "--font-a",
    subsets: ["latin"],
});

export default function GlobalNotFound() {
    return (
        <html
            lang="en"
            className={`${hostGrotesk.variable} h-screen antialiased`}
        >
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, height=device-height"></meta>
                <title>404 Not Found</title>
            </head>
            <body className="h-screen overflow-hidden flex items-center justify-center">
                <div className="p-4 border-3 rounded-2xl">
                    <h1><span className="text-green">404 </span>Not found</h1>
                    <p>This page does not exist</p>
                    <a href="/"><div className="w-full text-center mt-2"><Button>Go to home</Button></div></a>
                </div>
            </body>
        </html>
    );
}
