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
      { id: "pina", nombre: "Piña", precio: 0 },
      { id: "bbq", nombre: "BBQ", precio: 0 },
      { id: "ajo", nombre: "Ajo", precio: 0 },
      { id: "maiz", nombre: "Maíz", precio: 0 },
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
      {
        id: "bombon-pollo",
        nombre: "Bombón de pollo",
        precio: 7000,
        permiteCantidad: true,
      },
      {
        id: "pollo-desmechado",
        nombre: "Pollo desmechado",
        precio: 7000,
        permiteCantidad: true,
      },
      {
        id: "carne-desmechada",
        nombre: "Carne desmechada",
        precio: 7000,
        permiteCantidad: true,
      },
      {
        id: "tocineta",
        nombre: "Tocineta",
        precio: 7000,
        permiteCantidad: true,
      },
      {
        id: "chorizo-ternera",
        nombre: "Chorizo de ternera",
        precio: 6000,
        permiteCantidad: true,
      },
      {
        id: "chorizo-pollo",
        nombre: "Chorizo de pollo",
        precio: 6000,
        permiteCantidad: true,
      },
      {
        id: "arepaburger",
        nombre: "Arepaburger",
        precio: 6000,
        permiteCantidad: true,
      },
      {
        id: "longaniza",
        nombre: "Longaniza",
        precio: 6000,
        permiteCantidad: true,
      },
      {
        id: "salchicha-x5",
        nombre: "Salchicha x5",
        precio: 1000,
        permiteCantidad: true,
      },
      {
        id: "chorizo-coctelero",
        nombre: "Chorizo coctelero",
        precio: 500,
        permiteCantidad: true,
      },
      {
        id: "huevo-codorniz-x4",
        nombre: "Huevo de codorniz x4",
        precio: 2000,
        permiteCantidad: true,
      },
      {
        id: "arepa-grande",
        nombre: "Arepa grande",
        precio: 1000,
        permiteCantidad: true,
      },
      {
        id: "arepa-pequena",
        nombre: "Arepa pequeña",
        precio: 500,
        permiteCantidad: true,
      },
      {
        id: "queso-mozzarella",
        nombre: "Queso mozzarella",
        precio: 2000,
        permiteCantidad: true,
      },
      {
        id: "papas-fritas",
        nombre: "Papas fritas",
        precio: 2000,
        permiteCantidad: true,
      },
    ],
  },
};
