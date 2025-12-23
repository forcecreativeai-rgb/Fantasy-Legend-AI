
import React, { useState, useEffect } from 'react';
import { getStreamingAnalysis } from '../services/gemini';
import { Lock, Search, Calendar, TrendingUp, Percent, ArrowRight, Shield, Users, Target, DollarSign, Loader2, RefreshCw } from 'lucide-react';

const StreamingAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DST' | 'QB' | 'K' | 'WR' | 'RB'>('DST');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  
  // Premium Lock State
  const [isPremium, setIsPremium] = useState(false);

  const fetchData = async (pos: string) => {
    setLoading(true);
    setData(null);
    try {
      // Map short codes to search-friendly terms
      let searchTerm = pos;
      if (pos === 'DST') searchTerm = 'Defense';
      else if (pos === 'K') searchTerm = 'Kicker';
      else if (pos === 'WR') searchTerm = 'Wide Receiver';
      else if (pos === 'RB') searchTerm = 'Running Back';
      else if (pos === 'QB') searchTerm = 'Quarterback';

      const result = await getStreamingAnalysis(searchTerm);
      setData(result.data);
      setSources(result.sources);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch waiver wire data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      if (isPremium) {
          fetchData(activeTab);
      }
  }, [activeTab, isPremium]);

  if (!isPremium) {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-brand-card rounded-xl border border-gray-700 p-10 text-center animate-fade-in">
              <div className="bg-gray-800 p-4 rounded-full mb-6 border border-gray-700 shadow-lg shadow-brand-highlight/20">
                <DollarSign size={48} className="text-brand-highlight" />
              </div>
              <h2 className="text-4xl font-bold mb-4 text-white tracking-tight">Waiver Wire War Room</h2>
              <div className="max-w-lg space-y-4 mb-10">
                <p className="text-gray-400 text-lg">
                    Gain the edge with <span className="text-brand-highlight font-bold">Gemini 3 Pro</span> powered streaming analysis.
                </p>
                <ul className="text-left text-gray-300 space-y-2 bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <li className="flex items-center gap-2"><Shield size={16} className="text-green-400" /> Top 12 Streaming Rankings (All Positions)</li>
                    <li className="flex items-center gap-2"><Percent size={16} className="text-blue-400" /> Real-time Ownership Percentages</li>
                    <li className="flex items-center gap-2"><Calendar size={16} className="text-purple-400" /> Week N+1 Lookahead Stashes</li>
                    <li className="flex items-center gap-2"><Search size={16} className="text-orange-400" /> Aggregated Data from Yahoo, ESPN, FantasyPros</li>
                </ul>
              </div>
              <button 
                onClick={() => setIsPremium(true)} 
                className="bg-gradient-to-r from-brand-highlight to-brand-accent text-black font-bold py-4 px-10 rounded-full hover:scale-105 transition-transform shadow-xl shadow-green-900/30 flex items-center gap-2"
              >
                  <Lock size={18} /> Unlock Premium Tools
              </button>
          </div>
      )
  }

  const getLabel = (pos: string) => {
      if (pos === 'DST') return 'Defense';
      if (pos === 'QB') return 'QB';
      if (pos === 'RB') return 'RB';
      if (pos === 'WR') return 'WR';
      if (pos === 'K') return 'Kicker';
      return pos;
  }

  return (
    <div className="grid grid-cols-1 gap-6 h-full">
        {/* Header & Controls */}
        <div className="bg-brand-card rounded-xl border border-gray-700 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="text-brand-highlight" />
                    Waiver Wire Intelligence
                </h2>
                <p className="text-sm text-gray-400">Every platform. Every expert. One intelligent consensus—powered by Google AI.</p>
            </div>
            
            <div className="flex p-1 bg-gray-800 rounded-lg border border-gray-700 overflow-x-auto max-w-full">
                {(['QB', 'RB', 'WR', 'DST', 'K'] as const).map((pos) => (
                    <button
                        key={pos}
                        onClick={() => setActiveTab(pos)}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === pos ? 'bg-brand-highlight text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                    >
                        {getLabel(pos)}
                    </button>
                ))}
            </div>

            <button 
                onClick={() => fetchData(activeTab)}
                disabled={loading}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors shrink-0"
                title="Refresh Data"
            >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>

        {/* Main Content */}
        {loading ? (
            <div className="bg-brand-card rounded-xl border border-gray-700 h-[500px] flex flex-col items-center justify-center text-gray-400">
                <Loader2 size={48} className="text-brand-highlight animate-spin mb-4" />
                <p className="animate-pulse font-mono">Analyzing {activeTab} Market...</p>
                <p className="text-xs mt-2 opacity-50">Scouring FantasyPros, Yahoo, & ESPN</p>
            </div>
        ) : data ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Week Streamers */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-brand-card rounded-xl border border-gray-700 overflow-hidden">
                        <div className="bg-gray-900/50 p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                                <Target className="text-green-400" /> 
                                Week {data.currentWeek} Top Pickups
                            </h3>
                            <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-800">
                                Value Plays
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="p-4">Rank</th>
                                        <th className="p-4">Player / Team</th>
                                        <th className="p-4">Opponent</th>
                                        <th className="p-4 text-center">Own %</th>
                                        <th className="p-4">Analysis</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {data.streamers?.map((item: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-gray-800/50 transition-colors group">
                                            <td className="p-4 font-mono font-bold text-brand-highlight">#{item.rank || idx + 1}</td>
                                            <td className="p-4 font-bold text-white">{item.name}</td>
                                            <td className="p-4 text-gray-300">vs {item.opponent}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${parseInt(item.ownership) < 30 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                    {item.ownership}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-400 text-xs max-w-xs">{item.analysis}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {/* Data Sources */}
                    {sources.length > 0 && (
                        <div className="flex flex-wrap gap-2 px-2">
                            <span className="text-xs text-gray-500 font-bold uppercase py-1">Sources:</span>
                            {sources.slice(0, 4).map((s, i) => (
                                <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400 hover:text-white truncate max-w-[200px]">
                                    {s.title}
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* Lookahead Stashes */}
                <div className="lg:col-span-1 bg-brand-card rounded-xl border border-gray-700 overflow-hidden flex flex-col">
                    <div className="bg-gray-900/50 p-4 border-b border-gray-700">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-white">
                            <Calendar className="text-blue-400" />
                            Week {parseInt(data.currentWeek || 0) + 1} Stash
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Grab these before waivers run next week.</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {data.stashes?.map((item: any, idx: number) => (
                            <div key={idx} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-brand-highlight transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-white">{item.name}</h4>
                                    <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded border border-blue-800">
                                        {item.ownership} Owned
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                                    <ArrowRight size={14} className="text-gray-500" />
                                    <span>Next: vs <span className="font-bold text-white">{item.nextOpponent}</span></span>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    {item.analysis}
                                </p>
                            </div>
                        ))}
                        {(!data.stashes || data.stashes.length === 0) && (
                             <p className="text-gray-500 text-center italic">No clear stash candidates found for next week.</p>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-brand-card rounded-xl border border-gray-700 h-[500px] flex flex-col items-center justify-center text-gray-500">
                <p>Select a position to load data.</p>
            </div>
        )}
    </div>
  );
};

export default StreamingAssistant;
