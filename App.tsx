import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import PlantCard from './components/PlantCard';
import CalendarScreen from './components/CalendarScreen';
import ProfileScreen from './components/ProfileScreen';
import AddPlantModal from './components/AddPlantModal';
import PlantDetailScreen from './components/PlantDetailScreen';
import { PlusIcon } from './components/icons';
import useMockData from './hooks/useMockData';
import { Plant, CareType } from './types';

const App: React.FC = () => {
  const {
    user,
    plants,
    careEvents,
    stats,
    levelInfo,
    achievements,
    addPlant,
    updatePlant,
    deletePlant,
    logCare,
  } = useMockData();

  const [activeScreen, setActiveScreen] = useState('Сад');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAddPlantModalOpen, setIsAddPlantModalOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleSelectPlant = (plant: Plant) => {
    setSelectedPlant(plant);
  };

  const handleCloseDetail = () => {
    setSelectedPlant(null);
  };
  
  const handleAddPlant = (plant: Omit<Plant, 'id' | 'createdAt'>) => {
    addPlant(plant);
    setIsAddPlantModalOpen(false);
  };
  
  const handleDeletePlant = (plantId: string) => {
    deletePlant(plantId);
    setSelectedPlant(null);
  }

  const handleNavChange = (screenName: string) => {
    setSelectedPlant(null); // Close plant detail view when navigating
    setActiveScreen(screenName);
  };

  const renderScreen = () => {
    if (selectedPlant) {
      return (
        <PlantDetailScreen 
          plant={selectedPlant} 
          onBack={handleCloseDetail} 
          onUpdatePlant={updatePlant}
          onLogCareEvent={logCare}
          onDeletePlant={handleDeletePlant}
        />
      );
    }

    switch (activeScreen) {
      case 'Сад':
        // Garden screen logic is implemented here directly
        return (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold mb-4">Мой сад</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {plants.map((plant) => (
                <PlantCard 
                  key={plant.id} 
                  plant={plant} 
                  onLogCare={logCare} 
                  onSelect={handleSelectPlant} 
                />
              ))}
            </div>
            <button
              onClick={() => setIsAddPlantModalOpen(true)}
              className="fixed bottom-20 right-5 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-transform hover:scale-110"
            >
              <PlusIcon className="w-6 h-6" />
            </button>
          </div>
        );
      case 'Календарь':
        return <CalendarScreen plants={plants} />;
      case 'Профиль':
        return (
            <ProfileScreen 
                user={user}
                stats={stats}
                levelInfo={levelInfo}
                achievements={achievements}
                plants={plants}
                careEvents={careEvents}
            />
        );
      default:
        return <div>Экран не найден</div>;
    }
  };

  return (
    <div className={`bg-background text-foreground min-h-screen font-sans ${isDarkMode ? 'dark' : ''}`}>
        <div className="max-w-lg mx-auto pb-24">
            <Header levelInfo={levelInfo} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            <main className="p-4">
                {renderScreen()}
            </main>
            <Navbar activeScreen={activeScreen} setActiveScreen={handleNavChange} userPhotoUrl={user.photoUrl} />
        </div>
        <AddPlantModal 
            isOpen={isAddPlantModalOpen} 
            onClose={() => setIsAddPlantModalOpen(false)}
            onAddPlant={handleAddPlant}
        />
    </div>
  );
};

export default App;