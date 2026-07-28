// Guião para os pais — instruções e frases sugeridas para cada tipo de jogo.
// Usado pelo painel "Modo Pais" dentro de cada mini-jogo.

export interface ParentScript {
  goal: string;             // Objetivo pedagógico
  setup: string;            // O que dizer antes de começar
  during: string[];         // Frases para usar enquanto a criança joga
  praise: string[];         // Reforço positivo
  extension: string;        // Atividade extra na vida real
}

const DEFAULT: ParentScript = {
  goal: "Estimular a atenção e a coordenação.",
  setup: "Senta-te ao lado da criança e diz: \"Vamos jogar juntos!\"",
  during: ["Aponta para o ecrã e descreve o que vês.", "Faz perguntas: \"O que é isto?\""],
  praise: ["Boa!", "Muito bem!", "És incrível!"],
  extension: "Repete as palavras-chave em casa, durante o dia.",
};

export const PARENT_SCRIPTS: Record<string, ParentScript> = {
  // 2-3 anos — V5
  "baloes": {
    goal: "Reconhecer cores primárias.",
    setup: "Aponta os balões e diz a cor pedida em voz alta.",
    during: ["\"Procura o balão vermelho!\"", "\"Onde está o azul?\"", "\"Esse é... amarelo!\""],
    praise: ["Boa! Rebentaste o balão certo!", "Que olhos atentos!"],
    extension: "Em casa, procurem juntos objetos da mesma cor.",
  },
  "pares-jr": {
    goal: "Memória visual e correspondência.",
    setup: "Diz: \"Vamos encontrar dois iguais.\"",
    during: ["\"Este é igual a aquele?\"", "\"Onde está o outro?\""],
    praise: ["Encontraste o par!", "Muito bem!"],
    extension: "Joga com pares de meias em casa.",
  },
  "transportes": {
    goal: "Reconhecer sons do dia-a-dia.",
    setup: "Faz tu o som primeiro: \"Brrrum brrrum, é o carro!\"",
    during: ["\"Que som é este?\"", "\"Imita comigo!\""],
    praise: ["Boa! É mesmo isso!", "Adivinhaste!"],
    extension: "Na rua, ouçam juntos os transportes a passar.",
  },
  "tamanho": {
    goal: "Conceitos grande/pequeno.",
    setup: "Mostra com as mãos: grande/pequeno.",
    during: ["\"Qual é o grande?\"", "\"E o pequeno?\""],
    praise: ["Muito bem!", "Sabes bem o que é grande!"],
    extension: "Comparem objetos em casa: pai grande, bebé pequeno.",
  },
  "conta-dedos": {
    goal: "Contagem 1-5.",
    setup: "Conta com os dedos junto da criança.",
    during: ["\"1, 2, 3... continua!\"", "\"Quantas estrelas?\""],
    praise: ["Sabes contar!", "Boa contagem!"],
    extension: "Contem objetos no quarto: brinquedos, livros…",
  },
  "alimenta-bebe": {
    goal: "Vocabulário de frutas.",
    setup: "Diz o nome da fruta antes da criança escolher.",
    during: ["\"Onde está a maçã?\"", "\"Dá ao bebé a banana.\""],
    praise: ["O bebé adorou!", "Boa escolha!"],
    extension: "Apresenta as frutas reais à criança ao lanche.",
  },
  "onde-esta": {
    goal: "Memória de curto prazo.",
    setup: "Diz: \"Olha bem, a bola vai esconder-se.\"",
    during: ["\"Onde está a bola?\"", "\"Aponta com o dedo!\""],
    praise: ["Encontraste!", "Boa memória!"],
    extension: "Joga \"copo, copo, copo\" com um brinquedo pequeno.",
  },
  "numeros-tap": {
    goal: "Reconhecer algarismos.",
    setup: "Diz o número em voz alta.",
    during: ["\"Toca no número 2!\"", "\"E o 3?\""],
    praise: ["Boa!", "Sabes os números!"],
    extension: "Procurem números em casa: relógio, comando…",
  },
  "formas-cor": {
    goal: "Distinguir formas e cores.",
    setup: "Mostra a forma com as mãos.",
    during: ["\"Onde está o círculo?\"", "\"Qual é o quadrado vermelho?\""],
    praise: ["Excelente!", "Que olhos atentos!"],
    extension: "Procurem círculos em casa: pratos, relógios…",
  },
  "imita-som": {
    goal: "Reconhecer sons de instrumentos/objetos.",
    setup: "Imita tu primeiro o som.",
    during: ["\"Que som é este?\"", "\"Imita comigo!\""],
    praise: ["Boa!", "És uma orelha musical!"],
    extension: "Façam sons com colheres e tachos em casa.",
  },

  // 2 anos — V6 (novos)
  "tap-cor": {
    goal: "Toque único na cor pedida.",
    setup: "Diz: \"Toca só na cor que eu disser.\"",
    during: ["\"Onde está o vermelho?\"", "\"Toca no azul!\""],
    praise: ["Boa!", "Acertaste!"],
    extension: "Em casa, peçam objetos da mesma cor.",
  },
  "anima-tap": {
    goal: "Reconhecer animais comuns.",
    setup: "Imita o som do animal antes da criança tocar.",
    during: ["\"Onde está o cão?\"", "\"E o gato?\""],
    praise: ["Boa!", "Sabes os animais!"],
    extension: "Vejam um livro de animais juntos.",
  },
  "num-tap-1-3": {
    goal: "Identificar 1, 2 e 3.",
    setup: "Mostra os dedos: 1, 2, 3.",
    during: ["\"Onde está o número 1?\"", "\"E o 2?\""],
    praise: ["Boa!", "Sabes os números!"],
    extension: "Contem os degraus a subir.",
  },
  "grande-pequeno-tap": {
    goal: "Comparar tamanhos.",
    setup: "Aponta para o grande/pequeno.",
    during: ["\"Onde está o grande?\"", "\"E o pequeno?\""],
    praise: ["Muito bem!", "És esperto!"],
    extension: "Comparem sapatos: meu grande, teu pequeno.",
  },
  "fruta-tap": {
    goal: "Vocabulário de frutas.",
    setup: "Mostra a fruta e diz o nome.",
    during: ["\"Onde está a banana?\"", "\"Toca na maçã.\""],
    praise: ["Boa!", "Sabes os nomes!"],
    extension: "Mostrem frutas reais à criança.",
  },
  "som-anima": {
    goal: "Associar som ao animal.",
    setup: "Faz o som primeiro.",
    during: ["\"Que animal faz miau?\"", "\"E muu?\""],
    praise: ["Boa!", "É mesmo isso!"],
    extension: "Imitem juntos sons de animais.",
  },
  "cor-roupa": {
    goal: "Reconhecer cores nas roupas.",
    setup: "Diz a cor da roupa antes.",
    during: ["\"Onde está o casaco vermelho?\"", "\"E o azul?\""],
    praise: ["Boa!", "Sabes vestir-te!"],
    extension: "Quando se vestir, peçam a cor à criança.",
  },
  "anima-grande": {
    goal: "Comparar tamanho de animais.",
    setup: "Diz: \"O elefante é GRANDE, o rato é pequeno.\"",
    during: ["\"Qual é o grande?\"", "\"E o pequeno?\""],
    praise: ["Muito bem!", "Sabes muito!"],
    extension: "Vejam animais reais ou em fotos.",
  },
  "tap-pat-pat": {
    goal: "Coordenação e ritmo.",
    setup: "Bate palmas com a criança.",
    during: ["\"Toca, toca, toca!\"", "\"Mais rápido!\""],
    praise: ["Boa!", "Que ritmo!"],
    extension: "Cantem juntos uma cantiga com palmas.",
  },
  "estrelas-tap": {
    goal: "Contagem 1-3 com toque.",
    setup: "Aponta cada estrela.",
    during: ["\"Conta comigo: 1, 2, 3!\""],
    praise: ["Boa contagem!", "Sabes contar!"],
    extension: "À noite, contem estrelas ou luzes.",
  },
  "carro-cor": {
    goal: "Cores em objetos do dia-a-dia.",
    setup: "Diz a cor do carro.",
    during: ["\"Onde está o carro vermelho?\"", "\"E o amarelo?\""],
    praise: ["Boa!", "És atento!"],
    extension: "Na rua, contem carros de cada cor.",
  },
  "anima-casa": {
    goal: "Onde vive cada animal (peixe/pássaro/cão).",
    setup: "Mostra com gestos: voa, nada, anda.",
    during: ["\"Onde vive o peixe?\"", "\"E o pássaro?\""],
    praise: ["Boa!", "Sabes muito!"],
    extension: "Vejam um aquário ou pássaros na janela.",
  },
  "comida-tap": {
    goal: "Vocabulário de comida.",
    setup: "Diz o nome da comida.",
    during: ["\"Onde está o pão?\"", "\"E a maçã?\""],
    praise: ["Boa!", "És guloso esperto!"],
    extension: "À mesa, peçam os nomes dos alimentos.",
  },
  "forma-redonda": {
    goal: "Reconhecer formas básicas.",
    setup: "Faz um círculo no ar com o dedo.",
    during: ["\"Onde está o redondo?\"", "\"E o quadrado?\""],
    praise: ["Boa!", "És geómetra!"],
    extension: "Procurem círculos em casa.",
  },
  "luz-tap": {
    goal: "Causa-efeito (toque acende).",
    setup: "Diz: \"Toca para acender as luzes!\"",
    during: ["\"Mais uma!\"", "\"Boa, está a brilhar!\""],
    praise: ["Que luzes lindas!"],
    extension: "Em casa, deixem a criança ligar luzes.",
  },
};

export function getParentScript(gameId: string): ParentScript {
  return PARENT_SCRIPTS[gameId] ?? DEFAULT;
}
