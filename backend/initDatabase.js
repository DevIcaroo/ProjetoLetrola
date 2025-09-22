// Importa a configuração da base de dados do ficheiro db.js
const db = require('./db');

// Define a função principal que irá criar e popular as tabelas
function criarTabelas() {
  db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");

    // --- CRIAÇÃO DAS TABELAS ---
    db.run(`CREATE TABLE IF NOT EXISTS jogadores (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL UNIQUE)`);
    db.run(`CREATE TABLE IF NOT EXISTS progresso (id INTEGER PRIMARY KEY AUTOINCREMENT, id_jogador INTEGER NOT NULL, mundo INTEGER NOT NULL, fase INTEGER NOT NULL, estrelas INTEGER DEFAULT 0, tempo_gasto INTEGER, data TIMESTAMP DEFAULT CURRENT_TIMESTAMP, ativo INTEGER NOT NULL DEFAULT 1, UNIQUE(id_jogador, mundo, fase, ativo), FOREIGN KEY (id_jogador) REFERENCES jogadores(id))`);
    db.run(`CREATE TABLE IF NOT EXISTS personagens (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL)`);
    db.run(`CREATE TABLE IF NOT EXISTS fases (mundo INTEGER NOT NULL, fase INTEGER NOT NULL, nome TEXT NOT NULL, descricao TEXT, criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (mundo, fase))`);
    db.run(`CREATE TABLE IF NOT EXISTS dialogos (id INTEGER PRIMARY KEY AUTOINCREMENT, mundo INTEGER NOT NULL, fase INTEGER NOT NULL, ordem INTEGER NOT NULL, personagem_id INTEGER NOT NULL, fala TEXT NOT NULL, expressao TEXT, FOREIGN KEY (personagem_id) REFERENCES personagens(id), FOREIGN KEY (mundo, fase) REFERENCES fases(mundo, fase))`);
    db.run(`CREATE TABLE IF NOT EXISTS itens_fase (id INTEGER PRIMARY KEY AUTOINCREMENT, mundo INTEGER NOT NULL, fase INTEGER NOT NULL, ordem INTEGER NOT NULL, resposta TEXT NOT NULL, letras TEXT NOT NULL, dica1 TEXT, dica2 TEXT, imagem_url TEXT, FOREIGN KEY (mundo, fase) REFERENCES fases(mundo, fase))`, (err) => {
      if (err) {
        console.error("Erro ao criar tabelas:", err);
        return;
      }
      console.log("Tabelas criadas/verificadas com sucesso.");
      seedDatabase(); 
    });
  });
}

