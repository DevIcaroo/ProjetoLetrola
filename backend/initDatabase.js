const db = require('./db');

function criarTabelas() {
  db.serialize(() => {
    // Ativar foreign keys
    db.run("PRAGMA foreign_keys = ON", (err) => {
      if (err) console.error("Erro ao ativar foreign keys:", err);
      else console.log("Foreign keys ativadas com sucesso.");
    });

    // Criação das tabelas
    db.run(`
      CREATE TABLE IF NOT EXISTS progresso (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_jogador TEXT NOT NULL,
        mundo INTEGER NOT NULL,
        fase INTEGER NOT NULL,
        estrelas INTEGER DEFAULT 0,
        tempo_gasto INTEGER,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(id_jogador, mundo, fase)
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
        FOREIGN KEY (personagem_id) REFERENCES personagens(id),
        FOREIGN KEY (mundo, fase) REFERENCES fases(mundo, fase)
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
        FOREIGN KEY (mundo, fase) REFERENCES fases(mundo, fase)
      )
    `, (err) => {
      if (err) {
        console.error("Erro ao criar tabelas:", err);
        return;
      }

      console.log("Tabelas criadas/verificadas com sucesso.");

      // Inserção de dados de teste
      db.get("SELECT COUNT(*) AS count FROM fases", (err, row) => {
        if (err) {
          console.error("Erro ao consultar fases:", err);
          return;
        }

        if (row.count > 0) {
          console.log("Fases já existentes, pulando inserção de teste.");
          return;
        }

        console.log("Inserindo dados de teste...");

        db.run("INSERT OR IGNORE INTO personagens (id, nome) VALUES (?, ?)", 1, 'Macaco', (err) => {
          if (err) {
            console.error("Erro ao inserir personagem:", err);
            return;
          }

          const fasesData = [
            { mundo: 1, fase: 1, nome: 'Mundo 1 - Fase 1', descricao: 'Uva, Maçã e Pera' },
            { mundo: 1, fase: 2, nome: 'Mundo 1 - Fase 2', descricao: 'Côco, Caju e Limão' },
            { mundo: 1, fase: 3, nome: 'Mundo 1 - Fase 3', descricao: 'Manga, Mamão e Banana' },
            { mundo: 1, fase: 4, nome: 'Mundo 1 - Fase 4', descricao: 'Laranja, Abacate e Morango' },
            { mundo: 1, fase: 5, nome: 'Mundo 1 - Fase 5', descricao: 'Abacaxi, Melancia e Maracujá' }
          ];

          const stmtFase = db.prepare("INSERT INTO fases (mundo, fase, nome, descricao) VALUES (?, ?, ?, ?)");
          fasesData.forEach(f => stmtFase.run(f.mundo, f.fase, f.nome, f.descricao));
          stmtFase.finalize((err) => {
            if (err) {
              console.error("Erro ao inserir fases:", err);
              return;
            }

            const dialogosData = [
              { mundo: 1, fase: 1, ordem: 1, personagem_id: 1, fala: 'Olá, bem-vindo ao Mundo 1!', expressao: 'feliz' },
              { mundo: 1, fase: 1, ordem: 2, personagem_id: 1, fala: 'Vamos começar a primeira fase!', expressao: 'animado' },
              { mundo: 1, fase: 2, ordem: 1, personagem_id: 1, fala: 'Que bom que chegou! Agora na fase 2, vamos ver Coco, Caju e Limão.', expressao: 'feliz' },
              { mundo: 1, fase: 3, ordem: 1, personagem_id: 1, fala: 'Você é rápido! Esta fase é sobre Manga, Mamão e Banana.', expressao: 'animado' },
              { mundo: 1, fase: 4, ordem: 1, personagem_id: 1, fala: 'Já na fase 4, temos Laranja, Abacate e Morango.', expressao: 'feliz' },
              { mundo: 1, fase: 5, ordem: 1, personagem_id: 1, fala: 'Última fase do mundo! Abacaxi, Melancia e Maracujá te esperam.', expressao: 'curioso' },
            ];

            const stmtDialogos = db.prepare("INSERT INTO dialogos (mundo, fase, ordem, personagem_id, fala, expressao) VALUES (?, ?, ?, ?, ?, ?)");
            dialogosData.forEach(d => stmtDialogos.run(d.mundo, d.fase, d.ordem, d.personagem_id, d.fala, d.expressao));
            stmtDialogos.finalize((err) => {
              if (err) {
                console.error("Erro ao inserir diálogos:", err);
                return;
              }

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

              const stmtItens = db.prepare("INSERT INTO itens_fase (mundo, fase, ordem, resposta, letras, dica1, dica2, imagem_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
              itensPorFase.forEach((item, index) => {
                const letrasEmbaralhadas = JSON.stringify(item.nome.split('').sort(() => 0.5 - Math.random()));
                const ordem = index % 3 + 1;
                stmtItens.run(item.mundo, item.fase, ordem, item.nome, letrasEmbaralhadas, item.dica1, item.dica2, item.imagem_url);
              });
              stmtItens.finalize((err) => {
                if (err) {
                  console.error("Erro ao inserir itens:", err);
                  return;
                }
                console.log("Dados de teste inseridos com sucesso.");
              });
            });
          });
        });
      });
    });
  });
}

module.exports = criarTabelas;
