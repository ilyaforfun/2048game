import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const stages = ['Angel', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'Pre-IPO', 'IPO', 'Exit'];

const getRandomStage = () => stages[Math.floor(Math.random() * 2)];

const createInitialBoard = () => {
  const board = Array(4).fill().map(() => Array(4).fill(null));
  const pos1 = Math.floor(Math.random() * 16);
  let pos2 = Math.floor(Math.random() * 15);
  pos2 = pos2 >= pos1 ? pos2 + 1 : pos2;
  board[Math.floor(pos1 / 4)][pos1 % 4] = getRandomStage();
  board[Math.floor(pos2 / 4)][pos2 % 4] = getRandomStage();
  return board;
};

// Add this function outside of the Startup2048 component
const isGameOver = (board) => {
  // Check for empty cells
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (!board[i][j]) return false;
    }
  }

  // Check for possible merges
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const currentValue = board[i][j];
      if (
        (i < 3 && currentValue === board[i + 1][j]) ||
        (j < 3 && currentValue === board[i][j + 1])
      ) {
        return false;
      }
    }
  }

  return true; // No empty cells and no possible merges
};

const Startup2048 = () => {
  const [board, setBoard] = useState(createInitialBoard());
  const [score, setScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const moveBoard = useCallback((direction) => {
    if (gameOver) return;

    setBoard(prevBoard => {
      let newBoard = JSON.parse(JSON.stringify(prevBoard));
      let changed = false;
      let newScore = score;

      const merge = (row) => {
        const newRow = row.filter(cell => cell);
        for (let i = 0; i < newRow.length - 1; i++) {
          if (newRow[i] === newRow[i + 1]) {
            const nextIndex = stages.indexOf(newRow[i]) + 1;
            if (nextIndex < stages.length) {
              newRow[i] = stages[nextIndex];
              newRow.splice(i + 1, 1);
              newScore += nextIndex + 1;
              changed = true;
              if (newRow[i] === 'Exit') {
                setGameWon(true);
              }
            }
          }
        }
        return newRow.concat(Array(4 - newRow.length).fill(null));
      };

      if (direction === 'left' || direction === 'right') {
        newBoard = newBoard.map(row => {
          const newRow = direction === 'left' ? merge(row) : merge(row.reverse()).reverse();
          if (newRow.join() !== row.join()) changed = true;
          return newRow;
        });
      } else {
        for (let col = 0; col < 4; col++) {
          let column = newBoard.map(row => row[col]);
          column = direction === 'up' ? merge(column) : merge(column.reverse()).reverse();
          for (let row = 0; row < 4; row++) {
            if (newBoard[row][col] !== column[row]) changed = true;
            newBoard[row][col] = column[row];
          }
        }
      }

      if (changed) {
        const emptySpots = [];
        newBoard.forEach((row, i) => {
          row.forEach((cell, j) => {
            if (!cell) emptySpots.push([i, j]);
          });
        });
        if (emptySpots.length) {
          const [newI, newJ] = emptySpots[Math.floor(Math.random() * emptySpots.length)];
          newBoard[newI][newJ] = getRandomStage();
        }
        setScore(newScore);
      }

      return changed ? newBoard : prevBoard;
    });
  }, [score, gameOver]);

  useEffect(() => {
    if (isGameOver(board)) {
      setGameOver(true);
    }
  }, [board]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (gameOver) return;
      
      switch (event.key) {
        case 'ArrowUp':
          moveBoard('up');
          break;
        case 'ArrowDown':
          moveBoard('down');
          break;
        case 'ArrowLeft':
          moveBoard('left');
          break;
        case 'ArrowRight':
          moveBoard('right');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveBoard, gameOver]);

  const getBackgroundColor = (stage) => {
    const colors = {
      'Angel': 'bg-blue-200',
      'Pre-seed': 'bg-green-200',
      'Seed': 'bg-yellow-200',
      'Series A': 'bg-red-200',
      'Series B': 'bg-purple-200',
      'Series C': 'bg-indigo-200',
      'Series D': 'bg-pink-200',
      'Pre-IPO': 'bg-orange-200',
      'IPO': 'bg-teal-200',
      'Exit': 'bg-emerald-400',
    };
    return colors[stage] || 'bg-gray-100';
  };

  const resetGame = () => {
    setBoard(createInitialBoard());
    setScore(0);
    setGameWon(false);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Startup 2048</h1>
      <div className="mb-4">Score: {score}</div>
      <div className="bg-gray-300 p-4 rounded-lg">
        {board.map((row, i) => (
          <div key={i} className="flex">
            {row.map((cell, j) => (
              <div key={j} className={`w-24 h-24 m-1 flex items-center justify-center ${getBackgroundColor(cell)} rounded-lg shadow text-center text-sm font-semibold`}>
                {cell || ''}
              </div>
            ))}
          </div>
        ))}
      </div>
      {!gameWon && !gameOver && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button onClick={() => moveBoard('left')} className="p-2 bg-blue-500 text-white rounded"><ArrowLeft /></button>
          <button onClick={() => moveBoard('up')} className="p-2 bg-blue-500 text-white rounded"><ArrowUp /></button>
          <button onClick={() => moveBoard('right')} className="p-2 bg-blue-500 text-white rounded"><ArrowRight /></button>
          <div></div>
          <button onClick={() => moveBoard('down')} className="p-2 bg-blue-500 text-white rounded"><ArrowDown /></button>
        </div>
      )}
      {gameOver && !gameWon && (
        <div className="mt-4 absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90">
          <p className="text-2xl font-bold text-red-600 text-center mb-2">
            Game Over!
          </p>
          <p className="text-xl text-center mb-2">
            Unfortunately, you haven't managed to exit your startup.
          </p>
          <p className="text-lg text-center mb-4">
            Try again! Or check out some{' '}
            <a
              href="https://www.linkedin.com/newsletters/6926846587335770112/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              advice on how to raise capital
            </a>
            .
          </p>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
      {gameWon && (
        <div className="mt-4 text-2xl font-bold text-green-600">
          Congratulations! You've successfully exited your startup! It's time to build the next one!
          <button
            onClick={resetGame}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Build Your Next Startup
          </button>
        </div>
      )}
    </div>
  );
};

export default Startup2048;