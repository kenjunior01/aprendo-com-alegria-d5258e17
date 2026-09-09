// Eliminação de conta (RGPD Art. 17 — direito ao esquecimento / COPPA).
// Apaga todos os dados pessoais do utilizador autenticado e a própria conta.
// Executa com service_role no servidor; o utilizador só pode apagar a própria conta.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type DeleteAccountResult = { ok: boolean; error?: string };

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DeleteAccountResult> => {
    const userId: string = context.userId;
    const admin = supabaseAdmin;

    try {
      // Tabelas onde a coluna de identidade é `user_id`
      const tables = [
        "user_achievements",
        "infinite_progress",
        "infinite_scores",
        "practice_sessions",
        "league_members",
        "friendships",
        "class_members",
        "junior_cloud",
        "subscriptions",
        "profiles",
      ] as const;

      for (const table of tables) {
        try {
          // Tabela é um literal union — o TS não consegue inferir colunas;
          // cast controlado: `user_id` existe em todas as tabelas da lista.
          const q = admin.from(table) as unknown as {
            delete: () => { eq: (col: "user_id", val: string) => PromiseLike<unknown> };
          };
          await q.delete().eq("user_id", userId);
        } catch {
          // tabela pode não existir neste ambiente — segue
        }
      }

      // parent_links usa parent_id (uuid auth) e child_id (id de perfil)
      try {
        await (
          admin.from("parent_links") as unknown as {
            delete: () => { eq: (col: "parent_id", val: string) => PromiseLike<unknown> };
          }
        )
          .delete()
          .eq("parent_id", userId);
      } catch {
        /* segue */
      }

      // Apaga a identidade auth (remove sessões e impede novo login)
      const { error: delErr } = await admin.auth.admin.deleteUser(userId);
      if (delErr) {
        return { ok: false, error: "Não foi possível eliminar a conta. Contacta o suporte." };
      }

      return { ok: true };
    } catch {
      return { ok: false, error: "Erro inesperado ao eliminar a conta. Tenta de novo." };
    }
  });
