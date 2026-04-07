"use client";

import { FormEvent, useState } from "react";

export default function PaginaBloqueada() {
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    const res = await fetch("/api/acceso", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clave }),
    });

    setCargando(false);

    if (!res.ok) {
      setError("Clave incorrecta");
      return;
    }

    window.location.href = "/";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0b0b0b",
        color: "white",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#111",
          border: "1px solid #222",
          borderRadius: "20px",
          padding: "32px",
        }}
      >
        <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>
          Acceso restringido
        </h1>

        <p style={{ color: "#b3b3b3", marginBottom: "24px", lineHeight: 1.5 }}>
          Estamos realizando ajustes finales para ofrecer una mejor experiencia.
          Si necesitas acceso, solicita la clave.
        </p>

        <form onSubmit={manejarSubmit}>
          <input
            type="password"
            placeholder="Ingresa la clave"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1px solid #333",
              background: "#0f0f0f",
              color: "white",
              marginBottom: "12px",
            }}
          />

          <button
            type="submit"
            disabled={cargando}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "none",
              background: "#ffffff",
              color: "#000",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {cargando ? "Validando..." : "Ingresar"}
          </button>
        </form>

        {error ? (
          <p style={{ color: "#ff7b7b", marginTop: "12px" }}>{error}</p>
        ) : null}
      </div>
    </main>
  );
}
