import type {
  ConfiguracionHoraria,
  Negocio,
  RangoHorario,
} from "@/types/negocio";
import { esFestivoColombia } from "./festivosColombia";

export type EstadoNegocio =
  | "cerrado"
  | "abierto"
  | "domicilios_no_disponibles"
  | "domicilios_cerrados";

export type ResultadoEstadoNegocio = {
  estado: EstadoNegocio;
  estaAbierto: boolean;
  puedeRecibirDomicilios: boolean;
  // Mensaje completo para el usuario
  mensaje: string;
  // Texto corto para acompañar el indicador Abierto/Cerrado (null si no aplica)
  chip: string | null;
  // Hora desde la que se reciben domicilios, ya formateada (null sin horarios)
  inicioDomicilios: string | null;
  // Una línea breve que siempre describe el momento (ej: "Domicilios hasta las 11:40 PM")
  lineaCorta: string;
  // Hora de cierre del turno en curso, ya formateada (null si está cerrado)
  cierre: string | null;
  // Solo cuando está cerrado: cuándo vuelve a abrir
  proximaApertura: ProximaApertura | null;
};

export type ProximaApertura = {
  cuando: "hoy" | "mañana";
  hora: string;
  minutos: number;
};

export type ResumenHorariosVisible = {
  lineas: string[];
  domicilios: string;
  lineasDomicilios: string[];
};

function normalizarEstadoForzado(
  valor: string | undefined,
): EstadoNegocio | null {
  const limpio = (valor ?? "").trim().toLowerCase();

  if (!limpio) {
    return null;
  }

  if (limpio === "abierto") return "abierto";
  if (limpio === "cerrado") return "cerrado";
  if (limpio === "domicilios_no_disponibles")
    return "domicilios_no_disponibles";
  if (limpio === "domicilios_cerrados") return "domicilios_cerrados";

  return null;
}

function obtenerEstadoForzadoDesdeEnv(): ResultadoEstadoNegocio | null {
  const estadoForzado =
    normalizarEstadoForzado(process.env.APP_ESTADO_NEGOCIO_FORZADO) ??
    normalizarEstadoForzado(process.env.NEXT_PUBLIC_ESTADO_NEGOCIO_FORZADO);

  if (!estadoForzado) {
    return null;
  }

  if (estadoForzado === "abierto") {
    return {
      estado: "abierto",
      estaAbierto: true,
      puedeRecibirDomicilios: true,
      mensaje: "Modo prueba: negocio abierto.",
      chip: null,
      inicioDomicilios: null,
      lineaCorta: "Modo prueba: abierto",
      cierre: null,
      proximaApertura: null,
    };
  }

  if (estadoForzado === "cerrado") {
    return {
      estado: "cerrado",
      estaAbierto: false,
      puedeRecibirDomicilios: false,
      mensaje: "Modo prueba: negocio cerrado.",
      chip: "Modo prueba: cerrado",
      inicioDomicilios: null,
      lineaCorta: "Modo prueba: cerrado",
      cierre: null,
      proximaApertura: null,
    };
  }

  if (estadoForzado === "domicilios_no_disponibles") {
    return {
      estado: "domicilios_no_disponibles",
      estaAbierto: true,
      puedeRecibirDomicilios: false,
      mensaje: "Modo prueba: abierto, domicilios aún no disponibles.",
      chip: "Modo prueba: domicilios aún no disponibles",
      inicioDomicilios: null,
      lineaCorta: "Modo prueba: domicilios aún no disponibles",
      cierre: null,
      proximaApertura: null,
    };
  }

  return {
    estado: "domicilios_cerrados",
    estaAbierto: true,
    puedeRecibirDomicilios: false,
    mensaje: "Modo prueba: abierto, domicilios cerrados por hoy.",
    chip: "Modo prueba: domicilios cerrados por hoy",
    inicioDomicilios: null,
    lineaCorta: "Modo prueba: domicilios cerrados por hoy",
    cierre: null,
    proximaApertura: null,
  };
}

const DIAS = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
] as const;

const MINUTOS_DIA = 1440;

type FechaLocal = {
  anio: number;
  mes: number;
  diaMes: number;
  indiceDia: number;
};

