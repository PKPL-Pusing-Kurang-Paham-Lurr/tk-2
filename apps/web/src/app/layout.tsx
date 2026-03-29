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
} from "next/font/google";

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

export const metadata: Metadata = {
  title: "tk2-pkpl",
  description: "tk2-pkpl",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body className={`${fontArchitectsDaughter.variable} ${fontMerriweather.variable} ${fontCourierPrime.variable} ${fontRoboto.variable} ${fontPlayfairDisplay.variable} ${fontLobster.variable} ${fontPacifico.variable} ${fontSourceCodePro.variable} antialiased`}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
