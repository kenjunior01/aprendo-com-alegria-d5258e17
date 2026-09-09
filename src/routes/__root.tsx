import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { UsageGuard } from "@/components/UsageGuard";
import { CookieConsent } from "@/components/CookieConsent";
import { InstallPrompt } from "@/components/InstallPrompt";
import { installServerFnAuthInterceptor } from "@/integrations/supabase/serverFnAuth";
import { registerServiceWorker } from "@/lib/registerSW";
import { loadHapticsPref } from "@/lib/haptics";
import { usePushNotifications } from "@/hooks/usePushNotifications";

import appCss from "../styles.css?url";

if (typeof window !== "undefined") {
  installServerFnAuthInterceptor();
}

function NotFoundComponent() {
  return (
    <main
      id="main-content"
      className="bg-sky-island relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4"
    >
      {["⭐", "🎈", "✨", "☁️"].map((e, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute animate-bounce-soft text-2xl opacity-40"
          style={{
            left: `${12 + i * 22}%`,
            top: `${18 + (i % 2) * 55}%`,
            animationDelay: `${i * 0.4}s`,
          }}
        >
          {e}
        </span>
      ))}
      <div className="max-w-[28rem] text-center">
        <span aria-hidden="true" className="mb-2 inline-block text-7xl sm:text-8xl">
          🦉
        </span>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Ups! Página perdida</h1>
        <p className="mt-3 text-base text-muted-foreground">
          A Mocha procurou por todo o céu e não encontrou esta página. Vamos voltar à aventura?
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/">
            <span className="btn-chunky inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-primary px-6 py-3 font-display text-base font-semibold uppercase tracking-wide text-primary-foreground">
              Voltar ao início
            </span>
          </Link>
          <Link to="/comecar">
            <span className="btn-chunky inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-border bg-card px-6 py-3 font-display text-base font-semibold uppercase tracking-wide text-foreground">
              Criar perfil
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#ff8c42" },
      { title: "Kidoz — Aprender com alegria" },
      {
        name: "description",
        content:
          "Plataforma educativa estilo Duolingo para crianças do 1.º ciclo. Português, Matemática e Estudo do Meio com mascotes, tutor IA e controlo parental.",
      },
      { name: "author", content: "Kidoz" },
      { property: "og:site_name", content: "Kidoz" },
      { property: "og:title", content: "Kidoz — Aprender com alegria" },
      {
        property: "og:description",
        content:
          "Plataforma educativa estilo Duolingo para crianças do 1.º ciclo. Português, Matemática e Estudo do Meio.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://kidoz.online" },
      { property: "og:locale", content: "pt_PT" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Kidoz — Aprender com alegria" },
      {
        name: "twitter:description",
        content:
          "Plataforma educativa estilo Duolingo para crianças do 1.º ciclo. Português, Matemática e Estudo do Meio.",
      },
      { property: "og:image", content: "https://kidoz.online/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "675" },
      { property: "og:image:alt", content: "Kidoz — Aprender a brincar" },
      { name: "twitter:image", content: "https://kidoz.online/og-image.jpg" },
      { name: "google-site-verification", content: "KkNwae9G6TBDD8H-jnriAzFdEQWqDN-6nTTedsgCSYk" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", type: "image/png", href: "/icon-192.png", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/icon-512.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@600;700;800&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://kidoz.online/#organization",
              name: "Kidoz",
              url: "https://kidoz.online",
              logo: "https://kidoz.online/icon-512.png",
            },
            {
              "@type": "WebSite",
              "@id": "https://kidoz.online/#website",
              name: "Kidoz",
              url: "https://kidoz.online",
              inLanguage: "pt-PT",
              publisher: { "@id": "https://kidoz.online/#organization" },
            },
            {
              "@type": "WebApplication",
              "@id": "https://kidoz.online/#webapp",
              name: "Kidoz",
              url: "https://kidoz.online",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
              },
              educationalLevel: "1.º ciclo do ensino básico",
              educationalFramework: "Programa de Português, Matemática e Estudo do Meio — ME",
              audience: {
                "@type": "PeopleAudience",
                suggestedMinAge: "6",
                suggestedMaxAge: "10",
              },
              inLanguage: "pt-PT",
              publisher: { "@id": "https://kidoz.online/#organization" },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  usePushNotifications();
  useEffect(() => {
    installServerFnAuthInterceptor();
    loadHapticsPref();
    registerServiceWorker();
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
      >
        Saltar para o conteúdo
      </a>
      <Outlet />
      <UsageGuard />
      <CookieConsent />
      <InstallPrompt />
    </MotionConfig>
  );
}
