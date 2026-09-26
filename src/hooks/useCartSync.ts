import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import type { CartItem } from "@/lib/shopify";

export function useCartSync() {
  const syncCart = useCartStore((state: { syncCart: () => void | Promise<void> }) => state.syncCart);

  useEffect(() => {
    syncCart();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") syncCart();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [syncCart]);
}
