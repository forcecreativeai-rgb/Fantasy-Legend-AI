
import React, { useState } from 'react';
import { generateSmackTalk } from '../services/gemini';
import { Megaphone, Copy, Loader2, MessageSquare, Swords, Skull, GraduationCap, Check, Zap, BookOpen, ArrowRight, AlertTriangle, ShieldAlert } from 'lucide-react';

const SAVAGE_TIPS = [
    {
        title: "✅ THE DO: The Boast",
        category: "Establish Dominance",
        content: "Loud, proud, and delusional — as it should be. Establish dominance early.",
        example: "“Want me to start my bench just to keep things fair?”",
        note: "If your confidence isn’t irrational, it isn’t trash talk."
    },
    {
        title: "✅ THE DO: The Insult (AKA “The Dozens”)",
        category: "Classic Roast",
        content: "Go after bad trades, lineup decisions, last-place finishes, or their annual draft meltdown.",
        example: "“Your draft strategy is the reason we need relegation.”",
        note: "Keep it PG-13 unless your league is chaotic and consenting."
    },
    {
        title: "✅ THE DO: Psychological Warfare",
        category: "Rent Free",
        content: "Your goal is not just to win the matchup — it’s to win the rent-free property in their mind. Use repetitive jabs, distracting commentary, or silence (the master-level tactic).",
        example: "“Are you sure about that FLEX play? Just checking.”",
        note: "You’re breaking their concentration like a rogue toddler at a wedding."
    },
    {
        title: "✅ THE DO: The Backhanded Compliment",
        category: "Subtle Assassin",
        content: "The polite-but-deadly assassin of trash talk. Use subtlety to hit harder than insults ever could. Confusion is an underrated weapon.",
        example: "“Love your confidence starting that guy. Inspiring.”",
        note: "Or after they score 78 points: “Good try out there. Lots of heart.”"
    },
    {
        title: "✅ THE DO: Focused Research",
        category: "Scholar of Smack",
        content: "Use past standings, failed waiver bids, their cursed “favorite player”, and screenshots of the worst trades in league history.",
        example: "“Remember 2021 when you traded a RB1 for a kicker?”",
        note: "This is trash talk with receipts, footnotes, and citations. A dissertation in disrespect."
    },
    {
        title: "✅ THE DO: Punch Fairly",
        category: "Variety > Bullying",
        content: "Punch Up (leaders), Punch Down (last place), Punch Sideways (mid-packers). But don’t repeatedly dunk on the 1–10 team who hasn’t emotionally recovered from Week 3.",
        example: "Take shots at yourself occasionally to keep it fun.",
        note: "Don't be a bully, be a villain."
    },
    {
        title: "✅ THE DO: Stay Active",
        category: "Consistency",
        content: "Losers who still trash talk are league legends. Winners who only trash talk when they win are league cowards.",
        example: "Trash talk even when you are down 40 points.",
        note: "Consistency > cowardice."
    },
    {
        title: "✅ THE DO: Brag Without Shame",
        category: "Confidence",
        content: "Ride your highs like a parade float. Worried you’ll jinx yourself? Good. Trash talk is for the brave.",
        example: "“I'm projecting 150 points. And that's just my Kicker.”",
        note: ""
    },
    {
        title: "✅ THE DO: Use League Lore",
        category: "History",
        content: "Inside jokes age like fine wine and poor roster decisions. Bring up the FAAB disasters and the trade that lives in infamy.",
        example: "“Don't pull a [League Member Name] this week.”",
        note: "History is your weapon. Wield it."
    },
    {
        title: "❌ THE DON'T: Disappearing Act",
        category: "Don't Be Weak",
        content: "If you only speak when you’re 5–0, congratulations: You’re a solar-powered trash talker. Useless at night, rain, sadness, or any adversity.",
        example: "",
        note: "Don't disappear while losing."
    },
    {
        title: "❌ THE DON'T: Mama Rule Violation",
        category: "The Red Line",
        content: "There is trash talk. There is savage banter. And then there is: “Your mama…” This is where empires fall and leagues break up.",
        example: "🚫 Forbidden",
        note: "Keep mamas out your mouth and your matchup."
    },
    {
        title: "❌ THE DON'T: Real Trauma",
        category: "Too Far",
        content: "Fantasy trauma? Yes. Real trauma? Rejected harder than a waiver claim on Wednesday morning.",
        example: "If you have to ask, 'Is this too far?' it is.",
        note: "Don't get personal with real life tragedy."
    },
    {
        title: "❌ THE DON'T: Thin Skin",
        category: "Can't Take It",
        content: "Thin-skinned trash talkers are the league’s favorite chew toy. If you get flustered or complain about tone, you’ve lost.",
        example: "",
        note: "Be the villain or the clown — but not the victim."
    },
    {
        title: "🏆 TRASH TALK STYLES SUMMARY",
        category: "Cheat Sheet",
        content: "Boast: Assert dominance. Insult: Roast mistakes. Psych Warfare: Break focus. Backhanded Compliment: Confusion.",
        example: "",
        note: "Master them all to become a Fantasy Legend."
    }
];

