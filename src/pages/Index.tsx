import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { GameSetup } from '@/components/chess/GameSetup';
import { ChessGame } from '@/components/chess/ChessGame';
import { Difficulty, PlayerColor } from '@/lib/chess-engine';
import { Helmet } from 'react-helmet-async';

type GameScreen = 'setup' | 'playing';

interface GameConfig {
  mode: 'pvp' | 'pvc';
  difficulty?: Difficulty;
  playerColor?: PlayerColor;
  playerNames?: { player1: string; player2: string };
}

const Index = () => {
  const [screen, setScreen] = useState<GameScreen>('setup');
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);

  const handleStartGame = (
    mode: 'pvp' | 'pvc', 
    difficulty?: Difficulty, 
    playerColor?: PlayerColor,
    playerNames?: { player1: string; player2: string }
  ) => {
    setGameConfig({ mode, difficulty, playerColor, playerNames });
    setScreen('playing');
  };

  const handleBackToMenu = () => {
    setScreen('setup');
    setGameConfig(null);
  };

  return (
    <>
      <Helmet>
        <title>Chess Master - Play Chess Online | vs Computer & Two Players</title>
        <meta name="description" content="Play chess online for free! Challenge the AI at different difficulty levels or play with a friend. Beautiful, responsive chess game with smooth animations." />
        <meta name="keywords" content="chess, online chess, chess game, play chess, chess vs computer, two player chess" />
        <link rel="canonical" href="/" />
      </Helmet>

      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          {screen === 'setup' && (
            <GameSetup key="setup" onStartGame={handleStartGame} />
          )}
          {screen === 'playing' && gameConfig && (
            <ChessGame
              key="game"
              mode={gameConfig.mode}
              difficulty={gameConfig.difficulty}
              playerColor={gameConfig.playerColor}
              playerNames={gameConfig.playerNames}
              onBackToMenu={handleBackToMenu}
            />
          )}
        </AnimatePresence>
      </main>
    </>
  );
};

export default Index;
