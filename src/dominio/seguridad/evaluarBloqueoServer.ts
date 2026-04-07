import { cookies } from "next/headers";
import { verificarTokenAccesoApp } from "@/dominio/seguridad/accesoAppToken";

function parseBooleanEnv(valor: string | undefined): boolean {
  return (valor ?? "").trim().toLowerCase() === "true";
}

export async function debeBloquearAcceso(): Promise<boolean> {
  const appBloqueada =
    parseBooleanEnv(process.env.APP_BLOQUEADA) ||
    parseBooleanEnv(process.env.NEXT_PUBLIC_APP_BLOQUEADA);

  if (!appBloqueada) {
    return false;
  }

  const secreto = process.env.CLAVE_ACCESO_APP ?? "";
  const versionBloqueo = process.env.APP_BLOQUEO_VERSION ?? "1";
  const token = (await cookies()).get("acceso_app")?.value;

  if (!token || !secreto) {
    return true;
  }

  const accesoPermitido = await verificarTokenAccesoApp(
    token,
    secreto,
    versionBloqueo,
  );

  return !accesoPermitido;
}
