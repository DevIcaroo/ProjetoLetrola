// Importa a configuração da base de dados do ficheiro db.js
const db = require('./db');

// Define a função principal que irá criar e popular as tabelas
function criarTabelas() {
  // db.serialize garante que os comandos dentro dele sejam executados um após o outro, por ordem.
  db.serialize(() => {
    // Este comando é crucial para garantir que as 'FOREIGN KEY' (relações entre tabelas) funcionem corretamente.
    db.run("PRAGMA foreign_keys = ON");

    // --- CRIAÇÃO DAS TABELAS ---

    // Tabela para armazenar os dados de login dos jogadores.
    db.run(`
      CREATE TABLE IF NOT EXISTS jogadores (
        id INTEGER PRIMARY KEY AUTOINCREMENT, -- ID numérico único para cada jogador
        nome TEXT NOT NULL UNIQUE            -- Nome do jogador, não pode ser repetido
      )
    `);
    
    // Tabela para armazenar o progresso de cada jogo salvo.
    db.run(`
      CREATE TABLE IF NOT EXISTS progresso (
        id INTEGER PRIMARY KEY AUTOINCREMENT,      -- ID único para cada registo de progresso
        id_jogador INTEGER NOT NULL,               -- Liga o progresso a um jogador da tabela 'jogadores'
        mundo INTEGER NOT NULL,                    -- O número do mundo (ex: 1, 2, 3)
        fase INTEGER NOT NULL,                     -- O número da fase (ex: 1, 2, 3)
        estrelas INTEGER DEFAULT 0,                -- Quantidade de estrelas ganhas (0 a 3)
        tempo_gasto INTEGER,                       -- Tempo em segundos que o jogador levou
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Data e hora em que o progresso foi salvo
        ativo INTEGER NOT NULL DEFAULT 1,          -- 1 para ativo, 0 para arquivado
        UNIQUE(id_jogador, mundo, fase, ativo),    -- Impede registos duplicados para o mesmo nível no jogo ativo
        FOREIGN KEY (id_jogador) REFERENCES jogadores(id) -- Cria a relação com a tabela 'jogadores'
      )
    `);

    // Tabela para guardar os personagens que aparecem nos diálogos.
    db.run(`
      CREATE TABLE IF NOT EXISTS personagens (
        id INTEGER PRIMARY KEY AUTOINCREMENT, -- ID único do personagem
        nome TEXT NOT NULL                  -- Nome do personagem (ex: 'Macaco')
      )
    `);

    // Tabela com as informações de cada fase de cada mundo.
    db.run(`
      CREATE TABLE IF NOT EXISTS fases (
        mundo INTEGER NOT NULL,     -- O mundo ao qual a fase pertence
        fase INTEGER NOT NULL,      -- O número da fase
        nome TEXT NOT NULL,         -- Nome da fase (ex: 'Mundo 1 - Fase 1')
        descricao TEXT,             -- Uma breve descrição da fase
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (mundo, fase)   -- A combinação de mundo e fase deve ser única
      )
    `);

    // Tabela para armazenar as falas dos diálogos de cada fase.
    db.run(`
      CREATE TABLE IF NOT EXISTS dialogos (
        id INTEGER PRIMARY KEY AUTOINCREMENT, -- ID único do diálogo
        mundo INTEGER NOT NULL,               -- Mundo em que o diálogo ocorre
        fase INTEGER NOT NULL,                -- Fase em que o diálogo ocorre
        ordem INTEGER NOT NULL,               -- A ordem em que as falas aparecem
        personagem_id INTEGER NOT NULL,       -- ID do personagem que está a falar
        fala TEXT NOT NULL,                   -- O texto do diálogo
        expressao TEXT,                       -- A expressão do personagem (ex: 'feliz', 'triste')
        FOREIGN KEY (personagem_id) REFERENCES personagens(id), -- Relação com a tabela 'personagens'
        FOREIGN KEY (mundo, fase) REFERENCES fases(mundo, fase)    -- Relação com a tabela 'fases'
      )
    `);

    // Tabela para os itens/desafios de cada fase (ex: adivinhar a palavra).
    db.run(`
      CREATE TABLE IF NOT EXISTS itens_fase (
        id INTEGER PRIMARY KEY AUTOINCREMENT, -- ID único do item
        mundo INTEGER NOT NULL,
        fase INTEGER NOT NULL,
        ordem INTEGER NOT NULL,               -- Ordem do item dentro da fase
        resposta TEXT NOT NULL,               -- A palavra correta
        letras TEXT NOT NULL,                 -- As letras baralhadas para o jogador usar
        dica1 TEXT,                           -- Primeira dica
        dica2 TEXT,                           -- Segunda dica
        imagem_url TEXT,                      -- Caminho para a imagem do item
        FOREIGN KEY (mundo, fase) REFERENCES fases(mundo, fase) -- Relação com a tabela 'fases'
      )
    `, (err) => {
      if (err) {
        console.error("Erro ao criar tabelas:", err);
        return;
      }
      console.log("Tabelas criadas/verificadas com sucesso.");
      
      // Chama a função para popular a base de dados com dados iniciais.
      seedDatabase(); 
    });
  });
}

