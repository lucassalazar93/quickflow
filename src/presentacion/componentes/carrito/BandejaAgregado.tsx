import { Check, CupSoda, X } from "lucide-react";
import type { Producto } from "@/types/producto";
import { Foto } from "@/presentacion/componentes/comunes/Foto";
import { MosaicoProducto } from "@/presentacion/componentes/catalogo/TarjetaProducto";
import { nombreVisible } from "@/presentacion/utilidades/formato";

export type AvisoAgregado = {
  nombre: string;
  imagen: string;
  esBebida: boolean;
  // Con bebidas se convierte en sugerencia; sin ellas solo confirma
  sugerirBebidas: boolean;
};

type Props = {
  aviso: AvisoAgregado | null;
  visible: boolean;
  bebidas: Producto[];
  caraAnfitriona?: string;
  onAgregarBebida: (producto: Producto) => void;
  onCerrar: () => void;
};

// Confirma lo agregado justo encima de la barra de pedido y ofrece una bebida con foto
export function BandejaAgregado({
  aviso,
  visible,
  bebidas,
  caraAnfitriona,
  onAgregarBebida,
  onCerrar,
}: Props) {
  return (
    <div
      className={`tray${visible ? " on" : ""}`}
      role="status"
      aria-live="polite"
      inert={!visible}
    >
      {aviso && (
        <>
          <div className="okr">
            <span className="mini">
              <Foto src={aviso.imagen} completa={aviso.esBebida} prioritaria />
              <span className="chk">
                <Check size={14} aria-hidden="true" />
              </span>
            </span>
            <span className="t">
              <b>Agregado</b>
              <small>{nombreVisible(aviso.nombre)}</small>
            </span>
            <button
              type="button"
              className="xx"
              onClick={onCerrar}
              aria-label="Cerrar aviso"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {aviso.sugerirBebidas && bebidas.length > 0 && (
            <div className="sug">
              <h4>
                {caraAnfitriona ? (
                  <img
                    className="av c30"
                    src={caraAnfitriona}
                    alt=""
                    width={192}
                    height={192}
                  />
                ) : (
                  <CupSoda size={18} aria-hidden="true" />
                )}
                ¿Y para tomar?
              </h4>
              <div className="tiles">
                {bebidas.map((bebida) => (
                  <MosaicoProducto
                    key={bebida.id}
                    producto={bebida}
                    esBebida
                    onElegir={onAgregarBebida}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
