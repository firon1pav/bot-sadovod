import React from 'react';
import { GardenIcon, CalendarIcon, ProfileIcon } from './icons';

interface NavbarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  userPhotoUrl?: string;
}

const navItems = [
  { name: 'Сад', icon: GardenIcon },
  { name: 'Календарь', icon: CalendarIcon },
  { name: 'Профиль', icon: ProfileIcon },
];

const Navbar: React.FC<NavbarProps> = ({ activeScreen, setActiveScreen, userPhotoUrl }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-card/80 backdrop-blur-lg border-t border-accent">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = activeScreen === item.name;
          const isProfile = item.name === 'Профиль';

          return (
            <button
              key={item.name}
              onClick={() => setActiveScreen(item.name)}
              className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              {isProfile && userPhotoUrl ? (
                <img src={userPhotoUrl} alt="Аватар" className="w-6 h-6 mb-1 rounded-full object-cover" />
              ) : (
                <item.icon className="w-6 h-6 mb-1" />
              )}
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;