// Narrativas curtas (intro + outro) por capítulo. Pensadas para crianças do 1.º ciclo.

export interface ChapterStory {
  introTitle: string;
  introBody: string;
  outroTitle: string;
  outroBody: string;
  reward: string; // emoji + frase curta
}

const FALLBACK: ChapterStory = {
  introTitle: "Uma nova aventura!",
  introBody: "A mascote precisa da tua ajuda para resolver os enigmas deste capítulo. Vamos lá!",
  outroTitle: "Capítulo conquistado!",
  outroBody: "Salvaste o dia. A próxima aventura já te espera.",
  reward: "🏆 Troféu de Herói",
};

export const CHAPTER_STORIES: Record<string, ChapterStory> = {
  "ilha-das-letras": {
    introTitle: "As vogais fugiram!",
    introBody: "A Mocha encontrou um mapa mas as vogais saltaram para fora dele. Vamos juntá-las pela Ilha das Letras!",
    outroTitle: "Vogais salvas! 🎉",
    outroBody: "A Mocha está orgulhosa de ti — agora consegue ler o mapa todinho.",
    reward: "📜 Mapa Mágico das Vogais",
  },
  "vale-dos-numeros": {
    introTitle: "O Vale ficou sem números!",
    introBody: "O Dragão Matemático escondeu os números no Vale. A Faísca conta contigo para os apanhar a todos.",
    outroTitle: "Números recuperados! ⚡",
    outroBody: "A Faísca rugiu de alegria — o Vale voltou a contar até dez!",
    reward: "🔢 Coleira de Números",
  },
  "pais-magico": {
    introTitle: "Portugal à descoberta",
    introBody: "A Pipoca preparou as malas. Vamos saltar de cidade em cidade e descobrir os rios do nosso país!",
    outroTitle: "Que viagem incrível!",
    outroBody: "A Pipoca pôs uma bandeira no mapa por cada lugar que visitaste.",
    reward: "🇵🇹 Bandeirinha da Pipoca",
  },
  "floresta-das-palavras": {
    introTitle: "Árvores que falam!",
    introBody: "Cada árvore guarda uma palavra. Singular, plural, masculino, feminino — ajuda a Mocha a apanhá-las antes que caiam.",
    outroTitle: "Floresta em paz 🌳",
    outroBody: "As palavras voltaram para os ninhos certos. A floresta canta de novo.",
    reward: "🍃 Folha Dourada das Palavras",
  },
  "torre-tabuada": {
    introTitle: "Sobe a Torre da Tabuada!",
    introBody: "A Faísca quer chegar ao topo. Cada degrau é uma soma, subtração ou tabuada. Tu consegues!",
    outroTitle: "No topo da Torre!",
    outroBody: "A vista é incrível. A Faísca pendurou ali uma medalha com o teu nome.",
    reward: "🏔️ Medalha do Topo da Torre",
  },
  "corpo-natureza": {
    introTitle: "Bem-vindo ao Mundo Vivo",
    introBody: "Vais conhecer o teu corpo, animais, plantas e as estações. A Pipoca leva-te pela mão.",
    outroTitle: "Guardião do Mundo Vivo",
    outroBody: "Aprendeste o suficiente para cuidares de qualquer ser vivo!",
    reward: "🌱 Insígnia de Guardião",
  },
  "castelo-gramatica": {
    introTitle: "Os segredos do Castelo",
    introBody: "O Tito guarda as chaves dos substantivos, adjetivos e verbos. Resolve os enigmas para abrir cada sala.",
    outroTitle: "Castelo dominado!",
    outroBody: "O Tito entrega-te um diploma de Mestre da Gramática.",
    reward: "🗝️ Chave-Mestra do Castelo",
  },
  "laboratorio-numeros": {
    introTitle: "Experiências na bancada!",
    introBody: "No laboratório, a Faísca mistura tabuadas e divisões. Cuidado com as explosões matemáticas!",
    outroTitle: "Cientista dos Números!",
    outroBody: "A Faísca dá-te uma bata branca com o teu nome bordado.",
    reward: "🧪 Frasco da Sabedoria",
  },
  "expedicao-portugal": {
    introTitle: "Atravessa Portugal!",
    introBody: "18 distritos, montanhas, ondas e até o Sistema Solar. A Pipoca já te marcou o caminho.",
    outroTitle: "Expedição concluída!",
    outroBody: "Carimbaste o passaporte de cada distrito.",
    reward: "🛤️ Passaporte de Expedição",
  },
  "biblioteca-real": {
    introTitle: "Na Biblioteca Real",
    introBody: "Pronomes e pontuação são as armas dos grandes escritores. A Mocha vai-te ensinar a usá-las.",
    outroTitle: "Escritor(a) Real!",
    outroBody: "A Mocha publicou um livrinho com as tuas frases preferidas.",
    reward: "✒️ Pena de Ouro",
  },
  "estacao-fracoes": {
    introTitle: "Vamos partir a pizza!",
    introBody: "Frações, partes iguais, tabuada do 7. Na Estação das Frações nada se desperdiça.",
    outroTitle: "Maestro(a) das Frações!",
    outroBody: "Já consegues partir qualquer coisa em pedaços perfeitamente iguais.",
    reward: "🍕 Fatia Perfeita",
  },
  "guardioes-planeta": {
    introTitle: "Salva o planeta!",
    introBody: "Viaja na história e descobre como ser um(a) guardião(ã) do ambiente.",
    outroTitle: "Guardião(ã) do Planeta!",
    outroBody: "O Tito entrega-te a capa verde dos defensores da Terra.",
    reward: "🌍 Capa do Guardião",
  },
};

export const getChapterStory = (id: string): ChapterStory => CHAPTER_STORIES[id] ?? FALLBACK;
