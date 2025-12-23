
import React, { useState } from 'react';
import { TeamConfig, Player, LeagueRoster } from '../types';
import { initiateYahooAuth, getYahooLeagueData, getYahooRoster, YahooLeagueData } from '../services/yahooIntegration';
import { Loader2, CheckCircle2, RefreshCw, Shield, Globe, ArrowRight, Trophy, Users, Calendar } from 'lucide-react';

interface Props {
  setTeam: (team: TeamConfig) => void;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setLeagueRosters: React.Dispatch<React.SetStateAction<LeagueRoster[]>>;
}

const LeagueSync: React.FC<Props> = ({ setTeam, setPlayers, setLeagueRosters }) => {
  const [status, setStatus] = useState<'idle' | 'authenticating' | 'fetching' | 'success'>('idle');
  const [leagueData, setLeagueData] = useState<YahooLeagueData | null>(null);

  const handleConnect = async () => {
      try {
          setStatus('authenticating');
          const token = await initiateYahooAuth();
          
          setStatus('fetching');
          const data = await getYahooLeagueData(token);
          setLeagueData(data);
          
          const roster = await getYahooRoster(token, data.user_team.team_key);
          
          // Update Global App State
          setPlayers(roster.map(p => ({...p, tags: []})));
          
          // Yahoo Mock: Simulate full league rosters
          setLeagueRosters([
              { teamName: data.user_team.name, ownerName: "You", players: roster, isUser: true },
              { teamName: "Red Zone Renegades", ownerName: "Draft King", players: roster.slice(0, 6), isUser: false },
              { teamName: "End Zone Elite", ownerName: "Touchdown Tom", players: roster.slice(2, 8), isUser: false },
              { teamName: "Gridiron Guerillas", ownerName: "Blitz Master", players: roster.slice(1, 7), isUser: false },
          ]);

          setTeam(prev => ({
              ...prev,
              name: data.user_team.name
          }));

          setStatus('success');
      } catch (error) {
          console.error(error);
          alert("Failed to sync with Yahoo. Please try again.");
          setStatus('idle');
      }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8">
        {/* Left Panel: Connection */}
        <div className="lg:w-1/3 space-y-6">
            <div className="bg-brand-card p-8 rounded-xl border border-gray-700 flex flex-col items-center text-center h-full">
                <div className="bg-[#6001d2] p-4 rounded-full mb-6 shadow-lg shadow-[#6001d2]/30">
                    <Globe size={48} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Yahoo Fantasy Sync</h2>
                <p className="text-gray-400 text-sm mb-8">
                    Connect your official Yahoo account to import your league settings, team name, and live roster automatically.
                </p>

                {status === 'idle' && (
                    <button 
                        onClick={handleConnect}
                        className="w-full bg-[#6001d2] hover:bg-[#5000b0] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg"
                    >
                        Connect with Yahoo
                        <ArrowRight size={20} />
                    </button>
                )}

                {status === 'authenticating' && (
                    <div className="w-full bg-gray-800 py-4 rounded-xl flex items-center justify-center gap-3 text-gray-300 border border-gray-700">
                        <Loader2 className="animate-spin text-[#6001d2]" />
                        Authorizing...
                    </div>
                )}

                {status === 'fetching' && (
                    <div className="w-full bg-gray-800 py-4 rounded-xl flex items-center justify-center gap-3 text-gray-300 border border-gray-700">
                        <Loader2 className="animate-spin text-brand-highlight" />
                        Importing League Data...
                    </div>
                )}

                {status === 'success' && (
                    <div className="w-full bg-green-500/10 border border-green-500/50 py-4 rounded-xl flex items-center justify-center gap-3 text-green-400 font-bold">
                        <CheckCircle2 size={20} />
                        Sync Complete
                    </div>
                )}
                
                <p className="text-[10px] text-gray-600 mt-6">
                    This integration uses the Yahoo Fantasy Sports API. You will be redirected to Yahoo to grant permissions securely.
                </p>
            </div>
        </div>

        {/* Right Panel: Dashboard */}
        <div className="lg:w-2/3">
            {status === 'success' && leagueData ? (
                <div className="space-y-6 animate-fade-in">
                    {/* League Header */}
                    <div className="bg-brand-card rounded-xl border border-gray-700 p-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Connected League</h2>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                                {leagueData.name}
                                <Shield className="text-brand-highlight" size={24} />
                            </h1>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-mono font-bold text-gray-200">{leagueData.season}</div>
                            <div className="text-xs text-gray-500">Season</div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                            <div className="text-gray-400 text-xs uppercase font-bold mb-2 flex items-center gap-2">
                                <Trophy size={14} /> Current Rank
                            </div>
                            <div className="text-4xl font-black text-brand-accent">#{leagueData.user_team.rank}</div>
                            <div className="text-xs text-gray-500 mt-1">of {leagueData.num_teams} teams</div>
                        </div>
                        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                            <div className="text-gray-400 text-xs uppercase font-bold mb-2 flex items-center gap-2">
                                <Calendar size={14} /> Record
                            </div>
                            <div className="text-4xl font-black text-white">{leagueData.user_team.record}</div>
                            <div className="text-xs text-gray-500 mt-1">Win-Loss-Tie</div>
                        </div>
                        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                             <div className="text-gray-400 text-xs uppercase font-bold mb-2 flex items-center gap-2">
                                <Users size={14} /> Your Team
                            </div>
                            <div className="text-xl font-bold text-white truncate">{leagueData.user_team.name}</div>
                            <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                <CheckCircle2 size={10} /> Roster Imported
                            </div>
                        </div>
                    </div>

                    {/* Next Step Action */}
                    <div className="bg-brand-highlight/10 border border-brand-highlight/30 p-6 rounded-xl flex items-center justify-between">
                         <div>
                             <h3 className="font-bold text-brand-highlight">Data Successfully Imported</h3>
                             <p className="text-sm text-gray-300">Your roster and league settings are now available in the Assistant Coach and Roster Analysis tools.</p>
                         </div>
                         <button disabled className="bg-gray-900 text-gray-500 font-bold py-2 px-4 rounded cursor-default">
                             Auto-Sync Active
                         </button>
                    </div>
                </div>
            ) : (
                <div className="bg-brand-card rounded-xl border border-gray-700 h-full flex flex-col items-center justify-center text-gray-500 p-10">
                    <RefreshCw size={64} className="mb-6 opacity-20" />
                    <h2 className="text-xl font-bold mb-2">Waiting to Connect</h2>
                    <p>Sync your league to view standings and import your roster.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default LeagueSync;
