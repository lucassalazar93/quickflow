import type { ConfiguracionProducto } from "@/types/configuracion-producto";

type Params = {
  configuracion: ConfiguracionProducto;
  grupoId: string;
  opcionId: string;
};

export function actualizarSeleccionGrupo({
  configuracion,
  grupoId,
  opcionId,
}: Params): ConfiguracionProducto {
  const yaSeleccionada = configuracion.selecciones.find(
    (s) => s.grupoId === grupoId && s.opcionId === opcionId,
  );

  let nuevasSelecciones;

  if (yaSeleccionada) {
    // quitar selección
    nuevasSelecciones = configuracion.selecciones.filter(
      (s) => !(s.grupoId === grupoId && s.opcionId === opcionId),
    );
  } else {
    // agregar selección
    nuevasSelecciones = [
      ...configuracion.selecciones,
      {
        grupoId,
        opcionId,
        cantidad: 1,
      },
    ];
  }

  return {
    ...configuracion,
    selecciones: nuevasSelecciones,
  };
}
