'use client';

import React, { useState } from 'react';
import { useNQueens } from '@/components/nqueens/use-nqueens';
import { Chessboard } from '@/components/nqueens/chessboard';
import { ControlPanel } from '@/components/nqueens/control-panel';

export default function Home() {
  const {
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
    setModeDirect,
    handleCellClick,
    changeSpeed,
  } = useNQueens();

  const [zoom, setZoom] = useState(1);

  return (
    <main className="min-h-screen flex bg-slate-50 overflow-hidden">
      {/* Sidebar Control Panel */}
      <div className="w-[320px] shrink-0 border-r border-slate-700/50 h-screen overflow-hidden">
        <ControlPanel
          n={n}
          status={status}
          speed={speed}
          mode={mode}
          steps={steps}
          backtracks={backtracks}
          queensPlaced={queensPlaced}
          conflicts={conflicts}
          onSolve={solve}
          onContinueSolve={continueSolve}
          onReset={reset}
          onChangeN={changeN}
          onModeChange={setModeDirect}
          onChangeSpeed={changeSpeed}
        />
      </div>

      {/* Main Board Area — scrollable & zoomable */}
      <div className="flex-1 relative overflow-auto">
        {/* Zoom Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
          <button
            onClick={() => setZoom(z => Math.min(z + 0.15, 3))}
            className="w-11 h-11 rounded-xl bg-white shadow-lg border border-slate-300 text-xl font-bold text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.15, 0.3))}
            className="w-11 h-11 rounded-xl bg-white shadow-lg border border-slate-300 text-xl font-bold text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            −
          </button>
          <button
            onClick={() => setZoom(1)}
            className="w-11 h-11 rounded-xl bg-white shadow-lg border border-slate-300 text-[10px] font-bold text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            FIT
          </button>
        </div>

        {/* Zoom Level Indicator */}
        <div className="absolute top-4 left-4 z-20 bg-slate-900/75 text-white text-xs font-mono px-3 py-1.5 rounded-lg backdrop-blur-sm">
          {Math.round(zoom * 100)}%
        </div>

        {/* Scrollable board container */}
        <div className="min-w-full min-h-full flex items-center justify-center p-8" style={{ minWidth: 'fit-content', minHeight: 'fit-content' }}>
          <div
            className="transition-transform duration-200 ease-out origin-center"
            style={{
              transform: `scale(${zoom})`,
              width: `${n * 60}px`,
              height: `${n * 60}px`,
            }}
          >
            <Chessboard
              n={n}
              boardState={boardState}
              mode={mode}
              status={status}
              onCellClick={handleCellClick}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
