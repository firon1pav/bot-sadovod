import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GardenIcon, CalendarIcon, ProfileIcon } from './icons';

interface NavbarProps {
  userPhotoUrl?: string;
}

const navItems = [
  { name: 'Сад', path: '/', icon: GardenIcon },
  { name: 'Календарь', path: '/calendar', icon: CalendarIcon },
  { name: 'Профиль', path: '/profile', icon: ProfileIcon },
];

const Navbar: React.FC<NavbarProps> = ({ userPhotoUrl }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-card/70 backdrop-blur-lg border-t border-accent z-30">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isProfile = item.name === 'Профиль';

          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
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