
import React, { useState, useRef } from 'react';
import { Player } from '../types';
import { analyzeRosterImage, getPlayerNews, getStartSitRecommendation } from '../services/gemini';
import { Loader2, Upload, Search, TrendingUp, UserPlus, X, ExternalLink, Activity, Tag, Award, Zap, ArrowDown, ArrowUp, PlusCircle, Lock, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';

interface Props {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
}

// Fantasy Football Vocabulary Categories
const TAG_CATEGORIES = {
  "Roles & Depth": [
    { label: "Team Captain", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" },
    { label: "QB1", color: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
    { label: "RB1", color: "bg-green-500/20 text-green-400 border-green-500/50" },
    { label: "WR1", color: "bg-purple-500/20 text-purple-400 border-purple-500/50" },
    { label: "TE1", color: "bg-orange-500/20 text-orange-400 border-orange-500/50" },
    { label: "Bellcow", color: "bg-stone-600 text-stone-300 border-stone-500" },
    { label: "Workhorse", color: "bg-zinc-600 text-zinc-300 border-zinc-500" },
    { label: "Game Manager", color: "bg-blue-900/30 text-blue-300 border-blue-700/50" },
    { label: "Flex", color: "bg-gray-700 text-gray-300 border-gray-600" },
    { label: "Handcuff", color: "bg-gray-700 text-gray-300 border-gray-600" },
  ],
  "Status & Traits": [
    { label: "Rookie", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" },
    { label: "Veteran", color: "bg-slate-600 text-slate-300 border-slate-500" },
    { label: "Comeback Player", color: "bg-sky-500/20 text-sky-400 border-sky-500/50" },
    { label: "Elite Route Runner", color: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/50" },
    { label: "Target Hog", color: "bg-green-600/20 text-green-400 border-green-500/50" },
    { label: "Speedy", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" },
    { label: "Upside", color: "bg-pink-500/20 text-pink-400 border-pink-500/50" },
    { label: "PPR Machine", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/50" },
    { label: "Deep Threat", color: "bg-violet-500/20 text-violet-400 border-violet-500/50" },
    { label: "TD Vulture", color: "bg-rose-900/30 text-rose-300 border-rose-500/40" },
  ],
  "Risk & Value": [
    { label: "League Winner", color: "bg-amber-500/20 text-amber-400 border-amber-500/50" },
    { label: "Sleeper", color: "bg-teal-500/20 text-teal-400 border-teal-500/50" },
    { label: "Boom/Bust", color: "bg-orange-600/20 text-orange-400 border-orange-500/50" },
    { label: "Injury Prone", color: "bg-red-500/20 text-red-400 border-red-500/50" },
    { label: "TD or Bust", color: "bg-red-900/20 text-red-300 border-red-700/50" },
    { label: "Trade Bait", color: "bg-lime-500/20 text-lime-400 border-lime-500/50" },
    { label: "Past Prime", color: "bg-amber-900/20 text-amber-500 border-amber-700/30" },
    { label: "Floor Play", color: "bg-teal-900/30 text-teal-300 border-teal-500/40" },
  ]
};

const getPositionStyle = (position: string) => {
  const pos = position.toUpperCase();
  if (pos.includes('QB')) return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
  if (pos.includes('WR')) return 'bg-red-500/20 text-red-400 border border-red-500/30';
  if (pos.includes('TE')) return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
  if (pos.includes('RB')) return 'bg-gray-100/10 text-gray-200 border border-gray-400/30';
  if (pos.includes('DEF') || pos.includes('D/ST') || pos.includes('DST')) return 'bg-green-500/20 text-green-400 border border-green-500/30';
  if (pos === 'SEARCH') return 'bg-brand-highlight/20 text-brand-highlight border border-brand-highlight/30';
  return 'bg-gray-900 text-gray-400 border border-gray-700';
};

const getPositionCardStyle = (position: string, isSelected: boolean) => {
  const pos = position.toUpperCase();
  if (isSelected) return 'bg-brand-highlight/20 border-brand-highlight ring-1 ring-brand-highlight/50';
  
  if (pos.includes('QB')) return 'bg-blue-900/10 border-blue-500/30';
  if (pos.includes('WR')) return 'bg-red-900/10 border-red-500/30';
  if (pos.includes('TE')) return 'bg-purple-900/10 border-purple-500/30';
  if (pos.includes('RB')) return 'bg-gray-100/5 border-gray-400/30';
  if (pos.includes('DEF') || pos.includes('D/ST') || pos.includes('DST')) return 'bg-green-900/10 border-green-500/30';
  return 'bg-gray-800 border-gray-700';
};

const RosterAnalysis: React.FC<Props> = ({ players, setPlayers }) => {
  const [loading, setLoading] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'starters' | 'bench'>('starters');
  
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerNews, setPlayerNews] = useState<{text: string, sources: any[]} | null>(null);
  const [newsLoading, setNewsLoading] = useState(false);
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  
  // Start/Sit State
  const [isPremium, setIsPremium] = useState(false); // Mock premium lock
  const [startSitLoading, setStartSitLoading] = useState(false);
  const [startSitResult, setStartSitResult] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [manualName, setManualName] = useState('');
  const [addToBench, setAddToBench] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');

  const handleUploadClick = (target: 'starters' | 'bench') => {
      setUploadTarget(target);
      fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const cleanBase64 = base64.split(',')[1];
        const extractedPlayers = await analyzeRosterImage(cleanBase64);
        
        const newPlayers = extractedPlayers.map((p: any, idx: number) => ({
          id: Date.now().toString() + idx,
          name: p.name,
          position: p.position || 'FLEX',
          team: p.team,
          isBench: uploadTarget === 'bench',
          tags: []
        }));
        
        setPlayers(prev => [...prev, ...newPlayers]);
      } catch (err) {
        console.error(err);
        alert("Failed to analyze roster image.");
      } finally {
        setLoading(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddManual = () => {
      if(!manualName) return;
      setPlayers(prev => [...prev, { 
          id: Date.now().toString(), 
          name: manualName, 
          position: 'FLEX', 
          isBench: addToBench,
          tags: [] 
      }]);
      setManualName('');
  };

  const handlePlayerClick = async (player: Player) => {
      setSelectedPlayer(player);
      setPlayerNews(null);
      setStartSitResult(null);
      setNewsLoading(true);
      setTagMenuOpen(false);
      
      try {
          const news = await getPlayerNews(player.name);
          setPlayerNews(news);
      } catch (e) {
          console.error(e);
          setPlayerNews({ text: "Could not fetch news at this time.", sources: []});
      } finally {
          setNewsLoading(false);
      }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const tempPlayer: Player = {
        id: `search-${Date.now()}`,
        name: searchQuery,
        position: 'SEARCH',
        team: 'NFL',
        tags: []
    };
    handlePlayerClick(tempPlayer);
    setSearchQuery('');
  };

  const handleAddSearchedPlayer = (asBench: boolean) => {
      if (!selectedPlayer) return;
      const newPlayer: Player = { 
          ...selectedPlayer, 
          id: Date.now().toString(),
          position: selectedPlayer.position === 'SEARCH' ? 'FLEX' : selectedPlayer.position, // Default to FLEX if unknown
          isBench: asBench,
          team: selectedPlayer.team === 'NFL' ? 'FA' : selectedPlayer.team // Default team if generic
      }; 
      setPlayers(prev => [...prev, newPlayer]);
      setSelectedPlayer(newPlayer); // Now it's a real roster player
  };

  const handleDeletePlayer = (playerId: string) => {
      // Simple confirmation to prevent accidental deletes
      if (window.confirm("Remove this player from your roster?")) {
          setPlayers(prev => prev.filter(p => p.id !== playerId));
          if (selectedPlayer?.id === playerId) {
              setSelectedPlayer(null);
          }
      }
  };

  const handleStartSitAnalysis = async (player?: Player) => {
      const target = player || selectedPlayer;
      if (!target) return;
      
      // If triggered from list via quick action, ensure we unlock/show premium state
      if (player) {
          setIsPremium(true);
      }

      setStartSitLoading(true);
      try {
          const result = await getStartSitRecommendation(target.name);
          setStartSitResult(result);
      } catch (e) {
          console.error(e);
          alert("Could not analyze matchup.");
      } finally {
          setStartSitLoading(false);
      }
  };

  const toggleTag = (player: Player, tagLabel: string) => {
    const currentTags = player.tags || [];
    let newTags;
    
    if (currentTags.includes(tagLabel)) {
        newTags = currentTags.filter(t => t !== tagLabel);
    } else {
        newTags = [...currentTags, tagLabel];
    }

    // Update local state for list
    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, tags: newTags } : p));
    
    // Update selected player state immediately so UI reflects it
    setSelectedPlayer({ ...player, tags: newTags });
  };

  // Move player between Bench and Starter
  const toggleBenchStatus = (player: Player) => {
      const newStatus = !player.isBench;
      setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isBench: newStatus } : p));
      if (selectedPlayer?.id === player.id) {
          setSelectedPlayer({...player, isBench: newStatus});
      }
  };

  // Helper to get color style for a tag label
  const getTagStyle = (label: string) => {
      for (const cat of Object.values(TAG_CATEGORIES)) {
          const found = cat.find(t => t.label === label);
          if (found) return found.color;
      }
      return "bg-gray-700 text-gray-300"; // Default
  };

  // Helper to parse the structured response
  const getParsedContent = () => {
      if (!playerNews?.text) return { news: '', stats: '' };
      
      const text = playerNews.text;
      let news = text;
      let stats = '';

      // Check for our custom separators
      if (text.includes('SECTION_STATS')) {
          const parts = text.split('SECTION_STATS');
          news = parts[0].replace('SECTION_NEWS', '').trim();
          stats = parts[1].trim();
      } else {
          news = text.replace('SECTION_NEWS', '').trim();
      }
      
      return { news, stats };
  };

  const { news, stats } = getParsedContent();

  const starters = players.filter(p => !p.isBench);
  const bench = players.filter(p => p.isBench);
  
  // Check if the selected player is actually in the roster list
  const isRosterPlayer = players.some(p => p.id === selectedPlayer?.id);

  const PlayerListItem: React.FC<{ player: Player }> = ({ player }) => (
    <div 
        onClick={() => handlePlayerClick(player)}
        className={`p-3 rounded-lg cursor-pointer transition-all border mb-2 group relative hover:opacity-100 ${getPositionCardStyle(player.position, selectedPlayer?.id === player.id)}`}
    >
        <div className="flex justify-between items-center">
            <span className="font-semibold flex items-center gap-2">
                {player.name}
                {(player.tags?.includes('Captain') || player.tags?.includes('Team Captain')) && <Award size={14} className="text-yellow-400" />}
            </span>
            <span className={`text-xs px-2 py-1 rounded font-mono font-bold ${getPositionStyle(player.position)}`}>
                {player.position}
            </span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
            {player.team && <div className="text-xs text-gray-500 mr-2">{player.team}</div>}
            {player.tags && player.tags.slice(0, 3).map(tag => (
                <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded border ${getTagStyle(tag)}`}>
                    {tag}
                </span>
            ))}
            {player.tags && player.tags.length > 3 && (
                <span className="text-[10px] text-gray-500 px-1">+{player.tags.length - 3}</span>
            )}
        </div>
        
        {/* Start/Sit Analysis Action (New) */}
        <button 
            onClick={(e) => {
                e.stopPropagation();
                // Select player to update context
                handlePlayerClick(player);
                // Trigger analysis
                handleStartSitAnalysis(player);
            }}
            className="absolute right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-brand-highlight/20 hover:text-brand-highlight rounded text-gray-500"
            title="Analyze Start/Sit"
        >
            <Activity size={14} />
        </button>

        {/* Delete Action (Top Right) */}
        <button 
            onClick={(e) => {
                e.stopPropagation();
                handleDeletePlayer(player.id);
            }}
            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 hover:text-red-400 rounded-full text-gray-500"
            title="Delete Player"
        >
            <X size={14} />
        </button>

        {/* Quick Move Action (Bottom Right) */}
        <button 
            onClick={(e) => {
                e.stopPropagation();
                toggleBenchStatus(player);
            }}
            className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-600 rounded text-gray-400"
            title={player.isBench ? "Move to Starters" : "Move to Bench"}
        >
            {player.isBench ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        </button>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Roster Management */}
      <div className="lg:col-span-1 bg-brand-card rounded-xl border border-gray-700 p-4 flex flex-col h-[600px]">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="text-brand-highlight" />
          Your Roster
        </h2>
        
        {/* Hidden File Input */}
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileUpload}
        />

        {/* Manual Add Bar */}
        <div className="flex gap-2 mb-4 border-b border-gray-700 pb-4">
            <input 
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddManual()}
                placeholder="Quick Add Player"
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-brand-highlight"
            />
            <button 
                onClick={() => setAddToBench(!addToBench)}
                className={`p-2 rounded border transition-colors ${addToBench ? 'bg-gray-600 border-gray-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-500'}`}
                title={addToBench ? "Adding to Bench" : "Adding to Starters"}
            >
                {addToBench ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
            </button>
            <button onClick={handleAddManual} className="bg-brand-highlight text-black p-2 rounded hover:bg-sky-400">
                <PlusCircle size={18} />
            </button>
        </div>

        {loading ? (
            <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
                <Loader2 className="animate-spin mb-2" />
                <p>Analyzing Roster ({uploadTarget})...</p>
            </div>
        ) : (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {/* STARTERS SECTION */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2 sticky top-0 bg-brand-card z-10 py-1">
                        <h3 className="text-xs font-bold text-brand-accent uppercase tracking-wider">Starting Lineup</h3>
                        <button 
                            onClick={() => handleUploadClick('starters')}
                            className="text-[10px] flex items-center gap-1 text-gray-400 hover:text-white bg-gray-800 px-2 py-1 rounded"
                        >
                            <Upload size={10} /> Import
                        </button>
                    </div>
                    {starters.length === 0 && (
                        <div className="p-4 border-2 border-dashed border-gray-800 rounded-lg text-center text-gray-600 text-xs mb-2">
                            No starters. Import or add manually.
                        </div>
                    )}
                    {starters.map(player => (
                        <PlayerListItem key={player.id} player={player} />
                    ))}
                </div>

                {/* BENCH SECTION */}
                <div>
                    <div className="flex items-center justify-between mb-2 sticky top-0 bg-brand-card z-10 py-1 border-t border-gray-800 pt-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bench</h3>
                        <button 
                            onClick={() => handleUploadClick('bench')}
                            className="text-[10px] flex items-center gap-1 text-gray-400 hover:text-white bg-gray-800 px-2 py-1 rounded"
                        >
                            <Upload size={10} /> Import Bench
                        </button>
                    </div>
                    {bench.length === 0 && (
                        <div className="p-4 border-2 border-dashed border-gray-800 rounded-lg text-center text-gray-600 text-xs">
                            Bench empty. Upload screenshot.
                        </div>
                    )}
                    {bench.map(player => (
                        <PlayerListItem key={player.id} player={player} />
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Player Analysis (Right Panel) */}
      <div className="lg:col-span-2 bg-brand-card rounded-xl border border-gray-700 p-6 h-[600px] flex flex-col relative overflow-hidden">
         {/* Persistent Search Bar Header */}
         <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
             <div className="flex items-center gap-2">
                 <Activity className="text-brand-highlight" size={24} />
                 <h2 className="text-xl font-bold text-white">Intel Center</h2>
             </div>
             
             <div className="flex gap-2 w-full max-w-sm">
                 <div className="relative flex-1">
                     <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                     <input 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                         placeholder="Find player to add or analyze..."
                         className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-brand-highlight outline-none text-sm"
                     />
                 </div>
                 <button 
                     onClick={handleSearch}
                     className="bg-gray-800 hover:bg-gray-700 text-brand-highlight font-bold px-4 rounded-lg transition-colors text-sm border border-gray-600"
                 >
                     Search
                 </button>
             </div>
         </div>

         {!selectedPlayer ? (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                 <Search size={48} className="mb-4 opacity-30" />
                 <p className="text-lg font-medium mb-1">Select or Search a Player</p>
                 <p className="text-sm opacity-70 mb-8">View real-time news, stats, and add to your roster.</p>
             </div>
         ) : (
             <>
                <div className="flex justify-between items-start mb-4 animate-fade-in">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-3xl font-bold text-white">{selectedPlayer.name}</h2>
                            {(selectedPlayer.tags?.includes('Captain') || selectedPlayer.tags?.includes('Team Captain')) && (
                                <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-500 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                                    <Award size={12} /> CAPTAIN
                                </div>
                            )}
                            {selectedPlayer.isBench && (
                                <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs font-bold">BENCH</span>
                            )}
                            {selectedPlayer.position === 'SEARCH' && (
                                <span className="bg-brand-highlight/20 text-brand-highlight px-2 py-0.5 rounded text-xs font-bold border border-brand-highlight/30">SEARCH RESULT</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                             <span className={`text-sm px-2 py-0.5 rounded font-mono font-bold ${getPositionStyle(selectedPlayer.position)}`}>
                                {selectedPlayer.position}
                             </span>
                             <p className="text-brand-highlight text-lg">{selectedPlayer.team && `• ${selectedPlayer.team}`}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {isRosterPlayer ? (
                            <button 
                                onClick={() => toggleBenchStatus(selectedPlayer)}
                                className="flex items-center gap-1 text-xs bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-gray-300"
                            >
                                {selectedPlayer.isBench ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                {selectedPlayer.isBench ? "Promote to Starter" : "Move to Bench"}
                            </button>
                        ) : (
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => handleAddSearchedPlayer(false)}
                                    className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-500 px-3 py-2 rounded-l text-white font-bold shadow-lg shadow-green-900/20"
                                >
                                    <ArrowUp size={14} /> Add to Lineup
                                </button>
                                <button 
                                    onClick={() => handleAddSearchedPlayer(true)}
                                    className="flex items-center gap-1 text-xs bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-r text-white font-bold border-l border-gray-700"
                                >
                                    <ArrowDown size={14} /> Bench
                                </button>
                            </div>
                        )}
                        
                        <a 
                            href={`https://www.google.com/search?q=${encodeURIComponent(selectedPlayer.name + " nfl stats news")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-gray-300"
                        >
                            <Search size={14} />
                            Web
                        </a>
                        <button onClick={() => setSelectedPlayer(null)} className="text-gray-400 hover:text-white">
                            <X />
                        </button>
                    </div>
                </div>

                {/* Tag Management Section */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2">
                            <Tag size={14} /> SCOUTING REPORT & DESIGNATIONS
                        </h3>
                        <button 
                            onClick={() => setTagMenuOpen(!tagMenuOpen)}
                            className="text-xs text-brand-highlight hover:text-white flex items-center gap-1"
                        >
                           {tagMenuOpen ? 'Close Designations' : 'Edit Designations'} <Zap size={12} />
                        </button>
                    </div>

                    {/* Active Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {!selectedPlayer.tags || selectedPlayer.tags.length === 0 ? (
                            <p className="text-xs text-gray-600 italic">No designations assigned. Tag this player to track their role.</p>
                        ) : (
                            selectedPlayer.tags.map(tag => (
                                <span key={tag} className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getTagStyle(tag)}`}>
                                    {tag}
                                    <button onClick={() => toggleTag(selectedPlayer, tag)} className="hover:text-white ml-1"><X size={12} /></button>
                                </span>
                            ))
                        )}
                    </div>

                    {/* Expandable Tag Menu */}
                    {tagMenuOpen && (
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 animate-slide-up mb-4 max-h-[200px] overflow-y-auto custom-scrollbar">
                             {Object.entries(TAG_CATEGORIES).map(([category, tags]) => (
                                 <div key={category} className="mb-3 last:mb-0">
                                     <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{category}</h4>
                                     <div className="flex flex-wrap gap-2">
                                         {tags.map(tagObj => {
                                             const isActive = selectedPlayer.tags?.includes(tagObj.label);
                                             return (
                                                <button
                                                    key={tagObj.label}
                                                    onClick={() => toggleTag(selectedPlayer, tagObj.label)}
                                                    className={`px-2 py-1 rounded text-xs border transition-all ${
                                                        isActive 
                                                        ? tagObj.color 
                                                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
                                                    }`}
                                                >
                                                    {tagObj.label}
                                                </button>
                                             )
                                         })}
                                     </div>
                                 </div>
                             ))}
                        </div>
                    )}
                </div>

                {/* --- PREMIUM START/SIT FEATURE --- */}
                <div className="mb-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 overflow-hidden relative">
                    {!isPremium ? (
                        <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4">
                             <Lock size={24} className="text-brand-highlight mb-2" />
                             <h3 className="font-bold text-white mb-1">Premium Start/Sit Intel</h3>
                             <p className="text-xs text-gray-300 mb-3">Unlock aggregated consensus from 5+ expert sources.</p>
                             <button 
                                onClick={() => setIsPremium(true)}
                                className="bg-brand-highlight hover:bg-white text-black font-bold py-1.5 px-4 rounded-full text-xs transition-colors"
                             >
                                Unlock Feature
                             </button>
                        </div>
                    ) : null}

                    <div className="p-4">
                        <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2 mb-3">
                             <Activity size={16} className={isPremium ? "text-brand-accent" : "text-gray-500"} />
                             SMART MATCHUP ANALYSIS
                        </h3>
                        
                        {!startSitResult ? (
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                    Analyze matchup difficulty and aggregate expert consensus for Week 1 (Simulated).
                                </p>
                                <button 
                                    onClick={() => handleStartSitAnalysis()}
                                    disabled={!isPremium || startSitLoading}
                                    className="bg-brand-card hover:bg-gray-700 border border-gray-600 text-white text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0"
                                >
                                    {startSitLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                                    Analyze Matchup
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                                        startSitResult.data.recommendation === 'START' ? 'bg-green-500 text-black' :
                                        startSitResult.data.recommendation === 'SIT' ? 'bg-red-500 text-white' :
                                        'bg-yellow-500 text-black'
                                    }`}>
                                        {startSitResult.data.recommendation === 'START' ? <ThumbsUp size={24} fill="currentColor" /> :
                                         startSitResult.data.recommendation === 'SIT' ? <ThumbsDown size={24} fill="currentColor" /> :
                                         <AlertTriangle size={24} fill="currentColor" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className={`text-xl font-black tracking-tight ${
                                                startSitResult.data.recommendation === 'START' ? 'text-green-400' :
                                                startSitResult.data.recommendation === 'SIT' ? 'text-red-400' :
                                                'text-yellow-400'
                                            }`}>
                                                {startSitResult.data.recommendation}
                                            </h4>
                                            <span className="text-xs font-mono text-gray-500">{startSitResult.data.confidence}% CONFIDENCE</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-700 rounded-full mt-1 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${
                                                    startSitResult.data.recommendation === 'START' ? 'bg-green-500' :
                                                    startSitResult.data.recommendation === 'SIT' ? 'bg-red-500' :
                                                    'bg-yellow-500'
                                                }`} 
                                                style={{ width: `${startSitResult.data.confidence}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-200 leading-relaxed bg-black/20 p-3 rounded border border-white/5">
                                    {startSitResult.data.analysis}
                                </p>
                                {startSitResult.sources?.length > 0 && (
                                     <div className="flex gap-2 mt-2">
                                         <span className="text-[10px] text-gray-500 uppercase">Sources:</span>
                                         {startSitResult.sources.slice(0,2).map((s:any, i:number) => (
                                             <a key={i} href={s.uri} target="_blank" className="text-[10px] text-brand-highlight hover:underline truncate max-w-[100px]">{s.title}</a>
                                         ))}
                                     </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {newsLoading ? (
                    <div className="flex-1 flex items-center justify-center flex-col">
                         <Loader2 className="animate-spin text-brand-accent mb-4" size={32} />
                         <p className="text-brand-accent animate-pulse">Scouring the web for latest news & stats...</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                        {/* Latest News Section */}
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <h3 className="text-lg font-semibold text-brand-accent mb-2 flex items-center gap-2">
                                <TrendingUp size={18} />
                                Latest Intel
                            </h3>
                            <p className="whitespace-pre-wrap text-gray-200 leading-relaxed text-sm">
                                {news || "No recent news found."}
                            </p>
                        </div>
                        
                        {/* Key Stats Section */}
                        <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                            <h3 className="text-lg font-semibold text-brand-highlight mb-3 flex items-center gap-2">
                                <Activity size={18} />
                                Season Stats
                            </h3>
                            {stats ? (
                                <div className="whitespace-pre-wrap text-gray-200 leading-relaxed text-sm font-mono bg-gray-900/50 p-3 rounded border border-gray-700/50">
                                    {stats}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-gray-400 italic text-sm p-2">
                                    <span>Stats not available directly.</span>
                                    <a 
                                        href={`https://www.google.com/search?q=${encodeURIComponent(selectedPlayer.name + " 2024 stats")}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1 text-brand-highlight hover:underline not-italic"
                                    >
                                        Search Stats <ExternalLink size={12} />
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Sources Footer */}
                        {playerNews?.sources && playerNews.sources.length > 0 && (
                            <div className="pt-4 border-t border-gray-800">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sources</h4>
                                <div className="flex flex-wrap gap-2">
                                    {playerNews.sources.map((source, idx) => (
                                        <a 
                                            key={idx}
                                            href={source.uri} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded border border-gray-700 hover:border-brand-highlight text-xs text-gray-400 hover:text-brand-highlight transition-colors max-w-[200px] truncate"
                                        >
                                            <ExternalLink size={10} />
                                            <span className="truncate">{source.title}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
             </>
         )}
      </div>
    </div>
  );
};

export default RosterAnalysis;
