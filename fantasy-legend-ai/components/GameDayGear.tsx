
import React, { useState, useEffect } from 'react';
import { TeamConfig, Page, Player } from '../types';
import { generateGear } from '../services/gemini';
import { Loader2, Shirt, Download, Share2, LayoutGrid, Plus, AlertCircle, Palette, User, CheckCircle2, RefreshCw, Sparkles, Eye, EyeOff, Shield, Image as ImageIcon, ChevronRight, CloudSnow, Mic, Zap, Trophy, Type, Car, Plane, Flame, Droplets, Sun, PartyPopper, GalleryVerticalEnd, Settings2, AlignLeft, AlignCenter, AlignRight, ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight, ArrowUp, ArrowDown, Tv } from 'lucide-react';

interface Props {
  team: TeamConfig;
  setPage: (page: Page) => void;
  players: Player[];
}

// Visual presets for different gear types
const POSE_PRESETS: Record<string, { label: string, value: string, color: string }[]> = {
  'Helmet': [
    { label: 'Studio Profile', value: 'Side profile view, studio lighting, dark background', color: '#f8fafc' },
    { label: 'Field Profile', value: 'Side profile view, resting on grass field, stadium background', color: '#4ade80' },
    { label: 'Locker Profile', value: 'Side profile view, sitting on locker room shelf', color: '#94a3b8' },
    { label: 'Rain Profile', value: 'Side profile view, dramatic rain, stadium lights', color: '#38bdf8' },
    { label: 'Held Profile', value: 'Side profile view, being held up by a player', color: '#fbbf24' },
  ],
  'Street Clothes': [
    { label: 'City Walk', value: 'Walking down a busy city street, candid shot', color: '#94a3b8' },
    { label: 'Car Lean', value: 'Leaning against a luxury sports car, looking at camera', color: '#38bdf8' },
    { label: 'Coffee Shop', value: 'Sitting outside a high-end coffee shop with a cup', color: '#fbbf24' },
    { label: 'Phone Candid', value: 'Looking down at a phone, urban background', color: '#f8fafc' },
  ],
  'High Fashion Street Clothes': [
    { label: 'Runway Stride', value: 'Professional runway walk, sharp confident stride', color: '#8b5cf6' },
    { label: 'Met Gala Pose', value: 'Iconic avant-garde pose on a grand staircase', color: '#f472b6' },
    { label: 'Editorial Lean', value: 'Dramatic lean against a textured wall, magazine aesthetic', color: '#f8fafc' },
    { label: 'Luxury Lounge', value: 'Relaxed in a high-fashion velvet lounge chair', color: '#fbbf24' },
  ],
  'Private Jet': [
    { label: 'Runway', value: 'Parked on the tarmac, golden hour lighting, stairs down', color: '#38bdf8' },
    { label: 'In Flight', value: 'Cruising above clouds, sunset reflection', color: '#f8fafc' },
    { label: 'Hangar', value: 'Inside luxury hangar, polished floor reflections', color: '#94a3b8' },
  ],
  'Team Bus': [
    { label: 'Arrival', value: 'Arriving at stadium tunnel, press photographers nearby', color: '#4ade80' },
    { label: 'Highway', value: 'Driving on highway, motion blur background', color: '#fbbf24' },
    { label: 'Parked', value: 'Parked front of stadium, low angle hero shot', color: '#94a3b8' },
  ],
  'Pickup Truck': [
    { label: 'Tailgate', value: 'Parked at tailgate party, bed open', color: '#f87171' },
    { label: 'Off-Road', value: 'Driving through mud/dirt, aggressive angle', color: '#b45309' },
    { label: 'Showroom', value: 'Pristine studio lighting, 3/4 front view', color: '#f8fafc' },
  ],
  'default': [
    { label: 'Touchdown', value: 'Scoring a touchdown celebration, spiking ball', color: '#fbbf24' },
    { label: 'Sprinting', value: 'Sprinting down the sideline, high speed action', color: '#38bdf8' },
    { label: 'Trophy', value: 'Holding the championship trophy, confetti falling', color: '#facc15' },
    { label: 'Interview', value: 'Sitting at a broadcast desk, speaking into a microphone', color: '#38bdf8' },
    { label: 'Juking', value: 'Juking a defender, dynamic pose', color: '#f472b6' },
    { label: 'Stiff Arm', value: 'Delivering a stiff arm to defender', color: '#f87171' },
  ]
};

