"use client";

import { useState } from "react";
import { Clock3 } from "lucide-react";
import type { ResumenHorariosVisible } from "@/dominio/horarios/obtenerEstadoNegocio";

type PanelHorariosProps = {
  resumenHorarios: ResumenHorariosVisible;
  label?: string;
  compact?: boolean;
};

export function PanelHorarios({
  resumenHorarios,
  label = "Ver horarios",
  compact = false,
}: PanelHorariosProps) {
  const [abierto, setAbierto] = useState(false);
  const [hoverCompacto, setHoverCompacto] = useState(false);

  return (
    <div
      style={{
        width: compact ? "auto" : "100%",
        maxWidth: compact ? "fit-content" : "420px",
      }}
    >
      <button
        type="button"
        onClick={() => setAbierto((prev) => !prev)}
        onMouseEnter={() => compact && setHoverCompacto(true)}
        onMouseLeave={() => compact && setHoverCompacto(false)}
        aria-expanded={abierto}
        style={{
          width: compact ? "auto" : "100%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: compact ? "flex-start" : "center",
          gap: compact ? "6px" : "8px",
          border: compact ? "none" : "1px solid #e5e7eb",
          borderRadius: compact ? "999px" : "10px",
          background: compact ? "transparent" : "#f8fafc",
          color: compact ? (hoverCompacto ? "#334155" : "#475569") : "#334155",
          fontSize: compact ? "12px" : "12px",
          fontWeight: compact ? 500 : 700,
          padding: compact ? "2px 0" : "10px 12px",
          cursor: "pointer",
          minHeight: compact ? "24px" : "44px",
          textDecoration: "none",
          opacity: compact ? (hoverCompacto ? 1 : 0.94) : 1,
          transition: "color 180ms ease, opacity 180ms ease",
        }}
      >
        <Clock3
          size={compact ? 13 : 14}
          aria-hidden="true"
          style={{
            transition: "transform 180ms ease, color 180ms ease",
            transform: compact && hoverCompacto ? "rotate(-10deg)" : "none",
            color: compact && hoverCompacto ? "#334155" : undefined,
          }}
        />
        {label}
      </button>

      {abierto && (
        <div
          style={{
            marginTop: "8px",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            background: "#ffffff",
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
          }}
        >
          {resumenHorarios.lineas.map((linea) => (
            <p
              key={linea}
              style={{
                margin: 0,
                fontSize: "12px",
                color: "#374151",
                lineHeight: 1.35,
                textAlign: "left",
              }}
            >
              {linea}
            </p>
          ))}

          <p
            style={{
              margin: "2px 0 0",
              fontSize: "12px",
              color: "#0f766e",
              fontWeight: 700,
              lineHeight: 1.35,
              textAlign: "left",
            }}
          >
            {resumenHorarios.domicilios}
          </p>
        </div>
      )}
    </div>
  );
}
