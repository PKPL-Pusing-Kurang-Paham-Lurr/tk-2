import type { Metadata } from "next";
import {
  Architects_Daughter,
  Merriweather,
  Courier_Prime,
  Roboto,
  Playfair_Display,
  Lobster,
  Pacifico,
  Source_Code_Pro,
  Fira_Code,
  JetBrains_Mono,
  Inter,
  Poppins,
  Lora,
  Source_Serif_4,
} from "next/font/google";
import { db } from "@tk2-pkpl/db";
import { eq } from "drizzle-orm";
import { siteSettings } from "@tk2-pkpl/db/schema/site-settings";

import "../index.css";
import Providers from "@/components/providers";
import Navbar from "@/components/navbar";

const fontArchitectsDaughter = Architects_Daughter({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-architects-daughter",
});

const fontMerriweather = Merriweather({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-merriweather",
});

const fontCourierPrime = Courier_Prime({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-courier-prime",
});

const fontRoboto = Roboto({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-roboto",
});

const fontPlayfairDisplay = Playfair_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

const fontLobster = Lobster({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lobster",
});

const fontPacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico",
});

const fontSourceCodePro = Source_Code_Pro({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-source-code-pro",
});

const fontFiraCode = Fira_Code({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fira-code",
});

const fontJetBrainsMono = JetBrains_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const fontInter = Inter({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-inter",
});

const fontPoppins = Poppins({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-poppins",
});

const fontLora = Lora({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lora",
});

const fontSourceSerif4 = Source_Serif_4({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-source-serif-4",
});

export const metadata: Metadata = {
  title: "tk2-pkpl",
  description: "tk2-pkpl",
};

async function getSiteTheme() {
  const settings = await db.query.siteSettings.findFirst({
    where: eq(siteSettings.id, "global"),
  });
  return {
    theme: settings?.theme ?? "bold-tech",
    mode: settings?.mode ?? "light",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme, mode } = await getSiteTheme();

  return (
    <html lang="en" data-theme={theme} data-mode={mode} className={mode}>
      <body className={`${fontArchitectsDaughter.variable} ${fontMerriweather.variable} ${fontCourierPrime.variable} ${fontRoboto.variable} ${fontPlayfairDisplay.variable} ${fontLobster.variable} ${fontPacifico.variable} ${fontSourceCodePro.variable} ${fontFiraCode.variable} ${fontJetBrainsMono.variable} ${fontInter.variable} ${fontPoppins.variable} ${fontLora.variable} ${fontSourceSerif4.variable} antialiased`}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
