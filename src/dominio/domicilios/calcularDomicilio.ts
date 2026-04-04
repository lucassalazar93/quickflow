import { REGLAS_DOMICILIO } from "./reglasDomicilio";

export type ResultadoDomicilio = {
  estado: "OK";
  zona: string;
  valor: number;
  requiereConfirmacion: boolean;
  mensaje: string;
};

type CalcularDomicilioParams = {
  calle?: number | null;
  carrera?: number | null;
  latitud?: number | null;
  longitud?: number | null;
  origen?: {
    latitud?: number;
    longitud?: number;
  };
};

const LIMITES_COBERTURA = {
  calleMin: 66,
  calleMax: 99,
  carreraMin: 24,
  carreraMax: 50,
};

const TARIFA_MINIMA = 3000;

// Centro aproximado de cobertura en Manrique.
// Ajusta estos valores después con la ubicación real del negocio.
const CENTRO_COBERTURA = {
  latitud: 6.2732,
  longitud: -75.5516,
};

// Radios aproximados para una primera versión con coordenadas.
// Puedes afinarlos después según pruebas reales.
const RADIOS_COBERTURA = {
  zona1: 0.8,
  zona2: 1.2,
  zona3: 1.6,
  zona4: 2.1,
  zona5: 2.7,
  zona6: 3.2,
  maximo: 4.2,
};

export function calcularDomicilio({
  calle = null,
  carrera = null,
  latitud = null,
  longitud = null,
  origen,
}: CalcularDomicilioParams): ResultadoDomicilio {
  // PRIORIDAD 1: cálculo por coordenadas
  if (latitud !== null && longitud !== null) {
    return calcularDomicilioPorCoordenadas(latitud, longitud, origen);
  }

  // FALLBACK: cálculo por calle/carrera
  return calcularDomicilioPorTexto(calle, carrera);
}

function calcularDomicilioPorTexto(
  calle: number | null,
  carrera: number | null,
): ResultadoDomicilio {
  if (calle === null || carrera === null) {
    return {
      estado: "OK",
      zona: "Dirección aproximada",
      valor: TARIFA_MINIMA,
      requiereConfirmacion: true,
      mensaje:
        "No se pudo detectar con precisión la dirección. El domicilio debe confirmarse con la tienda.",
    };
  }

  const estaDentroCoberturaGlobal =
    calle >= LIMITES_COBERTURA.calleMin &&
    calle <= LIMITES_COBERTURA.calleMax &&
    carrera >= LIMITES_COBERTURA.carreraMin &&
    carrera <= LIMITES_COBERTURA.carreraMax;

  if (!estaDentroCoberturaGlobal) {
    return {
      estado: "OK",
      zona: "Fuera de zona",
      valor: TARIFA_MINIMA,
      requiereConfirmacion: true,
      mensaje:
        "La dirección está fuera de la cobertura habitual. El pedido requiere confirmación por parte de la tienda.",
    };
  }

  const reglaEncontrada = REGLAS_DOMICILIO.find((regla) => {
    return (
      calle >= regla.calleDesde &&
      calle <= regla.calleHasta &&
      carrera >= regla.carreraDesde &&
      carrera <= regla.carreraHasta
    );
  });

  if (!reglaEncontrada) {
    return {
      estado: "OK",
      zona: "Zona no definida",
      valor: TARIFA_MINIMA,
      requiereConfirmacion: true,
      mensaje:
        "La dirección no coincide con una zona exacta. El domicilio debe ser validado por la tienda.",
    };
  }

  return {
    estado: "OK",
    zona: reglaEncontrada.zona,
    valor: reglaEncontrada.valor,
    requiereConfirmacion: false,
    mensaje: "Domicilio confirmado según zona de cobertura.",
  };
}

function calcularDomicilioPorCoordenadas(
  latitud: number,
  longitud: number,
  origen?: {
    latitud?: number;
    longitud?: number;
  },
): ResultadoDomicilio {
  const latOrigen = origen?.latitud ?? CENTRO_COBERTURA.latitud;
  const lngOrigen = origen?.longitud ?? CENTRO_COBERTURA.longitud;

  const distanciaKm = calcularDistanciaKm(
    latOrigen,
    lngOrigen,
    latitud,
    longitud,
  );

  if (distanciaKm > RADIOS_COBERTURA.maximo) {
    return {
      estado: "OK",
      zona: "Fuera de zona",
      valor: TARIFA_MINIMA,
      requiereConfirmacion: true,
      mensaje:
        "La ubicación está fuera de la cobertura habitual. El pedido requiere confirmación por parte de la tienda.",
    };
  }

  if (distanciaKm <= RADIOS_COBERTURA.zona1) {
    return {
      estado: "OK",
      zona: "Zona 1",
      valor: 3000,
      requiereConfirmacion: false,
      mensaje: "Domicilio confirmado según ubicación detectada.",
    };
  }

  if (distanciaKm <= RADIOS_COBERTURA.zona2) {
    return {
      estado: "OK",
      zona: "Zona 2",
      valor: 4000,
      requiereConfirmacion: false,
      mensaje: "Domicilio confirmado según ubicación detectada.",
    };
  }

  if (distanciaKm <= RADIOS_COBERTURA.zona3) {
    return {
      estado: "OK",
      zona: "Zona 3",
      valor: 5000,
      requiereConfirmacion: false,
      mensaje: "Domicilio confirmado según ubicación detectada.",
    };
  }

  if (distanciaKm <= RADIOS_COBERTURA.zona4) {
    return {
      estado: "OK",
      zona: "Zona 4",
      valor: 5000,
      requiereConfirmacion: false,
      mensaje: "Domicilio confirmado según ubicación detectada.",
    };
  }

  if (distanciaKm <= RADIOS_COBERTURA.zona5) {
    return {
      estado: "OK",
      zona: "Zona 5",
      valor: 6000,
      requiereConfirmacion: false,
      mensaje: "Domicilio confirmado según ubicación detectada.",
    };
  }

  if (distanciaKm <= RADIOS_COBERTURA.zona6) {
    return {
      estado: "OK",
      zona: "Zona 6",
      valor: 7000,
      requiereConfirmacion: false,
      mensaje: "Domicilio confirmado según ubicación detectada.",
    };
  }

  return {
    estado: "OK",
    zona: "Cobertura extendida",
    valor: TARIFA_MINIMA,
    requiereConfirmacion: true,
    mensaje:
      "La ubicación está en un rango extendido y debe ser validada por la tienda.",
  };
}

function calcularDistanciaKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const radioTierraKm = 6371;
  const dLat = gradosARadianes(lat2 - lat1);
  const dLng = gradosARadianes(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(gradosARadianes(lat1)) *
      Math.cos(gradosARadianes(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return radioTierraKm * c;
}

function gradosARadianes(grados: number): number {
  return (grados * Math.PI) / 180;
}
