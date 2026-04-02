import type { GrupoAdiciones } from "@/types/adicion";

export const GRUPOS_ADICIONES: Record<string, GrupoAdiciones> = {
  salsas: {
    id: "salsas",
    nombre: "Salsas",
    descripcion: "Puedes elegir las que quieras o pedir sin salsas",
    obligatorio: false,
    tipoSeleccion: "multiple",
    minSeleccion: 0,
    opciones: [
      { id: "rosada", nombre: "Rosada", precio: 0 },
      { id: "pina", nombre: "Piña", precio: 1000 },
      { id: "bbq", nombre: "BBQ", precio: 0 },
      { id: "ajo", nombre: "Ajo", precio: 0 },
    ],
  },

  adiciones: {
    id: "adiciones",
    nombre: "Adiciones",
    descripcion: "Agrega extras a tu producto",
    obligatorio: false,
    tipoSeleccion: "multiple",
    minSeleccion: 0,
    opciones: [
      { id: "queso", nombre: "Queso", precio: 2000, permiteCantidad: true },
      { id: "huevo", nombre: "Huevo X4", precio: 2000, permiteCantidad: true },
      {
        id: "tocineta",
        nombre: "Tocineta",
        precio: 3000,
        permiteCantidad: true,
      },
    ],
  },
};