/**
 * Esta função insere os dados iniciais.
 */
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

    // --- Dados a serem inseridos ---
    const personagensData = [
        { id: 1, nome: 'Macaco' },
        { id: 2, nome: 'Urso Polar' }
    ];

    const fasesData = [
        { mundo: 1, fase: 1, nome: 'Mundo 1 - Fase 1', descricao: 'Uva, Maçã e Pera' },
        { mundo: 1, fase: 2, nome: 'Mundo 1 - Fase 2', descricao: 'Côco, Caju e Limão' },
        { mundo: 1, fase: 3, nome: 'Mundo 1 - Fase 3', descricao: 'Manga, Mamão e Banana' },
        { mundo: 1, fase: 4, nome: 'Mundo 1 - Fase 4', descricao: 'Laranja, Abacate e Morango' },
        { mundo: 1, fase: 5, nome: 'Mundo 1 - Fase 5', descricao: 'Abacaxi, Melancia e Maracujá' },
        { mundo: 2, fase: 1, nome: 'Mundo 2 - Fase 1', descricao: 'Bebidas - Nível 1' },
        { mundo: 2, fase: 2, nome: 'Mundo 2 - Fase 2', descricao: 'Bebidas - Nível 2' },
        { mundo: 2, fase: 3, nome: 'Mundo 2 - Fase 3', descricao: 'Bebidas - Nível 3' },
        { mundo: 2, fase: 4, nome: 'Mundo 2 - Fase 4', descricao: 'Bebidas - Nível 4' },
        { mundo: 2, fase: 5, nome: 'Mundo 2 - Fase 5', descricao: 'Bebidas - Nível 5' },
    ];

    const dialogosData = [
        { mundo: 1, fase: 1, ordem: 1, personagem_id: 1, fala: 'Olá, bem-vindo ao Mundo 1!', expressao: 'feliz' },
        { mundo: 2, fase: 1, ordem: 1, personagem_id: 2, fala: 'Brrr! Bem-vindo ao meu mundo gelado!', expressao: 'feliz' },
    ];

    const itensPorFase = [
        // Mundo 1
        { mundo: 1, fase: 1, nome: 'UVA', dica1: 'Sou uma fruta pequena.', dica2: 'Cresço em cachos.', imagem_url: '/public/uva.svg' },
        { mundo: 1, fase: 1, nome: 'MAÇÃ', dica1: 'Sou redonda e crocante.', dica2: 'Posso ser vermelha ou verde.', imagem_url: '/public/maca.svg' },
        { mundo: 1, fase: 1, nome: 'PERA', dica1: 'Tenho um formato de lágrima.', dica2: 'Muitos me comem com queijo.', imagem_url: '/public/pera.svg' },
        { mundo: 1, fase: 2, nome: 'COCO', dica1: 'Tenho água por dentro.', dica2: 'Sou peludo por fora.', imagem_url: '/public/coco.svg' },
        { mundo: 1, fase: 2, nome: 'CAJU', dica1: 'Tenho uma castanha na ponta.', dica2: 'Meu suco é muito gostoso.', imagem_url: '/public/caju.svg' },
        { mundo: 1, fase: 2, nome: 'LIMÃO', dica1: 'Sou uma fruta azeda.', dica2: 'Faço uma ótima limonada.', imagem_url: '/public/limao.svg' },
        { mundo: 1, fase: 3, nome: 'MANGA', dica1: 'Sou uma fruta suculenta.', dica2: 'Tenho um caroço grande.', imagem_url: '/public/manga.svg' },
        { mundo: 1, fase: 3, nome: 'MAMÃO', dica1: 'Sou uma fruta alaranjada.', dica2: 'Tenho sementes pretas.', imagem_url: '/public/mamao.svg' },
        { mundo: 1, fase: 3, nome: 'BANANA', dica1: 'Sou amarela e comprida.', dica2: 'Os macacos me adoram.', imagem_url: '/public/banana.svg' },
        { mundo: 1, fase: 4, nome: 'LARANJA', dica1: 'Sou redonda com gomos.', dica2: 'Sou rica em vitamina C.', imagem_url: '/public/laranja.svg' },
        { mundo: 1, fase: 4, nome: 'ABACATE', dica1: 'Sou verde e macio por dentro.', dica2: 'Tenho um caroço grande no meio.', imagem_url: '/public/abacate.svg' },
        { mundo: 1, fase: 4, nome: 'MORANGO', dica1: 'Sou vermelho e pequeno.', dica2: 'Cresço pertinho do chão.', imagem_url: '/public/morango.svg' },
        { mundo: 1, fase: 5, nome: 'ABACAXI', dica1: 'Tenho uma coroa de folhas.', dica2: 'Sou áspero por fora.', imagem_url: '/public/abacaxi.svg' },
        { mundo: 1, fase: 5, nome: 'MELANCIA', dica1: 'Sou verde por fora.', dica2: 'Sou vermelha por dentro.', imagem_url: '/public/melancia.svg' },
        { mundo: 1, fase: 5, nome: 'MARACUJÁ', dica1: 'Sou a fruta da paixão.', dica2: 'Meu suco é azedinho.', imagem_url: '/public/maracuja.svg' },
        // Mundo 2
        { mundo: 2, fase: 1, nome: 'SUCO', dica1: 'Sou feito de frutas.', dica2: 'Posso ser de laranja ou limão.', imagem_url: '/public/suco.svg' },
        { mundo: 2, fase: 1, nome: 'LEITE', dica1: 'Sou branco e venho da vaca.', dica2: 'Sou rico em cálcio.', imagem_url: '/public/leite.svg' },
        { mundo: 2, fase: 1, nome: 'CAFÉ', dica1: 'Sou uma bebida quente e escura.', dica2: 'Muitos adultos me tomam de manhã.', imagem_url: '/public/cafe.svg' },
        { mundo: 2, fase: 2, nome: 'ÁGUA', dica1: 'Sou transparente e mato a sede.', dica2: 'Não tenho cheiro nem sabor.', imagem_url: '/public/agua.svg' },
        { mundo: 2, fase: 2, nome: 'VITAMINA', dica1: 'Sou uma batida de frutas com leite.', dica2: 'Sou saudável e dou energia.', imagem_url: '/public/vitamina.svg' },
        { mundo: 2, fase: 2, nome: 'LIMONADA', dica1: 'Sou feita com limão, água e açúcar.', dica2: 'Sou uma bebida refrescante.', imagem_url: '/public/limonada.svg' },
        { mundo: 2, fase: 3, nome: 'SUCO DE MORANGO', dica1: 'Sou uma bebida vermelha e doce.', dica2: 'Feito com uma fruta pequena.', imagem_url: '/public/suco_morango.svg' },
        { mundo: 2, fase: 3, nome: 'LARANJADA', dica1: 'Sou parecido com um suco.', dica2: 'Feito com a fruta da vitamina C.', imagem_url: '/public/laranjada.svg' },
        { mundo: 2, fase: 3, nome: 'CALDO DE CANA', dica1: 'Sou extraído de uma planta alta.', dica2: 'Muito popular em feiras.', imagem_url: '/public/caldo_de_cana.svg' },
        { mundo: 2, fase: 4, nome: 'IOGURTE', dica1: 'Sou um derivado do leite.', dica2: 'Posso ser bebido ou comido de colher.', imagem_url: '/public/iogurte.svg' },
        { mundo: 2, fase: 4, nome: 'ÁGUA DE COCO', dica1: 'Venho de dentro de uma fruta grande.', dica2: 'É muito comum na praia.', imagem_url: '/public/agua_de_coco.svg' },
        { mundo: 2, fase: 4, nome: 'ACHOCOLATADO', dica1: 'Sou leite com chocolate em pó.', dica2: 'As crianças me adoram no café da manhã.', imagem_url: '/public/achocolatado.svg' },
        { mundo: 2, fase: 5, nome: 'REFRIGERANTE', dica1: 'Sou uma bebida com gás.', dica2: 'Existo em vários sabores, como cola e guaraná.', imagem_url: '/public/refrigerante.svg' },
        { mundo: 2, fase: 5, nome: 'CHÁ', dica1: 'Sou uma infusão de folhas em água quente.', dica2: 'Posso ser de camomila ou erva-doce.', imagem_url: '/public/cha.svg' },
        { mundo: 2, fase: 5, nome: 'CHAMITO', dica1: 'Sou um tipo de iogurte para crianças.', dica2: 'Venho em uma garrafinha pequena.', imagem_url: '/public/chamito.svg' },
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
        if (!ordemContador[chaveFase]) {
            ordemContador[chaveFase] = 1;
        }

        let arrayDeLetras;
        do {
          arrayDeLetras = item.nome.split('').sort(() => 0.5 - Math.random());
        } while (arrayDeLetras.join('') === item.nome && item.nome.length > 1);

        const letrasEmbaralhadas = JSON.stringify(arrayDeLetras);
        const ordem = ordemContador[chaveFase];
        
        stmtItens.run(item.mundo, item.fase, ordem, item.nome, letrasEmbaralhadas, item.dica1, item.dica2, item.imagem_url);
        
        ordemContador[chaveFase]++;
      });

      stmtItens.finalize((err) => {
          if(!err) console.log("Dados de teste inseridos com sucesso.");
      });
    });
  });
}

// Exporta a função para que ela possa ser chamada noutros ficheiros (como no seu server.js).
module.exports = criarTabelas;