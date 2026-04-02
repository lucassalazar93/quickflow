export type SeleccionOpcion = {
  grupoId: string;
  opcionId: string;
  cantidad?: number;
};

export type ConfiguracionProducto = {
  productoId: string;
  cantidad: number;
  selecciones: SeleccionOpcion[];
};
