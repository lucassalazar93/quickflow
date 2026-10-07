// Festivos de Colombia (Ley 51 de 1983, "Ley Emiliani").
// Se calculan por año, sin depender de servicios externos.

type FechaSimple = { mes: number; dia: number };

const FIJOS: FechaSimple[] = [
  { mes: 1, dia: 1 }, // Año Nuevo
  { mes: 5, dia: 1 }, // Día del Trabajo
  { mes: 7, dia: 20 }, // Independencia
  { mes: 8, dia: 7 }, // Batalla de Boyacá
  { mes: 12, dia: 8 }, // Inmaculada Concepción
  { mes: 12, dia: 25 }, // Navidad
];

// Se trasladan al lunes siguiente cuando no caen en lunes
const TRASLADABLES: FechaSimple[] = [
  { mes: 1, dia: 6 }, // Reyes Magos
  { mes: 3, dia: 19 }, // San José
  { mes: 6, dia: 29 }, // San Pedro y San Pablo
  { mes: 8, dia: 15 }, // Asunción de la Virgen
  { mes: 10, dia: 12 }, // Día de la Raza
  { mes: 11, dia: 1 }, // Todos los Santos
  { mes: 11, dia: 11 }, // Independencia de Cartagena
];

// Días respecto al Domingo de Pascua (los tres últimos ya quedan en lunes)
const RELATIVOS_A_PASCUA = [
  -3, // Jueves Santo
  -2, // Viernes Santo
  43, // Ascensión del Señor
  64, // Corpus Christi
  71, // Sagrado Corazón
];

const DIA_MS = 86_400_000;

function clave(fechaUtc: Date): string {
  return `${fechaUtc.getUTCMonth() + 1}-${fechaUtc.getUTCDate()}`;
}

function trasladarALunes(fechaUtc: Date): Date {
  const diaSemana = fechaUtc.getUTCDay();
  const diasHastaLunes = (8 - diaSemana) % 7;
  return new Date(fechaUtc.getTime() + diasHastaLunes * DIA_MS);
}

// Algoritmo de Butcher-Meeus para el calendario gregoriano
function domingoDePascua(anio: number): Date {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(Date.UTC(anio, mes - 1, dia));
}

const cachePorAnio = new Map<number, Set<string>>();

function festivosDelAnio(anio: number): Set<string> {
  const enCache = cachePorAnio.get(anio);

  if (enCache) {
    return enCache;
  }

  const festivos = new Set<string>();

  FIJOS.forEach(({ mes, dia }) => festivos.add(`${mes}-${dia}`));

  TRASLADABLES.forEach(({ mes, dia }) => {
    festivos.add(clave(trasladarALunes(new Date(Date.UTC(anio, mes - 1, dia)))));
  });

  const pascua = domingoDePascua(anio);

  RELATIVOS_A_PASCUA.forEach((dias) => {
    festivos.add(clave(new Date(pascua.getTime() + dias * DIA_MS)));
  });

  cachePorAnio.set(anio, festivos);

  return festivos;
}

export function esFestivoColombia(
  anio: number,
  mes: number,
  dia: number,
): boolean {
  return festivosDelAnio(anio).has(`${mes}-${dia}`);
}
