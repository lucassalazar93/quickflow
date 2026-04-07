const SEGUNDOS_SESION = 60 * 60 * 12;

function aHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function firmar(texto: string, secreto: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secreto),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const firma = await crypto.subtle.sign("HMAC", key, encoder.encode(texto));
  return aHex(firma);
}

function sonIguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let diferencia = 0;
  for (let i = 0; i < a.length; i += 1) {
    diferencia |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return diferencia === 0;
}

export async function crearTokenAccesoApp(
  secreto: string,
  version = "1",
): Promise<string> {
  const expiraEn = Math.floor(Date.now() / 1000) + SEGUNDOS_SESION;
  const payload = `${expiraEn}:${version}`;
  const firma = await firmar(payload, secreto);

  return `${payload}.${firma}`;
}

export async function verificarTokenAccesoApp(
  token: string,
  secreto: string,
  version = "1",
): Promise<boolean> {
  const [payload, firmaRecibida] = token.split(".");

  if (!payload || !firmaRecibida || !secreto) {
    return false;
  }

  const [expiraEnTexto, versionToken] = payload.split(":");

  if (!expiraEnTexto || !versionToken || versionToken !== version) {
    return false;
  }

  const expiraEn = Number(expiraEnTexto);
  if (!Number.isFinite(expiraEn)) {
    return false;
  }

  const ahora = Math.floor(Date.now() / 1000);
  if (ahora > expiraEn) {
    return false;
  }

  const firmaEsperada = await firmar(payload, secreto);
  return sonIguales(firmaRecibida, firmaEsperada);
}
