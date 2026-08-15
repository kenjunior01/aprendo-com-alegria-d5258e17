import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que procuras não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#ff8c42" },
      { title: "Alegria — Aprender a brincar" },
      { name: "description", content: "App educativa estilo Duolingo para crianças do 1.º ciclo em Portugal." },
      { name: "author", content: "Alegria" },
      { property: "og:site_name", content: "Alegria" },
      { property: "og:title", content: "Alegria — Aprender a brincar" },
      { property: "og:description", content: "App educativa estilo Duolingo para crianças do 1.º ciclo em Portugal." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_PT" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Alegria — Aprender a brincar" },
      { name: "twitter:description", content: "App educativa estilo Duolingo para crianças do 1.º ciclo em Portugal." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
      { name: "google-site-verification", content: "KkNwae9G6TBDD8H-jnriAzFdEQWqDN-6nTTedsgCSYk" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-512.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@600;700;800&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://alegria.online/#organization",
              name: "Alegria",
              url: "https://alegria.online",
              logo: "https://alegria.online/icon-512.png",
              sameAs: ["https://aprendo-com-alegria.lovable.app"],
            },
            {
              "@type": "WebSite",
              "@id": "https://alegria.online/#website",
              name: "Alegria",
              url: "https://alegria.online",
              inLanguage: "pt-PT",
              publisher: { "@id": "https://alegria.online/#organization" },
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
    <>
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
    </>
  );
}
