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
    "Desmond Cheung 的個人自我介紹小公園：像素散步，㩒物件睇介紹。A tiny pixel park intro page for Desmond Cheung.",
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
