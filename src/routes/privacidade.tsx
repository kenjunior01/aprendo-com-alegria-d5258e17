import { createFileRoute, Link } from "@tanstack/react-router";
import { RouteError } from "@/components/RouteError";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Kidoz" },
      { name: "description", content: "Política de privacidade do Kidoz: como recolhemos, tratamos e protegemos os dados dos nossos utilizadores e crianças." },
      { property: "og:title", content: "Política de Privacidade — Kidoz" },
      { property: "og:description", content: "Política de privacidade do Kidoz: como recolhemos, tratamos e protegemos os dados dos nossos utilizadores e crianças." },
      { property: "og:url", content: "https://kidoz.online/privacidade" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
    ],
    links: [
      { rel: "canonical", href: "https://kidoz.online/privacidade" },
    ],
  }),
  component: PrivacidadePage,
  errorComponent: RouteError,
});

function PrivacidadePage() {
  return (
    <main id="main-content" className="min-h-[100dvh] bg-background pb-12 pt-6">
      <div className="mx-auto max-w-[56rem] px-4 sm:px-6">
        <h1 className="font-display text-3xl sm:text-4xl">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: 4 de março de 2025
        </p>

        {/* 1. Responsável pelo tratamento */}
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl">1. Responsável pelo tratamento</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            O responsável pelo tratamento dos dados pessoais no âmbito da plataforma Kidoz é:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-foreground/90">
            <li><strong>Entidade:</strong> Kidoz</li>
            <li><strong>Contacto:</strong> <a href="mailto:info@kidoz.online" className="text-primary underline">info@kidoz.online</a></li>
          </ul>
        </section>

        {/* 2. Dados que recolhemos */}
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl">2. Dados que recolhemos</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            Recolhemos apenas os dados estritamente necessários para o funcionamento da plataforma:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/90">
            <li><strong>Dados de conta:</strong> nome e endereço de correio eletrónico do responsável familiar.</li>
            <li><strong>Dados de utilização:</strong> progresso nas lições, tempo gasto, respostas dadas e sequência de uso.</li>
            <li><strong>Dados do dispositivo:</strong> tipo de navegador, sistema operativo e resolução do ecrã (para garantir compatibilidade).</li>
            <li><strong>Dados fornecidos pelo responsável:</strong> PIN parental, limites de tempo diário e hora de dormir configurados.</li>
          </ul>
        </section>

        {/* 3. Finalidade do tratamento */}
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl">3. Finalidade do tratamento</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            Os dados pessoais são tratados para as seguintes finalidades:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/90">
            <li>Prestar o serviço educativo Kidoz e garantir o seu funcionamento adequado.</li>
            <li>Personalizar a aprendizagem de cada criança com base no seu progresso e nível.</li>
            <li>Garantir o cumprimento da COPPA (Children's Online Privacy Protection Act) e do RGPD.</li>
            <li>Comunicar com os responsáveis familiares sobre o progresso e atualizações do serviço.</li>
          </ul>
        </section>

        {/* 4. Base legal */}
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl">4. Base legal</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            O tratamento dos dados pessoais baseia-se nas seguintes bases legais, conforme o RGPD:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/90">
            <li><strong>Consentimento</strong> — para o tratamento de dados das crianças, obtido junto do responsável familiar.</li>
            <li><strong>Execução do contrato</strong> — para prestar o serviço subscrito pelo utilizador.</li>
            <li><strong>Interesse legítimo</strong> — para melhorar a plataforma, garantir a segurança e prevenir fraudes.</li>
          </ul>
        </section>

        {/* 5. Partilha de dados */}
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl">5. Partilha de dados</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            Os dados pessoais não são partilhados com terceiros exceto nas seguintes situações:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/90">
            <li><strong>Supabase</strong> — prestador de alojamento e base de dados, com servidores na União Europeia, que atua como subresponsável pelo tratamento.</li>
            <li><strong>Venda de dados:</strong> o Kidoz <strong>não vende</strong> dados pessoais a terceiros, sob qualquer circunstância.</li>
            <li><strong>Publicidade:</strong> o Kidoz <strong>não exibe publicidade</strong> nem partilha dados para fins publicitários.</li>
          </ul>
        </section>

        {/* 6. Retenção de dados */}
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl">6. Retenção de dados</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            Os dados pessoais são mantidos durante o período em que a conta se encontra ativa e até 30 dias após o pedido de eliminação. Após este prazo, todos os dados são eliminados de forma segura e irreversível.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            O responsável familiar pode solicitar a eliminação antecipada de todos os dados através de <a href="mailto:info@kidoz.online" className="text-primary underline">info@kidoz.online</a>.
          </p>
        </section>

        {/* 7. Direitos dos titulares */}
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl">7. Direitos dos titulares</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            Nos termos do RGPD, os titulares dos dados têm os seguintes direitos:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/90">
            <li><strong>Acesso</strong> — solicitar informação sobre os dados pessoais tratados.</li>
            <li><strong>Retificação</strong> — corrigir dados incorretos ou incompletos.</li>
            <li><strong>Eliminação</strong> — solicitar a remoção dos dados pessoais («direito ao esquecimento»).</li>
            <li><strong>Portabilidade</strong> — receber os dados num formato estruturado e de uso corrente.</li>
            <li><strong>Oposição</strong> — opor-se ao tratamento dos dados em determinadas circunstâncias.</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            Para exercer qualquer destes direitos, contacte-nos através de <a href="mailto:info@kidoz.online" className="text-primary underline">info@kidoz.online</a>.
          </p>
        </section>

        {/* 8. Crianças (COPPA/RGPD) */}
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl">8. Crianças (COPPA / RGPD)</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            O Kidoz é uma plataforma dirigida a crianças em idade escolar. Por isso, aplicamos medidas adicionais de proteção:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/90">
            <li><strong>Consentimento parental:</strong> é obrigatório o consentimento do responsável familiar para o registo e tratamento de dados de menores de 13 anos (COPPA) e de menores de 16 anos (RGPD, art.º 8).</li>
            <li><strong>Porta de idade:</strong> o Kidoz implementa uma verificação de idade que impede o acesso direto de menores sem autorização parental.</li>
            <li><strong>Sem perfilamento para anúncios:</strong> não realizamos qualquer tipo de perfilamento ou rastreamento para fins publicitários.</li>
            <li><strong>Minimização de dados:</strong> recolhemos apenas os dados estritamente necessários para a prestação do serviço educativo.</li>
          </ul>
        </section>

        {/* 9. Cookies */}
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl">9. Cookies</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            O Kidoz utiliza cookies da seguinte forma:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/90">
            <li><strong>Cookies essenciais:</strong> ativados por predefinição, são necessários para o funcionamento básico da plataforma (autenticação, preferências de idioma).</li>
            <li><strong>Cookies de análise:</strong> ativados apenas com o consentimento do utilizador, servem para compreender padrões de uso e melhorar a experiência (consulte o banner de consentimento de cookies).</li>
          </ul>
        </section>

        {/* 10. Alterações */}
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl">10. Alterações a esta política</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            O Kidoz reserva-se o direito de atualizar esta política de privacidade a qualquer momento. As alterações serão publicadas nesta página com a data de última atualização.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            Recomendamos a consulta periódica desta página para se manter informado sobre como protegemos os seus dados.
          </p>
        </section>

        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <Link to="/termos" className="text-primary underline">Termos de Utilização</Link>
          {" · "}
          <Link to="/ajuda" className="text-primary underline">Ajuda</Link>
          {" · "}
          <Link to="/app" className="text-primary underline">Voltar ao Kidoz</Link>
        </div>
      </div>
    </main>
  );
}
