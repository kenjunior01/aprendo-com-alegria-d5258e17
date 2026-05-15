import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://kidoz.online";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/",                    changefreq: "weekly",  priority: "1.0" },
  { path: "/comecar",             changefreq: "monthly", priority: "0.7" },
  { path: "/app",                 changefreq: "weekly",  priority: "0.8" },
  { path: "/junior",              changefreq: "weekly",  priority: "0.9" },
  { path: "/desafios",            changefreq: "weekly",  priority: "0.7" },
  { path: "/desafios/infinitos",  changefreq: "weekly",  priority: "0.8" },
  { path: "/leitura",             changefreq: "monthly", priority: "0.6" },
  { path: "/tutor",               changefreq: "monthly", priority: "0.6" },
  { path: "/ra",                  changefreq: "monthly", priority: "0.5" },
  { path: "/loja",                changefreq: "monthly", priority: "0.5" },
  { path: "/mundo",               changefreq: "monthly", priority: "0.5" },
  { path: "/jardim",              changefreq: "monthly", priority: "0.5" },
  { path: "/conquistas",          changefreq: "monthly", priority: "0.5" },
  { path: "/perfil",              changefreq: "monthly", priority: "0.4" },
  { path: "/pais",                changefreq: "monthly", priority: "0.7" },
  { path: "/premium",             changefreq: "weekly",  priority: "0.9" },
  { path: "/escolas",             changefreq: "monthly", priority: "0.8" },
  { path: "/creches",             changefreq: "monthly", priority: "0.8" },
  { path: "/escola",              changefreq: "monthly", priority: "0.6" },
  { path: "/auth",                changefreq: "yearly",  priority: "0.3" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
