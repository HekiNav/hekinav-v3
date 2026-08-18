"use client"
import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";

import type { Metadata } from "next";
import { Host_Grotesk } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { useState } from "react";
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

  const [config, setConfig] = useState<HekinavConfig>(defaultConfig)

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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, height=device-height"></meta>
        <title>Hekinav Routing</title>
      </head>
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
