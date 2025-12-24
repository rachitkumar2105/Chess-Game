import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Square } from 'chess.js';
import { ChessEngine, coordsToSquare, GameState } from '@/lib/chess-engine';
import { ChessPiece } from './ChessPiece';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChessBoardProps {
  engine: ChessEngine;
  gameState: GameState;
  onMove: (from: Square, to: Square) => void;
  isPlayerTurn: boolean;
  flipped?: boolean;
}

export const ChessBoard = ({ engine, gameState, onMove, isPlayerTurn, flipped = false }: ChessBoardProps) => {
  const isMobile = useIsMobile();
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  
  const pieceSize = isMobile ? 36 : 50;

  // Update last move when history changes
  useEffect(() => {
    if (gameState.moveHistory.length > 0) {
      const last = gameState.moveHistory[gameState.moveHistory.length - 1];
      setLastMove({ from: last.from, to: last.to });
    } else {
      setLastMove(null);
    }
  }, [gameState.moveHistory]);

  const handleSquareClick = useCallback((square: Square) => {
    if (!isPlayerTurn) return;

    const piece = engine.getSquareInfo(square);

    if (selectedSquare) {
      // If clicking on a valid move square, make the move
      if (validMoves.includes(square)) {
        onMove(selectedSquare, square);
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }
      
      // If clicking on own piece, select it
      if (piece && piece.color === gameState.turn) {
        setSelectedSquare(square);
        setValidMoves(engine.getValidMoves(square));
        return;
      }
      
      // Otherwise, deselect
      setSelectedSquare(null);
      setValidMoves([]);
    } else {
      // Select piece if it belongs to current player
      if (piece && piece.color === gameState.turn) {
        setSelectedSquare(square);
        setValidMoves(engine.getValidMoves(square));
      }
    }
  }, [selectedSquare, validMoves, engine, gameState.turn, isPlayerTurn, onMove]);

  const handleDragStart = useCallback((square: Square) => {
    if (!isPlayerTurn) return;
    
    const piece = engine.getSquareInfo(square);
    if (piece && piece.color === gameState.turn) {
      setDraggedPiece(square);
      setSelectedSquare(square);
      setValidMoves(engine.getValidMoves(square));
    }
  }, [engine, gameState.turn, isPlayerTurn]);

  const handleDragEnd = useCallback((targetSquare: Square | null) => {
    if (draggedPiece && targetSquare && validMoves.includes(targetSquare)) {
      onMove(draggedPiece, targetSquare);
    }
    setDraggedPiece(null);
    setSelectedSquare(null);
    setValidMoves([]);
  }, [draggedPiece, validMoves, onMove]);

  const renderSquares = useMemo(() => {
    const squares = [];
    const board = Array.from({ length: 8 }, (_, row) =>
      Array.from({ length: 8 }, (_, col) => {
        const actualRow = flipped ? 7 - row : row;
        const actualCol = flipped ? 7 - col : col;
        const square = coordsToSquare(actualRow, actualCol);
        const isLight = (actualRow + actualCol) % 2 === 0;
        const piece = engine.getSquareInfo(square);
        const isSelected = selectedSquare === square;
        const isValidMove = validMoves.includes(square);
        const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);
        const isKingInCheck = gameState.isCheck && piece?.type === 'k' && piece.color === gameState.turn;

        return {
          square,
          row,
          col,
          isLight,
          piece,
          isSelected,
          isValidMove,
          isLastMoveSquare,
          isKingInCheck,
          hasPiece: !!piece,
        };
      })
    );

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const sq = board[row][col];
        squares.push(
          <motion.div
            key={sq.square}
            className={cn(
              'relative flex items-center justify-center cursor-pointer transition-colors duration-150',
              sq.isLight ? 'bg-board-light' : 'bg-board-dark',
              sq.isSelected && (sq.isLight ? 'bg-board-light-highlight' : 'bg-board-dark-highlight'),
              sq.isLastMoveSquare && !sq.isSelected && (sq.isLight ? 'bg-chess-last-light' : 'bg-chess-last-dark'),
              sq.isKingInCheck && 'ring-4 ring-chess-check ring-inset animate-pulse',
            )}
            style={{ aspectRatio: '1' }}
            onClick={() => handleSquareClick(sq.square)}
            whileHover={{ opacity: 0.9 }}
          >
            {/* Coordinate labels */}
            {col === 0 && (
              <span className={cn(
                'absolute top-0.5 left-1 text-[10px] sm:text-xs font-semibold select-none',
                sq.isLight ? 'text-board-dark/70' : 'text-board-light/70'
              )}>
                {flipped ? row + 1 : 8 - row}
              </span>
            )}
            {row === 7 && (
              <span className={cn(
                'absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-semibold select-none',
                sq.isLight ? 'text-board-dark/70' : 'text-board-light/70'
              )}>
                {String.fromCharCode(97 + (flipped ? 7 - col : col))}
              </span>
            )}

            {/* Valid move indicator */}
            {sq.isValidMove && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  'absolute z-10',
                  sq.hasPiece 
                    ? 'inset-0 border-4 border-chess-capture/60 rounded-full' 
                    : 'w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-chess-move/50'
                )}
              />
            )}

            {/* Piece */}
            <AnimatePresence mode="popLayout">
              {sq.piece && (
                <motion.div
                  key={`${sq.square}-${sq.piece.type}-${sq.piece.color}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={cn(
                    'z-20',
                    draggedPiece === sq.square && 'opacity-50'
                  )}
                  draggable
                  onDragStart={() => handleDragStart(sq.square)}
                  onDragEnd={() => handleDragEnd(null)}
                >
                  <ChessPiece
                    type={sq.piece.type}
                    color={sq.piece.color}
                    size={pieceSize}
                    isDragging={draggedPiece === sq.square}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      }
    }

    return squares;
  }, [engine, selectedSquare, validMoves, lastMove, gameState, flipped, draggedPiece, handleSquareClick, handleDragStart, handleDragEnd, pieceSize]);

  return (
    <div className="relative w-full max-w-[min(90vw,500px)] aspect-square mx-auto">
      <div className="absolute inset-0 rounded-xl board-shadow overflow-hidden">
        <div 
          className="grid grid-cols-8 grid-rows-8 w-full h-full"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const col = Math.floor((x / rect.width) * 8);
            const row = Math.floor((y / rect.height) * 8);
            const actualRow = flipped ? 7 - row : row;
            const actualCol = flipped ? 7 - col : col;
            if (actualRow >= 0 && actualRow < 8 && actualCol >= 0 && actualCol < 8) {
              handleDragEnd(coordsToSquare(actualRow, actualCol));
            }
          }}
        >
          {renderSquares}
        </div>
      </div>
    </div>
  );
};
