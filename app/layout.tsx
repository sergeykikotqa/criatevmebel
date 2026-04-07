import type { Metadata } from "next";
import { Manrope, PT_Mono } from "next/font/google";

import { landingContent } from "@/lib/content";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const ptMono = PT_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-pt-mono",
  weight: "400",
  display: "swap",
});

const metadataTitle = `${landingContent.siteConfig.companyName} — кухни на заказ в ${landingContent.siteConfig.cityInLocation}`;

export const metadata: Metadata = {
  title: metadataTitle,
  description: landingContent.siteConfig.seoDescription,
  openGraph: {
    title: metadataTitle,
    description: landingContent.siteConfig.seoDescription,
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: metadataTitle,
    description: landingContent.siteConfig.seoDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${manrope.variable} ${ptMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
