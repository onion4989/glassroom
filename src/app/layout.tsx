import type { Metadata } from "next";
import { Montserrat_Alternates, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const brandFont = Montserrat_Alternates({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const jpFont = Noto_Sans_JP({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-noto-jp",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://glassroom.see-u-soon.design";
const pageTitle = "GLASSROOM | FREE FiT";
const pageDesc =
  "架空の眼鏡ブランド GLASSROOM の製品紹介。形状記憶チタンの FREE FiT を、1ページで紹介します。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: pageTitle,
  description: pageDesc,
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: pageTitle,
    description: pageDesc,
    type: "website",
    locale: "ja_JP",
    siteName: "GLASSROOM",
    url: "/",
  },
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
