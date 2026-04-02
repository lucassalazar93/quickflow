type Props = {
  nombre: string;
  subtitulo: string;
  logo: string;
  abierto: boolean;
};

export function EncabezadoNegocio({ nombre, subtitulo, logo, abierto }: Props) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        rowGap: "12px",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          minWidth: 0,
          flex: "1 1 260px",
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

        <div style={{ minWidth: 0 }}>
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
        </div>
      </div>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          borderRadius: "999px",
          background: "rgba(34, 197, 94, 0.12)",
          border: "1px solid rgba(34, 197, 94, 0.35)",
          color: "#16a34a",
          fontSize: "12px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginLeft: "auto",
          alignSelf: "flex-start",
        }}
        aria-label={abierto ? "Abierto" : "Cerrado"}
        title={abierto ? "Abierto" : "Cerrado"}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "999px",
            background: abierto ? "#22c55e" : "#9ca3af",
            boxShadow: abierto ? "0 0 10px rgba(34, 197, 94, 0.7)" : "none",
            animation: abierto ? "pulso 1.4s ease-in-out infinite" : "none",
          }}
        />
        {abierto ? "Abierto" : "Cerrado"}
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
