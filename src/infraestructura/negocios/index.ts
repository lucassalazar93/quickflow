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

export function cargarNegocio(slug: string): ConfiguracionNegocio | null {
  return NEGOCIOS[slug] ?? null;
}
