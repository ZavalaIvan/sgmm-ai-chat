import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SGMM AI Chat",
    short_name: "SGMM AI",
    description:
      "Asistente PWA para Seguros de Gastos Medicos Mayores: cotizacion, coberturas y tramites.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#0f766e",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
