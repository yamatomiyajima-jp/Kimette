import type { Metadata, Viewport } from "next";
import "./globals.css";

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
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.svg", type: "image/svg+xml" },
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
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
