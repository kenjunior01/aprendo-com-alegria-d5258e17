# Plano faseado

O pedido cobre 6 áreas independentes. Vou entregar em fases para garantir qualidade — cada fase é testável isoladamente.

## Fase 1 — AGORA (esta iteração)

### A) Página de histórico de compras + recibos/faturas
- Novo server function `listUserInvoices` em `src/utils/payments.functions.ts` protegido por `requireSupabaseAuth`:
  - lê `subscriptions.stripe_customer_id` do utilizador (sandbox e live)
  - chama `stripe.invoices.list({ customer })` e `stripe.charges.list({ customer })`
  - devolve `[{ id, date, amount, currency, status, hosted_invoice_url, invoice_pdf, receipt_url, description }]`
- Novo componente `PurchaseHistoryPanel.tsx`:
  - tabela responsiva (mobile-first 390px) com data, descrição, valor, estado
  - botões "Ver recibo" (`receipt_url`) e "Descarregar fatura" (`invoice_pdf`) — abrem em nova aba
  - estados: vazio (nunca comprou), loading, erro
- Integrar em `/pais` (já é o dashboard parental) numa nova secção "Histórico de pagamentos", abaixo do `PremiumStatusPanel`

### B) Ativar gestão fiscal automática (IVA por país)
- Atualizar `createCheckoutSession` para incluir `automatic_tax: { enabled: true }` (opção 2: cálculo + cobrança, +0,5%/transação — tu fazes filing)
  - Decisão: opção 2 e não managed_payments porque os teus produtos estão registados em PT e queres controlo sobre filing
- Set `tax_code` nos 3 produtos via script único (`txcd_10103001` — SaaS/serviços eletrónicos, adequado para subscrição educativa digital)
- Adicionar `customer_update: { address: 'auto' }` e `tax_id_collection: { enabled: true }` para faturas com NIF
- Banner informativo no `/premium`: "Preço inclui IVA do teu país"

## Fases seguintes (iterações dedicadas)

**Fase 2 — Registo leve da criança.** Fluxo onde o pai cria perfis-filho sem email/password (já existe `parent_links` + `profiles`). Página `/pais/criar-perfil` que cria profile com PIN curto, sem fluxo Supabase Auth para a criança.

**Fase 3 — Plano Escolas (0,99€/aluno/mês, mín. 20).** Novo produto Stripe `escola_aluno_mensal` com quantity 20-1000, página `/escolas` com formulário de subscrição por turma, ligação a `schools` + `classes` + `class_members` que já existem.

**Fase 4 — Expansão até 7.ª classe + conteúdo regional.** Auditar `src/lib/curriculum.ts` e `chapters.ts`, adicionar grades 5-7, criar variantes por região (PT/BR/MZ/AO/CV) para Estudo do Meio/Ciências Sociais (história, geografia, cidadania local). Estrutura: `curriculum[grade][subject][region]`. Trabalho de conteúdo pesado — vou pedir-te para validar pelo menos um exemplo por país antes de escalar.

**Fase 5 — PayPal + Clicpay + Vouchers.**
- PayPal: botão separado em `/premium`, server route `/api/public/paypal/webhook` e `/api/paypal/create-order` usando a tua API key (vais precisar de adicionar `PAYPAL_CLIENT_ID` e `PAYPAL_SECRET` como secrets)
- Clicpay (M-Pesa/eMola para MZ): integração via API REST, página de checkout próprio
- Vouchers: tabela `vouchers (code, plan, used_by, expires_at)`, página `/resgatar-codigo`, função admin para gerar lotes

## Detalhes técnicos da Fase 1

```
src/utils/payments.functions.ts
  + listUserInvoices (server fn, requireSupabaseAuth)
  ~ createCheckoutSession (adicionar automatic_tax + tax_id_collection)

src/components/PurchaseHistoryPanel.tsx (novo)
src/routes/pais.tsx (adicionar secção)

scripts/setup-tax-codes.ts (one-shot, atualiza os 3 products no Stripe)
```

Stripe APIs usadas:
- `stripe.invoices.list({ customer, limit: 100 })` — para subscrições
- `stripe.charges.list({ customer, limit: 100 })` — para pagamentos one-time (vitalício)
- `stripe.products.update(id, { tax_code: 'txcd_10103001' })`

Sem alterações de DB nesta fase — `subscriptions.stripe_customer_id` já existe.

## O que NÃO faço nesta iteração

- Fases 2-5 (já mapeadas acima, faço a seguir uma a uma)
- Não toco no curriculum/chapters
- Não adiciono PayPal/Clicpay/vouchers ainda
- Não crio plano Escolas ainda

Confirma e arranco com a Fase 1. Se quiseres trocar a ordem das fases seguintes, diz-me.
