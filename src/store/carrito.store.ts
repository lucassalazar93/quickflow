import { create } from "zustand";
import { ItemCarrito } from "@/types/carrito";
import { TipoEntrega, MetodoPago } from "@/types/pedido";
import { construirEnlaceGoogleMaps } from "@/utils/construirEnlaceGoogleMaps";
import { calcularDomicilio } from "@/dominio/domicilios/calcularDomicilio";
import {
  extraerCalle,
  extraerCarrera,
} from "@/dominio/domicilios/parseDireccion";

type EstadoDomicilio = "OK" | "SIN_COBERTURA" | "NO_DETECTADO";

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

  // 👇 nuevo: cálculo domicilio
  valorDomicilio: number;
  zonaDomicilio: string;
  estadoDomicilio: EstadoDomicilio;

  // 👇 pago
  metodoPago: MetodoPago;

  // ========================
  // ACCIONES EXISTENTES
  // ========================
  agregarItem: (item: ItemCarrito) => void;
  actualizarItem: (id: string, item: ItemCarrito) => void;
  eliminarItem: (id: string) => void;
  limpiar: () => void;

  // ========================
  // NUEVAS ACCIONES
  // ========================
  setCliente: (nombre: string, celular: string) => void;

  setEntrega: (data: {
    tipoEntrega?: TipoEntrega;
    direccion?: string;
    barrio?: string;
    referencia?: string;
  }) => void;

  setMetodoPago: (metodo: MetodoPago) => void;

  generarEnlaceMaps: () => void;
  recalcularDomicilio: () => void;

  obtenerSubtotal: () => number;
  obtenerTotal: () => number;
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

  // 👇 domicilio calculado
  valorDomicilio: 0,
  zonaDomicilio: "",
  estadoDomicilio: "NO_DETECTADO",

  // 👇 pago
  metodoPago: "efectivo",

  // ========================
  // EXISTENTES
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
      valorDomicilio: 0,
      zonaDomicilio: "",
      estadoDomicilio: "NO_DETECTADO",
      metodoPago: "efectivo",
    }),

  // ========================
  // NUEVAS FUNCIONES
  // ========================

  setCliente: (nombre, celular) =>
    set({
      nombre,
      celular,
    }),

  setEntrega: (data) => {
    set((state) => {
      const siguienteTipoEntrega = data.tipoEntrega ?? state.tipoEntrega;
      const siguienteDireccion = data.direccion ?? state.direccion;
      const siguienteBarrio = data.barrio ?? state.barrio;
      const siguienteReferencia = data.referencia ?? state.referencia;

      let valorDomicilio = state.valorDomicilio;
      let zonaDomicilio = state.zonaDomicilio;
      let estadoDomicilio = state.estadoDomicilio;

      if (siguienteTipoEntrega === "recoger") {
        valorDomicilio = 0;
        zonaDomicilio = "";
        estadoDomicilio = "NO_DETECTADO";
      } else {
        const calle = extraerCalle(siguienteDireccion);
        const carrera = extraerCarrera(siguienteDireccion);

        const resultado = calcularDomicilio(calle, carrera);

        if (resultado.estado === "OK") {
          valorDomicilio = resultado.valor;
          zonaDomicilio = resultado.zona;
          estadoDomicilio = "OK";
        }

        if (resultado.estado === "SIN_COBERTURA") {
          valorDomicilio = 0;
          zonaDomicilio = "";
          estadoDomicilio = "SIN_COBERTURA";
        }

        if (resultado.estado === "NO_DETECTADO") {
          valorDomicilio = 0;
          zonaDomicilio = "";
          estadoDomicilio = "NO_DETECTADO";
        }
      }

      return {
        tipoEntrega: siguienteTipoEntrega,
        direccion: siguienteDireccion,
        barrio: siguienteBarrio,
        referencia: siguienteReferencia,
        valorDomicilio,
        zonaDomicilio,
        estadoDomicilio,
      };
    });
  },

  setMetodoPago: (metodo) =>
    set({
      metodoPago: metodo,
    }),

  generarEnlaceMaps: () => {
    const { direccion, barrio } = get();

    if (!direccion) return;

    const enlace = construirEnlaceGoogleMaps({
      direccion,
      barrio,
    });

    set({
      enlaceMaps: enlace,
    });
  },

  recalcularDomicilio: () => {
    const { direccion, tipoEntrega } = get();

    if (tipoEntrega === "recoger") {
      set({
        valorDomicilio: 0,
        zonaDomicilio: "",
        estadoDomicilio: "NO_DETECTADO",
      });
      return;
    }

    const calle = extraerCalle(direccion);
    const carrera = extraerCarrera(direccion);

    const resultado = calcularDomicilio(calle, carrera);

    if (resultado.estado === "OK") {
      set({
        valorDomicilio: resultado.valor,
        zonaDomicilio: resultado.zona,
        estadoDomicilio: "OK",
      });
      return;
    }

    if (resultado.estado === "SIN_COBERTURA") {
      set({
        valorDomicilio: 0,
        zonaDomicilio: "",
        estadoDomicilio: "SIN_COBERTURA",
      });
      return;
    }

    set({
      valorDomicilio: 0,
      zonaDomicilio: "",
      estadoDomicilio: "NO_DETECTADO",
    });
  },

  obtenerSubtotal: () => {
    const { items } = get();

    return items.reduce((total, item) => total + item.total, 0);
  },

  obtenerTotal: () => {
    const { items, tipoEntrega, valorDomicilio } = get();

    const subtotal = items.reduce((total, item) => total + item.total, 0);

    if (tipoEntrega === "recoger") {
      return subtotal;
    }

    return subtotal + valorDomicilio;
  },
}));
