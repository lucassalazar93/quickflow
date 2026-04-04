type ConstruirEnlaceGoogleMapsParams = {
  direccion?: string;
  barrio?: string;
  ciudad?: string;
  pais?: string;
  latitud?: number | null;
  longitud?: number | null;
};

export function construirEnlaceGoogleMaps({
  direccion,
  barrio,
  ciudad = "Medellín",
  pais = "Colombia",
  latitud,
  longitud,
}: ConstruirEnlaceGoogleMapsParams): string {
  // 🟢 PRIORIDAD 1: Coordenadas (más preciso)
  if (latitud != null && longitud != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitud},${longitud}&travelmode=driving`;
  }

  // 🟡 FALLBACK: Dirección en texto
  const partes = [direccion, barrio, ciudad, pais].filter(Boolean);
  const destino = partes.join(", ");

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}&travelmode=driving`;
}
