import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { EnTete } from "./en-tete";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Police des titres (serif très gras, formes arrondies).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "L'Entraide du Campus",
  description: "Propose ce que tu sais faire, trouve ce dont tu as besoin.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <EnTete />
        {children}
      </body>
    </html>
  );
}
