// curriculumRegional.ts — "O Meu País": lições regionais por país (PT/BR/
// MZ/AO/CV/ST/GW) para todos os anos 1.º–6.º (1 lição por ano × 7 países =
// 42 lições, 4 perguntas cada). Todas entram no estudo-do-meio com `region`
// marcada — os consumidores (caminho, desafios) filtram pela região do
// perfil, por isso cada criança só vê as do SEU país.
//
// Convenção (igual aos outros currículos): MCQ com resposta certa em
// answerIndex 0 (o runtime baralha com shuffleMcqOptions); VF mantém options
// fixos (0 = Verdadeiro, 1 = Falso). hint + explanation sempre.
import type { Lesson, SubjectId, GradeLevel } from "@/lib/curriculum";
import type { RegionCode } from "@/lib/region";

const L = (
  id: string,
  title: string,
  emoji: string,
  grade: GradeLevel,
  region: RegionCode,
  questions: Lesson["questions"],
): Lesson => ({ id, title, emoji, grade, region, questions });

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

// ═══ MOÇAMBIQUE 🇲🇿 ════════════════════════════════════════════════════════
const MOZAMBIQUE: Lesson[] = [
  L("em-mz-g1", "Conhecer Moçambique", "🇲🇿", 1, "MZ", [
    Q(
      "Qual é a capital de Moçambique?",
      ["Maputo", "Beira", "Nampula", "Quelimane"],
      0,
      "Fica no sul do país, junto à baía.",
      "Maputo é a capital e a maior cidade de Moçambique, à beira do Oceano Índico.",
    ),
    Q(
      "As faixas da bandeira de Moçambique são…",
      ["verde, preta e amarela", "azul e branca", "roxa e laranja", "só vermelha"],
      0,
      "Três faixas e um triângulo vermelho.",
      "A bandeira tem faixas verde, preta e amarela, com um triângulo vermelho e uma estrela.",
    ),
    Q(
      "'Kanimambo' quer dizer…",
      ["obrigado", "adeus", "sim", "bom dia"],
      0,
      "É a palavra que usamos para agradecer em changana.",
      "Kanimambo é 'obrigado' em changana, uma das línguas nacionais de Moçambique.",
    ),
    VF(
      "Moçambique fica no sudeste de África, junto ao Oceano Índico.",
      0,
      "Procura no mapa a costa leste de África.",
      "Moçambique tem uma costa muito comprida banhada pelo Oceano Índico.",
    ),
  ]),
  L("em-mz-g2", "Moçambique: Rios e Cores", "🇲🇿", 2, "MZ", [
    Q(
      "Qual é a moeda de Moçambique?",
      ["o metical", "o kwanza", "o euro", "o franco CFA"],
      0,
      "Começa por 'me…'.",
      "O metical é a moeda oficial de Moçambique desde 1980.",
    ),
    Q(
      "O maior rio que atravessa Moçambique é o…",
      ["Zambeze", "Nilo", "Congo", "Tejo"],
      0,
      "Nasce longe, na Zâmbia, e desagua no Índico.",
      "O rio Zambeze atravessa Moçambique de oeste a leste e desagua no Oceano Índico.",
    ),
    Q(
      "Em Moçambique, 'matabicho' quer dizer…",
      ["o pequeno-almoço", "o jantar", "um carro", "uma dança"],
      0,
      "É a primeira refeição do dia.",
      "Matabicho é o nome dado ao pequeno-almoço em Moçambique e em Angola.",
    ),
    VF(
      "Em Moçambique não existe mar.",
      1,
      "Lembra-te do Oceano…",
      "Falso! Moçambique tem uma costa muito comprida junto ao Oceano Índico.",
    ),
  ]),
  L("em-mz-g3", "Moçambique: Tesouros do Índico", "🇲🇿", 3, "MZ", [
    Q(
      "Que ilha histórica deu o nome a todo o país?",
      ["a Ilha de Moçambique", "a Ilha da Madeira", "a Ilha do Sal", "a Ilha das Rolas"],
      0,
      "É Património Mundial da UNESCO, no norte do país.",
      "A Ilha de Moçambique, antiga capital colonial, é Património Mundial da UNESCO e deu nome ao país.",
    ),
    Q(
      "O matapa, prato típico moçambicano, é feito com…",
      ["folhas de mandioca e amendoim", "arroz doce", "batata frita", "massa de pizza"],
      0,
      "São folhas verdes piladas com cacahuete.",
      "O matapa cozinha folhas de mandioca com amendoim, coco e temperos — é dos pratos mais amados.",
    ),
    Q(
      "O famoso parque nacional moçambicano com elefantes e búfalos é o…",
      ["Gorongosa", "Yellowstone", "Kruger", "Serengeti"],
      0,
      "Fica no centro do país e está a ser restaurado.",
      "O Parque Nacional da Gorongosa é um dos grandes santuários de animais de África.",
    ),
    VF(
      "Moçambique comemora a independência a 25 de Junho.",
      0,
      "É a meio do ano, no solstício quase.",
      "A 25 de Junho de 1975 Moçambique tornou-se um país independente.",
    ),
  ]),
  L("em-mz-g4", "Moçambique: Pontes e Gigantes", "🇲🇿", 4, "MZ", [
    Q(
      "A montanha mais alta de Moçambique é o…",
      ["Monte Binga", "Kilimanjaro", "Monte Moco", "Pico de São Tomé"],
      0,
      "Fica na fronteira com o Zimbabwe.",
      "O Monte Binga, com 2436 metros, é o ponto mais alto de Moçambique.",
    ),
    Q(
      "A grande ponte sobre a baía de Maputo chama-se…",
      ["Ponte Katembe", "Golden Gate", "Ponte 25 de Abril", "Rio–Niterói"],
      0,
      "Liga a cidade a um distrito do outro lado da baía.",
      "A Ponte Katembe (Maputo–Katembe) é uma das maiores pontes suspensas de África.",
    ),
    Q(
      "O grande futebolista nascido em Moçambique que brilhou no Benfica foi…",
      ["Eusébio", "Pelé", "Maradona", "Messi"],
      0,
      "Chamavam-lhe a Pantera Negra.",
      "Eusébio, a Pantera Negra, nasceu em Lourenço Marques (hoje Maputo) e foi um dos melhores de sempre.",
    ),
    VF(
      "A marrabenta é uma comida típica.",
      1,
      "Ouve-se na rádio, não se come.",
      "Falso! A marrabenta é a música popular urbana de Moçambique.",
    ),
  ]),
  L("em-mz-g5", "Moçambique: Caminho da Independência", "🇲🇿", 5, "MZ", [
    Q(
      "Moçambique tornou-se independente em…",
      ["1975", "1890", "2001", "1822"],
      0,
      "A década em que muitos países africanos se libertaram.",
      "Moçambique conquistou a independência a 25 de Junho de 1975.",
    ),
    Q(
      "O primeiro presidente de Moçambique foi…",
      ["Samora Machel", "Agostinho Neto", "Aristides Pereira", "Nelson Mandela"],
      0,
      "Liderou a FRELIMO na luta de libertação.",
      "Samora Machel liderou a FRELIMO e foi o primeiro presidente de Moçambique.",
    ),
    Q(
      "Que produto Moçambique exporta muito para o mundo?",
      ["a castanha de caju", "o aço de Estocolmo", "o champanhe", "o mármore grego"],
      0,
      "Cresce numa árvore e tem uma casca curva.",
      "Moçambique é um dos maiores produtores mundiais de castanha de caju; também exporta carvão e gás natural.",
    ),
    VF(
      "Em Moçambique fala-se português e muitas línguas nacionais, como o macua e o changana.",
      0,
      "O país é multilingue.",
      "O português liga todos; macua, changana, tsonga e muitas outras línguas vivem no dia-a-dia.",
    ),
  ]),
  L("em-mz-g6", "Moçambique no Mundo", "🇲🇿", 6, "MZ", [
    Q(
      "Moçambique é membro da comunidade dos países que falam português, chamada…",
      ["CPLP", "NATO", "Mercosul", "União Europeia"],
      0,
      "Comunidade dos Países de Língua Portuguesa.",
      "A CPLP junta Portugal, Brasil, Angola, Moçambique, Cabo Verde, Guiné-Bissau, São Tomé e Príncipe, Timor e Guiné Equatorial.",
    ),
    Q(
      "Moçambique faz fronteira com…",
      ["a África do Sul", "o Egipto", "o Chade", "o Gana"],
      0,
      "É o país do extremo sul do continente.",
      "Moçambique faz fronteira com a África do Sul, o Essuatíni, o Zimbabwe, a Zâmbia, o Malawi e a Tanzânia.",
    ),
    Q(
      "Gungunhana foi…",
      [
        "o último imperador de Gaza, levado para os Açores",
        "um futebolista famoso",
        "um presidente português",
        "um explorador europeu",
      ],
      0,
      "Reinou no sul do território no século XIX.",
      "Gungunhana foi o último imperador de Gaza; em 1895 foi levado por Portugal para os Açores.",
    ),
    VF(
      "O poeta José Craveirinha escreveu poemas em Moçambique.",
      0,
      "Um dos maiores poetas africanos em português.",
      "José Craveirinha, autor de 'Karingana ua karingana', é considerado o maior poeta moçambicano.",
    ),
  ]),
];

