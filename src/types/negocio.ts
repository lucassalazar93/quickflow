export type RangoHorario = {
  apertura: string; // formato "HH:mm" -> ej: "18:00"
  cierre: string; // formato "HH:mm" -> ej: "00:00", "01:00", "02:00"
};

export type HorariosPorDia = {
  lunes: RangoHorario;
  martes: RangoHorario;
  miercoles: RangoHorario;
  jueves: RangoHorario;
  viernes: RangoHorario;
  sabado: RangoHorario;
  domingo: RangoHorario;
  festivos: RangoHorario;
};

export type ConfiguracionDomicilios = {
  inicio: string; // hora desde la que se reciben domicilios, ej: "19:40"
  corteAntesDeCierreMinutos: number; // ej: 20
};

export type ConfiguracionHoraria = {
  timezone: string; // ej: "America/Bogota"
  atencion: HorariosPorDia;
  domicilios: ConfiguracionDomicilios;
};

export type Negocio = {
  id: string;
  nombre: string;
  slug: string;
  logo: string;
  subtitulo: string;
  colorPrimario: string;
  colorSecundario: string;

  /**
   * Compatibilidad temporal con la versión actual.
   * Idealmente después la lógica debería depender de `horarios`
   * y este campo podría eliminarse.
   */
  abierto: boolean;

  whatsapp: string;

  // Ubicación física del negocio (para domicilios y mapas)
  direccion?: string;
  latitud?: number;
  longitud?: number;

  // Configuración horaria del negocio
  horarios?: ConfiguracionHoraria;

  // (Opcional futuro) Soporte multi-sede
  // sedes?: Sede[];
};
