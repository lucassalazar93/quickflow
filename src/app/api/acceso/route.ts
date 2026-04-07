import { NextRequest, NextResponse } from "next/server";
import { crearTokenAccesoApp } from "@/dominio/seguridad/accesoAppToken";

export async function POST(request: NextRequest) {
  const { clave } = await request.json();
  const claveCorrecta = process.env.CLAVE_ACCESO_APP;
  const esProduccion = process.env.NODE_ENV === "production";
  const versionBloqueo = process.env.APP_BLOQUEO_VERSION ?? "1";

  if (!claveCorrecta) {
    return NextResponse.json(
      { ok: false, mensaje: "CLAVE_ACCESO_APP no configurada" },
      { status: 500 },
    );
  }

  if (!clave || clave !== claveCorrecta) {
    return NextResponse.json(
      { ok: false, mensaje: "Clave incorrecta" },
      { status: 401 },
    );
  }

  const token = await crearTokenAccesoApp(claveCorrecta, versionBloqueo);
  const response = NextResponse.json({ ok: true });

  response.cookies.set("acceso_app", token, {
    httpOnly: true,
    secure: esProduccion,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
