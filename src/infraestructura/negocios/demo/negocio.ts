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

  calificacion: 4.8,
  tiempoEstimado: "25 - 35 min",

  // 🔥 IMPORTANTE: reemplazamos horarioHoy por estructura completa
  horarios: [
    { dias: "Lunes a jueves", hora: "6:00 PM - 12:00 AM" },
    { dias: "Viernes", hora: "6:00 PM - 1:00 AM" },
    { dias: "Sábado", hora: "6:00 PM - 2:00 AM" },
    { dias: "Domingo", hora: "6:00 PM - 1:00 AM" },
    { dias: "Festivos", hora: "6:00 PM - 1:00 AM" },
  ],

  opcionesEntrega: ["Para recoger", "A domicilio"],

  mensajeBienvenida:
    "Nuestros productos tienen un tiempo de cocción importante para brindarte excelente calidad. Gracias por tu espera y comprensión.",

  botonesInicio: [
    {
      id: "menu",
      texto: "MENÚ",
      tipo: "menu",
    },
    {
      id: "domicilios",
      texto: "DOMICILIOS",
      tipo: "domicilios",
    },
    {
      id: "opiniones",
      texto: "DÉJANOS TU OPINIÓN",
      tipo: "opiniones",
    },
  ],
};
