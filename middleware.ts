import { NextRequest, NextResponse } from "next/server";
import { verificarTokenAccesoApp } from "@/dominio/seguridad/accesoAppToken";

function parseBooleanEnv(valor: string | undefined): boolean {
  return (valor ?? "").trim().toLowerCase() === "true";
}

export async function middleware(request: NextRequest) {
  const appBloqueada =
    parseBooleanEnv(process.env.APP_BLOQUEADA) ||
    parseBooleanEnv(process.env.NEXT_PUBLIC_APP_BLOQUEADA);
  const secreto = process.env.CLAVE_ACCESO_APP ?? "";
  const versionBloqueo = process.env.APP_BLOQUEO_VERSION ?? "1";
  const token = request.cookies.get("acceso_app")?.value;
  const accesoPermitido = token
    ? await verificarTokenAccesoApp(token, secreto, versionBloqueo)
    : false;
  const { pathname } = request.nextUrl;

  const rutasPermitidas =
    pathname === "/bloqueado" ||
    pathname.startsWith("/api/acceso") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".");

  if (!appBloqueada) {
    if (pathname === "/bloqueado") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  if (pathname === "/bloqueado" && accesoPermitido) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (rutasPermitidas || accesoPermitido) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/bloqueado";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
