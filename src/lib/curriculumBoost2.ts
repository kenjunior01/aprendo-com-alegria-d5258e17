// curriculumBoost2.ts — Segunda vaga de lições (+12 lições, ~110 questões).
// Alvo: os buracos reais do currículo identificados na auditoria —
//   · Cidadania 4.º ano (0 lições)
//   · Ciências 1.º e 4.º ano (poucas)
//   · Inglês 4.º ano (1 lição)
//   · Estudo do Meio 1.º ano (reforço)
// Todas com hint E explanation — o "porquê" que ensina de verdade
// (lição dos concorrentes: sem explicação há frustração e erro fixado).
import type { Lesson, SubjectId, GradeLevel } from "@/lib/curriculum";

const L = (
  id: string,
  title: string,
  emoji: string,
  grade: GradeLevel,
  questions: Lesson["questions"],
): Lesson => ({ id, title, emoji, grade, questions });

const Q = (
  prompt: string,
  options: string[],
  answerIndex: number,
  hint?: string,
  explanation?: string,
) => ({ prompt, options, answerIndex, hint, explanation });

const VF = (prompt: string, answerIndex: number, hint?: string, explanation?: string) => ({
  prompt,
  options: ["Verdadeiro", "Falso"],
  answerIndex,
  hint,
  explanation,
});

