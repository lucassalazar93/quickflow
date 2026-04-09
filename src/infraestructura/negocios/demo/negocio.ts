import type { Negocio } from "@/types/negocio";

export const negocioDemo: Negocio = {
  id: "demo",
  nombre: "MANDINGAS La 37",
  slug: "demo",
  logo: "/logo-demo.png",
  subtitulo: "Pide fácil por WhatsApp y recibe tu comida rápido.",
  colorPrimario: "#E1251B",
  colorSecundario: "#FFD54A",
  abierto: true, //  temporal, luego se reemplaza por lógica de horarios
  whatsapp: "573001234567",

  //  Ubicación física del negocio
  direccion: "Carrera 37 # 79-55, Medellín, Colombia",
  latitud: 6.2732,
  longitud: -75.5516,

  //  Configuración horaria real
  horarios: {
    timezone: "America/Bogota",

    atencion: {
      lunes: { apertura: "18:00", cierre: "00:00" },
      martes: { apertura: "18:00", cierre: "00:00" },
      miercoles: { apertura: "18:00", cierre: "00:00" },
      jueves: { apertura: "18:00", cierre: "00:00" },
      viernes: { apertura: "18:00", cierre: "01:00" },
      sabado: { apertura: "18:00", cierre: "02:00" },
      domingo: { apertura: "18:00", cierre: "01:00" },
      festivos: { apertura: "18:00", cierre: "01:00" },
    },

    domicilios: {
      inicio: "19:40", // empiezan domicilios
      corteAntesDeCierreMinutos: 20, // se cierran 20 min antes
    },
  },
};
