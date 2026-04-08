import type { Metadata } from "next";
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
    icon: "/favicon.svg",
  },
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
