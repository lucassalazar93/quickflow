export type ReglaDomicilio = {
  zona: string;
  calleDesde: number;
  calleHasta: number;
  carreraDesde: number;
  carreraHasta: number;
  valor: number;
};

export type ExcepcionDomicilio = {
  calle: number;
  carrera: number;
  valor: number;
  zona: string;
  motivo?: string;
};

export type LimitesCobertura = {
  calleMin: number;
  calleMax: number;
  carreraMin: number;
  carreraMax: number;
};

export const LIMITES_COBERTURA: LimitesCobertura = {
  calleMin: 65,
  calleMax: 98,
  carreraMin: 28,
  carreraMax: 50,
};

export const ORIGEN_TARIFA = {
  calleBase: 80,
  carreraBase: 37,
};

const BANDAS_CALLE: Array<{ desde: number; hasta: number }> = [
  { desde: 65, hasta: 71 },
  { desde: 72, hasta: 77 },
  { desde: 78, hasta: 82 },
  { desde: 83, hasta: 89 },
  { desde: 90, hasta: 98 },
];

const BANDAS_CARRERA: Array<{ desde: number; hasta: number }> = [
  { desde: 28, hasta: 32 },
  { desde: 33, hasta: 37 },
  { desde: 38, hasta: 41 },
  { desde: 42, hasta: 45 },
  { desde: 46, hasta: 50 },
];

type TarifaPorDistancia = {
  zona: string;
  valor: number;
  maxDist: number;
};

const TARIFAS_POR_DISTANCIA: TarifaPorDistancia[] = [
  { zona: "Zona 1", valor: 3000, maxDist: 6 },
  { zona: "Zona 2", valor: 4000, maxDist: 11 },
  { zona: "Zona 3", valor: 5000, maxDist: 16 },
  { zona: "Zona 4", valor: 6000, maxDist: 22 },
  { zona: "Zona 5", valor: 7000, maxDist: Number.POSITIVE_INFINITY },
];

/**
 * Casos reales validados por operación.
 * Estas excepciones tienen prioridad sobre el cálculo automático.
 */
export const EXCEPCIONES_DOMICILIO: ExcepcionDomicilio[] = [
  {
    calle: 80,
    carrera: 45,
    valor: 5000,
    zona: "Zona 3",
    motivo: "Precio real validado por operación para Calle 80 con 45.",
  },
  {
    calle: 83,
    carrera: 39,
    valor: 3000,
    zona: "Zona 1",
    motivo: "Precio real validado por operación para Calle 83 con 39.",
  },
];

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function mid(desde: number, hasta: number): number {
  return (desde + hasta) / 2;
}

function estaDentroDeCobertura(calle: number, carrera: number): boolean {
  return (
    calle >= LIMITES_COBERTURA.calleMin &&
    calle <= LIMITES_COBERTURA.calleMax &&
    carrera >= LIMITES_COBERTURA.carreraMin &&
    carrera <= LIMITES_COBERTURA.carreraMax
  );
}

function distanciaEnBloques(calle: number, carrera: number): number {
  const calleN = Math.round(calle);
  const carreraN = Math.round(carrera);

  return (
    Math.abs(calleN - ORIGEN_TARIFA.calleBase) +
    Math.abs(carreraN - ORIGEN_TARIFA.carreraBase)
  );
}

function tarifaPorDistancia(calle: number, carrera: number) {
  if (Math.round(carrera) >= 46) {
    return {
      distancia: distanciaEnBloques(calle, carrera),
      zona: "Zona 5",
      valor: 7000,
    };
  }

  const dist = distanciaEnBloques(calle, carrera);

  const tarifa =
    TARIFAS_POR_DISTANCIA.find((t) => dist <= t.maxDist) ??
    TARIFAS_POR_DISTANCIA[TARIFAS_POR_DISTANCIA.length - 1];

  return {
    distancia: dist,
    zona: tarifa.zona,
    valor: tarifa.valor,
  };
}

function buscarExcepcion(
  calle: number,
  carrera: number,
): ExcepcionDomicilio | null {
  const calleN = Math.round(calle);
  const carreraN = Math.round(carrera);

  return (
    EXCEPCIONES_DOMICILIO.find(
      (item) => item.calle === calleN && item.carrera === carreraN,
    ) ?? null
  );
}

