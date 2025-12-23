import React, { useState, useEffect } from 'react';
import { Page, Player, TeamConfig, LeagueRoster } from './types';
import TeamBranding from './components/TeamBranding';
import RosterAnalysis from './components/RosterAnalysis';
import AssistantCoach from './components/AssistantCoach';
import GameDayGear from './components/GameDayGear';
import StreamingAssistant from './components/StreamingAssistant';
import PlayerAvatarStudio from './components/PlayerAvatarStudio';
import SmackTalkGenerator from './components/SmackTalkGenerator';
import LeagueSync from './components/LeagueSync';
import SleeperSync from './components/SleeperSync';
import DraftGrade from './components/DraftGrade';
import SeasonRankings from './components/SeasonRankings';
import DraftRedo from './components/DraftRedo';
import SalaryCapDraft from './components/SalaryCapDraft';
import { Trophy, Users, MessageSquare, Menu, X, Shield, Shirt, DollarSign, UserCircle, Megaphone, Globe, Moon, ClipboardList, BarChart2, ListOrdered, Wallet } from 'lucide-react';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.BRANDING);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [leagueRosters, setLeagueRosters] = useState<LeagueRoster[]>([]);
  const [team, setTeam] = useState<TeamConfig>({ 
    name: 'My Fantasy Team',
    colors: { primary: '#00F3FF', secondary: '#FF00FF' } 
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync isDarkMode with document class
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('theme-light');
    } else {
      document.body.classList.add('theme-light');
    }
  }, [isDarkMode]);

  const NavItem = ({ page, icon: Icon, label }: { page: Page; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentPage(page);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full ${
        currentPage === page 
          ? 'bg-brand-accent text-brand-contrast font-black shadow-lg shadow-brand-accent/20' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-brand-text'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen bg-brand-dark text-brand-text flex flex-col md:flex-row transition-colors duration-500`}>
      <aside className={`fixed md:relative z-50 bg-brand-dark md:bg-transparent w-64 h-full border-r border-gray-800 flex flex-col transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between h-20">
           {team.headerLogoUrl ? (
               <img src={team.headerLogoUrl} alt="App Logo" className="h-12 w-auto object-contain" />
           ) : (
               <div className="flex items-center gap-2 group cursor-pointer">
                  <Trophy size={28} className="text-brand-accent group-hover:scale-110 transition-transform" />
                  <span className="text-xl font-black tracking-tighter text-brand-accent">
                    FANTASY <span className="text-brand-highlight">LEGEND</span>
                  </span>
               </div>
           )}
           <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400">
             <X />
           </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem page={Page.LEAGUE} icon={Globe} label="Yahoo Sync" />
          <NavItem page={Page.SLEEPER} icon={Moon} label="Sleeper Sync" />
          <div className="border-t border-gray-800 my-2"></div>
          <NavItem page={Page.BRANDING} icon={Shield} label="Team HQ" />
          <NavItem page={Page.GEAR} icon={Shirt} label="Game Day Gear" />
          <NavItem page={Page.AVATAR} icon={UserCircle} label="Avatar Studio" />
          <NavItem page={Page.ROSTER} icon={Users} label="Roster Analysis" />
          <NavItem page={Page.ASSISTANT} icon={MessageSquare} label="Assistant Coach" />
          <NavItem page={Page.DRAFT} icon={ClipboardList} label="Draft Grade" />
          <NavItem page={Page.SALARY_CAP} icon={Wallet} label="Salary Mock" />
          <NavItem page={Page.DRAFT_REDO} icon={ListOrdered} label="Draft Redo" />
          <NavItem page={Page.RANKINGS} icon={BarChart2} label="Season Rankings" />
          <NavItem page={Page.STREAMING} icon={DollarSign} label="Waiver Wire" />
          <NavItem page={Page.SMACK} icon={Megaphone} label="Smack Talk" />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="bg-brand-card rounded-lg p-4 border border-white/5">
             <p className="text-[10px] text-gray-500 font-black uppercase mb-2 tracking-widest">Active Franchise</p>
             <div className="flex items-center gap-3">
                {team.logoUrl ? (
                    <img src={team.logoUrl} className="w-10 h-10 rounded-full object-cover bg-black border-2 border-brand-accent shadow-[0_0_10px_rgba(var(--color-brand-accent),0.3)]" alt="Logo" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                        <Shield size={16} className="text-gray-600" />
                    </div>
                )}
                <div className="overflow-hidden">
                    <p className="font-black text-xs text-brand-text truncate uppercase">{team.name}</p>
                    <p className="text-[10px] text-brand-accent font-bold">{players.length} Players</p>
                </div>
             </div>
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 w-full bg-brand-dark/95 backdrop-blur-md z-40 border-b border-gray-800 px-4 py-3 flex items-center justify-between h-16">
         <div className="flex items-center gap-2 h-full">
            {team.headerLogoUrl ? (
               <img src={team.headerLogoUrl} alt="App Logo" className="h-10 w-auto object-contain" />
            ) : (
                <>
                    <Trophy className="text-brand-accent" size={24} />
                    <span className="font-black text-brand-accent text-lg">FANTASY <span className="text-brand-highlight">LEGEND</span></span>
                </>
            )}
         </div>
         <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-300">
            <Menu />
         </button>
      </div>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen pt-20 md:pt-10">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 animate-fade-in">
             <h1 className="text-4xl font-black text-brand-text mb-2 uppercase italic tracking-tighter">
               {currentPage === Page.BRANDING && 'Team Headquarters'}
               {currentPage === Page.GEAR && 'Game Day Gear'}
               {currentPage === Page.AVATAR && 'Avatar Studio'}
               {currentPage === Page.ROSTER && 'Roster & Intel'}
               {currentPage === Page.ASSISTANT && 'Assistant Coach'}
               {currentPage === Page.STREAMING && 'Waiver Wire War Room'}
               {currentPage === Page.SMACK && 'Smack Talk Generator'}
               {currentPage === Page.LEAGUE && 'Yahoo League Integration'}
               {currentPage === Page.SLEEPER && 'Sleeper League Sync'}
               {currentPage === Page.DRAFT && 'Draft Report Card'}
               {currentPage === Page.DRAFT_REDO && 'Draft Redo'}
               {currentPage === Page.RANKINGS && 'Season Stats & Rankings'}
               {currentPage === Page.SALARY_CAP && 'Salary Mock'}
             </h1>
             <div className="h-1 w-24 bg-brand-highlight mb-4"></div>
             <p className="text-gray-400 font-medium">
               {currentPage === Page.BRANDING && 'Manage your team identity, logo, and visuals.'}
               {currentPage === Page.GEAR && 'Generate jerseys, helmets, and gear featuring your logo.'}
               {currentPage === Page.AVATAR && 'Transform yourself into a next-gen Madden style player.'}
               {currentPage === Page.ROSTER && 'Analyze your lineup, check news, and track stats.'}
               {currentPage === Page.ASSISTANT && 'Premium strategy advice powered by Gemini Pro.'}
               {currentPage === Page.STREAMING && 'Identify top streaming defenses and waiver gems.'}
               {currentPage === Page.SMACK && 'Generate creative and savage trash talk for your league.'}
               {currentPage === Page.LEAGUE && 'Connect to Yahoo Fantasy Sports to import your league data.'}
               {currentPage === Page.SLEEPER && 'Connect to Sleeper API to import rosters live.'}
               {currentPage === Page.DRAFT && 'Grade your team composition and draft value.'}
               {currentPage === Page.DRAFT_REDO && 'Redo your draft with current rankings.'}
               {currentPage === Page.RANKINGS && 'Track top players and projections.'}
               {currentPage === Page.SALARY_CAP && 'Test Stars-and-Scrubs strategies with a $198 virtual budget.'}
             </p>
          </header>

          <div className="animate-fade-in">
            {currentPage === Page.BRANDING && <TeamBranding team={team} setTeam={setTeam} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
            {currentPage === Page.GEAR && <GameDayGear team={team} setPage={setCurrentPage} players={players} />}
            {currentPage === Page.AVATAR && <PlayerAvatarStudio team={team} />}
            {currentPage === Page.ROSTER && <RosterAnalysis players={players} setPlayers={setPlayers} />}
            {currentPage === Page.ASSISTANT && <AssistantCoach players={players} />}
            {currentPage === Page.STREAMING && <StreamingAssistant />}
            {currentPage === Page.SMACK && <SmackTalkGenerator />}
            {currentPage === Page.LEAGUE && <LeagueSync setTeam={setTeam} setPlayers={setPlayers} setLeagueRosters={setLeagueRosters} />}
            {currentPage === Page.SLEEPER && <SleeperSync setTeam={setTeam} setPlayers={setPlayers} setLeagueRosters={setLeagueRosters} />}
            {currentPage === Page.DRAFT && <DraftGrade players={players} leagueRosters={leagueRosters} />}
            {currentPage === Page.DRAFT_REDO && <DraftRedo />}
            {currentPage === Page.RANKINGS && <SeasonRankings />}
            {currentPage === Page.SALARY_CAP && <SalaryCapDraft />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;