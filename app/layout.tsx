import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { BackgroundFX } from "@/components/BackgroundFX";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gabryel Veríssimo — Backend Engineer",
  description: "Backend engineer focused on fintech and reliable systems. Building with Python, FastAPI, PostgreSQL, and modern cloud infrastructure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')!=='light')document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
      </head>
      <body className="flex min-h-full flex-col font-[family-name:var(--font-sans)]">
        <BackgroundFX />
        {children}
      </body>
    </html>
  );
}
