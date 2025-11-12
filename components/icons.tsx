import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & { className?: string };

export const SunIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

export const GardenIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 15h10v4a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-4z M12 9a6 6 0 0 0-6-6h-1v1a6 6 0 0 0 6 6h1m-1 2a6 6 0 0 1 6-6h1v1a6 6 0 0 1-6 6h-1m-1-2V15" />
    </svg>
);

export const CalendarIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h2.25" />
    </svg>
);

export const ProfileIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

export const WaterDropIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22a7 7 0 0 0 7-7c0-2.39-3.27-7.21-7-11C8.27 7.79 5 12.61 5 15a7 7 0 0 0 7 7z" />
    </svg>
);

export const LocationIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
);

export const ScissorsIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 4L8.12 15.88" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.47 14.48L20 20" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.12 8.12L12 12" />
    </svg>
);

export const SpadeIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6m-9 3h12v3H6zm1.5 5l4.5 9 4.5-9h-9z" />
    </svg>
);

export const FertilizerIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 20h14M12 20V4m-5 8l5-5 5 5" />
    </svg>
);

export const BackIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

export const EditIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
);

export const SaveIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const UploadIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export const StatsIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

export const AchievementIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a2.25 2.25 0 01-2.25-2.25v-9a2.25 2.25 0 012.25-2.25h9A2.25 2.25 0 0118.75 7.5v9a2.25 2.25 0 01-2.25 2.25z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75l-3-3 1.5-1.5 1.5 1.5 3-3L15 12l-3 3.75z" />
  </svg>
);


export const HistoryIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const CakeIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.75a.75.75 0 01-.75.75H3.75a.75.75 0 010-1.5h16.5a.75.75 0 01.75.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v11.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5a3 3 0 100-6 3 3 0 000 6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 11.25c0-4.142-3.358-7.5-7.5-7.5s-7.5 3.358-7.5 7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21a1.5 1.5 0 001.5 1.5h15a1.5 1.5 0 001.5-1.5v-6.75H3v6.75z" />
  </svg>
);


export const UsersIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.598M12 14.25a5.25 5.25 0 100-10.5 5.25 5.25 0 000 10.5z" />
    </svg>
);

export const GardenForkIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12V3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12V3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12V3" />
    </svg>
);

export const AtSymbolIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM19.5 12c0-5.94-4.06-10.5-9-10.5S1.5 6.06 1.5 12s4.06 10.5 9 10.5c2.4 0 4.6-.8 6.3-2.1" />
    </svg>
);

export const SearchIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

export const MessageCircleIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a1.125 1.125 0 01-1.59 0l-3.72-3.72A2.122 2.122 0 013 14.894V8.511c0-.97 1.5-2.097 1.5-2.097S6.25 5.312 6.25 4.375c0-1.125.75-2.062 1.5-2.062h8.5c.75 0 1.5.938 1.5 2.062 0 .937-1.75 3.037-1.75 3.037z" />
    </svg>
);

export const UserPlusIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m3-3h-3M15 9a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21v-1.5a5.25 5.25 0 015.25-5.25h3a5.25 5.25 0 015.25 5.25v1.5" />
    </svg>
);

export const FlagIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
  </svg>
);
// FIX: Added missing icons that were causing import errors in other components.
export const StarIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

export const TrophyIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a2.25 2.25 0 00-2.25 2.25v.015c0 .54.435.985.985.985h11.53c.55 0 .985-.445.985-.985v-.015a2.25 2.25 0 00-2.25-2.25zM12 2.25c-2.485 0-4.5 2.015-4.5 4.5v1.5a4.5 4.5 0 004.5 4.5h.008c2.485 0 4.5-2.015 4.5-4.5v-1.5a4.5 4.5 0 00-4.5-4.5H12z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75V15m0 0V18.75m0-6H6.75m10.5 0H12" />
  </svg>
);

export const MoreHorizontalIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

export const PaperAirplaneIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

// --- Achievement Icons ---
const AchievementIconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="32" cy="32" r="30" fill="#FBF5E9" stroke="#E0D5C1" strokeWidth="2"/>
        {children}
    </svg>
);

