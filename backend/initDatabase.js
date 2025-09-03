const db = require('./db');

function criarTabelas() {
  db.serialize(() => {
    // Tabela Progresso
    db.run(`
      CREATE TABLE IF NOT EXISTS progresso (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_jogador TEXT NOT NULL,
        fase INTEGER NOT NULL,
        estrelas INTEGER DEFAULT 0,
        tempo_gasto INTEGER,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(id_jogador, fase)
      )
    `);

    // Tabela Personagens
    db.run(`
      CREATE TABLE IF NOT EXISTS personagens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL
      )
    `);

    // Tabela Fases
    db.run(`
      CREATE TABLE IF NOT EXISTS fases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela Dialogos
    db.run(`
      CREATE TABLE IF NOT EXISTS dialogos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fase INTEGER NOT NULL,
        ordem INTEGER NOT NULL,
        personagem_id INTEGER NOT NULL,
        fala TEXT NOT NULL,
        expressao TEXT,
        FOREIGN KEY (personagem_id) REFERENCES personagens(id)
      )
    `);

    // Tabela Itens Fase
    db.run(`
      CREATE TABLE IF NOT EXISTS itens_fase (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fase_id INTEGER NOT NULL,
        ordem INTEGER NOT NULL,
        resposta TEXT NOT NULL,
        letras TEXT NOT NULL,
        dica1 TEXT,
        dica2 TEXT,
        imagem_url TEXT,
        FOREIGN KEY (fase_id) REFERENCES fases(id)
      )
    `);

    console.log('Tabelas criadas/verificadas com sucesso.');

    // --- Inserção de Dados de Teste ---

    // Apenas insere se as tabelas estiverem vazias
    db.get("SELECT COUNT(*) AS count FROM fases", (err, row) => {
      if (row.count === 0) {
        console.log('Inserindo dados de teste nas tabelas...');
        
        // Dados para a tabela 'fases'
        const stmtFases = db.prepare("INSERT INTO fases (id, nome, descricao) VALUES (?, ?, ?)");
        stmtFases.run(1, 'Frutas Tropicais', 'Fase 1: Conheça as frutas tropicais e suas letras.');
        stmtFases.finalize();

        // Dados para a tabela 'personagens'
        const stmtPersonagens = db.prepare("INSERT INTO personagens (id, nome) VALUES (?, ?)");
        stmtPersonagens.run(1, 'Macaco');
        stmtPersonagens.finalize();

        // Dados para a tabela 'dialogos' (exemplo de diálogos para a Fase 1)
        const dialogosFase1 = [
          { ordem: 1, personagem_id: 1, fala: 'Olá, jogador! Bem-vindo à floresta.', expressao: 'feliz' },
          { ordem: 2, personagem_id: 1, fala: 'Vamos aprender sobre as frutas hoje!', expressao: 'animado' },
          { ordem: 3, personagem_id: 1, fala: 'Arraste as letras para formar a palavra correta.', expressao: 'neutro' }
        ];
        const stmtDialogos = db.prepare("INSERT INTO dialogos (fase, ordem, personagem_id, fala, expressao) VALUES (?, ?, ?, ?, ?)");
        dialogosFase1.forEach((dialogo) => {
          stmtDialogos.run(1, dialogo.ordem, dialogo.personagem_id, dialogo.fala, dialogo.expressao);
        });
        stmtDialogos.finalize();

        // A lista de frutas agora inclui o imagem_url
        const frutas = [
          { nome: 'BANANA', dica1: 'Sou amarela e comprida.', dica2: 'Os macacos me adoram.', imagem_url: '/imagens/banana.png' },
          { nome: 'ABACATE', dica1: 'Sou verde por fora e tenho um caroço grande.', dica2: 'Sou a base para fazer guacamole.', imagem_url: '/imagens/abacate.png' },
          { nome: 'LARANJA', dica1: 'Sou redonda e cheia de gomos.', dica2: 'Tenho muita vitamina C.', imagem_url: '/imagens/laranja.png' },
          { nome: 'MAMÃO', dica1: 'Minha polpa é alaranjada e tenho sementes pretas.', dica2: 'Sou muito bom para ajudar a digestão.', imagem_url: '/imagens/mamao.png' },
          { nome: 'MANGA', dica1: 'Sou uma fruta doce e suculenta.', dica2: 'Meu caroço é grande e chato.', imagem_url: '/imagens/manga.png' },
          { nome: 'ABACAXI', dica1: 'Tenho uma coroa de folhas e casca áspera.', dica2: 'Sou a fruta principal da piña colada.', imagem_url: '/imagens/abacaxi.png' },
          { nome: 'UVA', dica1: 'Somos pequenas e crescemos em cachos.', dica2: 'Somos usadas para fazer suco e vinho.', imagem_url: '/imagens/uva.png' },
          { nome: 'MELANCIA', dica1: 'Sou uma fruta grande, verde por fora e vermelha por dentro.', dica2: 'Sou cheia de água e sementes pretas.', imagem_url: '/imagens/melancia.png' },
          { nome: 'LIMÃO', dica1: 'Sou pequena, verde ou amarela e muito azeda.', dica2: 'Sou o ingrediente secreto da limonada.', imagem_url: '/imagens/limao.png' },
          { nome: 'COCO', dica1: 'Sou marrom e peludo por fora, com água por dentro.', dica2: 'Sou a fruta de um coqueiro.', imagem_url: '/imagens/coco.png' }
        ];

        // Adiciona as letras embaralhadas para cada fruta individualmente
        const stmtItensFase = db.prepare("INSERT INTO itens_fase (fase_id, ordem, resposta, letras, dica1, dica2, imagem_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
        frutas.forEach((fruta, index) => {
          // Cria um banco de letras embaralhadas para cada fruta
          const letrasEmbaralhadasDaFruta = JSON.stringify(fruta.nome.toUpperCase().split('').sort(() => 0.5 - Math.random()));
          stmtItensFase.run(1, index + 1, fruta.nome, letrasEmbaralhadasDaFruta, fruta.dica1, fruta.dica2, fruta.imagem_url);
        });
        stmtItensFase.finalize();

        console.log('Dados de teste inseridos com sucesso.');
      }
    });
  });
}

module.exports = criarTabelas;