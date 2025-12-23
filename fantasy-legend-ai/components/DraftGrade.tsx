
import React, { useState, useEffect } from 'react';
import { Player, LeagueRoster } from '../types';
import { generateDraftGrade, generateLeagueDraftGrades } from '../services/gemini';
import { Loader2, ClipboardList, AlertCircle, CheckCircle2, Trophy, ArrowRight, XCircle, LayoutGrid, Users, Zap, Search, Sparkles } from 'lucide-react';

interface Props {
  players: Player[];
  leagueRosters?: LeagueRoster[];
}

const DraftGrade: React.FC<Props> = ({ players, leagueRosters = [] }) => {
  const [viewMode, setViewMode] = useState<'individual' | 'league'>('individual');
  const [scoring, setScoring] = useState('PPR');
  const [numTeams, setNumTeams] = useState('12');
  const [loading, setLoading] = useState(false);
  const [reportCard, setReportCard] = useState<any>(null);
  const [leagueAudit, setLeagueAudit] = useState<any>(null);

  const handleAnalyzeIndividual = async () => {
    if (players.length === 0) return;
    setLoading(true);
    try {
      const result = await generateDraftGrade(players, scoring, numTeams);
      setReportCard(result);
      setViewMode('individual');
    } catch (e) {
      console.error(e);
      alert("Failed to generate draft grade.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeLeague = async () => {
    if (leagueRosters.length === 0) return;
    setLoading(true);
    try {
      const result = await generateLeagueDraftGrades(leagueRosters, scoring);
      setLeagueAudit(result);
      setViewMode('league');
    } catch (e) {
      console.error(e);
      alert("Failed to generate league audit.");
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
      if (!grade) return 'text-gray-400';
      const g = grade.trim().toUpperCase();
      if (g.startsWith('A')) return 'text-green-400';
      if (g.startsWith('B')) return 'text-blue-400';
      if (g.startsWith('C')) return 'text-yellow-400';
      return 'text-red-400';
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8">
       {/* Controls Panel */}
       <div className="lg:w-1/3 space-y-6">
           <div className="bg-brand-card p-6 rounded-xl border border-gray-700">
               <div className="flex items-center gap-3 mb-6">
                   <div className="bg-brand-accent/20 p-3 rounded-full border border-brand-accent/50">
                       <ClipboardList size={24} className="text-brand-accent" />
                   </div>
                   <div>
                       <h2 className="text-xl font-bold text-white uppercase italic tracking-tighter">Draft Audit</h2>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">AI Performance Lab</p>
                   </div>
               </div>

               <div className="space-y-4">
                   <div className="p-1 bg-gray-900 rounded-lg flex border border-gray-700">
                       <button 
                           onClick={() => setViewMode('individual')}
                           className={`flex-1 py-2 text-[10px] font-black rounded transition-all uppercase tracking-widest ${viewMode === 'individual' ? 'bg-brand-accent text-brand-contrast shadow-lg' : 'text-gray-500 hover:text-white'}`}
                       >
                           My Team
                       </button>
                       <button 
                           onClick={() => setViewMode('league')}
                           disabled={leagueRosters.length === 0}
                           className={`flex-1 py-2 text-[10px] font-black rounded transition-all uppercase tracking-widest disabled:opacity-20 ${viewMode === 'league' ? 'bg-brand-highlight text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                       >
                           Full League
                       </button>
                   </div>

                   <div>
                       <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">League Scoring</label>
                       <div className="grid grid-cols-3 gap-2">
                           {['Standard', 'Half PPR', 'PPR'].map(s => (
                               <button
                                   key={s}
                                   onClick={() => setScoring(s)}
                                   className={`px-3 py-2 rounded-lg text-[10px] font-black border transition-all uppercase ${scoring === s ? 'bg-brand-accent text-brand-contrast border-brand-accent' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`}
                               >
                                   {s}
                               </button>
                           ))}
                       </div>
                   </div>

                   <div>
                       <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">League Size</label>
                       <select 
                          value={numTeams}
                          onChange={(e) => setNumTeams(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-accent outline-none text-xs font-bold"
                       >
                           <option value="8">8 Teams</option>
                           <option value="10">10 Teams</option>
                           <option value="12">12 Teams</option>
                           <option value="14">14 Teams</option>
                       </select>
                   </div>

                   {viewMode === 'individual' ? (
                       <button 
                          onClick={handleAnalyzeIndividual}
                          disabled={loading || players.length === 0}
                          className="w-full bg-brand-accent hover:opacity-90 text-brand-contrast font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-accent/20 disabled:opacity-50 text-xs uppercase tracking-widest"
                       >
                          {loading ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                          Grade My Draft
                       </button>
                   ) : (
                       <button 
                          onClick={handleAnalyzeLeague}
                          disabled={loading || leagueRosters.length === 0}
                          className="w-full bg-brand-highlight hover:opacity-90 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-highlight/20 disabled:opacity-50 text-xs uppercase tracking-widest"
                       >
                          {loading ? <Loader2 className="animate-spin" /> : <Users size={18} />}
                          League Power Audit
                       </button>
                   )}

                   {players.length === 0 && viewMode === 'individual' && (
                       <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3 text-[10px] text-yellow-200 font-bold uppercase tracking-tight">
                           <AlertCircle size={16} className="shrink-0 text-yellow-500" />
                           Your roster is empty. Go to Team HQ, Sync, or use the Screenshot tool first.
                       </div>
                   )}
                   
                   {leagueRosters.length === 0 && viewMode === 'league' && (
                        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-3 text-[10px] text-blue-200 font-bold uppercase tracking-tight">
                            <Users size={16} className="shrink-0 text-blue-500" />
                            To audit the full league, use Sleeper or Yahoo Sync to import all opponent rosters.
                        </div>
                   )}
               </div>
           </div>
           
           <div className="bg-brand-card p-6 rounded-xl border border-gray-700 shadow-lg">
               <h4 className="text-[10px] font-black text-gray-500 mb-4 uppercase flex items-center gap-2 tracking-[0.2em]">
                   <Trophy size={14} className="text-brand-highlight" /> Performance Criteria
               </h4>
               <div className="space-y-4">
                   <div className="flex items-start gap-3">
                       <div className="h-5 w-5 rounded bg-gray-800 flex items-center justify-center text-[10px] font-bold text-brand-highlight border border-gray-700">1</div>
                       <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase">ADP Efficiency: AI analyzes reaches vs steals based on live consensus data.</p>
                   </div>
                   <div className="flex items-start gap-3">
                       <div className="h-5 w-5 rounded bg-gray-800 flex items-center justify-center text-[10px] font-bold text-brand-highlight border border-gray-700">2</div>
                       <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase">Structural Integrity: Balance of RB/WR depth is weighted heavily.</p>
                   </div>
                   <div className="flex items-start gap-3">
                       <div className="h-5 w-5 rounded bg-gray-800 flex items-center justify-center text-[10px] font-bold text-brand-highlight border border-gray-700">3</div>
                       <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase">Positional Efficiency: Penalties applied for excessive QB or TE stashes.</p>
                   </div>
                   <div className="flex items-start gap-3">
                       <div className="h-5 w-5 rounded bg-gray-800 flex items-center justify-center text-[10px] font-bold text-brand-highlight border border-gray-700">4</div>
                       <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase">Streaming Immunity: Teams are NOT penalized for missing Kickers or Defenses.</p>
                   </div>
               </div>
           </div>
       </div>

       {/* Results Panel */}
       <div className="lg:w-2/3">
           {loading ? (
               <div className="bg-brand-card rounded-xl border border-gray-700 h-full flex flex-col items-center justify-center text-gray-500 p-10 animate-fade-in">
                   <div className="relative mb-6">
                       <Loader2 size={80} className="text-brand-accent animate-spin" />
                       <Sparkles className="absolute -top-2 -right-2 text-brand-highlight animate-pulse" />
                   </div>
                   <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Running Draft Analytics</h2>
                   <p className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-[0.3em]">Cross-Referencing Latest Expert ADP</p>
               </div>
           ) : viewMode === 'individual' && reportCard ? (
               <div className="bg-brand-card rounded-xl border border-gray-700 overflow-hidden animate-fade-in h-full flex flex-col shadow-2xl">
                   <div className="bg-gray-900/50 p-10 border-b border-gray-700 flex flex-col items-center justify-center text-center relative overflow-hidden">
                       <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#fff_0%,_transparent_100%)]"></div>
                       <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Draft Performance Grade</h3>
                       <div className={`text-[12rem] font-black leading-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-float ${getGradeColor(reportCard.grade)}`}>
                           {reportCard.grade}
                       </div>
                   </div>

                   <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                       <div>
                           <h4 className="text-[10px] font-black text-gray-500 uppercase mb-4 border-b border-gray-800 pb-2 tracking-widest flex items-center gap-2">
                               <Search size={14} className="text-brand-accent" /> Scouting Summary
                           </h4>
                           <p className="text-xl text-gray-200 leading-tight font-black uppercase italic tracking-tight">
                               "{reportCard.summary}"
                           </p>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="bg-green-500/10 border border-green-500/30 p-5 rounded-2xl">
                               <h4 className="text-green-400 font-black uppercase text-[10px] mb-4 flex items-center gap-2 tracking-widest">
                                   <CheckCircle2 size={16} /> Asset Growth
                               </h4>
                               <ul className="space-y-3">
                                   {reportCard.strengths?.map((s: string, i: number) => (
                                       <li key={i} className="text-[10px] text-green-100 font-bold uppercase flex items-start gap-3 leading-relaxed">
                                           <div className="h-1.5 w-1.5 bg-green-500 rounded-full mt-1 shrink-0 animate-pulse"></div>
                                           {s}
                                       </li>
                                   ))}
                               </ul>
                           </div>
                           <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl">
                               <h4 className="text-red-400 font-black uppercase text-[10px] mb-4 flex items-center gap-2 tracking-widest">
                                   <XCircle size={16} /> Risk Factors
                               </h4>
                               <ul className="space-y-3">
                                   {reportCard.weaknesses?.map((w: string, i: number) => (
                                       <li key={i} className="text-[10px] text-red-100 font-bold uppercase flex items-start gap-3 leading-relaxed">
                                           <div className="h-1.5 w-1.5 bg-red-500 rounded-full mt-1 shrink-0 animate-pulse"></div>
                                           {w}
                                       </li>
                                   ))}
                               </ul>
                           </div>
                       </div>

                       <div className="grid grid-cols-2 gap-6">
                           <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700">
                               <div className="text-[10px] text-gray-500 uppercase font-black mb-2 tracking-widest">Masterclass Pick</div>
                               <div className="text-xl font-black text-brand-highlight uppercase italic tracking-tighter">{reportCard.bestValue || "N/A"}</div>
                           </div>
                           <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700">
                               <div className="text-[10px] text-gray-500 uppercase font-black mb-2 tracking-widest">Critical Reach</div>
                               <div className="text-xl font-black text-orange-500 uppercase italic tracking-tighter">{reportCard.reach || "N/A"}</div>
                           </div>
                       </div>
                   </div>
               </div>
           ) : viewMode === 'league' && leagueAudit ? (
               <div className="bg-brand-card rounded-xl border border-gray-700 overflow-hidden animate-fade-in h-full flex flex-col shadow-2xl">
                   <div className="bg-gray-900/50 p-8 border-b border-gray-700">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">League Power Audit</h3>
                        <p className="text-lg text-white font-black uppercase italic tracking-tight leading-tight">
                            {leagueAudit.leagueSummary}
                        </p>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto custom-scrollbar">
                       <div className="divide-y divide-gray-800">
                           {leagueAudit.rankings?.map((team: any, i: number) => (
                               <div key={i} className="p-6 hover:bg-gray-800/30 transition-all flex items-center justify-between group">
                                   <div className="flex items-center gap-6">
                                       <div className="text-4xl font-black text-gray-700 group-hover:text-brand-accent transition-colors">
                                           {i + 1}
                                       </div>
                                       <div>
                                           <h4 className="text-xl font-black text-white uppercase italic tracking-tighter group-hover:text-brand-highlight transition-colors">
                                               {team.teamName}
                                           </h4>
                                           <p className="text-[10px] text-gray-500 font-bold uppercase max-w-md mt-1 leading-relaxed">
                                               {team.analysis}
                                           </p>
                                       </div>
                                   </div>
                                   <div className={`text-4xl font-black ${getGradeColor(team.grade)}`}>
                                       {team.grade}
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               </div>
           ) : (
               <div className="bg-brand-card rounded-xl border border-gray-700 h-full flex flex-col items-center justify-center text-gray-500 p-10 shadow-2xl">
                   <div className="opacity-20 mb-8 bg-gray-800 p-8 rounded-full border-2 border-gray-700 animate-float">
                       <ClipboardList size={80} className="text-brand-accent" />
                   </div>
                   <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Awaiting Intel</h2>
                   <p className="max-w-xs text-center text-sm font-bold text-gray-600 mt-2 uppercase tracking-widest leading-relaxed">
                       Configure your league settings and trigger the audit to see how you stack up.
                   </p>
               </div>
           )}
       </div>
    </div>
  );
};

export default DraftGrade;
