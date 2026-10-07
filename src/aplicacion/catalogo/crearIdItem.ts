// Identificador de una línea del pedido: el mismo producto puede ir varias veces
// con salsas o adiciones distintas.
export function crearIdItem(productoId: string): string {
  return `${productoId}-${Date.now()}`;
}
