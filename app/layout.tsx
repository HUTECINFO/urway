import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/ui/smooth-scroll";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "UR WAY | Vuelos que sí valen la pena",
    template: "%s | UR WAY",
  },
  description: "Encontramos tarifas excepcionales, revisamos la ruta y te mostramos oportunidades reales desde México.",
  applicationName: "UR WAY",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "UR WAY by HUTEC",
    title: "Viaja más. Busca menos.",
    description: "Tarifas fuera de lo común, rutas revisadas y el contexto que necesitas para decidir.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vuelos que sí valen la pena.",
    description: "Oportunidades de vuelo que realmente conviene revisar y reservar.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D1B2A",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${manrope.variable} antialiased`}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
