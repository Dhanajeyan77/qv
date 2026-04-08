'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Crown, Play, RotateCcw, Minus, Plus, Zap, Info, Hand, CornerDownRight } from 'lucide-react';
import type { SolverStatus, GameMode } from './types';
import { QueenIcon } from './queen-icon';

interface ControlPanelProps {
  n: number;
  status: SolverStatus;
  speed: number;
  mode: GameMode;
  steps: number;
  backtracks: number;
  queensPlaced: number;
  conflicts: number;
  onSolve: () => void;
  onContinueSolve: () => void;
  onReset: () => void;
  onChangeN: (n: number) => void;
  onModeChange: (mode: GameMode) => void;
  onChangeSpeed: (speed: number) => void;
}

function StatusBadge({ status }: { status: SolverStatus }) {
  switch (status) {
    case 'idle':
      return (
        <div className="flex items-center gap-2 rounded-lg bg-slate-700/50 px-4 py-3 text-base font-bold text-slate-300">
          <span className="text-lg">⏸</span>
          <span>Idle</span>
        </div>
      );
    case 'solving':
      return (
        <div className="flex items-center gap-2 rounded-lg bg-amber-500/20 px-4 py-3 text-base font-bold text-amber-300 animate-pulse">
          <span className="text-lg">🔍</span>
          <span>Finding Solution...</span>
        </div>
      );
    case 'found':
      return (
        <div className="flex items-center gap-2 rounded-lg bg-green-500/20 px-4 py-3 text-base font-bold text-green-300">
          <span className="text-lg">✅</span>
          <span>Solution Found!</span>
        </div>
      );
    case 'no-solution':
      return (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-3 text-base font-bold text-red-300">
          <span className="text-lg">❌</span>
          <span>No Solution Possible</span>
        </div>
      );
  }
}

const modeButtons: { mode: GameMode; label: string; icon: React.ReactNode; description: string }[] = [
  { mode: 'auto', label: 'Auto', icon: <Play className="h-4 w-4" />, description: 'Algorithm solves from row 0' },
  { mode: 'continue', label: 'Continue', icon: <CornerDownRight className="h-4 w-4" />, description: 'Place some queens, then auto-complete' },
  { mode: 'manual', label: 'Manual', icon: <Hand className="h-4 w-4" />, description: 'Place all queens yourself' },
];

