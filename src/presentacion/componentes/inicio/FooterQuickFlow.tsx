export function FooterQuickFlow() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(15, 23, 42, 0.08)",
        padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
        background: "rgba(255,255,255,0.42)",
        backdropFilter: "blur(10px)",
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "520px" }}>
          <p
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            QuickFlow
          </p>

          <p
            style={{
              margin: "6px 0 0",
              fontSize: "13px",
              lineHeight: 1.5,
              color: "#475569",
            }}
          >
            Experiencias rápidas y conversión. Creado por Lucas Salazar.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <a
            href={`https://wa.me/573150399322?text=${encodeURIComponent(
              "Hola lucas, vengo buscando un catalogo inteligente para mi negocio. Me interesa conocer QuickFlow y como puede ayudarme a vender mas por WhatsApp.",
            )}`}
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: "none",
              fontWeight: 700,
              color: "#0f172a",
              padding: "8px 12px",
              borderRadius: "10px",
              background: "#ffffff",
              border: "1px solid rgba(15, 23, 42, 0.08)",
            }}
          >
            WhatsApp
          </a>

          <a
            href="https://www.instagram.com/soylukassalazar/"
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: "none",
              fontWeight: 700,
              color: "#0f172a",
              padding: "8px 12px",
              borderRadius: "10px",
              background: "#ffffff",
              border: "1px solid rgba(15, 23, 42, 0.08)",
            }}
          >
            Instagram
          </a>

          <a
            href="https://lucas-salazar-portfolio.vercel.app/"
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: "none",
              fontWeight: 700,
              color: "#0f172a",
              padding: "8px 12px",
              borderRadius: "10px",
              background: "#ffffff",
              border: "1px solid rgba(15, 23, 42, 0.08)",
            }}
          >
            Portafolio
          </a>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          margin: "10px auto 0",
          paddingTop: "10px",
          borderTop: "1px solid rgba(15, 23, 42, 0.08)",
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          justifyContent: "center",
          textAlign: "center",
          color: "#64748b",
          fontSize: "12px",
        }}
      >
        <span>© 2026 QuickFlow. Todos los derechos reservados.</span>
      </div>
    </footer>
  );
}
