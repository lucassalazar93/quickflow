import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-base",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MANDINGAS La 37",
  description: "Pide fácil por WhatsApp y recibe tu comida rápido.",

  openGraph: {
    title: "MANDINGAS La 37",
    description: "Arma tu pedido fácil y envíalo por WhatsApp en segundos.",
    url: "https://quickflow-tau.vercel.app/demo",
    siteName: "MANDINGAS",
    images: [
      {
        url: "https://quickflow-tau.vercel.app/logo-demo.png",
        width: 800,
        height: 800,
        alt: "Mandingas La 37",
      },
    ],
    locale: "es_CO",
    type: "website",
  },

  icons: {
    icon: "/logo-demo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${montserrat.variable}`}>
        {children}
      </body>
    </html>
  );
}