function tarifaParaCentroDeRectangulo(
  calleDesde: number,
  calleHasta: number,
  carreraDesde: number,
  carreraHasta: number,
) {
  const calleCentro = mid(calleDesde, calleHasta);
  const carreraCentro = mid(carreraDesde, carreraHasta);

  return tarifaPorDistancia(calleCentro, carreraCentro);
}

export const REGLAS_DOMICILIO: ReglaDomicilio[] = (() => {
  const bandasCalle = BANDAS_CALLE.map((b) => ({
    desde: clamp(
      b.desde,
      LIMITES_COBERTURA.calleMin,
      LIMITES_COBERTURA.calleMax,
    ),
    hasta: clamp(
      b.hasta,
      LIMITES_COBERTURA.calleMin,
      LIMITES_COBERTURA.calleMax,
    ),
  })).filter((b) => b.desde <= b.hasta);

  const bandasCarrera = BANDAS_CARRERA.map((b) => ({
    desde: clamp(
      b.desde,
      LIMITES_COBERTURA.carreraMin,
      LIMITES_COBERTURA.carreraMax,
    ),
    hasta: clamp(
      b.hasta,
      LIMITES_COBERTURA.carreraMin,
      LIMITES_COBERTURA.carreraMax,
    ),
  })).filter((b) => b.desde <= b.hasta);

  const reglas: ReglaDomicilio[] = [];

  for (const bc of bandasCalle) {
    for (const br of bandasCarrera) {
      const tarifa = tarifaParaCentroDeRectangulo(
        bc.desde,
        bc.hasta,
        br.desde,
        br.hasta,
      );

      reglas.push({
        zona: tarifa.zona,
        calleDesde: bc.desde,
        calleHasta: bc.hasta,
        carreraDesde: br.desde,
        carreraHasta: br.hasta,
        valor: tarifa.valor,
      });
    }
  }

  return reglas;
})();

export type ResultadoDomicilio = {
  direccion: string;
  calle: number | null;
  carrera: number | null;
  zona: string | null;
  valor: number | null;
  fueraDeCobertura: boolean;
  requiereConfirmacion: boolean;
  motivo: string;
  fuePorExcepcion: boolean;
};

export function resolverDomicilioPorCoordenadas(params: {
  direccion: string;
  calle: number | null;
  carrera: number | null;
}): ResultadoDomicilio {
  const { direccion, calle, carrera } = params;

  if (calle == null || carrera == null) {
    return {
      direccion,
      calle,
      carrera,
      zona: null,
      valor: null,
      fueraDeCobertura: true,
      requiereConfirmacion: true,
      motivo:
        "No fue posible extraer calle y carrera para calcular el domicilio.",
      fuePorExcepcion: false,
    };
  }

  if (!estaDentroDeCobertura(calle, carrera)) {
    return {
      direccion,
      calle,
      carrera,
      zona: null,
      valor: null,
      fueraDeCobertura: true,
      requiereConfirmacion: true,
      motivo: "Dirección por fuera de la cobertura definida.",
      fuePorExcepcion: false,
    };
  }

  const excepcion = buscarExcepcion(calle, carrera);

  if (excepcion) {
    return {
      direccion,
      calle,
      carrera,
      zona: excepcion.zona,
      valor: excepcion.valor,
      fueraDeCobertura: false,
      requiereConfirmacion: false,
      motivo: excepcion.motivo ?? "Tarifa aplicada por excepción.",
      fuePorExcepcion: true,
    };
  }

  const tarifa = tarifaPorDistancia(calle, carrera);
  const distancia = distanciaEnBloques(calle, carrera);
  const requiereConfirmacion = distancia >= 20;

  return {
    direccion,
    calle,
    carrera,
    zona: tarifa.zona,
    valor: tarifa.valor,
    fueraDeCobertura: false,
    requiereConfirmacion,
    motivo: requiereConfirmacion
      ? "Dirección en borde de cobertura; conviene confirmar."
      : "Tarifa calculada automáticamente por cercanía.",
    fuePorExcepcion: false,
  };
}
