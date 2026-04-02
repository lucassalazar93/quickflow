import { create } from "zustand";
import { ItemCarrito } from "@/types/carrito";

interface CarritoState {
  items: ItemCarrito[];

  agregarItem: (item: ItemCarrito) => void;
  actualizarItem: (id: string, item: ItemCarrito) => void;
  eliminarItem: (id: string) => void;
  limpiar: () => void;
}

export const useCarritoStore = create<CarritoState>((set) => ({
  items: [],

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

  limpiar: () => set({ items: [] }),
}));
