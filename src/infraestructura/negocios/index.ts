import type { Negocio } from "@/types/negocio";
import type { Categoria } from "@/types/categoria";
import type { Producto } from "@/types/producto";

import { negocioDemo } from "./demo/negocio";
import { categoriasDemo } from "./demo/categorias";
import { productosDemo } from "./demo/productos";

export type ConfiguracionNegocio = {
  negocio: Negocio;
  categorias: Categoria[];
  productos: Producto[];
};

const NEGOCIOS: Record<string, ConfiguracionNegocio> = {
  demo: {
    negocio: negocioDemo,
    categorias: categoriasDemo,
    productos: productosDemo,
  },
};

function normalizarSlug(slug: string): string {
  return decodeURIComponent(slug).trim().toLowerCase();
}

export function cargarNegocio(slug: string): ConfiguracionNegocio | null {
  const slugNormalizado = normalizarSlug(slug);

  if (!slugNormalizado) {
    return null;
  }

  const porClave = NEGOCIOS[slugNormalizado];

  if (porClave) {
    return porClave;
  }

  const porSlugNegocio = Object.values(NEGOCIOS).find(
    (configuracion) =>
      normalizarSlug(configuracion.negocio.slug) === slugNormalizado,
  );

  return porSlugNegocio ?? null;
}