// ═══ ANGOLA 🇦🇴 ════════════════════════════════════════════════════════════
const ANGOLA: Lesson[] = [
  L("em-ao-g1", "Conhecer Angola", "🇦🇴", 1, "AO", [
    Q(
      "Qual é a capital de Angola?",
      ["Luanda", "Benguela", "Huambo", "Lubango"],
      0,
      "É também uma das maiores cidades de África.",
      "Luanda é a capital de Angola, junto ao Oceano Atlântico.",
    ),
    Q(
      "As cores da bandeira de Angola são…",
      ["vermelha e preta", "azul e branca", "verde e amarela", "roxa e cinza"],
      0,
      "Duas faixas e um símbolo amarelo no meio.",
      "A bandeira de Angola é vermelha e preta, com uma roda dentada, uma faca e uma enxada em amarelo.",
    ),
    Q(
      "A seleção nacional de andebol e futebol de Angola chama-se…",
      ["Palancas Negras", "Leões do Atlas", "Tubarões Azuis", "Falcões"],
      0,
      "É o nome de um antílope muito raro.",
      "As Palancas Negras levam o nome da palanca negra gigante, o antílope símbolo de Angola.",
    ),
    VF(
      "Luanda fica junto ao mar.",
      0,
      "Procura a costa oeste de África no mapa.",
      "Luanda é uma cidade costeira, banhada pelo Oceano Atlântico.",
    ),
  ]),
  L("em-ao-g2", "Angola: Terra e Moeda", "🇦🇴", 2, "AO", [
    Q(
      "Qual é a moeda de Angola?",
      ["o kwanza", "o metical", "o euro", "o dobra"],
      0,
      "Tem o mesmo nome de um rio.",
      "O kwanza é a moeda de Angola, com o nome tirado do rio Kwanza.",
    ),
    Q(
      "Que rio dá o nome à moeda de Angola?",
      ["o rio Kwanza", "o rio Nilo", "o rio Zambeze", "o rio Congo"],
      0,
      "Corre pelo centro-norte do país.",
      "O rio Kwanza corre por Angola e emprestou o nome à moeda nacional.",
    ),
    Q(
      "O kuduro é…",
      ["uma música e dança angolanas", "uma comida picante", "um jogo de tabuleiro", "um rio"],
      0,
      "É dançado com passos rápidos!",
      "O kuduro nasceu em Luanda e é um dos ritmos mais animados de África.",
    ),
    VF(
      "Angola fica na Ásia.",
      1,
      "Procura no mapa do continente africano.",
      "Falso! Angola fica no sudoeste de África, junto ao Oceano Atlântico.",
    ),
  ]),
  L("em-ao-g3", "Angola: Tesouros do Sul", "🇦🇴", 3, "AO", [
    Q(
      "O Miradouro da Lua, com falésias esculpidas pelo vento, fica em…",
      ["Angola", "França", "Japão", "Canadá"],
      0,
      "Fica a sul de Luanda.",
      "O Miradouro da Lua, em Angola, tem falésias e desfiladeiros que parecem uma paisagem lunar.",
    ),
    Q(
      "A muamba de galinha é…",
      ["um prato típico angolano", "uma dança", "uma moeda", "um rio"],
      0,
      "Cozinha-se com óleo de palma e okra.",
      "A muamba de galinha, servida com funge, é um dos pratos mais famosos de Angola.",
    ),
    Q(
      "O funge é…",
      ["um pirão de mandioca ou milho", "uma fruta", "um peixe", "uma bebida"],
      0,
      "Acompanha quase todos os pratos.",
      "O funge é o pirão base da cozinha angolana, feito com farinha de mandioca ou de milho.",
    ),
    VF(
      "O Parque Nacional do Kissama (Quiçama) fica em Angola.",
      0,
      "É ali que as palancas vivem.",
      "O Kissama é o maior parque nacional de Angola, a sul de Luanda.",
    ),
  ]),
  L("em-ao-g4", "Angola: Montanhas e História", "🇦🇴", 4, "AO", [
    Q(
      "A montanha mais alta de Angola é o…",
      ["Monte Moco", "Kilimanjaro", "Monte Binga", "Pico Cão Grande"],
      0,
      "Fica na província do Huambo.",
      "O Monte Moco, com cerca de 2620 metros, é o ponto mais alto de Angola.",
    ),
    Q(
      "O primeiro presidente de Angola foi…",
      ["Agostinho Neto", "Samora Machel", "Aristides Pereira", "José Eduardo dos Santos"],
      0,
      "Era também médico e poeta.",
      "Agostinho Neto, médico e poeta, foi o primeiro presidente de Angola (1975–1979).",
    ),
    Q(
      "Além de presidente, Agostinho Neto era…",
      ["poeta", "astronauta", "piloto de corridas", "carpinteiro"],
      0,
      "Escreveu 'Sagrada Esperança'.",
      "Agostinho Neto publicou o livro de poemas 'Sagrada Esperança' e é um grande nome da poesia africana.",
    ),
    VF(
      "A independência de Angola foi em 1822.",
      1,
      "Foi no mesmo ano de Moçambique.",
      "Falso! Angola tornou-se independente a 11 de Novembro de 1975.",
    ),
  ]),
  L("em-ao-g5", "Angola: Caminho da Independência", "🇦🇴", 5, "AO", [
    Q(
      "Angola tornou-se independente em…",
      [
        "11 de Novembro de 1975",
        "25 de Abril de 1974",
        "7 de Setembro de 1822",
        "5 de Julho de 1975",
      ],
      0,
      "Novembro, ainda em 1975.",
      "Angola proclamou a independência a 11 de Novembro de 1975.",
    ),
    Q(
      "Que país colonizou Angola?",
      ["Portugal", "Espanha", "França", "Bélgica"],
      0,
      "É também o país que fundou Luanda, em 1575.",
      "Angola foi colónia portuguesa durante mais de 400 anos, até 1975.",
    ),
    Q(
      "O Caminho de Ferro de Benguela liga o interior de Angola ao…",
      ["porto do Lobito", "deserto do Saara", "cabo da Boa Esperança", "canal do Panamá"],
      0,
      "É um porto no Atlântico.",
      "O Caminho de Ferro de Benguela atravessa o país e termina no porto do Lobito, no Atlântico.",
    ),
    VF(
      "Angola tem línguas nacionais como o umbundu e o kimbundu, além do português.",
      0,
      "O português é oficial, mas não é o único.",
      "Além do português, em Angola falam-se umbundu, kimbundu, kikongo, cokwe e muitas outras línguas.",
    ),
  ]),
  L("em-ao-g6", "Angola no Mundo", "🇦🇴", 6, "AO", [
    Q(
      "Angola faz parte da CPLP, a comunidade dos países que falam…",
      ["português", "mandarim", "russo", "alemão"],
      0,
      "A língua de Camões e de Agostinho Neto.",
      "A CPLP junta os nove países que têm o português como língua oficial; Angola é um dos fundadores.",
    ),
    Q(
      "A província de Angola que fica separada do resto do país é…",
      ["Cabinda", "Benguela", "Huíla", "Moxico"],
      0,
      "Fica no norte, entre dois outros países.",
      "Cabinda é um exclave: faz parte de Angola mas fica separada, entre o Congo e a RDC.",
    ),
    Q(
      "Uma grande riqueza que Angola exporta é…",
      ["o petróleo e os diamantes", "o gelo do deserto", "os carros de corrida", "o champanhe"],
      0,
      "Vem do subsolo e do mar.",
      "Angola é um dos maiores exportadores africanos de petróleo e também exporta diamantes.",
    ),
    VF(
      "A palanca negra gigante é um antílope raro que vive em Angola.",
      0,
      "É o símbolo do país.",
      "A palanca negra gigante é uma das antílopes mais raras do mundo e vive em Angola — é o símbolo nacional.",
    ),
  ]),
];

