"use client"
import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";

import type { Metadata } from "next";
import { Host_Grotesk } from "next/font/google";
import toast, { Toaster } from "react-hot-toast";
import { createContext, useEffect } from "react";
import { MapLayoutProvider } from "./mapcontext";
import { useSearchParams } from "next/navigation";

const hostGrotesk = Host_Grotesk({
  variable: "--font-a",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Hekinav Routing",
  description: "Hekinav Routing",
};

export interface HekinavConfig {
  region: "hsl" | "finland"
}

export const ConfigContext = createContext<HekinavConfig>({ region: "finland" })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const hslParam = useSearchParams().get("hsl")

  const config: HekinavConfig = {
    region: hslParam === null ? "finland" : "hsl"
  }
  useEffect(() => {
    if (config.region == "hsl") {
      toast(<span>You are using the HSL Region version of Hekinav. Switch to the <a href="/">Finland-wide version</a></span>, {})
    } else {
      toast(<span>You are using the Finland wide version of Hekinav. Switch to the <a href="/?hsl">HSL Region version</a></span>, {})
    }
  }, [config])


  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      document.documentElement.style.setProperty('--vh', `${vv.height * 0.01}px`);
      window.scrollTo(0, 0);
    };

    vv.addEventListener('resize', handleResize);
    vv.addEventListener('scroll', handleResize);
    return () => {
      vv.removeEventListener('resize', handleResize);
      vv.removeEventListener('scroll', handleResize);
    };
  }, []);
  return (
    <html
      lang="en"
      className={`${hostGrotesk.variable} h-screen antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, height=device-height"></meta>
        <title>Hekinav Routing</title>
      </head>
      <body className="h-screen overflow-hidden">
        <ConfigContext value={config}>
          <Toaster
            toastOptions={{
              className: "border-3 border-black bg-white!",
              success: {
                iconTheme: {
                  primary: "#0f8c0f",
                  secondary: "white"
                }
              },
              error: {
                iconTheme: {
                  primary: "#d73523",
                  secondary: "white"
                }
              }
            }} position="top-right" />

          <MapLayoutProvider>{children}</MapLayoutProvider>;
        </ConfigContext>
      </body>
    </html>
  );
}
