"use client"
import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css"
import "@daypicker/react/style.css";
import 'react-tooltip/dist/react-tooltip.css'

import type { Metadata } from "next";
import { Host_Grotesk } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { MapLayoutProvider } from "./mapcontext";
import Navbar from "./components/navbar";
import { HekinavConfig, defaultConfig, ConfigContext, SetHekinavConfigKey, GetHekinavConfigKey } from "./HekinavConfig";

const hostGrotesk = Host_Grotesk({
  variable: "--font-a",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hekinav Routing",
  description: "Hekinav Routing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [config, setConfig] = useState<HekinavConfig>(structuredClone(defaultConfig))
  const [configFromLocalStorageGotten, setConfigFromLocalStorageGotten] = useState<boolean>(false)

  useEffect(() => {
    if (configFromLocalStorageGotten) return
    if (!window) return
    const configData = localStorage.getItem("hekinav:global-config")
    if (!configData) return
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConfig(JSON.parse(configData))
    } catch {
      return
    }
    setConfigFromLocalStorageGotten(true)
  }, [configFromLocalStorageGotten])

  useEffect(() => {
    if (!window) return
    localStorage.setItem("hekinav:global-config", JSON.stringify(config))
  }, [config])

  const setConfigKey: SetHekinavConfigKey = function (...args: (readonly PropertyKey[])[]) {
    const [value, ...keys] = args
    const newObj = { ...config }
    keys.forEach((k) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let target: any = newObj

      for (let i = 0; i < k.length - 1; i++) {
        target = target[k[i]];
      }
      target[k[k.length - 1]] = value
    })
    setConfig(newObj)
  }
  const getConfigKey: GetHekinavConfigKey = function (...args: (readonly PropertyKey[])[]) {
    const [...keys] = args
    const newObj = { ...config }

    return keys.map((k) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let target: any = newObj

      for (let i = 0; i < k.length - 1; i++) {
        target = target[k[i]];
      }
      return target[k[k.length - 1]]
    })
  }
  // this is maybe not needed anymore
  /* useEffect(() => {
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
  }, []); */
  return (
    <html
      lang="en"
      className={`${hostGrotesk.variable} h-screen antialiased`}
    >
      <body className="h-screen overflow-hidden flex flex-col">
        <ConfigContext value={{ config, setConfig: setConfigKey, getConfig: getConfigKey }}>
          <Navbar></Navbar>
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
            }} position="top-right" containerStyle={{ marginTop: "64px" }} />

          <MapLayoutProvider>{children}</MapLayoutProvider>
        </ConfigContext>
      </body>
    </html>
  );
}
