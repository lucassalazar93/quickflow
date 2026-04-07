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

const DIAS = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
] as const;

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

function obtenerDiaActual(date: Date) {
  return DIAS[date.getDay()];
}

function estaEnRango(ahora: number, apertura: number, cierre: number): boolean {
  // Manejo de madrugada (ej: 18:00 → 02:00)
  if (cierre < apertura) {
    return ahora >= apertura || ahora <= cierre;
  }

  return ahora >= apertura && ahora <= cierre;
}

export function obtenerEstadoNegocio(
  negocio: Negocio,
  fechaActual: Date = new Date(),
): ResultadoEstadoNegocio {
  if (!negocio.horarios) {
    return {
      estado: negocio.abierto ? "abierto" : "cerrado",
      estaAbierto: negocio.abierto,
      puedeRecibirDomicilios: negocio.abierto,
      mensaje: negocio.abierto ? "Estamos abiertos" : "Estamos cerrados",
    };
  }

  // ⚠️ importante: hora en minutos
  const horaActual = fechaActual.getHours() * 60 + fechaActual.getMinutes();

  const dia = obtenerDiaActual(fechaActual);

  const horarioDia =
    negocio.horarios.atencion[dia as keyof typeof negocio.horarios.atencion];

  const apertura = parseHora(horarioDia.apertura);
  const cierre = parseHora(horarioDia.cierre);

  const estaAbierto = estaEnRango(horaActual, apertura, cierre);

  if (!estaAbierto) {
    return {
      estado: "cerrado",
      estaAbierto: false,
      puedeRecibirDomicilios: false,
      mensaje: "Estamos cerrados en este momento 💛",
    };
  }

  //  lógica de domicilios
  const inicioDomicilios = parseHora(negocio.horarios.domicilios.inicio);

  const corteDomicilios =
    cierre - negocio.horarios.domicilios.corteAntesDeCierreMinutos;

  // Antes de que empiecen domicilios
  if (horaActual < inicioDomicilios) {
    return {
      estado: "domicilios_no_disponibles",
      estaAbierto: true,
      puedeRecibirDomicilios: false,
      mensaje:
        "Ya estamos abiertos 💛 Los domicilios se habilitan a las 7:40 PM",
    };
  }

  // Después del corte
  if (horaActual > corteDomicilios) {
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
