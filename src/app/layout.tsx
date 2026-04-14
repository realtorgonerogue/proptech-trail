import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://proptechtrail.com"),
  title: "The PropTech Trail — The Oregon Trail for Real Estate",
  description:
    "An interactive decision-tree strategy game based on 53 real interviews from Mike DelPrete's Context podcast. Build a real estate company from the ground up.",
  openGraph: {
    title: "The PropTech Trail",
    description: "The Oregon Trail for Real Estate. Every decision has real consequences.",
    type: "website",
    url: "https://proptechtrail.com",
    siteName: "The PropTech Trail",
  },
  twitter: {
    card: "summary_large_image",
    title: "The PropTech Trail",
    description: "The Oregon Trail for Real Estate. Every decision has real consequences.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-gray-950 text-gray-200">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
