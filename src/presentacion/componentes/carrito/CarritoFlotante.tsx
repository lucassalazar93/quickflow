"use client";

import { ShoppingCart } from "lucide-react";
import { useCarritoStore } from "@/store/carrito.store";
import styles from "./CarritoFlotante.module.css";

interface Props {
  onClick: () => void;
}

export function CarritoFlotante({ onClick }: Props) {
  const items = useCarritoStore((s) => s.items);

  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0);

  if (items.length === 0) return null;

  return (
    <button
      className={styles.boton}
      onClick={onClick}
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
