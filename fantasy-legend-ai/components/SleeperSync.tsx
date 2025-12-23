
import React, { useState } from 'react';
import { TeamConfig, Player, LeagueRoster } from '../types';
import { 
    getSleeperUser, 
    getSleeperLeagues, 
    getSleeperRosters, 
    getSleeperLeagueUsers,
    fetchSleeperPlayerDatabase,
    mapSleeperPlayers,
    getAvatarUrl,
    SleeperUser,
    SleeperLeague
} from '../services/sleeperIntegration';
import { Loader2, Moon, Search, AlertCircle, CheckCircle2, Trophy, User, ArrowRight, Database, DownloadCloud } from 'lucide-react';

interface Props {
  setTeam: React.Dispatch<React.SetStateAction<TeamConfig>>;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setLeagueRosters: React.Dispatch<React.SetStateAction<LeagueRoster[]>>;
}

const SleeperSync: React.FC<Props> = ({ setTeam, setPlayers, setLeagueRosters }) => {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'leagues_found' | 'syncing' | 'success' | 'error'>('idle');
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [user, setUser] = useState<SleeperUser | null>(null);
  const [leagues, setLeagues] = useState<SleeperLeague[]>([]);
  const [syncedTeamName, setSyncedTeamName] = useState('');
  
  const handleFindUser = async () => {
      if (!username) return;
      setStatus('loading');
      setLoadingStep('Locating Sleeper Account...');
      setErrorMsg('');
      setUser(null);
      setLeagues([]);

      try {
          // 1. Fetch User
          const userData = await getSleeperUser(username.trim());
          setUser(userData);

          setLoadingStep('Retrieving 2024 Leagues...');
          // 2. Fetch Leagues (NFL 2024)
          const leagueData = await getSleeperLeagues(userData.user_id, '2024');
          setLeagues(leagueData);
          
          if (leagueData.length === 0) {
              setErrorMsg('No active 2024 NFL leagues found for this user.');
              setStatus('error');
          } else {
              setStatus('leagues_found');
          }
      } catch (e: any) {
          console.error(e);
          setErrorMsg(e.message || 'User not found or Sleeper API is unreachable.');
          setStatus('error');
      }
  };

  const handleSyncLeague = async (league: SleeperLeague) => {
      if (!user) return;
      setStatus('syncing');
      setLoadingStep('Analyzing League Rosters...');
      setErrorMsg('');
      
      try {
          // 1. Fetch Rosters for this league
          const rosters = await getSleeperRosters(league.league_id);
          
          // 2. Fetch League Users for mapping
          setLoadingStep('Syncing Team Identities...');
          const leagueUsers = await getSleeperLeagueUsers(league.league_id);
          
          // 3. Fetch Full Player DB
          setLoadingStep('Caching Player Database...');
          const playerDB = await fetchSleeperPlayerDatabase();

          // 4. Map all league rosters
          setLoadingStep('Mapping League Roster Set...');
          const allRosters: LeagueRoster[] = rosters.map(r => {
              const u = leagueUsers.find(user => user.user_id === r.owner_id);
              const name = u?.metadata?.team_name || (u?.display_name ? `${u.display_name}'s Team` : `Team ${r.roster_id}`);
              const isUser = r.owner_id === user.user_id || (Array.isArray(r.co_owners) && r.co_owners.includes(user.user_id));
              
              const mappedPlayers = mapSleeperPlayers(r.players, r.starters, playerDB);
              
              return {
                  teamName: name,
                  ownerName: u?.display_name || 'Unknown',
                  players: mappedPlayers,
                  isUser: isUser
              };
          });

          const myRoster = allRosters.find(r => r.isUser);
          if (!myRoster) {
              throw new Error("You are not identified as an owner or co-owner in this league.");
          }

          setSyncedTeamName(myRoster.teamName);
          setPlayers(myRoster.players);
          setLeagueRosters(allRosters);
          setTeam(prev => ({ ...prev, name: myRoster.teamName }));

          setStatus('success');
      } catch (e: any) {
          console.error(e);
          setErrorMsg(e.message || "Failed to sync roster. Verify your league membership.");
          setStatus('error');
      }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8">
        {/* Left Panel: Connection */}
        <div className="lg:w-1/3 space-y-6">
            <div className="bg-brand-card p-8 rounded-xl border border-gray-700 flex flex-col items-center text-center h-full">
                <div className="bg-[#2c3e50] p-4 rounded-full mb-6 shadow-lg shadow-blue-900/20">
                    <Moon size={48} className="text-blue-300" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Sleeper Sync</h2>
                <p className="text-gray-400 text-sm mb-8">
                    Sync your live Sleeper rosters for instant AI coaching and gear generation. Supports Co-Owners.
                </p>

                <div className="w-full space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-500" size={18} />
                        <input 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFindUser()}
                            placeholder="Sleeper Username"
                            className="w-full bg-gray-800 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        />
                    </div>

                    <button 
                        onClick={handleFindUser}
                        disabled={status === 'loading' || status === 'syncing' || !username}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20"
                    >
                        {(status === 'loading' || status === 'syncing') ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                        {status === 'loading' ? 'Searching...' : 'Find Leagues'}
                    </button>
                </div>

                {(status === 'loading' || status === 'syncing') && (
                    <div className="mt-4 flex flex-col items-center justify-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                        <DownloadCloud size={16} />
                        {loadingStep}
                    </div>
                )}

                {status === 'error' && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3 text-red-400 text-xs text-left w-full font-bold">
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}
                
                <div className="mt-8 pt-6 border-t border-gray-800 w-full text-left">
                     <h4 className="text-[10px] font-black text-gray-500 uppercase mb-2 tracking-[0.2em]">Data Integrity</h4>
                     <div className="flex items-center gap-2 text-[10px] text-green-400 font-bold">
                         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                         Direct API v1 Connection
                     </div>
                </div>
            </div>
        </div>

        {/* Right Panel: Results */}
        <div className="lg:w-2/3">
            {status === 'idle' && (
                <div className="bg-brand-card rounded-xl border border-gray-700 h-full flex flex-col items-center justify-center text-gray-500 p-10">
                    <Database size={64} className="mb-6 opacity-20" />
                    <h2 className="text-xl font-bold mb-2">Awaiting Credentials</h2>
                    <p className="text-sm opacity-60">Enter your Sleeper handle to load your franchises.</p>
                </div>
            )}

            {(status === 'leagues_found' || status === 'syncing' || status === 'success' || status === 'error') && user && (
                <div className="space-y-6 animate-fade-in">
                    {/* User Profile */}
                    <div className="bg-brand-card rounded-xl border border-gray-700 p-6 flex items-center gap-4 shadow-xl">
                        <img 
                            src={getAvatarUrl(user.avatar)} 
                            alt="Avatar" 
                            className="w-16 h-16 rounded-full bg-gray-800 border-2 border-blue-500 shadow-lg"
                            onError={(e) => (e.currentTarget.src = 'https://sleepercdn.com/images/v2/icons/player_default.webp')}
                        />
                        <div>
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">{user.display_name}</h2>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{leagues.length} Active 2024 Franchises</p>
                        </div>
                    </div>

                    {/* League List */}
                    <div className="space-y-3">
                         <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Select Target Franchise</h3>
                         
                         {leagues.length === 0 && status !== 'loading' && (
                             <div className="p-10 bg-gray-800/50 rounded-xl text-center text-gray-500 border border-gray-700">
                                 No 2024 leagues found. Double check your username or season settings.
                             </div>
                         )}

                         <div className="grid grid-cols-1 gap-3">
                            {leagues.map(league => (
                                <div key={league.league_id} className="bg-gray-800/40 p-4 rounded-xl border border-gray-700 hover:border-blue-500 transition-all group flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gray-900 w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border border-gray-700">
                                            {league.avatar ? (
                                                <img src={`https://sleepercdn.com/avatars/thumbs/${league.avatar}`} className="w-full h-full rounded-lg object-cover" alt="League" />
                                            ) : (
                                                <Trophy className="text-gray-600" size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-lg uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors">{league.name}</h4>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                <span>{league.total_rosters} Teams</span>
                                                <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                                <span className={`px-2 py-0.5 rounded text-black ${league.status === 'in_season' ? 'bg-green-500' : 'bg-gray-600'}`}>
                                                    {league.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleSyncLeague(league)}
                                        disabled={status === 'syncing'}
                                        className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white px-5 py-2.5 rounded-lg font-black transition-all flex items-center gap-2 text-xs uppercase tracking-widest border border-blue-500/20"
                                    >
                                        {status === 'syncing' ? <Loader2 className="animate-spin" size={14} /> : <ArrowRight size={14} />}
                                        SYNC
                                    </button>
                                </div>
                            ))}
                         </div>
                    </div>
                    
                    {status === 'success' && (
                         <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-xl flex items-center gap-4 animate-slide-up">
                             <div className="bg-green-500 p-3 rounded-full shadow-lg shadow-green-900/40">
                                <CheckCircle2 size={24} className="text-black" />
                             </div>
                             <div>
                                 <h3 className="font-black text-green-400 uppercase italic">Franchise Sync Successful</h3>
                                 <p className="text-xs text-green-100/60 font-bold uppercase tracking-wider">Team Name: {syncedTeamName}</p>
                                 <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Roster data is now available across the platform.</p>
                             </div>
                         </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default SleeperSync;