/**
 * ✅ [CÓDIGO MODIFICADO]
 * Esta função insere os dados iniciais de forma sequencial e controlada para evitar erros.
 */
function seedDatabase() {
  // Primeiro, verifica se a base de dados já tem dados para não inserir tudo de novo.
  db.get("SELECT COUNT(*) AS count FROM fases", (err, row) => {
    if (err) {
      console.error("Erro ao consultar a base de dados:", err);
      return;
    }
    // Se já existirem fases, para a execução.
    if (row && row.count > 0) {
      console.log("A base de dados já contém dados, a inserção de teste foi ignorada.");
      return;
    }

    console.log("A inserir dados de teste...");

    // --- Dados a serem inseridos ---
    const personagensData = [{ id: 1, nome: 'Macaco' }];
    const fasesData = [
        { mundo: 1, fase: 1, nome: 'Mundo 1 - Fase 1', descricao: 'Uva, Maçã e Pera' },
        { mundo: 1, fase: 2, nome: 'Mundo 1 - Fase 2', descricao: 'Côco, Caju e Limão' },
        { mundo: 1, fase: 3, nome: 'Mundo 1 - Fase 3', descricao: 'Manga, Mamão e Banana' },
        { mundo: 1, fase: 4, nome: 'Mundo 1 - Fase 4', descricao: 'Laranja, Abacate e Morango' },
        { mundo: 1, fase: 5, nome: 'Mundo 1 - Fase 5', descricao: 'Abacaxi, Melancia e Maracujá' }
    ];
    const dialogosData = [
        { mundo: 1, fase: 1, ordem: 1, personagem_id: 1, fala: 'Olá, bem-vindo ao Mundo 1!', expressao: 'feliz' },
        { mundo: 1, fase: 1, ordem: 2, personagem_id: 1, fala: 'Vamos começar a primeira fase!', expressao: 'animado' },
        { mundo: 1, fase: 2, ordem: 1, personagem_id: 1, fala: 'Que bom que chegou! Agora na fase 2, vamos ver Coco, Caju e Limão.', expressao: 'feliz' },
        { mundo: 1, fase: 3, ordem: 1, personagem_id: 1, fala: 'Você é rápido! Esta fase é sobre Manga, Mamão e Banana.', expressao: 'animado' },
        { mundo: 1, fase: 4, ordem: 1, personagem_id: 1, fala: 'Já na fase 4, temos Laranja, Abacate e Morango.', expressao: 'feliz' },
        { mundo: 1, fase: 5, ordem: 1, personagem_id: 1, fala: 'Última fase do mundo! Abacaxi, Melancia e Maracujá te esperam.', expressao: 'curioso' },
    ];
    const itensPorFase = [
        { mundo: 1, fase: 1, nome: 'UVA', dica1: 'Sou uma fruta pequena.', dica2: 'Cresço em cachos e faço suco.', imagem_url: '/uva.svg' },
        { mundo: 1, fase: 1, nome: 'MAÇÃ', dica1: 'Sou redonda e tenho uma coroa.', dica2: 'Posso ser vermelha ou verde, e sou crocante.', imagem_url: '/public/maca.svg' },
        { mundo: 1, fase: 1, nome: 'PERA', dica1: 'Tenho um formato de lágrima.', dica2: 'Muitos me comem com queijo.', imagem_url: '/public/pera.svg' },
        { mundo: 1, fase: 2, nome: 'COCO', dica1: 'Sou uma fruta grande e redonda.', dica2: 'Tenho água por dentro e sou peludo por fora.', imagem_url: '/public/coco.svg' },
        { mundo: 1, fase: 2, nome: 'CAJU', dica1: 'Sou uma fruta que tem uma castanha na ponta.', dica2: 'Meu suco é muito gostoso.', imagem_url: '/public/caju.svg' },
        { mundo: 1, fase: 2, nome: 'LIMÃO', dica1: 'Sou uma fruta azeda.', dica2: 'Sou o principal ingrediente da limonada.', imagem_url: '/public/limao.svg' },
        { mundo: 1, fase: 3, nome: 'MANGA', dica1: 'Sou uma fruta suculenta.', dica2: 'Tenho um caroço grande e sou muito doce.', imagem_url: '/public/manga.svg' },
        { mundo: 1, fase: 3, nome: 'MAMÃO', dica1: 'Sou uma fruta alaranjada.', dica2: 'Tenho sementes pretas e sou ótimo para a digestão.', imagem_url: '/public/mamao.svg' },
        { mundo: 1, fase: 3, nome: 'BANANA', dica1: 'Sou amarela e comprida.', dica2: 'Os macacos me adoram.', imagem_url: '/public/banana.svg' },
        { mundo: 1, fase: 4, nome: 'LARANJA', dica1: 'Sou uma fruta redonda com gomos.', dica2: 'Sou rica em vitamina C.', imagem_url: '/public/laranja.svg' },
        { mundo: 1, fase: 4, nome: 'ABACATE', dica1: 'Sou verde por fora e macio por dentro.', dica2: 'Tenho um caroço grande no meio.', imagem_url: '/public/abacate.svg' },
        { mundo: 1, fase: 4, nome: 'MORANGO', dica1: 'Sou uma fruta vermelha e pequena.', dica2: 'Cresço pertinho do chão.', imagem_url: '/public/morango.svg' },
        { mundo: 1, fase: 5, nome: 'ABACAXI', dica1: 'Tenho uma coroa de folhas e sou áspero por fora.', dica2: 'Sou a fruta que a piña colada usa.', imagem_url: '/public/abacaxi.svg' },
        { mundo: 1, fase: 5, nome: 'MELANCIA', dica1: 'Sou a fruta grande, verde por fora e vermelha por dentro.', dica2: 'Sou cheia de água e sou muito refrescante.', imagem_url: '/public/melancia.svg' },
        { mundo: 1, fase: 5, nome: 'MARACUJÁ', dica1: 'Sou uma fruta amarela e redonda.', dica2: 'Meu suco é azedinho e me chamam de fruta da paixão.', imagem_url: '/public/maracuja.svg' }
    ];

    // Este db.serialize garante que a inserção de cada tabela espera pela anterior,
    // resolvendo o erro de FOREIGN KEY.
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
      itensPorFase.forEach((item, index) => {
        const letrasEmbaralhadas = JSON.stringify(item.nome.split('').sort(() => 0.5 - Math.random()));
        const ordem = (index % 3) + 1;
        stmtItens.run(item.mundo, item.fase, ordem, item.nome, letrasEmbaralhadas, item.dica1, item.dica2, item.imagem_url);
      });
      stmtItens.finalize((err) => {
          if(!err) console.log("Dados de teste inseridos com sucesso.");
      });
    });
  });
}

// Exporta a função para que ela possa ser chamada noutros ficheiros (como no seu server.js).
module.exports = criarTabelas;