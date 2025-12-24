import { motion } from 'framer-motion';
import { Crown, Swords, AlertTriangle, Handshake } from 'lucide-react';
import { GameState } from '@/lib/chess-engine';
import { cn } from '@/lib/utils';

interface GameStatusProps {
  gameState: GameState;
  playerColor?: 'w' | 'b';
  isComputerThinking?: boolean;
  whiteName?: string;
  blackName?: string;
  className?: string;
}

export const GameStatus = ({ 
  gameState, 
  playerColor, 
  isComputerThinking, 
  whiteName = 'White',
  blackName = 'Black',
  className 
}: GameStatusProps) => {
  const getTurnText = () => {
    if (gameState.isCheckmate) {
      const winner = gameState.turn === 'w' ? blackName : whiteName;
      return `${winner} wins by checkmate!`;
    }
    if (gameState.isStalemate) {
      return 'Stalemate - Draw!';
    }
    if (gameState.isDraw) {
      return 'Game ended in a draw';
    }
    if (isComputerThinking) {
      return 'Computer is thinking...';
    }
    
    const currentTurnName = gameState.turn === 'w' ? whiteName : blackName;
    const isYourTurn = playerColor === gameState.turn;
    
    if (playerColor) {
      return isYourTurn ? 'Your turn' : `${currentTurnName}'s turn`;
    }
    
    return `${currentTurnName}'s turn`;
  };

  const getStatusIcon = () => {
    if (gameState.isCheckmate) {
      return <Crown className="w-5 h-5" />;
    }
    if (gameState.isStalemate || gameState.isDraw) {
      return <Handshake className="w-5 h-5" />;
    }
    if (gameState.isCheck) {
      return <AlertTriangle className="w-5 h-5" />;
    }
    return <Swords className="w-5 h-5" />;
  };

  const getStatusStyle = () => {
    if (gameState.isCheckmate) {
      return 'bg-primary/20 border-primary text-primary';
    }
    if (gameState.isCheck) {
      return 'bg-destructive/20 border-destructive text-destructive';
    }
    if (gameState.isStalemate || gameState.isDraw) {
      return 'bg-muted/50 border-muted-foreground text-muted-foreground';
    }
    if (isComputerThinking) {
      return 'bg-secondary/30 border-secondary text-secondary';
    }
    return 'bg-card/50 border-border text-foreground';
  };

  return (
    <motion.div
      layout
      className={cn(
        'flex items-center justify-center gap-3 px-4 py-3 rounded-lg border-2 transition-colors duration-300',
        getStatusStyle(),
        className
      )}
    >
      <motion.div
        animate={isComputerThinking ? { rotate: 360 } : { rotate: 0 }}
        transition={isComputerThinking ? { repeat: Infinity, duration: 2, ease: 'linear' } : {}}
      >
        {getStatusIcon()}
      </motion.div>
      <span className="font-semibold text-sm sm:text-base">{getTurnText()}</span>
      {gameState.isCheck && !gameState.isCheckmate && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-xs font-bold uppercase tracking-wider text-destructive"
        >
          Check!
        </motion.span>
      )}
    </motion.div>
  );
};
