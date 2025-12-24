import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Users, Bot, Zap, Brain, Cpu, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Difficulty, PlayerColor } from '@/lib/chess-engine';
import { PlayerNameInput } from './PlayerNameInput';
import { cn } from '@/lib/utils';

interface GameSetupProps {
  onStartGame: (mode: 'pvp' | 'pvc', difficulty?: Difficulty, playerColor?: PlayerColor, playerNames?: { player1: string; player2: string }) => void;
}

type SetupStep = 'mode' | 'difficulty' | 'color' | 'pvp-names';

export const GameSetup = ({ onStartGame }: GameSetupProps) => {
  const [step, setStep] = useState<SetupStep>('mode');
  const [selectedMode, setSelectedMode] = useState<'pvp' | 'pvc' | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');

  const handleModeSelect = (mode: 'pvp' | 'pvc') => {
    setSelectedMode(mode);
    if (mode === 'pvp') {
      setStep('pvp-names');
    } else {
      setStep('difficulty');
    }
  };

  const handlePvpStart = (player1Name: string, player2Name: string) => {
    onStartGame('pvp', undefined, undefined, { player1: player1Name, player2: player2Name });
  };

  const handleDifficultySelect = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setStep('color');
  };

  const handleColorSelect = (color: PlayerColor) => {
    onStartGame('pvc', selectedDifficulty, color);
  };

  const handleBack = () => {
    if (step === 'difficulty' || step === 'pvp-names') {
      setStep('mode');
      setSelectedMode(null);
    } else if (step === 'color') {
      setStep('difficulty');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/20 mb-4 sm:mb-6"
        >
          <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
        </motion.div>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-gradient mb-3 sm:mb-4">
          Chess Master
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
          Challenge yourself against AI or play with a friend
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 'mode' && (
          <motion.div
            key="mode"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-lg space-y-4"
          >
            <ModeCard
              icon={Bot}
              title="Play vs Computer"
              description="Challenge the AI at your skill level"
              onClick={() => handleModeSelect('pvc')}
              gradient="from-secondary to-accent"
              delay={0.1}
            />
            <ModeCard
              icon={Users}
              title="Two Players"
              description="Play locally with a friend on the same device"
              onClick={() => handleModeSelect('pvp')}
              gradient="from-primary to-yellow-500"
              delay={0.2}
            />
          </motion.div>
        )}

        {step === 'pvp-names' && (
          <PlayerNameInput
            key="pvp-names"
            onStart={handlePvpStart}
            onBack={handleBack}
          />
        )}

        {step === 'difficulty' && (
          <motion.div
            key="difficulty"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-lg"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mb-6 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <h2 className="text-xl sm:text-2xl font-display font-semibold mb-6 text-center">
              Select Difficulty
            </h2>
            
            <div className="space-y-4">
              <DifficultyCard
                icon={Zap}
                title="Easy"
                description="Perfect for beginners"
                onClick={() => handleDifficultySelect('easy')}
                color="text-green-400"
                delay={0.1}
              />
              <DifficultyCard
                icon={Brain}
                title="Medium"
                description="A balanced challenge"
                onClick={() => handleDifficultySelect('medium')}
                color="text-yellow-400"
                delay={0.2}
              />
              <DifficultyCard
                icon={Cpu}
                title="Hard"
                description="For experienced players"
                onClick={() => handleDifficultySelect('hard')}
                color="text-red-400"
                delay={0.3}
              />
            </div>
          </motion.div>
        )}

        {step === 'color' && (
          <motion.div
            key="color"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-lg"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mb-6 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <h2 className="text-xl sm:text-2xl font-display font-semibold mb-6 text-center">
              Choose Your Color
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <ColorCard
                color="w"
                title="White"
                description="You move first"
                onClick={() => handleColorSelect('w')}
                delay={0.1}
              />
              <ColorCard
                color="b"
                title="Black"
                description="Computer moves first"
                onClick={() => handleColorSelect('b')}
                delay={0.2}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ModeCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  gradient: string;
  delay: number;
}

const ModeCard = ({ icon: Icon, title, description, onClick, gradient, delay }: ModeCardProps) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full glass p-5 sm:p-6 rounded-xl text-left group transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
  >
    <div className="flex items-center gap-4">
      <div className={cn(
        'w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center bg-gradient-to-br transition-transform group-hover:scale-110',
        gradient
      )}>
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg sm:text-xl font-semibold mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm sm:text-base">{description}</p>
      </div>
    </div>
  </motion.button>
);

interface DifficultyCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
  delay: number;
}

const DifficultyCard = ({ icon: Icon, title, description, onClick, color, delay }: DifficultyCardProps) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full glass p-4 sm:p-5 rounded-xl text-left group hover:shadow-lg transition-all duration-300"
  >
    <div className="flex items-center gap-4">
      <Icon className={cn('w-6 h-6 sm:w-8 sm:h-8 transition-transform group-hover:scale-110', color)} />
      <div>
        <h3 className="text-base sm:text-lg font-semibold group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  </motion.button>
);

interface ColorCardProps {
  color: 'w' | 'b';
  title: string;
  description: string;
  onClick: () => void;
  delay: number;
}

const ColorCard = ({ color, title, description, onClick, delay }: ColorCardProps) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={cn(
      'glass p-5 sm:p-6 rounded-xl text-center group hover:shadow-lg transition-all duration-300',
      color === 'w' ? 'hover:bg-slate-100/10' : 'hover:bg-slate-900/30'
    )}
  >
    <div className={cn(
      'w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 rounded-full border-4 transition-transform group-hover:scale-110',
      color === 'w' 
        ? 'bg-slate-100 border-slate-300' 
        : 'bg-slate-900 border-slate-700'
    )} />
    <h3 className="text-lg sm:text-xl font-semibold mb-1">{title}</h3>
    <p className="text-muted-foreground text-xs sm:text-sm">{description}</p>
  </motion.button>
);
