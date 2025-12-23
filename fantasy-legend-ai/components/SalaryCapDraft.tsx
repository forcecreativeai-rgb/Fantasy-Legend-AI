
import React, { useState, useEffect } from 'react';
import { getMockDraftRankings } from '../services/gemini';
import { Loader2, DollarSign, Wallet, Trash2, Search, Filter, Info, PlusCircle, UserPlus, Zap, Trophy, TrendingDown, Shield, ListOrdered, RefreshCw } from 'lucide-react';

interface CapPlayer {
    id: string;
    rank: number;
    name: string;
    team: string;
    position: string;
    price: number;
    value: number;
    projectedRound: number;
    projectedPick: number;
}

interface Slot {
    id: string;
    type: string;
    player: CapPlayer | null;
}

const SalaryCapDraft: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [playerPool, setPlayerPool] = useState<CapPlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [scoring, setScoring] = useState('PPR');
  
  const [budget, setBudget] = useState(198);
  
  // Aligning roster slots to Draft Redo's standard: 14 total rounds
  const initialRoster: Slot[] = [
      { id: 'qb-1', type: 'QB', player: null },
      { id: 'rb-1', type: 'RB', player: null },
      { id: 'rb-2', type: 'RB', player: null },
      { id: 'wr-1', type: 'WR', player: null },
      { id: 'wr-2', type: 'WR', player: null },
      { id: 'wr-3', type: 'WR', player: null },
      { id: 'te-1', type: 'TE', player: null },
      { id: 'flex-1', type: 'FLEX', player: null },
      { id: 'bench-1', type: 'BENCH', player: null },
      { id: 'bench-2', type: 'BENCH', player: null },
      { id: 'bench-3', type: 'BENCH', player: null },
      { id: 'bench-4', type: 'BENCH', player: null },
      { id: 'bench-5', type: 'BENCH', player: null },
      { id: 'bench-6', type: 'BENCH', player: null },
  ];

  const [roster, setRoster] = useState<Slot[]>(initialRoster);

  const loadData = async () => {
    setLoading(true);
    try {
      const players = await getMockDraftRankings(scoring);
      setPlayerPool(players as CapPlayer[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [scoring]);

  const totalSpent = roster.reduce((acc, slot) => acc + (slot.player?.price || 0), 0);
  const remaining = budget - totalSpent;
  
  const emptySlotsCount = roster.filter(s => s.player === null).length;
  const avgPerSlot = emptySlotsCount > 0 
    ? Math.floor(remaining / emptySlotsCount) 
    : 0;

  const handleAddPlayer = (player: CapPlayer) => {
    if (remaining < player.price) {
        alert("Insufficient Budget!");
        return;
    }

    const updatedRoster = [...roster];
    
    // 1. Try to find an exact position match
    let slotIndex = updatedRoster.findIndex(s => s.type === player.position && !s.player);
    
    // 2. Try to find a FLEX match
    if (slotIndex === -1 && ['RB', 'WR', 'TE'].includes(player.position)) {
        slotIndex = updatedRoster.findIndex(s => s.type === 'FLEX' && !s.player);
    }

    // 3. Try to find a BENCH match
    if (slotIndex === -1) {
        slotIndex = updatedRoster.findIndex(s => s.type === 'BENCH' && !s.player);
    }

    if (slotIndex !== -1) {
        updatedRoster[slotIndex].player = player;
        setRoster(updatedRoster);
    } else {
        alert("No available slots for this player!");
    }
  };

  const handleRemovePlayer = (slotId: string) => {
    setRoster(prev => prev.map(s => s.id === slotId ? { ...s, player: null } : s));
  };

  const filteredPool = playerPool.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPos = activeFilter === 'ALL' || 
                      (activeFilter === 'FLEX' && ['RB', 'WR', 'TE'].includes(p.position)) ||
                      p.position === activeFilter;
    const notOnTeam = !roster.some(s => s.player?.id === p.id);
    return matchesSearch && matchesPos && notOnTeam;
  });

  const getPriceColor = (price: number) => {
    if (price >= 60) return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
    if (price >= 40) return 'text-purple-400 border-purple-500/50 bg-purple-500/10';
    if (price >= 20) return 'text-blue-400 border-blue-500/50 bg-blue-500/10';
    return 'text-gray-400 border-gray-700 bg-gray-800/50';
  };

  const getSlotPositionColor = (type: string, hasPlayer: boolean) => {
      const pos = type.toUpperCase();
      if (pos.includes('QB')) return hasPlayer ? 'border-blue-500/40 bg-blue-500/5' : 'border-blue-500/10';
      if (pos.includes('WR')) return hasPlayer ? 'border-red-500/40 bg-red-500/5' : 'border-red-500/10';
      if (pos.includes('TE')) return hasPlayer ? 'border-purple-500/40 bg-purple-500/5' : 'border-purple-500/10';
      if (pos.includes('RB')) return hasPlayer ? 'border-gray-400/40 bg-gray-100/5' : 'border-gray-400/10';
      if (pos.includes('DEF') || pos.includes('DST')) return hasPlayer ? 'border-green-500/40 bg-green-500/5' : 'border-green-500/10';
      if (pos.includes('K')) return hasPlayer ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-yellow-500/10';
      return 'border-gray-800 bg-transparent';
  };

  const getBadgePositionColor = (type: string, player?: CapPlayer | null) => {
      const pos = player?.position.toUpperCase() || type.toUpperCase();
      if (pos.includes('QB')) return 'bg-blue-900 text-blue-400 border-blue-700';
      if (pos.includes('WR')) return 'bg-red-900 text-red-400 border-red-700';
      if (pos.includes('TE')) return 'bg-purple-900 text-purple-400 border-purple-700';
      if (pos.includes('RB')) return 'bg-gray-700 text-gray-100 border-gray-500';
      if (pos.includes('DEF') || pos.includes('DST')) return 'bg-green-900 text-green-400 border-green-700';
      if (pos.includes('K')) return 'bg-yellow-900 text-yellow-400 border-yellow-700';
      return 'bg-gray-900/50 text-gray-500 border-gray-800';
  };

  // Refined Tier Colors logic matches DraftRedo
  const TIER_BG_COLORS = [
      'bg-blue-900/10 border-blue-500/20',     // Tier 1
      'bg-purple-900/10 border-purple-500/20', // Tier 2
      'bg-green-900/10 border-green-500/20',   // Tier 3
      'bg-yellow-900/10 border-yellow-500/20', // Tier 4
      'bg-red-900/10 border-red-500/20',       // Tier 5
      'bg-gray-800/20 border-gray-700/50',     // Deep Sleeper Tier
  ];

  const RosterSlot: React.FC<{ slot: Slot }> = ({ slot }) => {
    const { player, type, id } = slot;
    return (
        <div className={`relative h-16 rounded-xl border-2 transition-all overflow-hidden flex items-center p-2.5 ${player ? 'shadow-md scale-[1.01]' : 'border-dashed'} ${getSlotPositionColor(type, !!player)}`}>
            <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold tracking-tighter shrink-0 border ${getBadgePositionColor(type, player)}`}>
                {type}
            </div>
            <div className="flex-1 ml-3 overflow-hidden">
                {player ? (
                    <div className="animate-fade-in">
                        <div className="font-black text-white truncate text-base uppercase leading-none">{player.name}</div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-2 mt-1">
                            <span>{player.team}</span>
                            <span>•</span>
                            <span className="text-brand-highlight font-bold">${player.price}</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 italic">
                        <PlusCircle size={10} className="opacity-20" /> {type} EMPTY
                    </div>
                )}
            </div>
            {player && (
                <button onClick={() => handleRemovePlayer(id)} className="p-2 hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors rounded-lg">
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    );
  };

  let currentTierIdx = 0;
  let lastVal = 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[800px] overflow-hidden">
        <div className="lg:col-span-5 bg-brand-card rounded-xl border border-gray-700 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-700 bg-gray-900/50 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <DollarSign size={20} className="text-brand-highlight" />
                        Salary Auction Block
                    </h3>
                    <div className="flex bg-gray-800 rounded-lg p-0.5 border border-gray-700">
                        {['Half PPR', 'PPR'].map(s => (
                            <button
                                key={s}
                                onClick={() => setScoring(s)}
                                className={`px-2 py-1 rounded-md text-[10px] font-black transition-all ${scoring === s ? 'bg-brand-accent text-brand-contrast' : 'text-gray-500 hover:text-white'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search fantasy talent..." className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm text-brand-text focus:ring-2 focus:ring-brand-highlight outline-none" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {['ALL', 'QB', 'RB', 'WR', 'TE', 'FLEX'].map(pos => (
                        <button key={pos} onClick={() => setActiveFilter(pos)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border uppercase tracking-tighter ${activeFilter === pos ? 'bg-brand-highlight text-black border-brand-highlight' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'}`}>{pos}</button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
                {filteredPool.map(player => {
                    if (lastVal - player.value >= 4) {
                        currentTierIdx = Math.min(currentTierIdx + 1, TIER_BG_COLORS.length - 1);
                    }
                    lastVal = player.value;

                    return (
                        <div key={player.id} onClick={() => handleAddPlayer(player)} className={`flex items-center justify-between p-3 rounded-xl border-l-4 group cursor-pointer transition-all ${TIER_BG_COLORS[currentTierIdx]}`}>
                            <div className="flex items-center gap-3">
                                <div className="text-[10px] font-mono text-gray-500 w-6">#{player.rank}</div>
                                <div>
                                    <div className="font-bold text-brand-text group-hover:text-brand-highlight transition-colors flex items-center gap-2">
                                        {player.name}
                                        <span className="text-[9px] font-mono text-gray-500 px-1.5 py-0.5 bg-black/40 rounded border border-white/5">
                                            Rnd {player.projectedRound}.{player.projectedPick < 10 ? `0${player.projectedPick}` : player.projectedPick}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-tight">{player.team} • {player.position} • Tier {currentTierIdx + 1}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`px-3 py-1 rounded-lg border font-mono font-black text-xs ${getPriceColor(player.price)}`}>
                                    ${player.price}
                                </div>
                                <UserPlus size={16} className="text-gray-600 group-hover:text-brand-highlight opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6 overflow-hidden">
            <div className="bg-brand-card rounded-xl border border-gray-700 p-6 flex items-center justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-highlight/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-gray-800 flex items-center justify-center">
                            <Wallet size={32} className={remaining < 15 ? 'text-red-500' : 'text-brand-highlight'} />
                            <div className="absolute inset-0 rounded-full border-4 border-brand-highlight border-t-transparent animate-spin-slow opacity-20"></div>
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Mock Budget Remaining</div>
                        <div className={`text-6xl font-black italic tracking-tighter ${remaining < 15 ? 'text-red-500' : 'text-brand-text'}`}>
                            ${remaining}
                        </div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Starting Fund: $198 (Standard)</div>
                    </div>
                </div>
                <div className="text-right space-y-1">
                    <div className="flex items-center gap-2 justify-end text-xs uppercase font-black">
                        <span className="text-gray-500">Cap Spent:</span>
                        <span className="text-brand-text">${totalSpent}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end text-xs uppercase font-black">
                        <span className="text-gray-500">Max Avg/Slot:</span>
                        <span className="text-brand-highlight">${avgPerSlot}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end pt-2">
                        <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${remaining > 40 ? 'bg-green-500' : remaining > 15 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Cap Status</span>
                    </div>
                </div>
            </div>

            <div className="bg-brand-card rounded-xl border border-gray-700 flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 mb-2 flex items-center gap-2">
                            <Trophy size={12} className="text-brand-highlight" /> Starting Lineup
                        </h4>
                        {roster.slice(0, 8).map(slot => (
                            <RosterSlot key={slot.id} slot={slot} />
                        ))}
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 mb-2 flex items-center gap-2">
                            <TrendingDown size={12} className="text-brand-accent" /> Draft Depth
                        </h4>
                        {roster.slice(8).map(slot => (
                            <RosterSlot key={slot.id} slot={slot} />
                        ))}
                    </div>
                </div>
                
                <div className="mt-8 p-5 bg-gray-900/50 rounded-xl border border-gray-700 flex items-center justify-between shadow-inner">
                    <div className="flex items-center gap-4">
                        <div className="bg-brand-highlight/20 p-2.5 rounded-xl border border-brand-highlight/30">
                            <Zap size={24} className="text-brand-highlight" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Strategy Pulse</div>
                            <div className="text-sm font-black text-brand-text uppercase italic tracking-tighter">
                                {totalSpent === 0 ? "Identify high-value sleepers..." : 
                                 avgPerSlot > 22 ? "Elite Star Heavy Strategy" : 
                                 remaining < 10 ? "Depth Saturated Build" : "Balanced Value Approach"}
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => { 
                            setRoster(initialRoster);
                            setBudget(198);
                        }} 
                        className="text-[10px] text-gray-500 hover:text-white flex items-center gap-2 uppercase font-black transition-colors bg-gray-800 px-4 py-2 rounded-lg border border-gray-700"
                    >
                        <RefreshCw size={12} /> Reset Auction
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SalaryCapDraft;
