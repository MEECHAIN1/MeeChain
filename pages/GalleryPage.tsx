import React from 'react';
import { useApp } from '../context/AppState';
import { generateMeeBotName, getMeeBotRarity } from '../lib/meeBotNames'; // ตรวจสอบ path
import { MeeBot } from '../types'; // ตรวจสอบ path
import { PlusIcon } from '@heroicons/react/24/solid';

const GalleryPage: React.FC = () => {
  const { state, setGalleryFilter, addBot, notify } = useApp();
  const { myBots, galleryFilter, loadingStates } = state;

  // Filter bots based on selected filter
  const filteredBots = myBots.filter(bot => {
    if (galleryFilter === 'All') return true;
    return getMeeBotRarity(bot.name).label === galleryFilter.toUpperCase();
  });

  const availableRarities = [
    'All', 'Legendary', 'Epic', 'Rare', 'Common'
  ];

  // Dummy function for adding a new bot (for testing purposes)
  const handleAddRandomBot = () => {
    const newId = (myBots.length + 3600).toString(); // Ensure unique ID
    const newBot: MeeBot = {
      id: newId,
      name: generateMeeBotName(newId),
      rarity: getMeeBotRarity(generateMeeBotName(newId)).label, // Dynamically set rarity based on name
      energyLevel: Math.floor(Math.random() * 100),
      stakingStart: null,
      isStaking: false,
      image: `https://picsum.photos/seed/meebot_${newId}/1024/1024`,
      baseStats: {
        power: 40 + Math.random() * 20,
        speed: 40 + Math.random() * 20,
        intel: 40 + Math.random() * 20
      },
      components: ["Random Component A", "Random Component B"]
    };
    addBot(newBot);
    notify('success', `New MeeBot ${newBot.name} added to your gallery!`);
  };

  if (loadingStates.gallery || loadingStates.general) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
        <p className="mt-4 text-slate-400">Loading MeeBot Gallery...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-4xl font-extrabold text-white">MeeBot Gallery <span className="text-amber-500">({myBots.length})</span></h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddRandomBot}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-2 transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5" /> Add Random Bot
          </button>
        </div>
      </div>

      {/* Rarity Filter */}
      <div className="flex flex-wrap gap-3 p-2 bg-slate-800/50 rounded-xl shadow-inner">
        {availableRarities.map(filter => (
          <button
            key={filter}
            onClick={() => setGalleryFilter(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
              ${galleryFilter === filter 
                ? 'bg-amber-500 text-black shadow-lg scale-105' 
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* MeeBot Grid */}
      {filteredBots.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-lg">No MeeBots found with the current filter. Try adding some!</p>
          <button
            onClick={handleAddRandomBot}
            className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 mx-auto transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5" /> Summon First MeeBot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBots.map(bot => {
            const botRarity = getMeeBotRarity(bot.name); // Get rarity based on deterministic name
            return (
              <div
                key={bot.id}
                className="relative glass p-6 rounded-2xl flex flex-col items-center border border-white/5 transition-all duration-300 transform hover:scale-[1.02]"
                style={{ borderColor: botRarity.color, boxShadow: botRarity.glow }}
              >
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
                     style={{ backgroundColor: botRarity.bg, color: botRarity.color }}>
                  {botRarity.label}
                </div>
                <img
                  src={bot.image}
                  alt={bot.name}
                  className="w-full h-auto aspect-square rounded-xl object-cover mb-4 border border-white/5"
                />
                <h3 className="text-2xl font-bold text-white mb-2 text-center break-words">{bot.name}</h3>
                <p className="text-xs text-slate-400 mb-4">ID: {bot.id}</p>

                <div className="w-full text-center">
                  <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-mono rounded-full">
                    Energy: {bot.energyLevel}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;