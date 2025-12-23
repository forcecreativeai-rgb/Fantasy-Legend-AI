
import React, { useState, useEffect, useRef } from 'react';
import { getMockDraftRankings } from '../services/gemini';
import { Loader2, ListOrdered, Play, CheckCircle2, User, Cpu, AlertCircle, RefreshCw, Trophy, Filter } from 'lucide-react';

const DraftRedo: React.FC = () => {
  const [stage, setStage] = useState<'SETTINGS' | 'LOADING' | 'DRAFTING' | 'SUMMARY'>('SETTINGS');
  const [numTeams, setNumTeams] = useState(12);
  const [scoring, setScoring] = useState('PPR');
  const [userSlot, setUserSlot] = useState(1);
  
  // Draft Data
  const [pool, setPool] = useState<any[]>([]);
  const [currentPick, setCurrentPick] = useState(1);
  const [myTeam, setMyTeam] = useState<any[]>([]);
  const [draftHistory, setDraftHistory] = useState<any[]>([]);
  
  // Filtering
  const [viewPosition, setViewPosition] = useState('ALL');
  
  const totalRounds = 14; 
  const totalPicks = numTeams * totalRounds;

  const rosterConfig = [
      { slot: 'QB', count: 1 },
      { slot: 'RB', count: 2 },
      { slot: 'WR', count: 3 },
      { slot: 'TE', count: 1 },
      { slot: 'FLEX', count: 1 },
      { slot: 'BENCH', count: 6 }
  ];

  const positionFilters = ['ALL', 'QB', 'RB', 'WR', 'TE', 'FLEX', 'DST', 'K'];

  // Refined Tier Colors: Using distinct variants for clear drops
  const TIER_BG_COLORS = [
      'bg-blue-900/10 border-blue-500/20',     // Tier 1
      'bg-purple-900/10 border-purple-500/20', // Tier 2
      'bg-green-900/10 border-green-500/20',   // Tier 3
      'bg-yellow-900/10 border-yellow-500/20', // Tier 4
      'bg-red-900/10 border-red-500/20',       // Tier 5
      'bg-gray-800/20 border-gray-700/50',     // Deep Sleeper Tier
  ];

  const startDraft = async () => {
      setStage('LOADING');
      try {
          const players = await getMockDraftRankings(scoring);
          setPool(players);
          setStage('DRAFTING');
          setCurrentPick(1);
          setMyTeam([]);
          setDraftHistory([]);
      } catch (e) {
          console.error(e);
          alert("Failed to load rankings.");
          setStage('SETTINGS');
      }
  };

  const getCurrentDrafter = () => {
      const round = Math.ceil(currentPick / numTeams);
      const isEvenRound = round % 2 === 0;
      const indexInRound = (currentPick - 1) % numTeams;
      const drafterSlot = isEvenRound ? numTeams - indexInRound : indexInRound + 1;
      return { slot: drafterSlot, isUser: drafterSlot === userSlot };
  };

  const drafter = getCurrentDrafter();

  useEffect(() => {
      if (stage === 'DRAFTING' && !drafter.isUser && currentPick <= totalPicks) {
          const timer = setTimeout(() => {
              handleCpuPick();
          }, 600);
          return () => clearTimeout(timer);
      }
      if (currentPick > totalPicks) {
          setStage('SUMMARY');
      }
  }, [stage, currentPick, drafter.isUser]);

  const footballCursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='orange' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'/><path d='M12 4a9.7 9.7 0 0 0-4.8 2.2 9.7 9.7 0 0 0-2.2 4.8 3 3 0 0 0 0 1 3 3 0 0 0 0 1 9.7 9.7 0 0 0 2.2 4.8 9.7 9.7 0 0 0 4.8 2.2 3 3 0 0 0 1 0 3 3 0 0 0 1 0 9.7 9.7 0 0 0 4.8-2.2 9.7 9.7 0 0 0 2.2-4.8 3 3 0 0 0 0-1 3 3 0 0 0 0-1 9.7 9.7 0 0 0-2.2-4.8 9.7 9.7 0 0 0-4.8-2.2 3 3 0 0 0-1 0 3 3 0 0 0-1 0Z'/><path d='M2 12h20'/><path d='m4.9 4.9 14.2 14.2'/><path d='m19.1 4.9-14.2 14.2'/></svg>") 12 12, auto`;

  const handleCpuPick = () => {
      if (pool.length === 0) return;
      const pick = pool[0];
      const newPool = pool.slice(1);
      setPool(newPool);
      setDraftHistory(prev => [{ pick: currentPick, ...pick, drafter: drafter.slot }, ...prev]);
      setCurrentPick(prev => prev + 1);
  };

  const handleUserPick = (player: any) => {
      if (!drafter.isUser) return;
      setMyTeam(prev => [...prev, player]);
      const newPool = pool.filter(p => p.name !== player.name);
      setPool(newPool);
      setDraftHistory(prev => [{ pick: currentPick, ...player, drafter: 'ME' }, ...prev]);
      setCurrentPick(prev => prev + 1);
  };

  const organizedRoster = (() => {
      const remaining = [...myTeam];
      const organized: any = {};
      const fillSlot = (slot: string, count: number) => {
          organized[slot] = [];
          for (let i = 0; i < count; i++) {
              const matchIdx = remaining.findIndex(p => {
                  if (slot === 'FLEX') return ['RB', 'WR', 'TE'].includes(p.position);
                  if (slot === 'BENCH') return true;
                  return p.position === slot;
              });
              if (matchIdx !== -1) {
                  organized[slot].push(remaining[matchIdx]);
                  remaining.splice(matchIdx, 1);
              } else {
                  organized[slot].push(null);
              }
          }
      };
      rosterConfig.forEach(cfg => { if (cfg.slot !== 'BENCH') fillSlot(cfg.slot, cfg.count); });
      fillSlot('BENCH', 6);
      return organized;
  })();

  const filteredPool = pool.filter(p => {
      if (viewPosition === 'ALL') return true;
      if (viewPosition === 'FLEX') return ['RB', 'WR', 'TE'].includes(p.position);
      return p.position === viewPosition;
  });

  const getSlotPositionColor = (slot: string, player?: any) => {
    const pos = player?.position.toUpperCase() || slot.toUpperCase();
    if (pos.includes('QB')) return 'border-blue-500/40 bg-blue-500/5';
    if (pos.includes('WR')) return 'border-red-500/40 bg-red-500/5';
    if (pos.includes('TE')) return 'border-purple-500/40 bg-purple-500/5';
    if (pos.includes('RB')) return 'border-gray-400/40 bg-gray-100/5';
    if (pos.includes('DEF') || pos.includes('D/ST') || pos.includes('DST')) return 'border-green-500/40 bg-green-500/5';
    if (pos.includes('K')) return 'border-yellow-500/40 bg-yellow-500/5';
    return 'border-gray-700/50 bg-gray-800/50';
  };

  const getBadgePositionColor = (slot: string, player?: any) => {
    const pos = player?.position.toUpperCase() || slot.toUpperCase();
    if (pos.includes('QB')) return 'bg-blue-900 text-blue-400 border-blue-700';
    if (pos.includes('WR')) return 'bg-red-900 text-red-400 border-red-700';
    if (pos.includes('TE')) return 'bg-purple-900 text-purple-400 border-purple-700';
    if (pos.includes('RB')) return 'bg-gray-700 text-gray-100 border-gray-500';
    if (pos.includes('DEF') || pos.includes('D/ST') || pos.includes('DST')) return 'bg-green-900 text-green-400 border-green-700';
    if (pos.includes('K')) return 'bg-yellow-900 text-yellow-400 border-yellow-700';
    return 'bg-gray-900 text-gray-500 border-gray-800';
  };

  if (stage === 'SETTINGS') {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-brand-card rounded-xl border border-gray-700 p-10 animate-fade-in">
              <div className="bg-brand-highlight/20 p-6 rounded-full mb-6">
                  <ListOrdered size={48} className="text-brand-highlight" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Draft Redo</h2>
              <p className="text-gray-400 mb-8 max-w-md text-center">
                  Test your drafting prowess against AI opponents using the latest <span className="text-brand-highlight font-bold">ROS Rankings</span>.
              </p>
              <div className="w-full max-sm space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Scoring</label>
                      <div className="grid grid-cols-2 gap-2">
                          {['Half PPR', 'PPR'].map(s => (
                              <button key={s} onClick={() => setScoring(s)} className={`p-3 rounded-lg text-sm font-bold border transition-all ${scoring === s ? 'bg-brand-accent text-brand-contrast border-brand-accent' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                                  {s}
                              </button>
                          ))}
                      </div>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Your Draft Slot</label>
                      <select value={userSlot} onChange={(e) => setUserSlot(parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none">
                          {Array.from({length: numTeams}, (_, i) => i + 1).map(n => (
                              <option key={n} value={n}>Pick {n}</option>
                          ))}
                      </select>
                  </div>
                  <button onClick={startDraft} className="w-full bg-brand-highlight text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-colors">
                      <Play size={20} /> Start Draft
                  </button>
              </div>
          </div>
      )
  }

  if (stage === 'LOADING') {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-brand-card rounded-xl border border-gray-700 p-10">
              <Loader2 size={48} className="text-brand-highlight animate-spin mb-4" />
              <h3 className="text-xl font-bold text-white">Loading Draft Rankings...</h3>
              <p className="text-gray-400 text-sm mt-2">Simulating Expert Draft Gaps: CMC, Chase, JJ, Gibbs...</p>
          </div>
      )
  }

  // Tier Calculation Helper
  let currentTierIdx = 0;
  let lastValue = 100;

  return (
    <div className="h-full flex flex-col gap-6 relative" style={{ cursor: drafter.isUser ? 'default' : footballCursor }}>
        {!drafter.isUser && (
            <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
                <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full text-brand-highlight font-bold border border-brand-highlight/30 animate-pulse">
                    AI Drafting Round {Math.ceil(currentPick / numTeams)}...
                </div>
            </div>
        )}

        <div className="bg-brand-card rounded-xl border border-gray-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase font-bold">Round</div>
                    <div className="text-2xl font-black text-white">{Math.ceil(currentPick / numTeams)}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase font-bold">Pick</div>
                    <div className="text-2xl font-black text-brand-highlight">{currentPick}</div>
                </div>
                <div className="h-8 w-px bg-gray-700 mx-2"></div>
                <div>
                    <div className="text-xs text-gray-500 uppercase font-bold">On The Clock</div>
                    <div className={`text-xl font-bold flex items-center gap-2 ${drafter.isUser ? 'text-green-400 animate-pulse' : 'text-white'}`}>
                        {drafter.isUser ? <User size={20} /> : <Cpu size={20} />}
                        {drafter.isUser ? "YOU" : `Team ${drafter.slot}`}
                    </div>
                </div>
            </div>
            
            <div className="flex-1 ml-8 flex items-center justify-end gap-2 overflow-hidden">
                {draftHistory.slice(0, 3).map((h, i) => (
                    <div key={i} className="bg-gray-800 px-3 py-1 rounded border border-gray-600 flex items-center gap-2 text-xs whitespace-nowrap opacity-70">
                         <span className="text-gray-500 font-bold">{h.pick}.</span>
                         <span className="text-white font-semibold">{h.name}</span>
                         <span className="text-gray-400">({h.position})</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">
            <div className="w-2/3 bg-brand-card rounded-xl border border-gray-700 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <h3 className="font-bold text-gray-300 flex items-center gap-2">
                                <ListOrdered size={18} /> Best Available
                            </h3>
                            <span className="text-[10px] text-green-400 font-bold uppercase tracking-wide bg-green-900/20 px-2 py-0.5 rounded w-fit mt-1">
                                Color-Coded Tiers Based on Market Value
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {positionFilters.map(pos => (
                            <button key={pos} onClick={() => setViewPosition(pos)} className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all ${viewPosition === pos ? 'bg-brand-highlight text-black border-brand-highlight' : 'bg-gray-700 text-gray-400 border-gray-600 hover:text-white'}`}>
                                {pos}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[10px] text-gray-500 uppercase bg-gray-900/80 sticky top-0 z-10">
                            <tr>
                                <th className="p-3">Rank</th>
                                <th className="p-3">Player</th>
                                <th className="p-3">Pos</th>
                                <th className="p-3">Team</th>
                                <th className="p-3">Proj Round</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {filteredPool.map((player) => {
                                // Tier Check Logic
                                if (lastValue - player.value >= 4) {
                                    currentTierIdx = Math.min(currentTierIdx + 1, TIER_BG_COLORS.length - 1);
                                }
                                lastValue = player.value;
                                
                                return (
                                    <tr key={player.rank} className={`group border-l-4 transition-all ${drafter.isUser ? 'cursor-pointer hover:bg-white/5' : ''} ${TIER_BG_COLORS[currentTierIdx]}`}>
                                        <td className="p-3 font-mono text-gray-400 text-sm">#{player.rank}</td>
                                        <td className="p-3">
                                            <div className="font-bold text-white text-sm">{player.name}</div>
                                            <div className="text-[10px] text-gray-500 italic">Tier {currentTierIdx + 1} Candidate</div>
                                        </td>
                                        <td className="p-3">
                                            <span className={`text-[10px] px-2 py-1 rounded font-bold ${player.position === 'RB' ? 'bg-gray-700 text-gray-100' : player.position === 'QB' ? 'bg-blue-900 text-blue-400' : player.position === 'WR' ? 'bg-red-900 text-red-400' : 'bg-purple-900 text-purple-400'}`}>
                                                {player.position}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-500 text-xs">{player.team}</td>
                                        <td className="p-3 text-[10px] font-mono font-bold text-gray-400">
                                            Rnd {player.projectedRound}.{player.projectedPick < 10 ? `0${player.projectedPick}` : player.projectedPick}
                                        </td>
                                        <td className="p-3 text-right">
                                            <button onClick={() => handleUserPick(player)} disabled={!drafter.isUser} className="bg-brand-highlight text-black text-[10px] font-bold px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity hover:bg-white">
                                                DRAFT
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="w-1/3 bg-brand-card rounded-xl border border-gray-700 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Trophy size={18} className="text-brand-accent" /> Draft Log
                    </h3>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">{myTeam.length} / {totalRounds}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
                    {rosterConfig.map((cfg) => {
                         const slots = organizedRoster[cfg.slot];
                         if (!slots) return null;
                         return slots.map((player: any, idx: number) => (
                             <div key={`${cfg.slot}-${idx}`} className={`flex items-center gap-3 p-2 rounded border transition-all ${getSlotPositionColor(cfg.slot, player)}`}>
                                 <div className={`w-12 text-[10px] font-bold text-center py-1 rounded uppercase tracking-tighter border ${getBadgePositionColor(cfg.slot, player)}`}>
                                     {cfg.slot}
                                 </div>
                                 {player ? (
                                     <div className="flex-1">
                                         <div className="font-bold text-sm text-white truncate max-w-[120px]">{player.name}</div>
                                         <div className="text-[10px] text-gray-400">Picked at {draftHistory.find(h => h.name === player.name)?.pick}</div>
                                     </div>
                                 ) : (
                                     <div className="flex-1 text-[10px] text-gray-700 italic">Open Slot</div>
                                 )}
                             </div>
                         ));
                    })}
                </div>
            </div>
        </div>

        {stage === 'SUMMARY' && (
             <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                 <div className="bg-brand-card border border-gray-700 p-8 rounded-xl max-w-lg w-full text-center shadow-2xl">
                     <Trophy size={64} className="text-yellow-400 mx-auto mb-4" />
                     <h2 className="text-3xl font-bold text-white mb-2 italic">Draft Redo Complete</h2>
                     <p className="text-gray-400 mb-8">Roster archived. Analyze your results in Draft Grade or start over to test new strategies.</p>
                     <button onClick={() => setStage('SETTINGS')} className="bg-brand-highlight text-black font-bold py-3 px-8 rounded-full hover:bg-white transition-colors flex items-center gap-2 mx-auto">
                         <RefreshCw size={20} /> Reset Draft
                     </button>
                 </div>
             </div>
        )}
    </div>
  );
};

export default DraftRedo;
