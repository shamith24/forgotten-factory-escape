import { createFileRoute } from "@tanstack/react-router";
import Game from "../game/Game";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "The Night Shift — Toy Factory Horror" },
      { name: "description", content: "A first-person 3D horror game set in an abandoned toy factory office. Find the security keycard." },
      { property: "og:title", content: "The Night Shift — Toy Factory Horror" },
      { property: "og:description", content: "Explore an abandoned toy factory office by flashlight and find the keycard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Special+Elite&family=IBM+Plex+Mono:wght@400;600&display=swap" },
    ],
  }),
  component: Game,
});
