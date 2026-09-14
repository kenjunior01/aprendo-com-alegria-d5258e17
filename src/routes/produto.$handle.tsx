import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/CartDrawer";
import { useCartStore } from "@/stores/cartStore";
import { fetchShopifyProductByHandle, formatPrice, type ShopifyProduct, type ProductNode } from "@/lib/shopify";
import { AlegriaLogo } from "@/components/AlegriaLogo";
import { KidLoader } from "@/components/KidLoader";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/produto/$handle")({
  head: ({ params }) => ({
    meta: [
      { title: `Produto — Kidoz` },
      { name: "description", content: "Detalhes do produto na loja oficial Kidoz." },
      { property: "og:title", content: `Produto — Kidoz` },
      { property: "og:description", content: "Detalhes do produto na loja oficial Kidoz." },
      { property: "og:url", content: `https://kidoz.online/produto/${params.handle}` },
      { property: "og:type", content: "product" },
      { property: "og:image", content: "https://kidoz.online/og-image.jpg" },
      { name: "twitter:image", content: "https://kidoz.online/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: `https://kidoz.online/produto/${params.handle}` }],
  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { handle } = Route.useParams();
  const [product, setProduct] = useState<ProductNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchShopifyProductByHandle(handle);
        if (!data) throw notFound();
        if (!cancelled) setProduct(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar produto");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [handle]);

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <KidLoader />
      </div>
    );
  }

  if (error || !product) {
    throw notFound();
  }

  const [selectedVariant, setSelectedVariant] = useState(product.variants.edges[0]?.node);
  const [selectedImage, setSelectedImage] = useState(product.images.edges[0]?.node);

  const handleAdd = async () => {
    if (!selectedVariant) return;
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="glass-premium sticky top-0 z-40 border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/merch" className="flex items-center gap-2">
            <AlegriaLogo className="h-8 w-auto" />
            <span className="font-display text-lg font-bold">Loja Kidoz</span>
          </Link>
          <CartDrawer />
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <Button asChild variant="ghost" className="mb-4 -ml-2 rounded-full font-display font-semibold">
          <Link to="/merch">
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar à loja
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
            <div className="card-chunky aspect-square overflow-hidden rounded-3xl bg-card">
              {selectedImage ? (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.altText ?? product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-accent/30 text-7xl">🎁</div>
              )}
            </div>
            {product.images.edges.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {product.images.edges.map(({ node }) => (
                  <button
                    key={node.url}
                    onClick={() => setSelectedImage(node)}
                    className={cn(
                      "h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-colors",
                      selectedImage?.url === node.url ? "border-primary" : "border-border",
                    )}
                    aria-label="Ver imagem"
                  >
                    <img
                      src={node.url}
                      alt={node.altText ?? product.title}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h1 className="font-display text-3xl font-bold sm:text-4xl">{product.title}</h1>
            <p className="mt-4 text-base leading-relaxed text-foreground/80">{product.description}</p>

            {selectedVariant && (
              <p className="mt-6 font-display text-3xl font-bold text-primary">
                {formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)}
              </p>
            )}

            {/* Variant options */}
            {product.options.map(
              (option) =>
                option.values.length > 1 && (
                  <div key={option.name} className="mt-6">
                    <h3 className="font-display font-semibold">{option.name}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const variant = product.variants.edges.find((v) =>
                          v.node.selectedOptions.some((o) => o.name === option.name && o.value === value),
                        )?.node;
                        const isSelected = selectedVariant?.selectedOptions.some(
                          (o) => o.name === option.name && o.value === value,
                        );
                        return (
                          <button
                            key={value}
                            onClick={() => variant && setSelectedVariant(variant)}
                            disabled={!variant?.availableForSale}
                            className={cn(
                              "rounded-xl border px-4 py-2 font-display text-sm font-semibold transition-colors",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-card text-foreground hover:border-primary/50",
                              !variant?.availableForSale && "opacity-50",
                            )}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ),
            )}

            <div className="mt-auto pt-8">
              <Button
                onClick={handleAdd}
                disabled={!selectedVariant?.availableForSale || isLoading}
                className="btn-chunky w-full rounded-2xl bg-primary py-4 font-display text-lg font-semibold text-primary-foreground"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : added ? (
                  <>
                    <Check className="mr-2 h-5 w-5" /> Adicionado ao cesto
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" /> Adicionar ao cesto
                  </>
                )}
              </Button>
              {!selectedVariant?.availableForSale && (
                <p className="mt-2 text-center text-sm text-muted-foreground">Produto esgotado</p>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
