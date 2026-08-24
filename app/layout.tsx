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

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.urway.site";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "UR WAY | Ofertas de vuelo que sí convienen",
    template: "%s | UR WAY",
  },
  description: "Ofertas de vuelo fuera de lo común desde México, revisadas con criterio y listas para comparar.",
  applicationName: "UR WAY",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "UR WAY by HUTEC",
    title: "Vuela más. Paga lo justo.",
    description: "Ofertas fuera de lo común, rutas revisadas y el contexto que necesitas para decidir.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ofertas de vuelo que sí convienen.",
    description: "Rutas revisadas para que compares mejor y reserves con confianza.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D1B2A",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <script
          {...{ nowprocket: "" }}
          data-noptimize="1"
          data-cfasync="false"
          data-wpfc-render="false"
          seraph-accel-crit="1"
          data-no-defer="1"
          data-cmp-ab="2"
          dangerouslySetInnerHTML={{
            __html: `
  (function () {
      var script = document.createElement("script");
      script.async = 1;
      script.setAttribute("data-cmp-ab","2");
      script.src = 'https://emrldco.com/NTY1NDgx.js?t=565481';
      document.head.appendChild(script);
  })();`,
          }}
        />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `(function(i,m,p,a,c,t){c.ire_o=p;c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};t=a.createElement(m);var z=a.getElementsByTagName(m)[0];t.async=1;t.src=i;z.parentNode.insertBefore(t,z)})('https://utt.impactcdn.com/P-A7667594-b619-490d-a09a-6b43db012d2a1.js','script','impactStat',document,window);impactStat('transformLinks');impactStat('trackImpression');`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} antialiased`}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
