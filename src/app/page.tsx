import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "24px" }}>
      <h1>QuickFlow</h1>
      <p>Producto base de pedidos rápidos.</p>

      <div style={{ marginTop: "16px" }}>
        <Link href="/demo">Ir al negocio demo</Link>
      </div>
    </main>
  );
}
