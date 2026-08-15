// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          // Function form is required so the SSR build (which externalises
          // some packages) doesn't fail with "cannot be included in
          // manualChunks because it is resolved as an external module".
          manualChunks(id) {
            if (id.includes("node_modules/")) {
              // Animation — used heavily (~54 imports), very large runtime
              if (id.includes("framer-motion/")) return "vendor-framer";
              // Charting — ~100 KB+ gzipped; only a few pages
              if (id.includes("recharts/")) return "vendor-recharts";
              // Supabase client — DB/auth layer
              if (id.includes("@supabase/supabase-js/"))
                return "vendor-supabase";
              // Stripe — only needed on checkout/payment pages
              if (
                id.includes("@stripe/stripe-js/") ||
                id.includes("@stripe/react-stripe-js/")
              )
                return "vendor-stripe";
              // Drag-and-drop — only used in admin/interactive pages
              if (
                id.includes("@dnd-kit/core/") ||
                id.includes("@dnd-kit/sortable/") ||
                id.includes("@dnd-kit/utilities/")
              )
                return "vendor-dnd";
              // PDF generation — only needed where PDFs are created
              if (id.includes("pdf-lib/")) return "vendor-pdf";
              // Confetti animation — only needed on completion pages
              if (id.includes("canvas-confetti/")) return "vendor-confetti";
            }
          },
        },
      },
    },
  },
});
