import type { Producto } from "@/types/producto";
import type {
  ConfiguracionProducto,
  SeleccionOpcion,
} from "@/types/configuracion-producto";
import { GRUPOS_ADICIONES } from "@/config/adiciones";

export function inicializarConfiguracionProducto(
  producto: Producto,
): ConfiguracionProducto {
  const selecciones: SeleccionOpcion[] = [];

  // Si no tiene grupos, retornamos configuración básica
  const grupos =
    producto.gruposAdicionesIds?.map((id) => GRUPOS_ADICIONES[id]) ?? [];

  if (grupos.length === 0) {
    return {
      productoId: producto.id,
      cantidad: 1,
      selecciones: [],
    };
  }

  // Recorremos cada grupo
  for (const grupo of grupos) {
    for (const opcion of grupo.opciones) {
      if (opcion.seleccionadaPorDefecto) {
        selecciones.push({
          grupoId: grupo.id,
          opcionId: opcion.id,
          cantidad: 1,
        });
      }
    }
  }

  return {
    productoId: producto.id,
    cantidad: 1,
    selecciones,
  };
}