// ═══ BRASIL 🇧🇷 ═════════════════════════════════════════════════════════════
const BRASIL: Lesson[] = [
  L("em-br-g1", "Conhecer o Brasil", "🇧🇷", 1, "BR", [
    Q(
      "Qual é a capital do Brasil?",
      ["Brasília", "Rio de Janeiro", "São Paulo", "Salvador"],
      0,
      "Uma cidade feita de propósito para ser capital!",
      "Brasília, inaugurada em 1960, foi planeada para ser a capital do Brasil.",
    ),
    Q(
      "As cores da bandeira do Brasil são…",
      ["verde, amarela e azul", "vermelha e preta", "laranja e branca", "roxa e cinza"],
      0,
      "Com um losango e um círculo ao centro.",
      "A bandeira do Brasil é verde e amarela, com um círculo azul onde se lê 'Ordem e Progresso'.",
    ),
    Q(
      "Qual destes animais vive no Brasil?",
      ["o mico-leão-dourado", "o pinguim-imperador", "o urso-polar", "o camelo"],
      0,
      "É pequeno, dourado e vive na Mata Atlântica.",
      "O mico-leão-dourado é um macaquinho dourado da Mata Atlântica brasileira.",
    ),
    VF(
      "No Brasil fala-se português.",
      0,
      "É o único país da América do Sul de língua portuguesa.",
      "O português do Brasil tem a sua alma própria: 'tchau!', 'legal!', 'saudade'…",
    ),
  ]),
  L("em-br-g2", "Brasil: Terra Grande", "🇧🇷", 2, "BR", [
    Q(
      "Qual é a moeda do Brasil?",
      ["o real", "o metical", "o kwanza", "o peso"],
      0,
      "Tem sinal R$.",
      "O real (R$) é a moeda brasileira desde 1994.",
    ),
    Q(
      "A maior floresta tropical do mundo fica no Brasil e chama-se…",
      ["Amazónia", "deserto do Saara", "floresta de Sherwood", "tundra"],
      0,
      "É chamada o pulmão do mundo.",
      "A Amazónia é a maior floresta tropical do planeta e está sobretudo no Brasil.",
    ),
    Q(
      "O rio mais caudaloso do mundo é o…",
      ["Amazonas", "Tejo", "Sena", "Reno"],
      0,
      "Carrega mais água do que todos os outros juntos.",
      "O rio Amazonas tem o maior caudal do planeta — uma quinta parte de toda a água dos rios do mundo.",
    ),
    VF(
      "O Brasil é um país pequeno.",
      1,
      "Olha para o tamanho dele no mapa da América do Sul.",
      "Falso! O Brasil é o 5.º maior país do mundo em área.",
    ),
  ]),
  L("em-br-g3", "Brasil: Festa e Natureza", "🇧🇷", 3, "BR", [
    Q(
      "A grande festa com sambódromo e desfiles é o…",
      ["Carnaval do Rio", "Oktoberfest de Munique", "dia de San Fermín", "festival de Cannes"],
      0,
      "Acontece antes da Quaresma.",
      "O Carnaval do Rio de Janeiro é uma das maiores festas do mundo, com escolas de samba e milhares de foliões.",
    ),
    Q(
      "As cataratas gigantes na fronteira Brasil–Argentina chamam-se…",
      ["Iguaçu", "Niagara", "Vitória", "Angel"],
      0,
      "São 275 saltos de água!",
      "As Cataratas do Iguaçu, na fronteira Brasil–Argentina, formam um dos maiores conjuntos de quedas de água do mundo.",
    ),
    Q(
      "O Cristo Redentor fica em cima do morro do Corcovado, na cidade de…",
      ["Rio de Janeiro", "Lisboa", "Maputo", "Tóquio"],
      0,
      "De braços abertos sobre a baía de Guanabara.",
      "O Cristo Redentor, no Rio de Janeiro, é uma das chamadas Sete Maravilhas do Mundo Moderno.",
    ),
    VF(
      "O Pantanal é uma grande área de vida selvagem no Brasil.",
      0,
      "É a maior planície alagada do planeta.",
      "O Pantanal, no Brasil (e um pouco na Bolívia e no Paraguai), é a maior planície alagada do mundo, cheia de jacarés, capivaras e araras.",
    ),
  ]),
  L("em-br-g4", "Brasil: Esporte e História", "🇧🇷", 4, "BR", [
    Q(
      "Quantas vezes o Brasil ganhou a Copa do Mundo de futebol?",
      ["5 vezes", "1 vez", "10 vezes", "nunca"],
      0,
      "É o país com mais títulos.",
      "O Brasil ganhou 5 Copas do Mundo (1958, 1962, 1970, 1994 e 2002) — é o recorde mundial.",
    ),
    Q(
      "O grande jogador brasileiro chamado 'O Rei' foi…",
      ["Pelé", "Cristiano Ronaldo", "Messi", "Zidane"],
      0,
      "Ganhou 3 Copas do Mundo.",
      "Pelé, nascido em Três Corações, ganhou 3 Copas pelo Brasil e é conhecido como O Rei do futebol.",
    ),
    Q(
      "O Brasil tornou-se independente em…",
      ["1822", "1975", "1945", "2000"],
      0,
      "Século XIX, com um grito às margens do rio Ipiranga.",
      "A 7 de Setembro de 1822, Dom Pedro I proclamou a independência do Brasil ('Independência ou Morte').",
    ),
    VF(
      "A bossa nova nasceu na Alemanha.",
      1,
      "Pensa em praia de Ipanema e violão.",
      "Falso! A bossa nova nasceu no Brasil, nos anos 1950, com João Gilberto e Tom Jobim.",
    ),
  ]),
  L("em-br-g5", "Brasil: Caminho da Independência", "🇧🇷", 5, "BR", [
    Q(
      "Quem proclamou a independência do Brasil?",
      ["Dom Pedro I", "Dom Manuel II", "Napoleão", "Cristóvão Colombo"],
      0,
      "Era príncipe de Portugal e depois imperador do Brasil.",
      "Dom Pedro I, filho do rei de Portugal, ficou com o Brasil e proclamou a independência em 1822.",
    ),
    Q(
      "Antes de Brasília, a capital do Brasil era…",
      ["Rio de Janeiro", "São Paulo", "Manaus", "Curitiba"],
      0,
      "Cidade do Cristo Redentor e do Carnaval.",
      "O Rio de Janeiro foi capital do Brasil de 1763 até 1960, quando Brasília foi inaugurada.",
    ),
    Q(
      "Brasília, a capital planeada, foi inaugurada em…",
      ["1960", "1800", "2000", "1500"],
      0,
      "A cidade foi desenhada em forma de avião.",
      "Brasília foi inaugurada em 21 de Abril de 1960, com desenho de Lúcio Costa e Oscar Niemeyer.",
    ),
    VF(
      "No Brasil vivem pessoas de muitas origens: indígenas, africanas, europeias e asiáticas.",
      0,
      "O Brasil é um país de muitas raízes.",
      "O povo brasileiro junta descendentes dos povos indígenas, dos africanos, dos europeus e dos asiáticos.",
    ),
  ]),
  L("em-br-g6", "Brasil no Mundo", "🇧🇷", 6, "BR", [
    Q(
      "Quantos estados tem o Brasil?",
      ["26 estados + o Distrito Federal", "5 estados", "50 estados", "100 estados"],
      0,
      "Cada estrela da bandeira representa um.",
      "O Brasil tem 26 estados e o Distrito Federal, onde fica Brasília.",
    ),
    Q(
      "Palavras como 'abacaxi' e 'tapioca' vêm…",
      ["das línguas indígenas (tupi)", "do francês", "do japonês", "do alemão"],
      0,
      "Eram faladas aqui muito antes de 1500.",
      "Muitas palavras do português do Brasil vêm do tupi, língua dos povos indígenas.",
    ),
    Q(
      "Machado de Assis foi…",
      [
        "o grande escritor brasileiro do século XIX",
        "um futebolista",
        "um presidente",
        "um cantor de rap",
      ],
      0,
      "Escreveu 'Dom Casmurro'.",
      "Machado de Assis, autor de 'Dom Casmurro' e 'Memórias Póstumas', fundou também a Academia Brasileira de Letras.",
    ),
    VF(
      "A Amazónia ajuda a regular o clima do planeta.",
      0,
      "As suas árvores guardam carbono e soltam vapor de água.",
      "A floresta Amazónica influencia as chuvas e o clima de grande parte da América do Sul e do mundo.",
    ),
  ]),
];

