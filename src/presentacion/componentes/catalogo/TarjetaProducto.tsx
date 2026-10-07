import { Plus } from "lucide-react";
import type { Producto } from "@/types/producto";
import { Foto } from "@/presentacion/componentes/comunes/Foto";
import { nombreVisible, pesos } from "@/presentacion/utilidades/formato";

type Props = {
  producto: Producto;
  // Unidades de este producto que ya están en el pedido
  enPedido: number;
  esBebida: boolean;
  onElegir: (producto: Producto) => void;
};

export function TarjetaProducto({
  producto,
  enPedido,
  esBebida,
  onElegir,
}: Props) {
  const nombre = nombreVisible(producto.nombre);

  return (
    <button
      type="button"
      className={`card${enPedido > 0 ? " tiene" : ""}`}
      onClick={() => onElegir(producto)}
      aria-label={`${nombre}, ${pesos(producto.precio)}`}
    >
      <span className="info">
        <h3>{nombre}</h3>
        {!esBebida && producto.descripcion && <p>{producto.descripcion}</p>}
        <span className="precio num">{pesos(producto.precio)}</span>
      </span>

      <Foto src={producto.imagen} completa={esBebida} />

      {/* La clave cambia con la cantidad para que el número rebote al sumar */}
      <span
        key={enPedido}
        className={`mas num${enPedido > 0 ? " tiene bump" : ""}`}
        aria-hidden="true"
      >
        {enPedido > 0 ? enPedido : <Plus size={20} />}
      </span>
    </button>
  );
}

type PropsMosaico = {
  producto: Producto;
  esBebida: boolean;
  // Número o marca que reemplaza al "+" cuando ya está elegido
  marca?: React.ReactNode;
  onElegir: (producto: Producto) => void;
};

// Sugerencia compacta: foto, precio y un solo gesto
export function MosaicoProducto({
  producto,
  esBebida,
  marca,
  onElegir,
}: PropsMosaico) {
  const nombre = nombreVisible(producto.nombre);

  return (
    <button
      type="button"
      className={`tile${marca ? " on" : ""}`}
      onClick={() => onElegir(producto)}
      aria-label={`Agregar ${nombre}, ${pesos(producto.precio)}`}
    >
      <Foto src={producto.imagen} completa={esBebida} prioritaria />
      <span className="mk num" aria-hidden="true">
        {marca || <Plus size={18} />}
      </span>
      <b className="num">{pesos(producto.precio)}</b>
      <small>{nombre}</small>
    </button>
  );
}
