import { Negocio } from "@/types/negocio";

export type EstadoNegocio =
  | "cerrado"
  | "abierto"
  | "domicilios_no_disponibles"
  | "domicilios_cerrados";

export type ResultadoEstadoNegocio = {
  estado: EstadoNegocio;
  estaAbierto: boolean;
  puedeRecibirDomicilios: boolean;
  mensaje: string;
};

export type ResumenHorariosVisible = {
  lineas: string[];
  domicilios: string;
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
      mensaje: "Modo prueba: negocio abierto 🟢",
    };
  }

  if (estadoForzado === "cerrado") {
    return {
      estado: "cerrado",
      estaAbierto: false,
      puedeRecibirDomicilios: false,
      mensaje: "Modo prueba: negocio cerrado 🔒",
    };
  }

  if (estadoForzado === "domicilios_no_disponibles") {
    return {
      estado: "domicilios_no_disponibles",
      estaAbierto: true,
      puedeRecibirDomicilios: false,
      mensaje: "Modo prueba: abierto, domicilios aún no disponibles ⏳",
    };
  }

  return {
    estado: "domicilios_cerrados",
    estaAbierto: true,
    puedeRecibirDomicilios: false,
    mensaje: "Modo prueba: abierto, domicilios cerrados por hoy 🌙",
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

type DiaSemana = (typeof DIAS)[number];

function obtenerTiempoLocal(
  fecha: Date,
  timeZone: string,
): { dia: DiaSemana; minutos: number; indiceDia: number } {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const partes = formatter.formatToParts(fecha);
    const weekday = partes.find((parte) => parte.type === "weekday")?.value;
    const hora = Number(partes.find((parte) => parte.type === "hour")?.value);
    const minuto = Number(
      partes.find((parte) => parte.type === "minute")?.value,
    );

    const weekdayToIndex: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    const indiceDia = weekday ? weekdayToIndex[weekday] : NaN;

    if (
      !Number.isFinite(indiceDia) ||
      !Number.isFinite(hora) ||
      !Number.isFinite(minuto)
    ) {
      throw new Error(
        "No fue posible resolver la fecha local por zona horaria",
      );
    }

    return {
      dia: DIAS[indiceDia],
      minutos: hora * 60 + minuto,
      indiceDia,
    };
  } catch {
    const indiceDia = fecha.getDay();
    return {
      dia: DIAS[indiceDia],
      minutos: fecha.getHours() * 60 + fecha.getMinutes(),
      indiceDia,
    };
  }
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

function formatearHora12h(hora24: string): string {
  const [hora, minuto] = hora24.split(":").map(Number);
  const periodo = hora >= 12 ? "PM" : "AM";
  const hora12 = hora % 12 === 0 ? 12 : hora % 12;
  return `${hora12}:${String(minuto).padStart(2, "0")} ${periodo}`;
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
      mensaje: negocio.abierto ? "Estamos abiertos" : "Estamos cerrados",
    };
  }

  const {
    dia,
    minutos: horaActual,
    indiceDia,
  } = obtenerTiempoLocal(fechaActual, negocio.horarios.timezone);

  const diaAnterior = DIAS[(indiceDia + 6) % 7];
  const horarioDia = negocio.horarios.atencion[dia];
  const horarioDiaAnterior = negocio.horarios.atencion[diaAnterior];

  const aperturaHoy = parseHora(horarioDia.apertura);
  const cierreHoy = parseHora(horarioDia.cierre);
  const hoyCruzaMedianoche = cierreHoy < aperturaHoy;

  const aperturaAyer = parseHora(horarioDiaAnterior.apertura);
  const cierreAyer = parseHora(horarioDiaAnterior.cierre);
  const ayerCruzaMedianoche = cierreAyer < aperturaAyer;

  const ahoraAbsoluto = horaActual;

  const rangoHoyInicio = aperturaHoy;
  const rangoHoyFin = cierreHoy + (hoyCruzaMedianoche ? 1440 : 0);

  const rangoAyerInicio = aperturaAyer - 1440;
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

  if (!estaAbierto) {
    return {
      estado: "cerrado",
      estaAbierto: false,
      puedeRecibirDomicilios: false,
      mensaje: "Estamos cerrados en este momento 💛",
    };
  }

  const usaTurnoAyer = abiertoPorHorarioAyer;

  const aperturaTurno = usaTurnoAyer ? aperturaAyer : aperturaHoy;
  const cierreTurnoBase = usaTurnoAyer ? cierreAyer : cierreHoy;
  const turnoCruzaMedianoche = usaTurnoAyer
    ? ayerCruzaMedianoche
    : hoyCruzaMedianoche;

  const ahoraEnTurno = usaTurnoAyer ? horaActual + 1440 : horaActual;
  const cierreTurno = cierreTurnoBase + (turnoCruzaMedianoche ? 1440 : 0);

  //  lógica de domicilios
  const inicioDomicilios = parseHora(negocio.horarios.domicilios.inicio);
  const inicioDomiciliosTurno =
    inicioDomicilios +
    (turnoCruzaMedianoche && inicioDomicilios < aperturaTurno ? 1440 : 0);
  const corteDomicilios =
    cierreTurno - negocio.horarios.domicilios.corteAntesDeCierreMinutos;

  // Antes de que empiecen domicilios
  if (ahoraEnTurno < inicioDomiciliosTurno) {
    return {
      estado: "domicilios_no_disponibles",
      estaAbierto: true,
      puedeRecibirDomicilios: false,
      mensaje:
        "Ya estamos abiertos 💛 Los domicilios se habilitan a las 7:40 PM",
    };
  }

  // Después del corte
  if (ahoraEnTurno > corteDomicilios) {
    return {
      estado: "domicilios_cerrados",
      estaAbierto: true,
      puedeRecibirDomicilios: false,
      mensaje: "Ya no estamos recibiendo domicilios por hoy 💛",
    };
  }

  return {
    estado: "abierto",
    estaAbierto: true,
    puedeRecibirDomicilios: true,
    mensaje: "Estamos abiertos 🟢",
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
      domicilios: "Domicilios: desde 7:40 PM hasta 20 minutos antes del cierre",
    };
  }

  const atencion = negocio.horarios.atencion;
  const inicioDomicilios = formatearHora12h(negocio.horarios.domicilios.inicio);
  const corteAntes = negocio.horarios.domicilios.corteAntesDeCierreMinutos;

  return {
    lineas: [
      `Lunes a jueves: ${formatearHora12h(atencion.lunes.apertura)} - ${formatearHora12h(atencion.lunes.cierre)}`,
      `Viernes: ${formatearHora12h(atencion.viernes.apertura)} - ${formatearHora12h(atencion.viernes.cierre)}`,
      `Sábado: ${formatearHora12h(atencion.sabado.apertura)} - ${formatearHora12h(atencion.sabado.cierre)}`,
      `Domingo y festivos: ${formatearHora12h(atencion.domingo.apertura)} - ${formatearHora12h(atencion.domingo.cierre)}`,
    ],
    domicilios: `Domicilios: desde ${inicioDomicilios} hasta ${corteAntes} minutos antes del cierre`,
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
    return "Los domicilios se habilitan a las 7:40 PM. Tu pedido queda sujeto a ese horario.";
  }

  if (
    estadoNegocio.estado === "domicilios_cerrados" &&
    tipoEntrega === "domicilio"
  ) {
    return "Ya no estamos recibiendo domicilios por hoy.";
  }

  return "";
}
