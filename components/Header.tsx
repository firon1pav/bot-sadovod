import React from 'react';
import { LevelInfo } from '../types';
import { SunIcon, MoonIcon } from './icons';

interface HeaderProps {
  levelInfo: LevelInfo;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ levelInfo, isDarkMode, toggleTheme }) => {
  return (
    <header className="bg-card/80 backdrop-blur-lg border-b border-accent p-4 sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{levelInfo.levelIcon}</span>
          <div>
            <div className="font-bold text-sm text-primary">{levelInfo.levelName} - Lvl {levelInfo.level}</div>
            <div className="text-xs text-foreground/70">{levelInfo.xp} / {levelInfo.nextLevelXp} XP</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-20 bg-accent rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${levelInfo.progressPercentage}%` }}></div>
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-accent">
                {isDarkMode ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;