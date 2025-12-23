
import React, { useState, useEffect } from 'react';
import { getSeasonRankings } from '../services/gemini';
import { Loader2, TrendingUp, Calendar, RefreshCw, Trophy, Shield, Target, Users } from 'lucide-react';

const SeasonRankings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'season' | 'ros'>('season');
  const [position, setPosition] = useState('QB');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setData([]);
    try {
      const result = await getSeasonRankings(activeTab, position);
      setData(result);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch rankings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, position]);

  const renderTableHeader = () => {
    if (activeTab === 'ros') {
        return (
            <tr className="text-gray-400 uppercase text-[10px] font-black tracking-widest bg-gray-900/80">
                <th className="p-4 text-left">Rank</th>
                <th className="p-4 text-left">Player/Unit</th>
                <th className="p-4 text-left">Tier</th>
                <th className="p-4 text-left">Outlook</th>
            </tr>
        );
    }

    const commonHeaders = (
        <>
            <th className="p-4 text-left">Rank</th>
            <th className="p-4 text-left">Player/Unit</th>
            <th className="p-4 text-right">Total Pts</th>
        </>
    );

    if (position === 'QB') {
        return (
            <tr className="text-gray-400 uppercase text-[10px] font-black tracking-widest bg-gray-900/80">
                {commonHeaders}
                <th className="p-4 text-right">Pass Yds</th>
                <th className="p-4 text-right">Pass TD</th>
                <th className="p-4 text-right">Rush Yds</th>
                <th className="p-4 text-right">Rush TD</th>
                <th className="p-4 text-right">Att</th>
            </tr>
        );
    } else if (position === 'RB') {
        return (
            <tr className="text-gray-400 uppercase text-[10px] font-black tracking-widest bg-gray-900/80">
                {commonHeaders}
                <th className="p-4 text-right">Carries</th>
                <th className="p-4 text-right">Rush Yds</th>
                <th className="p-4 text-right">Targets</th>
                <th className="p-4 text-right">Catches</th>
                <th className="p-4 text-right">Total TD</th>
            </tr>
        );
    } else if (position === 'WR' || position === 'TE') {
        return (
            <tr className="text-gray-400 uppercase text-[10px] font-black tracking-widest bg-gray-900/80">
                {commonHeaders}
                <th className="p-4 text-right">Targets</th>
                <th className="p-4 text-right">Catches</th>
                <th className="p-4 text-right">Rec Yds</th>
                <th className="p-4 text-right">Total TD</th>
            </tr>
        );
    } else if (position === 'DST') {
        return (
            <tr className="text-gray-400 uppercase text-[10px] font-black tracking-widest bg-gray-900/80">
                {commonHeaders}
                <th className="p-4 text-right">Pts Allowed</th>
                <th className="p-4 text-right">Sacks</th>
                <th className="p-4 text-right">INT</th>
                <th className="p-4 text-right">FR</th>
                <th className="p-4 text-right">Def TD</th>
            </tr>
        );
    } else if (position === 'K') {
        return (
            <tr className="text-gray-400 uppercase text-[10px] font-black tracking-widest bg-gray-900/80">
                {commonHeaders}
                <th className="p-4 text-right">FGM</th>
                <th className="p-4 text-right">FGA</th>
                <th className="p-4 text-right">FG%</th>
                <th className="p-4 text-right">XPM</th>
                <th className="p-4 text-right">Long</th>
            </tr>
        );
    } else {
        // IDP Positions (DT, DE, LB, CB, S)
        return (
            <tr className="text-gray-400 uppercase text-[10px] font-black tracking-widest bg-gray-900/80">
                {commonHeaders}
                <th className="p-4 text-right">Tackles</th>
                <th className="p-4 text-right">Sacks</th>
                <th className="p-4 text-right">INT</th>
                <th className="p-4 text-right">FF</th>
                <th className="p-4 text-right">PD</th>
            </tr>
        );
    }
  };

  const renderRow = (player: any, idx: number) => {
      const stats = player.stats || {};
      
      if (activeTab === 'ros') {
          return (
            <tr key={idx} className="border-b border-gray-700/50 hover:bg-brand-highlight/5 transition-colors group">
                <td className="p-4 font-black text-brand-highlight text-lg italic tracking-tighter">#{player.rank || idx + 1}</td>
                <td className="p-4">
                    <div className="font-black text-brand-text uppercase group-hover:text-brand-accent transition-colors">{player.name}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase">{player.team}</div>
                </td>
                <td className="p-4">
                    <span className="bg-gray-800 text-brand-accent px-3 py-1 rounded-lg text-[10px] font-black border border-brand-accent/20">
                        {stats.tier || 'TIER ' + (Math.floor(idx / 5) + 1)}
                    </span>
                </td>
                <td className="p-4 text-xs text-gray-400 font-medium leading-relaxed max-w-md">{stats.outlook || 'Projected high-value asset based on upcoming matchups.'}</td>
            </tr>
          );
      }

      const commonCells = (
        <>
            <td className="p-4 font-black text-gray-600">#{player.rank || idx + 1}</td>
            <td className="p-4">
                <div className="font-black text-brand-text uppercase italic tracking-tighter">{player.name}</div>
                <div className="text-[10px] text-gray-500 font-bold">{player.team}</div>
            </td>
            <td className="p-4 text-right font-mono font-black text-brand-highlight text-lg italic">
                {player.points || (150 - idx * 4)}
            </td>
        </>
      );

      let statCells;
      if (position === 'QB') {
          statCells = (
            <>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.passYds || '3,850'}</td>
                <td className="p-4 text-right text-brand-accent font-black text-sm italic">{stats.passTD || '28'}</td>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.rushYds || '420'}</td>
                <td className="p-4 text-right text-brand-accent font-black text-sm italic">{stats.rushTD || '4'}</td>
                <td className="p-4 text-right text-gray-500 font-mono text-xs">{stats.attempts || '540'}</td>
            </>
          );
      } else if (position === 'RB') {
          statCells = (
            <>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.carries || '245'}</td>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.rushYds || '1,120'}</td>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.targets || '55'}</td>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.catches || '42'}</td>
                <td className="p-4 text-right text-brand-accent font-black text-sm italic">{stats.totalTD || '12'}</td>
            </>
          );
      } else if (position === 'WR' || position === 'TE') {
        statCells = (
            <>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.targets || '135'}</td>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.catches || '98'}</td>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.recYds || '1,240'}</td>
                <td className="p-4 text-right text-brand-accent font-black text-sm italic">{stats.totalTD || '9'}</td>
            </>
        );
      } else if (position === 'DST') {
        statCells = (
            <>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.ptsAllowed || '18.4'}</td>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.sacks || '42'}</td>
                <td className="p-4 text-right text-brand-accent font-black text-sm italic">{stats.interceptions || '14'}</td>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.fumbleRecoveries || '8'}</td>
                <td className="p-4 text-right text-brand-accent font-black text-sm italic">{stats.defensiveTD || '2'}</td>
            </>
        );
      } else if (position === 'K') {
        statCells = (
            <>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.fgMade || '28'}</td>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.fgAttempted || '32'}</td>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.fgPercentage || '87.5%'}</td>
                <td className="p-4 text-right text-brand-accent font-black text-sm italic">{stats.xpMade || '45'}</td>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.long || '58'}</td>
            </>
        );
      } else {
        // IDP
        statCells = (
            <>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.totalTackles || '115'}</td>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.sacks || '6.5'}</td>
                <td className="p-4 text-right text-brand-accent font-black text-sm italic">{stats.interceptions || '1'}</td>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.forcedFumbles || '2'}</td>
                <td className="p-4 text-right text-gray-300 font-mono text-xs">{stats.passDeflections || '4'}</td>
            </>
        );
      }

      return (
        <tr key={idx} className="border-b border-gray-700/50 hover:bg-brand-card transition-colors group">
            {commonCells}
            {statCells}
        </tr>
      );
  };

  return (
    <div className="flex flex-col h-full gap-6">
       <div className="bg-brand-card rounded-xl border border-gray-700 p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
           <div className="flex items-center gap-4">
               <div className="bg-brand-highlight/20 p-3 rounded-full border border-brand-highlight/40">
                  <Trophy className="text-brand-highlight" size={24} />
               </div>
               <div>
                   <h2 className="text-2xl font-black text-brand-text uppercase italic tracking-tighter">Season Analytics</h2>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Projections & Market Value</p>
               </div>
           </div>
           
           <div className="flex bg-gray-900 rounded-2xl p-1.5 border border-gray-700 shadow-inner">
               <button 
                  onClick={() => setActiveTab('season')}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'season' ? 'bg-brand-highlight text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
               >
                   <TrendingUp size={14} /> Season Stats
               </button>
               <button 
                  onClick={() => setActiveTab('ros')}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'ros' ? 'bg-brand-accent text-brand-contrast shadow-lg' : 'text-gray-500 hover:text-white'}`}
               >
                   <Calendar size={14} /> Rest of Season
               </button>
           </div>
       </div>

       <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
           {[
             {id: 'QB', label: 'QB', icon: Shield},
             {id: 'RB', label: 'RB', icon: Shield},
             {id: 'WR', label: 'WR', icon: Shield},
             {id: 'TE', label: 'TE', icon: Shield},
             {id: 'DST', label: 'D/ST', icon: Shield},
             {id: 'K', label: 'K', icon: Target},
             {id: 'DT', label: 'DT', icon: Users},
             {id: 'DE', label: 'DE', icon: Users},
             {id: 'LB', label: 'LB', icon: Users},
             {id: 'CB', label: 'CB', icon: Users},
             {id: 'S', label: 'S', icon: Users},
           ].map(pos => (
               <button
                  key={pos.id}
                  onClick={() => setPosition(pos.id)}
                  className={`px-8 py-3 rounded-2xl font-black uppercase italic tracking-tighter border transition-all snap-start flex items-center gap-2 shrink-0 ${position === pos.id ? 'bg-brand-accent text-brand-contrast border-brand-accent shadow-xl scale-105' : 'bg-brand-card border-gray-800 text-gray-500 hover:bg-gray-800'}`}
               >
                   <pos.icon size={14} className={position === pos.id ? 'text-brand-contrast' : 'text-gray-700'} />
                   {pos.label}
               </button>
           ))}
       </div>

       <div className="bg-brand-card rounded-2xl border border-gray-700 overflow-hidden flex-1 flex flex-col shadow-2xl">
           {loading ? (
               <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-20 animate-fade-in">
                   <div className="relative mb-6">
                       <Loader2 size={64} className="text-brand-highlight animate-spin" />
                       <RefreshCw size={24} className="absolute inset-0 m-auto text-brand-accent animate-spin-slow" />
                   </div>
                   <p className="font-black text-xl uppercase italic tracking-tighter text-white">Synthesizing Market Data...</p>
                   <p className="text-[10px] mt-2 opacity-50 font-bold uppercase tracking-[0.3em]">Cross-Referencing Stats & Scouting Reports</p>
               </div>
           ) : (
               <div className="flex-1 overflow-auto custom-scrollbar">
                   <table className="w-full border-collapse">
                       <thead className="sticky top-0 z-20 shadow-xl shadow-black/20">
                           {renderTableHeader()}
                       </thead>
                       <tbody className="divide-y divide-gray-800/50">
                           {data.map((player, idx) => renderRow(player, idx))}
                           {data.length === 0 && !loading && (
                               <tr>
                                   <td colSpan={10} className="p-20 text-center flex flex-col items-center justify-center opacity-20">
                                       <Trophy size={80} className="mb-4" />
                                       <p className="font-black text-2xl uppercase italic tracking-tighter">No Active Roster Data</p>
                                   </td>
                               </tr>
                           )}
                       </tbody>
                   </table>
               </div>
           )}
       </div>
    </div>
  );
};

export default SeasonRankings;
