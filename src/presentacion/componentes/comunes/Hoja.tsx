import type { ReactNode } from "react";

type Props = {
  abierta: boolean;
  onCerrar: () => void;
  etiqueta: string;
  children: ReactNode;
};

// Hoja inferior (modal centrado en pantallas anchas). Queda montada y solo
// cambia de clase, así la entrada y la salida animan igual y se pueden interrumpir.
export function Hoja({ abierta, onCerrar, etiqueta, children }: Props) {
  return (
    <>
      <div
        className={`velo${abierta ? " on" : ""}`}
        onClick={onCerrar}
        aria-hidden="true"
      />
      <section
        className={`hoja${abierta ? " on" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={etiqueta}
        inert={!abierta}
      >
        {children}
      </section>
    </>
  );
}
