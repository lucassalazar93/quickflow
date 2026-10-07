import { ArrowUpRight, Zap } from "lucide-react";

const PORTAFOLIO = "https://lucas-salazar-portfolio.vercel.app/";

// Firma de la app. Va fuera del camino de compra: inicio, pie del menú y pedido listo.
export function FirmaQuickFlow() {
  return (
    <a
      className="qf-firma"
      href={PORTAFOLIO}
      target="_blank"
      rel="noopener"
      aria-label="QuickFlow, desarrollado por Lucas Salazar. Abre su portafolio en otra pestaña"
    >
      <b>
        <Zap size={14} aria-hidden="true" /> QuickFlow
      </b>
      <span>
        · Desarrollado por <u>Lucas Salazar</u>
      </span>
      <ArrowUpRight size={14} aria-hidden="true" />
    </a>
  );
}

export function PieQuickFlow() {
  return (
    <footer className="pie-app">
      <strong>
        <Zap size={18} aria-hidden="true" /> QuickFlow
      </strong>
      <p>Experiencias rápidas y conversión.</p>
      <a
        className="qf-firma"
        href={PORTAFOLIO}
        target="_blank"
        rel="noopener"
        aria-label="Desarrollado por Lucas Salazar. Abre su portafolio en otra pestaña"
      >
        <span>
          Desarrollado por <u>Lucas Salazar</u>
        </span>
        <ArrowUpRight size={14} aria-hidden="true" />
      </a>
    </footer>
  );
}
