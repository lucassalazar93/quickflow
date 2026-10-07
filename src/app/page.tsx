import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cargarNegocio } from "@/infraestructura/negocios";
import { debeBloquearAcceso } from "@/dominio/seguridad/evaluarBloqueoServer";
import { PaginaNegocioClient } from "./[negocio]/PaginaNegocioClient";

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

// La raíz abre directo el catálogo: la pantalla de inicio va dentro de él
export default async function Home() {
  const bloqueada = await debeBloquearAcceso();

  if (bloqueada) {
    redirect("/bloqueado");
  }

  const configuracion = cargarNegocio("demo");

  if (!configuracion) {
    notFound();
  }

  return (
    <PaginaNegocioClient
      negocio={configuracion.negocio}
      categorias={configuracion.categorias}
      productos={configuracion.productos}
      masPedidos={configuracion.masPedidos}
      categoriaBebidasId={configuracion.categoriaBebidasId}
    />
  );
}
