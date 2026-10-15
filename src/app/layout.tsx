import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter_Tight, Noto_Sans_Devanagari, Noto_Serif_Devanagari } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const sans = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"] });
const serif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});
const deva = Noto_Sans_Devanagari({
  variable: "--font-noto-deva",
  weight: ["400", "500", "600", "700"],
  subsets: ["devanagari"],
});
const devaSerif = Noto_Serif_Devanagari({
  variable: "--font-noto-serif-deva",
  weight: ["400", "500"],
  subsets: ["devanagari"],
});

export const metadata: Metadata = {
  title: { default: "UMANG — Beyond the Waiting Line", template: "%s · UMANG" },
  description:
    "UMANG connects skilled workers in Mumbai to nearby jobs with clear wages, hiring offers and job tickets — in English, Hindi and Marathi. Independent hackathon prototype, not affiliated with any government app.",
  applicationName: "UMANG",
  appleWebApp: { capable: true, title: "UMANG", statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/apple-touch-icon.png" },
  formatDetection: { telephone: false },
  openGraph: {
    title: "UMANG — Beyond the Waiting Line",
    description: "Work should find you. Multilingual, audio-assisted job matching for skilled workers.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0a09",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${deva.variable} ${devaSerif.variable} antialiased`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
