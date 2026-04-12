import { notFound, redirect } from "next/navigation";
import { cargarNegocio } from "@/infraestructura/negocios";
import { debeBloquearAcceso } from "@/dominio/seguridad/evaluarBloqueoServer";
import { PaginaNegocioClient } from "./PaginaNegocioClient";

export default async function PaginaNegocio({
  params,
}: {
  params: Promise<{ negocio: string }>;
}) {
  const bloqueada = await debeBloquearAcceso();

  if (bloqueada) {
    redirect("/bloqueado");
  }

  const { negocio } = await params;
  const slugNormalizado = decodeURIComponent(negocio).trim().toLowerCase();

  const configuracion = cargarNegocio(slugNormalizado);

  if (!configuracion) {
    notFound();
  }

  const { negocio: negocioData, categorias, productos } = configuracion;

  return (
    <PaginaNegocioClient
      negocio={negocioData}
      categorias={categorias}
      productos={productos}
    />
  );
}

export function generateStaticParams() {
  return [{ negocio: "demo" }];
}
