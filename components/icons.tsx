
import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & { className?: string };

// --- Standard UI Icons ---

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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M12.965 2.553a1.125 1.125 0 00-1.93 0C8.357 7.105 5.25 10.802 5.25 14.625a6.75 6.75 0 0013.5 0c0-3.823-3.107-7.52-5.785-12.072z" clipRule="evenodd" />
    </svg>
);

export const LocationIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
);

export const ScissorsIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M15.75 1.5a.75.75 0 00-.612.322l-4.702 6.785-4.703-6.785a.75.75 0 00-1.232.856L8.96 9.12a4.5 4.5 0 101.31 1.31l6.34-4.395a.75.75 0 00-.61-1.235H15.75zM5.625 15.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm9.375-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
    </svg>
);

export const SpadeIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M12 2.25c.355 0 .694.126.955.365l.06.063a.75.75 0 0 1 .209.56v2.012h2.026a.75.75 0 0 1 0 1.5H8.75a.75.75 0 0 1 0-1.5h2.025V3.238a.75.75 0 0 1 .27-.56l.06-.063A1.29 1.29 0 0 1 12 2.25ZM7.5 9a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 .75.75v7.5c0 2.071-1.679 3.75-3.75 3.75h-1.5a3.75 3.75 0 0 1-3.75-3.75V9Z" clipRule="evenodd" />
    </svg>
);

export const FertilizerIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        {/* Flask Body */}
        <path d="M10 2h4v6l5 11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2l5-11V2z" />
        {/* DNA Double Helix */}
        <path d="M10.5 11c0 1.33 3 1.33 3 2.67s-3 1.33-3 2.67s3 1.33 3 2.67" />
        <path d="M13.5 11c0 1.33-3 1.33-3 2.67s3 1.33 3 2.67s-3 1.33-3 2.67" />
        {/* Rungs */}
        <path d="M10.5 13.67h3" />
        <path d="M10.5 16.33h3" />
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

export const CakeIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.126-6 .37m12 0c.39.049.777.102 1.163.16 1.07.163 1.837 1.09 1.837 2.175v5.17c0 .62-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.084.768-2.012 1.837-2.175a48.111 48.111 0 011.163-.16m12 0V14.25" />
    </svg>
);

export const GardenForkIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
);

export const AtSymbolIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" />
    </svg>
);

export const SearchIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

export const CheckIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

export const UsersIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
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

export const FlagIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
    </svg>
);

export const StarIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
);

export const TrophyIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172V9.75a3.75 3.75 0 0 0-3.75-3.75h-1.5A3.75 3.75 0 0 0 5.497 9.75v.928c0 1.218.356 2.353.982 3.172m9.008 0A7.455 7.455 0 0 0 16.5 9.75V9a3.75 3.75 0 0 0-3.75-3.75h-1.5A3.75 3.75 0 0 0 7.5 9v.75c0 2.189 1.058 4.13 2.686 5.372M12 5.25V3m-3 0h6" />
    </svg>
);

// --- Special Achievement Icons (Redesigned) ---

export const FirstWaterIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <linearGradient id="waterGrad2" x1="20" y1="4" x2="20" y2="38" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8" />
                <stop offset="1" stopColor="#0284C7" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
        </defs>
        <path d="M20 4C20 4 6 20 6 28C6 35.732 12.268 40 20 40C27.732 40 34 35.732 34 28C34 20 20 4 20 4Z" fill="url(#waterGrad2)" />
        <path d="M14 22C14 22 14 28 19 32" stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" />
        <circle cx="24" cy="20" r="2" fill="white" fillOpacity="0.4" />
    </svg>
);

export const FirstPlantIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <linearGradient id="leafGrad2" x1="20" y1="10" x2="20" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#86EFAC" />
                <stop offset="1" stopColor="#22C55E" />
            </linearGradient>
        </defs>
        <path d="M10 36C10 36 15 32 20 32C25 32 30 36 30 36" stroke="#78350F" strokeWidth="3" strokeLinecap="round"/>
        <path d="M20 32V22" stroke="#22C55E" strokeWidth="3" strokeLinecap="round"/>
        <path d="M20 22C20 22 12 22 12 14C12 6 20 22 20 22Z" fill="url(#leafGrad2)" />
        <path d="M20 22C20 22 28 22 28 14C28 6 20 22 20 22Z" fill="url(#leafGrad2)" />
    </svg>
);

export const FirstCommunityIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <linearGradient id="commGrad2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F472B6" />
                <stop offset="1" stopColor="#C084FC" />
            </linearGradient>
        </defs>
        <circle cx="20" cy="12" r="6" fill="url(#commGrad2)" />
        <circle cx="10" cy="28" r="6" fill="url(#commGrad2)" />
        <circle cx="30" cy="28" r="6" fill="url(#commGrad2)" />
        <path d="M16 16L13 23" stroke="#E879F9" strokeWidth="2" strokeLinecap="round"/>
        <path d="M24 16L27 23" stroke="#E879F9" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 28H24" stroke="#E879F9" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

