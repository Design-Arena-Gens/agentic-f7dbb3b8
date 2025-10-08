import { useState, useEffect, useRef } from 'react';

const ROWS = 50;
const COLS = 50;
const CELL_SIZE = 10;

const createEmptyGrid = () => {
  return Array(ROWS).fill().map(() => Array(COLS).fill(false));
};

const createRandomGrid = () => {
  return Array(ROWS).fill().map(() =>
    Array(COLS).fill().map(() => Math.random() > 0.7)
  );
};

const operations = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0]
];

const countNeighbors = (grid, i, j) => {
  let count = 0;
  operations.forEach(([x, y]) => {
    const newI = i + x;
    const newJ = j + y;
    if (newI >= 0 && newI < ROWS && newJ >= 0 && newJ < COLS) {
      count += grid[newI][newJ] ? 1 : 0;
    }
  });
  return count;
};

const nextGeneration = (grid) => {
  const newGrid = grid.map(arr => [...arr]);
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const neighbors = countNeighbors(grid, i, j);
      if (grid[i][j]) {
        if (neighbors < 2 || neighbors > 3) {
          newGrid[i][j] = false;
        }
      } else {
        if (neighbors === 3) {
          newGrid[i][j] = true;
        }
      }
    }
  }
  return newGrid;
};

export default function Home() {
  const [grid, setGrid] = useState(createEmptyGrid);
  const [running, setRunning] = useState(false);
  const runningRef = useRef(running);
  runningRef.current = running;
  const canvasRef = useRef();

  const runSimulation = () => {
    if (!runningRef.current) return;
    setGrid(g => nextGeneration(g));
    setTimeout(runSimulation, 100);
  };

  const toggleCell = (i, j) => {
    const newGrid = grid.map(row => [...row]);
    newGrid[i][j] = !newGrid[i][j];
    setGrid(newGrid);
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const i = Math.floor(y / CELL_SIZE);
    const j = Math.floor(x / CELL_SIZE);
    if (i >= 0 && i < ROWS && j >= 0 && j < COLS) {
      toggleCell(i, j);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        ctx.fillStyle = grid[i][j] ? '#000' : '#fff';
        ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }, [grid]);

  useEffect(() => {
    if (running) {
      runningRef.current = true;
      runSimulation();
    } else {
      runningRef.current = false;
    }
  }, [running]);

  return (
    <div className="game-container">
      <h1>Conway's Game of Life</h1>
      <div className="controls">
        <button onClick={() => setRunning(!running)}>
          {running ? 'Stop' : 'Start'}
        </button>
        <button onClick={() => setGrid(nextGeneration(grid))}>
          Step
        </button>
        <button onClick={() => setGrid(createRandomGrid())}>
          Random
        </button>
        <button onClick={() => setGrid(createEmptyGrid())}>
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={COLS * CELL_SIZE}
        height={ROWS * CELL_SIZE}
        onClick={handleCanvasClick}
      />
    </div>
  );
}