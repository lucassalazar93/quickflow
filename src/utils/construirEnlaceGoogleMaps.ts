type ConstruirEnlaceGoogleMapsParams = {
  direccion: string;
  barrio?: string;
  ciudad?: string;
  pais?: string;
};

export function construirEnlaceGoogleMaps({
  direccion,
  barrio,
  ciudad = "Medellín",
  pais = "Colombia",
}: ConstruirEnlaceGoogleMapsParams): string {
  const partes = [direccion, barrio, ciudad, pais].filter(Boolean);
  const destino = partes.join(", ");

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}&travelmode=driving`;
}
