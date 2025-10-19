import React, { useState, useEffect } from 'react';
import '../styles/CaçaPalavras.css';

// Função para gerar uma letra aleatória
const randomLetter = () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return alphabet[Math.floor(Math.random() * alphabet.length)];
};

// Função para gerar o grid
const generateGrid = (size, palavras) => {
    // ... (função generateGrid continua igual)
    let grid = Array.from({ length: size }, () => Array(size).fill(''));
    let placedWords = [];

    palavras.forEach(palavra => {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 100) {
            const direcao = Math.random() > 0.5 ? 'horizontal' : 'vertical';
            const row = Math.floor(Math.random() * size);
            const col = Math.floor(Math.random() * size);
            let canPlace = true;

            if (direcao === 'horizontal' && col + palavra.length <= size) {
                for (let i = 0; i < palavra.length; i++) {
                    if (grid[row][col + i] !== '' && grid[row][col + i] !== palavra[i]) {
                        canPlace = false; break;
                    }
                }
                if (canPlace) {
                    for (let i = 0; i < palavra.length; i++) grid[row][col + i] = palavra[i];
                    placed = true; placedWords.push(palavra);
                }
            } else if (direcao === 'vertical' && row + palavra.length <= size) {
                for (let i = 0; i < palavra.length; i++) {
                    if (grid[row + i][col] !== '' && grid[row + i][col] !== palavra[i]) {
                        canPlace = false; break;
                    }
                }
                if (canPlace) {
                    for (let i = 0; i < palavra.length; i++) grid[row + i][col] = palavra[i];
                    placed = true; placedWords.push(palavra);
                }
            }
            attempts++;
        }
    });

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (grid[r][c] === '') grid[r][c] = randomLetter();
        }
    }
    return grid;
};


function CaçaPalavras({ palavras, gridSize, onPalavraEncontrada }) {
  const [grid, setGrid] = useState([]);
  const [selecionando, setSelecionando] = useState(false);
  const [selecao, setSelecao] = useState([]);
  const [palavrasEncontradas, setPalavrasEncontradas] = useState([]);
  // ✅ Estado revertido: Apenas marca se a célula foi encontrada (true/false)
  const [celulasEncontradas, setCelulasEncontradas] = useState({});

  useEffect(() => {
    setGrid(generateGrid(gridSize, palavras));
    setPalavrasEncontradas([]);
    setCelulasEncontradas({});
  }, [gridSize, palavras]);

  const handleMouseDown = (r, c) => {
    setSelecionando(true);
    setSelecao([{ r, c }]);
  };

  const handleMouseEnter = (r, c) => {
    if (selecionando) {
      setSelecao(prev => {
        if (prev.length > 0 && prev[prev.length - 1].r === r && prev[prev.length - 1].c === c) {
            return prev;
        }
        return [...prev, { r, c }];
      });
    }
  };

  const handleMouseUp = () => {
    if (!selecionando) return;
    setSelecionando(false);
    const palavraSelecionada = selecao.map(({ r, c }) => grid[r][c]).join('');

    if (palavras.includes(palavraSelecionada) && !palavrasEncontradas.includes(palavraSelecionada)) {
        onPalavraEncontrada(palavraSelecionada);
        setPalavrasEncontradas(prev => [...prev, palavraSelecionada]);
        
        const novasCelulas = { ...celulasEncontradas };
        selecao.forEach(({ r, c }) => {
            // ✅ Marca a célula como encontrada (true)
            novasCelulas[`${r}-${c}`] = true;
        });
        setCelulasEncontradas(novasCelulas);
    }

    setSelecao([]);
  };

  const isSelecionada = (r, c) => selecao.some(cell => cell.r === r && cell.c === c);
  // ✅ Função atualizada: Verifica se a célula está marcada como encontrada
  const isEncontrada = (r, c) => celulasEncontradas[`${r}-${c}`];

  // Define as classes CSS para cada célula dinamicamente
  const getCellClassName = (r, c) => {
    let classes = 'cell';
    if (isSelecionada(r, c)) {
      classes += ' selecionada';
    } else if (isEncontrada(r, c)) {
      // ✅ Usa a classe genérica para todas as palavras encontradas
      classes += ` encontrada-permanente`;
    }
    return classes;
  };

  return (
    <div className="cacapalavras-box">
       <div className="palavras-lista">
            <h3>Palavras:</h3>
            <ul>
                {palavras.map(p => (
                    <li key={p} className={palavrasEncontradas.includes(p) ? 'encontrada' : ''}>
                        {p}
                    </li>
                ))}
            </ul>
        </div>

        <div className="painel-container">
            <div
              className="cacapalavras-container"
              onMouseUp={handleMouseUp}
              onMouseLeave={() => { if(selecionando) setSelecionando(false); setSelecao([]); }}
            >
                <div className="grid-cacapalavras" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                {grid.map((row, r) =>
                    row.map((letra, c) => (
                    <div
                        key={`${r}-${c}`}
                        className={getCellClassName(r, c)} // Usa a função para definir as classes
                        onMouseDown={() => handleMouseDown(r, c)}
                        onMouseEnter={() => handleMouseEnter(r, c)}
                    >
                        {letra}
                    </div>
                    ))
                )}
                </div>
            </div>
        </div>
    </div>
  );
}

export default CaçaPalavras;