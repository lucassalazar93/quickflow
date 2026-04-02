import type { Metadata } from "next";
import { cargarNegocio } from "@/infraestructura/negocios";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ negocio: string }>;
}): Promise<Metadata> {
  const { negocio: slug } = await params;
  const configuracion = cargarNegocio(slug);

  if (!configuracion) {
    return {
      title: "Negocio no encontrado",
    };
  }

  const { negocio } = configuracion;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://quickflow.vercel.app";
  const ogImageUrl = `${baseUrl}/og-mandingas.jpg`;

  return {
    title: negocio.nombre,
    description: negocio.subtitulo,

    openGraph: {
      title: negocio.nombre,
      description: negocio.subtitulo,
      url: `${baseUrl}/${negocio.slug}`,
      siteName: "QuickFlow",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: negocio.nombre,
          type: "image/jpeg",
        },
      ],
      locale: "es_CO",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: negocio.nombre,
      description: negocio.subtitulo,
      images: [ogImageUrl],
    },

    icons: {
      icon: negocio.logo,
    },
  };
}

export default function NegocioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
