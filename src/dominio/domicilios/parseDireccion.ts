export type AnalisisDireccion = {
  textoOriginal: string;
  textoLimpio: string;
  textoNormalizado: string;
  direccionInterpretada: string;
  puntajeConfianza: number;
  nivelConfianza: "alta" | "media" | "baja";
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
    .replace(/\b(cr|cra|crr|kr|kra|krr|carrera)(?=\d)/g, "carrera ")
    .replace(/\b(cl|cll|calle)(?=\d)/g, "calle ")
    .replace(/\b(cr|cra|crr|kr|kra|krr|carrera)\b/g, "carrera")
    .replace(/\b(cl|cll|calle)\b/g, "calle");
}

function normalizarSeparadores(texto: string): string {
  return texto
    .replace(/\//g, " # ")
    .replace(/(\d{1,3}[a-z]?)\s+(nro|numero|num|no)\s+/g, "$1 # ")
    .replace(/(\d{1,3})\s+([a-z])\b/g, "$1$2")
    .replace(/\s*#\s*/g, " # ")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function capitalizarDireccion(texto: string): string {
  return texto
    .split(" ")
    .map((parte) => {
      if (parte === "#") return parte;
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

function construirDireccionCon(
  tipoVia: "carrera" | "calle",
  viaPrincipal: string,
  cruce: string,
): string {
  return `${tipoVia} ${viaPrincipal} con ${cruce}`;
}

function calcularNivelConfianza(
  puntajeConfianza: number,
): "alta" | "media" | "baja" {
  if (puntajeConfianza >= 85) return "alta";
  if (puntajeConfianza >= 60) return "media";
  return "baja";
}

function interpretarDireccion(textoNormalizado: string): {
  direccionInterpretada: string;
  puntajeConfianza: number;
  tipoVia: "carrera" | "calle" | null;
  calle: number | null;
  carrera: number | null;
  requiereConfirmacion: boolean;
  motivoConfirmacion: string;
} {
  if (!textoNormalizado) {
    return {
      direccionInterpretada: "",
      puntajeConfianza: 0,
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
      puntajeConfianza: 98,
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
      puntajeConfianza: 96,
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

  const patronConNumeralSinGuion = textoNormalizado.match(
    /\b(carrera|calle)\s+(\d{1,3}[a-z]?)\s+#\s+(\d{1,3}[a-z]?)\s+(\d{1,3}[a-z]?)\b/,
  );

  if (patronConNumeralSinGuion) {
    const tipoVia = patronConNumeralSinGuion[1] as "carrera" | "calle";
    const viaPrincipal = patronConNumeralSinGuion[2];
    const viaSecundaria = patronConNumeralSinGuion[3];
    const placa = patronConNumeralSinGuion[4];

    const direccionInterpretada = construirDireccionNormalizada(
      tipoVia,
      viaPrincipal,
      viaSecundaria,
      placa,
    );

    return {
      direccionInterpretada,
      puntajeConfianza: 92,
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

  const patronSinSeparadores = textoNormalizado.match(
    /\b(carrera|calle)\s+(\d{1,3}[a-z]?)\s+(\d{1,3}[a-z]?)\s+(\d{1,3}[a-z]?)\b/,
  );

  if (patronSinSeparadores) {
    const tipoVia = patronSinSeparadores[1] as "carrera" | "calle";
    const viaPrincipal = patronSinSeparadores[2];
    const viaSecundaria = patronSinSeparadores[3];
    const placa = patronSinSeparadores[4];

    const direccionInterpretada = construirDireccionNormalizada(
      tipoVia,
      viaPrincipal,
      viaSecundaria,
      placa,
    );

    return {
      direccionInterpretada,
      puntajeConfianza: 90,
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

  const patronPlacaCompacta = textoNormalizado.match(
    /\b(carrera|calle)\s+(\d{1,3}[a-z]?)\s+#?\s*(\d{1,3}[a-z]?)(\d{1,3}[a-z]?)\b/,
  );

  if (patronPlacaCompacta) {
    const tipoVia = patronPlacaCompacta[1] as "carrera" | "calle";
    const viaPrincipal = patronPlacaCompacta[2];
    const viaSecundaria = patronPlacaCompacta[3];
    const placa = patronPlacaCompacta[4];

    const direccionInterpretada = construirDireccionNormalizada(
      tipoVia,
      viaPrincipal,
      viaSecundaria,
      placa,
    );

    return {
      direccionInterpretada,
      puntajeConfianza: 88,
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

  const patronViaCon = textoNormalizado.match(
    /\b(carrera|calle)\s+(\d{1,3}[a-z]?)\s+con\s+(\d{1,3}[a-z]?)\b/,
  );

  if (patronViaCon) {
    const tipoVia = patronViaCon[1] as "carrera" | "calle";
    const viaPrincipal = patronViaCon[2];
    const cruce = patronViaCon[3];

    return {
      direccionInterpretada: construirDireccionCon(
        tipoVia,
        viaPrincipal,
        cruce,
      ),
      puntajeConfianza: 82,
      tipoVia,
      calle:
        tipoVia === "calle"
          ? extraerNumeroBase(viaPrincipal)
          : extraerNumeroBase(cruce),
      carrera:
        tipoVia === "carrera"
          ? extraerNumeroBase(viaPrincipal)
          : extraerNumeroBase(cruce),
      requiereConfirmacion: false,
      motivoConfirmacion: "",
    };
  }

  const patronSoloCon = textoNormalizado.match(
    /\b(\d{1,3}[a-z]?)\s+con\s+(\d{1,3}[a-z]?)\b/,
  );

  if (patronSoloCon) {
    const calleValor = patronSoloCon[1];
    const carreraValor = patronSoloCon[2];

    return {
      direccionInterpretada: construirDireccionCon(
        "calle",
        calleValor,
        carreraValor,
      ),
      puntajeConfianza: 72,
      tipoVia: "calle",
      calle: extraerNumeroBase(calleValor),
      carrera: extraerNumeroBase(carreraValor),
      requiereConfirmacion: false,
      motivoConfirmacion: "",
    };
  }

  if (/^\d{1,3}\s+\d{1,3}\s+\d{1,3}$/.test(textoNormalizado)) {
    return {
      direccionInterpretada: textoNormalizado,
      puntajeConfianza: 35,
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
    puntajeConfianza: 20,
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
  const nivelConfianza = calcularNivelConfianza(
    interpretacion.puntajeConfianza,
  );

  return {
    textoOriginal,
    textoLimpio,
    textoNormalizado,
    direccionInterpretada: interpretacion.direccionInterpretada,
    puntajeConfianza: interpretacion.puntajeConfianza,
    nivelConfianza,
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
