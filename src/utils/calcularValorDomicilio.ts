export type Coordenadas = {
  latitud: number;
  longitud: number;
};

type RangoTarifa = {
  maxKm: number;
  valor: number;
};

const TARIFAS_POR_DISTANCIA: RangoTarifa[] = [
  { maxKm: 1.5, valor: 3000 },
  { maxKm: 3, valor: 4000 },
  { maxKm: 5, valor: 5000 },
  { maxKm: 7, valor: 6000 },
  { maxKm: Infinity, valor: 7000 },
];

// Cambia estas coordenadas por las reales del negocio
export const COORDENADAS_NEGOCIO: Coordenadas = {
  latitud: 6.270519,
  longitud: -75.565821,
};

export function calcularDistanciaEnKm(
  origen: Coordenadas,
  destino: Coordenadas,
): number {
  const radioTierraKm = 6371;

  const dLat = gradosARadianes(destino.latitud - origen.latitud);
  const dLng = gradosARadianes(destino.longitud - origen.longitud);

  const lat1 = gradosARadianes(origen.latitud);
  const lat2 = gradosARadianes(destino.latitud);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return radioTierraKm * c;
}

export function calcularValorDomicilio(
  origen: Coordenadas,
  destino?: Coordenadas,
): number {
  if (!destino) return 0;

  const distanciaKm = calcularDistanciaEnKm(origen, destino);

  const tarifa = TARIFAS_POR_DISTANCIA.find(
    (rango) => distanciaKm <= rango.maxKm,
  );

  return tarifa?.valor ?? 7000;
}

function gradosARadianes(grados: number): number {
  return (grados * Math.PI) / 180;
}
