
import React, { useEffect, useState } from 'react';

const AppLoader: React.FC = () => {
  const [stage, setStage] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  const texts = [
    "Сажаем семена...",
    "Поливаем...",
    "Ловим лучи солнца...",
    "Распускаем листья...",
    "Добро пожаловать в сад!"
  ];

  useEffect(() => {
    // Stage sequence
    const timers = [
      setTimeout(() => setStage(1), 200), // Start stem
      setTimeout(() => setStage(2), 1200), // Leaves
      setTimeout(() => setStage(3), 1800), // Flower
    ];

    // Text cycler
    const textInterval = setInterval(() => {
      setTextIndex(prev => (prev < texts.length - 1 ? prev + 1 : prev));
    }, 800);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(textInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md">
      <div className="relative w-48 h-48 mb-8">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          {/* Ground */}
          <path 
            d="M20 90 Q50 95 80 90" 
            stroke="#8B4513" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round"
            className="animate-fade-in"
          />
          
          {/* Seed/Soil mound */}
          <path
            d="M45 90 Q50 85 55 90"
            fill="#5D4037"
            className="animate-fade-in"
          />

          {/* Stem */}
          {stage >= 1 && (
            <path
              d="M50 90 C50 80 45 60 50 40"
              stroke="#22C55E"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              className="animate-grow-stem origin-bottom"
              style={{ strokeDasharray: 100 }}
            />
          )}

          {/* Leaves */}
          {stage >= 2 && (
            <g className="animate-leaf-out origin-center" style={{ transformBox: 'fill-box' }}>
              <path
                d="M50 60 Q30 50 40 70"
                fill="#4ADE80"
                stroke="#16A34A"
                strokeWidth="1"
              />
              <path
                d="M50 50 Q70 40 60 60"
                fill="#4ADE80"
                stroke="#16A34A"
                strokeWidth="1"
              />
            </g>
          )}

          {/* Flower */}
          {stage >= 3 && (
            <g className="animate-bloom origin-center" style={{ transformBox: 'fill-box', transformOrigin: '50px 40px' }}>
              <circle cx="50" cy="40" r="12" fill="#F472B6" />
              <circle cx="50" cy="40" r="6" fill="#FCD34D" />
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <ellipse
                  key={i}
                  cx="50"
                  cy="40"
                  rx="6"
                  ry="14"
                  fill="#EC4899"
                  transform={`rotate(${deg} 50 40) translate(0 -10)`}
                  opacity="0.8"
                />
              ))}
            </g>
          )}
        </svg>
      </div>
      
      <p className="text-lg font-medium text-primary animate-pulse transition-all duration-500 min-h-[1.5rem] text-center px-4">
        {texts[textIndex]}
      </p>
    </div>
  );
};

export default AppLoader;