// ═══ PORTUGAL 🇵🇹 ══════════════════════════════════════════════════════════
const PORTUGAL: Lesson[] = [
  L("em-pt-g1", "Conhecer Portugal", "🇵🇹", 1, "PT", [
    Q(
      "Qual é a capital de Portugal?",
      ["Lisboa", "Porto", "Faro", "Braga"],
      0,
      "Fica junto ao rio Tejo.",
      "Lisboa, junto ao rio Tejo, é a capital de Portugal desde o século XIII.",
    ),
    Q(
      "As cores da bandeira de Portugal são…",
      ["verde e vermelha", "azul e branca", "laranja e preta", "roxa e amarela"],
      0,
      "Duas faixas, a segunda maior que a primeira.",
      "A bandeira de Portugal é verde e vermelha, com o escudo das armas nacionais ao centro.",
    ),
    Q(
      "O doce português mais famoso, de natas e canela, é o…",
      ["pastel de nata", "sushi", "croissant", "brownie"],
      0,
      "Sai quente do forno das pastelarias.",
      "O pastel de nata (ou pastel de Belém) é o doce português mais conhecido no mundo.",
    ),
    VF(
      "Portugal fica na Europa, junto ao Oceano Atlântico.",
      0,
      "É o país mais a oeste da Europa continental.",
      "Portugal fica no extremo oeste da Europa, com o Atlântico a oeste e a sul.",
    ),
  ]),
  L("em-pt-g2", "Portugal: Terra e Língua", "🇵🇹", 2, "PT", [
    Q(
      "Qual é a moeda de Portugal?",
      ["o euro", "o escudo", "o metical", "o real"],
      0,
      "É a mesma de muitos países da Europa.",
      "Portugal usa o euro desde 2002; antes usava o escudo.",
    ),
    Q(
      "O rio que passa em Lisboa é o…",
      ["Tejo", "Douro", "Sena", "Amazonas"],
      0,
      "É o maior rio da Península Ibérica.",
      "O rio Tejo nasce em Espanha, atravessa Portugal e banha Lisboa.",
    ),
    Q(
      "A música tradicional portuguesa, cantada com saudade, é o…",
      ["fado", "tango", "flamenco", "samba"],
      0,
      "Canta-se acompanhado pela guitarra portuguesa.",
      "O fado é a música de Lisboa e do Porto, cantada com saudade; Amália Rodrigues foi a sua grande voz.",
    ),
    VF(
      "Portugal não tem ilhas.",
      1,
      "Pensa nos arquipélagos do Atlântico.",
      "Falso! Portugal tem dois arquipélagos: a Madeira e os Açores.",
    ),
  ]),
  L("em-pt-g3", "Portugal: Tesouros do País", "🇵🇹", 3, "PT", [
    Q(
      "A Livraria Lello, uma das livrarias mais bonitas do mundo, fica no…",
      ["Porto", "Madrid", "Roma", "Paris"],
      0,
      "Tem uma escadaria vermelha famosa.",
      "A Livraria Lello, no Porto, é visitada por turistas do mundo inteiro pela sua beleza.",
    ),
    Q(
      "O galo que é símbolo lendário de Portugal é o…",
      ["Galo de Barcelos", "galo de Faro", "galo de Évora", "galo do Algarve"],
      0,
      "Vem de uma lenda do Minho.",
      "O Galo de Barcelos é o símbolo popular de Portugal, ligado à lenda do milagre do galo.",
    ),
    Q(
      "Os famosos azulejos servem para…",
      ["decorar paredes e fachadas", "fazer sopa", "vestir no inverno", "construir barcos"],
      0,
      "São ladrilhos pintados de azul e branco.",
      "Os azulejos pintam paredes, igrejas e estações em todo o Portugal — uma arte viva há 500 anos.",
    ),
    VF(
      "O fado é Património Cultural Imaterial da Humanidade (UNESCO).",
      0,
      "Foi reconhecido em 2011.",
      "Sim, o fado foi inscrito pela UNESCO como Património Cultural Imaterial da Humanidade.",
    ),
  ]),
  L("em-pt-g4", "Portugal: Navegar Mundos", "🇵🇹", 4, "PT", [
    Q(
      "O navegador português que chegou à Índia em 1498 foi…",
      ["Vasco da Gama", "Cristóvão Colombo", "Marco Polo", "Capitão Gancho"],
      0,
      "Abriu o caminho marítimo pelas costas de África.",
      "Vasco da Gama chegou a Calecute, na Índia, em 1498, ligando a Europa à Ásia por mar.",
    ),
    Q(
      "O grande poeta português que escreveu 'Os Lusíadas' foi…",
      ["Luís de Camões", "Shakespeare", "Miguel Torga", "Hans Andersen"],
      0,
      "Celebrou os descobrimentos em verso.",
      "Luís de Camões publicou 'Os Lusíadas' em 1572, o grande poema épico dos descobrimentos.",
    ),
    Q(
      "A montanha mais alta de Portugal é o…",
      ["Pico, nos Açores", "Everest", "Monte Moco", "Pico Cão Grande"],
      0,
      "É um vulcão em pleno Atlântico.",
      "O Pico, vulcão dos Açores com 2351 metros, é o ponto mais alto de Portugal.",
    ),
    VF(
      "Os descobrimentos portugueses aconteceram no século XX.",
      1,
      "Foram muito antes, há mais de 500 anos.",
      "Falso! Os descobrimentos foram nos séculos XV e XVI.",
    ),
  ]),
  L("em-pt-g5", "Portugal: História e Liberdade", "🇵🇹", 5, "PT", [
    Q(
      "A Revolução dos Cravos aconteceu a…",
      ["25 de Abril de 1974", "4 de Julho de 1776", "14 de Julho de 1789", "7 de Setembro de 1822"],
      0,
      "Primavera de 1974, em Lisboa.",
      "A 25 de Abril de 1974, a revolução derrubou a ditadura e devolveu a liberdade a Portugal.",
    ),
    Q(
      "Que flores deram o nome à revolução portuguesa?",
      ["os cravos", "as rosas", "as tulipas", "os girassóis"],
      0,
      "Foram postas nos canos das espingardas.",
      "Uma florista começou a distribuir cravos aos soldados — e a revolução ficou com esse nome.",
    ),
    Q(
      "Fernando Pessoa foi…",
      ["um grande poeta português", "um rei", "um astronauta", "um pintor francês"],
      0,
      "Criou heterónimos com vida própria.",
      "Fernando Pessoa, poeta de Lisboa, inventou heterónimos como Alberto Caeiro e Ricardo Reis.",
    ),
    VF(
      "Portugal é membro da União Europeia.",
      0,
      "Juntou-se em 1986, com a Espanha.",
      "Portugal entrou na então Comunidade Económica Europeia em 1986, hoje União Europeia.",
    ),
  ]),
  L("em-pt-g6", "Portugal no Mundo", "🇵🇹", 6, "PT", [
    Q(
      "A sede da CPLP (Comunidade dos Países de Língua Portuguesa) fica em…",
      ["Lisboa", "Brasília", "Maputo", "Luanda"],
      0,
      "Na cidade que viu partir os navegadores.",
      "A sede da CPLP está no Palácio do Conde Penafiel, em Lisboa.",
    ),
    Q(
      "Quantos países têm o português como língua oficial?",
      ["9", "3", "20", "50"],
      0,
      "Os membros da CPLP, pela Europa, África, América e Ásia.",
      "Nove países têm o português como língua oficial: Portugal, Brasil, Angola, Moçambique, Cabo Verde, Guiné-Bissau, São Tomé e Príncipe, Timor-Leste e Guiné Equatorial.",
    ),
    Q(
      "Os bordados da Madeira e o vinho do Porto são…",
      [
        "produtos portugueses famosos no mundo",
        "pratos brasileiros",
        "instrumentos musicais",
        "jogos antigos",
      ],
      0,
      "Um da ilha, outro do Douro.",
      "Os bordados da Madeira e o vinho do Porto são exportações tradicionais e símbolos de Portugal.",
    ),
    VF(
      "A língua portuguesa só se fala em Portugal.",
      1,
      "Pensa na CPLP.",
      "Falso! O português é falado em 9 países de quatro continentes, por mais de 260 milhões de pessoas.",
    ),
  ]),
];

