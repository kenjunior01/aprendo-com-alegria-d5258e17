import { createFileRoute, Link } from "@tanstack/react-router";
import { RouteError } from "@/components/RouteError";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Utilização — Kidoz" },
      { name: "description", content: "Termos de utilização da plataforma educativa Kidoz: condições de uso, registo, propriedade intelectual e resolução de litígios." },
      { property: "og:title", content: "Termos de Utilização — Kidoz" },
      { property: "og:description", content: "Termos de utilização da plataforma educativa Kidoz: condições de uso, registo, propriedade intelectual e resolução de litígios." },
      { property: "og:url", content: "https://kidoz.online/termos" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/acc7c5c1-6f57-466a-a906-520c14783216" },
    ],
    links: [
      { rel: "canonical", href: "https://kidoz.online/termos" },
    ],
  }),
  component: TermosPage,
  errorComponent: RouteError,
});

function TermosPage() {
  return (
    <main id="main-content" className="min-h-[100dvh] bg-background pb-12 pt-6">
      <div className="mx-auto max-w-[56rem] px-4 sm:px-6">
        <h1 className="font-display text-3xl sm:text-4xl">Termos de Utilização</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: 4 de março de 2025
        </p>

        {/* 1. Aceitação */}
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl">1. Aceitação dos termos</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            Ao aceder e utilizar a plataforma Kidoz, o utilizador declara ter lido, compreendido e aceitado os presentes Termos de Utilização na sua integralidade. Caso não concorde com qualquer parte destes termos, deverá cessar imediatamente a utilização do serviço.
          </p>
        </section>

        {/* 2. Descrição do serviço */}
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl">2. Descrição do serviço</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            O Kidoz é uma plataforma educativa digital destinada a alunos do 1.º ciclo do ensino básico em Portugal e países lusófonos. O serviço inclui lições interativas de Português, Matemática e Estudo do Meio, jogos educativos, um tutor inteligente (Mocha IA), realidade aumentada e ferramentas de acompanhamento para responsáveis familiares e educadores.
          </p>
        </section>

        {/* 3. Registo */}
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl">3. Registo</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            Para crianças menores de 13 anos, o registo na plataforma deve ser efetuado por um responsável familiar (pai, mãe ou tutor legal). O responsável familiar é o titular da conta e consente o tratamento dos dados da criança nos termos da política de privacidade do Kidoz.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            O responsável familiar é responsável por manter a confidencialidade das suas credenciais de acesso e por toda a atividade realizada através da sua conta.
          </p>
        </section>

        {/* 4. Utilização aceitável */}
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl">4. Utilização aceitável</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            O Kidoz destina-se exclusivamente a fins educativos. O utilizador compromete-se a:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-foreground/90">
            <li>Utilizar a plataforma apenas para aprendizagem e ensino.</li>
            <li>Não partilhar as credenciais de acesso com terceiros.</li>
            <li>Não utilizar a plataforma de forma que possa danificar, desativar ou sobrecarregar os sistemas do Kidoz.</li>
            <li>Não contornar os controlos parentais ou as medidas de segurança implementadas.</li>
          </ul>
        </section>

        {/* 5. Conteúdo */}
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl">5. Conteúdo</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            Todo o conteúdo educativo disponibilizado na plataforma é propriedade do Kidoz e encontra-se alinhado com o currículo do 1.º ciclo do ensino básico definido pelo Ministério da Educação de Portugal. O conteúdo inclui, mas não se limita a, lições, exercícios, jogos, imagens, sons e textos explicativos.
          </p>
        </section>

        {/* 6. Limitação de responsabilidade */}
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl">6. Limitação de responsabilidade</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            O serviço é fornecido «tal como se encontra», sem garantias de qualquer tipo, expressas ou implícitas. O Kidoz não garante que o serviço estará ininterruptamente disponível, livre de erros ou que satisfará os requisitos específicos do utilizador.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            O Kidoz não se responsabiliza por quaisquer danos diretos, indiretos, incidentais ou consequentes resultantes da utilização ou impossibilidade de utilização do serviço.
          </p>
        </section>

        {/* 7. Propriedade intelectual */}
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl">7. Propriedade intelectual</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            Todos os direitos de propriedade intelectual relativos à plataforma Kidoz, incluindo, mas não se limitando a, textos, gráficos, logótipos, ícones, imagens, clipes áudio, software e compilação de dados, são propriedade exclusiva do Kidoz ou dos seus licenciadores.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            É proibida a reprodução, distribuição, modificação ou utilização comercial de qualquer conteúdo da plataforma sem autorização prévia e expressa do Kidoz.
          </p>
        </section>

        {/* 8. Resolução de litígios */}
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl">8. Resolução de litígios</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            Os presentes Termos de Utilização são regidos e interpretados de acordo com a lei portuguesa. Para a resolução de qualquer litígio emergente destes termos, as partes elegem o foro dos tribunais da Comarca de Lisboa, com renúncia a qualquer outro.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            Antes de recorrer aos tribunais, as partes comprometem-se a tentar a resolução do litígio através de arbitragem, nos termos da lei portuguesa.
          </p>
        </section>

        {/* 9. Alterações */}
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl">9. Alterações aos termos</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            O Kidoz reserva-se o direito de alterar estes Termos de Utilização a qualquer momento, mediante aviso prévio de 30 dias. As alterações serão comunicadas através da plataforma ou por correio eletrónico.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            A continuação da utilização da plataforma após a entrada em vigor das alterações constitui aceitação dos novos termos.
          </p>
        </section>

        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <Link to="/privacidade" className="text-primary underline">Política de Privacidade</Link>
          {" · "}
          <Link to="/ajuda" className="text-primary underline">Ajuda</Link>
          {" · "}
          <Link to="/app" className="text-primary underline">Voltar ao Kidoz</Link>
        </div>
      </div>
    </main>
  );
}
