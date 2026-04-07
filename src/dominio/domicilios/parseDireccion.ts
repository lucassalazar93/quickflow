export type AnalisisDireccion = {
  textoOriginal: string;
  textoLimpio: string;
  textoNormalizado: string;
  direccionInterpretada: string;
  tipoVia: "carrera" | "calle" | null;
  sugerencias: string[];
  requiereConfirmacion: boolean;
  motivoConfirmacion: string;
  esValidaParaCalculo: boolean;
  calle: number | null;
  carrera: number | null;
};

function limpiarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unificarAbreviaciones(texto: string): string {
  return texto
    .replace(/\b(cr|cra|crr|kr|kra|krr|carrera)\b/g, "carrera")
    .replace(/\b(cl|cll|calle)\b/g, "calle");
}

function normalizarSeparadores(texto: string): string {
  return texto
    .replace(/\//g, " # ")
    .replace(/\s*#\s*/g, " # ")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function capitalizarDireccion(texto: string): string {
  return texto
    .split(" ")
    .map((parte) => {
      if (["#"].includes(parte)) return parte;
      if (/^\d+[a-z]?$/.test(parte)) return parte.toUpperCase();
      return parte.charAt(0).toUpperCase() + parte.slice(1);
    })
    .join(" ");
}

function extraerNumeroBase(valor: string): number | null {
  const match = valor.match(/^(\d{1,3})/);
  return match ? Number(match[1]) : null;
}

function construirDireccionNormalizada(
  tipoVia: "carrera" | "calle",
  viaPrincipal: string,
  viaSecundaria: string,
  placa: string,
): string {
  return `${tipoVia} ${viaPrincipal} # ${viaSecundaria}-${placa}`;
}

function interpretarDireccion(textoNormalizado: string): {
  direccionInterpretada: string;
  tipoVia: "carrera" | "calle" | null;
  calle: number | null;
  carrera: number | null;
  requiereConfirmacion: boolean;
  motivoConfirmacion: string;
} {
  if (!textoNormalizado) {
    return {
      direccionInterpretada: "",
      tipoVia: null,
      calle: null,
      carrera: null,
      requiereConfirmacion: false,
      motivoConfirmacion: "",
    };
  }

  const patronConNumeral = textoNormalizado.match(
    /\b(carrera|calle)\s+(\d{1,3}[a-z]?)\s+#\s+(\d{1,3}[a-z]?)-(\d{1,3}[a-z]?)\b/,
  );

  if (patronConNumeral) {
    const tipoVia = patronConNumeral[1] as "carrera" | "calle";
    const viaPrincipal = patronConNumeral[2];
    const viaSecundaria = patronConNumeral[3];
    const placa = patronConNumeral[4];

    const direccionInterpretada = construirDireccionNormalizada(
      tipoVia,
      viaPrincipal,
      viaSecundaria,
      placa,
    );

    return {
      direccionInterpretada,
      tipoVia,
      calle:
        tipoVia === "calle"
          ? extraerNumeroBase(viaPrincipal)
          : extraerNumeroBase(viaSecundaria),
      carrera:
        tipoVia === "carrera"
          ? extraerNumeroBase(viaPrincipal)
          : extraerNumeroBase(viaSecundaria),
      requiereConfirmacion: false,
      motivoConfirmacion: "",
    };
  }

  const patronSinNumeral = textoNormalizado.match(
    /\b(carrera|calle)\s+(\d{1,3}[a-z]?)\s+(\d{1,3}[a-z]?)-(\d{1,3}[a-z]?)\b/,
  );

  if (patronSinNumeral) {
    const tipoVia = patronSinNumeral[1] as "carrera" | "calle";
    const viaPrincipal = patronSinNumeral[2];
    const viaSecundaria = patronSinNumeral[3];
    const placa = patronSinNumeral[4];

    const direccionInterpretada = construirDireccionNormalizada(
      tipoVia,
      viaPrincipal,
      viaSecundaria,
      placa,
    );

    return {
      direccionInterpretada,
      tipoVia,
      calle:
        tipoVia === "calle"
          ? extraerNumeroBase(viaPrincipal)
          : extraerNumeroBase(viaSecundaria),
      carrera:
        tipoVia === "carrera"
          ? extraerNumeroBase(viaPrincipal)
          : extraerNumeroBase(viaSecundaria),
      requiereConfirmacion: false,
      motivoConfirmacion: "",
    };
  }

  if (
    /\b(carrera|calle)\s+\d{1,3}[a-z]?\s+con\s+\d{1,3}[a-z]?\b/.test(
      textoNormalizado,
    )
  ) {
    const tipoVia = textoNormalizado.includes("carrera") ? "carrera" : "calle";

    return {
      direccionInterpretada: textoNormalizado,
      tipoVia,
      calle: null,
      carrera: null,
      requiereConfirmacion: true,
      motivoConfirmacion:
        "La dirección usa 'con' y no permite estimar placa exacta para calcular domicilio.",
    };
  }

  if (/^\d{1,3}\s+\d{1,3}\s+\d{1,3}$/.test(textoNormalizado)) {
    return {
      direccionInterpretada: textoNormalizado,
      tipoVia: null,
      calle: null,
      carrera: null,
      requiereConfirmacion: true,
      motivoConfirmacion:
        "Falta indicar si es calle o carrera para interpretar la dirección correctamente.",
    };
  }

  return {
    direccionInterpretada: textoNormalizado,
    tipoVia: null,
    calle: null,
    carrera: null,
    requiereConfirmacion: true,
    motivoConfirmacion:
      "No pudimos interpretar completamente la dirección. Revísala o selecciona una sugerencia.",
  };
}

export function procesarDireccionUsuario(
  textoOriginal: string,
): AnalisisDireccion {
  const textoLimpio = limpiarTexto(textoOriginal);
  const textoConAbreviaciones = unificarAbreviaciones(textoLimpio);
  const textoNormalizado = normalizarSeparadores(textoConAbreviaciones);

  const interpretacion = interpretarDireccion(textoNormalizado);

  const sugerencias = interpretacion.direccionInterpretada
    ? [capitalizarDireccion(interpretacion.direccionInterpretada)]
    : [];

  return {
    textoOriginal,
    textoLimpio,
    textoNormalizado,
    direccionInterpretada: interpretacion.direccionInterpretada,
    tipoVia: interpretacion.tipoVia,
    sugerencias,
    requiereConfirmacion: interpretacion.requiereConfirmacion,
    motivoConfirmacion: interpretacion.motivoConfirmacion,
    esValidaParaCalculo:
      interpretacion.calle !== null && interpretacion.carrera !== null,
    calle: interpretacion.calle,
    carrera: interpretacion.carrera,
  };
}

export function extraerCalle(direccion: string): number | null {
  return procesarDireccionUsuario(direccion).calle;
}

export function extraerCarrera(direccion: string): number | null {
  return procesarDireccionUsuario(direccion).carrera;
}

export function extraerDireccionCompleta(direccion: string): {
  calle: number | null;
  carrera: number | null;
} {
  const analisis = procesarDireccionUsuario(direccion);

  return {
    calle: analisis.calle,
    carrera: analisis.carrera,
  };
}
