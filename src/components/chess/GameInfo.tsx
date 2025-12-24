import { motion } from 'framer-motion';
import { Move, PieceSymbol } from 'chess.js';
import { PieceIcon } from './ChessPiece';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MoveHistoryProps {
  moves: Move[];
  className?: string;
}

export const MoveHistory = ({ moves, className }: MoveHistoryProps) => {
  const movePairs: { number: number; white?: Move; black?: Move }[] = [];
  
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  return (
    <div className={cn('glass rounded-lg p-3 sm:p-4', className)}>
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
        Move History
      </h3>
      <ScrollArea className="h-[180px] sm:h-[200px] pr-3">
        {movePairs.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">No moves yet</p>
        ) : (
          <div className="space-y-1">
            {movePairs.map((pair, idx) => (
              <motion.div
                key={pair.number}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-muted/50 transition-colors"
              >
                <span className="text-muted-foreground font-mono w-6 text-right">
                  {pair.number}.
                </span>
                <span className="flex-1 font-medium">
                  {pair.white?.san || '...'}
                </span>
                <span className="flex-1 font-medium text-muted-foreground">
                  {pair.black?.san || ''}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

interface CapturedPiecesProps {
  pieces: { w: PieceSymbol[]; b: PieceSymbol[] };
  className?: string;
}

const PIECE_ORDER: PieceSymbol[] = ['q', 'r', 'b', 'n', 'p'];
const PIECE_VALUES: Record<PieceSymbol, number> = { q: 9, r: 5, b: 3, n: 3, p: 1, k: 0 };

export const CapturedPieces = ({ pieces, className }: CapturedPiecesProps) => {
  const sortPieces = (arr: PieceSymbol[]) => 
    [...arr].sort((a, b) => PIECE_ORDER.indexOf(a) - PIECE_ORDER.indexOf(b));

  const whiteCaptured = sortPieces(pieces.w);
  const blackCaptured = sortPieces(pieces.b);

  const whiteScore = whiteCaptured.reduce((sum, p) => sum + PIECE_VALUES[p], 0);
  const blackScore = blackCaptured.reduce((sum, p) => sum + PIECE_VALUES[p], 0);
  const scoreDiff = whiteScore - blackScore;

  return (
    <div className={cn('glass rounded-lg p-3 sm:p-4', className)}>
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
        Captured Pieces
      </h3>
      <div className="space-y-3">
        {/* White's captures (black pieces) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground w-8">White:</span>
          <div className="flex flex-wrap gap-0.5">
            {whiteCaptured.map((piece, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, delay: idx * 0.05 }}
              >
                <PieceIcon type={piece} color="b" size={20} />
              </motion.div>
            ))}
            {whiteCaptured.length === 0 && <span className="text-muted-foreground text-xs">—</span>}
          </div>
          {scoreDiff > 0 && (
            <span className="text-primary text-xs font-bold ml-auto">+{scoreDiff}</span>
          )}
        </div>

        {/* Black's captures (white pieces) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground w-8">Black:</span>
          <div className="flex flex-wrap gap-0.5">
            {blackCaptured.map((piece, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, delay: idx * 0.05 }}
              >
                <PieceIcon type={piece} color="w" size={20} />
              </motion.div>
            ))}
            {blackCaptured.length === 0 && <span className="text-muted-foreground text-xs">—</span>}
          </div>
          {scoreDiff < 0 && (
            <span className="text-primary text-xs font-bold ml-auto">+{Math.abs(scoreDiff)}</span>
          )}
        </div>
      </div>
    </div>
  );
};
