import { useState } from "react";
import { acceptParentInvite, createParentInvite } from "@/lib/parent.functions";
import { ChunkyButton } from "./ChunkyButton";
import { Copy, Check, UserPlus } from "lucide-react";
import type { Profile } from "@/lib/storage";

export function ParentLinkPanel({ profile }: { profile: Profile }) {
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingGen, setLoadingGen] = useState(false);

  const [inputCode, setInputCode] = useState("");
  const [acceptResult, setAcceptResult] = useState<string | null>(null);
  const [acceptLoading, setAcceptLoading] = useState(false);

  const generate = async () => {
    setLoadingGen(true);
    try {
      const res = await createParentInvite();
      setCode(res.invite_code);
    } catch {
      setCode(null);
    } finally {
      setLoadingGen(false);
    }
  };

  const copy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const accept = async () => {
    setAcceptLoading(true);
    setAcceptResult(null);
    try {
      const res = await acceptParentInvite({ data: { code: inputCode } });
      if (res.ok) {
        setAcceptResult("✅ Ligação criada com sucesso!");
        setInputCode("");
      } else if (res.reason === "not_found") {
        setAcceptResult("❌ Código inválido.");
      } else if (res.reason === "already_used") {
        setAcceptResult("⚠️ Esse código já foi usado.");
      } else {
        setAcceptResult("❌ Não foi possível ligar.");
      }
    } catch {
      setAcceptResult("❌ Erro a ligar contas.");
    } finally {
      setAcceptLoading(false);
    }
  };

  // Child view — accept a parent's code
  if (profile.role !== "parent") {
    return (
      <div className="card-chunky rounded-3xl border border-border bg-card p-4 sm:p-5">
        <div className="mb-2 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg">Ligar a um adulto</h2>
        </div>
        <p className="mb-3 text-xs text-muted-foreground sm:text-sm">
          Tens um código de um pai, mãe ou tutor? Insere-o aqui para partilhar o teu progresso.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="ABC123"
            className="flex-1 rounded-2xl border-2 border-border bg-background px-4 py-3 text-center font-display text-lg tracking-widest outline-none focus:border-primary"
          />
          <ChunkyButton
            tone="secondary"
            onClick={accept}
            disabled={inputCode.length < 4 || acceptLoading}
          >
            {acceptLoading ? "A ligar…" : "Ligar"}
          </ChunkyButton>
        </div>
        {acceptResult && (
          <p className="mt-2 text-center text-sm">{acceptResult}</p>
        )}
      </div>
    );
  }

  // Parent view — generate a code for a child
  return (
    <div className="card-chunky rounded-3xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-2 flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg">Ligar uma criança</h2>
      </div>
      <p className="mb-3 text-xs text-muted-foreground sm:text-sm">
        Gera um código e dá-o à criança. Ela insere-o no perfil para te dar acesso ao painel de pais.
      </p>

      {!code ? (
        <ChunkyButton onClick={generate} disabled={loadingGen} className="w-full">
          {loadingGen ? "A gerar…" : "Gerar código de convite"}
        </ChunkyButton>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-primary bg-primary/5 p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">O teu código</p>
          <p className="mt-1 font-display text-4xl tracking-widest text-primary">{code}</p>
          <button
            onClick={copy}
            className="mt-3 inline-flex items-center gap-1 rounded-full bg-card px-3 py-1.5 text-xs font-semibold shadow-sm"
          >
            {copied ? <><Check className="h-3.5 w-3.5" /> Copiado</> : <><Copy className="h-3.5 w-3.5" /> Copiar</>}
          </button>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Pede à criança para abrir o perfil e introduzir este código.
          </p>
        </div>
      )}
    </div>
  );
}
