import { Inter, Manrope } from "next/font/google";

/**
 * The two typefaces of every app, self-hosted by next/font (no request to Google at run time).
 * Both carry Cyrillic, so Russian looks the same as Uzbek and English.
 * A root layout puts `fontVariables` on <html>; theme.css reads --font-inter / --font-manrope.
 */
const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["700", "800"],
  display: "swap",
  variable: "--font-manrope",
});

export const fontVariables = `${inter.variable} ${manrope.variable}`;
