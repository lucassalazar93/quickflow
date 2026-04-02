import Link from "next/link";

export function HeroInicio() {
  return (
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
            alt="Mandingas La 37"
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
            MANDINGAS La 37
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
            Arma tu pedido fácil, elige tus productos favoritos y envíalo por
            WhatsApp en pocos pasos.
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
              background: "rgba(34, 197, 94, 0.12)",
              border: "1px solid rgba(34, 197, 94, 0.35)",
              color: "#15803d",
              fontWeight: 700,
              fontSize: "13px",
            }}
          >
            Abierto ahora
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
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "center",
            marginTop: "6px",
          }}
        >
          <Link
            href="/demo"
            style={{
              background: "#E1251B",
              color: "#fff",
              padding: "14px 22px",
              borderRadius: "14px",
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 12px 24px rgba(225, 37, 27, 0.22)",
            }}
          >
            Ver menú
          </Link>

          <a
            href={`https://wa.me/573150399322?text=${encodeURIComponent(
              "Hola, quiero realizar un pedido. Me puedes ayudar con el menu y precios?",
            )}`}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "#FFD54A",
              color: "#111827",
              padding: "14px 22px",
              borderRadius: "14px",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Pedir por WhatsApp
          </a>
        </div>

        <p
          style={{
            fontSize: "clamp(12px, 3.3vw, 13px)",
            color: "#6b7280",
            maxWidth: "580px",
          }}
        >
          Nuestros productos tienen un tiempo de cocción importante para
          brindarte excelente calidad. Gracias por tu espera y comprensión.
        </p>
      </div>
    </section>
  );
}
