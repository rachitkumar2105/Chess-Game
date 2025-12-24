import { Chess, Square, Move, PieceSymbol, Color } from 'chess.js';

export type GameMode = 'pvp' | 'pvc';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type PlayerColor = 'w' | 'b';

export interface GameState {
  fen: string;
  turn: Color;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  moveHistory: Move[];
  capturedPieces: { w: PieceSymbol[]; b: PieceSymbol[] };
}

export interface SquareInfo {
  square: Square;
  piece: { type: PieceSymbol; color: Color } | null;
  isLight: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  isLastMove: boolean;
  isCheck: boolean;
}

// Piece values for AI evaluation
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Position bonuses for pieces (simplified)
const PAWN_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_TABLE = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

export class ChessEngine {
  private game: Chess;
  private difficulty: Difficulty;
  private playerColor: PlayerColor;

  constructor() {
    this.game = new Chess();
    this.difficulty = 'medium';
    this.playerColor = 'w';
  }

  reset(): void {
    this.game.reset();
  }

  setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
  }

  setPlayerColor(color: PlayerColor): void {
    this.playerColor = color;
  }

  getPlayerColor(): PlayerColor {
    return this.playerColor;
  }

  loadFen(fen: string): boolean {
    try {
      this.game.load(fen);
      return true;
    } catch {
      return false;
    }
  }

  getFen(): string {
    return this.game.fen();
  }

  getState(): GameState {
    const history = this.game.history({ verbose: true });
    const capturedPieces = this.getCapturedPieces(history);

    return {
      fen: this.game.fen(),
      turn: this.game.turn(),
      isCheck: this.game.isCheck(),
      isCheckmate: this.game.isCheckmate(),
      isStalemate: this.game.isStalemate(),
      isDraw: this.game.isDraw(),
      isGameOver: this.game.isGameOver(),
      moveHistory: history,
      capturedPieces,
    };
  }

  private getCapturedPieces(history: Move[]): { w: PieceSymbol[]; b: PieceSymbol[] } {
    const captured: { w: PieceSymbol[]; b: PieceSymbol[] } = { w: [], b: [] };
    
    for (const move of history) {
      if (move.captured) {
        // If white made the move, they captured a black piece
        if (move.color === 'w') {
          captured.w.push(move.captured);
        } else {
          captured.b.push(move.captured);
        }
      }
    }

    return captured;
  }

  getValidMoves(square: Square): Square[] {
    const moves = this.game.moves({ square, verbose: true });
    return moves.map((move) => move.to);
  }

  getAllValidMoves(): Move[] {
    return this.game.moves({ verbose: true });
  }

  makeMove(from: Square, to: Square, promotion?: PieceSymbol): Move | null {
    try {
      const move = this.game.move({ from, to, promotion: promotion || 'q' });
      return move;
    } catch {
      return null;
    }
  }

  undoMove(): Move | null {
    return this.game.undo();
  }

  isPlayerTurn(): boolean {
    return this.game.turn() === this.playerColor;
  }

  // AI Move generation using Minimax with Alpha-Beta pruning
  getBestMove(): Move | null {
    const depth = this.getSearchDepth();
    const isMaximizing = this.game.turn() === 'w';
    
    let bestMove: Move | null = null;
    let bestValue = isMaximizing ? -Infinity : Infinity;
    
    const moves = this.game.moves({ verbose: true });
    
    // Shuffle moves for variety
    this.shuffleArray(moves);

    for (const move of moves) {
      this.game.move(move);
      const value = this.minimax(depth - 1, -Infinity, Infinity, !isMaximizing);
      this.game.undo();

      if (isMaximizing) {
        if (value > bestValue) {
          bestValue = value;
          bestMove = move;
        }
      } else {
        if (value < bestValue) {
          bestValue = value;
          bestMove = move;
        }
      }
    }

    return bestMove;
  }

  private getSearchDepth(): number {
    switch (this.difficulty) {
      case 'easy':
        return 1;
      case 'medium':
        return 2;
      case 'hard':
        return 3;
      default:
        return 2;
    }
  }

  private minimax(depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (depth === 0 || this.game.isGameOver()) {
      return this.evaluateBoard();
    }

    const moves = this.game.moves({ verbose: true });

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        this.game.move(move);
        const evalScore = this.minimax(depth - 1, alpha, beta, false);
        this.game.undo();
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        this.game.move(move);
        const evalScore = this.minimax(depth - 1, alpha, beta, true);
        this.game.undo();
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  private evaluateBoard(): number {
    if (this.game.isCheckmate()) {
      return this.game.turn() === 'w' ? -Infinity : Infinity;
    }
    if (this.game.isDraw()) {
      return 0;
    }

    let score = 0;
    const board = this.game.board();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          let value = PIECE_VALUES[piece.type];
          
          // Add positional bonus
          if (piece.type === 'p') {
            value += piece.color === 'w' ? PAWN_TABLE[row][col] : PAWN_TABLE[7 - row][col];
          } else if (piece.type === 'n') {
            value += piece.color === 'w' ? KNIGHT_TABLE[row][col] : KNIGHT_TABLE[7 - row][col];
          }

          score += piece.color === 'w' ? value : -value;
        }
      }
    }

    return score;
  }

  // Get raw evaluation score for win probability calculation
  getEvaluation(): number {
    return this.evaluateBoard();
  }

  // Calculate win probability based on evaluation (sigmoid function)
  getWinProbability(): { white: number; black: number } {
    const evaluation = this.evaluateBoard();
    
    // Handle game over states
    if (this.game.isCheckmate()) {
      return this.game.turn() === 'w' 
        ? { white: 0, black: 100 } 
        : { white: 100, black: 0 };
    }
    if (this.game.isDraw()) {
      return { white: 50, black: 50 };
    }

    // Use sigmoid function to convert evaluation to probability
    // Scale factor of 400 gives reasonable probability distribution
    const sigmoid = 1 / (1 + Math.pow(10, -evaluation / 400));
    const whiteWin = Math.round(sigmoid * 100);
    
    return {
      white: whiteWin,
      black: 100 - whiteWin,
    };
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  getSquareInfo(square: Square): { type: PieceSymbol; color: Color } | null {
    return this.game.get(square);
  }

  getPgn(): string {
    return this.game.pgn();
  }
}

export const squareToCoords = (square: Square): { row: number; col: number } => {
  const col = square.charCodeAt(0) - 97;
  const row = 8 - parseInt(square[1]);
  return { row, col };
};

export const coordsToSquare = (row: number, col: number): Square => {
  const file = String.fromCharCode(97 + col);
  const rank = (8 - row).toString();
  return (file + rank) as Square;
};
