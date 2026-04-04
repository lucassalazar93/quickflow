import type { Metadata } from "next";
import { HeroInicio } from "@/presentacion/componentes/inicio/HeroInicio";
import { FooterQuickFlow } from "@/presentacion/componentes/inicio/FooterQuickFlow";

export const metadata: Metadata = {
  title: "Mandingas La 37",
  description:
    "Arma tu pedido fácil, elige tus productos favoritos y envíalo por WhatsApp en pocos pasos.",
  openGraph: {
    title: "Mandingas La 37",
    description: "Pide tus productos favoritos de Mandingas por WhatsApp.",
    url: "https://quickflow-tau.vercel.app/",
    siteName: "Mandingas La 37",
    images: [
      {
        url: "https://quickflow-tau.vercel.app/logo-mandingas.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "es_CO",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <HeroInicio />
      <FooterQuickFlow />
    </>
  );
}
