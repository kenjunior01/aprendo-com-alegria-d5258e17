import { useEffect, useState } from "react";
import { Receipt, FileDown, ExternalLink, Loader2 } from "lucide-react";
import { listUserInvoices, type PurchaseRecord } from "@/utils/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";

const STATUS_LABEL: Record<string, string> = {
  paid: "Pago",
  open: "Em aberto",
  succeeded: "Pago",
  void: "Anulado",
  uncollectible: "Não cobrado",
  draft: "Rascunho",
  failed: "Falhou",
  pending: "Pendente",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("pt-PT", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function PurchaseHistoryPanel() {
  const [records, setRecords] = useState<PurchaseRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const data = await listUserInvoices({ data: { environment: getStripeEnvironment() } });
        if (!cancelled) setRecords(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro a carregar histórico");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="card-chunky mt-5 rounded-3xl border-2 border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Receipt className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg">Histórico de pagamentos</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Vê e descarrega os teus recibos e faturas.
      </p>

      {loading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> A carregar…
        </div>
      )}

      {!loading && error && (
        <div className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && records && records.length === 0 && (
        <div className="mt-4 rounded-xl bg-muted/40 p-4 text-center text-sm text-muted-foreground">
          Ainda não tens compras registadas.
        </div>
      )}

      {!loading && !error && records && records.length > 0 && (
        <ul className="mt-4 divide-y divide-border">
          {records.map((r) => (
            <li key={r.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-display text-base">{formatAmount(r.amount, r.currency)}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(r.date)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    r.status === "paid" || r.status === "succeeded"
                      ? "bg-success/15 text-success"
                      : r.status === "failed"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </div>
                <p className="truncate text-sm text-muted-foreground">{r.description}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {r.invoiceUrl && (
                  <a
                    href={r.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border-2 border-border bg-card px-3 py-1.5 text-xs font-display hover:bg-muted"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Fatura
                  </a>
                )}
                {r.invoicePdf && (
                  <a
                    href={r.invoicePdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border-2 border-border bg-card px-3 py-1.5 text-xs font-display hover:bg-muted"
                  >
                    <FileDown className="h-3.5 w-3.5" /> PDF
                  </a>
                )}
                {r.receiptUrl && (
                  <a
                    href={r.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border-2 border-border bg-card px-3 py-1.5 text-xs font-display hover:bg-muted"
                  >
                    <Receipt className="h-3.5 w-3.5" /> Recibo
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
