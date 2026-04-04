export type MetodoPago = "efectivo" | "transferencia" | "contraentrega";
export type TipoEntrega = "domicilio" | "recoger";

export type AdicionPedido = {
  nombre: string;
  precio: number;
};

export type ItemPedido = {
  id: string;
  productoId: string;
  nombre: string;
  cantidad: number;
  precioBase: number;
  adiciones: AdicionPedido[];
  observaciones?: string;
};

export type DatosEntrega = {
  tipoEntrega: TipoEntrega;
  direccion?: string;
  barrio?: string;
  referencia?: string;
  enlaceMaps?: string;
};

export type ClientePedido = {
  nombre: string;
  celular: string;
};

export type Pedido = {
  items: ItemPedido[];
  cliente: ClientePedido;
  entrega: DatosEntrega;
  metodoPago: MetodoPago;
};
