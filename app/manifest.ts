import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1E222A",
    icons: [
      {
        src: "/logo64.png",
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: "/logo128.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: "/logo256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
