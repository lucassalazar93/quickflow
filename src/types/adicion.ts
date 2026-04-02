export type TipoSeleccionGrupo = "single" | "multiple";

export type OpcionAdicion = {
  id: string;
  nombre: string;
  precio: number;
  seleccionadaPorDefecto?: boolean;
  permiteCantidad?: boolean;
  cantidadMaxima?: number;
};

export type GrupoAdiciones = {
  id: string;
  nombre: string;
  descripcion?: string;
  obligatorio: boolean;
  tipoSeleccion: TipoSeleccionGrupo;
  minSeleccion?: number;
  maxSeleccion?: number;
  opciones: OpcionAdicion[];
};
