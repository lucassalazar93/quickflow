import { describe, expect, it } from "vitest";
import {
  EXCEPCIONES_DOMICILIO,
  LIMITES_COBERTURA,
  REGLAS_DOMICILIO,
} from "./reglasDomicilio";

const VALORES_PERMITIDOS = [3000, 4000, 5000, 6000, 7000] as const;
const ZONA_A_VALOR: Record<string, (typeof VALORES_PERMITIDOS)[number]> = {
  "Zona 1": 3000,
  "Zona 2": 4000,
  "Zona 3": 5000,
  "Zona 4": 6000,
  "Zona 5": 7000,
};

describe("reglasDomicilio - consistencia de áreas y valores", () => {
  it("los 4 puntos cardinales de cobertura quedan definidos correctamente", () => {
    const limitesCardinales = {
      sur: LIMITES_COBERTURA.calleMin,
      norte: LIMITES_COBERTURA.calleMax,
      oriente: LIMITES_COBERTURA.carreraMin,
      occidente: LIMITES_COBERTURA.carreraMax,
    };

    expect(limitesCardinales.sur).toBe(65);
    expect(limitesCardinales.norte).toBe(98);
    expect(limitesCardinales.oriente).toBe(28);
    expect(limitesCardinales.occidente).toBe(50);
  });

  it("las 4 esquinas cardinales están cubiertas por una única regla", () => {
    const esquinas = [
      {
        calle: LIMITES_COBERTURA.calleMin,
        carrera: LIMITES_COBERTURA.carreraMin,
      },
      {
        calle: LIMITES_COBERTURA.calleMin,
        carrera: LIMITES_COBERTURA.carreraMax,
      },
      {
        calle: LIMITES_COBERTURA.calleMax,
        carrera: LIMITES_COBERTURA.carreraMin,
      },
      {
        calle: LIMITES_COBERTURA.calleMax,
        carrera: LIMITES_COBERTURA.carreraMax,
      },
    ];

    for (const esquina of esquinas) {
      const coincidencias = REGLAS_DOMICILIO.filter(
        (regla) =>
          esquina.calle >= regla.calleDesde &&
          esquina.calle <= regla.calleHasta &&
          esquina.carrera >= regla.carreraDesde &&
          esquina.carrera <= regla.carreraHasta,
      );

      expect(
        coincidencias.length,
        `La esquina calle ${esquina.calle}, carrera ${esquina.carrera} no quedó bien cubierta`,
      ).toBe(1);
    }
  });

  it("cada punto dentro de cobertura cae en exactamente una regla", () => {
    for (
      let calle = LIMITES_COBERTURA.calleMin;
      calle <= LIMITES_COBERTURA.calleMax;
      calle += 1
    ) {
      for (
        let carrera = LIMITES_COBERTURA.carreraMin;
        carrera <= LIMITES_COBERTURA.carreraMax;
        carrera += 1
      ) {
        const coincidencias = REGLAS_DOMICILIO.filter(
          (regla) =>
            calle >= regla.calleDesde &&
            calle <= regla.calleHasta &&
            carrera >= regla.carreraDesde &&
            carrera <= regla.carreraHasta,
        );

        expect(
          coincidencias.length,
          `La coordenada calle ${calle}, carrera ${carrera} no está bien cubierta`,
        ).toBe(1);
      }
    }
  });

  it("todas las reglas usan zona y valor coherentes", () => {
    for (const regla of REGLAS_DOMICILIO) {
      expect(regla.zona in ZONA_A_VALOR).toBe(true);
      expect(VALORES_PERMITIDOS).toContain(regla.valor);
      expect(regla.valor).toBe(ZONA_A_VALOR[regla.zona]);
    }
  });

  it("ninguna regla sale de los límites globales de cobertura", () => {
    for (const regla of REGLAS_DOMICILIO) {
      expect(regla.calleDesde).toBeGreaterThanOrEqual(
        LIMITES_COBERTURA.calleMin,
      );
      expect(regla.calleHasta).toBeLessThanOrEqual(LIMITES_COBERTURA.calleMax);
      expect(regla.carreraDesde).toBeGreaterThanOrEqual(
        LIMITES_COBERTURA.carreraMin,
      );
      expect(regla.carreraHasta).toBeLessThanOrEqual(
        LIMITES_COBERTURA.carreraMax,
      );
    }
  });

  it("las excepciones tienen formato válido y valor permitido", () => {
    for (const excepcion of EXCEPCIONES_DOMICILIO) {
      expect(excepcion.calle).toBeGreaterThanOrEqual(
        LIMITES_COBERTURA.calleMin,
      );
      expect(excepcion.calle).toBeLessThanOrEqual(LIMITES_COBERTURA.calleMax);
      expect(excepcion.carrera).toBeGreaterThanOrEqual(
        LIMITES_COBERTURA.carreraMin,
      );
      expect(excepcion.carrera).toBeLessThanOrEqual(
        LIMITES_COBERTURA.carreraMax,
      );
      expect(VALORES_PERMITIDOS).toContain(
        excepcion.valor as 3000 | 4000 | 5000 | 6000 | 7000,
      );
      expect(excepcion.zona in ZONA_A_VALOR).toBe(true);
      expect(excepcion.valor).toBe(ZONA_A_VALOR[excepcion.zona]);
    }
  });
});
