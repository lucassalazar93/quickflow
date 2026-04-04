import { Plus } from "lucide-react";
import { BotonAnimado } from "@/presentacion/componentes/comunes/BotonAnimado";

type Props = {
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  onAbrir?: () => void;
  onAgregar?: () => void;
};

export function TarjetaProducto({
  nombre,
  descripcion,
  precio,
  imagen,
  onAbrir,
  onAgregar,
}: Props) {
  const handleClick = () => {
    onAbrir?.();
  };

  return (
    <article
      style={{
        display: "grid",
        gridTemplateColumns: "96px 1fr auto",
        gap: "16px",
        alignItems: "center",
        background: "var(--color-superficie)",
        border: "1px solid var(--color-borde)",
        borderRadius: "24px",
        padding: "16px",
        boxShadow: "var(--sombra-suave)",
      }}
    >
      <div
        onClick={handleClick}
        style={{
          width: "96px",
          height: "96px",
          borderRadius: "18px",
          overflow: "hidden",
          background: "#eef1f4",
          flexShrink: 0,
          cursor: onAbrir ? "pointer" : "default",
          transition: onAbrir ? "transform 0.2s ease" : "none",
        }}
        onMouseEnter={(e) => {
          if (onAbrir) {
            (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
          }
        }}
        onMouseLeave={(e) => {
          if (onAbrir) {
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          }
        }}
      >
        <img
          src={imagen}
          alt={nombre}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center",
          }}
        />
      </div>

      <div
        onClick={handleClick}
        style={{
          minWidth: 0,
          cursor: onAbrir ? "pointer" : "default",
          transition: onAbrir ? "opacity 0.2s ease" : "none",
        }}
        onMouseEnter={(e) => {
          if (onAbrir) {
            (e.currentTarget as HTMLElement).style.opacity = "0.85";
          }
        }}
        onMouseLeave={(e) => {
          if (onAbrir) {
            (e.currentTarget as HTMLElement).style.opacity = "1";
          }
        }}
      >
        <h3
          style={{
            marginBottom: "6px",
            fontSize: "18px",
            fontWeight: 800,
            lineHeight: 1.1,
          }}
        >
          {nombre}
        </h3>

        <p
          style={{
            color: "var(--color-texto-secundario)",
            fontSize: "14px",
            lineHeight: 1.45,
            marginBottom: "12px",
          }}
        >
          {descripcion}
        </p>

        <p
          style={{
            color: "var(--color-primario)",
            fontSize: "18px",
            fontWeight: 800,
          }}
        >
          ${precio.toLocaleString("es-CO")}
        </p>
      </div>

      <BotonAnimado
        type="button"
        onClick={onAgregar}
        style={{
          width: "52px",
          height: "52px",
          minWidth: "52px",
          borderRadius: "18px",
          background: "var(--color-primario)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          lineHeight: 1,
          boxShadow: "var(--sombra-media)",
          cursor: "pointer",
        }}
      >
        <Plus size={22} aria-hidden="true" />
      </BotonAnimado>
    </article>
  );
}
