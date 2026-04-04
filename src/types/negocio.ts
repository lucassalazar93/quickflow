export type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  logo: string;
  subtitulo: string;
  colorPrimario: string;
  colorSecundario: string;
  abierto: boolean;
  whatsapp: string;

  //  Ubicación física del negocio (para domicilios y mapas)
  direccion?: string;
  latitud?: number;
  longitud?: number;

  //  (Opcional futuro) Soporte multi-sede
  // sedes?: Sede[];
};
