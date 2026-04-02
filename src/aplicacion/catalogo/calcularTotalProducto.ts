import type { Producto } from "@/types/producto";
import type { ConfiguracionProducto } from "@/types/configuracion-producto";
import { GRUPOS_ADICIONES } from "@/config/adiciones";

export function calcularTotalProducto(
  producto: Producto,
  configuracion: ConfiguracionProducto,
): number {
  const precioBase = producto.precio;
  let totalOpciones = 0;

  const grupos =
    producto.gruposAdicionesIds?.map((id) => GRUPOS_ADICIONES[id]) ?? [];

  if (grupos.length > 0) {
    for (const seleccion of configuracion.selecciones) {
      const grupo = grupos.find((item) => item.id === seleccion.grupoId);

      if (!grupo) {
        continue;
      }

      const opcion = grupo.opciones.find(
        (item) => item.id === seleccion.opcionId,
      );

      if (!opcion) {
        continue;
      }

      const cantidadOpcion = seleccion.cantidad ?? 1;
      totalOpciones += opcion.precio * cantidadOpcion;
    }
  }

  return (precioBase + totalOpciones) * configuracion.cantidad;
}
