import type { Metadata } from "next";
import { Host_Grotesk } from "next/font/google";
import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";

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
      <body className="h-screen flex flex-col overflow-hidden">{children}</body>
    </html>
  );
}
