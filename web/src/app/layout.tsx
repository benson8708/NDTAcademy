import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION, ORG_JSONLD, WEBSITE_JSONLD } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { RevealInit } from "@/components/SiteChrome";
import "./globals.css";

const display = Barlow_Condensed({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const body = Barlow({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: [
    "NDT training", "NDT training online", "nondestructive testing training",
    "SNT-TC-1A training", "NAS410 training", "ultrasonic testing training",
    "radiographic testing training", "magnetic particle testing training",
    "liquid penetrant testing training", "eddy current testing training",
    "NDT certification", "NDT Level II training",
  ],
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <JsonLd data={[ORG_JSONLD, WEBSITE_JSONLD]} />
        {children}
        <RevealInit />
      </body>
    </html>
  );
}
