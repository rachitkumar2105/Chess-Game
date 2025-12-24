import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, 
  Flag, 
  Home, 
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Square } from 'chess.js';
import { ChessEngine, GameState, Difficulty, PlayerColor } from '@/lib/chess-engine';
import { ChessBoard } from './ChessBoard';
import { MoveHistory, CapturedPieces } from './GameInfo';
import { GameStatus } from './GameStatus';
import { WinProbabilityBar } from './WinProbabilityBar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChessGameProps {
  mode: 'pvp' | 'pvc';
  difficulty?: Difficulty;
  playerColor?: PlayerColor;
  playerNames?: { player1: string; player2: string };
  onBackToMenu: () => void;
}

export const ChessGame = ({ 
  mode, 
  difficulty = 'medium', 
  playerColor = 'w', 
  playerNames,
  onBackToMenu 
}: ChessGameProps) => {
  const engineRef = useRef<ChessEngine>(new ChessEngine());
  const [gameState, setGameState] = useState<GameState>(engineRef.current.getState());
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [boardFlipped, setBoardFlipped] = useState(playerColor === 'b');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showResignDialog, setShowResignDialog] = useState(false);
  const [showNewGameDialog, setShowNewGameDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [winProbability, setWinProbability] = useState({ white: 50, black: 50 });

  const engine = engineRef.current;
  
  // Get player display names
  const whiteName = mode === 'pvp' ? (playerNames?.player1 || 'Player 1') : (playerColor === 'w' ? 'You' : 'Computer');
  const blackName = mode === 'pvp' ? (playerNames?.player2 || 'Player 2') : (playerColor === 'b' ? 'You' : 'Computer');

  // Initialize engine settings
  useMemo(() => {
    engine.setDifficulty(difficulty);
    engine.setPlayerColor(playerColor);
  }, [engine, difficulty, playerColor]);

  // Computer's first move if player is black
  useEffect(() => {
    if (mode === 'pvc' && playerColor === 'b' && gameState.moveHistory.length === 0) {
      makeComputerMove();
    }
  }, []);

  const playMoveSound = useCallback(() => {
    if (!soundEnabled) return;
    // Simple audio feedback using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 600;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, [soundEnabled]);

  // Update win probability
  const updateWinProbability = useCallback(() => {
    const prob = engine.getWinProbability();
    setWinProbability(prob);
  }, [engine]);

  // Update probability when game state changes
  useEffect(() => {
    updateWinProbability();
  }, [gameState, updateWinProbability]);

  const makeComputerMove = useCallback(async () => {
    setIsComputerThinking(true);
    
    // Add small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    
    const bestMove = engine.getBestMove();
    if (bestMove) {
      engine.makeMove(bestMove.from, bestMove.to, bestMove.promotion);
      playMoveSound();
      setGameState(engine.getState());
    }
    
    setIsComputerThinking(false);
  }, [engine, playMoveSound]);

  const handleMove = useCallback((from: Square, to: Square) => {
    const move = engine.makeMove(from, to);
    if (move) {
      playMoveSound();
      const newState = engine.getState();
      setGameState(newState);

      // Check for game end conditions
      if (newState.isCheckmate) {
        const winner = newState.turn === 'w' ? 'Black' : 'White';
        toast.success(`Checkmate! ${winner} wins!`, {
          duration: 5000,
          icon: '👑',
        });
      } else if (newState.isStalemate) {
        toast.info('Stalemate! The game is a draw.', { duration: 5000 });
      } else if (newState.isDraw) {
        toast.info('Draw!', { duration: 5000 });
      } else if (newState.isCheck) {
        toast.warning('Check!', { duration: 2000 });
      }

      // Computer's turn in PVC mode
      if (mode === 'pvc' && !newState.isGameOver && newState.turn !== playerColor) {
        makeComputerMove();
      }
    }
  }, [engine, mode, playerColor, playMoveSound, makeComputerMove]);

  const handleUndo = useCallback(() => {
    const undone = engine.undoMove();
    if (undone) {
      // In PVC mode, undo twice to undo both player and computer move
      if (mode === 'pvc' && gameState.moveHistory.length > 1) {
        engine.undoMove();
      }
      setGameState(engine.getState());
      toast.info('Move undone');
    }
  }, [engine, mode, gameState.moveHistory.length]);

  const handleNewGame = useCallback(() => {
    engine.reset();
    setGameState(engine.getState());
    setShowNewGameDialog(false);
    toast.success('New game started!');
    
    // Computer's first move if player is black
    if (mode === 'pvc' && playerColor === 'b') {
      makeComputerMove();
    }
  }, [engine, mode, playerColor, makeComputerMove]);

  const handleResign = useCallback(() => {
    setShowResignDialog(false);
    const winner = mode === 'pvc' 
      ? 'Computer' 
      : (gameState.turn === 'w' ? 'Black' : 'White');
    toast.info(`${gameState.turn === 'w' ? 'White' : 'Black'} resigned. ${winner} wins!`);
  }, [mode, gameState.turn]);

  const handleFlipBoard = useCallback(() => {
    setBoardFlipped(prev => !prev);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const isPlayerTurn = useMemo(() => {
    if (mode === 'pvp') return true;
    return gameState.turn === playerColor && !isComputerThinking && !gameState.isGameOver;
  }, [mode, gameState.turn, gameState.isGameOver, playerColor, isComputerThinking]);

  return (
    <div className="min-h-screen flex flex-col px-2 py-4 sm:px-4 sm:py-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4 sm:mb-6"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToMenu}
          className="text-muted-foreground hover:text-foreground"
        >
          <Home className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Menu</span>
        </Button>

        <h1 className="text-lg sm:text-xl font-display font-semibold">
          {mode === 'pvc' ? `vs Computer (${difficulty})` : `${whiteName} vs ${blackName}`}
        </h1>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(prev => !prev)}
            className="w-8 h-8 sm:w-9 sm:h-9"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="w-8 h-8 sm:w-9 sm:h-9 hidden sm:flex"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 max-w-7xl mx-auto w-full">
        {/* Win Probability Bar - Left side on desktop */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden lg:flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground font-medium">{blackName}</span>
          <WinProbabilityBar 
            whiteWinProbability={winProbability.white} 
            className="h-[400px]"
          />
          <span className="text-xs text-muted-foreground font-medium">{whiteName}</span>
        </motion.div>

        {/* Game board section */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <GameStatus
            gameState={gameState}
            playerColor={mode === 'pvc' ? playerColor : undefined}
            isComputerThinking={isComputerThinking}
            whiteName={whiteName}
            blackName={blackName}
            className="w-full max-w-[min(90vw,500px)]"
          />

          {/* Mobile probability bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden w-full max-w-[min(90vw,500px)] flex items-center gap-2"
          >
            <span className="text-xs text-muted-foreground min-w-[60px] text-right truncate">{whiteName}</span>
            <WinProbabilityBar 
              whiteWinProbability={winProbability.white} 
              orientation="horizontal"
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground min-w-[60px] truncate">{blackName}</span>
          </motion.div>

          <ChessBoard
            engine={engine}
            gameState={gameState}
            onMove={handleMove}
            isPlayerTurn={isPlayerTurn}
            flipped={boardFlipped}
          />

          {/* Game controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={gameState.moveHistory.length === 0 || isComputerThinking}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Undo</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFlipBoard}
              className="gap-2"
            >
              <RotateCw className="w-4 h-4" />
              <span className="hidden sm:inline">Flip</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewGameDialog(true)}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">New Game</span>
            </Button>
            {!gameState.isGameOver && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowResignDialog(true)}
                className="gap-2"
              >
                <Flag className="w-4 h-4" />
                <span className="hidden sm:inline">Resign</span>
              </Button>
            )}
          </motion.div>
        </div>

        {/* Side panel */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full lg:w-80 space-y-4"
        >
          <CapturedPieces pieces={gameState.capturedPieces} />
          <MoveHistory moves={gameState.moveHistory} />
        </motion.aside>
      </div>

      {/* Resign confirmation dialog */}
      <AlertDialog open={showResignDialog} onOpenChange={setShowResignDialog}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Resign Game?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to resign? This will end the current game.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResign}>Resign</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New game confirmation dialog */}
      <AlertDialog open={showNewGameDialog} onOpenChange={setShowNewGameDialog}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Start New Game?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to start a new game? Current progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleNewGame}>New Game</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
