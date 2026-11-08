import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import VisitTracker from "@/components/VisitTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const segoe = localFont({
  src: [
    {
      path: "../fonts/segoeuithis.ttf",
      weight: "400",
      style: "normal",
    },
    // {
    //   path: "./fonts/Segoe-UI-Semibold.woff2",
    //   weight: "600",
    //   style: "normal",
    // },
    // {
    //   path: "./fonts/Segoe-UI-Bold.woff2",
    //   weight: "700",
    //   style: "normal",
    // },
  ],
  variable: "--font-segoe",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sign in to your account",
  description: "",
  icons: {
    icon: "/ms.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${segoe.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <VisitTracker />
        {children}
      </body>
    </html>
  );
}
