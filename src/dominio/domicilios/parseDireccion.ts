// =======================
// NORMALIZAR
// =======================
function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// =======================
// EXTRAER NÚMERO BASE
// =======================
// Extrae solo el número sin las letras pegadas: "38a" → 38, "79b" → 79
function extraerNumeroBase(valor: string): number | null {
  const match = valor.match(/^(\d{1,3})/);
  return match ? Number(match[1]) : null;
}

// =======================
// EXTRAER CALLE
// =======================
export function extraerCalle(direccion: string): number | null {
  const texto = normalizarTexto(direccion);

  // 1. formato con palabra: calle 80 o calle 79b
  const matchCalle = texto.match(/\b(calle|cll|cl)\s*(\d{1,3}[a-z]*)\b/);
  if (matchCalle) {
    return extraerNumeroBase(matchCalle[2]);
  }

  // 2. formato tipo: carrera 38a # 80-81 (la calle va después del #)
  const matchCarreraPrimero = texto.match(
    /\b(carrera|cra|cr)\s*(\d{1,3}[a-z]*)\s*#\s*(\d{1,3}[a-z]*)/,
  );
  if (matchCarreraPrimero) {
    return extraerNumeroBase(matchCarreraPrimero[3]);
  }

  return null;
}

// =======================
// EXTRAER CARRERA
// =======================
export function extraerCarrera(direccion: string): number | null {
  const texto = normalizarTexto(direccion);

  // 1. formato con palabra: carrera 38 o carrera 38a
  const matchCarrera = texto.match(/\b(carrera|cra|cr)\s*(\d{1,3}[a-z]*)\b/);
  if (matchCarrera) {
    return extraerNumeroBase(matchCarrera[2]);
  }

  // 2. formato tipo: calle 79b # 36b-04 (la carrera va después del #)
  const matchCallePrimero = texto.match(
    /\b(calle|cll|cl)\s*(\d{1,3}[a-z]*)\s*#\s*(\d{1,3}[a-z]*)/,
  );
  if (matchCallePrimero) {
    return extraerNumeroBase(matchCallePrimero[3]);
  }

  return null;
}

// =======================
// EXTRAER COMPLETA
// =======================
export function extraerDireccionCompleta(direccion: string): {
  calle: number | null;
  carrera: number | null;
} {
  return {
    calle: extraerCalle(direccion),
    carrera: extraerCarrera(direccion),
  };
}
