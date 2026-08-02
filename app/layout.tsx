"use client"
import type { Metadata } from "next";
import { Host_Grotesk } from "next/font/google";
import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import { MapProvider } from "@vis.gl/react-maplibre";
import { Toaster } from "react-hot-toast";

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
  return (
    <html
      lang="en"
      className={`${hostGrotesk.variable} h-screen antialiased`}
    >
      <MapProvider>
        <body className="h-screen flex flex-col overflow-hidden">
          <Toaster 
            toastOptions={{
              className: "border-3 border-black bg-white!",
              success: {
                iconTheme:{
                  primary: "#0f8c0f",
                  secondary: "white"
                }
              },
              error: {
                iconTheme:{
                  primary: "#d73523",
                  secondary: "white"
                }
              }
            }} position="top-right"/>
          {children}
          </body>
      </MapProvider>
    </html>
  );
}