// ═══ CABO VERDE 🇨🇻 ════════════════════════════════════════════════════════
const CABO_VERDE: Lesson[] = [
  L("em-cv-g1", "Conhecer Cabo Verde", "🇨🇻", 1, "CV", [
    Q(
      "Qual é a capital de Cabo Verde?",
      ["Praia", "Mindelo", "Sal Rei", "Assomada"],
      0,
      "Fica na ilha de Santiago.",
      "A cidade da Praia, na ilha de Santiago, é a capital de Cabo Verde.",
    ),
    Q(
      "Cabo Verde é um país feito de…",
      ["10 ilhas", "1 ilha", "100 ilhas", "nenhuma ilha"],
      0,
      "São ilhas vulcânicas no Atlântico.",
      "Cabo Verde é um arquipélago de 10 ilhas vulcânicas (9 habitadas) no Oceano Atlântico.",
    ),
    Q(
      "O prato nacional de Cabo Verde é a…",
      ["cachupa", "matapa", "feijoada", "pizza"],
      0,
      "Um guisado de milho com feijão e carne ou peixe.",
      "A cachupa, guisado de milho com feijões e carne ou peixe, é o prato nacional cabo-verdiano.",
    ),
    VF(
      "Cabo Verde fica no Oceano Atlântico, junto à costa de África.",
      0,
      "A oeste do Senegal.",
      "Cabo Verde fica no Atlântico, a cerca de 500 km da costa oeste de África.",
    ),
  ]),
  L("em-cv-g2", "Cabo Verde: Mar e Morna", "🇨🇻", 2, "CV", [
    Q(
      "Qual é a moeda de Cabo Verde?",
      ["o escudo cabo-verdiano", "o metical", "o euro", "o kwanza"],
      0,
      "Não é o mesmo escudo antigo de Portugal.",
      "O escudo cabo-verdiano é a moeda de Cabo Verde desde 1977.",
    ),
    Q(
      "O ponto mais alto de Cabo Verde é…",
      ["o Monte Fogo, um vulcão", "o Monte Binga", "o Everest", "o Pico Cão Grande"],
      0,
      "Dá o nome à ilha onde está.",
      "O vulcão do Fogo, com cerca de 2800 metros, é o ponto mais alto de Cabo Verde — e ainda está ativo.",
    ),
    Q(
      "Cesária Évora, a 'diva dos pés descalços', cantava…",
      ["morna", "rock", "rap", "ópera"],
      0,
      "A música lenta e saudosa das ilhas.",
      "Cesária Évora levou a morna de Cabo Verde a todo o mundo, cantando descalça por gratidão.",
    ),
    VF(
      "Cabo Verde é um país sem mar nem praias.",
      1,
      "É um arquipélago!",
      "Falso! Cabo Verde é um país de ilhas, com praias famosas como a de Santa Mónica.",
    ),
  ]),
  L("em-cv-g3", "Cabo Verde: Ilhas e Tradições", "🇨🇻", 3, "CV", [
    Q(
      "O funaná é…",
      ["uma música e dança de Cabo Verde", "uma sopa", "um barco", "uma montanha"],
      0,
      "Toca-se com acordeão e ferrinho.",
      "O funaná, com o seu acordeão e o ferrinho de metal, é a música mais animada de Cabo Verde.",
    ),
    Q(
      "'Morabeza' quer dizer…",
      ["hospitalidade, acolhimento", "um peixe", "uma dança", "uma fruta"],
      0,
      "É a palavra que descreve o povo cabo-verdiano.",
      "Morabeza é a hospitalidade calorosa do povo de Cabo Verde — a sua marca no mundo.",
    ),
    Q(
      "A única das 10 ilhas sem habitantes é…",
      ["Santa Luzia", "Santiago", "Sal", "São Vicente"],
      0,
      "É uma reserva natural.",
      "Santa Luzia é a única ilha desabitada de Cabo Verde, protegida como reserva natural.",
    ),
    VF(
      "Em Cabo Verde fala-se português e crioulo.",
      0,
      "O crioulo é a língua do coração.",
      "O português é a língua oficial; o crioulo cabo-verdiano é a língua de casa, música e rua.",
    ),
  ]),
  L("em-cv-g4", "Cabo Verde: Heróis e Liberdade", "🇨🇻", 4, "CV", [
    Q(
      "Cabo Verde tornou-se independente a…",
      [
        "5 de Julho de 1975",
        "25 de Abril de 1974",
        "7 de Setembro de 1822",
        "1 de Janeiro de 2000",
      ],
      0,
      "Julho, no mesmo ano dos países irmãos.",
      "Cabo Verde conquistou a independência a 5 de Julho de 1975.",
    ),
    Q(
      "O primeiro presidente de Cabo Verde foi…",
      ["Aristides Pereira", "Samora Machel", "Agostinho Neto", "Pelé"],
      0,
      "Foi também um dos fundadores do PAIGC.",
      "Aristides Pereira foi o primeiro presidente de Cabo Verde (1975–1991).",
    ),
    Q(
      "Amílcar Cabral, herói fundador do PAIGC, lutou pela independência de…",
      ["Cabo Verde e da Guiné-Bissau", "só do Brasil", "Portugal", "Timor"],
      0,
      "Dois países irmãos, uma mesma luta.",
      "Amílcar Cabral fundou o PAIGC e liderou a luta pela independência da Guiné-Bissau e de Cabo Verde.",
    ),
    VF(
      "Cabo Verde fica no Oceano Pacífico.",
      1,
      "É o oceano das Canárias e do Senegal.",
      "Falso! Cabo Verde fica no Oceano Atlântico.",
    ),
  ]),
  L("em-cv-g5", "Cabo Verde: História e Natureza", "🇨🇻", 5, "CV", [
    Q(
      "As tartarugas-marinhas põem os seus ovos nas praias de…",
      ["Boa Vista e Sal", "Paris", "Tóquio", "Moscovo"],
      0,
      "Ilhas de areia e dunas.",
      "As praias de Boa Vista e Sal são dos maiores pontos de desova da tartaruga carenca em todo o Atlântico.",
    ),
    Q(
      "A morna foi declarada Património…",
      [
        "Cultural Imaterial da Humanidade (UNESCO)",
        "Mundial de Futebol",
        "das Ciências",
        "dos Computadores",
      ],
      0,
      "Foi em 2019.",
      "Em 2019, a UNESCO inscreveu a morna como Património Cultural Imaterial da Humanidade.",
    ),
    Q(
      "Cabo Verde é conhecido por ser um dos países mais…",
      [
        "estáveis e democráticos de África",
        "montanhosos da Ásia",
        "frios do Ártico",
        "desertos da Europa",
      ],
      0,
      "Eleições livres desde os anos 1990.",
      "Cabo Verde é um exemplo de democracia estável em África, com eleições livres e alternância pacífica.",
    ),
    VF(
      "As ilhas de Cabo Verde nasceram de vulcões.",
      0,
      "O Fogo ainda está ativo!",
      "Todas as ilhas de Cabo Verde são de origem vulcânica; o vulcão do Fogo entrou em erupção em 2014.",
    ),
  ]),
  L("em-cv-g6", "Cabo Verde no Mundo", "🇨🇻", 6, "CV", [
    Q(
      "Cabo Verde faz parte da CPLP, a comunidade dos países que falam…",
      ["português", "chinês", "árabe", "russo"],
      0,
      "A língua de Cesária, cantada com saudade.",
      "Cabo Verde é um dos nove membros da CPLP, fundada em 1996.",
    ),
    Q(
      "A música de Cabo Verde viajou para todo o mundo através de…",
      ["Cesária Évora", "Beethoven", "Mozart", "Shakira"],
      0,
      "A diva dos pés descalços.",
      "Cesária Évora vendeu milhões de discos e levou a morna aos grandes palcos do mundo.",
    ),
    Q(
      "O turismo de Cabo Verde atrai visitantes para as…",
      ["praias e ilhas", "montanhas de neve", "florestas de bambu", "cidades antigas da Ásia"],
      0,
      "Sol o ano inteiro a poucas horas da Europa e de África.",
      "As praias de Sal e Boa Vista fazem do turismo a grande riqueza de Cabo Verde.",
    ),
    VF(
      "Em Cabo Verde nunca há música nem festa.",
      1,
      "Já conheces o funaná e a morna!",
      "Falso! Música e festa são a alma de Cabo Verde — de São Vicente a Santiago.",
    ),
  ]),
];

