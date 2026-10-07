import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { negocioDemo } from "../../infraestructura/negocios/demo/negocio";
import { esFestivoColombia } from "./festivosColombia";
import {
  obtenerEstadoNegocio,
  obtenerResumenHorariosVisible,
} from "./obtenerEstadoNegocio";

// Hora de Colombia (UTC-5, sin horario de verano) -> instante real
function colombia(fecha: string, hora: string): Date {
  return new Date(`${fecha}T${hora}:00-05:00`);
}

const estadoEn = (fecha: string, hora: string) =>
  obtenerEstadoNegocio(negocioDemo, colombia(fecha, hora));

describe("obtenerEstadoNegocio", () => {
  beforeEach(() => {
    delete process.env.APP_ESTADO_NEGOCIO_FORZADO;
    delete process.env.NEXT_PUBLIC_ESTADO_NEGOCIO_FORZADO;
  });

  describe("lunes a jueves (lunes 5 de octubre de 2026)", () => {
    it("está cerrado antes de abrir y anuncia la apertura de hoy", () => {
      const estado = estadoEn("2026-10-05", "17:59");

      expect(estado.estado).toBe("cerrado");
      expect(estado.estaAbierto).toBe(false);
      expect(estado.chip).toBe("Abrimos hoy a las 6:00 PM");
      expect(estado.mensaje).toContain("Abrimos hoy a las 6:00 PM");
      expect(estado.mensaje).toContain("domicilios desde las 7:20 PM");
    });

    it("abre a las 6:00 PM sin domicilios todavía", () => {
      const estado = estadoEn("2026-10-05", "19:19");

      expect(estado.estado).toBe("domicilios_no_disponibles");
      expect(estado.puedeRecibirDomicilios).toBe(false);
      expect(estado.chip).toBe("Domicilios desde las 7:20 PM");
    });

    it("recibe domicilios de 7:20 PM a 11:40 PM", () => {
      expect(estadoEn("2026-10-05", "19:20").puedeRecibirDomicilios).toBe(true);
      expect(estadoEn("2026-10-05", "23:40").puedeRecibirDomicilios).toBe(true);
      expect(estadoEn("2026-10-05", "23:40").mensaje).toContain("11:40 PM");
    });

    it("cierra domicilios después de las 11:40 PM pero sigue abierto", () => {
      const estado = estadoEn("2026-10-05", "23:41");

      expect(estado.estado).toBe("domicilios_cerrados");
      expect(estado.estaAbierto).toBe(true);
      expect(estado.mensaje).toContain("12:00 AM");
    });

    it("está cerrado pasada la medianoche", () => {
      const estado = estadoEn("2026-10-06", "00:01");

      expect(estado.estado).toBe("cerrado");
      expect(estado.chip).toBe("Abrimos hoy a las 6:00 PM");
    });
  });

  it("viernes recibe domicilios hasta las 12:40 AM del sábado", () => {
    expect(estadoEn("2026-10-10", "00:40").puedeRecibirDomicilios).toBe(true);
    expect(estadoEn("2026-10-10", "00:41").estado).toBe("domicilios_cerrados");
    expect(estadoEn("2026-10-10", "01:01").estado).toBe("cerrado");
  });

  it("sábado recibe domicilios hasta la 1:40 AM del domingo", () => {
    expect(estadoEn("2026-10-11", "01:40").puedeRecibirDomicilios).toBe(true);
    expect(estadoEn("2026-10-11", "01:41").estado).toBe("domicilios_cerrados");
    expect(estadoEn("2026-10-11", "02:01").estado).toBe("cerrado");
  });

  it("domingo recibe domicilios hasta las 12:40 AM del lunes", () => {
    expect(estadoEn("2026-10-05", "00:40").puedeRecibirDomicilios).toBe(true);
    expect(estadoEn("2026-10-05", "00:41").estado).toBe("domicilios_cerrados");
  });

  it("lunes festivo (12 de octubre de 2026) usa el horario de festivos", () => {
    // Un lunes normal ya estaría cerrado a las 12:30 AM
    expect(estadoEn("2026-10-06", "00:30").estado).toBe("cerrado");

    expect(estadoEn("2026-10-13", "00:40").puedeRecibirDomicilios).toBe(true);
    expect(estadoEn("2026-10-13", "00:41").estado).toBe("domicilios_cerrados");
    expect(estadoEn("2026-10-13", "01:01").estado).toBe("cerrado");
  });

  describe("modo prueba (estado forzado por variable de entorno)", () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("en desarrollo permite forzar el estado", () => {
      vi.stubEnv("NEXT_PUBLIC_ESTADO_NEGOCIO_FORZADO", "cerrado");

      // Lunes 8:00 PM: por horario estaría abierto
      expect(estadoEn("2026-10-05", "20:00").estado).toBe("cerrado");
    });

    it("en producción se ignora y manda el horario real", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("NEXT_PUBLIC_ESTADO_NEGOCIO_FORZADO", "abierto");
      vi.stubEnv("APP_ESTADO_NEGOCIO_FORZADO", "abierto");

      // Lunes 2:00 PM: cerrado aunque la variable diga "abierto"
      const estado = estadoEn("2026-10-05", "14:00");

      expect(estado.estado).toBe("cerrado");
      expect(estado.mensaje).not.toContain("Modo prueba");
      // Lunes 8:00 PM: abierto, sin textos de prueba
      expect(estadoEn("2026-10-05", "20:00").lineaCorta).toBe(
        "Domicilios hasta las 11:40 PM",
      );
    });
  });

  it("no depende de la zona horaria del dispositivo", () => {
    // 01:00 UTC del martes = 8:00 PM del lunes en Colombia
    const estado = obtenerEstadoNegocio(
      negocioDemo,
      new Date("2026-10-06T01:00:00Z"),
    );

    expect(estado.estado).toBe("abierto");
  });
});

describe("obtenerResumenHorariosVisible", () => {
  it("lista las ventanas reales de domicilios", () => {
    expect(obtenerResumenHorariosVisible(negocioDemo).lineasDomicilios).toEqual([
      "Lunes a jueves: 7:20 PM - 11:40 PM",
      "Viernes: 7:20 PM - 12:40 AM",
      "Sábado: 7:20 PM - 1:40 AM",
      "Domingo y festivos: 7:20 PM - 12:40 AM",
    ]);
  });
});

describe("esFestivoColombia", () => {
  it("reconoce festivos fijos, trasladados y de Semana Santa en 2026", () => {
    expect(esFestivoColombia(2026, 1, 1)).toBe(true);
    expect(esFestivoColombia(2026, 7, 20)).toBe(true);
    // Reyes: 6 de enero cae martes, pasa al lunes 12
    expect(esFestivoColombia(2026, 1, 6)).toBe(false);
    expect(esFestivoColombia(2026, 1, 12)).toBe(true);
    // Pascua 2026: 5 de abril
    expect(esFestivoColombia(2026, 4, 2)).toBe(true);
    expect(esFestivoColombia(2026, 4, 3)).toBe(true);
    expect(esFestivoColombia(2026, 5, 18)).toBe(true);
    expect(esFestivoColombia(2026, 6, 8)).toBe(true);
    expect(esFestivoColombia(2026, 6, 15)).toBe(true);
  });

  it("no marca días corrientes", () => {
    expect(esFestivoColombia(2026, 10, 5)).toBe(false);
    expect(esFestivoColombia(2026, 10, 6)).toBe(false);
  });
});
