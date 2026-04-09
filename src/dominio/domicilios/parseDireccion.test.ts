import { describe, expect, it } from "vitest";
import {
  extraerCalle,
  extraerCarrera,
  procesarDireccionUsuario,
} from "./parseDireccion";

describe("parseDireccion - cobertura extendida", () => {
  it("interpreta formato estándar con abreviaciones", () => {
    const analisis = procesarDireccionUsuario("cra 36a 80-58");

    expect(analisis.direccionInterpretada).toBe("carrera 36a # 80-58");
    expect(analisis.calle).toBe(80);
    expect(analisis.carrera).toBe(36);
    expect(analisis.requiereConfirmacion).toBe(false);
    expect(analisis.nivelConfianza).toBe("alta");
    expect(analisis.puntajeConfianza).toBeGreaterThanOrEqual(95);
  });

  it("interpreta vía abreviada pegada al número (cl80)", () => {
    const analisis = procesarDireccionUsuario("cl80 48a 85");

    expect(analisis.direccionInterpretada).toBe("calle 80 # 48a-85");
    expect(analisis.calle).toBe(80);
    expect(analisis.carrera).toBe(48);
    expect(analisis.requiereConfirmacion).toBe(false);
  });

  it("interpreta vía completa pegada al número (calle80)", () => {
    const analisis = procesarDireccionUsuario("calle80 48a 85");

    expect(analisis.direccionInterpretada).toBe("calle 80 # 48a-85");
    expect(analisis.requiereConfirmacion).toBe(false);
  });

  it("interpreta separador / como numeral", () => {
    const analisis = procesarDireccionUsuario("crr 36a/105-58");

    expect(analisis.direccionInterpretada).toBe("carrera 36a # 105-58");
    expect(analisis.calle).toBe(105);
    expect(analisis.carrera).toBe(36);
  });

  it("interpreta placa compacta sin guion (48a85)", () => {
    const analisis = procesarDireccionUsuario("calle 80 48a85");

    expect(analisis.direccionInterpretada).toBe("calle 80 # 48a-85");
    expect(analisis.esValidaParaCalculo).toBe(true);
  });

  it("interpreta formato con '#', pero sin guion entre vía y placa", () => {
    const analisis = procesarDireccionUsuario("calle 80 # 48a 85");

    expect(analisis.direccionInterpretada).toBe("calle 80 # 48a-85");
    expect(analisis.esValidaParaCalculo).toBe(true);
  });

  it("interpreta separador 'No' como numeral", () => {
    const analisis = procesarDireccionUsuario("calle 80 No 48a 85");

    expect(analisis.direccionInterpretada).toBe("calle 80 # 48a-85");
    expect(analisis.requiereConfirmacion).toBe(false);
  });

  it("interpreta separador 'nro' como numeral", () => {
    const analisis = procesarDireccionUsuario("carrera 36a nro 105 58");

    expect(analisis.direccionInterpretada).toBe("carrera 36a # 105-58");
    expect(analisis.calle).toBe(105);
    expect(analisis.carrera).toBe(36);
  });

  it("une letra separada por espacio en el número (48 a)", () => {
    const analisis = procesarDireccionUsuario("calle 80 48 a 85");

    expect(analisis.direccionInterpretada).toBe("calle 80 # 48a-85");
    expect(analisis.requiereConfirmacion).toBe(false);
  });

  it("normaliza mayúsculas y tildes", () => {
    const analisis = procesarDireccionUsuario("CÁLLE 80 # 48A - 85");

    expect(analisis.direccionInterpretada).toBe("calle 80 # 48a-85");
    expect(analisis.requiereConfirmacion).toBe(false);
  });

  it("marca confirmación cuando usa 'con'", () => {
    const analisis = procesarDireccionUsuario("calle 80 con 48a");

    expect(analisis.requiereConfirmacion).toBe(true);
    expect(analisis.motivoConfirmacion).toContain("usa 'con'");
    expect(analisis.nivelConfianza).toBe("baja");
  });

  it("marca confirmación cuando faltan vía y tipo", () => {
    const analisis = procesarDireccionUsuario("80 48 85");

    expect(analisis.requiereConfirmacion).toBe(true);
    expect(analisis.motivoConfirmacion).toContain("Falta indicar si es calle");
  });

  it("extraerCalle y extraerCarrera funcionan con dirección válida", () => {
    const direccion = "calle 80 48a 85";

    expect(extraerCalle(direccion)).toBe(80);
    expect(extraerCarrera(direccion)).toBe(48);
  });

  it("mantiene no válida una entrada sin estructura de dirección", () => {
    const analisis = procesarDireccionUsuario(
      "al frente de la tienda de la esquina",
    );

    expect(analisis.esValidaParaCalculo).toBe(false);
    expect(analisis.requiereConfirmacion).toBe(true);
    expect(analisis.nivelConfianza).toBe("baja");
    expect(analisis.puntajeConfianza).toBeLessThan(60);
  });
});
