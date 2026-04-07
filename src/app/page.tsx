import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HeroInicio } from "@/presentacion/componentes/inicio/HeroInicio";
import { FooterQuickFlow } from "@/presentacion/componentes/inicio/FooterQuickFlow";
import { negocioDemo } from "@/infraestructura/negocios/demo/negocio";
import { debeBloquearAcceso } from "@/dominio/seguridad/evaluarBloqueoServer";

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

export default async function Home() {
  const bloqueada = await debeBloquearAcceso();

  if (bloqueada) {
    redirect("/bloqueado");
  }

  return (
    <>
      <HeroInicio negocio={negocioDemo} />
      <FooterQuickFlow />
    </>
  );
}
