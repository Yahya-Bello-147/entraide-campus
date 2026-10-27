import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { EnTete } from "./en-tete";

// Police moderne et lisible, pour les titres comme pour le texte.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CampusLink",
  description: "Le campus qui se donne un coup de main : propose ce que tu sais faire, trouve ce dont tu as besoin.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col lg:has-[.barre-gauche]:pl-64">
        <EnTete />
        {/* Sur téléphone, de la place en bas pour la barre d'onglets. */}
        <div className="flex flex-1 flex-col pb-28 lg:pb-0">{children}</div>
      </body>
    </html>
  );
}