export const FirstFertilizeIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
             <linearGradient id="flaskGrad" x1="20" y1="10" x2="20" y2="38" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A78BFA" />
                <stop offset="1" stopColor="#7C3AED" />
            </linearGradient>
        </defs>
        <path d="M16 6H24V14L30 34C30 36 28 38 26 38H14C12 38 10 36 10 34L16 14V6Z" fill="url(#flaskGrad)" stroke="#6D28D9" strokeWidth="2"/>
        <path d="M16 6V4H24V6" stroke="#6D28D9" strokeWidth="2"/>
        <path d="M18 20L22 24" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round"/>
        <path d="M22 20L18 24" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="20" cy="28" r="4" fill="#DDD6FE" fillOpacity="0.5"/>
    </svg>
);

export const FirstRepotIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
             <linearGradient id="potGrad2" x1="20" y1="20" x2="20" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDBA74" />
                <stop offset="1" stopColor="#EA580C" />
            </linearGradient>
        </defs>
        <path d="M12 22H28L26 38H14L12 22Z" fill="url(#potGrad2)" />
        <path d="M10 18H30V22H10V18Z" fill="#9A3412" />
        <path d="M20 28V10" stroke="#22C55E" strokeWidth="4" strokeLinecap="round"/>
        <path d="M20 10L14 16" stroke="#22C55E" strokeWidth="4" strokeLinecap="round"/>
        <path d="M20 10L26 16" stroke="#22C55E" strokeWidth="4" strokeLinecap="round"/>
    </svg>
);

export const FirstTrimIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <linearGradient id="bladeGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9CA3AF" />
                <stop offset="1" stopColor="#4B5563" />
            </linearGradient>
        </defs>
        <circle cx="12" cy="30" r="4" stroke="#EF4444" strokeWidth="3" />
        <circle cx="28" cy="30" r="4" stroke="#EF4444" strokeWidth="3" />
        <path d="M14 27L32 6" stroke="url(#bladeGrad)" strokeWidth="3" />
        <path d="M26 27L8 6" stroke="url(#bladeGrad)" strokeWidth="3" />
        <circle cx="20" cy="20" r="2" fill="#1F2937" />
        <path d="M34 10L38 6" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 2"/>
    </svg>
);

export const FivePlantsIcon: React.FC<IconProps> = (props) => (
     <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M20 4L34 12V24C34 32 28 38 20 40C12 38 6 32 6 24V12L20 4Z" fill="#ECFCCB" stroke="#84CC16" strokeWidth="2"/>
        <text x="20" y="28" fontFamily="sans-serif" fontSize="20" fontWeight="900" fill="#3F6212" textAnchor="middle">5</text>
        <path d="M20 4L20 14" stroke="#84CC16" strokeWidth="2" strokeOpacity="0.5"/>
    </svg>
);

export const TenPlantsIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M8 20C8 12 20 4 20 4C20 4 32 12 32 20C32 28 26 36 20 36C14 36 8 28 8 20Z" stroke="#EAB308" strokeWidth="2" fill="none"/>
        <path d="M8 20C8 20 4 24 8 28" stroke="#EAB308" strokeWidth="2" strokeLinecap="round"/>
        <path d="M32 20C32 20 36 24 32 28" stroke="#EAB308" strokeWidth="2" strokeLinecap="round"/>
        <text x="20" y="26" fontFamily="sans-serif" fontSize="16" fontWeight="900" fill="#CA8A04" textAnchor="middle">10</text>
        <path d="M20 4V10" stroke="#EAB308" strokeWidth="2"/>
        <circle cx="20" cy="36" r="2" fill="#EAB308"/>
    </svg>
);

export const WateringMasterIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
             <linearGradient id="goldGrad" x1="20" y1="4" x2="20" y2="38" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FCD34D" />
                <stop offset="1" stopColor="#F59E0B" />
            </linearGradient>
        </defs>
        <path d="M20 4C20 4 6 20 6 28C6 35.732 12.268 40 20 40C27.732 40 34 35.732 34 28C34 20 20 4 20 4Z" fill="url(#goldGrad)" />
        <path d="M12 12L8 8L12 4" stroke="#F59E0B" strokeWidth="2" fill="none"/>
        <path d="M28 12L32 8L28 4" stroke="#F59E0B" strokeWidth="2" fill="none"/>
        <path d="M16 18H24" stroke="#B45309" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

export const FirstFriendIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M14 16C14 12.686 16.686 10 20 10C23.314 10 26 12.686 26 16V20C26 23.314 23.314 26 20 26C16.686 26 14 23.314 14 20V16Z" fill="#F87171" fillOpacity="0.8"/>
        <circle cx="20" cy="14" r="4" fill="#FECACA"/>
        <path d="M10 34C10 28 14 26 20 26C26 26 30 28 30 34" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
        <path d="M6 24L10 20" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
        <path d="M34 24L30 20" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

export const CommunityFounderIcon: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <linearGradient id="flagGrad2" x1="12" y1="6" x2="32" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60A5FA" />
                <stop offset="1" stopColor="#2563EB" />
            </linearGradient>
        </defs>
        <path d="M12 6V38" stroke="#1E293B" strokeWidth="4" strokeLinecap="round"/>
        <path d="M14 6H34L28 14L34 22H14V6Z" fill="url(#flagGrad2)"/>
        <path d="M8 38H16" stroke="#1E293B" strokeWidth="4" strokeLinecap="round"/>
    </svg>
);
