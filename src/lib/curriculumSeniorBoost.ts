// curriculumSeniorBoost.ts — 2.ª ronda do 5.º e 6.º ano (senior boost):
// aprofunda Estudo do Meio, Ciências, Cidadania e Inglês com 4 lições
// por matéria (16 no total, 96 perguntas) — entram no fim do caminho de
// aprendizagem de cada matéria e, via triviaSenior.ts, no Duelo da
// Família e no Quiz Relâmpago (idades 10–12).
//
// Convenção (igual ao curriculumSenior.ts): MCQ com resposta certa em
// answerIndex 0 (o runtime baralha com shuffleMcqOptions); VF mantém
// options fixos (0 = Verdadeiro, 1 = Falso). hint + explanation sempre.
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
  answerIndex = 0,
  hint?: string,
  explanation?: string,
) => ({ prompt, options, answerIndex, hint, explanation });

const VF = (prompt: string, answerIndex: number, hint?: string, explanation?: string) => ({
  prompt,
  options: ["Verdadeiro", "Falso"],
  kind: "truefalse" as const,
  answerIndex,
  hint,
  explanation,
});

export const SENIOR_BOOST_LESSONS: Partial<Record<SubjectId, Lesson[]>> = {
  // ═══ ESTUDO DO MEIO ═══════════════════════════════════════════════════════
  "estudo-do-meio": [
    L("edm-mapas", "Mapas e Direções", "🧭", 5, [
      Q(
        "No mapa, a rosa dos ventos mostra…",
        [
          "os pontos cardeais: Norte, Sul, Este e Oeste",
          "a temperatura de cada lugar",
          "o nome das estradas",
          "quantas pessoas vivem em cada casa",
        ],
        0,
        "É um desenho com setas; a maior aponta para o Norte.",
        "A rosa dos ventos orienta-nos no mapa: mostra para onde fica o Norte, o Sul, o Este e o Oeste.",
      ),
      Q(
        "A escala de um mapa serve para…",
        [
          "saber a distância real entre dois lugares",
          "colorir o mapa mais bonito",
          "escrever o título do mapa",
          "contar a população de um país",
        ],
        0,
        "1 cm no papel pode representar 1 km na vida real.",
        "A escala compara o tamanho do desenho com o mundo real: ajuda a medir distâncias sem as percorrer.",
      ),
      Q(
        "O Equador passa por São Tomé e Príncipe, no ilhéu das Rolas. O Equador é…",
        [
          "a linha imaginária que divide a Terra ao meio",
          "a montanha mais alta de África",
          "o nome de um vento muito frio",
          "a fronteira entre dois países vizinhos",
        ],
        0,
        "Divide o planeta em hemisfério Norte e hemisfério Sul.",
        "O Equador é a linha de latitude 0. No ilhéu das Rolas há um marco que assinala a sua passagem.",
      ),
      Q(
        "Se, num mapa, o Norte fica apontando para cima, o Sul fica…",
        ["para baixo", "para cima", "à direita", "à esquerda"],
        0,
        "Norte e Sul são lados opostos.",
        "O Sul é o ponto cardeal oposto ao Norte; o Este (nascer do Sol) fica à direita e o Oeste à esquerda.",
      ),
      VF(
        "A legenda de um mapa explica o que significam os símbolos e as cores.",
        0,
        "É a chave para ler o mapa.",
        "Sem a legenda, não sabíamos se uma linha é um rio, uma estrada ou uma fronteira.",
      ),
      VF(
        "Num mapa, o Este fica sempre do lado esquerdo.",
        1,
        "Lembra-te de onde nasce o Sol.",
        "O Este é o lado por onde o Sol nasce; nos mapas convencionais fica à direita.",
      ),
    ]),
    L("edm-saude", "Saúde em Equilíbrio", "🥗", 5, [
      Q(
        "Quantas horas de sono precisa uma criança em idade escolar?",
        [
          "entre 9 e 11 horas por noite",
          "entre 3 e 4 horas por noite",
          "15 horas todas as noites",
          "dormir não é importante",
        ],
        0,
        "Cedo para a cama, cedo para cima!",
        "Dormir 9 a 11 horas ajuda o corpo a crescer e o cérebro a guardar o que se aprendeu no dia.",
      ),
      Q(
        "Quantas vezes por dia devemos escovar os dentes?",
        [
          "pelo menos duas vezes: de manhã e antes de dormir",
          "uma vez por semana é suficiente",
          "só nos dias em que comemos doces",
          "dez vezes seguidas, sem parar",
        ],
        0,
        "Duas escovadas: uma ao levantar, outra antes de dormir.",
        "Escovar de manhã e antes de dormir tira as bactérias que atacam o esmalte dos dentes.",
      ),
      Q(
        "Qual destes lanches é o mais saudável?",
        [
          "uma manga fresca",
          "bolachas com refrigerante",
          "gomas e rebuçados",
          "batatas fritas de pacote",
        ],
        0,
        "É uma fruta que cresce nas nossas terras.",
        "A fruta fresca dá vitaminas, fibras e energia de qualidade — e há tantas nas nossas feiras!",
      ),
      Q(
        "Para manter o corpo saudável, todos os dias devemos…",
        [
          "beber água potável e mexer o corpo",
          "ver televisão muitas horas seguidas",
          "ficar acordado até muito tarde",
          "comer apenas doces e salgados",
        ],
        0,
        "Duas coisas: uma para beber, outra para fazer.",
        "Água potável hidrata o corpo e a atividade física fortalece músculos, coração e ânimo.",
      ),
      VF(
        "Lavar as mãos com água e sabão antes de comer evita muitas doenças.",
        0,
        "As mãos carregam germes invisíveis.",
        "As mãos tocam em tudo; lavá-las antes de comer e depois de usar a latrina corta o caminho dos germes.",
      ),
      VF(
        "Podemos passar dias inteiros sem beber água.",
        1,
        "O nosso corpo é maioritariamente água.",
        "O corpo precisa de água todos os dias para funcionar: perdemos água ao suar, respirar e urinar.",
      ),
    ]),
    L("edm-global", "Um Mundo Ligado", "🌐", 6, [
      Q(
        "Um país EXPORTA um produto quando…",
        [
          "vende esse produto para outros países",
          "compra esse produto a outros países",
          "esconde o produto nos armazéns",
          "o oferece de graça aos vizinhos",
        ],
        0,
        "EX = para fora.",
        "Exportar é vender para fora do país; importar é comprar o que vem de fora.",
      ),
      Q(
        "O cacau que dá origem ao chocolate cresce em países de clima quente e húmido, como…",
        [
          "São Tomé e Príncipe e a Costa do Marfim",
          "a Noruega e a Islândia",
          "o deserto do Saara",
          "a Gronelândia",
        ],
        0,
        "Precisa de calor, chuva e sombra de árvores grandes.",
        "O cacau é um produto tropical: grande parte do cacau do mundo é cultivado em África Ocidental.",
      ),
      Q(
        "IMPORTAR é…",
        [
          "comprar produtos que vêm de outros países",
          "vender produtos para outros países",
          "esconder as mercadorias da alfândega",
          "proibir as feiras e os mercados",
        ],
        0,
        "IM = para dentro.",
        "Importamos o que não produzimos ou o que falta no país: máquinas, medicamentos, certos alimentos…",
      ),
      Q(
        "Que produtos das nossas terras viajam até às mesas do mundo inteiro?",
        ["café, cacau e caju", "neve e gelo eterno", "animais do Ártico", "areia da Lua"],
        0,
        "Três produtos que se cultivam e colhem aqui.",
        "Café, cacau e caju são exportações importantes dos nossos países — da plantação até muito longe.",
      ),
      VF(
        "Hoje, com a internet, uma notícia de um país chega ao mundo inteiro em segundos.",
        0,
        "O mundo está mais ligado do que nunca.",
        "Telefones, satélites e internet ligam pessoas e países em tempo real: é o mundo globalizado.",
      ),
      VF(
        "Os países trocam produtos, ideias e culturas todos os dias.",
        0,
        "Do filme ao alimento, do remédio à música.",
        "Comércio, viagens e internet fazem circular bens e culturas: nenhum país vive sozinho.",
      ),
    ]),
    L("edm-populacao", "Populações em Movimento", "🧑‍🤝‍🧑", 6, [
      Q(
        "Chamamos MIGRAÇÃO quando as pessoas…",
        [
          "mudam de lugar para viver noutro, por tempo longo ou para sempre",
          "fazem uma viagem de férias e voltam a casa",
          "mudam de sala dentro da mesma escola",
          "vão passar o fim de semana na aldeia",
        ],
        0,
        "Migrar = mudar de casa para outra terra.",
        "Migração é a mudança de lugar de morada: por trabalho, estudo, família, saúde ou segurança.",
      ),
      Q(
        "Porque é que muitas famílias mudam do campo para a cidade?",
        [
          "para trabalhar e estudar: há mais escolas, hospitais e empregos",
          "porque nas cidades não existem carros",
          "porque as casas nas cidades são todas grátis",
          "porque o campo fica sempre muito longe do mar",
        ],
        0,
        "Procuram oportunidades e serviços.",
        "O êxodo rural leva famílias para as cidades, que concentram serviços — e também grandes desafios.",
      ),
      Q(
        "As pessoas que fogem do seu país por guerra ou perseguição chamam-se…",
        ["refugiadas", "turistas", "pescadoras", "engenheiras"],
        0,
        "Procuram proteção e segurança noutro país.",
        "Refugiadas são pessoas obrigadas a fugir; o direito internacional protege-as e acolhe-as.",
      ),
      Q(
        "A população de uma cidade é…",
        [
          "o número de pessoas que vive nela",
          "o número de escolas que tem",
          "a quantidade de chuva que cai",
          "o tamanho do mercado central",
        ],
        0,
        "Conta-se em pessoas, não em edifícios.",
        "A população é o conjunto de habitantes; os censos contam-nos para planear escolas e hospitais.",
      ),
      VF(
        "Migrar faz parte da história da humanidade desde sempre.",
        0,
        "As pessoas sempre procuraram melhores condições de vida.",
        "Da pré-história a hoje, grupos humanos moveram-se pelo planeta: migrar é antigo e humano.",
      ),
      VF(
        "Quem migra deixa de gostar da sua terra natal.",
        1,
        "Leva consigo a língua, a comida e a música.",
        "Migrar não apaga as raízes: levar a própria cultura para onde chegamos é uma riqueza.",
      ),
    ]),
  ],

  // ═══ CIÊNCIAS ═════════════════════════════════════════════════════════════
  ciencias: [
    L("ci-ecossistemas", "Ecossistemas em Equilíbrio", "🌿", 5, [
      Q(
        "Na cadeia alimentar, os PRODUTORES são…",
        [
          "as plantas, que fazem o seu próprio alimento com a luz do Sol",
          "os leões e as águias",
          "os fungos e as bactérias do solo",
          "as pedras e a água",
        ],
        0,
        "Usam a fotossíntese para criar energia.",
        "Os produtores (plantas e algas) transformam a luz do Sol em alimento; todos os outros dependem deles.",
      ),
      Q(
        "Nesta cadeia alimentar — capim → gafanhoto → rã → cobra — quem é o consumidor primário?",
        ["o gafanhoto", "o capim", "a rã", "a cobra"],
        0,
        "É o primeiro animal que come a planta.",
        "O consumidor primário come o produtor: o gafanhoto come o capim; a rã come o gafanhoto, e por aí adiante.",
      ),
      Q(
        "O habitat de um animal é…",
        [
          "o lugar onde encontra comida, água e abrigo",
          "o seu nome científico",
          "a sua coleção num museu",
          "o alimento que prefere",
        ],
        0,
        "É a 'casa' onde a espécie vive bem.",
        "O habitat é o ambiente com as condições de vida da espécie: lagoa, floresta, mangal, savana…",
      ),
      Q(
        "O que aconteceria se as abelhas polinizadoras desaparecessem?",
        [
          "muitas plantas deixariam de dar frutos e sementes",
          "as plantas passariam a produzir o dobro",
          "nada mudaria no campo",
          "as frutas ficariam mais doces",
        ],
        0,
        "Sem polinizar, não há fruto.",
        "As abelhas transportam pólen entre as flores; sem elas, muitas culturas e plantas silvestres não se reproduzem.",
      ),
      VF(
        "Num ecossistema, cada ser vivo tem um papel importante.",
        0,
        "Do maior ao mais pequeno.",
        "Produtores, consumidores e decompositores formam uma rede: se uma peça falta, todo o equilíbrio sente-se.",
      ),
      VF(
        "Cortar todas as árvores de uma floresta não afeta os animais que lá vivem.",
        1,
        "Pensa nos ninhos e na sombra.",
        "O desmatamento destrói abrigo e alimento de milhares de espécies — e muda o clima do próprio lugar.",
      ),
    ]),
    L("ci-micro", "O Mundo dos Micróbios", "🔬", 5, [
      Q(
        "Os microrganismos são seres vivos…",
        [
          "tão pequenos que só se veem com um microscópio",
          "que vivem apenas no gelo dos polos",
          "todos perigosos para as pessoas",
          "que têm quatro patas e antenas",
        ],
        0,
        "MICRO = muito, muito pequeno.",
        "Bactérias, vírus e fungos microscópicos existem em toda a parte: no ar, no solo, na água e no nosso corpo.",
      ),
      Q(
        "Que microrganismo faz a massa do pão crescer?",
        ["a levedura", "o vírus da gripe", "o plâncton do mar", "o líquen das pedras"],
        0,
        "É um fungo usado desde os tempos dos nossos bisavós.",
        "A levedura liberta gás dentro da massa; as bolhas de gás fazem o pão ficar fofo.",
      ),
      Q(
        "Qual destes hábitos ajuda a parar a propagação dos germes?",
        [
          "lavar bem as mãos com água e sabão",
          "comer fruta já mordida por outra pessoa",
          "beber água não tratada do rio",
          "nunca cortar as unhas",
        ],
        0,
        "Sabão + água + atrito = germes embora.",
        "Lavar as mãos tira muitos germes; também cobrir a boca ao tossir e beber água tratada protege a saúde.",
      ),
      Q(
        "As bactérias são…",
        [
          "seres vivos formados por uma só célula; algumas úteis, outras causam doenças",
          "sempre más e perigosas",
          "animais minúsculos com oito patas",
          "pedaços de poeira que voam",
        ],
        0,
        "No iogurte há bactérias boas!",
        "Há bactérias que ajudam (iogurte, digestão, decomposição) e bactérias que causam doenças: conhecimento é proteção.",
      ),
      VF(
        "A vacina treina o corpo para se defender de certas doenças.",
        0,
        "Ensina o sistema imunitário antes do perigo chegar.",
        "A vacina apresenta ao corpo uma versão inofensiva do micróbio; o corpo aprende a reagir depressa se um dia o encontrar.",
      ),
      VF(
        "Todos os micróbios causam doenças.",
        1,
        "De onde vem o iogurte? E o pão?",
        "Muitos micróbios são aliados: fazem o pão crescer, transformam leite em iogurte e reciclam a matéria na natureza.",
      ),
    ]),
    L("ci-universo", "O Universo e as Estrelas", "🌌", 6, [
      Q(
        "A estrela mais próxima da Terra é…",
        ["o Sol", "a Lua", "a Estrela do Norte", "o planeta Marte"],
        0,
        "É ela que aquece o nosso dia.",
        "O Sol é uma estrela: tem luz própria e está a ~150 milhões de km de nós. A Lua não é estrela — reflete a luz solar.",
      ),
      Q(
        "A Terra dá uma volta completa sobre si mesma em…",
        [
          "cerca de 24 horas — por isso há dia e noite",
          "um ano inteiro",
          "um mês lunar",
          "sete dias e sete noites",
        ],
        0,
        "Rotação = girar sobre si mesma.",
        "A rotação da Terra dura ~24 horas: enquanto o nosso lado olha para o Sol é dia; do outro lado, é noite.",
      ),
      Q(
        "A translação da Terra em torno do Sol dura…",
        ["cerca de 365 dias — um ano", "24 horas", "12 horas", "um segundo"],
        0,
        "TRANSLAÇÃO = dar a volta em torno do Sol.",
        "A Terra demora ~365 dias a percorrer a sua órbita: é o nosso ano, que traz as estações com a inclinação do planeta.",
      ),
      Q(
        "O Sistema Solar é formado por…",
        [
          "o Sol e todos os corpos que giram em sua volta, como os 8 planetas",
          "todas as galáxias do universo",
          "apenas a Terra e a Lua",
          "as estrelas já apagadas",
        ],
        0,
        "Tudo gira em torno de uma estrela.",
        "O Sistema Solar tem o Sol no centro e, em sua volta, 8 planetas, luas, asteroides e cometas.",
      ),
      VF(
        "A Lua é um satélite natural da Terra.",
        0,
        "Gira em volta do nosso planeta.",
        "A Lua orbita a Terra e ilumina-nos de noite refletindo a luz do Sol — por isso é um satélite natural.",
      ),
      VF(
        "Os planetas produzem luz própria, tal como as estrelas.",
        1,
        "Vê-los à noite: brilham, mas com luz alheia.",
        "As estrelas têm luz própria (o Sol é estrela); os planetas só refletem a luz que recebem do Sol.",
      ),
    ]),
    L("ci-eletricidade", "Eletricidade e Circuitos", "⚡", 6, [
      Q(
        "Para a lâmpada acender num circuito simples, o circuito precisa de estar…",
        ["fechado", "aberto", "molhado", "sem pilha"],
        0,
        "A corrente precisa de um caminho completo.",
        "Num circuito fechado, a corrente circula da pilha até à lâmpada e volta; se está aberto, a corrente não passa.",
      ),
      Q(
        "Qual destes materiais conduz eletricidade?",
        [
          "o fio de cobre",
          "o elástico de borracha",
          "a vara de madeira seca",
          "o copo de plástico",
        ],
        0,
        "É um metal.",
        "Os metais (cobre, alumínio, ferro) são bons condutores; borracha, plástico e madeira seca são isolantes.",
      ),
      Q(
        "O interruptor (chave) de um circuito serve para…",
        [
          "abrir e fechar o circuito, ligando e desligando",
          "aumentar a força da pilha",
          "arrefecer os fios de cobre",
          "pintar a lâmpada de outra cor",
        ],
        0,
        "É uma 'porta' no caminho da corrente.",
        "Abrir o interruptor interrompe o caminho da corrente; fechá-lo completa o circuito e a lâmpada acende.",
      ),
      Q(
        "Durante uma trovoada, o mais seguro é…",
        [
          "ficar dentro de casa, longe das janelas e dos fios",
          "subir à árvore mais alta do bairro",
          "banhar-se no rio para refrescar",
          "segurar num varão de metal comprido",
        ],
        0,
        "Metal, água e altura atraem o perigo.",
        "O raio procura o caminho mais fácil: lugares altos, árvores isoladas e metais são perigosos. Casa abriga.",
      ),
      VF(
        "Nunca devemos mexer em aparelhos elétricos com as mãos molhadas.",
        0,
        "A água conduz a eletricidade.",
        "Com as mãos molhadas, a corrente pode passar pelo nosso corpo: secar bem as mãos antes é regra de segurança.",
      ),
      VF(
        "Um circuito aberto deixa a corrente elétrica passar.",
        1,
        "Pensa numa ponte cortada a meio.",
        "Circuito aberto tem o caminho interrompido: a corrente para. É exatamente assim que funciona a lâmpada da sala.",
      ),
    ]),
  ],

  // ═══ CIDADANIA ════════════════════════════════════════════════════════════
  cidadania: [
    L("cid-comunidade", "Viver em Comunidade", "🏘️", 5, [
      Q(
        "Uma comunidade é…",
        [
          "um grupo de pessoas que vive no mesmo lugar e se ajuda",
          "apenas a família de uma pessoa",
          "uma equipa de futebol só de campeões",
          "um grande barulho na praça",
        ],
        0,
        "Bairro, aldeia, bairro-mãe… todos formam comunidades.",
        "Na comunidade, pessoas diferentes partilham lugares, regras e ajudas: escola, mercado, poço, praça.",
      ),
      Q(
        "As regras da comunidade servem para…",
        [
          "todos viverem com segurança e respeito",
          "prejudicar quem chega de fora",
          "fazer mais barulho na vizinhança",
          "gastar o dinheiro do bairro",
        ],
        0,
        "Regras cuidam pessoas, não magoam.",
        "Boas regras protegem os direitos de todos: filas na escola, respeitar o silêncio à noite, cuidar dos espaços comuns.",
      ),
      Q(
        "O vizinho idoso precisa de ajuda com as compras pesadas. O melhor é…",
        [
          "oferecer-me para ajudar, com respeito",
          "rir dele por caminhar devagar",
          "pegar no dinheiro dele sem pedir",
          "ignorá-lo sempre que o encontrar",
        ],
        0,
        "Como gostarias de ser tratado?",
        "Solidariedade é pôr-se no lugar do outro: um gesto pequeno, com respeito, muda o dia de alguém.",
      ),
      Q(
        "Na minha comunidade há pessoas de diferentes línguas e tradições. Isso é…",
        [
          "uma riqueza que nos ensina e nos fortalece",
          "um problema que não tem solução",
          "uma razão para não conversar",
          "algo que devemos esconder",
        ],
        0,
        "Cada cultura traz saberes novos.",
        "Diferentes línguas, comidas e músicas enriquecem a comunidade: respeitar as diferenças é cidadania.",
      ),
      VF(
        "Cuidar dos espaços comuns — poço, praça, escola — é responsabilidade de todos.",
        0,
        "O 'de quem?' tem resposta: é de todos nós.",
        "Espaços comuns cuidados servem melhor a todos; deixar lixo ou partir o que é de todos prejudica a própria comunidade.",
      ),
      VF(
        "Só os adultos podem ajudar a melhorar a comunidade.",
        1,
        "Que idade tem quem recolhe o lixo da praça da escola?",
        "Crianças também participam: avisar sobre perigos, respeitar regras, cuidar dos espaços e ajudar vizinhos.",
      ),
    ]),
    L("cid-dinheiro", "Dinheiro e Poupança", "💰", 5, [
      Q(
        "POUPAR é…",
        [
          "guardar uma parte do dinheiro para usar mais tarde",
          "gastar tudo no primeiro dia",
          "nunca contar o dinheiro que temos",
          "comprar sempre por impulso",
        ],
        0,
        "Poupar hoje para realizar um plano amanhã.",
        "Poupar é guardar um pedaço do que recebemos — mesmo pequeno — para alcançar um objetivo maior.",
      ),
      Q(
        "Uma NECESSIDADE é…",
        [
          "aquilo de que precisamos para viver, como comida e escola",
          "aquilo que só desejamos por capricho",
          "qualquer brinquedo novo do bairro",
          "mais um refrigerante no lanche",
        ],
        0,
        "Antes o essencial; depois o extra.",
        "Necessidades vêm primeiro (alimento, saúde, material escolar); os desejos são o extra — e cabem no que sobra.",
      ),
      Q(
        "O que é um orçamento?",
        [
          "um plano de como ganhar, gastar e poupar o dinheiro",
          "uma moeda muito antiga e rara",
          "uma mochila só para guardar notas",
          "um tipo de banco grande",
        ],
        0,
        "É fazer contas antes de gastar.",
        "O orçamento organiza o dinheiro: quanto entra, quanto sai e quanto se poupa — evita surpresas e dívidas.",
      ),
      Q(
        "Poupei 500 no meu cofre e o meu plano é guardar 200. Posso gastar…",
        [
          "300 no máximo",
          "500, poupar é opcional",
          "700, e peço emprestado o resto",
          "nada, melhor nunca gastar",
        ],
        0,
        "500 − 200 = ?",
        "Se poupamos 200 de 500, ficam 300 para gastar. Fazer contas primeiro evita decidir mal depois.",
      ),
      VF(
        "Guardar dinheiro num cofre ou numa conta ajuda a realizar planos maiores.",
        0,
        "Gota a gota enche o balde.",
        "A poupança constante, mesmo pequena, cresce com o tempo: um material, uma bicicleta, um projeto.",
      ),
      VF(
        "Quem poupa nunca pode comprar nada de especial.",
        1,
        "Poupar não é castigo, é plano.",
        "Poupar não é deixar de viver: é escolher. Com plano, dá para o necessário E para o especial.",
      ),
    ]),
    L("cid-digital", "Cidadania Digital", "💻", 6, [
      Q(
        "A minha senha (password) deve ser…",
        [
          "secreta e difícil de adivinhar",
          "o meu nome com o dia do meu aniversário",
          "partilhada com todos os meus amigos",
          "escrita num cartaz na parede da sala",
        ],
        0,
        "Senhas são como chaves de casa: só do dono.",
        "Senhas fortes misturam letras, números e símbolos, guardam-se em segredo e não se repetem em todos os sítios.",
      ),
      Q(
        "Se alguém me insulta ou ameaça na internet, devo…",
        [
          "não responder, guardar as provas e contar a um adulto de confiança",
          "responder com insultos ainda maiores",
          "ameaçar em mensagem privada",
          "esconder que isso está a acontecer",
        ],
        0,
        "Não responder + contar a um adulto.",
        "Ciberbullying é grave: guardar capturas de ecrã ajuda os adultos a resolver; responder só piora a situação.",
      ),
      Q(
        "Uma notícia falsa (fake news) é…",
        [
          "informação inventada ou enganosa que parece verdadeira",
          "uma notícia confirmada por vários jornais",
          "o tempo que passo no ecrã",
          "um jogo online de perguntas",
        ],
        0,
        "FAKE = falso.",
        "Notícias falsas espalham-se rápido porque chocam. Desconfiar de títulos exagerados é o primeiro passo.",
      ),
      Q(
        "Antes de partilhar uma notícia chocante, devo…",
        [
          "verificar se é verdade noutras fontes sérias",
          "partilhar depressa para ser o primeiro",
          "inventar um título ainda melhor",
          "pedir aos amigos para acreditarem sem verificar",
        ],
        0,
        "Partilhar mentiras também espalha mentiras.",
        "Verificar a fonte e comparar com outros sites demora um minuto e protege toda a gente.",
      ),
      VF(
        "Nem tudo o que está na internet é verdade.",
        0,
        "Na internet há verdade, erro e mentira juntos.",
        "Qualquer pessoa pode publicar qualquer coisa: cabe-nos pensar, comparar fontes e duvidar do duvidoso.",
      ),
      VF(
        "Posso partilhar fotos dos meus amigos sem lhes pedir.",
        1,
        "A imagem dos outros também é deles.",
        "Cada um decide sobre a sua imagem: pedir sempre autorização antes de fotografar ou partilhar alguém.",
      ),
    ]),
    L("cid-participar", "Participar e Decidir", "🗳️", 6, [
      Q(
        "Numa votação justa…",
        [
          "cada pessoa escolhe em segredo e cada voto vale um",
          "o mais forte do grupo decide tudo",
          "vale quem conseguir gritar mais alto",
          "só as pessoas mais velhas podem escolher",
        ],
        0,
        "Um voto por pessoa, sem pressão.",
        "Votação justa: todos podem opinar em segredo, cada voto vale igual e o resultado é respeitado.",
      ),
      Q(
        "A democracia é um sistema em que…",
        [
          "o povo participa nas decisões, muitas vezes votando",
          "um rei decide tudo sozinho, para sempre",
          "não existem regras nem leis",
          "só as pessoas ricas podem escolher",
        ],
        0,
        "DEMO-CRACIA: governo do povo.",
        "Na democracia, os cidadãos elegem representantes e participam nas decisões que afetam a todos.",
      ),
      Q(
        "O delegado da turma é…",
        [
          "escolhido para representar a turma e levar as ideias dela à professora",
          "o chefe que manda nos colegas",
          "aluno que nunca precisa de estudar",
          "quem substitui a professora nos testes",
        ],
        0,
        "Representar = levar a voz dos outros.",
        "O delegado não manda: representa. Ouve a turma, comunica as ideias e devolve as respostas.",
      ),
      Q(
        "Quando discordo de uma decisão do grupo, devo…",
        [
          "explicar o meu ponto de vista com respeito e ouvir o dos outros",
          "gritar até o grupo ceder",
          "sair a bater com a porta",
          "falar mal dos colegas depois",
        ],
        0,
        "Discordar é normal; o como é que faz a diferença.",
        "Discordância saudável usa argumentos e escuta: o grupo decide melhor quando todas as vozes são ouvidas.",
      ),
      VF(
        "Ouvir quem pensa diferente ajuda o grupo a decidir melhor.",
        0,
        "Ideias diferentes podem juntar-se numa solução melhor.",
        "As melhores decisões nascem de várias perspetivas: quem só ouve quem concorda, vê só metade do problema.",
      ),
      VF(
        "Participar nas decisões é só coisa de presidentes e adultos.",
        1,
        "A turma que decide as regras do jogo respeita-as mais.",
        "Crianças e jovens participam todos os dias: em casa, na turma, no bairro. Cidadania treina-se desde pequeno.",
      ),
    ]),
  ],

  // ═══ INGLÊS ═══════════════════════════════════════════════════════════════
  ingles: [
    L("en-school", "At School", "🏫", 5, [
      Q(
        "Como se diz 'lápis' em inglês?",
        ["pencil", "pencil case", "pen", "paper"],
        0,
        "Parece-se com 'pincel'… mas não é.",
        "pencil = lápis; pen = caneta; pencil case = estojo; paper = papel.",
      ),
      Q(
        "'Book' quer dizer…",
        ["livro", "caderno", "mala", "quadro"],
        0,
        "O amigo de papel das leituras.",
        "book = livro; notebook = caderno; bag = mala; board = quadro.",
      ),
      Q(
        "A pessoa que ensina na sala de aula é o/a…",
        ["teacher", "doctor", "farmer", "driver"],
        0,
        "É a palavra mais ouvida na escola.",
        "teacher = professor/a; doctor = médico/a; farmer = agricultor/a; driver = motorista.",
      ),
      Q(
        "'Blackboard' é…",
        ["o quadro da sala", "uma lousa de bolso", "uma borracha grande", "uma mochila escura"],
        0,
        "BLACK + BOARD: preto + quadro.",
        "blackboard = quadro (negro); whiteboard = quadro branco; eraser = borracha.",
      ),
      Q(
        "Como se pede, em inglês, 'Posso ir ao banheiro?'",
        [
          "Can I go to the bathroom?",
          "Can I eat a sandwich?",
          "Where is my pencil?",
          "Open the window, please!",
        ],
        0,
        "GO TO THE… = ir ao/à…",
        "'Can I go to the bathroom?' é o pedido clássico da sala de aula em inglês.",
      ),
      VF(
        "'Door' quer dizer chão.",
        1,
        "É o que se abre para entrar.",
        "door = porta; chão = floor; janela = window. Falsos amigos enganam: atenção!",
      ),
    ]),
    L("en-weather", "The Weather", "⛅", 5, [
      Q(
        "'It is raining' quer dizer…",
        ["Está a chover", "Está a ventar", "Está sol", "Está frio"],
        0,
        "RAIN = chuva.",
        "rain = chuva; raining = a chover. 'It is raining' = está a chover.",
      ),
      Q(
        "Como se diz 'sol' em inglês?",
        ["sun", "rain", "wind", "cloud"],
        0,
        "A palavra curta que aquece tudo.",
        "sun = sol; rain = chuva; wind = vento; cloud = nuvem.",
      ),
      Q(
        "'Cloudy' quer dizer…",
        ["nublado", "ensolarado", "nevado", "molhado"],
        0,
        "Terminado em -Y: cheio de nuvens.",
        "cloud = nuvem; cloudy = nublado. sunny = ensolarado; wet = molhado.",
      ),
      Q(
        "O oposto de 'hot' é…",
        ["cold", "warm", "wet", "dry"],
        0,
        "Queimador de língua vs. espinha fria.",
        "hot = quente; cold = frio; warm = morno; dry = seco.",
      ),
      Q(
        "'Wind' é…",
        ["vento", "chuva", "trovoada", "areia"],
        0,
        "Sopra, mas não se vê.",
        "wind = vento; storm = trovoada; sand = areia; rain = chuva.",
      ),
      VF(
        "'Snow' quer dizer tempestade.",
        1,
        "É branquinha e cai do céu no frio.",
        "snow = neve; tempestade = storm. Duas palavras que confundem à primeira vista!",
      ),
    ]),
    L("en-jobs", "Jobs and Work", "👷", 6, [
      Q(
        "'Farmer' é a pessoa que…",
        [
          "trabalha na agricultura",
          "conduz o autocarro escolar",
          "cuida dos nossos dentes",
          "canta no palco",
        ],
        0,
        "FARM = quinta.",
        "farmer = agricultor/a: cultiva a terra, semeia e colhe.",
      ),
      Q(
        "Quem cuida dos nossos dentes é o/a…",
        ["dentist", "teacher", "pilot", "cook"],
        0,
        "DENT = dente.",
        "dentist = dentista; pilot = piloto; cook = cozinheiro/a; teacher = professor/a.",
      ),
      Q(
        "'Nurse' quer dizer…",
        ["enfermeira/o", "médica/o", "engenheira/o", "pintora/o"],
        0,
        "Trabalha lado a lado com o médico.",
        "nurse = enfermeira/o; doctor = médico/a; engineer = engenheiro/a; painter = pintor/a.",
      ),
      Q(
        "O/A 'driver' conduz…",
        [
          "um carro, autocarro ou táxi",
          "um avião de passageiros",
          "um hospital inteiro",
          "uma escola nova",
        ],
        0,
        "DRIVE = conduzir.",
        "driver = motorista; pilot = piloto de avião; hospital e escola são lugares, não veículos.",
      ),
      Q(
        "'I want to be a pilot' quer dizer…",
        ["Quero ser piloto", "Quero ser polícia", "Quero pintar a casa", "Quero jogar futebol"],
        0,
        "WANT TO BE = quero ser.",
        "want = querer; to be = ser. 'I want to be a pilot' expressa o sonho de carreira.",
      ),
      VF(
        "'Cook' quer dizer livro de receitas.",
        1,
        "É quem faz a comida deliciar.",
        "cook = cozinheiro/a (pessoa); cookbook = livro de receitas. Uma letra muda tudo!",
      ),
    ]),
    L("en-travel", "Travel and Places", "✈️", 6, [
      Q(
        "'Airport' é…",
        ["o aeroporto", "a paragem de autocarro", "a praia", "o mercado"],
        0,
        "AIR + PORT: porto do ar.",
        "airport = aeroporto; bus stop = paragem de autocarro; beach = praia; market = mercado.",
      ),
      Q(
        "Para viajar de avião preciso do…",
        ["ticket", "jacket", "bucket", "packet"],
        0,
        "Soa parecido com 'tiquetaque do relógio'…",
        "ticket = bilhete; jacket = casaco; bucket = balde; packet = pacote. Cuidado com os sons!",
      ),
      Q(
        "'Let's travel to the beach!' quer dizer…",
        [
          "Vamos viajar para a praia!",
          "Vamos lavar a casa!",
          "Vamos ao mercado!",
          "Vamos estudar matemática!",
        ],
        0,
        "BEACH = praia.",
        "travel = viajar; beach = praia. A frase convida a uma ida à praia.",
      ),
      Q(
        "O 'map' ajuda-nos a…",
        [
          "encontrar os caminhos e os lugares",
          "falar mais alto",
          "cozinhar arroz mais depressa",
          "comprar sapatos novos",
        ],
        0,
        "Papel dobrado, muito caminho dentro.",
        "map = mapa: mostra ruas, rios, cidades e ajuda a não se perder em viagem.",
      ),
      Q(
        "'Suitcase' é…",
        ["a mala de viagem", "o fato de banho", "o chapéu de sol", "o castelo de areia"],
        0,
        "SUIt + CASE: a caixa do fato… e de tudo.",
        "suitcase = mala de viagem; swimsuit = fato de banho; sandcastle = castelo de areia.",
      ),
      VF(
        "'Bus station' quer dizer estação de comboio.",
        1,
        "BUS não anda sobre carris.",
        "bus station = estação/paragem de autocarro; estação de comboio = train station.",
      ),
    ]),
  ],
};
