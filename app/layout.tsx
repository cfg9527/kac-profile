import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Desmond Cheung 嘅像素公園 | Desmond Cheung's Pixel Park",
  description:
    "Desmond Cheung 的夜海像素小公園：星光落海，鯨魚翻身，散步㩒物件睇介紹。A dreamlike night-sea pixel park intro page for Desmond Cheung.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body className={`${nunito.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
