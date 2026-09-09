import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

/**
 * Banner de modo de teste de pagamentos.
 *
 * Auditoria (segurança/UX infantil): as instruções do cartão de teste só devem
 * ser visíveis para administradores — uma criança nunca deve ver "usa o cartão
 * 4242…" num ecrã de compra. Para todos os outros, mostra apenas um aviso
 * discreto de ambiente de demonstração.
 */
export function PaymentTestModeBanner() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || !active) return;
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (active) setIsAdmin(!!data);
      } catch {
        /* utilizador anónimo — nunca é admin */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!clientToken?.startsWith("pk_test_")) return null;

  return (
    <div className="w-full bg-orange-100 border-b border-orange-300 px-4 py-2 text-center text-sm text-orange-800">
      {isAdmin
        ? "Pagamentos em modo de teste (admin). Usa o cartão 4242 4242 4242 4242."
        : "Ambiente de demonstração — as compras não são reais."}
    </div>
  );
}