const SmackTalkGenerator: React.FC = () => {
  const [opponentName, setOpponentName] = useState('');
  const [opponentPlayers, setOpponentPlayers] = useState('');
  const [tone, setTone] = useState('Funny / Witty');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Savage Skills State
  const [showSkills, setShowSkills] = useState(false);
  const [skillIndex, setSkillIndex] = useState(0);

  const tones = [
    { label: 'Funny / Witty', icon: MessageSquare, desc: 'Lighthearted roasting' },
    { label: 'Aggressive', icon: Skull, desc: 'Direct and confrontational' },
    { label: 'Statistical / Nerd', icon: GraduationCap, desc: 'Uses facts and logic' },
    { label: 'Shakespearean', icon: Swords, desc: 'Old school thee/thou roast' },
  ];

  const handleGenerate = async (forceSavage: boolean = false) => {
    if (!opponentName) return;
    setLoading(true);
    setResults([]);
    setShowSkills(false); // Switch back to results view
    
    // If "More Savage" is clicked, override the tone
    const finalTone = forceSavage ? "Brutal, No Mercy, Absolute Destruction, Rated R" : tone;
    
    try {
      const lines = await generateSmackTalk(opponentName, finalTone, opponentPlayers);
      setResults(lines);
    } catch (e) {
      console.error(e);
      alert("Failed to generate smack talk. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
  };

  const nextSkill = () => {
      setSkillIndex((prev) => (prev + 1) % SAVAGE_TIPS.length);
  };

  const toggleSkills = () => {
      setShowSkills(!showSkills);
      if (!showSkills) {
          // If opening skills, pick a random one to start or just 0
          setSkillIndex(Math.floor(Math.random() * SAVAGE_TIPS.length));
      }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8">
       <div className="lg:w-1/3 space-y-6">
           <div className="bg-brand-card p-6 rounded-xl border border-gray-700">
               <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                   <Megaphone className="text-brand-highlight" />
                   Setup The Roast
               </h2>
               
               <div className="space-y-4">
                   <div>
                       <label className="block text-sm font-bold text-gray-400 uppercase mb-1">Opponent Name / Team</label>
                       <input 
                          value={opponentName}
                          onChange={(e) => setOpponentName(e.target.value)}
                          placeholder="e.g. Team No Punt Intended"
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-highlight outline-none"
                       />
                   </div>

                   <div>
                       <label className="block text-sm font-bold text-gray-400 uppercase mb-1">Their Key Players (Optional)</label>
                       <textarea 
                          value={opponentPlayers}
                          onChange={(e) => setOpponentPlayers(e.target.value)}
                          placeholder="e.g. He's starting Daniel Jones and Kyle Pitts..."
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-highlight outline-none h-24"
                       />
                   </div>

                   <div>
                       <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Tone</label>
                       <div className="grid grid-cols-1 gap-2">
                           {tones.map((t) => {
                               const Icon = t.icon;
                               return (
                                   <button
                                      key={t.label}
                                      onClick={() => setTone(t.label)}
                                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${tone === t.label ? 'bg-brand-highlight/20 border-brand-highlight' : 'bg-gray-900 border-gray-700 hover:bg-gray-800'}`}
                                   >
                                       <div className={`p-2 rounded-full ${tone === t.label ? 'bg-brand-highlight text-black' : 'bg-gray-800 text-gray-400'}`}>
                                           <Icon size={16} />
                                       </div>
                                       <div>
                                           <div className={`font-bold text-sm ${tone === t.label ? 'text-brand-highlight' : 'text-white'}`}>{t.label}</div>
                                           <div className="text-xs text-gray-500">{t.desc}</div>
                                       </div>
                                   </button>
                               )
                           })}
                       </div>
                   </div>

                   <button 
                      onClick={() => handleGenerate(false)}
                      disabled={!opponentName || loading}
                      className="w-full bg-brand-accent hover:bg-green-500 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
                   >
                      {loading ? <Loader2 className="animate-spin" /> : <Megaphone size={20} />}
                      Generate Smack Talk
                   </button>
               </div>
           </div>
       </div>

       <div className="lg:w-2/3 flex flex-col h-full">
           <div className="bg-brand-card p-6 rounded-xl border border-gray-700 h-full flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {showSkills ? <BookOpen className="text-blue-400" /> : <Swords className="text-red-500" />}
                        {showSkills ? "Savage Skills Academy" : "Generated Insults"}
                    </h2>
                    
                    <button 
                        onClick={toggleSkills}
                        className={`text-xs font-bold px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${showSkills ? 'bg-brand-highlight text-black border-brand-highlight' : 'bg-gray-800 border-gray-600 text-gray-300 hover:text-white'}`}
                    >
                        {showSkills ? <Megaphone size={14} /> : <BookOpen size={14} />}
                        {showSkills ? "Back to Generator" : "Savage Skills"}
                    </button>
                </div>

                {showSkills ? (
                    // Savage Skills View
                    <div className="flex-1 flex flex-col animate-fade-in">
                        <div className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-gray-900/50 rounded-xl border border-gray-700 relative">
                             <div className="bg-gray-800 p-4 rounded-full mb-6 shadow-lg shadow-brand-highlight/10">
                                 {SAVAGE_TIPS[skillIndex].title.includes("DON'T") ? (
                                     <ShieldAlert size={48} className="text-red-500" />
                                 ) : (
                                     <Zap size={48} className="text-yellow-400" />
                                 )}
                             </div>
                             
                             <div className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                                 {SAVAGE_TIPS[skillIndex].category}
                             </div>
                             
                             <h3 className={`text-2xl md:text-3xl font-black mb-6 ${SAVAGE_TIPS[skillIndex].title.includes("DON'T") ? 'text-red-400' : 'text-green-400'}`}>
                                 {SAVAGE_TIPS[skillIndex].title}
                             </h3>
                             
                             <p className="text-lg text-gray-200 max-w-2xl leading-relaxed mb-8">
                                 {SAVAGE_TIPS[skillIndex].content}
                             </p>
                             
                             {SAVAGE_TIPS[skillIndex].example && (
                                 <div className="bg-black/30 p-4 rounded-lg border-l-4 border-brand-highlight text-left max-w-xl w-full">
                                     <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Example</span>
                                     <p className="font-medium text-white italic">"{SAVAGE_TIPS[skillIndex].example}"</p>
                                 </div>
                             )}
                             
                             {SAVAGE_TIPS[skillIndex].note && (
                                <p className="mt-6 text-sm text-gray-400 italic">
                                    💡 Tip: {SAVAGE_TIPS[skillIndex].note}
                                </p>
                             )}
                        </div>
                        
                        <div className="mt-6 flex justify-center">
                            <button 
                                onClick={nextSkill}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                            >
                                Next Tip <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                ) : (
                    // Results View
                    <>
                        {results.length > 0 ? (
                            <div className="flex-1 flex flex-col">
                                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 mb-4">
                                    {results.map((line, idx) => (
                                        <div key={idx} className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-brand-highlight transition-colors group relative animate-slide-right" style={{animationDelay: `${idx * 100}ms`}}>
                                            <p className="text-lg text-gray-200 pr-8 font-medium">"{line}"</p>
                                            <button 
                                            onClick={() => handleCopy(line, idx)}
                                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                                            title="Copy to clipboard"
                                            >
                                                {copiedIndex === idx ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="pt-4 border-t border-gray-700 flex justify-end">
                                    <button 
                                        onClick={() => handleGenerate(true)}
                                        disabled={loading || !opponentName}
                                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 shadow-lg shadow-red-900/30 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : <AlertTriangle size={18} />}
                                        More Savage (No Mercy)
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-50">
                                <Megaphone size={64} className="mb-4" />
                                <p className="text-lg font-bold">Ready to Roast</p>
                                <p className="text-sm">Enter opponent details to generate lines</p>
                            </div>
                        )}
                    </>
                )}
           </div>
       </div>
    </div>
  );
};

export default SmackTalkGenerator;