function obtenerTiempoLocal(
  fecha: Date,
  timeZone: string,
): FechaLocal & { minutos: number } {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

    const partes = formatter.formatToParts(fecha);
    const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
      partes.find((parte) => parte.type === tipo)?.value;

    const weekdayToIndex: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    const weekday = valor("weekday");
    const indiceDia = weekday ? weekdayToIndex[weekday] : NaN;
    // Algunos motores devuelven "24" a medianoche
    const hora = Number(valor("hour")) % 24;
    const minuto = Number(valor("minute"));
    const anio = Number(valor("year"));
    const mes = Number(valor("month"));
    const diaMes = Number(valor("day"));

    if (
      ![indiceDia, hora, minuto, anio, mes, diaMes].every(Number.isFinite)
    ) {
      throw new Error(
        "No fue posible resolver la fecha local por zona horaria",
      );
    }

    return { anio, mes, diaMes, indiceDia, minutos: hora * 60 + minuto };
  } catch {
    return {
      anio: fecha.getFullYear(),
      mes: fecha.getMonth() + 1,
      diaMes: fecha.getDate(),
      indiceDia: fecha.getDay(),
      minutos: fecha.getHours() * 60 + fecha.getMinutes(),
    };
  }
}

function desplazarDias(fecha: FechaLocal, dias: number): FechaLocal {
  const utc = new Date(Date.UTC(fecha.anio, fecha.mes - 1, fecha.diaMes + dias));

  return {
    anio: utc.getUTCFullYear(),
    mes: utc.getUTCMonth() + 1,
    diaMes: utc.getUTCDate(),
    indiceDia: utc.getUTCDay(),
  };
}

function estaEnRangoAbsoluto(
  ahora: number,
  inicio: number,
  fin: number,
): boolean {
  return ahora >= inicio && ahora <= fin;
}

