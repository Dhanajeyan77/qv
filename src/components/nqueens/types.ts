export type CellState = 'empty' | 'queen' | 'checking' | 'placed' | 'conflict';
export type SolverStatus = 'idle' | 'solving' | 'found' | 'no-solution';
export type GameMode = 'auto' | 'manual' | 'continue';

export interface BoardState {
  queens: number[];        // queens[row] = column, -1 if no queen
  cellStates: CellState[][]; // visual state of each cell
}
