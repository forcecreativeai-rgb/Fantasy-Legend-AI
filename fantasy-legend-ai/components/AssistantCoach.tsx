
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Player } from '../types';
import { askAssistant, generateRosterInsights } from '../services/gemini';
import { Send, Bot, User, Sparkles, Lock, Zap, Target, RefreshCw, Loader2, ArrowRight } from 'lucide-react';

interface Props {
  players?: Player[];
}

const AssistantCoach: React.FC<Props> = ({ players = [] }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "I'm your AI Assistant Coach. I've analyzed your current roster. How can I help you win this week?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [isPremium, setIsPremium] = useState(false); 

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isPremium && players.length > 0) {
      loadInsights();
    }
  }, [isPremium, players.length]);

  const loadInsights = async () => {
    setInsightsLoading(true);
    try {
      const result = await generateRosterInsights(players);
      setInsights(result);
    } catch (e) {
      console.error(e);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleSend = async (customMsg?: string) => {
    const textToSend = customMsg || input;
    if (!textToSend.trim() || loading) return;
    
    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!customMsg) setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const rosterContext = players.length > 0 
        ? "CURRENT USER ROSTER:\n" + players.map(p => `- ${p.position}: ${p.name} (${p.team || 'FA'}) ${p.isBench ? '[BENCH]' : '[STARTER]'}`).join('\n')
        : "No roster provided.";

      const response = await askAssistant(history, userMsg.content, true, rosterContext);
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: response.text || "I couldn't come up with a strategy right now.",
        sources: response.sources
      }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I had trouble connecting to the playbook. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: "Lineup Check", icon: Target, prompt: "Analyze my current starters. Are there any players I should consider benching for Week 1?" },
    { label: "Waiver Targets", icon: Zap, prompt: "Based on my roster weaknesses, who are the top 3 waiver wire pickups I should target?" },
    { label: "Trade Advice", icon: ArrowRight, prompt: "I'm looking to upgrade my WR depth. Who on my roster is currently at peak trade value?" }
  ];

  if (!isPremium) {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-brand-card rounded-xl border border-gray-700 p-10 text-center animate-fade-in">
              <Lock size={64} className="text-brand-highlight mb-6" />
              <h2 className="text-3xl font-bold mb-4 uppercase italic tracking-tighter">Coach Intelligence Locked</h2>
              <p className="text-gray-400 max-w-md mb-8 font-medium">Get deep lineup analysis, trade grading, and waiver wire hidden gems powered by Gemini 3 Pro.</p>
              <button onClick={() => setIsPremium(true)} className="bg-brand-highlight text-black font-black py-4 px-12 rounded-xl hover:scale-105 transition-all shadow-xl shadow-brand-highlight/20 uppercase tracking-widest text-sm">
                  Unlock Premium Strategist
              </button>
          </div>
      )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[750px] animate-fade-in">
      {/* Tactical HUD (Insights Sidebar) */}
      <div className="lg:w-1/3 flex flex-col gap-4">
          <div className="bg-brand-card rounded-xl border border-gray-700 p-5 flex-1 flex flex-col shadow-lg overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Zap size={14} className="text-brand-highlight" />
                      Tactical Briefing
                  </h3>
                  <button onClick={loadInsights} disabled={insightsLoading} className="text-gray-500 hover:text-white transition-colors">
                      {insightsLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  </button>
              </div>

              {insightsLoading && insights.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center p-6">
                      <Loader2 className="animate-spin mb-3 text-brand-accent" size={32} />
                      <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Scanning Roster Gaps...</p>
                  </div>
              ) : (
                  <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                      {insights.map((tip, i) => (
                          <div key={i} className="bg-gray-800/40 border border-gray-700 p-4 rounded-xl hover:border-brand-accent transition-all animate-slide-right" style={{animationDelay: `${i * 100}ms`}}>
                              <div className="flex items-start gap-3">
                                  <div className="h-6 w-6 rounded-full bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center shrink-0 mt-0.5">
                                      <span className="text-[10px] font-black text-brand-accent">{i + 1}</span>
                                  </div>
                                  <p className="text-xs font-bold text-gray-200 leading-relaxed uppercase">{tip}</p>
                              </div>
                          </div>
                      ))}
                      {insights.length === 0 && !insightsLoading && (
                          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 p-10">
                              <Target size={48} className="mb-4" />
                              <p className="text-xs font-black uppercase tracking-widest">No Tactical Gaps Detected</p>
                          </div>
                      )}
                  </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-800">
                  <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">Quick Playbook</h4>
                  <div className="grid grid-cols-1 gap-2">
                      {quickActions.map((action, i) => {
                          const Icon = action.icon;
                          return (
                              <button 
                                key={i}
                                onClick={() => handleSend(action.prompt)}
                                disabled={loading}
                                className="w-full text-left bg-gray-900 border border-gray-700 hover:border-brand-highlight p-3 rounded-xl flex items-center gap-3 transition-all group active:scale-95"
                              >
                                  <div className="bg-gray-800 p-2 rounded-lg group-hover:bg-brand-highlight group-hover:text-black transition-colors">
                                      <Icon size={14} />
                                  </div>
                                  <span className="text-[10px] font-black text-gray-400 uppercase group-hover:text-white transition-colors">{action.label}</span>
                              </button>
                          );
                      })}
                  </div>
              </div>
          </div>
      </div>

      {/* Main Chat Area */}
      <div className="lg:w-2/3 flex flex-col bg-brand-card rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
        <div className="bg-gray-900/80 backdrop-blur-xl p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
              <div className="bg-brand-accent p-2.5 rounded-xl shadow-lg shadow-brand-accent/20">
                   <Bot size={20} className="text-brand-contrast" />
              </div>
              <div>
                  <h3 className="font-black text-white italic uppercase tracking-tighter">Strat-Com AI</h3>
                  <p className="text-[10px] text-brand-accent font-bold uppercase tracking-widest">Tactical Analysis Engine</p>
              </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-500 bg-black/30 border border-white/5 px-3 py-1.5 rounded-full font-black uppercase">
              <Sparkles size={12} className="text-brand-highlight animate-pulse" />
              <span>Premium Live Intel</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#0a0f19]" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${msg.role === 'user' ? 'bg-brand-highlight text-black border-brand-highlight shadow-lg shadow-brand-highlight/20' : 'bg-gray-800 text-brand-accent border-gray-700'}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`max-w-[85%] rounded-2xl p-5 shadow-xl ${msg.role === 'user' ? 'bg-brand-highlight text-black rounded-tr-none' : 'bg-gray-800/80 text-gray-100 rounded-tl-none border border-gray-700'}`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Intelligence Sources:</p>
                        <div className="flex flex-wrap gap-2">
                            {msg.sources.slice(0, 3).map((s, i) => (
                                <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="text-[10px] font-bold bg-black/20 hover:bg-black/40 px-2 py-1 rounded border border-white/5 transition-colors underline-offset-2 hover:underline truncate max-w-[150px]">
                                    {s.title}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex gap-4 animate-fade-in">
               <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-brand-accent">
                 <Bot size={20} className="animate-pulse" />
               </div>
               <div className="bg-gray-800/80 rounded-2xl rounded-tl-none p-5 flex items-center gap-2 border border-gray-700">
                  <div className="w-2 h-2 bg-brand-accent rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-brand-accent rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-brand-accent rounded-full animate-bounce delay-150"></div>
               </div>
             </div>
          )}
        </div>

        <div className="p-6 bg-gray-900/50 border-t border-gray-800">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for trade analysis or roster depth..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-brand-accent outline-none placeholder:text-gray-500 font-bold transition-all focus:bg-gray-700"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="bg-brand-accent text-brand-contrast p-4 rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-brand-accent/20"
            >
              <Send size={24} />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Gemini 3 Pro Strategist Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantCoach;
