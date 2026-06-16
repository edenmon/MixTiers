import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "./ui/TopNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "MixTiers - Create your own tier list!",
  description:
    "Create your own tier list and share it with your friends. MixTiers is an ad-free, customizable tier list maker.",
  keywords: [
    "tier list",
    "tier list free",
    "tier list online",
    "tier list online free",
    "tier list maker",
    "tier list creator",
    "tier list generator",
    "tier list tool",
    "tier list app",
    "tier list software",
    "tier list maker online",
    "tier list maker free",
    "tier list maker tool",
    "tier list maker app",
    "tier list maker software",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "MixTiers - Create your own tier list!",
    description:
      "Create your own tier list and share it with your friends. MixTiers is an ad-free, customizable tier list maker.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TopNav />
        {children}
      </body>
    </html>
  );
}
