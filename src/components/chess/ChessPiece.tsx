import { PieceSymbol, Color } from 'chess.js';
import { motion } from 'framer-motion';

interface ChessPieceProps {
  type: PieceSymbol;
  color: Color;
  size?: number;
  isDragging?: boolean;
}

const PIECE_PATHS: Record<PieceSymbol, string> = {
  k: 'M22.5,11.63V6M20,8h5M22.5,25s4.5-7.5,3-10.5c0,0-1-2.5-3-2.5s-3,2.5-3,2.5c-1.5,3,3,10.5,3,10.5M11.5,37c5.5,3.5,15.5,3.5,21,0v-7s9-4.5,6-10.5c-4-6.5-13.5-3.5-16,4V27v-3.5c-3.5-7.5-13-10.5-16-4-3,6,5,10,5,10V37z M11.5,30c5.5-3,15.5-3,21,0m-21,3.5c5.5-3,15.5-3,21,0m-21,3.5c5.5-3,15.5-3,21,0',
  q: 'M8,12a2,2,0,1,1,4,0a2,2,0,1,1,-4,0M24.5,7.5a2,2,0,1,1,4,0a2,2,0,1,1,-4,0M41,12a2,2,0,1,1,4,0a2,2,0,1,1,-4,0M16,8.5a2,2,0,1,1,4,0a2,2,0,1,1,-4,0M33,9a2,2,0,1,1,4,0a2,2,0,1,1,-4,0M9,26c8.5-1.5,21-1.5,27,0l2.5-12.5L31,25l-3.5-14.5-5,14-5-14L14,25L6.5,13.5L9,26zM9,26c0,2,1.5,2,2.5,4c1,1.5,1,1,.5,3.5c-1.5,1-1.5,2.5-1.5,2.5c-1.5,1.5,.5,2.5,.5,2.5c6.5,1,16.5,1,23,0c0,0,1.5-1,0-2.5c0,0,.5-1.5-1-2.5c-.5-2.5-.5-2,1-3.5c1-2,2.5-2,2.5-4c-8.5-1.5-18.5-1.5-27,0z M11,38.5a35,35,1,0,0,23,0 M11,29a35,35,1,0,1,23,0 M12.5,31.5l20,0 M11.5,34.5a35,35,1,0,0,22,0',
  r: 'M9,39h27v-3H9v3zM12,36v-4h21v4H12zM11,14V9h4v2h5V9h5v2h5V9h4v5 M34,14l-3,3H14l-3-3 M31,17v12.5H14V17 M11,14h23',
  b: 'M9,36c3.39,-0.97,10.11,0.43,13.5,-2c3.39,2.43,10.11,1.03,13.5,2c0,0,1.65,0.54,3,2c-0.68,0.97,-1.65,0.99,-3,0.5c-3.39,-0.97,-10.11,0.46,-13.5,-1c-3.39,1.46,-10.11,0.03,-13.5,1c-1.35,0.49,-2.32,0.47,-3,-0.5c1.35,-1.46,3,-2,3,-2zM15,32c2.5,2.5,12.5,2.5,15,0c0.5,-1.5,0,-2,0,-2c0,-2.5,-2.5,-4,-2.5,-4c5.5,-1.5,6,-11.5,-5,-15.5c-11,4,-10.5,14,-5,15.5c0,0,-2.5,1.5,-2.5,4c0,0,-0.5,0.5,0,2zM25,8a2.5,2.5,0,1,1,-5,0a2.5,2.5,0,1,1,5,0z',
  n: 'M22,10c10.5,1,16.5,8,16,29H15c0,-9,10,-6.5,8,-21 M24,18c0.38,2.91,-5.55,7.37,-8,9c-3,2,-2.82,4.34,-5,4c-1.042,-0.94,1.41,-3.04,0,-3c-1,0,0.19,1.23,-1,2c-1,0,-4.003,1,-4,-4c0,-2,6,-12,6,-12s1.89,-1.9,2,-3.5c-0.73,-0.994,-0.5,-2,-0.5,-3c1,-1,3,2.5,3,2.5h2s0.78,-1.992,2.5,-3c1,0,1,3,1,3 M9.5,25.5a0.5,0.5,0,1,1,-1,0a0.5,0.5,0,1,1,1,0z M14.933,15.75a0.5,1.5,30,1,1,-0.866,-0.5a0.5,1.5,30,1,1,0.866,0.5z',
  p: 'M22.5,9c-2.21,0,-4,1.79,-4,4c0,0.89,0.29,1.71,0.78,2.38C17.33,16.5,16,18.59,16,21c0,2.03,0.94,3.84,2.41,5.03C15.41,27.09,11,31.58,11,39.5H34c0,-7.92,-4.41,-12.41,-7.41,-13.47C28.06,24.84,29,23.03,29,21c0,-2.41,-1.33,-4.5,-3.28,-5.62C26.21,14.71,26.5,13.89,26.5,13c0,-2.21,-1.79,-4,-4,-4z',
};

export const ChessPiece = ({ type, color, size = 45, isDragging = false }: ChessPieceProps) => {
  const fillColor = color === 'w' ? '#FFFDF0' : '#1a1a1a';
  const strokeColor = color === 'w' ? '#1a1a1a' : '#FFFDF0';

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 45 45"
      className="select-none"
      initial={false}
      animate={{
        scale: isDragging ? 1.15 : 1,
        filter: isDragging ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <g
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={PIECE_PATHS[type]} />
      </g>
    </motion.svg>
  );
};

export const PieceIcon = ({ type, color, size = 24 }: { type: PieceSymbol; color: Color; size?: number }) => {
  const fillColor = color === 'w' ? '#FFFDF0' : '#1a1a1a';
  const strokeColor = color === 'w' ? '#1a1a1a' : '#FFFDF0';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 45 45"
      className="inline-block"
    >
      <g
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={PIECE_PATHS[type]} />
      </g>
    </svg>
  );
};