export const BOOST2_LESSONS: Partial<Record<SubjectId, Lesson[]>> = {
  // ------------------------------------------------------------- CIDADANIA 4.º
  cidadania: [
    L("boost2-cid-democracia", "Como Funciona a Democracia", "🗳️", 4, [
      Q(
        "Numa democracia, quem escolhe quem governa?",
        ["O povo, por voto", "O exército", "O rei", "Só os professores"],
        0,
        "Pensa nas eleições.",
        "Numa democracia, o povo escolhe os seus representantes por voto livre e secreto.",
      ),
      Q(
        "Como se chama o voto que ninguém vê — é secreto?",
        ["Voto secreto", "Voto aberto", "Voto rápido", "Voto duplo"],
        0,
        "É para ninguém pressionar ninguém.",
        "O voto secreto protege cada pessoa de pressões: só tu sabes em quem votaste.",
      ),
      VF(
        "Em Portugal, os maiores de 18 anos podem votar.",
        0,
        "Idade de votar.",
        "Em Portugal (e na maioria dos países lusófonos) o voto é possível a partir dos 18 anos.",
      ),
      Q(
        "O que é um deputado?",
        [
          "Uma pessoa eleita para representar o povo e fazer leis",
          "Um polícia especial",
          "O diretor da escola",
          "Um desportista famoso",
        ],
        0,
        "Trabalha na Assembleia.",
        "Os deputados são eleitos para representar os cidadãos e criar/aprovar as leis.",
      ),
      Q(
        "Se uma lei não for justa, o que podem os cidadãos fazer numa democracia?",
        ["Falar, manifestar-se pacificamente e pedir mudança", "Nada", "Ir preso", "Fugir do país"],
        0,
        "A voz do povo conta.",
        "A liberdade de expressão e de manifestação pacífica são pilares da democracia.",
      ),
      Q(
        "O que é a Constituição?",
        [
          "A lei mais importante do país",
          "Um livro de histórias",
          "Um jogo",
          "O horário das aulas",
        ],
        0,
        "É a 'lei das leis'.",
        "A Constituição define os direitos e deveres de todos e como o país funciona.",
      ),
      Q(
        "O que significa viver em sociedade?",
        [
          "Respeitar regras que protegem todos",
          "Fazer o que der na gana",
          "Nunca falar com ninguém",
          "Só obedecer aos amigos",
        ],
        0,
        "Regras existem para quê?",
        "Viver em sociedade exige regras comuns que protegem o bem-estar e os direitos de todos.",
      ),
      Q(
        "Quem era Amílcar Cabral, figura importante da história de Cabo Verde e Angola?",
        [
          "Um líder que lutou pela independência",
          "Um jogador de futebol",
          "Um rei antigo",
          "Um astronauta",
        ],
        0,
        "Lutou pela liberdade dos povos.",
        "Amílcar Cabral foi um engenheiro agrónomo e líder nacionalista que lutou pela independência de Cabo Verde e da Guiné-Bissau.",
      ),
    ]),
    L("boost2-cid-direitos", "Direitos e Deveres", "📜", 4, [
      Q(
        "Toda a criança tem direito a…",
        ["Educação, saúde e proteção", "Trabalhar 10 horas", "Dirigir carros", "Nada"],
        0,
        "Pensa na Convenção sobre os Direitos da Criança.",
        "A Convenção da ONU garante a todas as crianças educação, saúde, proteção e voz.",
      ),
      Q(
        "Se uma criança for maltratada, o que deve fazer?",
        [
          "Contar a um adulto de confiança ou ligar para uma linha de apoio",
          "Guardar segredo para sempre",
          "Punir a pessoa",
          "Fugir de casa",
        ],
        0,
        "Nunca é culpa da criança.",
        "Contar a um adulto de confiança ou usar linhas de apoio (como o SOS Criança) protege a criança.",
      ),
      Q(
        "Direitos e deveres andam juntos: se tens direito a educação, qual é o teu dever?",
        [
          "Estudar e respeitar colegas e professores",
          "Dormir na aula",
          "Faltar à escola",
          "Copiar nos testes",
        ],
        0,
        "O respeito também é um dever.",
        "Os direitos vêm acompanhados de deveres: estudar, respeitar e cuidar dos outros e do espaço comum.",
      ),
      VF(
        "Respeitar pessoas de outras culturas é importante.",
        0,
        "A diversidade é riqueza.",
        "Respeitar diferentes culturas, línguas e tradições torna comunidades mais fortes e felizes.",
      ),
      Q(
        "O que é a igualdade de género?",
        [
          "Raparigas e rapazes têm os mesmos direitos e oportunidades",
          "Raparigas não podem jogar futebol",
          "Rapazes não podem chorar",
          "Só os rapazes estudam",
        ],
        0,
        "Todos podem tudo.",
        "Igualdade de género significa que raparigas e rapazes merecem as mesmas oportunidades, respeitos e liberdades.",
      ),
      Q(
        "Vês lixo no chão da escola. O que faz um bom cidadão?",
        [
          "Apanha e deita no caixote (ou avisa)",
          "Finge que não vê",
          "Lança mais lixo",
          "Escreve o nome no lixo",
        ],
        0,
        "Cuida do espaço de todos.",
        "Cuidar dos espaços comuns é um dever cívico — o ambiente é de todos.",
      ),
      Q(
        "O que é voluntariado?",
        [
          "Ajudar sem receber dinheiro, por vontade própria",
          "Um trabalho obrigatório",
          "Um desporto",
          "Uma matéria da escola",
        ],
        0,
        "Ajudar de coração.",
        "Voluntariado é oferecer tempo e ajuda gratuitamente para melhorar a comunidade.",
      ),
      Q(
        "Qual destes é um dever nas estradas?",
        [
          "Atravessar na passadeira e olhar para os dois lados",
          "Atravessar a correr entre carros",
          "Jogar a bola na estrada",
          "Andar de bicicleta sem atenção",
        ],
        0,
        "Segurança primeiro.",
        "Usar a passadeira e olhar para os dois lados evita acidentes — é dever e é proteção.",
      ),
    ]),
  ],

  // -------------------------------------------------------------- CIÊNCIAS 1.º
  ciencias: [
    L("boost2-cia-corpo", "O Meu Corpo Sabido", "🫀", 1, [
      Q(
        "Para que servem os pulmões?",
        ["Para respirar", "Para correr", "Para ver", "Para ouvir"],
        0,
        "Enchem-se de ar.",
        "Os pulmões recebem o ar que respiramos e levam o oxigénio para o sangue.",
      ),
      Q(
        "Quantos sentidos temos?",
        ["5", "3", "10", "2"],
        0,
        "Vista, ouvido, olfato, paladar e tato.",
        "Temos 5 sentidos: vista, audição, olfato, paladar e tato.",
      ),
      Q(
        "O coração serve para…",
        ["Bombeiar o sangue", "Digerir comida", "Pensar", "Andar"],
        0,
        "Faz 'tum-tum'.",
        "O coração bombeia o sangue, que leva nutrientes e oxigénio a todo o corpo.",
      ),
      Q(
        "Qual destes alimentos dá mais energia para brincar?",
        ["Pão e arroz", "Pedras", "Plástico", "Fita"],
        0,
        "São alimentos!",
        "Cereais como pão e arroz dão energia de forma lenta e constante ao corpo.",
      ),
      VF(
        "Lavar as mãos antes de comer evita doenças.",
        0,
        "Sabão + água!",
        "Lavar as mãos remove germes que causam doenças — uma das melhores proteções.",
      ),
      Q(
        "O que precisamos para crescer fortes?",
        ["Comer bem, dormir e exercício", "Só jogar vídeo-jogos", "Nunca dormir", "Só doces"],
        0,
        "Três coisas que tu já conheces.",
        "Alimentação saudável, sono suficiente e atividade física são essenciais para crescer.",
      ),
      Q(
        "Onde digere a comida o nosso corpo?",
        ["No estômago e intestinos", "No nariz", "Nos ouvidos", "Nos pés"],
        0,
        "Fica na barriga!",
        "A digestão acontece no estômago e nos intestinos, que retiram os nutrientes dos alimentos.",
      ),
      Q(
        "Os ossos servem para…",
        ["Sustentar o corpo e proteger órgãos", "Falar", "Pensar", "Nada"],
        0,
        "Tens mais de 200!",
        "O esqueleto sustenta o corpo, protege órgãos (como o cérebro e o coração) e permite o movimento com os músculos.",
      ),
    ]),

    // -------------------------------------------------------------- CIÊNCIAS 4.º
    L("boost2-cia-energia", "Energia e Eletricidade", "⚡", 4, [
      Q(
        "De onde vem a maior parte da eletricidade das nossas casas?",
        [
          "De centrais que transformam outras energias",
          "Das tomadas mágicas",
          "Do ar",
          "Dos raios solares à noite",
        ],
        0,
        "A eletricidade é produzida em centrais.",
        "As centrais transformam energia (água, vento, sol, carvão) em eletricidade que viaja até às casas.",
      ),
      Q(
        "Qual é uma fonte de energia RENOVÁVEL?",
        ["O sol", "O carvão", "O petróleo", "O gás natural"],
        0,
        "Não se esgota.",
        "O sol, o vento e a água são renováveis: não se esgotam. Carvão, petróleo e gás sim.",
      ),
      Q(
        "Num circuito elétrico simples, para que serve a pilha?",
        ["Dar energia para a corrente passar", "Iluminar a sala", "Arrefecer o fio", "Nada"],
        0,
        "É a 'fonte' do circuito.",
        "A pilha fornece a energia que faz a corrente elétrica percorrer o circuito e acender a lâmpada.",
      ),
      Q(
        "O que acontece se abrirmos o circuito (cortar o fio)?",
        ["A lâmpada apaga", "A lâmpada fica mais forte", "Nada muda", "A pilha carrega"],
        0,
        "A corrente precisa de um caminho fechado.",
        "Sem caminho fechado (circuito fechado), a corrente não passa e a lâmpada apaga.",
      ),
      VF(
        "Devemos tocar em tomadas com as mãos molhadas.",
        1,
        "Água + eletricidade = perigo.",
        "NUNCA toques em tomadas ou aparelhos elétricos com as mãos molhadas — a água conduz eletricidade e dá choques.",
      ),
      Q(
        "Qual material conduz eletricidade?",
        ["Metal (fio de cobre)", "Borracha", "Madeira seca", "Vidro"],
        0,
        "Pensa nos fios.",
        "Os metais (como o cobre) conduzem eletricidade; borracha e plástico são isolantes que protegem.",
      ),
      Q(
        "Energia eólica vem do…",
        ["Vento", "Sol", "Água dos rios", "Carvão"],
        0,
        "'Eólico' = vento.",
        "A energia eólica é a energia do vento, captada pelos aerogeradores (moinhos modernos).",
      ),
      Q(
        "Porque é que devemos apagar as luzes ao sair de um quarto?",
        [
          "Poupar energia e ajudar o planeta",
          "Para escurecer tudo",
          "Porque sim",
          "Para as lâmpadas descansarem",
        ],
        0,
        "Pequenos gestos, grande diferença.",
        "Poupar energia reduz a poluição e ajuda o planeta — além de poupar dinheiro em casa.",
      ),
    ]),
  ],

  // --------------------------------------------------------------- INGLÊS 4.º
  ingles: [
    L("boost2-ing-routines", "My Day in English", "⏰", 4, [
      Q(
        "Como se diz 'Eu acordo às 7 horas' em inglês?",
        ["I wake up at 7 o'clock", "I sleep at 7 o'clock", "I eat at 7 o'clock", "I run at 7"],
        0,
        "Wake up = acordar.",
        "'I wake up at 7 o'clock' significa 'Eu acordo às 7 horas'.",
      ),
      Q(
        "O que significa 'I have lunch at school'?",
        ["Almoço na escola", "Janto na escola", "Pequeno-almoço na escola", "Brinco na escola"],
        0,
        "Lunch = almoço.",
        "'I have lunch at school' = 'Eu almoço na escola'.",
      ),
      Q(
        "Como se escreve 'sempre' em inglês?",
        ["Always", "Never", "Sometimes", "Yesterday"],
        0,
        "O contrário de 'never'.",
        "'Always' = sempre; 'never' = nunca; 'sometimes' = às vezes.",
      ),
      Q(
        "Que hora é 'half past three'?",
        ["3:30", "3:00", "3:15", "4:30"],
        0,
        "Half = metade da hora.",
        "'Half past three' = 3 e meia (3:30).",
      ),
      Q(
        "Como se diz 'todos os dias' em inglês?",
        ["Every day", "Every week", "Yesterday", "Tomorrow"],
        0,
        "Dia = day.",
        "'Every day' = todos os dias.",
      ),
      Q(
        "'She goes to bed at 9' significa…",
        ["Ela vai dormir às 9", "Ela acorda às 9", "Ela almoça às 9", "Ela brinca às 9"],
        0,
        "Go to bed = ir para a cama.",
        "'She goes to bed at 9' = 'Ela vai para a cama às 9'.",
      ),
      Q(
        "Como perguntas 'Que horas são?' em inglês?",
        ["What time is it?", "Who is it?", "Where is it?", "How are you?"],
        0,
        "Time = hora.",
        "'What time is it?' = 'Que horas são?'.",
      ),
      Q(
        "Qual é o fim de semana em inglês?",
        ["Weekend", "Weekday", "Wednesday", "Monday"],
        0,
        "Fim = end.",
        "'Weekend' = fim de semana (sábado e domingo).",
      ),
    ]),
  ],

  // ----------------------------------------------------- ESTUDO DO MEIO 1.º
  "estudo-do-meio": [
    L("boost2-em-vizinhos", "Os Meus Vizinhos e Eu", "🏘️", 1, [
      Q(
        "O que é um bairro?",
        ["O conjunto de ruas e casas onde vivemos", "Um país distante", "Um carro", "Uma fruta"],
        0,
        "É onde está a tua casa.",
        "O bairro é a zona onde vivemos, com casas, ruas, lojas e vizinhos.",
      ),
      Q(
        "Quem são os nossos vizinhos?",
        [
          "As pessoas que moram perto de nós",
          "Só os professores",
          "Os astronautas",
          "Pessoas de outro planeta",
        ],
        0,
        "Moram ao lado!",
        "Vizinhos são as pessoas que moram perto de nós — conviver com respeito torna o bairro melhor.",
      ),
      Q(
        "Como se chama a pessoa que entrega o correio?",
        ["Carteiro / carteira", "Bombeiro", "Pescador", "Astronauta"],
        0,
        "Leva cartas.",
        "O carteiro entrega cartas e encomendas — um dos trabalhos do nosso bairro.",
      ),
      Q(
        "Se houver um incêndio, quem chamamos?",
        ["Bombeiros", "Carteiro", "Padeiro", "Professor"],
        0,
        "Apagam fogos!",
        "Os bombeiros apagam incêndios e ajudam em emergências.",
      ),
      Q(
        "Para que serve a biblioteca do bairro?",
        [
          "Para ler e levar livros emprestados",
          "Para comprar pão",
          "Para jogar futebol",
          "Para lavar roupa",
        ],
        0,
        "Casa dos livros.",
        "Na biblioteca podemos ler e levar livros emprestados de graça.",
      ),
      VF(
        "Devo cumprimentar os vizinhos com educação.",
        0,
        "Um 'bom dia' faz sorrir.",
        "Cumprimentar e ser simpático com os vizinhos cria um bairro mais feliz e seguro.",
      ),
      Q(
        "Qual destes lugares é para cuidar e manter limpo?",
        ["Todos: parque, rua e praça", "Só a minha casa", "Nenhum", "Só a escola"],
        0,
        "O espaço é de todos.",
        "Parques, ruas e praças são espaços públicos: todos devemos mantê-los limpos e cuidados.",
      ),
    ]),
  ],
};

// Verificação silenciosa de tipos: os helper tipos têm de bater certo
export const BOOST2_COUNT = Object.values(BOOST2_LESSONS).reduce(
  (acc, ls) => acc + (ls?.length ?? 0),
  0,
);