const GameDayGear: React.FC<Props> = ({ team, setPage, players }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [gearType, setGearType] = useState('Full Uniform');
  const [pose, setPose] = useState('Standing confident, holding helmet');
  const [helmetStyle, setHelmetStyle] = useState('Modern Gloss');
  const [background, setBackground] = useState('Stadium Field');
  
  // Image State
  const [variations, setVariations] = useState<string[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Player Stats State
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('1');
  const [customStat, setCustomStat] = useState('Top Scorer');

  // Overlay State
  const [showStatsOverlay, setShowStatsOverlay] = useState(true);
  const [showTeamName, setShowTeamName] = useState(true);
  const [showTextConfig, setShowTextConfig] = useState(false);
  
  const [teamNameConfig, setTeamNameConfig] = useState({
      font: 'Chakra Petch',
      color: '#ffffff',
      position: 'top-right' as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
  });

  const gearOptions = [
    'Full Uniform', 'Home Jersey', 'Away Jersey', 'Street Clothes', 'High Fashion Street Clothes', 'Helmet', 'Cleats', 'Gloves',
    'Private Jet', 'Team Bus', 'Pickup Truck', 'Limousine', 'Helicopter'
  ];
  const helmetFinishes = ['Modern Gloss', 'Matte Flat', 'Metallic Chrome', 'Carbon Fiber'];
  
  const backgroundOptions = [
      { id: 'Stadium Field', label: 'Stadium', icon: Trophy },
      { id: 'Sports TV Studio', label: 'TV Show', icon: Tv },
      { id: 'Press Conference', label: 'Press Room', icon: Mic },
      { id: 'Luxury Boutique', label: 'Boutique', icon: Zap },
      { id: 'Red Carpet Event', label: 'Red Carpet', icon: Flame },
      { id: 'Concrete Tunnel', label: 'Tunnel Walk', icon: GalleryVerticalEnd },
      { id: 'Championship Confetti', label: 'Championship', icon: PartyPopper },
      { id: 'Golden Hour Sun', label: 'Golden Hour', icon: Sun },
      { id: 'Rain and Mud', label: 'Rain Game', icon: Droplets },
      { id: 'Locker Room', label: 'Locker Room', icon: Shield },
      { id: 'Trading Card Graphic', label: 'Card Art', icon: Zap },
      { id: 'Neon Tunnel', label: 'Neon City', icon: Flame },
      { id: 'Snowy Field', label: 'Snow Game', icon: CloudSnow },
  ];
  
  // Get available presets based on gear type
  const currentPresets = POSE_PRESETS[gearType] || POSE_PRESETS['default'];

  useEffect(() => {
      if (selectedPlayerId) {
          const p = players.find(pl => pl.id === selectedPlayerId);
          if (p) {
              const lastName = p.name.split(' ').pop() || p.name;
              setCustomName(lastName.toUpperCase());
              setCustomNumber(Math.floor(Math.random() * 99 + 1).toString());
              
              let stat = 'All-Pro';
              const pos = p.position.toUpperCase();
              if (pos.includes('QB')) stat = '300 Yds / 3 TDs';
              else if (pos.includes('RB')) stat = '120 Yds / 2 TDs';
              else if (pos.includes('WR')) stat = '10 Rec / 150 Yds';
              else if (pos.includes('TE')) stat = 'Red Zone Threat';
              else if (pos.includes('DEF') || pos.includes('DST')) stat = 'Shutout w/ 5 Sacks';
              else if (pos.includes('K')) stat = '55 Yd Game Winner';
              
              setCustomStat(stat);
          }
      } else {
          setCustomName('');
          setCustomNumber('1');
          setCustomStat('');
      }
  }, [selectedPlayerId, players]);

  // Reset pose when gear type changes to the first relevant preset
  useEffect(() => {
      const presets = POSE_PRESETS[gearType] || POSE_PRESETS['default'];
      if (presets && presets.length > 0) {
          setPose(presets[0].value);
      }
  }, [gearType]);

  const handleGenerate = async () => {
    if (!team.logoUrl) return;
    setLoading(true);
    setStatus('Analyzing team colors & designing gear...');
    
    try {
      const playerInfo = customName ? {
          name: customName,
          number: customNumber,
          stat: customStat
      } : undefined;

      const resultImages = await generateGear(
          team.logoUrl, 
          gearType, 
          pose, 
          team.colors, 
          playerInfo,
          gearType === 'Helmet' ? helmetStyle : undefined,
          background
      );
      
      if (resultImages.length > 0) {
        setGeneratedImage(resultImages[0]);
        setVariations(resultImages);
        setShowStatsOverlay(true);
        setShowTeamName(true);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate gear. Please try again.");
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleShare = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const file = new File([blob], 'fantasy-gear.png', { type: 'image/png' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Fantasy Gear',
          text: `Check out this generated ${gearType} for ${team.name}! #FantasyLegendAI`,
          files: [file]
        });
      } else {
         const item = new ClipboardItem({ 'image/png': blob });
         await navigator.clipboard.write([item]);
         alert('Image copied to clipboard!');
      }
    } catch (e) {
      console.error('Sharing failed', e);
      alert('Could not share image automatically. Use the download button.');
    }
  };

  const getPositionClass = (pos: string) => {
      switch(pos) {
          case 'top-left': return 'top-8 left-8 text-left';
          case 'top-right': return 'top-8 right-8 text-right';
          case 'bottom-left': return 'bottom-8 left-8 text-left';
          case 'bottom-right': return 'bottom-8 right-8 text-right';
          case 'top-center': return 'top-8 left-1/2 -translate-x-1/2 text-center';
          case 'bottom-center': return 'bottom-8 left-1/2 -translate-x-1/2 text-center';
          default: return 'top-8 right-8 text-right';
      }
  };

  if (!team.logoUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-brand-card rounded-xl border border-gray-700 text-center p-10">
        <AlertCircle size={64} className="text-red-500 mb-6" />
        <h2 className="text-3xl font-bold mb-4">Team Logo Required</h2>
        <p className="text-gray-400 max-w-md mb-8">You need to establish your team identity before creating gear. Go to Team HQ to generate or upload a logo.</p>
        <button 
          onClick={() => setPage(Page.BRANDING)}
          className="bg-brand-highlight text-black font-bold py-3 px-8 rounded-full hover:bg-white transition-all"
        >
          Go to Team HQ
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      {/* Left Sidebar: Controls */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-brand-card p-6 rounded-xl border border-gray-700">
           <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="text-brand-highlight" />
              Gear Studio
           </h2>

           {/* Player Selection */}
           {['Private Jet', 'Team Bus', 'Pickup Truck', 'Limousine', 'Helicopter'].includes(gearType) ? (
             <div className="mb-6 bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex items-center gap-3 text-gray-400">
                <Plane size={24} />
                <span className="text-sm font-bold uppercase tracking-widest">Vehicle Customization Mode</span>
             </div>
           ) : (
              <div className="mb-6 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <User size={14} />
                      Featured Player
                  </label>
                  <select 
                      value={selectedPlayerId}
                      onChange={(e) => setSelectedPlayerId(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm text-white mb-3 outline-none focus:border-brand-highlight font-bold"
                  >
                      <option value="">-- Manual Config --</option>
                      {players.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.position})</option>
                      ))}
                  </select>
                  
                  <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                          <input 
                              placeholder="Name" 
                              value={customName}
                              onChange={(e) => setCustomName(e.target.value)}
                              className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-xs text-white outline-none font-bold"
                          />
                      </div>
                      <div>
                          <input 
                              placeholder="#" 
                              type="number"
                              value={customNumber}
                              onChange={(e) => setCustomNumber(e.target.value)}
                              className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-xs text-white outline-none text-center font-bold"
                          />
                      </div>
                  </div>
                  <div className="mt-2">
                      <input 
                          placeholder="Headline (e.g. '15 TDs This Season')" 
                          value={customStat}
                          onChange={(e) => setCustomStat(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-xs text-white outline-none font-bold"
                      />
                  </div>
              </div>
           )}

           <div className="space-y-4">
             <div>
               <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Select Gear / Outfit</label>
               <div className="grid grid-cols-2 gap-2">
                 {gearOptions.map(opt => (
                   <button
                     key={opt}
                     onClick={() => setGearType(opt)}
                     className={`px-3 py-2 rounded-lg text-[10px] font-black transition-all border uppercase tracking-tighter ${
                       gearType === opt 
                         ? 'bg-brand-highlight text-black border-brand-highlight' 
                         : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                     }`}
                   >
                     {opt}
                   </button>
                 ))}
               </div>
             </div>
             
             {gearType === 'Helmet' && (
                <div className="animate-fade-in bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                   <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <Shield size={14} />
                       Shell Finish
                   </label>
                   <div className="grid grid-cols-2 gap-2">
                       {helmetFinishes.map(finish => (
                           <button
                               key={finish}
                               onClick={() => setHelmetStyle(finish)}
                               className={`text-[10px] py-2 px-2 rounded transition-colors border font-black uppercase ${helmetStyle === finish ? 'bg-brand-accent text-brand-contrast border-brand-accent shadow-sm' : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-700'}`}
                           >
                               {finish}
                           </button>
                       ))}
                   </div>
                </div>
             )}

             <div>
                 <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Environment</label>
                 <div className="flex flex-wrap gap-2">
                     {backgroundOptions.map(bg => {
                         const Icon = bg.icon;
                         return (
                             <button
                                 key={bg.id}
                                 onClick={() => setBackground(bg.id)}
                                 className={`px-3 py-2 rounded-lg text-[10px] flex items-center gap-2 border transition-all font-black uppercase tracking-tighter ${background === bg.id ? 'bg-brand-highlight/20 text-brand-highlight border-brand-highlight' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'}`}
                             >
                                 <Icon size={14} />
                                 {bg.label}
                             </button>
                         )
                     })}
                 </div>
             </div>

             <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Pose & Character</label>
                <div className="flex gap-3 overflow-x-auto pb-3 mb-2 scrollbar-thin snap-x snap-mandatory">
                   {currentPresets.map((preset, i) => {
                       const isSelected = pose === preset.value;
                       return (
                           <button 
                             key={i} 
                             onClick={() => setPose(preset.value)}
                             className={`relative shrink-0 w-32 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all snap-start group ${isSelected ? 'border-brand-highlight ring-2 ring-brand-highlight/50' : 'border-gray-700 hover:border-gray-500'}`}
                           >
                               <div className="absolute inset-0" style={{ backgroundColor: '#1e293b' }}>
                                   <div className="w-full h-full opacity-30" style={{ 
                                       background: `linear-gradient(135deg, ${preset.color} 0%, transparent 100%)`
                                   }}></div>
                               </div>
                               <div className="absolute inset-x-0 bottom-0 bg-black/80 p-2 backdrop-blur-sm">
                                   <span className={`text-[9px] font-black block truncate uppercase tracking-tighter ${isSelected ? 'text-brand-highlight' : 'text-white'}`}>
                                       {preset.label}
                                   </span>
                               </div>
                               {isSelected && (
                                   <div className="absolute top-2 right-2 bg-brand-highlight rounded-full p-0.5">
                                       <CheckCircle2 size={12} className="text-black" />
                                   </div>
                               )}
                           </button>
                       )
                   })}
                </div>
                <textarea
                  value={pose}
                  onChange={(e) => setPose(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-highlight outline-none text-[10px] font-bold min-h-[60px]"
                  placeholder="Describe a custom scene or pose..."
                />
             </div>

             <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-brand-accent hover:opacity-90 text-brand-contrast font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-brand-accent/20 disabled:opacity-50 uppercase tracking-widest text-sm"
             >
                {loading ? <Loader2 className="animate-spin" /> : <LayoutGrid size={20} />}
                {loading ? 'Designing...' : 'Generate 3 Variations'}
             </button>
           </div>
        </div>
      </div>

      {/* Right: Preview & Gallery */}
      <div className="lg:col-span-8 flex flex-col">
         <div className="bg-black/50 rounded-xl border border-gray-700 overflow-hidden flex-1 relative group min-h-[500px] shadow-2xl">
            {generatedImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                    <img src={generatedImage} alt="Generated Gear" className="w-full h-full object-contain bg-[#0a0f19] animate-fade-in" />
                    
                    {/* Team Name Overlay with Custom Styles */}
                    {showTeamName && team.name && (
                        <div className={`absolute z-10 pointer-events-none transition-all duration-500 ${getPositionClass(teamNameConfig.position)}`}>
                            <div 
                                className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.9)] animate-slide-right"
                                style={{ 
                                    fontFamily: teamNameConfig.font, 
                                    color: teamNameConfig.color,
                                    textShadow: `0 0 20px rgba(0,0,0,0.5), 2px 2px 0px ${team.colors?.secondary || '#ff00ff'}` 
                                }}
                            >
                                {team.name}
                            </div>
                            <div 
                                className={`h-2 w-32 mt-3 shadow-xl animate-reveal ${
                                    teamNameConfig.position.includes('right') ? 'ml-auto' : 
                                    teamNameConfig.position.includes('center') ? 'mx-auto' : 'mr-auto'
                                }`} 
                                style={{ backgroundColor: team.colors?.secondary || '#ff00ff' }}
                            ></div>
                        </div>
                    )}

                    {/* Holographic Stats Overlay */}
                    {showStatsOverlay && customName && !['Private Jet', 'Team Bus', 'Pickup Truck', 'Limousine', 'Helicopter'].includes(gearType) && (
                        <div className="absolute bottom-10 left-10 z-10 pointer-events-none font-['Chakra_Petch'] animate-fade-in">
                            <div className="h-1.5 bg-brand-accent w-24 mb-3 animate-reveal shadow-[0_0_15px_rgba(var(--color-brand-accent),0.6)]"></div>
                            <div className="flex items-end gap-5">
                                <div className="text-9xl font-black text-white leading-none italic opacity-0 animate-slide-up drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                                    {customNumber}
                                </div>
                                <div className="pb-3">
                                    <div className="text-4xl font-black text-brand-accent uppercase tracking-tighter opacity-0 animate-slide-right delay-100 drop-shadow-xl italic">
                                        {customName}
                                    </div>
                                    {customStat && (
                                        <div className="flex items-center gap-3 opacity-0 animate-slide-right delay-200 mt-1">
                                            <div className="bg-brand-highlight text-black text-[10px] font-black px-2 py-1 rounded shadow-lg animate-pulse uppercase tracking-widest">
                                                Elite Performance
                                            </div>
                                            <div className="text-2xl text-gray-100 font-black tracking-tight drop-shadow-lg uppercase italic">
                                                {customStat}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="absolute -top-12 left-0 w-full h-full opacity-40 animate-float pointer-events-none">
                                <Sparkles className="text-brand-accent w-8 h-8 absolute -top-4 left-16" />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                    <div className="bg-gray-800/50 p-10 rounded-full mb-6 border border-gray-700">
                        {['Private Jet', 'Team Bus', 'Pickup Truck', 'Limousine', 'Helicopter'].includes(gearType) ? (
                            <Car size={80} className="opacity-20" />
                        ) : (
                            <Shirt size={80} className="opacity-20" />
                        )}
                    </div>
                    <p className="text-xl font-black uppercase tracking-widest opacity-30 italic">Design Studio Preview</p>
                    <p className="text-[10px] opacity-20 mt-2 font-bold uppercase tracking-widest">Select variations to apply overlays</p>
                </div>
            )}

            {loading && (
                <div className="absolute inset-0 bg-black/90 z-20 flex flex-col items-center justify-center">
                    <div className="relative mb-6">
                        <Loader2 size={64} className="text-brand-accent animate-spin" />
                        <Sparkles size={24} className="text-brand-highlight absolute -top-2 -right-2 animate-pulse" />
                    </div>
                    <p className="text-brand-accent font-black text-2xl animate-pulse tracking-tighter italic uppercase">{status}</p>
                    <p className="text-gray-500 text-[10px] mt-4 font-mono uppercase tracking-[0.4em]">Rendering Hi-Res Assets...</p>
                </div>
            )}

            {/* Text Configuration Panel */}
            {showTextConfig && showTeamName && (
                <div className="absolute top-20 right-6 z-30 bg-gray-900/95 backdrop-blur-xl p-5 rounded-2xl border border-gray-700 w-72 shadow-2xl animate-fade-in space-y-5">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2 border-b border-gray-800 pb-2">
                        <Settings2 size={14} className="text-brand-accent" /> Overlay Engine
                    </h3>
                    
                    <div>
                        <label className="text-[10px] font-black text-gray-600 mb-2 block uppercase tracking-widest">Anchor Position</label>
                        <div className="grid grid-cols-3 gap-1.5">
                            {(['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const).map(pos => {
                                const active = teamNameConfig.position === pos;
                                return (
                                    <button 
                                        key={pos}
                                        onClick={() => setTeamNameConfig({...teamNameConfig, position: pos})} 
                                        className={`p-2 rounded-lg flex justify-center border transition-all ${active ? 'bg-brand-accent text-brand-contrast border-brand-accent shadow-lg' : 'bg-gray-800 text-gray-500 border-gray-700'}`}
                                    >
                                        {pos === 'top-left' && <ArrowUpLeft size={18} />}
                                        {pos === 'top-center' && <ArrowUp size={18} />}
                                        {pos === 'top-right' && <ArrowUpRight size={18} />}
                                        {pos === 'bottom-left' && <ArrowDownLeft size={18} />}
                                        {pos === 'bottom-center' && <ArrowDown size={18} />}
                                        {pos === 'bottom-right' && <ArrowDownRight size={18} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-600 mb-2 block uppercase tracking-widest">Palette</label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                '#ffffff', 
                                '#000000', 
                                team.colors?.primary || '#00F3FF', 
                                team.colors?.secondary || '#FF00FF', 
                                '#FACC15'
                            ].map(c => (
                                <button
                                    key={c}
                                    onClick={() => setTeamNameConfig({...teamNameConfig, color: c})}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${teamNameConfig.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                ></button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-600 mb-2 block uppercase tracking-widest">Typography</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Chakra Petch', 'Inter', 'Staatliches', 'Kanit', 'Bebas Neue'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setTeamNameConfig({...teamNameConfig, font: f})}
                                    className={`px-3 py-2 rounded-lg text-xs truncate border transition-all font-black uppercase tracking-tighter ${teamNameConfig.font === f ? 'bg-brand-highlight/20 border-brand-highlight text-brand-highlight' : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-white'}`}
                                    style={{ fontFamily: f }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {generatedImage && !loading && (
                <div className="absolute top-6 right-6 flex gap-3 z-20">
                     <button
                        onClick={() => setShowTeamName(!showTeamName)}
                        className={`p-3 rounded-full backdrop-blur-xl transition-all shadow-lg ${showTeamName ? 'bg-brand-accent text-brand-contrast' : 'bg-black/60 text-white hover:bg-gray-800'}`}
                        title="Branding Overlay"
                    >
                        <Type size={20} />
                    </button>
                    {showTeamName && (
                        <button
                            onClick={() => setShowTextConfig(!showTextConfig)}
                            className={`p-3 rounded-full backdrop-blur-xl transition-all shadow-lg ${showTextConfig ? 'bg-brand-highlight text-black' : 'bg-black/60 text-white hover:bg-gray-800'}`}
                            title="Overlay Settings"
                        >
                            <Settings2 size={20} />
                        </button>
                    )}
                     <button
                        onClick={() => setShowStatsOverlay(!showStatsOverlay)}
                        className={`p-3 rounded-full backdrop-blur-xl transition-all shadow-lg ${showStatsOverlay ? 'bg-brand-highlight text-black' : 'bg-black/60 text-white hover:bg-gray-800'}`}
                        title="Player Stats HUD"
                    >
                        {showStatsOverlay ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                    <button 
                      onClick={handleShare}
                      className="p-3 bg-black/60 hover:bg-white hover:text-black text-white rounded-full backdrop-blur-xl transition-all shadow-lg"
                      title="Share to Social"
                    >
                        <Share2 size={20} />
                    </button>
                    <a 
                      href={generatedImage} 
                      download={`${team.name}-gear.png`}
                      className="p-3 bg-black/60 hover:bg-white hover:text-black text-white rounded-full backdrop-blur-xl transition-all shadow-lg"
                      title="Download Hi-Res"
                    >
                        <Download size={20} />
                    </a>
                </div>
            )}
         </div>

         {/* Variations & Gallery */}
         {variations.length > 0 && (
             <div className="mt-8">
                 <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <RefreshCw size={14} className="text-brand-highlight" />
                    Generated Mockups
                 </h3>
                 <div className="grid grid-cols-3 gap-6">
                     {variations.map((img, idx) => (
                         <div 
                            key={idx} 
                            onClick={() => setGeneratedImage(img)}
                            className={`relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-[1.02] shadow-xl ${generatedImage === img ? 'border-brand-accent ring-4 ring-brand-accent/20' : 'border-gray-800 hover:border-gray-600'}`}
                         >
                             <img src={img} alt={`Variation ${idx}`} className="w-full h-full object-cover" />
                             {generatedImage === img && (
                                 <div className="absolute inset-0 bg-brand-accent/20 flex items-center justify-center backdrop-blur-[1px]">
                                     <div className="bg-brand-accent p-2 rounded-full shadow-lg">
                                        <CheckCircle2 className="text-brand-contrast" size={20} />
                                     </div>
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};

export default GameDayGear;
