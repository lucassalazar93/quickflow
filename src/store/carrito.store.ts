import { create } from "zustand";
import { ItemCarrito } from "@/types/carrito";
import { TipoEntrega, MetodoPago } from "@/types/pedido";

interface CarritoState {
  items: ItemCarrito[];

  // 👇 datos del cliente
  nombre: string;
  celular: string;

  // 👇 datos de entrega
  tipoEntrega: TipoEntrega;
  direccion: string;
  barrio: string;
  referencia: string;
  enlaceMaps: string;

  // 👇 pago
  metodoPago: MetodoPago;

  // ========================
  // ACCIONES
  // ========================
  agregarItem: (item: ItemCarrito) => void;
  actualizarItem: (id: string, item: ItemCarrito) => void;
  eliminarItem: (id: string) => void;
  limpiar: () => void;

  setCliente: (nombre: string, celular: string) => void;

  setEntrega: (data: {
    tipoEntrega?: TipoEntrega;
    direccion?: string;
    barrio?: string;
    referencia?: string;
  }) => void;

  setMetodoPago: (metodo: MetodoPago) => void;

  obtenerSubtotal: () => number;
}

export const useCarritoStore = create<CarritoState>((set, get) => ({
  items: [],

  // 👇 cliente
  nombre: "",
  celular: "",

  // 👇 entrega
  tipoEntrega: "domicilio",
  direccion: "",
  barrio: "",
  referencia: "",
  enlaceMaps: "",

  // 👇 pago
  metodoPago: "efectivo",

  // ========================
  // ACCIONES EXISTENTES
  // ========================
  agregarItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),

  actualizarItem: (id, item) =>
    set((state) => {
      const existe = state.items.some((i) => i.id === id);

      return {
        items: existe
          ? state.items.map((i) => (i.id === id ? item : i))
          : [...state.items, item],
      };
    }),

  eliminarItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  limpiar: () =>
    set({
      items: [],
      nombre: "",
      celular: "",
      tipoEntrega: "domicilio",
      direccion: "",
      barrio: "",
      referencia: "",
      enlaceMaps: "",
      metodoPago: "efectivo",
    }),

  // ========================
  // NUEVAS ACCIONES
  // ========================

  setCliente: (nombre, celular) =>
    set({
      nombre,
      celular,
    }),

  setEntrega: (data) =>
    set((state) => ({
      tipoEntrega: data.tipoEntrega ?? state.tipoEntrega,
      direccion: data.direccion ?? state.direccion,
      barrio: data.barrio ?? state.barrio,
      referencia: data.referencia ?? state.referencia,
    })),

  setMetodoPago: (metodo) =>
    set({
      metodoPago: metodo,
    }),

  obtenerSubtotal: () => {
    const { items } = get();

    return items.reduce((total, item) => total + item.total, 0);
  },
}));