// ═══ SÃO TOMÉ E PRÍNCIPE 🇸🇹 ═══════════════════════════════════════════════
const SAO_TOME: Lesson[] = [
  L("em-st-g1", "Conhecer São Tomé", "🇸🇹", 1, "ST", [
    Q(
      "Qual é a capital de São Tomé e Príncipe?",
      ["São Tomé", "Trindade", "Neves", "Santana"],
      0,
      "Tem o mesmo nome da ilha maior.",
      "A cidade de São Tomé, na ilha de São Tomé, é a capital do país.",
    ),
    Q(
      "São Tomé e Príncipe é um país feito de…",
      ["duas ilhas principais", "três continentes", "dez desertos", "cem montanhas de gelo"],
      0,
      "São Tomé e Príncipe, mais pequenos ilhéus.",
      "O país é um arquipélago com duas ilhas principais — São Tomé e Príncipe — e vários ilhéus.",
    ),
    Q(
      "O produto que deu ao país o apelido 'Ilhas Chocolate' é o…",
      ["cacau", "arroz", "milho", "trigo"],
      0,
      "É a fruta de que se faz o chocolate.",
      "O cacau cresce tão bem nas ilhas que São Tomé e Príncipe ficou conhecido como 'Ilhas Chocolate'.",
    ),
    VF(
      "Em São Tomé e Príncipe fala-se português e o crioulo forro.",
      0,
      "O forro nasceu nas roças.",
      "O português é a língua oficial; o forro, crioulo de São Tomé, é a língua de casa e da rua.",
    ),
  ]),
  L("em-st-g2", "São Tomé: Equador e Vulcões", "🇸🇹", 2, "ST", [
    Q(
      "Qual é a moeda de São Tomé e Príncipe?",
      ["a dobra", "o metical", "o euro", "o real"],
      0,
      "Começa por 'do…'.",
      "A dobra é a moeda oficial de São Tomé e Príncipe.",
    ),
    Q(
      "A linha imaginária que divide a Terra ao meio e passa no ilhéu das Rolas chama-se…",
      ["Equador", "Trópico de Câncer", "Meridiano de Greenwich", "Círculo Polar"],
      0,
      "Liga o hemisfério Norte ao Sul.",
      "O Equador, a linha da latitude 0, passa no ilhéu das Rolas, ao sul da ilha de São Tomé.",
    ),
    Q(
      "A montanha mais alta do país é o…",
      ["Pico de São Tomé", "Everest", "Monte Moco", "Monte Binga"],
      0,
      "Tem 2024 metros e cobre-se de névoa.",
      "O Pico de São Tomé, com 2024 metros, é o ponto mais alto do país.",
    ),
    VF(
      "O Equador passa pelo ilhéu das Rolas.",
      0,
      "É uma das marcas mais famosas do país.",
      "No ilhéu das Rolas há um marco que assinala a passagem do Equador: um pé em cada hemisfério!",
    ),
  ]),
  L("em-st-g3", "São Tomé: Roças e Sabores", "🇸🇹", 3, "ST", [
    Q(
      "O prato nacional de São Tomé e Príncipe é o…",
      ["calulu", "cachupa", "sushi", "feijoada"],
      0,
      "Leva peixe, folhas e óleo de palma.",
      "O calulu, cozinhado com peixe ou carne, folhas e óleo de palma, é o prato nacional santomense.",
    ),
    Q(
      "As roças do tempo colonial eram…",
      ["grandes propriedades de plantação", "barcos de pesca", "escolas antigas", "estádios"],
      0,
      "Ali se cultivava o cacau.",
      "As roças eram grandes plantações de cacau e café; algumas, como a Agua Izé, ainda hoje se visitam.",
    ),
    Q(
      "O Pico Cão Grande é…",
      [
        "uma agulha vulcânica gigante na floresta",
        "um cão de pedra pequeno",
        "um rio",
        "uma praia",
      ],
      0,
      "Sobe mais de 600 metros feito dedo no céu.",
      "O Pico Cão Grande é uma agulha vulcânica de mais de 600 metros que se ergue no sul da ilha.",
    ),
    VF(
      "O calulu leva peixe, folhas e óleo de palma.",
      0,
      "É o prato de festa das famílias.",
      "Sim — o calulu junta peixe (ou carne), folhas, beringela e óleo de palma, cozinhado devagar.",
    ),
  ]),
  L("em-st-g4", "São Tomé: História e Natureza", "🇸🇹", 4, "ST", [
    Q(
      "São Tomé e Príncipe tornou-se independente a…",
      [
        "12 de Julho de 1975",
        "25 de Junho de 1975",
        "5 de Julho de 1975",
        "11 de Novembro de 1975",
      ],
      0,
      "Duas semanas depois de Cabo Verde.",
      "São Tomé e Príncipe conquistou a independência a 12 de Julho de 1975.",
    ),
    Q(
      "O primeiro presidente do país foi…",
      ["Manuel Pinto da Costa", "Aristides Pereira", "Samora Machel", "Agostinho Neto"],
      0,
      "Médico de profissão, liderou o MLSTP.",
      "Manuel Pinto da Costa foi o primeiro presidente de São Tomé e Príncipe (1975–1991, e novamente 2011–2016).",
    ),
    Q(
      "Por volta de 1913, São Tomé e Príncipe era o maior produtor mundial de…",
      ["cacau", "carros", "aviões", "computadores"],
      0,
      "'Ilhas Chocolate' no seu melhor momento.",
      "No princípio do século XX, as ilhas chegaram a ser o maior produtor mundial de cacau.",
    ),
    VF(
      "São Tomé e Príncipe é um dos maiores países de África em território.",
      1,
      "É dos menores — mas cheio de tesouros.",
      "Falso! É um dos menores países de África: cerca de 1000 km².",
    ),
  ]),
  L("em-st-g5", "São Tomé: Caminho da Independência", "🇸🇹", 5, "ST", [
    Q(
      "Que país colonizou São Tomé e Príncipe?",
      ["Portugal", "Espanha", "França", "Itália"],
      0,
      "As ilhas foram povoadas pelos portugueses no século XV.",
      "Portugueses chegaram às ilhas desabitadas por volta de 1470 e ficaram até 1975.",
    ),
    Q(
      "São Tomé e Príncipe é membro da CPLP, a comunidade dos países que falam…",
      ["português", "árabe", "mandarim", "russo"],
      0,
      "A língua que as ilhas partilham com 8 outros países.",
      "A CPLP junta os nove países de língua oficial portuguesa; São Tomé e Príncipe é um dos fundadores.",
    ),
    Q(
      "A ilha do Príncipe é…",
      ["Reserva da Biosfera da UNESCO", "um deserto de sal", "uma cidade industrial", "um glaciar"],
      0,
      "Reconhecida em 2012 pela sua natureza única.",
      "Em 2012, a UNESCO declarou a ilha do Príncipe Reserva da Biosfera pela sua biodiversidade.",
    ),
    VF(
      "A língua forro nasceu do encontro do português com línguas africanas.",
      0,
      "Os crioulos nascem assim, de povos que se encontram.",
      "O forro, crioulo de São Tomé, formou-se do português com línguas africanas dos povos trazidos às ilhas.",
    ),
  ]),
  L("em-st-g6", "São Tomé no Mundo", "🇸🇹", 6, "ST", [
    Q(
      "São Tomé e Príncipe fica no Golfo de…",
      ["Guiné", "Biscaia", "México", "Aden"],
      0,
      "A sul da Nigéria e da Guiné.",
      "As ilhas ficam no Golfo da Guiné, no Atlântico, junto à costa da África Central.",
    ),
    Q(
      "Hoje, além do cacau, o país aposta no…",
      ["turismo ecológico", "fabrico de aviões", "mineração de Marte", "produção de neve"],
      0,
      "Floresta, tartarugas e mar limpo atraem visitantes.",
      "As florestas, tartarugas-marinhas e praias limpas fazem do ecoturismo uma grande esperança do país.",
    ),
    Q(
      "O ússua e o socopé são…",
      ["danças tradicionais santomenses", "pratos de peixe", "moedas antigas", "ventos fortes"],
      0,
      "Dançam-se nas festas das ilhas.",
      "O ússua e o socopé são danças tradicionais de São Tomé e Príncipe, tocadas com tambores.",
    ),
    VF(
      "São Tomé e Príncipe não tem mar nem praias.",
      1,
      "É um país de ilhas no Atlântico!",
      "Falso! São ilhas: praia e mar estão sempre por perto.",
    ),
  ]),
];