export const FirstWaterIcon: React.FC<IconProps> = () => (
    <AchievementIconWrapper>
        <defs>
            <linearGradient id="waterCanBodyGradient" x1="28.9836" y1="31.8415" x2="40.3524" y2="19.3408" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9AC4DA"/>
              <stop offset="1" stopColor="#6F9FC3"/>
            </linearGradient>
            <linearGradient id="waterCanHandleGradient" x1="41.3323" y1="23.9512" x2="43.0805" y2="28.2435" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9AC4DA"/>
              <stop offset="1" stopColor="#6F9FC3"/>
            </linearGradient>
            <linearGradient id="waterCanSpoutGradient" x1="48.5146" y1="26.3537" x2="50.6234" y2="22.2598" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9AC4DA"/>
              <stop offset="1" stopColor="#6F9FC3"/>
            </linearGradient>
            <radialGradient id="waterDropGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(47 44.5) rotate(90) scale(4.5 3)">
              <stop stopColor="#ADD8E6"/>
              <stop offset="1" stopColor="#7BBEDC"/>
            </radialGradient>
            <linearGradient id="leafGradient" x1="29.9701" y1="46.7368" x2="33.8209" y2="50.3158" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8BC34A"/>
              <stop offset="1" stopColor="#689F38"/>
            </linearGradient>
          </defs>
          <path d="M41.75 19.5L37.5 17.5L36.25 19.5H25C23.3431 19.5 22 20.8431 22 22.5V28.5C22 30.1569 23.3431 31.5 25 31.5H42C43.6569 31.5 45 30.1569 45 28.5V22.5C45 20.8431 43.6569 19.5 42 19.5H41.75Z" fill="url(#waterCanBodyGradient)" stroke="#2C3E50" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M24.75 22C24.75 21.1716 25.4216 20.5 26.25 20.5H36.75C37.5784 20.5 38.25 21.1716 38.25 22V24.5H24.75V22Z" fill="url(#waterCanBodyGradient)" stroke="#2C3E50" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M42 19.5V22H43.5C44.3284 22 45 22.6716 45 23.5V27.5C45 28.3284 44.3284 29 43.5 29H41V26.5C41 25.9477 41.4477 25.5 42 25.5H43C43.5523 25.5 44 25.0523 44 24.5V23C44 22.4477 43.5523 22 43 22H42V19.5Z" fill="url(#waterCanHandleGradient)" stroke="#2C3E50" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M45 27.5L51 22V29L45 32V27.5Z" fill="url(#waterCanSpoutGradient)" stroke="#2C3E50" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="49.5" cy="24.5" r="1.25" fill="#E6F4F7" stroke="#2C3E50" strokeWidth="0.5"/>
          <circle cx="49.5" cy="26.5" r="1.25" fill="#E6F4F7" stroke="#2C3E50" strokeWidth="0.5"/>
          <circle cx="49.5" cy="28.5" r="1.25" fill="#E6F4F7" stroke="#2C3E50" strokeWidth="0.5"/>
          <path d="M47 38.5C47 37.6716 47.6716 37 48.5 37C49.3284 37 50 37.6716 50 38.5C50 39.3284 48.5 44 48.5 44C48.5 44 47 39.3284 47 38.5Z" fill="url(#waterDropGradient)" stroke="#4682B4" strokeWidth="1.5"/>
          <path d="M30 52C30 50.8954 31.5 50 33 50C34.5 50 36 50.8954 36 52C36 53.1046 30 53.1046 30 52Z" fill="#8B4513" stroke="#4A6A77" strokeWidth="1.5"/>
          <path d="M33 50V46" stroke="#4A6A77" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M33 46L31.5 47.5L30.5 48.5L31.5 49L32 48.5L33 46Z" fill="url(#leafGradient)" stroke="#228B22" strokeWidth="1.5" strokeLinejoin="round"/>
    </AchievementIconWrapper>
);

export const FirstPlantIcon: React.FC<IconProps> = () => (
    <AchievementIconWrapper>
        <defs>
            <linearGradient id="potGradient1" x1="15" y1="45" x2="25" y2="55" gradientUnits="userSpaceOnUse">
              <stop stopColor="#DAA520"/>
              <stop offset="1" stopColor="#8B4513"/>
            </linearGradient>
            <linearGradient id="potGradient2" x1="38" y1="45" x2="48" y2="55" gradientUnits="userSpaceOnUse">
              <stop stopColor="#D4AF37"/>
              <stop offset="1" stopColor="#8B4513"/>
            </linearGradient>
            <linearGradient id="leafGradient" x1="18" y1="30" x2="25" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#32CD32"/>
              <stop offset="1" stopColor="#228B22"/>
            </linearGradient>
            <linearGradient id="flowerLeafGradient" x1="42" y1="30" x2="49" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A4C7D6"/>
              <stop offset="1" stopColor="#E6F4F7"/>
            </linearGradient>
            <linearGradient id="flowerPetalGradient" x1="42" y1="20" x2="49" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E6F4F7"/>
              <stop offset="1" stopColor="#87CEEB"/>
            </linearGradient>
          </defs>
          <path d="M25 54H15L14 48H26L25 54Z" fill="url(#potGradient1)" stroke="#4A6A77" strokeWidth="1.5"/>
          <rect x="14" y="46" width="12" height="3" rx="1.5" fill="url(#potGradient1)" stroke="#4A6A77" strokeWidth="1.5"/>
          <path d="M20 46V36" stroke="#4A6A77" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M20 36C18 36 17 38 17 40L18 42L19 41L20 36Z" fill="url(#leafGradient)" stroke="#228B22" strokeWidth="1.5"/>
          <path d="M20 36C22 36 23 38 23 40L22 42L21 41L20 36Z" fill="url(#leafGradient)" stroke="#228B22" strokeWidth="1.5"/>
          <path d="M48 54H38L37 48H49L48 54Z" fill="url(#potGradient2)" stroke="#4A6A77" strokeWidth="1.5"/>
          <rect x="37" y="46" width="12" height="3" rx="1.5" fill="url(#potGradient2)" stroke="#4A6A77" strokeWidth="1.5"/>
          <path d="M43 46V36" stroke="#4A6A77" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M43 36C41 36 40 38 40 40L41 42L42 41L43 36Z" fill="url(#flowerLeafGradient)" stroke="#228B22" strokeWidth="1.5"/>
          <path d="M43 36C45 36 46 38 46 40L45 42L44 41L43 36Z" fill="url(#flowerLeafGradient)" stroke="#228B22" strokeWidth="1.5"/>
          <circle cx="43" cy="30" r="3" fill="#D4AF37" stroke="#4A6A77" strokeWidth="1"/>
          <circle cx="43" cy="27" r="2.5" fill="url(#flowerPetalGradient)" stroke="#4A6A77" strokeWidth="1"/>
          <circle cx="46" cy="30" r="2.5" fill="url(#flowerPetalGradient)" stroke="#4A6A77" strokeWidth="1"/>
          <circle cx="40" cy="30" r="2.5" fill="url(#flowerPetalGradient)" stroke="#4A6A77" strokeWidth="1"/>
          <circle cx="43" cy="33" r="2.5" fill="url(#flowerPetalGradient)" stroke="#4A6A77" strokeWidth="1"/>
          <path d="M30 38C32 36 34 36 36 38" stroke="#32CD32" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
          <path d="M30 36C32 34 34 34 36 36" stroke="#32CD32" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
          <circle cx="31" cy="36" r="1.5" fill="#32CD32"/>
          <circle cx="35" cy="36" r="1.5" fill="#32CD32"/>
    </AchievementIconWrapper>
);

export const FirstCommunityIcon: React.FC<IconProps> = () => (
    <AchievementIconWrapper>
        <defs>
            <linearGradient id="speechBubbleGradient" x1="15" y1="20" x2="50" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E6F4F7"/>
              <stop offset="1" stopColor="#A4C7D6"/>
            </linearGradient>
            <linearGradient id="plantLeafGradient1" x1="20" y1="30" x2="25" y2="35" gradientUnits="userSpaceOnUse">
              <stop stopColor="#32CD32"/>
              <stop offset="1" stopColor="#228B22"/>
            </linearGradient>
            <linearGradient id="plantLeafGradient2" x1="30" y1="30" x2="35" y2="35" gradientUnits="userSpaceOnUse">
              <stop stopColor="#32CD32"/>
              <stop offset="1" stopColor="#228B22"/>
            </linearGradient>
            <linearGradient id="plantLeafGradient3" x1="40" y1="30" x2="45" y2="35" gradientUnits="userSpaceOnUse">
              <stop stopColor="#32CD32"/>
              <stop offset="1" stopColor="#228B22"/>
            </linearGradient>
          </defs>
          <path d="M48 20C51.3137 20 54 22.6863 54 26C54 29.3137 51.3137 32 48 32H40L35 38L30 32H16C12.6863 32 10 29.3137 10 26C10 22.6863 12.6863 20 16 20H48Z" fill="url(#speechBubbleGradient)" stroke="#2E5062" strokeWidth="1.5"/>
          <path d="M22 30V26" stroke="#4A6A77" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M22 26C20.5 26 19.5 27 19.5 28L20.5 29L21.5 28L22 26Z" fill="url(#plantLeafGradient1)" stroke="#228B22" strokeWidth="1.5"/>
          <path d="M22 26C23.5 26 24.5 27 24.5 28L23.5 29L22.5 28L22 26Z" fill="url(#plantLeafGradient1)" stroke="#228B22" strokeWidth="1.5"/>
          <path d="M32 30V24" stroke="#4A6A77" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M32 24C30.5 24 29.5 25 29.5 26L30.5 27L31.5 26L32 24Z" fill="url(#plantLeafGradient2)" stroke="#228B22" strokeWidth="1.5"/>
          <path d="M32 24C33.5 24 34.5 25 34.5 26L33.5 27L32.5 26L32 24Z" fill="url(#plantLeafGradient2)" stroke="#228B22" strokeWidth="1.5"/>
          <path d="M42 30V26" stroke="#4A6A77" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M42 26C40.5 26 39.5 27 39.5 28L40.5 29L41.5 28L42 26Z" fill="url(#plantLeafGradient3)" stroke="#228B22" strokeWidth="1.5"/>
          <path d="M42 26C43.5 26 44.5 27 44.5 28L43.5 29L42.5 28L42 26Z" fill="url(#plantLeafGradient3)" stroke="#228B22" strokeWidth="1.5"/>
          <text x="32" y="47" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="bold" fill="#2E5062" textAnchor="middle">Общительный</text>
          <text x="32" y="55" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="bold" fill="#2E5062" textAnchor="middle">садовод</text>
    </AchievementIconWrapper>
);

export const FirstFertilizeIcon: React.FC<IconProps> = () => (
    <AchievementIconWrapper>
        <path d="M28 20 L36 20 L35 17 H 29 Z" fill="#F0FFFF" stroke="#ADD8E6" strokeWidth="1.5" />
        <path d="M26 20 L 25 38 A 4 4 0 0 0 29 42 H 35 A 4 4 0 0 0 39 38 L 38 20 Z" fill="#F0FFFF" stroke="#ADD8E6" strokeWidth="1.5" />
        <path d="M28 26 C 32 24, 36 28, 36 32" fill="#FFD700" opacity="0.5" />
        <path d="M35 34 L 37 32 L 35 30" stroke="#87CEEB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M29 42 C 29 42, 26 48, 32 48 S 35 42, 35 42" stroke="#228B22" strokeWidth="2" fill="#32CD32" />
        <path d="M24 28 L 22 27 M22 21 L 24 22 M20 25 L 19 24" stroke="#DAA520" strokeWidth="1" strokeLinecap="round" />
        <path d="M40 28 L 42 27 M42 21 L 40 22 M44 25 L 45 24" stroke="#DAA520" strokeWidth="1" strokeLinecap="round" />
    </AchievementIconWrapper>
);

export const FirstRepotIcon: React.FC<IconProps> = () => (
    <AchievementIconWrapper>
        <path d="M18 48 L 46 48 L 44 38 L 20 38 Z" fill="#A0522D" stroke="#8B4513" strokeWidth="2" />
        <path d="M16 22 C 16 12, 48 12, 48 22 C 48 32, 42 38, 32 38 C 22 38, 16 32, 16 22Z" fill="#228B22" stroke="#006400" strokeWidth="2"/>
        <path d="M28 38 L 28 32 L 36 32 L 36 38" fill="#F4A460" stroke="#D2691E" strokeWidth="1.5"/>
        <circle cx="32" cy="35" r="1" fill="#D2691E"/>
        <path d="M27 30 L 29 30 M 35 30 L 37 30" stroke="#D2691E" strokeWidth="1.5" />
        <path d="M32 38 V 48" stroke="#8B4513" strokeWidth="2" />
    </AchievementIconWrapper>
);

export const FirstTrimIcon: React.FC<IconProps> = () => (
    <AchievementIconWrapper>
        <path d="M44 26 L26 44" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M26 26 L44 44" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="23" cy="23" r="5" fill="#F0E68C" stroke="#D4AF37" strokeWidth="2.5"/>
        <circle cx="47" cy="47" r="5" fill="#F0E68C" stroke="#D4AF37" strokeWidth="2.5"/>
        <path d="M26 44 C 20 40, 20 30, 28 28" stroke="#6A5ACD" strokeWidth="2" fill="#9370DB"/>
        <path d="M20 47 L 22 45 M 18 44 L 20 42 M 22 41 L 24 39" stroke="#87CEEB" strokeWidth="1" strokeLinecap="round"/>
    </AchievementIconWrapper>
);

export const FivePlantsIcon: React.FC<IconProps> = () => (
    <AchievementIconWrapper>
        <path d="M16 48 C 20 44, 44 44, 48 48" fill="#A52A2A" stroke="#8B4513" strokeWidth="2" />
        <path d="M24 48 V 32 C 18 32, 18 22, 24 22 C 30 22, 30 32, 24 32" fill="#32CD32" stroke="#228B22" strokeWidth="2"/>
        <path d="M34 48 V 36 C 30 36, 30 28, 34 28 C 38 28, 38 36, 34 36" fill="#32CD32" stroke="#228B22" strokeWidth="2"/>
        <path d="M44 48 V 38 C 41 38, 41 32, 44 32 C 47 32, 47 38, 44 38" fill="#32CD32" stroke="#228B22" strokeWidth="2"/>
        <path d="M40 22 L 44 20 M 46 25 L 43 23" fill="none" stroke="#4682B4" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M20 26 L 16 24 M 14 29 L 17 27" fill="none" stroke="#4682B4" strokeWidth="1.5" strokeLinecap="round"/>
    </AchievementIconWrapper>
);

export const TenPlantsIcon: React.FC<IconProps> = () => (
    <AchievementIconWrapper>
        <path d="M22 48 V 26 H 42 V 48 Z M 22 26 L 18 22 V 44 H 22 M 42 26 L 46 22 V 44 H 42" fill="#DCDCDC" stroke="#A9A9A9" strokeWidth="2"/>
        <rect x="26" y="30" width="4" height="4" fill="#A9A9A9" />
        <rect x="34" y="30" width="4" height="4" fill="#A9A9A9" />
        <rect x="26" y="38" width="4" height="4" fill="#A9A9A9" />
        <rect x="34" y="38" width="4" height="4" fill="#A9A9A9" />
        <path d="M16 28 C 16 18, 48 18, 48 28 L 44 28 C 44 22, 20 22, 20 28 Z" fill="#228B22" stroke="#006400" strokeWidth="1.5"/>
        <path d="M48 24 L 52 22 M 54 27 L 51 25" fill="none" stroke="#4682B4" strokeWidth="1.5" strokeLinecap="round"/>
    </AchievementIconWrapper>
);

export const WateringMasterIcon: React.FC<IconProps> = () => (
    <AchievementIconWrapper>
        <path d="M18 30 C 14 30, 14 22, 22 22 L 30 22" stroke="#DAA520" strokeWidth="2.5" fill="none"/>
        <path d="M20 24 L 20 40 H 42 L 42 36 H 46 V 32 H 42" fill="#F0E68C" stroke="#DAA520" strokeWidth="2.5"/>
        <path d="M46 34 H 52" stroke="#87CEEB" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M48 38 L 50 40 M 46 42 L 48 44" stroke="#87CEEB" strokeWidth="2" strokeLinecap="round"/>
    </AchievementIconWrapper>
);

export const FirstFriendIcon: React.FC<IconProps> = () => (
    <AchievementIconWrapper>
        <path d="M21 34 l -4 -1 v -2 l 4 1 l -1 -4 h 2 l 1 4 v -4 h 2 v 4 l 1 -4 h 2 l -1 4 l 4 -1 v 2 l -4 1 v 4 h -2 v -4 l -1 4 h -2 l 1 -4 v 4 h -2 z" fill="#32CD32" stroke="#228B22" strokeWidth="1.5"/>
        <path d="M43 34 l 4 1 v 2 l -4 -1 l 1 4 h -2 l -1 -4 v 4 h -2 v -4 l -1 4 h -2 l 1 -4 l -4 1 v -2 l 4 -1 v -4 h 2 v 4 l 1 -4 h 2 l -1 4 z" fill="#32CD32" stroke="#228B22" strokeWidth="1.5"/>
    </AchievementIconWrapper>
);

export const CommunityFounderIcon: React.FC<IconProps> = () => (
    <AchievementIconWrapper>
        <path d="M18 44 L 46 44 L 44 38 H 20 Z" fill="#FFD700" stroke="#DAA520" strokeWidth="2"/>
        <path d="M18 38 L 24 22 L 32 28 L 40 22 L 46 38 Z" fill="#FFD700" stroke="#DAA520" strokeWidth="2"/>
        <circle cx="24" cy="22" r="3" fill="#87CEEB" stroke="white" strokeWidth="1"/>
        <circle cx="32" cy="28" r="3" fill="#87CEEB" stroke="white" strokeWidth="1"/>
        <circle cx="40" cy="22" r="3" fill="#87CEEB" stroke="white" strokeWidth="1"/>
    </AchievementIconWrapper>
);