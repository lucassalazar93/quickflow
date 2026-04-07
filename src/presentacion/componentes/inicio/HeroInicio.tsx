"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  obtenerEstadoNegocio,
  obtenerResumenHorariosVisible,
} from "@/dominio/horarios/obtenerEstadoNegocio";
import { PanelHorarios } from "@/presentacion/componentes/comunes/PanelHorarios";
import type { Negocio } from "@/types/negocio";

const estiloBotonPrimario = {
  display: "inline-block",
  background: "#E1251B",
  color: "#fff",
  padding: "16px 24px",
  borderRadius: "14px",
  fontWeight: 800,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  transition: "all 0.3s ease",
  fontSize: "clamp(14px, 3vw, 16px)",
  fontFamily: "inherit",
  textAlign: "center" as const,
  position: "relative" as const,
  zIndex: 10,
  boxShadow: "0 12px 24px rgba(225, 37, 27, 0.22)",
};

const estiloBotonSecundario = {
  display: "inline-block",
  background: "#FFD54A",
  color: "#111827",
  padding: "16px 24px",
  borderRadius: "14px",
  fontWeight: 800,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  transition: "all 0.3s ease",
  fontSize: "clamp(14px, 3vw, 16px)",
  fontFamily: "inherit",
  textAlign: "center" as const,
  position: "relative" as const,
  zIndex: 10,
};

type HeroInicioProps = {
  negocio: Negocio;
};

export function HeroInicio({ negocio }: HeroInicioProps) {
  const [marcaTiempo, setMarcaTiempo] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMarcaTiempo(Date.now());
    }, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const estadoNegocio = useMemo(
    () => obtenerEstadoNegocio(negocio, new Date(marcaTiempo)),
    [marcaTiempo, negocio],
  );
  const resumenHorarios = useMemo(
    () => obtenerResumenHorariosVisible(negocio),
    [negocio],
  );

  const labelEstado =
    estadoNegocio.estado === "cerrado" ? "Cerrado" : "Abierto ahora";
  const claseEstado =
    estadoNegocio.estado === "cerrado"
      ? {
          background: "rgba(107, 114, 128, 0.14)",
          border: "1px solid rgba(107, 114, 128, 0.36)",
          color: "#4b5563",
        }
      : {
          background: "rgba(34, 197, 94, 0.12)",
          border: "1px solid rgba(34, 197, 94, 0.35)",
          color: "#15803d",
        };

  const subtituloEstado =
    estadoNegocio.estado === "domicilios_no_disponibles"
      ? "Domicilios desde las 7:40 PM"
      : estadoNegocio.estado === "domicilios_cerrados"
        ? "Domicilios cerrados por hoy"
        : estadoNegocio.estado === "cerrado"
          ? "Volvemos a las 6:00 PM"
          : null;

  const ctaPedidoLabel =
    estadoNegocio.estado === "cerrado"
      ? "Ver menú (cerrado ahora)"
      : "Ver menú y hacer pedido";
  return (
    <>
      <style>{`
        .hero-cta-primario:hover,
        .hero-cta-primario:focus-visible {
          transform: scale(1.05);
          box-shadow: 0 16px 32px rgba(225, 37, 27, 0.32);
        }

        .hero-cta-primario:active {
          transform: scale(0.98);
        }

        .hero-cta-secundario:hover,
        .hero-cta-secundario:focus-visible {
          transform: scale(1.05);
          background-color: #ffc926;
        }

        .hero-cta-secundario:active {
          transform: scale(0.98);
        }

        @media (max-width: 640px) {
          .hero-cta-primario,
          .hero-cta-secundario {
            min-height: 48px;
            min-width: 48px;
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
      <section
        style={{
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(16px, 4vw, 24px)",
          paddingBottom: "calc(120px + env(safe-area-inset-bottom))",
          boxSizing: "border-box",
          background:
            "linear-gradient(180deg, #fff7e6 0%, #fff1c7 45%, #ffffff 100%)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "720px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "clamp(12px, 2.5vw, 18px)",
            alignItems: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: "clamp(72px, 18vw, 96px)",
              height: "clamp(72px, 18vw, 96px)",
              borderRadius: "999px",
              overflow: "hidden",
              border: "4px solid #E1251B",
              background: "#fff",
              boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
            }}
          >
            <img
              src="/logo-demo.png"
              alt={negocio.nombre}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          <div>
            <h1
              style={{
                fontSize: "clamp(32px, 7vw, 56px)",
                fontWeight: 900,
                color: "#111827",
                marginBottom: "8px",
                lineHeight: 1.05,
              }}
            >
              {negocio.nombre}
            </h1>

            <p
              style={{
                fontSize: "clamp(14px, 3.6vw, 16px)",
                lineHeight: 1.6,
                color: "#4b5563",
                maxWidth: "560px",
                margin: "0 auto",
              }}
            >
              {negocio.subtitulo}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                padding: "8px 14px",
                borderRadius: "999px",
                background: claseEstado.background,
                border: claseEstado.border,
                color: claseEstado.color,
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              {labelEstado}
            </span>

            {subtituloEstado && (
              <span
                style={{
                  padding: "8px 14px",
                  borderRadius: "999px",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  color: "#374151",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                {subtituloEstado}
              </span>
            )}

            <span
              style={{
                padding: "8px 14px",
                borderRadius: "999px",
                background: "#fff",
                border: "1px solid #e5e7eb",
                color: "#374151",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              35 - 50 min
            </span>

            <span
              style={{
                padding: "8px 14px",
                borderRadius: "999px",
                background: "#fff",
                border: "1px solid #e5e7eb",
                color: "#374151",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              Domicilio y recoger
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "100%",
              maxWidth: "400px",
              marginTop: "6px",
            }}
          >
            <PanelHorarios resumenHorarios={resumenHorarios} label="Horarios" />

            <Link
              href="/demo"
              className="hero-cta-primario"
              style={estiloBotonPrimario}
            >
              {ctaPedidoLabel}
            </Link>

            <a
              href={`https://wa.me/${negocio.whatsapp}?text=${encodeURIComponent(
                "Hola, quiero realizar un pedido. Me puedes ayudar con el menu y precios?",
              )}`}
              target="_blank"
              rel="noreferrer"
              className="hero-cta-secundario"
              style={estiloBotonSecundario}
            >
              WhatsApp
            </a>
          </div>

          <p
            style={{
              fontSize: "clamp(12px, 3.3vw, 13px)",
              color: "#6b7280",
              maxWidth: "580px",
              marginTop: "12px",
            }}
          >
            Nuestros productos tienen un tiempo de cocción importante para
            brindarte excelente calidad. Gracias por tu espera y comprensión.
          </p>
        </div>
      </section>
    </>
  );
}
