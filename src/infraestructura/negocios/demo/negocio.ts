import type { Negocio } from "@/types/negocio";

export const negocioDemo: Negocio = {
  id: "demo",
  nombre: "MANDINGAS La 37",
  slug: "demo",
  logo: "/logo-demo.png",
  subtitulo: "Pide fácil por WhatsApp y recibe tu comida rápido.",
  colorPrimario: "#E1251B",
  colorSecundario: "#FFD54A",
  abierto: true,
  whatsapp: "573001234567",

  // datos para domicilios y mapas
  direccion: "Carrera 37 # 79-55, Medellín, Colombia",
  latitud: 6.2732,
  longitud: -75.5516,
};
