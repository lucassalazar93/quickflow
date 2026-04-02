import type { ConfiguracionProducto } from "@/types/configuracion-producto";

type ActualizarCantidadProductoParams = {
  configuracion: ConfiguracionProducto;
  cantidad: number;
};

export function actualizarCantidadProducto({
  configuracion,
  cantidad,
}: ActualizarCantidadProductoParams): ConfiguracionProducto {
  const cantidadNormalizada = Math.max(1, Math.floor(cantidad));

  return {
    ...configuracion,
    cantidad: cantidadNormalizada,
  };
}
