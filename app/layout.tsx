import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

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
    default: "UR WAY | Ofertas de viaje que valen la pena",
    template: "%s | UR WAY",
  },
  description: "Oportunidades de viaje seleccionadas y analizadas para descubrir a dónde puedes viajar barato hoy.",
  applicationName: "UR WAY",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "UR WAY by HUTEC",
    title: "El mundo, UR WAY.",
    description: "Menos ofertas, mejores oportunidades de viaje.",
  },
  twitter: {
    card: "summary_large_image",
    title: "El mundo, UR WAY.",
    description: "Oportunidades de viaje que realmente vale la pena reservar.",
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
        {children}
      </body>
    </html>
  );
}
