import { notFound } from "next/navigation";
import { cargarNegocio } from "@/infraestructura/negocios";
import { PaginaNegocioClient } from "./PaginaNegocioClient";

export default async function PaginaNegocio({
  params,
}: {
  params: Promise<{ negocio: string }>;
}) {
  const { negocio } = await params;

  const configuracion = cargarNegocio(negocio);

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
