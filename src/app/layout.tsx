import type { Metadata } from "next";
import { Montserrat_Alternates, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const brandFont = Montserrat_Alternates({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const jpFont = Noto_Sans_JP({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-noto-jp",
});

export const metadata: Metadata = {
  title: "GLASSROOM",
  description: "グラスルーム",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${brandFont.variable} ${jpFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
