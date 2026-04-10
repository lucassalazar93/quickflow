"use client";

import { ShoppingCart } from "lucide-react";
import { track } from "@vercel/analytics";
import { useCarritoStore } from "@/store/carrito.store";
import styles from "./CarritoFlotante.module.css";

interface Props {
  onClick: () => void;
}

export function CarritoFlotante({ onClick }: Props) {
  const items = useCarritoStore((s) => s.items);

  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0);
  const totalProductos = items.reduce((acc, i) => acc + i.total, 0);

  if (items.length === 0) return null;

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
      className={styles.boton}
      onClick={handleClick}
      aria-label="Ver carrito"
      type="button"
    >
      <span className={styles.icono} aria-hidden="true">
        <ShoppingCart size={24} />
      </span>
      <span className={styles.cantidad}>{totalItems}</span>
    </button>
  );
}
