import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/CartDrawer";
import { useCartStore } from "@/stores/cartStore";
import { fetchShopifyProducts, formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { AlegriaLogo } from "@/components/AlegriaLogo";

const productsQueryOptions = {
  queryKey: ["shopify-products"],
  queryFn: () => fetchShopifyProducts(50),
};

export const Route = createFileRoute("/merch")({
  head: () => ({
    meta: [
      { title: "Loja Kidoz — Merchandising educativo" },
      {
        name: "description",
        content:
          "Loja oficial Kidoz: merchandising educativo, livros, materiais escolares e produtos para crianças. Envio seguro para Portugal e Moçambique.",
      },
      { property: "og:title", content: "Loja Kidoz — Merchandising educativo" },
      {
        property: "og:description",
        content: "Produtos Kidoz para continuar a aventura de aprender fora do ecrã.",
      },
      { property: "og:url", content: "https://kidoz.online/merch" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://kidoz.online/og-image.jpg" },
      { name: "twitter:image", content: "https://kidoz.online/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://kidoz.online/merch" }],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(productsQueryOptions);
  },
  component: MerchPage,
});

function ProductCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);

  const variant = product.node.variants.edges[0]?.node;
  if (!variant || !variant.availableForSale) return null;

  const handleAdd = async () => {
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions,
    });
  };

  const image = product.node.images.edges[0]?.node;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-chunky flex flex-col overflow-hidden rounded-3xl border border-border bg-card"
    >
      <Link to="/produto/$handle" params={{ handle: product.node.handle }} className="group block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {image ? (
            <img
              src={image.url}
              alt={image.altText ?? product.node.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-accent/30 text-5xl">🎁</div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link to="/produto/$handle" params={{ handle: product.node.handle }}>
          <h3 className="font-display text-lg font-semibold leading-tight transition-colors hover:text-primary">
            {product.node.title}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.node.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="font-display text-lg font-bold">
            {formatPrice(variant.price.amount, variant.price.currencyCode)}
          </span>
          <Button
            onClick={handleAdd}
            disabled={isLoading}
            className="btn-chunky rounded-2xl bg-primary px-4 py-2 font-display text-sm font-semibold text-primary-foreground"
          >
            Adicionar
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function MerchPage() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <header className="glass-premium sticky top-0 z-40 border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <AlegriaLogo className="h-8 w-auto" />
            <span className="font-display text-lg font-bold">Loja Kidoz</span>
          </Link>
          <CartDrawer />
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/20 via-accent/40 to-secondary/20 p-6 sm:p-12">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-semibold shadow-sm">
              <ShoppingBag className="h-3.5 w-3.5" /> Envio em breve
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold sm:text-5xl">
              Continua a aventura fora do ecrã
            </h1>
            <p className="mt-3 max-w-lg text-base text-foreground/80 sm:text-lg">
              Merchandising educativo, livros de atividades e materiais escolares inspirados no universo
              Kidoz.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="btn-chunky rounded-2xl bg-primary px-6 py-3 font-display font-semibold text-primary-foreground">
                <a href="#produtos">
                  Ver produtos <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-2xl px-6 py-3 font-display font-semibold">
                <Link to="/">Voltar ao Kidoz</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Products grid */}
        <section id="produtos" className="mt-10 sm:mt-14">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Produtos</h2>
          {products.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <Package className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-display text-xl font-semibold">Ainda não há produtos</h3>
              <p className="mt-2 max-w-md text-muted-foreground">
                A loja está pronta. Diz-me que produtos queres vender (por exemplo: livro de atividades,
                t-shirt, mochila) e eu crio-os na Shopify.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.node.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
