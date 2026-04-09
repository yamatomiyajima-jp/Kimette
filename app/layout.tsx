import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

const GA_ID = "G-SREZP3GEJC";

export const metadata: Metadata = {
  title: "Kimette - みんなで決めよう",
  description:
    "チップを配分して投票。アカウント不要・URL共有だけで使える意思決定サービス。",
  openGraph: {
    title: "Kimette - みんなで決めよう",
    description:
      "チップを配分して投票。アカウント不要・URL共有だけで使える意思決定サービス。",
    type: "website",
    locale: "ja_JP",
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kimette",
  },
};

export const viewport: Viewport = {
  themeColor: "#185fa5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
