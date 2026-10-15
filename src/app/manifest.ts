import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/choose-role",
    name: "UMANG — Beyond the Waiting Line",
    short_name: "UMANG",
    description:
      "Find nearby work with clear wages, or hire skilled workers — in English, Hindi and Marathi. Independent hackathon prototype.",
    start_url: "/choose-role",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0a09",
    theme_color: "#0b0a09",
    lang: "en-IN",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Find work", url: "/worker/jobs", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Post a job", url: "/employer/post", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
