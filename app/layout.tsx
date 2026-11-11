import type { Metadata } from "next";
import { Chakra_Petch, Anuphan } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

// Chakra Petch = headings and figures (squared, like stencilled car-park numbers)
const chakra = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
});

// Anuphan = body text (easy-to-read modern Thai)
const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Easy Parking",
  description: "ระบบลานจอดรถอัตโนมัติ ใช้ได้หลายสถานที่",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${chakra.variable} ${anuphan.variable} h-full`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
