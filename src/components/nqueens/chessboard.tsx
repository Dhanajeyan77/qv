'use client';

import React, { useMemo } from 'react';
import type { BoardState, GameMode, SolverStatus } from './types';
import { QueenIcon } from './queen-icon';

interface ChessboardProps {
  n: number;
  boardState: BoardState;
  mode: GameMode;
  status: SolverStatus;
  onCellClick: (row: number, col: number) => void;
}

const LIGHT_SQUARE = '#F0D9B5';
const DARK_SQUARE = '#B58863';

const CHECKING_COLOR = 'rgba(239, 68, 68, 0.6)';
const PLACED_COLOR = 'rgba(34, 197, 94, 0.5)';
const CONFLICT_GLOW = '0 0 8px 2px rgba(239, 68, 68, 0.8)';

function getCellBackground(
  row: number,
  col: number,
  cellState: string,
  isLight: boolean
): string {
  const baseColor = isLight ? LIGHT_SQUARE : DARK_SQUARE;

  switch (cellState) {
    case 'checking':
      return CHECKING_COLOR;
    case 'placed':
      return PLACED_COLOR;
    case 'conflict':
      return isLight ? LIGHT_SQUARE : DARK_SQUARE;
    case 'queen':
    default:
      return baseColor;
  }
}

function getCellOverlay(cellState: string): React.ReactNode | null {
  switch (cellState) {
    case 'checking':
      return (
        <div className="absolute inset-0 bg-red-500/40 animate-pulse rounded-sm" />
      );
    case 'placed':
      return (
        <div className="absolute inset-0 bg-green-500/30 rounded-sm" />
      );
    default:
      return null;
  }
}

export function Chessboard({ n, boardState, mode, status, onCellClick }: ChessboardProps) {
  const isInteractive = mode === 'manual' || mode === 'continue';
  const isIdle = status === 'idle' || status === 'found' || status === 'no-solution';

  // Calculate cell size to fill available space
  // We'll use CSS grid with container sizing from the parent
  const gridStyle = useMemo(
    () => ({
      display: 'grid' as const,
      gridTemplateColumns: `repeat(${n}, 1fr)`,
      gridTemplateRows: `repeat(${n}, 1fr)`,
      gap: '0px',
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      aspectRatio: '1 / 1',
    }),
    [n]
  );

  const handleClick = (row: number, col: number) => {
    if (isInteractive && isIdle) {
      onCellClick(row, col);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-1">
      {/* Column labels top */}
      <div
        className="flex w-full"
        style={{
          aspectRatio: '1 / 1',
          gap: '0px',
          marginLeft: '28px',
        }}
      >
        {Array.from({ length: n }, (_, col) => (
          <div
            key={`col-label-${col}`}
            className="flex items-center justify-center text-sm font-bold text-slate-600"
            style={{
              flex: '1 1 0',
              minWidth: 0,
            }}
          >
            {col + 1}
          </div>
        ))}
      </div>

      <div className="flex w-full" style={{ aspectRatio: '1 / 1' }}>
        {/* Row labels left */}
        <div className="flex flex-col shrink-0" style={{ width: '28px' }}>
          {Array.from({ length: n }, (_, row) => (
            <div
              key={`row-label-${row}`}
              className="flex items-center justify-center text-sm font-bold text-slate-600 flex-1"
            >
              {row + 1}
            </div>
          ))}
        </div>

        {/* Board */}
        <div className="flex-1 min-w-0 min-h-0">
          <div
            className="rounded-md overflow-hidden shadow-lg border-2 border-amber-900/60"
            style={gridStyle}
          >
            {Array.from({ length: n }, (_, row) =>
              Array.from({ length: n }, (_, col) => {
                const isLight = (row + col) % 2 === 0;
                const cellState = boardState.cellStates[row][col];
                const isQueen = boardState.queens[row] === col;
                const isConflict = cellState === 'conflict';
                const isClickable = isInteractive && isIdle;

                return (
                  <div
                    key={`${row}-${col}`}
                    className="relative transition-all duration-300 flex items-center justify-center border border-amber-900/20"
                    style={{
                      backgroundColor: getCellBackground(row, col, cellState, isLight),
                      boxShadow: isConflict ? CONFLICT_GLOW : undefined,
                      cursor: isClickable ? 'pointer' : 'default',
                      minWidth: 0,
                      minHeight: 0,
                    }}
                    onClick={() => handleClick(row, col)}
                    role={isClickable ? 'button' : undefined}
                    aria-label={`Row ${row + 1}, Column ${col + 1}`}
                    tabIndex={isClickable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleClick(row, col);
                      }
                    }}
                  >
                    {/* Color overlay for animations */}
                    {getCellOverlay(cellState)}

                    {/* Queen piece */}
                    {isQueen && (
                      <div className="absolute inset-0 flex items-center justify-center p-[6%]">
                        <QueenIcon
                          className="w-full h-full drop-shadow-md"
                          conflict={isConflict}
                        />
                      </div>
                    )}

                    {/* Conflict border indicator */}
                    {isConflict && (
                      <div className="absolute inset-0 border-[3px] border-red-500 rounded-sm animate-pulse pointer-events-none" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
