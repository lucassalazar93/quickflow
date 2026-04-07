import type {
  ResumenHorariosVisible,
  ResultadoEstadoNegocio,
} from "@/dominio/horarios/obtenerEstadoNegocio";
import { PanelHorarios } from "@/presentacion/componentes/comunes/PanelHorarios";

type Props = {
  nombre: string;
  subtitulo: string;
  logo: string;
  estadoNegocio: ResultadoEstadoNegocio;
  resumenHorarios: ResumenHorariosVisible;
};

export function EncabezadoNegocio({
  nombre,
  subtitulo,
  logo,
  estadoNegocio,
  resumenHorarios,
}: Props) {
  const badgePrincipalLabel =
    estadoNegocio.estado === "cerrado" ? "Cerrado" : "Abierto";

  const badgePrincipalStyles =
    estadoNegocio.estado === "cerrado"
      ? {
          background: "rgba(107, 114, 128, 0.15)",
          border: "1px solid rgba(107, 114, 128, 0.35)",
          color: "#4b5563",
          punto: "#6b7280",
        }
      : {
          background: "rgba(34, 197, 94, 0.12)",
          border: "1px solid rgba(34, 197, 94, 0.35)",
          color: "#16a34a",
          punto: "#22c55e",
        };

  const chipSecundarioLabel =
    estadoNegocio.estado === "domicilios_no_disponibles"
      ? "Domicilios desde las 7:40 PM"
      : estadoNegocio.estado === "domicilios_cerrados"
        ? "Domicilios cerrados por hoy"
        : estadoNegocio.estado === "cerrado"
          ? "Volvemos a las 6:00 PM"
          : null;

  return (
    <header
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "14px",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          width: "72px",
          height: "72px",
          minWidth: "72px",
          borderRadius: "999px",
          background: "var(--color-superficie)",
          border: "8px solid var(--color-primario)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--sombra-media)",
        }}
      >
        <img
          src={logo}
          alt={nombre}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <h1
          style={{
            fontSize: "clamp(26px, 6vw, 38px)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            marginBottom: "6px",
          }}
        >
          {nombre}
        </h1>

        <p
          style={{
            color: "var(--color-texto-secundario)",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {subtitulo}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "6px",
            marginTop: "12px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              borderRadius: "999px",
              background: badgePrincipalStyles.background,
              border: badgePrincipalStyles.border,
              color: badgePrincipalStyles.color,
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
            aria-label={badgePrincipalLabel}
            title={badgePrincipalLabel}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "999px",
                background: badgePrincipalStyles.punto,
                boxShadow:
                  estadoNegocio.estado === "cerrado"
                    ? "none"
                    : "0 0 10px rgba(34, 197, 94, 0.7)",
                animation:
                  estadoNegocio.estado === "cerrado"
                    ? "none"
                    : "pulso 1.4s ease-in-out infinite",
              }}
            />
            {badgePrincipalLabel}
          </div>

          {chipSecundarioLabel && (
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--color-texto-secundario)",
                letterSpacing: "0.01em",
                lineHeight: 1.3,
              }}
            >
              {chipSecundarioLabel}
            </p>
          )}

          <PanelHorarios
            resumenHorarios={resumenHorarios}
            label="Ver horarios"
            compact
          />
        </div>
      </div>
      <style jsx>{`
        @keyframes pulso {
          0%,
          100% {
            transform: scale(0.9);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </header>
  );
}
