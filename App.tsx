import React, { useState, useEffect, useMemo } from 'react';
import { useMockData } from './hooks/useMockData';
import PlantCard from './components/PlantCard';
import AddPlantModal from './components/AddPlantModal';
import Header from './components/Header';
import Navbar from './components/Navbar';
import CalendarScreen from './components/CalendarScreen';
import PlantDetailScreen from './components/PlantDetailScreen';
import { AddIcon, WaterDropIcon } from './components/icons';
import { Plant, CareType } from './types';

const SCREENS = {
  GARDEN: 'Сад',
  CALENDAR: 'Календарь',
  PROFILE: 'Профиль',
};

export default function App() {
  const { 
    plants, 
    levelInfo, 
    addPlant, 
    logCareEvent, 
    waterAllDuePlants,
    careEvents,
    updatePlant,
    user,
    deletePlant,
  } = useMockData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState(SCREENS.GARDEN);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  
  const selectedPlant = useMemo(
    () => plants.find(p => p.id === selectedPlantId) || null,
    [plants, selectedPlantId]
  );
  
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };
  
  const handleSelectPlant = (plant: Plant) => {
    setSelectedPlantId(plant.id);
  };

  const handleBackToGarden = () => {
    setSelectedPlantId(null);
  };
  
  const handleSetActiveScreen = (screen: string) => {
    setSelectedPlantId(null);
    setActiveScreen(screen);
  };

  const handleAddPlant = (plant: Omit<Plant, 'id' | 'createdAt'>) => {
    addPlant(plant);
    setIsModalOpen(false);
  };
  
  const handleDeletePlant = (plantId: string) => {
    deletePlant(plantId);
    // FIX: Explicitly set selected plant to null to navigate back to the garden.
    // Relying on the derived state from useMemo was not reliably triggering the UI update.
    setSelectedPlantId(null);
  };

  const handleWaterAll = () => {
    waterAllDuePlants();
  };

  const renderGardenContent = () => (
     <>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Мой сад</h1>
          <button
            onClick={handleWaterAll}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            <WaterDropIcon className="w-4 h-4" />
            Полить все
          </button>
        </div>
        {plants.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
            {plants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} onLogCare={logCareEvent} onSelect={handleSelectPlant} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400">Ваш сад пуст.</p>
            <p className="text-gray-500 dark:text-gray-400">Добавьте ваше первое растение!</p>
          </div>
        )}
      </>
  );

  const renderContent = () => {
    switch (activeScreen) {
      case SCREENS.CALENDAR:
        return <CalendarScreen plants={plants} />;
      case SCREENS.GARDEN:
      default:
        return renderGardenContent();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <div className="container mx-auto max-w-lg p-0 flex flex-col h-screen">
        <Header 
          levelInfo={levelInfo} 
          isDarkMode={isDarkMode}
          toggleTheme={handleToggleTheme}
        />

        <main className="flex-grow p-4 overflow-y-auto pb-24">
          {selectedPlant ? (
            <PlantDetailScreen 
              plant={selectedPlant} 
              onBack={handleBackToGarden} 
              onUpdatePlant={updatePlant}
              onLogCareEvent={logCareEvent}
              onDeletePlant={handleDeletePlant}
            />
          ) : (
            renderContent()
          )}
        </main>
        
        {activeScreen === SCREENS.GARDEN && !selectedPlant && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-24 right-6 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-background"
            aria-label="Добавить новое растение"
          >
            <AddIcon className="w-6 h-6" />
          </button>
        )}

        <Navbar 
          activeScreen={activeScreen} 
          setActiveScreen={handleSetActiveScreen} 
          userPhotoUrl={user.photoUrl}
        />

        <AddPlantModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddPlant={handleAddPlant}
        />
      </div>
    </div>
  );
}