function parseHora(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function formatearMinutos(minutosTotales: number): string {
  const minutos =
    ((minutosTotales % MINUTOS_DIA) + MINUTOS_DIA) % MINUTOS_DIA;
  const hora = Math.floor(minutos / 60);
  const minuto = minutos % 60;
  const periodo = hora >= 12 ? "PM" : "AM";
  const hora12 = hora % 12 === 0 ? 12 : hora % 12;
  return `${hora12}:${String(minuto).padStart(2, "0")} ${periodo}`;
}

function formatearHora12h(hora24: string): string {
  return formatearMinutos(parseHora(hora24));
}

function duracionTurno(rango: RangoHorario): number {
  const apertura = parseHora(rango.apertura);
  const cierre = parseHora(rango.cierre);
  return cierre < apertura ? cierre + MINUTOS_DIA - apertura : cierre - apertura;
}

// En festivo aplica el horario de festivos, salvo que el horario normal
// de ese día ya sea más amplio (ej: un sábado festivo).
function horarioDeFecha(
  horarios: ConfiguracionHoraria,
  fecha: FechaLocal,
): RangoHorario {
  const normal = horarios.atencion[DIAS[fecha.indiceDia]];

  if (!esFestivoColombia(fecha.anio, fecha.mes, fecha.diaMes)) {
    return normal;
  }

  const festivo = horarios.atencion.festivos;

  return duracionTurno(festivo) > duracionTurno(normal) ? festivo : normal;
}

export function obtenerEstadoNegocio(
  negocio: Negocio,
  fechaActual: Date = new Date(),
): ResultadoEstadoNegocio {
  const estadoForzado = obtenerEstadoForzadoDesdeEnv();

  if (estadoForzado) {
    return estadoForzado;
  }

  if (!negocio.horarios) {
    return {
      estado: negocio.abierto ? "abierto" : "cerrado",
      estaAbierto: negocio.abierto,
      puedeRecibirDomicilios: negocio.abierto,
      mensaje: negocio.abierto
        ? "Estamos abiertos."
        : "En este momento estamos cerrados.",
      chip: null,
      inicioDomicilios: null,
      lineaCorta: negocio.abierto ? "Estamos abiertos" : "Estamos cerrados",
      cierre: null,
      proximaApertura: null,
    };
  }

  const horarios = negocio.horarios;
  const hoy = obtenerTiempoLocal(fechaActual, horarios.timezone);
  const horaActual = hoy.minutos;

  const horarioDia = horarioDeFecha(horarios, hoy);
  const horarioDiaAnterior = horarioDeFecha(horarios, desplazarDias(hoy, -1));

  const aperturaHoy = parseHora(horarioDia.apertura);
  const cierreHoy = parseHora(horarioDia.cierre);
  const hoyCruzaMedianoche = cierreHoy < aperturaHoy;

  const aperturaAyer = parseHora(horarioDiaAnterior.apertura);
  const cierreAyer = parseHora(horarioDiaAnterior.cierre);
  const ayerCruzaMedianoche = cierreAyer < aperturaAyer;

  const ahoraAbsoluto = horaActual;

  const rangoHoyInicio = aperturaHoy;
  const rangoHoyFin = cierreHoy + (hoyCruzaMedianoche ? MINUTOS_DIA : 0);

  const rangoAyerInicio = aperturaAyer - MINUTOS_DIA;
  const rangoAyerFin = cierreAyer;

  const abiertoPorHorarioHoy = estaEnRangoAbsoluto(
    ahoraAbsoluto,
    rangoHoyInicio,
    rangoHoyFin,
  );

  const abiertoPorHorarioAyer =
    ayerCruzaMedianoche &&
    estaEnRangoAbsoluto(ahoraAbsoluto, rangoAyerInicio, rangoAyerFin);

  const estaAbierto = abiertoPorHorarioHoy || abiertoPorHorarioAyer;

  const inicioDomicilios = parseHora(horarios.domicilios.inicio);
  const inicioDomiciliosTexto = formatearMinutos(inicioDomicilios);

  if (!estaAbierto) {
    const abreHoy = horaActual < aperturaHoy;
    const proximaApertura = abreHoy
      ? horarioDia.apertura
      : horarioDeFecha(horarios, desplazarDias(hoy, 1)).apertura;
    const minutosParaAbrir = abreHoy
      ? aperturaHoy - horaActual
      : MINUTOS_DIA - horaActual + parseHora(proximaApertura);
    const cuando = `${abreHoy ? "hoy" : "mañana"} a las ${formatearHora12h(proximaApertura)}`;

    return {
      estado: "cerrado",
      estaAbierto: false,
      puedeRecibirDomicilios: false,
      mensaje: `En este momento estamos cerrados. Abrimos ${cuando} y recibimos domicilios desde las ${inicioDomiciliosTexto}. Con gusto te atenderemos a esa hora.`,
      chip: `Abrimos ${cuando}`,
      inicioDomicilios: inicioDomiciliosTexto,
      lineaCorta: `Abrimos ${cuando}`,
      cierre: null,
      proximaApertura: {
        cuando: abreHoy ? "hoy" : "mañana",
        hora: formatearHora12h(proximaApertura),
        minutos: minutosParaAbrir,
      },
    };
  }

  const usaTurnoAyer = abiertoPorHorarioAyer;

  const aperturaTurno = usaTurnoAyer ? aperturaAyer : aperturaHoy;
  const cierreTurnoBase = usaTurnoAyer ? cierreAyer : cierreHoy;
  const turnoCruzaMedianoche = usaTurnoAyer
    ? ayerCruzaMedianoche
    : hoyCruzaMedianoche;

  const ahoraEnTurno = usaTurnoAyer ? horaActual + MINUTOS_DIA : horaActual;
  const cierreTurno =
    cierreTurnoBase + (turnoCruzaMedianoche ? MINUTOS_DIA : 0);

  //  lógica de domicilios
  const inicioDomiciliosTurno =
    inicioDomicilios +
    (turnoCruzaMedianoche && inicioDomicilios < aperturaTurno
      ? MINUTOS_DIA
      : 0);
  const corteDomicilios =
    cierreTurno - horarios.domicilios.corteAntesDeCierreMinutos;

  const cierreTexto = formatearMinutos(cierreTurno);
  const corteTexto = formatearMinutos(corteDomicilios);

  // Antes de que empiecen domicilios
  if (ahoraEnTurno < inicioDomiciliosTurno) {
    return {
      estado: "domicilios_no_disponibles",
      estaAbierto: true,
      puedeRecibirDomicilios: false,
      mensaje: `Ya estamos abiertos. Los domicilios inician a las ${inicioDomiciliosTexto}; por ahora puedes hacer tu pedido para recoger en tienda.`,
      chip: `Domicilios desde las ${inicioDomiciliosTexto}`,
      inicioDomicilios: inicioDomiciliosTexto,
      lineaCorta: `Domicilios desde las ${inicioDomiciliosTexto}`,
      cierre: cierreTexto,
      proximaApertura: null,
    };
  }

  // Después del corte
  if (ahoraEnTurno > corteDomicilios) {
    return {
      estado: "domicilios_cerrados",
      estaAbierto: true,
      puedeRecibirDomicilios: false,
      mensaje: `Por hoy cerramos la recepción de domicilios (hasta las ${corteTexto}). Aún puedes pedir para recoger en tienda hasta las ${cierreTexto}.`,
      chip: "Domicilios cerrados por hoy",
      inicioDomicilios: inicioDomiciliosTexto,
      lineaCorta: "Domicilios cerrados por hoy",
      cierre: cierreTexto,
      proximaApertura: null,
    };
  }

  return {
    estado: "abierto",
    estaAbierto: true,
    puedeRecibirDomicilios: true,
    mensaje: `Estamos abiertos. Recibimos domicilios hasta las ${corteTexto}.`,
    chip: null,
    inicioDomicilios: inicioDomiciliosTexto,
    lineaCorta: `Domicilios hasta las ${corteTexto}`,
    cierre: cierreTexto,
    proximaApertura: null,
  };
}

export function obtenerResumenHorariosVisible(
  negocio: Negocio,
): ResumenHorariosVisible {
  if (!negocio.horarios) {
    return {
      lineas: [
        "Lunes a jueves: 6:00 PM - 12:00 AM",
        "Viernes: 6:00 PM - 1:00 AM",
        "Sábado: 6:00 PM - 2:00 AM",
        "Domingo y festivos: 6:00 PM - 1:00 AM",
      ],
      domicilios: "Recepción de domicilios",
      lineasDomicilios: [
        "Lunes a jueves: 7:20 PM - 11:40 PM",
        "Viernes: 7:20 PM - 12:40 AM",
        "Sábado: 7:20 PM - 1:40 AM",
        "Domingo y festivos: 7:20 PM - 12:40 AM",
      ],
    };
  }

  const atencion = negocio.horarios.atencion;
  const { inicio, corteAntesDeCierreMinutos } = negocio.horarios.domicilios;

  const grupos: Array<[string, RangoHorario]> = [
    ["Lunes a jueves", atencion.lunes],
    ["Viernes", atencion.viernes],
    ["Sábado", atencion.sabado],
    ["Domingo y festivos", atencion.domingo],
  ];

  return {
    lineas: grupos.map(
      ([etiqueta, rango]) =>
        `${etiqueta}: ${formatearHora12h(rango.apertura)} - ${formatearHora12h(rango.cierre)}`,
    ),
    domicilios: "Recepción de domicilios",
    lineasDomicilios: grupos.map(
      ([etiqueta, rango]) =>
        `${etiqueta}: ${formatearHora12h(inicio)} - ${formatearMinutos(parseHora(rango.cierre) - corteAntesDeCierreMinutos)}`,
    ),
  };
}

export function obtenerNotaWhatsAppSegunEstado(
  estadoNegocio: ResultadoEstadoNegocio,
  tipoEntrega: "domicilio" | "recoger",
): string {
  if (estadoNegocio.estado === "cerrado") {
    return "Pedido armado fuera de horario. La confirmación se realizará cuando retomemos atención.";
  }

  if (
    estadoNegocio.estado === "domicilios_no_disponibles" &&
    tipoEntrega === "domicilio"
  ) {
    return estadoNegocio.inicioDomicilios
      ? `Los domicilios se habilitan a las ${estadoNegocio.inicioDomicilios}. Tu pedido queda sujeto a ese horario.`
      : "Los domicilios aún no están habilitados. Tu pedido queda sujeto al horario de domicilios.";
  }

  if (
    estadoNegocio.estado === "domicilios_cerrados" &&
    tipoEntrega === "domicilio"
  ) {
    return "Ya no estamos recibiendo domicilios por hoy.";
  }

  return "";
}
