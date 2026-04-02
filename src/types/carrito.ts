export interface ItemCarrito {
  id: string;
  productoId: string;
  nombre: string;
  imagen: string;
  precioBase: number;

  cantidad: number;

  salsas: string[];

  adiciones: {
    id: string;
    nombre: string;
    precio: number;
    cantidad: number;
  }[];

  total: number;
}
