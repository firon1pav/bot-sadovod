import React from 'react';
import { LevelInfo } from '../types';

interface HeaderProps {
  levelInfo: LevelInfo;
}

const Header: React.FC<HeaderProps> = ({ levelInfo }) => {
  return (
    <header className="bg-card/80 backdrop-blur-lg border-b border-accent p-4 sticky top-0 z-10">
      <div className="flex justify-center items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{levelInfo.levelIcon}</span>
          <div>
            <div className="font-bold text-sm text-primary">{levelInfo.levelName} - Lvl {levelInfo.level}</div>
            <div className="text-xs text-foreground/70">{levelInfo.xp} / {levelInfo.nextLevelXp} XP</div>
          </div>
        </div>
        <div className="w-28 bg-accent rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${levelInfo.progressPercentage}%` }}></div>
        </div>
      </div>
    </header>
  );
};

export default Header;