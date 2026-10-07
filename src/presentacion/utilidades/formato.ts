const formatoPesos = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 0,
  useGrouping: "always",
});

// "$6.000": siempre con separador de miles, igual en todos los dispositivos
export function pesos(valor: number): string {
  return `$${formatoPesos.format(valor)}`;
}

// Los datos vienen en mayúsculas ("LONGUI ESPECIAL"); en pantalla se leen mejor así
export function nombreVisible(nombre: string): string {
  const limpio = nombre
    .trim()
    .replace(/^gaseosa\s+/i, "")
    .toLowerCase();

  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

export function tiempoRestante(minutos: number): string {
  const total = Math.max(0, Math.round(minutos));
  const horas = Math.floor(total / 60);
  const resto = total % 60;

  if (horas === 0) {
    return `${resto} min`;
  }

  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}
