// Datos del último pedido, guardados solo en el dispositivo del cliente,
// para que la próxima vez no tenga que escribirlos de nuevo.

export type ClienteRecordado = {
  nombre: string;
  telefono: string;
  direccion: string;
  indicaciones: string;
  tipoEntrega: "domicilio" | "recoger";
  metodoPago: "efectivo" | "transferencia" | "mixto";
  salsas: string[];
};

const CLAVE = "quickflow_cliente";

const VACIO: ClienteRecordado = {
  nombre: "",
  telefono: "",
  direccion: "",
  indicaciones: "",
  tipoEntrega: "domicilio",
  metodoPago: "efectivo",
  salsas: [],
};

export function leerCliente(): ClienteRecordado {
  try {
    const guardado = window.localStorage.getItem(CLAVE);

    return guardado ? { ...VACIO, ...JSON.parse(guardado) } : { ...VACIO };
  } catch {
    return { ...VACIO };
  }
}

export function guardarCliente(cambios: Partial<ClienteRecordado>): void {
  try {
    window.localStorage.setItem(
      CLAVE,
      JSON.stringify({ ...leerCliente(), ...cambios }),
    );
  } catch {
    // Modo privado o almacenamiento lleno: el pedido sigue funcionando sin recordar
  }
}

export function olvidarCliente(): void {
  try {
    window.localStorage.removeItem(CLAVE);
  } catch {
    // Nada que borrar
  }
}

export function tieneDatosCliente(cliente: ClienteRecordado): boolean {
  return Boolean(cliente.nombre || cliente.telefono || cliente.direccion);
}
