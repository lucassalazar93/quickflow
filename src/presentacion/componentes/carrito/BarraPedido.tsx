"use client";

import { ArrowRight, ShoppingBag } from "lucide-react";
import { track } from "@vercel/analytics";
import { useCarritoStore } from "@/store/carrito.store";
import { pesos } from "@/presentacion/utilidades/formato";

interface Props {
  onClick: () => void;
}

// Barra fija al alcance del pulgar: cuántas unidades van y cuánto suman
export function BarraPedido({ onClick }: Props) {
  const items = useCarritoStore((s) => s.items);

  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0);
  const totalProductos = items.reduce((acc, i) => acc + i.total, 0);

  const handleClick = () => {
    track("click_carrito_flotante", {
      origen: "floating_button",
      cantidad_items: totalItems,
      total: totalProductos,
    });

    onClick();
  };

  return (
    <button
      type="button"
      className={`bar${totalItems > 0 ? " on" : ""}`}
      onClick={handleClick}
      aria-label={`Ver pedido: ${totalItems} ${totalItems === 1 ? "unidad" : "unidades"}, ${pesos(totalProductos)}`}
      inert={totalItems === 0}
    >
      <span className="bolsa">
        <ShoppingBag size={26} aria-hidden="true" />
        {/* La clave cambia con la cantidad para que el número rebote al sumar */}
        <span key={totalItems} className="cnt num bump">
          {totalItems}
        </span>
      </span>
      <span>Ver pedido</span>
      <span className="tot num">{pesos(totalProductos)}</span>
      <ArrowRight size={20} aria-hidden="true" />
    </button>
  );
}
