// One-off content generator. Run: node scripts/generate-content.mjs
// Produces large, deterministic content banks (no external API calls).
import fs from "node:fs";
import path from "node:path";

const OUT = "src/lib";

// ---------- helpers ----------
const shuffle = (arr, seed) => {
  // deterministic shuffle
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const mkQ = (prompt, correct, distractors, hint) => {
  const opts = shuffle([correct, ...distractors].slice(0, 4), prompt.length);
  return { prompt, options: opts, answerIndex: opts.indexOf(correct), ...(hint ? { hint } : {}) };
};

// ---------- TRIVIA BANK ----------
// Categories: animais, espaco, portugal, mundo, corpo, desporto, arte, musica, ciencia, tecnologia, natureza, comida
const TRIVIA = [];

// Animais (50+)
const animals = [
  ["Quantas patas tem um polvo?", "8", ["6", "10", "4"]],
  ["Qual é o maior animal do mundo?", "Baleia-azul", ["Elefante", "Tubarão-baleia", "Girafa"]],
  ["O canguru é natural de que país?", "Austrália", ["Brasil", "África do Sul", "Índia"]],
  ["Quantas asas tem uma abelha?", "4", ["2", "6", "8"]],
  ["Qual é o animal mais rápido em terra?", "Chita", ["Leão", "Cavalo", "Cão"]],
  ["O panda come principalmente…", "Bambu", ["Peixe", "Carne", "Frutas"]],
  ["Quantos corações tem um polvo?", "3", ["1", "2", "4"]],
  ["O coala vive em que continente?", "Oceânia", ["África", "Ásia", "Europa"]],
  ["Que animal põe ovos e amamenta?", "Ornitorrinco", ["Tartaruga", "Morcego", "Crocodilo"]],
  ["Qual destes é um réptil?", "Crocodilo", ["Golfinho", "Águia", "Sapo"]],
  ["Os flamingos são cor-de-rosa por causa de…", "O que comem", ["Idade", "Clima", "Areia"]],
  ["Quantos dedos tem uma rã em cada mão?", "4", ["3", "5", "2"]],
  ["O leão dorme em média quantas horas por dia?", "20", ["8", "12", "16"]],
  ["A girafa tem quantas vértebras no pescoço?", "7", ["20", "12", "30"]],
  ["O elefante usa a tromba para…", "Beber, cheirar e agarrar", ["Só beber", "Só respirar", "Só cheirar"]],
  ["Que pássaro não voa?", "Pinguim", ["Pardal", "Andorinha", "Águia"]],
  ["A borboleta começa por ser…", "Lagarta", ["Caracol", "Mosca", "Aranha"]],
  ["O caracol move-se sobre…", "Um pé musculoso", ["Quatro patas", "Asas", "Barbatanas"]],
  ["Qual é o maior felino do mundo?", "Tigre", ["Leão", "Leopardo", "Lince"]],
  ["O hipopótamo passa o dia onde?", "Na água", ["Em árvores", "Em cavernas", "No deserto"]],
  ["Quantos olhos tem uma aranha (em geral)?", "8", ["6", "4", "2"]],
  ["O tubarão é um peixe ou um mamífero?", "Peixe", ["Mamífero", "Réptil", "Anfíbio"]],
  ["Que animal produz mel?", "Abelha", ["Vespa", "Formiga", "Mosca"]],
  ["O pernilongo (mosquito) que pica é o…", "Macho ou fêmea? Fêmea", ["Macho", "Larva", "Cria"]],
  ["O rinoceronte tem quantos chifres no máximo?", "2", ["1", "3", "4"]],
  ["Os morcegos orientam-se com…", "Eco", ["Olhos", "Cheiro", "Tato"]],
  ["O esquilo guarda comida para…", "O inverno", ["A primavera", "O verão", "Brincar"]],
  ["Que animal é símbolo da Austrália?", "Canguru", ["Lobo", "Águia", "Urso"]],
  ["A vaca tem quantos estômagos (compartimentos)?", "4", ["1", "2", "3"]],
  ["O peixe respira através de…", "Guelras", ["Pulmões", "Pele", "Boca"]],
];
animals.forEach(([p, c, d]) => TRIVIA.push({ category: "animais", age: 6, ...mkQ(p, c, d) }));

// Espaço (30+)
const space = [
  ["Qual é o planeta mais próximo do Sol?", "Mercúrio", ["Vénus", "Marte", "Terra"]],
  ["Quantos planetas tem o Sistema Solar?", "8", ["7", "9", "10"]],
  ["O Sol é uma…", "Estrela", ["Planeta", "Lua", "Galáxia"]],
  ["Qual é o maior planeta?", "Júpiter", ["Saturno", "Terra", "Neptuno"]],
  ["A galáxia onde vivemos chama-se…", "Via Láctea", ["Andrómeda", "Triângulo", "Sombrero"]],
  ["Quem foi o primeiro homem na Lua?", "Neil Armstrong", ["Yuri Gagarin", "Buzz Aldrin", "John Glenn"]],
  ["Em que ano o homem chegou à Lua?", "1969", ["1959", "1972", "1980"]],
  ["A Lua demora quanto tempo a dar uma volta à Terra?", "~28 dias", ["1 dia", "1 ano", "1 semana"]],
  ["Que planeta é conhecido como Planeta Vermelho?", "Marte", ["Vénus", "Júpiter", "Saturno"]],
  ["Qual o nome do nosso satélite natural?", "Lua", ["Sol", "Vénus", "Phobos"]],
  ["Quanto tempo a Terra demora a dar uma volta ao Sol?", "1 ano", ["1 mês", "1 dia", "100 dias"]],
  ["O que orbita Saturno e é muito famoso?", "Anéis", ["Asteroides", "Cometas", "Luas"]],
  ["Qual é a estrela mais próxima da Terra?", "Sol", ["Sirius", "Polar", "Alpha Centauri"]],
  ["Os astronautas usam fato para…", "Respirar e proteger", ["Aquecer só", "Voar", "Brincar"]],
  ["O que é um cometa?", "Bola de gelo e poeira", ["Planeta pequeno", "Estrela morta", "Asteroide"]],
  ["Qual é o planeta com mais luas?", "Saturno", ["Júpiter", "Terra", "Marte"]],
  ["A primeira mulher no espaço foi…", "Valentina Tereshkova", ["Sally Ride", "Mae Jemison", "Anne McClain"]],
  ["Que telescópio espacial famoso existe desde 1990?", "Hubble", ["James Webb", "Kepler", "Chandra"]],
  ["A Lua tem atmosfera?", "Praticamente não", ["Sim, espessa", "Sim, igual à Terra", "Sim, líquida"]],
  ["Quantos satélites naturais tem a Terra?", "1", ["0", "2", "4"]],
];
space.forEach(([p, c, d]) => TRIVIA.push({ category: "espaco", age: 7, ...mkQ(p, c, d) }));

// Portugal (40+)
const portugal = [
  ["Capital de Portugal?", "Lisboa", ["Porto", "Coimbra", "Faro"]],
  ["Quem foi o primeiro rei de Portugal?", "D. Afonso Henriques", ["D. Dinis", "D. João I", "D. Manuel"]],
  ["Que rio nasce em Espanha e desagua em Lisboa?", "Tejo", ["Douro", "Mondego", "Guadiana"]],
  ["Quantos distritos tem Portugal continental?", "18", ["16", "20", "22"]],
  ["Quem descobriu o caminho marítimo para a Índia?", "Vasco da Gama", ["Pedro Álvares Cabral", "Bartolomeu Dias", "Magalhães"]],
  ["Em que ano se descobriu o Brasil?", "1500", ["1492", "1498", "1521"]],
  ["A bandeira portuguesa tem que cores?", "Verde e vermelho", ["Azul e branco", "Vermelho e amarelo", "Verde e branco"]],
  ["Hino nacional?", "A Portuguesa", ["A Brasileira", "Os Lusíadas", "Hino da Carta"]],
  ["Que poeta escreveu Os Lusíadas?", "Luís de Camões", ["Fernando Pessoa", "Eça de Queirós", "Sophia"]],
  ["Capital do distrito do Porto?", "Porto", ["Braga", "Aveiro", "Viana"]],
  ["Onde fica a Torre de Belém?", "Lisboa", ["Porto", "Évora", "Coimbra"]],
  ["Qual é o ponto mais alto de Portugal continental?", "Torre (Serra da Estrela)", ["Pico (Açores)", "Foia", "Marão"]],
  ["Qual é a montanha mais alta de Portugal (todo o território)?", "Pico (Açores)", ["Torre", "Foia", "Estrela"]],
  ["Quantas regiões autónomas tem Portugal?", "2", ["1", "3", "4"]],
  ["Bandeira dos Açores tem que cores principais?", "Azul e branco", ["Verde e vermelho", "Amarelo e azul", "Branco e vermelho"]],
  ["O fado é tipicamente…", "Música portuguesa", ["Dança espanhola", "Comida", "Desporto"]],
  ["Onde se faz o vinho do Porto?", "Vale do Douro", ["Alentejo", "Minho", "Algarve"]],
  ["Pastel típico de Belém?", "Pastel de nata", ["Bolo-rei", "Queijada", "Arroz doce"]],
  ["Quem foi Aristides de Sousa Mendes?", "Cônsul que salvou refugiados", ["Rei medieval", "Pintor", "Astronauta"]],
  ["Em que ano o 25 de Abril aconteceu?", "1974", ["1910", "1945", "1986"]],
  ["O que se celebra a 10 de Junho?", "Dia de Portugal", ["Natal", "Páscoa", "Carnaval"]],
  ["Qual o santo popular celebrado em Lisboa a 13 de Junho?", "Santo António", ["São João", "São Pedro", "São Martinho"]],
  ["Cidade conhecida pelos azulejos e tasquinhas (norte)?", "Porto", ["Faro", "Évora", "Beja"]],
  ["O que é Sintra?", "Vila histórica perto de Lisboa", ["Ilha", "Rio", "Praia"]],
  ["Moeda usada em Portugal?", "Euro", ["Escudo", "Dólar", "Libra"]],
];
portugal.forEach(([p, c, d]) => TRIVIA.push({ category: "portugal", age: 8, ...mkQ(p, c, d) }));

// Mundo / geografia (40+)
const world = [
  ["Capital de França?", "Paris", ["Londres", "Madrid", "Roma"]],
  ["Capital de Espanha?", "Madrid", ["Barcelona", "Lisboa", "Sevilha"]],
  ["Capital de Itália?", "Roma", ["Milão", "Veneza", "Nápoles"]],
  ["Capital do Brasil?", "Brasília", ["Rio de Janeiro", "São Paulo", "Salvador"]],
  ["Capital do Reino Unido?", "Londres", ["Edimburgo", "Manchester", "Dublin"]],
  ["Maior continente do mundo?", "Ásia", ["África", "América", "Europa"]],
  ["Continente mais pequeno?", "Oceânia", ["Europa", "Antárctida", "África"]],
  ["Maior oceano do mundo?", "Pacífico", ["Atlântico", "Índico", "Ártico"]],
  ["Rio mais longo do mundo?", "Nilo (ou Amazonas)", ["Tejo", "Mississippi", "Yangtzé"]],
  ["Maior deserto do mundo?", "Antárctida (frio) ou Sara (quente)", ["Gobi", "Kalahari", "Atacama"]],
  ["Em que continente fica o Egipto?", "África", ["Ásia", "Europa", "América"]],
  ["Quantos continentes existem?", "7", ["5", "6", "8"]],
  ["Cordilheira mais alta?", "Himalaias", ["Andes", "Alpes", "Pirenéus"]],
  ["Montanha mais alta do mundo?", "Evereste", ["K2", "Mont Blanc", "Aconcágua"]],
  ["Capital dos EUA?", "Washington D.C.", ["Nova Iorque", "Los Angeles", "Chicago"]],
  ["Capital do Japão?", "Tóquio", ["Quioto", "Osaka", "Pequim"]],
  ["Capital da China?", "Pequim", ["Xangai", "Hong Kong", "Cantão"]],
  ["Capital da Alemanha?", "Berlim", ["Munique", "Hamburgo", "Frankfurt"]],
  ["Capital da Holanda?", "Amesterdão", ["Roterdão", "Haia", "Utreque"]],
  ["Capital da Argentina?", "Buenos Aires", ["Lima", "Santiago", "Montevideu"]],
  ["Capital do Canadá?", "Otava", ["Toronto", "Montreal", "Vancouver"]],
  ["Capital da Austrália?", "Camberra", ["Sydney", "Melbourne", "Perth"]],
  ["Em que país está a Torre Eiffel?", "França", ["Itália", "Espanha", "Inglaterra"]],
  ["Em que país está o Coliseu?", "Itália", ["Grécia", "Espanha", "Egipto"]],
  ["Em que país estão as pirâmides?", "Egipto", ["México", "Sudão", "Líbia"]],
];
world.forEach(([p, c, d]) => TRIVIA.push({ category: "mundo", age: 8, ...mkQ(p, c, d) }));

// Corpo humano (25+)
const body = [
  ["Quantos ossos tem um adulto?", "206", ["100", "300", "500"]],
  ["Que órgão filtra o sangue?", "Rins", ["Coração", "Pulmões", "Estômago"]],
  ["Onde se digere a comida?", "Estômago e intestinos", ["Pulmões", "Coração", "Cérebro"]],
  ["Qual é o maior órgão do corpo?", "Pele", ["Fígado", "Cérebro", "Pulmão"]],
  ["Quantos litros de sangue tem (aprox.) um adulto?", "5", ["1", "10", "20"]],
  ["Quantos dentes de leite tem uma criança?", "20", ["10", "32", "16"]],
  ["O coração bombeia…", "Sangue", ["Ar", "Água", "Alimentos"]],
  ["Os pulmões servem para…", "Respirar", ["Digerir", "Pensar", "Bombear sangue"]],
  ["Quantos sentidos temos (clássicos)?", "5", ["3", "4", "6"]],
  ["Que parte do olho deixa entrar a luz?", "Pupila", ["Íris", "Córnea", "Pálpebra"]],
  ["Os músculos ligam-se aos ossos por…", "Tendões", ["Veias", "Nervos", "Pele"]],
  ["O cérebro está protegido pelo…", "Crânio", ["Esterno", "Costelas", "Bacia"]],
  ["O sangue circula em…", "Veias e artérias", ["Tendões", "Nervos", "Tubos digestivos"]],
  ["A vitamina D vem principalmente do…", "Sol", ["Leite", "Pão", "Sumo"]],
  ["Que parte do nariz cheira?", "Nervo olfativo", ["Pelos", "Pele", "Boca"]],
  ["Os pulmões são geralmente…", "2", ["1", "3", "4"]],
];
body.forEach(([p, c, d]) => TRIVIA.push({ category: "corpo", age: 8, ...mkQ(p, c, d) }));

// Desporto (20+)
const sport = [
  ["Quantos jogadores tem uma equipa de futebol em campo?", "11", ["10", "12", "9"]],
  ["Onde nasceram os Jogos Olímpicos?", "Grécia Antiga", ["Roma", "Egipto", "China"]],
  ["Quantos minutos tem um jogo de futebol (sem prolongamento)?", "90", ["60", "80", "100"]],
  ["No basquetebol, quantos pontos vale um lançamento de 3?", "3", ["1", "2", "4"]],
  ["Quantos sets máximos num jogo de ténis (Grand Slam masculino)?", "5", ["3", "4", "7"]],
  ["A taça do mundo de futebol é de quanto em quanto tempo?", "4 anos", ["2 anos", "3 anos", "5 anos"]],
  ["Quem ganhou a Eurocopa em 2016?", "Portugal", ["França", "Alemanha", "Espanha"]],
  ["Em que desporto se usa um taco e uma bola num campo verde?", "Golfe", ["Ténis", "Hóquei", "Basebol"]],
  ["A maratona tem aproximadamente quantos km?", "42", ["10", "21", "50"]],
  ["O voleibol joga-se com a mão ou o pé?", "Mão", ["Pé", "Cabeça", "Joelho"]],
  ["Cristiano Ronaldo nasceu na…", "Madeira", ["Lisboa", "Porto", "Açores"]],
];
sport.forEach(([p, c, d]) => TRIVIA.push({ category: "desporto", age: 9, ...mkQ(p, c, d) }));

// Arte (15)
const art = [
  ["Quem pintou a Mona Lisa?", "Leonardo da Vinci", ["Picasso", "Van Gogh", "Monet"]],
  ["Que pintor cortou parte da própria orelha?", "Van Gogh", ["Dalí", "Picasso", "Cézanne"]],
  ["O David é uma escultura de…", "Michelangelo", ["Donatello", "Bernini", "Rodin"]],
  ["Picasso é mais conhecido pelo movimento…", "Cubismo", ["Impressionismo", "Realismo", "Romantismo"]],
  ["A Capela Sistina foi pintada por…", "Michelangelo", ["Da Vinci", "Rafael", "Botticelli"]],
  ["O artista português dos azulejos famosos é…", "Há vários", ["Picasso", "Goya", "Klimt"]],
  ["A arte feita com peças coloridas pequenas é…", "Mosaico", ["Aquarela", "Óleo", "Carvão"]],
  ["Quem pintou A Noite Estrelada?", "Van Gogh", ["Munch", "Gauguin", "Renoir"]],
];
art.forEach(([p, c, d]) => TRIVIA.push({ category: "arte", age: 9, ...mkQ(p, c, d) }));

// Música (15)
const music = [
  ["Quantas linhas tem uma pauta musical?", "5", ["4", "6", "7"]],
  ["Quem compôs a 9.ª Sinfonia famosa?", "Beethoven", ["Mozart", "Bach", "Chopin"]],
  ["Quantas teclas tem um piano padrão?", "88", ["66", "72", "100"]],
  ["A guitarra portuguesa tem quantas cordas (geralmente)?", "12", ["6", "8", "10"]],
  ["Que instrumento usa o arco?", "Violino", ["Flauta", "Trompete", "Bateria"]],
  ["Sopro, corda e percussão são tipos de…", "Instrumentos", ["Notas", "Compassos", "Tons"]],
  ["Dó, ré, mi, fá, sol, lá, si — quantas notas?", "7", ["5", "6", "8"]],
  ["Mozart era de que país?", "Áustria", ["Alemanha", "Itália", "Suíça"]],
];
music.forEach(([p, c, d]) => TRIVIA.push({ category: "musica", age: 9, ...mkQ(p, c, d) }));

// Ciência (25)
const science = [
  ["Água ferve a quantos graus (ao nível do mar)?", "100", ["80", "120", "0"]],
  ["Água congela a quantos graus?", "0", ["10", "-10", "5"]],
  ["Símbolo químico da água?", "H2O", ["O2", "CO2", "HO"]],
  ["Símbolo químico do oxigénio?", "O", ["Ox", "H", "C"]],
  ["A força que nos prende ao chão chama-se…", "Gravidade", ["Atrito", "Magnetismo", "Pressão"]],
  ["O som viaja em…", "Ondas", ["Linhas retas", "Bolhas", "Pacotes"]],
  ["A luz viaja a aproximadamente…", "300 000 km/s", ["1000 km/h", "10 000 km/s", "1 milhão km/s"]],
  ["O arco-íris tem quantas cores principais?", "7", ["5", "6", "8"]],
  ["O que faz crescer as plantas (gás)?", "Dióxido de carbono", ["Hidrogénio", "Néon", "Hélio"]],
  ["Que planta dá origem ao chocolate?", "Cacau", ["Café", "Trigo", "Cana"]],
  ["Eletricidade mede-se em…", "Volts/Amperes", ["Litros", "Metros", "Graus"]],
  ["Magnetes atraem…", "Ferro", ["Madeira", "Plástico", "Vidro"]],
  ["O Sol é uma fonte de…", "Energia", ["Comida", "Água", "Som"]],
  ["Os dinossauros viveram há quantos milhões de anos?", "65+", ["1", "1000", "10"]],
  ["O que é um fóssil?", "Restos antigos preservados", ["Pedra atual", "Animal vivo", "Planta nova"]],
];
science.forEach(([p, c, d]) => TRIVIA.push({ category: "ciencia", age: 9, ...mkQ(p, c, d) }));

// Math trivia (procedurally generated, 200+)
for (let a = 1; a <= 12; a++) {
  for (let b = 1; b <= 12; b++) {
    const c = a * b;
    TRIVIA.push({
      category: "matematica",
      age: 8,
      ...mkQ(`${a} × ${b} = ?`, String(c), [String(c + 1), String(c - 1), String(c + a)]),
    });
  }
}
for (let a = 1; a <= 20; a++) {
  for (let b = 1; b <= 20; b++) {
    if ((a + b) % 7 !== 0) continue; // sample subset
    const c = a + b;
    TRIVIA.push({
      category: "matematica",
      age: 7,
      ...mkQ(`${a} + ${b} = ?`, String(c), [String(c + 1), String(c - 1), String(c + 2)]),
    });
  }
}
for (let a = 5; a <= 30; a++) {
  for (let b = 1; b <= 9; b++) {
    if (a <= b) continue;
    if ((a - b) % 5 !== 0) continue;
    const c = a - b;
    TRIVIA.push({
      category: "matematica",
      age: 7,
      ...mkQ(`${a} − ${b} = ?`, String(c), [String(c + 1), String(c - 1), String(c + 2)]),
    });
  }
}

// Português trivia (40)
const pt = [
  ["Plural de 'pão'?", "pães", ["pãos", "pãis", "pans"]],
  ["Plural de 'animal'?", "animais", ["animals", "animales", "animaes"]],
  ["Singular de 'mãos'?", "mão", ["mãoa", "mãe", "mã"]],
  ["Feminino de 'rapaz'?", "rapariga", ["rapaza", "rapazinha", "rapaz"]],
  ["Feminino de 'cão'?", "cadela", ["cãoa", "cãozinha", "cãna"]],
  ["Sinónimo de 'feliz'?", "alegre", ["triste", "zangado", "cansado"]],
  ["Antónimo de 'grande'?", "pequeno", ["enorme", "alto", "fundo"]],
  ["Antónimo de 'rápido'?", "lento", ["veloz", "ágil", "esperto"]],
  ["Sinónimo de 'bonito'?", "belo", ["feio", "mau", "velho"]],
  ["O verbo 'correr' está em que tempo? 'Eu corri'", "Pretérito perfeito", ["Presente", "Futuro", "Imperfeito"]],
  ["Quantas letras tem o alfabeto português?", "26", ["23", "27", "24"]],
  ["Que sinal indica pergunta?", "?", [".", "!", ","]],
  ["Que sinal indica fim de frase afirmativa?", ".", ["?", "!", ":"]],
  ["Palavra com som ‘ch’ inicial?", "chuva", ["sol", "rato", "casa"]],
  ["Plural de 'flor'?", "flores", ["floras", "florinhas", "florees"]],
];
pt.forEach(([p, c, d]) => TRIVIA.push({ category: "portugues", age: 8, ...mkQ(p, c, d) }));

// Inglês básico (40)
const en = [
  ["'Cat' em português?", "Gato", ["Cão", "Pássaro", "Peixe"]],
  ["'Dog' em português?", "Cão", ["Gato", "Cavalo", "Vaca"]],
  ["'Apple' em português?", "Maçã", ["Pera", "Banana", "Uva"]],
  ["'Sun' em português?", "Sol", ["Lua", "Estrela", "Nuvem"]],
  ["'Water' em português?", "Água", ["Sumo", "Leite", "Chá"]],
  ["'Book' em português?", "Livro", ["Caneta", "Lápis", "Mesa"]],
  ["'House' em português?", "Casa", ["Carro", "Rua", "Loja"]],
  ["'Red' em português?", "Vermelho", ["Azul", "Verde", "Amarelo"]],
  ["'Blue' em português?", "Azul", ["Vermelho", "Verde", "Preto"]],
  ["'Green' em português?", "Verde", ["Azul", "Amarelo", "Roxo"]],
  ["'One, two, three' = ?", "Um, dois, três", ["Quatro, cinco, seis", "Sete, oito, nove", "Dez, vinte, trinta"]],
  ["Como dizes 'Olá' em inglês?", "Hello", ["Goodbye", "Please", "Sorry"]],
  ["Como dizes 'Obrigado' em inglês?", "Thank you", ["Hello", "Sorry", "Yes"]],
  ["Como dizes 'Sim' em inglês?", "Yes", ["No", "Maybe", "Hi"]],
  ["Como dizes 'Não' em inglês?", "No", ["Yes", "Hi", "Bye"]],
  ["'Big' em português?", "Grande", ["Pequeno", "Alto", "Forte"]],
  ["'Small' em português?", "Pequeno", ["Grande", "Médio", "Fino"]],
  ["'School' em português?", "Escola", ["Casa", "Loja", "Rua"]],
  ["'Friend' em português?", "Amigo", ["Pai", "Mãe", "Professor"]],
  ["'Mother' em português?", "Mãe", ["Pai", "Irmã", "Avó"]],
  ["'Father' em português?", "Pai", ["Mãe", "Irmão", "Avô"]],
  ["'Brother' em português?", "Irmão", ["Pai", "Tio", "Primo"]],
  ["'Sister' em português?", "Irmã", ["Mãe", "Tia", "Prima"]],
  ["'Happy' em português?", "Feliz", ["Triste", "Zangado", "Cansado"]],
  ["'Sad' em português?", "Triste", ["Feliz", "Bravo", "Cansado"]],
];
en.forEach(([p, c, d]) => TRIVIA.push({ category: "ingles", age: 8, ...mkQ(p, c, d) }));

console.log(`Trivia entries: ${TRIVIA.length}`);

// ---------- FUN FACTS ----------
const FUN_FACTS = [
  "O coração de uma baleia-azul pesa mais do que um carro pequeno.",
  "Uma medusa não tem cérebro nem coração.",
  "As impressões digitais dos coalas são parecidas com as humanas.",
  "Os polvos têm três corações e sangue azul.",
  "A torre Eiffel cresce até 15 cm no verão devido ao calor.",
  "Os flamingos ficam cor-de-rosa por causa do que comem.",
  "O Monte Evereste cresce ~4 mm por ano.",
  "A formiga consegue carregar 50 vezes o seu próprio peso.",
  "O Sol é tão grande que cabem ~1 milhão de Terras lá dentro.",
  "Os caracóis podem dormir 3 anos seguidos.",
  "Em Vénus um dia é mais longo que um ano.",
  "Os tigres têm a pele às riscas (não só o pelo).",
  "Os polvos podem mudar de cor em segundos.",
  "Bananas são tecnicamente bagas; morangos não.",
  "A Lua afasta-se da Terra ~3,8 cm por ano.",
  "O ouro é tão maleável que 1 g pode formar uma folha de 1 m².",
  "O cheiro da chuva tem nome: petricor.",
  "O coração de um beija-flor bate ~1200 vezes por minuto.",
  "Existem mais estrelas no universo do que grãos de areia na Terra.",
  "A Antárctida é o maior deserto do mundo (deserto frio).",
  "O Pacífico é maior que toda a área terrestre junta.",
  "As tartarugas marinhas conseguem viver mais de 100 anos.",
  "Os relâmpagos são mais quentes do que a superfície do Sol.",
  "Os ouriços-do-mar caminham nos espinhos.",
  "Há mais árvores na Terra do que estrelas na Via Láctea.",
  "O queijo é um dos alimentos mais roubados do mundo.",
  "Os crocodilos não conseguem deitar a língua de fora.",
  "Os elefantes são os únicos mamíferos que não saltam.",
  "O Pico, nos Açores, é o ponto mais alto de Portugal.",
  "Lisboa é mais antiga do que Roma.",
  "Existem ~7000 línguas faladas no mundo.",
  "Os gatos passam ~70% da vida a dormir.",
  "Os flamingos dormem em pé, num só pé.",
  "A Via Láctea tem ~100 mil milhões de estrelas.",
  "Saturno flutuaria na água (se existisse uma piscina suficientemente grande).",
  "A maior pirâmide do mundo fica no México (Cholula), não no Egipto.",
  "O som não viaja no espaço.",
  "Os polvos passam por buracos do tamanho do seu olho.",
  "O ouvido humano ouve entre ~20 Hz e 20 000 Hz.",
  "Os pinguins propõem casamento com uma pedrinha.",
  "Os cães cheiram ~40x melhor do que os humanos.",
  "Os corais são animais, não plantas.",
  "Os cavalos-marinhos machos é que ficam grávidos.",
  "Os cangurus não conseguem andar para trás.",
  "O Polo Sul é mais frio do que o Polo Norte.",
  "Há vento em Marte: tempestades enormes de poeira.",
  "O cérebro humano tem ~86 mil milhões de neurónios.",
  "A Terra demora ~365,25 dias a dar a volta ao Sol.",
  "Existem mais bactérias na boca do que pessoas no planeta.",
  "Os tubarões existem há mais tempo do que as árvores.",
  "Os astronautas crescem até ~5 cm no espaço (sem gravidade).",
  "O coração feminino bate em média mais rápido que o masculino.",
  "O ouvido continua a crescer toda a vida.",
  "Em Marte o céu fica avermelhado de dia e azulado ao pôr-do-sol.",
  "Há mais combinações de baralho do que átomos na Terra.",
  "A maior flor do mundo (Rafflesia) cheira a carne podre.",
  "O nome 'Portugal' vem do latim 'Portus Cale'.",
  "O fado foi reconhecido pela UNESCO como Património Cultural.",
  "Os Açores e a Madeira são vulcânicos.",
];

console.log(`Fun facts: ${FUN_FACTS.length}`);

// ---------- write files ----------
const triviaTs = `// AUTO-GENERATED by scripts/generate-content.mjs — do not edit by hand.
export interface TriviaQuestion {
  category: string;
  age: number;
  prompt: string;
  options: string[];
  answerIndex: number;
  hint?: string;
}

export const TRIVIA_BANK: TriviaQuestion[] = ${JSON.stringify(TRIVIA, null, 0)};

export const TRIVIA_CATEGORIES = Array.from(new Set(TRIVIA_BANK.map(t => t.category)));

export function getTriviaByCategory(cat: string): TriviaQuestion[] {
  return TRIVIA_BANK.filter(t => t.category === cat);
}

export function getTriviaForAge(age: number, count = 10): TriviaQuestion[] {
  const eligible = TRIVIA_BANK.filter(t => Math.abs(t.age - age) <= 2);
  const pool = eligible.length >= count ? eligible : TRIVIA_BANK;
  // simple shuffle
  const a = [...pool];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, count);
}

export function getRandomTrivia(count = 10): TriviaQuestion[] {
  const a = [...TRIVIA_BANK];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, count);
}
`;
fs.writeFileSync(path.join(OUT, "triviaBank.ts"), triviaTs);
console.log("wrote", path.join(OUT, "triviaBank.ts"));

const factsTs = `// AUTO-GENERATED by scripts/generate-content.mjs
export const FUN_FACTS: string[] = ${JSON.stringify(FUN_FACTS, null, 0)};

export function getRandomFact(): string {
  return FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
}

export function getDailyFact(date = new Date()): string {
  const day = Math.floor(date.getTime() / 86400000);
  return FUN_FACTS[day % FUN_FACTS.length];
}
`;
fs.writeFileSync(path.join(OUT, "funFacts.ts"), factsTs);
console.log("wrote", path.join(OUT, "funFacts.ts"));

console.log(`\nDone. Total trivia: ${TRIVIA.length}, Total facts: ${FUN_FACTS.length}`);