// ═══ GUINÉ-BISSAU 🇬🇼 ══════════════════════════════════════════════════════
const GUINE_BISSAU: Lesson[] = [
  L("em-gw-g1", "Conhecer a Guiné-Bissau", "🇬🇼", 1, "GW", [
    Q(
      "Qual é a capital da Guiné-Bissau?",
      ["Bissau", "Bafatá", "Gabú", "Cacheu"],
      0,
      "Fica junto a um braço de mar (o rio Geba).",
      "Bissau, junto ao estuário do rio Geba, é a capital da Guiné-Bissau.",
    ),
    Q(
      "As cores da bandeira da Guiné-Bissau são…",
      [
        "vermelha, amarela e verde com estrela preta",
        "azul e branca",
        "roxa e laranja",
        "cinza e rosa",
      ],
      0,
      "As cores pan-africanas.",
      "A bandeira tem faixas amarela, verde e um campo vermelho com estrela negra — as cores pan-africanas.",
    ),
    Q(
      "O produto que a Guiné-Bissau mais exporta é…",
      ["a castanha de caju", "a neve", "a lã", "o melão do Ártico"],
      0,
      "Cresce numa árvore com fruto curvo.",
      "A castanha de caju é a maior exportação da Guiné-Bissau — um dos maiores produtores de África.",
    ),
    VF(
      "Na Guiné-Bissau fala-se português e o crioulo guineense.",
      0,
      "O crioulo é a língua que junta todos.",
      "O português é a língua oficial; o crioulo guineense é a língua de comunicação entre todos.",
    ),
  ]),
  L("em-gw-g2", "Guiné-Bissau: Ilhas e Marés", "🇬🇼", 2, "GW", [
    Q(
      "Qual é a moeda da Guiné-Bissau?",
      ["o franco CFA", "a dobra", "o kwanza", "o metical"],
      0,
      "É a mesma moeda de vários países da África Ocidental.",
      "A Guiné-Bissau usa o franco CFA da África Ocidental, partilhado com o Senegal e outros países.",
    ),
    Q(
      "O famoso arquipélago da Guiné-Bissau chama-se…",
      ["Bijagós", "Açores", "Maldivas", "Galápagos"],
      0,
      "Cerca de 80 ilhas no Atlântico.",
      "As ilhas Bijagós são um arquipélago de cerca de 80 ilhas, com natureza única.",
    ),
    Q(
      "Nas ilhas Bijagós vivem hipopótamos que…",
      ["nadam no mar e descansam nas praias", "andam de barco", "voam", "sobem a palmeiras"],
      0,
      "Em Orango podes vê-los a entrar no oceano.",
      "No Parque Nacional de Orango vivem hipopótamos que nadam no mar — uma das maravilhas das Bijagós.",
    ),
    VF(
      "Na Guiné-Bissau não existem ilhas.",
      1,
      "Já conheces as Bijagós!",
      "Falso! O arquipélago dos Bijagós tem cerca de 80 ilhas.",
    ),
  ]),
  L("em-gw-g3", "Guiné-Bissau: Tesouros da Natureza", "🇬🇼", 3, "GW", [
    Q(
      "O parque nacional onde vivem chimpanzés na Guiné-Bissau é o…",
      ["Cantanhez", "Yellowstone", "Kruger", "Serengeti"],
      0,
      "No sul do país, na floresta.",
      "O Parque Nacional de Cantanhez protege florestas onde vivem chimpanzés, ao sul da Guiné-Bissau.",
    ),
    Q(
      "O gumbe é…",
      ["uma música e dança da Guiné-Bissau", "uma fruta", "uma moeda", "um rio"],
      0,
      "Influenciou até estilos musicais do Brasil.",
      "O gumbe é o ritmo tradicional da Guiné-Bissau; viajou com o povo e influenciou músicas noutras terras.",
    ),
    Q(
      "A segunda cidade do país, onde nasceu Amílcar Cabral, é…",
      ["Bafatá", "Bissau", "Sal", "Mindelo"],
      0,
      "Fica no interior, na rota do leste.",
      "Bafatá, a segunda cidade da Guiné-Bissau, é a terra natal de Amílcar Cabral (1924).",
    ),
    VF(
      "O arroz é um alimento muito importante na Guiné-Bissau.",
      0,
      "É a base do dia-a-dia.",
      "Sim — o arroz é a base da alimentação e há culturas de arroz de sal e de sequeiro no país.",
    ),
  ]),
  L("em-gw-g4", "Guiné-Bissau: Heróis e Liberdade", "🇬🇼", 4, "GW", [
    Q(
      "O herói da independência nascido em Bafatá foi…",
      ["Amílcar Cabral", "Vasco da Gama", "Napoleão", "Nelson Mandela"],
      0,
      "Fundou o PAIGC em 1956.",
      "Amílcar Cabral, nascido em Bafatá em 1924, fundou o PAIGC e liderou a luta pela independência.",
    ),
    Q(
      "A independência da Guiné-Bissau foi proclamada em…",
      ["1973", "1822", "1900", "2000"],
      0,
      "24 de Setembro, ainda em plena luta.",
      "A independência foi proclamada a 24 de Setembro de 1973 e reconhecida no ano seguinte.",
    ),
    Q(
      "O PAIGC era…",
      [
        "o movimento pela independência",
        "uma equipa de futebol",
        "uma banda de música",
        "um barco",
      ],
      0,
      "Partido Africano da Independência da Guiné e Cabo Verde.",
      "O PAIGC (Partido Africano da Independência da Guiné e Cabo Verde) lutou pela liberdade dos dois países.",
    ),
    VF(
      "A Guiné-Bissau fica na América do Sul.",
      1,
      "Procura na costa oeste de África.",
      "Falso! A Guiné-Bissau fica na costa oeste de África, junto ao Atlântico.",
    ),
  ]),
  L("em-gw-g5", "Guiné-Bissau: Natureza e Vida", "🇬🇼", 5, "GW", [
    Q(
      "Que país colonizou a Guiné-Bissau?",
      ["Portugal", "França", "Bélgica", "Holanda"],
      0,
      "Os vizinhos falam francês, mas não este.",
      "A Guiné-Bissau foi colónia portuguesa até 1973/74; por isso o português é a língua oficial.",
    ),
    Q(
      "Além da castanha de caju, a Guiné-Bissau vive também da…",
      ["pesca e do arroz", "fabrico de aviões", "mineração de Marte", "produção de gelo"],
      0,
      "Mar rico e campos de arroz.",
      "A pesca e o arroz são pilares da economia e da alimentação da Guiné-Bissau.",
    ),
    Q(
      "O crioulo guineense serve hoje como…",
      ["a língua que junta todas as etnias do país", "uma comida", "um jogo", "uma moeda"],
      0,
      "Nasceu do encontro de povos na época colonial.",
      "O crioulo guineense nasceu do português com línguas africanas e hoje une todas as etnias.",
    ),
    VF(
      "A Guiné-Bissau comemora a independência a 24 de Setembro.",
      0,
      "É a data da proclamação, em 1973.",
      "Sim — 24 de Setembro de 1973 é o Dia Nacional da Guiné-Bissau.",
    ),
  ]),
  L("em-gw-g6", "Guiné-Bissau no Mundo", "🇬🇼", 6, "GW", [
    Q(
      "A Guiné-Bissau faz parte da CPLP, a comunidade dos países que falam…",
      ["português", "só francês", "só inglês", "árabe"],
      0,
      "É o único país lusófono da CEDEAO.",
      "A Guiné-Bissau é o único país de língua oficial portuguesa na África Ocidental (CEDEAO) e membro da CPLP.",
    ),
    Q(
      "A Guiné-Bissau faz fronteira com…",
      ["o Senegal e a Guiné-Conacri", "o Brasil", "Portugal", "Cabo Verde"],
      0,
      "Dois vizinhos, um a norte, outro a leste e sul.",
      "A Guiné-Bissau limita a norte com o Senegal e a leste/sul com a Guiné (Conacri).",
    ),
    Q(
      "Os mangais (manguezais) da Guiné-Bissau protegem a costa e servem de casa a…",
      ["peixes, aves e mariscos", "ursos polares", "pinguins", "camelos do deserto"],
      0,
      "Raízes que crescem na água salgada.",
      "Os mangais guardam a costa da erosão e são berçário de peixes, mariscos e aves — vitais para o país.",
    ),
    VF(
      "Na Guiné-Bissau só se fala português e mais nenhuma língua.",
      1,
      "Há crioulo e muitas línguas étnicas.",
      "Falso! Fala-se crioulo, português e mais de vinte línguas étnicas como o balanta e o fula.",
    ),
  ]),
];

export const REGIONAL_LESSONS: Partial<Record<SubjectId, Lesson[]>> = {
  "estudo-do-meio": [
    ...MOZAMBIQUE,
    ...ANGOLA,
    ...BRASIL,
    ...PORTUGAL,
    ...CABO_VERDE,
    ...SAO_TOME,
    ...GUINE_BISSAU,
  ],
};
