export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoriaId: string;

  gruposAdicionesIds?: string[];
}