export function ControlPanel({
  n,
  status,
  speed,
  mode,
  steps,
  backtracks,
  queensPlaced,
  conflicts,
  onSolve,
  onContinueSolve,
  onReset,
  onChangeN,
  onModeChange,
  onChangeSpeed,
}: ControlPanelProps) {
  const isSolving = status === 'solving';
  const isInteractive = mode === 'manual' || mode === 'continue';
  const sliderValue = 2050 - speed;

  const currentModeInfo = modeButtons.find(m => m.mode === mode);

  return (
    <aside className="w-full h-full flex flex-col bg-slate-900 text-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/50">
        <div className="w-10 h-10 flex items-center justify-center">
          <QueenIcon className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">N-Queens Solver</h1>
          <p className="text-xs text-slate-400">Backtracking Algorithm Visualizer</p>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-5 flex-1">
        {/* Board Size */}
        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-300">
            Board Size (N)
          </Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 border-slate-600 bg-slate-800 text-white hover:bg-slate-700 hover:text-white"
              onClick={() => onChangeN(n - 1)}
              disabled={isSolving || n <= 4}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex-1 h-10 flex items-center justify-center rounded-md bg-slate-800 border border-slate-600 text-2xl font-bold tabular-nums">
              {n}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 border-slate-600 bg-slate-800 text-white hover:bg-slate-700 hover:text-white"
              onClick={() => onChangeN(n + 1)}
              disabled={isSolving || n >= 14}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator className="bg-slate-700/50" />

        {/* Mode Selector — 3 buttons */}
        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-300">
            Solve Mode
          </Label>
          <div className="grid grid-cols-3 gap-1.5">
            {modeButtons.map((m) => (
              <button
                key={m.mode}
                onClick={() => onModeChange(m.mode)}
                disabled={isSolving}
                className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  mode === m.mode
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>
          {currentModeInfo && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm">
              <Info className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="text-slate-400">{currentModeInfo.description}</span>
            </div>
          )}
        </div>

        <Separator className="bg-slate-700/50" />

        {/* Action Buttons — changes based on mode */}
        <div className="space-y-2">
          {mode === 'auto' && (
            <Button
              className="w-full h-12 text-base font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
              onClick={onSolve}
              disabled={isSolving}
            >
              <Play className="h-5 w-5" />
              Start Auto-Solve
            </Button>
          )}

          {mode === 'continue' && (
            <>
              <Button
                className="w-full h-12 text-base font-bold gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-lg"
                onClick={onContinueSolve}
                disabled={isSolving || queensPlaced === 0 || conflicts > 0}
              >
                <CornerDownRight className="h-5 w-5" />
                Continue Auto-Solve
              </Button>
              {(queensPlaced === 0 || conflicts > 0) && !isSolving && (
                <div className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-400">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  {queensPlaced === 0
                    ? 'Place at least 1 queen first, then continue'
                    : 'Resolve conflicts before continuing'}
                </div>
              )}
            </>
          )}

          {mode === 'manual' && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2.5 text-sm text-slate-300">
              <Hand className="h-4 w-4 text-slate-500 shrink-0" />
              Click cells to place or remove queens
            </div>
          )}

          <Button
            variant="outline"
            className="w-full h-11 text-base font-bold gap-2 border-slate-600 bg-slate-800 text-white hover:bg-slate-700 hover:text-white"
            onClick={onReset}
          >
            <RotateCcw className="h-4 w-4" />
            Reset Board
          </Button>
        </div>

        <Separator className="bg-slate-700/50" />

        {/* Speed Control */}
        <div className="space-y-3">
          <Label className="text-sm font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Visualization Speed
            </span>
          </Label>
          <Slider
            value={[sliderValue]}
            min={50}
            max={2000}
            step={50}
            onValueChange={(val) => {
              const newSpeed = 2050 - val[0];
              onChangeSpeed(Math.max(50, Math.min(2000, newSpeed)));
            }}
            disabled={isSolving}
            className="py-2"
          />
          <div className="flex justify-between text-xs font-medium text-slate-400">
            <span>Slow</span>
            <span className="text-slate-200 font-bold text-sm tabular-nums">
              {speed}ms
            </span>
            <span>Fast</span>
          </div>
        </div>

        <Separator className="bg-slate-700/50" />

        {/* Status */}
        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-300">
            Status
          </Label>
          <StatusBadge status={status} />
        </div>

        <Separator className="bg-slate-700/50" />

        {/* Conflicts (for interactive modes) */}
        {isInteractive && conflicts > 0 && (
          <>
            <div className="flex items-center gap-2 rounded-lg bg-red-500/15 px-4 py-2.5 text-sm font-bold text-red-300">
              <Crown className="h-4 w-4 shrink-0" />
              Conflicts: {conflicts}
            </div>
            <Separator className="bg-slate-700/50" />
          </>
        )}

        {/* Algorithm Stats */}
        <div className="space-y-3">
          <Label className="text-sm font-bold text-slate-300">
            Algorithm Stats
          </Label>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between rounded-lg bg-slate-800 px-4 py-2.5">
              <span className="text-sm font-medium text-slate-400">Queens Placed</span>
              <span className="text-base font-bold text-emerald-400 tabular-nums">
                {queensPlaced}/{n}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-800 px-4 py-2.5">
              <span className="text-sm font-medium text-slate-400">Steps</span>
              <span className="text-base font-bold text-amber-400 tabular-nums">
                {steps.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-800 px-4 py-2.5">
              <span className="text-sm font-medium text-slate-400">Backtracks</span>
              <span className="text-base font-bold text-red-400 tabular-nums">
                {backtracks.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
