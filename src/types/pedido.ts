export type ItemPedido = {
  id: string;
  productoId: string;
  nombre: string;
  cantidad: number;
  precioBase: number;
  adiciones: {
    nombre: string;
    precio: number;
  }[];
  observaciones?: string;
};

export type Pedido = {
  items: ItemPedido[];
  tipoEntrega: "domicilio" | "recoger";
  nombre: string;
  celular: string;
  direccion?: string;
  referencia?: string;
  metodoPago: "efectivo" | "transferencia" | "contraentrega";
};
