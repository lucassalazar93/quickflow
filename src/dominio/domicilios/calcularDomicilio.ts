import { REGLAS_DOMICILIO } from "./reglasDomicilio";

export type ResultadoDomicilio = {
  estado: "OK";
  zona: string;
  valor: number;
  requiereConfirmacion: boolean;
  mensaje: string;
};

const LIMITES_COBERTURA = {
  calleMin: 66,
  calleMax: 99,
  carreraMin: 24,
  carreraMax: 50,
};

const TARIFA_MINIMA = 3000;

export function calcularDomicilio(
  calle: number | null,
  carrera: number | null,
): ResultadoDomicilio {
  // 🔸 Caso 1: no detecta bien la dirección
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

  // 🔸 Caso 2: fuera de cobertura
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

  // 🔍 Buscar regla por zonas
  const reglaEncontrada = REGLAS_DOMICILIO.find((regla) => {
    return (
      calle >= regla.calleDesde &&
      calle <= regla.calleHasta &&
      carrera >= regla.carreraDesde &&
      carrera <= regla.carreraHasta
    );
  });

  // 🔸 Caso 3: no cae en ninguna zona definida
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

  // ✅ Caso correcto: dirección detectada y dentro de zona válida
  return {
    estado: "OK",
    zona: reglaEncontrada.zona,
    valor: reglaEncontrada.valor,
    requiereConfirmacion: false,
    mensaje: "Domicilio confirmado según zona de cobertura.",
  };
}
