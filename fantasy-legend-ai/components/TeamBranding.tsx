import React, { useState, useRef, useEffect } from 'react';
import { TeamConfig } from '../types';
import { generateTeamLogo, analyzeLogoColors } from '../services/gemini';
import { Loader2, Wand2, Image as ImageIcon, Check, Eraser, Palette, Sparkles, Upload, AlertCircle, RefreshCw, Zap, Moon, Sun } from 'lucide-react';

interface Props {
  team: TeamConfig;
  setTeam: (t: TeamConfig) => void;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
}

const TeamBranding: React.FC<Props> = ({ team, setTeam, isDarkMode, setIsDarkMode }) => {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState('');
  const [prompt, setPrompt] = useState('A futuristic geometric trophy made of glowing neon cyan and magenta glass. Synthwave aesthetic, dark futuristic city background, digital art.');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3'>('1:1');
  const [transparentBg, setTransparentBg] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hex2rgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 243, b: 255 };
  };

  /**
   * Checks if a color is too dark for a dark background and boosts it if necessary.
   */
  const ensureVisible = (rgb: {r: number, g: number, b: number}) => {
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    // If brightness is lower than ~50 (on 0-255 scale), it's too close to the background color.
    if (brightness < 50) {
      // Boost to a visible gray/color
      return {
        r: Math.max(rgb.r, 120),
        g: Math.max(rgb.g, 120),
        b: Math.max(rgb.b, 120)
      };
    }
    return rgb;
  };

  const applyThemeToUI = (branding: { primary: string, secondary: string, font: string }) => {
    const root = document.documentElement;
    
    // Sanitize colors: Ensure they aren't black or too dark to see on dark backgrounds
    const rawPrimary = hex2rgb(branding.primary);
    const rawSecondary = hex2rgb(branding.secondary);
    
    const primary = ensureVisible(rawPrimary);
    const secondary = ensureVisible(rawSecondary);

    root.style.setProperty('--color-brand-accent', `${primary.r} ${primary.g} ${primary.b}`);
    root.style.setProperty('--color-brand-highlight', `${secondary.r} ${secondary.g} ${secondary.b}`);
    root.style.setProperty('--font-primary', branding.font);

    const brightness = Math.round(((primary.r * 299) + (primary.g * 587) + (primary.b * 114)) / 1000);
    const contrastColor = brightness > 125 ? '0 0 0' : '255 255 255';
    root.style.setProperty('--color-brand-contrast-text', contrastColor);

    setTeam({
      ...team,
      colors: {
        primary: `rgb(${primary.r}, ${primary.g}, ${primary.b})`,
        secondary: `rgb(${secondary.r}, ${secondary.g}, ${secondary.b})`
      }
    });
  };

  const handleSyncWithLogo = async () => {
    if (!team.logoUrl) return;
    setSyncing(true);
    setError(null);
    try {
      const branding = await analyzeLogoColors(team.logoUrl);
      applyThemeToUI(branding);
    } catch (e) {
      console.error(e);
      setError("Failed to extract branding from logo.");
    } finally {
      setSyncing(false);
    }
  };

  const handleGenerateLogo = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setStatus('Initializing Imagen 4 Engine...');
    
    const transparencyInstruction = transparentBg 
      ? " isolated on a transparent background, vector style, die-cut sticker, clean edges, no background" 
      : "";
    const finalPrompt = `${team.name} fantasy football logo. ${prompt}${transparencyInstruction}`;

    try {
      const url = await generateTeamLogo(finalPrompt, aspectRatio);
      setTeam({ ...team, logoUrl: url, logoPrompt: prompt });
    } catch (e: any) {
      console.error(e);
      setError("Logo generation failed. Please try a different concept.");
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setTeam({ ...team, logoUrl: reader.result as string }); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-400 animate-fade-in">
          <AlertCircle size={20} />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-brand-card p-6 rounded-xl border border-gray-700 shadow-lg">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-2 uppercase italic tracking-tighter">
              <Wand2 className="text-brand-accent" />
              Logo Architect
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Franchise Name</label>
                <input 
                  type="text" 
                  value={team.name}
                  onChange={(e) => setTeam({...team, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-brand-text focus:ring-2 focus:ring-brand-highlight outline-none font-bold"
                  placeholder="e.g. Gridiron Gladiators"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Visual Direction</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-brand-text focus:ring-2 focus:ring-brand-highlight outline-none text-sm leading-relaxed"
                  rows={3}
                  placeholder="Describe your mascot, shield, or branding style..."
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Canvas Ratio</label>
                  <div className="flex items-center bg-gray-800 rounded-lg p-1 w-fit border border-gray-700">
                    {['1:1', '16:9', '4:3'].map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio as any)}
                        className={`px-4 py-1 rounded text-[10px] font-black ${aspectRatio === ratio ? 'bg-brand-highlight text-black' : 'text-gray-400 hover:text-brand-text'}`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>
                 
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Composition</label>
                  <button 
                    onClick={() => setTransparentBg(!transparentBg)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-2 border transition-all ${transparentBg ? 'bg-brand-highlight/20 border-brand-highlight text-brand-highlight' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}
                  >
                    <Eraser size={12} />
                    {transparentBg ? 'CUTOUT MODE' : 'SOLID BACKGROUND'}
                  </button>
                </div>
              </div>

              <button 
                onClick={handleGenerateLogo}
                disabled={loading || !prompt}
                className="w-full bg-brand-accent hover:opacity-90 text-brand-contrast font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-brand-accent/20 disabled:opacity-50 text-sm uppercase tracking-widest"
              >
                {loading ? <Loader2 className="animate-spin" /> : <ImageIcon size={20} />}
                {loading ? 'RENDERING...' : 'GENERATE WITH IMAGEN 4'}
              </button>
              
              <p className="text-[10px] text-gray-600 italic text-center font-bold">
                PRO TIP: High-fidelity Imagen 4 model used for all designs.
              </p>
            </div>
          </div>

          <div className="bg-brand-card p-6 rounded-xl border border-gray-700 flex flex-col gap-6 shadow-lg">
            <div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-700 pb-2 mb-4">Visual Mode</h3>
              <div className="flex items-center justify-between p-2 bg-gray-900 rounded-2xl border border-gray-700">
                <button 
                  onClick={() => setIsDarkMode(true)}
                  className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl transition-all font-black uppercase text-xs tracking-widest ${isDarkMode ? 'bg-brand-dark text-brand-accent shadow-xl border border-brand-accent/30' : 'text-gray-500 hover:text-white'}`}
                >
                  <Moon size={18} />
                  Night Mode
                </button>
                <button 
                  onClick={() => setIsDarkMode(false)}
                  className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl transition-all font-black uppercase text-xs tracking-widest ${!isDarkMode ? 'bg-brand-highlight text-white shadow-xl border border-white/30' : 'text-gray-500 hover:text-white'}`}
                >
                  <Sun size={18} />
                  Day Mode
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-700 pb-2 mb-4">Franchise Utilities</h3>
              <div className="flex gap-4 mb-4">
                  <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-brand-text font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs border border-gray-700"
                  >
                  <Upload size={16} />
                  UPLOAD LOGO
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
              
              <button 
                  onClick={handleSyncWithLogo}
                  disabled={!team.logoUrl || syncing}
                  className="w-full bg-gradient-to-r from-brand-accent to-brand-highlight text-brand-contrast font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-brand-accent/20 disabled:opacity-50 disabled:grayscale uppercase tracking-widest text-sm"
              >
                  {syncing ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
                  {syncing ? 'EXTRACTING IDENTITY...' : 'SYNC THEME WITH LOGO'}
              </button>
            </div>
            
            <div className="flex items-center gap-2 justify-center opacity-60">
              <div className="h-px bg-gray-700 flex-1"></div>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Dynamic UI Skinning</p>
              <div className="h-px bg-gray-700 flex-1"></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-black/50 rounded-xl overflow-hidden border border-gray-700 min-h-[400px] flex items-center justify-center relative shadow-2xl">
            {team.logoUrl ? (
              <div className="w-full h-full relative" style={{
                backgroundImage: 'linear-gradient(45deg, #0a0f19 25%, transparent 25%), linear-gradient(-45deg, #0a0f19 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #0a0f19 75%), linear-gradient(-45deg, transparent 75%, #0a0f19 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }}>
                <img src={team.logoUrl} alt="Team Logo" className="w-full h-full object-contain max-h-[550px] relative z-10 p-12 drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
              </div>
            ) : (
              <div className="text-gray-700 flex flex-col items-center">
                <div className="bg-gray-800/50 p-8 rounded-full mb-4 border border-gray-700">
                  <ImageIcon size={64} className="opacity-20" />
                </div>
                <p className="text-lg font-black uppercase italic tracking-widest opacity-30">Identity Preview</p>
                <p className="text-[10px] opacity-20 mt-2 font-bold uppercase tracking-widest">Logo required for gear generation</p>
              </div>
            )}
            
            {loading && (
              <div className="absolute inset-0 bg-black/90 z-20 flex flex-col items-center justify-center">
                <div className="relative">
                  <Loader2 size={80} className="text-brand-accent animate-spin mb-6" />
                  <Sparkles size={24} className="text-brand-highlight absolute -top-2 -right-2 animate-pulse" />
                </div>
                <p className="text-brand-highlight font-black tracking-tighter text-2xl uppercase italic animate-pulse">{status}</p>
                <p className="text-gray-600 text-[10px] mt-4 font-mono uppercase tracking-[0.3em]">Imagen 4.0 Pro Engine Active</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamBranding;