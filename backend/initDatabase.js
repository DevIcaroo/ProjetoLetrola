const db = require('./db');

function criarTabelas() {
  db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");

    db.run(`
      CREATE TABLE IF NOT EXISTS jogadores (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      nome TEXT NOT NULL UNIQUE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS progresso (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      id_jogador INTEGER NOT NULL, 
      mundo INTEGER NOT NULL, 
      fase INTEGER NOT NULL, 
      estrelas INTEGER DEFAULT 0, 
      tempo_gasto INTEGER, 
      data TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
      ativo INTEGER NOT NULL DEFAULT 1, 
      UNIQUE(id_jogador, mundo, fase, ativo), 
      FOREIGN KEY (id_jogador) 
      REFERENCES jogadores(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS personagens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL
        )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS fases (
      mundo INTEGER NOT NULL,
      fase INTEGER NOT NULL,
      nome TEXT NOT NULL,
      descricao TEXT, 
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (mundo, fase)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS dialogos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mundo INTEGER NOT NULL, 
      fase INTEGER NOT NULL, 
      ordem INTEGER NOT NULL, 
      personagem_id INTEGER NOT NULL, 
      fala TEXT NOT NULL, 
      expressao TEXT, 
      FOREIGN KEY (personagem_id) 
      REFERENCES personagens(id), 
      FOREIGN KEY (mundo, fase) 
      REFERENCES fases(mundo, fase)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS itens_fase (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mundo INTEGER NOT NULL,
      fase INTEGER NOT NULL,
      ordem INTEGER NOT NULL,
      resposta TEXT NOT NULL,
      letras TEXT NOT NULL,
      dica1 TEXT,
      dica2 TEXT,
      imagem_url TEXT,
      FOREIGN KEY (mundo, fase)
      REFERENCES fases(mundo, fase)
      )
    `);
    
    //NOVA TABELA PARA A CRUZADINHA ADICIONADA AQUI
    db.run(`
      CREATE TABLE IF NOT EXISTS cruzadinhas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mundo INTEGER NOT NULL,
        fase INTEGER NOT NULL,
        palavra TEXT NOT NULL,
        dica TEXT NOT NULL,
        posicao_x INTEGER NOT NULL,
        posicao_y INTEGER NOT NULL,
        orientacao TEXT NOT NULL,
        UNIQUE(mundo, fase, palavra)
      )
    `, (err) => {
      if (err) {
        console.error("Erro ao criar tabelas:", err);
        return;
      }
      console.log("Tabelas criadas/verificadas com sucesso.");
      seedDatabase();
    });
  });
}

function seedDatabase() {
  db.get("SELECT COUNT(*) AS count FROM fases", (err, row) => {
    if (err) {
      console.error("Erro ao consultar a base de dados:", err);
      return;
    }
    if (row && row.count > 0) {
      console.log("A base de dados já contém dados, a inserção de teste foi ignorada.");
      return;
    }

    console.log("A inserir dados de teste...");

    const personagensData = [
        { id: 1, nome: 'Macaco' }, 
        { id: 2, nome: 'Urso Polar' },
        { id: 3, nome: 'Sapo' }
    ];

    const fasesData = [
      // Fases do Mundo 1
        { mundo: 1, fase: 1, nome: 'Mundo 1 - Fase 1', descricao: 'Uva, Maçã e Pera' },
        { mundo: 1, fase: 2, nome: 'Mundo 1 - Fase 2', descricao: 'Côco, Caju e Limão' },
        { mundo: 1, fase: 3, nome: 'Mundo 1 - Fase 3', descricao: 'Manga, Mamão e Banana' },
        { mundo: 1, fase: 4, nome: 'Mundo 1 - Fase 4', descricao: 'Laranja, Abacate e Morango' },
        { mundo: 1, fase: 5, nome: 'Mundo 1 - Fase 5', descricao: 'Abacaxi, Melancia e Maracujá' },

        // Fases do Mundo 2 
        { mundo: 2, fase: 1, nome: 'Mundo 2 - Fase 1', descricao: 'Bebidas - Nível 1' },
        { mundo: 2, fase: 2, nome: 'Mundo 2 - Fase 2', descricao: 'Bebidas - Nível 2' },
        { mundo: 2, fase: 3, nome: 'Mundo 2 - Fase 3', descricao: 'Bebidas - Nível 3' },
        { mundo: 2, fase: 4, nome: 'Mundo 2 - Fase 4', descricao: 'Bebidas - Nível 4' },
        { mundo: 2, fase: 5, nome: 'Mundo 2 - Fase 5', descricao: 'Bebidas - Nível 5' },

        // Fases do Mundo 3 
        { mundo: 3, fase: 1, nome: 'Cruzadinha - Nível 1', descricao: 'Decorações Simples' },
        { mundo: 3, fase: 2, nome: 'Cruzadinha - Nível 2', descricao: 'Mais Decorações' },
        { mundo: 3, fase: 3, nome: 'Cruzadinha - Nível 3', descricao: 'Enfeitando Tudo' },
        { mundo: 3, fase: 4, nome: 'Cruzadinha - Nível 4', descricao: 'Brilho e Cor' },
        { mundo: 3, fase: 5, nome: 'Cruzadinha - Nível 5', descricao: 'A Grande Festa' },
    ];

    const dialogosData = [
        { mundo: 1, fase: 1, ordem: 1, personagem_id: 1, fala: 'Olá, bem-vindo ao Mundo 1!', expressao: 'feliz' },
        { mundo: 2, fase: 1, ordem: 1, personagem_id: 2, fala: 'Brrr! Bem-vindo ao meu mundo gelado!', expressao: 'feliz' },
        { mundo: 3, fase: 1, ordem: 1, personagem_id: 3, fala: 'Olá, amiguinho! Sou o Hebert, o sapo, e adoro um desafio!', expressao: 'feliz' },
    ];

    const itensPorFase = [
        // --- Itens do Mundo 1 (Frutas) ---
        { 
          mundo: 1, 
          fase: 1, 
          nome: 'UVA', 
          dica1: 'Começa com a letra U.', 
          dica2: 'É uma palavra bem curta, com 3 letras.', 
          imagem_url: '/uva.svg'
        },
        { 
          mundo: 1, 
          fase: 1, 
          nome: 'MAÇÃ', 
          dica1: 'É uma palavra com 4 letras.',
          dica2: 'Termina com o som de "Ã". Cuidado com o tio (~)!', 
          imagem_url: '/maca.svg' 
        },
        { 
          mundo: 1, 
          fase: 1, 
          nome: 'PERA', 
          dica1: 'Rima com a palavra "ERA".', 
          dica2: 'Começa com a sílaba "PE".', 
          imagem_url: '/pera.svg' 
        },
        {
          mundo: 1, 
          fase: 2, 
          nome: 'COCO', 
          dica1: 'A letra O aparece duas vezes.', 
          dica2: 'Usa a letra C duas vezes.', 
          imagem_url: '/coco.svg' 
        },
        { 
          mundo: 1, 
          fase: 2, 
          nome: 'CAJU', 
          dica1: 'Termina com a letra U.', 
          dica2: 'A primeira sílaba é "CA".', 
          imagem_url: '/caju.svg' 
        },
        { 
          mundo: 1, 
          fase: 2, 
          nome: 'LIMÃO', 
          dica1: 'Rima com a palavra "MÃO".', 
          dica2: 'Tem um acento tio (~) na letra A.', 
          imagem_url: '/limao.svg' 
        },
        { 
          mundo: 1, 
          fase: 3, 
          nome: 'MANGA', 
          dica1: 'É uma palavra com 5 letras.', 
          dica2: 'Termina com as letras G e A.', 
          imagem_url: '/manga.svg' 
        },
        { 
          mundo: 1, 
          fase: 3, 
          nome: 'MAMÃO', 
          dica1: 'Começa com a sílaba "MA".', 
          dica2: 'Também rima com "MÃO".', 
          imagem_url: '/mamao.svg' 
        },
        { 
          mundo: 1, 
          fase: 3, 
          nome: 'BANANA', 
          dica1: 'Tem 6 letras e 3 delas são a letra A.', 
          dica2: 'Termina com a sílaba "NA".', 
          imagem_url: '/banana.svg' 
        },
        { 
          mundo: 1, 
          fase: 4, 
          nome: 'LARANJA', 
          dica1: 'Começa com "LA" e termina com "JA".', 
          dica2: 'A sílaba do meio é "RAN".', 
          imagem_url: '/laranja.svg' 
        },
        { 
          mundo: 1, 
          fase: 4, 
          nome: 'ABACATE', 
          dica1: 'É uma palavra com 4 sílabas.', 
          dica2: 'Começa com a letra A.', 
          imagem_url: '/abacate.svg' 
        },
        { 
          mundo: 1, 
          fase: 4, 
          nome: 'MORANGO', 
          dica1: 'A sílaba do meio é "RAN".',
          dica2: 'Começa com "MO" e termina com "GO".', 
          imagem_url: '/morango.svg' 
        },
        { 
          mundo: 1, 
          fase: 5, 
          nome: 'ABACAXI', 
          dica1: 'Começa com "A" e termina com "I".', 
          dica2: 'Escreve-se com X e não com CH.', 
          imagem_url: '/abacaxi.svg' 
        },
        { 
          mundo: 1, 
          fase: 5, 
          nome: 'MELANCIA',
          dica1: 'Começa com a sílaba "ME".', 
          dica2: 'A sílaba do meio é "LAN".', 
          imagem_url: '/melancia.svg' 
        },
        { 
          mundo: 1, 
          fase: 5, 
          nome: 'MARACUJÁ', 
          dica1: 'Usa a letra Jota (J).',
          dica2: 'Tem um acento agudo na última letra!', 
          imagem_url: '/maracuja.svg' 
        },

        // --- Itens do Mundo 2 (Bebidas) ---
        {
          mundo: 2,
          fase: 1,
          nome: 'SUCO',
          dica1: 'Começa com a letra S.',
          dica2: 'É uma palavra com 4 letras e 2 sílabas.',
          imagem_url: '/suco.svg'
        },
        {
          mundo: 2,
          fase: 1,
          nome: 'LEITE',
          dica1: 'Começa com a letra L.',
          dica2: 'Termina com a sílaba "TE".',
          imagem_url: '/leite.svg'
        },
        {
          mundo: 2,
          fase: 1,
          nome: 'CAFÉ',
          dica1: 'Tem um acento agudo no final!',
          dica2: 'Rima com "PÉ".',
          imagem_url: '/cafe.svg'
        },
        {
          mundo: 2,
          fase: 2,
          nome: 'ÁGUA',
          dica1: 'Começa com a letra A e tem acento.',
          dica2: 'A segunda sílaba é "GUA".',
          imagem_url: '/agua.svg'
        },
        {
          mundo: 2,
          fase: 2,
          nome: 'VITAMINA',
          dica1: 'É uma palavra grande, com 8 letras!',
          dica2: 'Termina com a sílaba "NA".',
          imagem_url: '/vitamina.svg'
        },
        {
          mundo: 2,
          fase: 2,
          nome: 'LIMONADA',
          dica1: 'Começa com "LI" e termina com "DA".',
          dica2: 'Tem 4 sílabas.',
          imagem_url: '/limonada.svg'
        },
        {
          mundo: 2,
          fase: 3,
          nome: 'SUCO DE MORANGO',
          dica1: 'São três palavras separadas.',
          dica2: 'A última palavra é "MORANGO".',
          imagem_url: '/suco_morango.svg'
        },
        {
          mundo: 2,
          fase: 3,
          nome: 'LARANJADA',
          dica1: 'Começa com "LA" e termina com "DA".',
          dica2: 'É uma palavra com 4 sílabas.',
          imagem_url: '/laranjada.svg'
        },
        {
          mundo: 2,
          fase: 3,
          nome: 'CALDO DE CANA',
          dica1: 'São três palavras e a do meio é "DE".',
          dica2: 'A última palavra é "CANA".',
          imagem_url: '/caldo_de_cana.svg'
        },
        {
          mundo: 2,
          fase: 4,
          nome: 'IOGURTE',
          dica1: 'É uma palavra com 7 letras.',
          dica2: 'Termina com a sílaba "TE".',
          imagem_url: '/iogurte.svg'
        },
        {
          mundo: 2,
          fase: 4,
          nome: 'ÁGUA DE COCO',
          dica1: 'A primeira palavra tem acento.',
          dica2: 'A última palavra é "COCO".',
          imagem_url: '/agua_de_coco.svg'
        },
        {
          mundo: 2,
          fase: 4,
          nome: 'ACHOCOLATADO',
          dica1: 'É uma palavra bem grande!',
          dica2: 'Começa com "A" e termina com "DO".',
          imagem_url: '/achocolatado.svg'
        },
        {
          mundo: 2,
          fase: 5,
          nome: 'REFRIGERANTE',
          dica1: 'A sílaba do meio é "GE".',
          dica2: 'Termina com "RANTE".',
          imagem_url: '/refrigerante.svg'
        },
        {
          mundo: 2,
          fase: 5,
          nome: 'CHÁ',
          dica1: 'É uma palavra bem curta, com 3 letras.',
          dica2: 'Começa com as letras C e H juntas.',
          imagem_url: '/cha.svg'
        },
        {
          mundo: 2,
          fase: 5,
          nome: 'CHAMITO',
          dica1: 'Começa com o som de "CHA".',
          dica2: 'Termina com a sílaba "TO".',
          imagem_url: '/chamito.svg'
        },
    ]

    const cruzadinhasData = [
      // --- Itens do Mundo 3, (Cruzadinha) ---
        {
          mundo: 3,
          fase: 1,
          palavra: 'FITA',
          dica: 'Usada para fazer laços em presentes.',
          x: 0,
          y: 1,
          orientacao: 'horizontal'
        },
        {
          mundo: 3,
          fase: 1,
          palavra: 'FLOR',
          dica: 'Colorida e perfumada, enfeita o jardim.',
          x: 1,
          y: 0,
          orientacao: 'vertical'
        },
        {
          mundo: 3,
          fase: 1,
          palavra: 'BOLA',
          dica: 'Redonda e usada em muitas brincadeiras.',
          x: 3,
          y: 1,
          orientacao: 'vertical'
        },
        {
          mundo: 3,
          fase: 2,
          palavra: 'VELA',
          dica: 'Ilumina o bolo de aniversário.',
          x: 1,
          y: 2,
          orientacao: 'horizontal'
        },
        {
          mundo: 3,
          fase: 2,
          palavra: 'LAÇO',
          dica: 'Um nó bonito feito com fita.',
          x: 3,
          y: 0,
          orientacao: 'vertical'
        },
        {
          mundo: 3,
          fase: 2,
          palavra: 'PAINEL',
          dica: 'Fica na parede atrás da mesa do bolo.',
          x: 0,
          y: 4,
          orientacao: 'horizontal'
        },
        {
          mundo: 3,
          fase: 2,
          palavra: 'LÂMPADA',
          dica: 'Objeto que produz luz.',
          x: 5,
          y: 1,
          orientacao: 'vertical'
        },
        {
          mundo: 3,
          fase: 2,
          palavra: 'BANDEIRA',
          dica: 'Pedaço de pano colorido para enfeitar.',
          x: 0,
          y: 6,
          orientacao: 'horizontal'
        },
        {
          mundo: 3,
          fase: 3,
          palavra: 'BALÃO',
          dica: 'Leve e cheio de ar, flutua na festa.',
          x: 0,
          y: 0,
          orientacao: 'horizontal'
        },
        {
          mundo: 3,
          fase: 3,
          palavra: 'ESTRELA',
          dica: 'Brilha no céu e também em decorações.',
          x: 0,
          y: 0,
          orientacao: 'vertical'
        },
        {
          mundo: 3,
          fase: 3,
          palavra: 'CORDA',
          dica: 'Usada para amarrar ou pendurar coisas.',
          x: 0,
          y: 0,
          orientacao: 'horizontal'
        },
        {
          mundo: 3,
          fase: 3,
          palavra: 'TECIDO',
          dica: 'Pano usado para fazer toalhas de mesa.',
          x: 0,
          y: 0,
          orientacao: 'vertical'
        },
        {
          mundo: 3,
          fase: 3,
          palavra: 'GUIZO',
          dica: 'Pequena esfera de metal que faz barulho.',
          x: 0,
          y: 0,
          orientacao: 'horizontal'
        },
        {
          mundo: 3,
          fase: 4,
          palavra: 'GLITTER',
          dica: 'Pó brilhante usado para decorar.',
          x: 0,
          y: 0,
          orientacao: 'horizontal'
        },
        {
          mundo: 3,
          fase: 4,
          palavra: 'POMPOM',
          dica: 'Bolinha fofa de lã ou papel.',
          x: 0,
          y: 0,
          orientacao: 'vertical'
        },
        {
          mundo: 3,
          fase: 4,
          palavra: 'FITAS',
          dica: 'Tiras compridas e coloridas para enfeitar.',
          x: 0,
          y: 0,
          orientacao: 'horizontal'
        },
        {
          mundo: 3,
          fase: 4,
          palavra: 'LUZES',
          dica: 'Fios com pequenas lâmpadas que acendem.',
          x: 0,
          y: 0,
          orientacao: 'vertical'
        },
        {
          mundo: 3,
          fase: 4,
          palavra: 'LANTEJOULA',
          dica: 'Pequeno disco brilhante para costurar em roupas.',
          x: 0,
          y: 0,
          orientacao: 'horizontal'
        },
        {
          mundo: 3,
          fase: 4,
          palavra: 'CONFETE',
          dica: 'Pequenos pedaços de papel coloridos jogados em festas.',
          x: 0,
          y: 0,
          orientacao: 'vertical'
        },
        {
          mundo: 3,
          fase: 4,
          palavra: 'GUIRLANDA',
          dica: 'Círculo de flores ou ramos para enfeitar portas.',
          x: 0,
          y: 0,
          orientacao: 'horizontal'
        },
        {
          mundo: 3,
          fase: 5,
          palavra: 'DECORAÇÃO',
          dica: 'O ato de enfeitar um ambiente.',
          x: 0,
          y: 0,
          orientacao: 'horizontal'
        },
        {
          mundo: 3,
          fase: 5,
          palavra: 'BANDEIRINHAS',
          dica: 'Pequenas bandeiras de papel unidas por um cordão.',
          x: 0,
          y: 0,
          orientacao: 'vertical'
        },
        {
          mundo: 3,
          fase: 5,
          palavra: 'ENFEITE',
          dica: 'Qualquer objeto usado para embelezar.',
          x: 0,
          y: 0,
          orientacao: 'horizontal'
        },
        {
          mundo: 3,
          fase: 5,
          palavra: 'COLORIDO',
          dica: 'Que tem muitas cores.',
          x: 0,
          y: 0,
          orientacao: 'vertical'
        },
        {
          mundo: 3,
          fase: 5,
          palavra: 'PISCA',
          dica: 'Luz que acende e apaga.',
          x: 0,
          y: 0,
          orientacao: 'horizontal'
        },
        {
          mundo: 3,
          fase: 5,
          palavra: 'FLORIDO',
          dica: 'Que está coberto de flores.',
          x: 0,
          y: 0,
          orientacao: 'vertical'
        },
        {
          mundo: 3,
          fase: 5,
          palavra: 'ARCO',
          dica: 'Estrutura curvada, muitas vezes com balões.',
          x: 0,
          y: 0,
          orientacao: 'horizontal'
        }
    ];

    db.serialize(() => {
      const stmtPersonagens = db.prepare("INSERT INTO personagens (id, nome) VALUES (?, ?)");
      personagensData.forEach(p => stmtPersonagens.run(p.id, p.nome));
      stmtPersonagens.finalize();

      const stmtFases = db.prepare("INSERT INTO fases (mundo, fase, nome, descricao) VALUES (?, ?, ?, ?)");
      fasesData.forEach(f => stmtFases.run(f.mundo, f.fase, f.nome, f.descricao));
      stmtFases.finalize();

      const stmtDialogos = db.prepare("INSERT INTO dialogos (mundo, fase, ordem, personagem_id, fala, expressao) VALUES (?, ?, ?, ?, ?, ?)");
      dialogosData.forEach(d => stmtDialogos.run(d.mundo, d.fase, d.ordem, d.personagem_id, d.fala, d.expressao));
      stmtDialogos.finalize();

      const stmtItens = db.prepare("INSERT INTO itens_fase (mundo, fase, ordem, resposta, letras, dica1, dica2, imagem_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
      let ordemContador = {};
      itensPorFase.forEach((item) => {
        const chaveFase = `${item.mundo}-${item.fase}`;
        if (!ordemContador[chaveFase]) ordemContador[chaveFase] = 1;

        const pecasDoPuzzle = item.nome.split('');
        let pecasEmbaralhadas;
        do {
            pecasEmbaralhadas = [...pecasDoPuzzle].sort(() => 0.5 - Math.random());
        } while (pecasEmbaralhadas.join('') === item.nome && pecasDoPuzzle.length > 1);

        const jsonPecas = JSON.stringify(pecasEmbaralhadas);
        const ordem = ordemContador[chaveFase];
        stmtItens.run(item.mundo, item.fase, ordem, item.nome, jsonPecas, item.dica1, item.dica2, item.imagem_url);
        ordemContador[chaveFase]++;
      });
      stmtItens.finalize();

      //LÓGICA DE INSERÇÃO PARA A CRUZADINHA ADICIONADA AQUI 
      const stmtCruzadinhas = db.prepare("INSERT INTO cruzadinhas (mundo, fase, palavra, dica, posicao_x, posicao_y, orientacao) VALUES (?, ?, ?, ?, ?, ?, ?)");
      cruzadinhasData.forEach(item => {
        stmtCruzadinhas.run(item.mundo, item.fase, item.palavra, item.dica, item.x, item.y, item.orientacao);
      });
      stmtCruzadinhas.finalize((err) => {
          if(!err) console.log("Dados de teste inseridos com sucesso.");
      });
    });
  });
}

module.exports = criarTabelas;