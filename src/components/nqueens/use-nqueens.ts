'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { BoardState, CellState, SolverStatus, GameMode } from './types';

const MIN_BOARD = 4;
const MAX_BOARD = 14;
const DEFAULT_BOARD = 8;
const DEFAULT_SPEED = 300;

function createEmptyBoard(n: number): BoardState {
  return {
    queens: new Array(n).fill(-1),
    cellStates: Array.from({ length: n }, () =>
      new Array<CellState>(n).fill('empty')
    ),
  };
}

export function useNQueens() {
  const [n, setN] = useState(DEFAULT_BOARD);
  const [boardState, setBoardState] = useState<BoardState>(createEmptyBoard(DEFAULT_BOARD));
  const [status, setStatus] = useState<SolverStatus>('idle');
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [mode, setMode] = useState<GameMode>('auto');
  const [steps, setSteps] = useState(0);
  const [backtracks, setBacktracks] = useState(0);
  const [queensPlaced, setQueensPlaced] = useState(0);
  const [conflicts, setConflicts] = useState(0);

  // Refs for async algorithm access
  const cancelledRef = useRef(false);
  const boardRef = useRef(boardState);
  const nRef = useRef(n);
  const speedRef = useRef(speed);
  const stepsRef = useRef(0);
  const backtracksRef = useRef(0);

  // Keep refs in sync via effects
  useEffect(() => { boardRef.current = boardState; }, [boardState]);
  useEffect(() => { nRef.current = n; }, [n]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  const updateBoardRef = useCallback((newQueens: number[], newCellStates: CellState[][]) => {
    const newBoard: BoardState = {
      queens: [...newQueens],
      cellStates: newCellStates.map(row => [...row]),
    };
    boardRef.current = newBoard;
    setBoardState(newBoard);
  }, []);

  const incrementSteps = useCallback(() => {
    stepsRef.current += 1;
    setSteps(stepsRef.current);
  }, []);

  const incrementBacktracks = useCallback(() => {
    backtracksRef.current += 1;
    setBacktracks(backtracksRef.current);
  }, []);

  const delay = useCallback((ms?: number) => {
    return new Promise<void>(resolve => {
      setTimeout(resolve, ms ?? speedRef.current);
    });
  }, []);

  const isSafe = useCallback((queens: number[], row: number, col: number): boolean => {
    for (let i = 0; i < row; i++) {
      const qCol = queens[i];
      if (qCol === -1) continue;
      if (qCol === col) return false;
      if (Math.abs(qCol - col) === Math.abs(i - row)) return false;
    }
    return true;
  }, []);

  // ─── Full Auto-Solve (from row 0, fresh board) ───
  const solve = useCallback(async () => {
    const currentN = nRef.current;
    cancelledRef.current = false;
    setStatus('solving');
    setSteps(0);
    setBacktracks(0);
    setConflicts(0);
    stepsRef.current = 0;
    backtracksRef.current = 0;

    const queens = new Array(currentN).fill(-1);
    const cellStates: CellState[][] = Array.from({ length: currentN }, () =>
      new Array<CellState>(currentN).fill('empty')
    );
    const update = () => updateBoardRef(queens, cellStates);

    const solveRow = async (row: number): Promise<boolean> => {
      if (cancelledRef.current) return false;
      if (row === currentN) return true;

      for (let col = 0; col < currentN; col++) {
        if (cancelledRef.current) return false;

        cellStates[row][col] = 'checking';
        incrementSteps();
        update();
        await delay();
        if (cancelledRef.current) return false;

        if (isSafe(queens, row, col)) {
          queens[row] = col;
          cellStates[row][col] = 'placed';
          incrementSteps();
          update();
          setQueensPlaced(row + 1);
          await delay();
          if (cancelledRef.current) return false;

          cellStates[row][col] = 'queen';
          update();

          const found = await solveRow(row + 1);
          if (found) return true;
          if (cancelledRef.current) return false;

          // Backtrack
          queens[row] = -1;
          cellStates[row][col] = 'checking';
          incrementBacktracks();
          incrementSteps();
          setQueensPlaced(row);
          update();
          await delay();
          if (cancelledRef.current) return false;

          cellStates[row][col] = 'empty';
          update();
        } else {
          cellStates[row][col] = 'empty';
          update();
        }
      }
      return false;
    };

    const found = await solveRow(0);

    if (cancelledRef.current) { setStatus('idle'); return; }
    if (found) { setStatus('found'); setQueensPlaced(currentN); }
    else { setStatus('no-solution'); }
  }, [delay, incrementBacktracks, incrementSteps, isSafe, updateBoardRef]);

  // ─── Continue Auto-Solve (from first empty row, keeping user-placed queens) ───
  const continueSolve = useCallback(async () => {
    const currentN = nRef.current;
    const currentBoard = boardRef.current;

    // Find the first empty row
    let startRow = -1;
    const queens = [...currentBoard.queens];
    for (let i = 0; i < currentN; i++) {
      if (queens[i] === -1) { startRow = i; break; }
    }

    // If all rows filled, nothing to continue
    if (startRow === -1) {
      // Check if current placement is valid
      let hasConflict = false;
      for (let i = 0; i < currentN; i++) {
        if (!isSafe(queens, i, queens[i])) { hasConflict = true; break; }
      }
      setStatus(hasConflict ? 'no-solution' : 'found');
      return;
    }

    // Check if user-placed queens have conflicts — if so, can't continue
    for (let i = 0; i < startRow; i++) {
      if (queens[i] !== -1 && !isSafe(queens, i, queens[i])) {
        setStatus('no-solution');
        return;
      }
    }

    cancelledRef.current = false;
    setStatus('solving');
    // Don't reset steps/backtracks — continue from where we are

    const cellStates: CellState[][] = currentBoard.cellStates.map(r => [...r]);
    const update = () => updateBoardRef(queens, cellStates);

    const solveRow = async (row: number): Promise<boolean> => {
      if (cancelledRef.current) return false;
      if (row === currentN) return true;

      for (let col = 0; col < currentN; col++) {
        if (cancelledRef.current) return false;

        cellStates[row][col] = 'checking';
        incrementSteps();
        update();
        await delay();
        if (cancelledRef.current) return false;

        if (isSafe(queens, row, col)) {
          queens[row] = col;
          cellStates[row][col] = 'placed';
          incrementSteps();
          update();
          setQueensPlaced(row + 1);
          await delay();
          if (cancelledRef.current) return false;

          cellStates[row][col] = 'queen';
          update();

          const found = await solveRow(row + 1);
          if (found) return true;
          if (cancelledRef.current) return false;

          // Backtrack
          queens[row] = -1;
          cellStates[row][col] = 'checking';
          incrementBacktracks();
          incrementSteps();
          setQueensPlaced(row);
          update();
          await delay();
          if (cancelledRef.current) return false;

          cellStates[row][col] = 'empty';
          update();
        } else {
          cellStates[row][col] = 'empty';
          update();
        }
      }
      return false;
    };

    const found = await solveRow(startRow);

    if (cancelledRef.current) { setStatus('idle'); return; }
    if (found) { setStatus('found'); setQueensPlaced(currentN); }
    else { setStatus('no-solution'); }
  }, [delay, incrementBacktracks, incrementSteps, isSafe, updateBoardRef]);

  const reset = useCallback(() => {
    cancelledRef.current = true;
    setBoardState(createEmptyBoard(n));
    setStatus('idle');
    setSteps(0);
    setBacktracks(0);
    setQueensPlaced(0);
    setConflicts(0);
    stepsRef.current = 0;
    backtracksRef.current = 0;
  }, [n]);

  const changeN = useCallback((newN: number) => {
    const clamped = Math.max(MIN_BOARD, Math.min(MAX_BOARD, newN));
    cancelledRef.current = true;
    setN(clamped);
    setBoardState(createEmptyBoard(clamped));
    setStatus('idle');
    setSteps(0);
    setBacktracks(0);
    setQueensPlaced(0);
    setConflicts(0);
    stepsRef.current = 0;
    backtracksRef.current = 0;
  }, []);

  // Cycle: auto → continue → manual → auto
  const toggleMode = useCallback(() => {
    const nextMode = mode === 'auto' ? 'continue' : mode === 'continue' ? 'manual' : 'auto';
    cancelledRef.current = true;
    setMode(nextMode);
    if (nextMode !== 'continue') {
      // Only clear board when leaving continue mode
      // Actually, let's keep board state when switching to any mode
      // so user can switch freely
    }
    setConflicts(0);
  }, [mode]);

  const setModeDirect = useCallback((newMode: GameMode) => {
    cancelledRef.current = true;
    setMode(newMode);
    setConflicts(0);
  }, []);

  // Manual / Continue mode: place/remove queen on cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    if ((mode !== 'manual' && mode !== 'continue') || status === 'solving') return;

    const current = boardRef.current;
    const newQueens = [...current.queens];
    const newCellStates: CellState[][] = current.cellStates.map(r => [...r]);

    if (newQueens[row] === col) {
      newQueens[row] = -1;
      newCellStates[row][col] = 'empty';
    } else {
      if (newQueens[row] !== -1) {
        newCellStates[row][newQueens[row]] = 'empty';
      }
      newQueens[row] = col;
    }

    // Check all conflicts
    let conflictCount = 0;
    const conflictSet = new Set<string>();

    for (let i = 0; i < n; i++) {
      if (newQueens[i] === -1) continue;
      for (let j = i + 1; j < n; j++) {
        if (newQueens[j] === -1) continue;
        if (
          newQueens[i] === newQueens[j] ||
          Math.abs(newQueens[i] - newQueens[j]) === Math.abs(i - j)
        ) {
          conflictCount++;
          conflictSet.add(`${i},${newQueens[i]}`);
          conflictSet.add(`${j},${newQueens[j]}`);
        }
      }
    }

    for (let i = 0; i < n; i++) {
      if (newQueens[i] === -1) continue;
      if (conflictSet.has(`${i},${newQueens[i]}`)) {
        newCellStates[i][newQueens[i]] = 'conflict';
      } else {
        newCellStates[i][newQueens[i]] = 'queen';
      }
    }

    const newBoard: BoardState = {
      queens: newQueens,
      cellStates: newCellStates,
    };
    boardRef.current = newBoard;
    setBoardState(newBoard);

    const placedCount = newQueens.filter(q => q !== -1).length;
    setQueensPlaced(placedCount);
    setConflicts(conflictCount);
    setSteps(s => s + 1);
  }, [mode, status, n]);

  const changeSpeed = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    speedRef.current = newSpeed;
  }, []);

  return {
    n,
    boardState,
    status,
    speed,
    mode,
    steps,
    backtracks,
    queensPlaced,
    conflicts,
    solve,
    continueSolve,
    reset,
    changeN,
    toggleMode,
    setModeDirect,
    handleCellClick,
    changeSpeed,
  };
}
