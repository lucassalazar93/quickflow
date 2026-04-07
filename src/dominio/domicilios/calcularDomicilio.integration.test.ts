import { describe, expect, it } from "vitest";
import { procesarDireccionUsuario } from "./parseDireccion";
import { calcularDomicilio } from "./calcularDomicilio";

describe("integración parseDireccion + calcularDomicilio", () => {
  it("prioriza dirección interpretada sobre coordenadas cuando ambas existen", () => {
    const entrada = "cra 36a 80-58";
    const analisis = procesarDireccionUsuario(entrada);
    const resultado = calcularDomicilio({
      direccion: analisis.direccionInterpretada,
      latitud: 6.35,
      longitud: -75.45,
    });

    expect(analisis.direccionInterpretada).toBe("carrera 36a # 80-58");
    expect(resultado.zona).toBe("Zona 1");
    expect(resultado.valor).toBe(3000);
    expect(resultado.requiereConfirmacion).toBe(false);
  });

  it("usa la dirección interpretada como fuente oficial en cálculo", () => {
    const entrada = "kr 36a 105-58";
    const analisis = procesarDireccionUsuario(entrada);
    const resultado = calcularDomicilio({
      direccion: analisis.direccionInterpretada,
    });

    expect(analisis.direccionInterpretada).toBe("carrera 36a # 105-58");
    expect(analisis.calle).toBe(105);
    expect(analisis.carrera).toBe(36);
    expect(resultado.zona).toBe("Fuera de zona");
    expect(resultado.requiereConfirmacion).toBe(true);
  });

  it("tolera abreviaciones y separadores, luego calcula zona desde dirección final", () => {
    const entrada = "cll 81/76-25";
    const analisis = procesarDireccionUsuario(entrada);
    const resultado = calcularDomicilio({
      direccion: analisis.direccionInterpretada,
    });

    expect(analisis.textoNormalizado).toBe("calle 81 # 76-25");
    expect(analisis.direccionInterpretada).toBe("calle 81 # 76-25");
    expect(analisis.calle).toBe(81);
    expect(analisis.carrera).toBe(76);
    expect(resultado.zona).toBe("Fuera de zona");
    expect(resultado.requiereConfirmacion).toBe(true);
  });

  it("detecta zona cuando la dirección final cae en reglas configuradas", () => {
    const entrada = "cra 36a 80-58";
    const analisis = procesarDireccionUsuario(entrada);
    const resultado = calcularDomicilio({
      direccion: analisis.direccionInterpretada,
    });

    expect(analisis.direccionInterpretada).toBe("carrera 36a # 80-58");
    expect(analisis.calle).toBe(80);
    expect(analisis.carrera).toBe(36);
    expect(resultado.zona).toBe("Zona 1");
    expect(resultado.requiereConfirmacion).toBe(false);
    expect(resultado.valor).toBe(3000);
  });

  it("usa coordenadas solo cuando se habilita explícitamente como fallback", () => {
    const resultado = calcularDomicilio({
      latitud: 6.2732,
      longitud: -75.5516,
      usarCoordenadasFallback: true,
    });

    expect(resultado.zona).toBe("Zona 1");
    expect(resultado.valor).toBe(3000);
    expect(resultado.requiereConfirmacion).toBe(false);
  });
});
