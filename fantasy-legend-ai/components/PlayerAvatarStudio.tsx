
import React, { useState, useRef } from 'react';
import { TeamConfig } from '../types';
import { generateAvatarAngles } from '../services/gemini';
import { Loader2, Camera, Upload, Lock, RefreshCw, Shield, CheckCircle2, MoveHorizontal, Briefcase, User, Trophy, Sparkles } from 'lucide-react';

interface Props {
  team: TeamConfig;
}

const PlayerAvatarStudio: React.FC<Props> = ({ team }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [role, setRole] = useState<'Player' | 'Coach' | 'Executive'>('Player');
  const [helmetOn, setHelmetOn] = useState(true);
  const [rotationIndex, setRotationIndex] = useState(0); // 0: Front, 1: Right, 2: Back, 3: Left
  const [generatedFrames, setGeneratedFrames] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
       setUserImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!userImage) return;
    setLoading(true);
    setGeneratedFrames([]);
    setRotationIndex(0);

    try {
      const frames = await generateAvatarAngles(userImage, team.logoUrl, helmetOn, team.colors, role);
      setGeneratedFrames(frames);
    } catch (e) {
      console.error(e);
      alert("Failed to generate avatar. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isPremium) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-brand-card rounded-xl border border-gray-700 p-10 text-center animate-fade-in relative overflow-hidden min-h-[600px]">
           <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center"></div>
           
           <div className="relative z-10 flex flex-col items-center">
                <div className="bg-gray-800 p-6 rounded-full mb-6 border border-gray-600 shadow-[0_0_30px_rgba(var(--color-brand-accent),0.3)]">
                    <Camera size={48} className="text-brand-accent" />
                </div>
                <h2 className="text-5xl font-black text-white mb-2 tracking-tighter italic uppercase">AVATAR STUDIO</h2>
                <p className="text-brand-accent font-black uppercase tracking-[0.2em] text-sm mb-8">Be In The Game</p>
                
                <div className="max-w-md space-y-4 mb-10">
                    <p className="text-gray-300 leading-relaxed text-lg">
                        Step into the digital gridiron. Transform your face into a <span className="text-white font-bold">Madden-Style</span> professional avatar.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-left">
                        <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700 flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-brand-accent" /> 3D Face Mapping
                        </div>
                        <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700 flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-brand-accent" /> 360° Animation
                        </div>
                        <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700 flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-brand-accent" /> Coach & Executive Roles
                        </div>
                        <div className="bg-gray-900/80 p-3 rounded-xl border border-gray-700 flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-brand-accent" /> Full Team Branding
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => setIsPremium(true)} 
                    className="bg-brand-accent hover:opacity-90 text-brand-contrast font-black py-5 px-16 rounded-full hover:scale-105 transition-all shadow-xl shadow-brand-accent/20 flex items-center gap-3 text-lg"
                >
                    <Lock size={20} /> UNLOCK AVATAR STUDIO
                </button>
           </div>
        </div>
      )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[700px]">
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-brand-card p-6 rounded-xl border border-gray-700 shadow-lg">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                   <Camera className="text-brand-accent" />
                   Face Scan Center
                </h2>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">1. Biometric Source</label>
                        <div 
                           onClick={() => fileInputRef.current?.click()}
                           className={`border-2 border-dashed rounded-2xl h-56 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${userImage ? 'border-brand-accent' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800'}`}
                        >
                            {userImage ? (
                                <div className="relative w-full h-full">
                                    <img src={userImage} alt="Scan Source" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <RefreshCw size={32} className="text-white" />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-6">
                                    <Upload className="text-gray-500 mb-3 mx-auto" size={40} />
                                    <span className="text-gray-400 text-sm font-bold block">Upload Face Selfie</span>
                                    <span className="text-gray-600 text-[10px] mt-1 uppercase">Front view, bright lighting</span>
                                </div>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">2. Select Your Career Path</label>
                        <div className="grid grid-cols-3 gap-2">
                             <button 
                                onClick={() => setRole('Player')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all group ${role === 'Player' ? 'bg-brand-accent text-brand-contrast border-brand-accent font-bold scale-[1.05] shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}
                             >
                                <User size={24} className={role === 'Player' ? 'text-brand-contrast' : 'text-gray-500'} />
                                <span className="text-[10px] uppercase font-black">Player</span>
                             </button>
                             <button 
                                onClick={() => setRole('Coach')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all group ${role === 'Coach' ? 'bg-brand-accent text-brand-contrast border-brand-accent font-bold scale-[1.05] shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}
                             >
                                <Briefcase size={24} className={role === 'Coach' ? 'text-brand-contrast' : 'text-gray-500'} />
                                <span className="text-[10px] uppercase font-black">Coach</span>
                             </button>
                             <button 
                                onClick={() => setRole('Executive')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all group ${role === 'Executive' ? 'bg-brand-accent text-brand-contrast border-brand-accent font-bold scale-[1.05] shadow-lg' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}
                             >
                                <Trophy size={24} className={role === 'Executive' ? 'text-brand-contrast' : 'text-gray-500'} />
                                <span className="text-[10px] uppercase font-black">GM</span>
                             </button>
                        </div>
                    </div>

                    {role === 'Player' && (
                        <div className="space-y-2 animate-fade-in p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Player Customization</label>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setHelmetOn(true)}
                                    className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all text-xs font-bold ${helmetOn ? 'bg-brand-accent text-brand-contrast border-brand-accent' : 'bg-gray-900 border-gray-700 text-gray-500'}`}
                                >
                                    <Shield size={14} /> Helmet
                                </button>
                                <button 
                                    onClick={() => setHelmetOn(false)}
                                    className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all text-xs font-bold ${!helmetOn ? 'bg-brand-accent text-brand-contrast border-brand-accent' : 'bg-gray-900 border-gray-700 text-gray-500'}`}
                                >
                                    Face Only
                                </button>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={handleGenerate}
                        disabled={!userImage || loading}
                        className="w-full bg-gradient-to-r from-brand-accent to-brand-highlight text-brand-contrast font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-brand-accent/20 disabled:opacity-50 disabled:grayscale mt-2 active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                        {loading ? 'Analyzing Features...' : `Generate ${role} Avatar`}
                    </button>
                </div>
            </div>
        </div>

        <div className="lg:col-span-8">
             <div className="bg-black rounded-2xl border border-gray-700 h-full relative overflow-hidden flex flex-col shadow-2xl">
                 <div className="flex-1 relative flex items-center justify-center bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#000000_100%)]">
                     {loading ? (
                         <div className="text-center relative z-10">
                             <div className="relative mb-6">
                                <Loader2 size={80} className="text-brand-accent animate-spin mx-auto" />
                                <Sparkles size={24} className="text-brand-highlight absolute -top-2 -right-2 animate-pulse" />
                             </div>
                             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Synthesizing 3D Avatar</h3>
                             <p className="text-gray-500 text-sm mt-2 font-mono uppercase tracking-widest">Applying {role} Textures & Shaders</p>
                         </div>
                     ) : generatedFrames.length > 0 ? (
                         <div className="relative w-full h-full flex items-center justify-center p-8">
                             <img 
                                src={generatedFrames[rotationIndex]} 
                                alt="Avatar Angle" 
                                className="max-h-full max-w-full object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-fade-in"
                             />
                             
                             <div className="absolute bottom-12 inset-x-12 z-10 max-w-xl mx-auto">
                                 <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 flex flex-col gap-4 shadow-2xl">
                                     <div className="flex justify-between items-center text-[10px] font-black text-brand-accent uppercase tracking-[0.2em]">
                                         <span>Interactive Preview</span>
                                         <span>{rotationIndex === 0 ? 'Front' : rotationIndex === 1 ? 'Right' : rotationIndex === 2 ? 'Back' : 'Left'} Profile</span>
                                     </div>
                                     <div className="flex items-center gap-4">
                                         <MoveHorizontal className="text-gray-500 shrink-0" size={20} />
                                         <input 
                                            type="range" 
                                            min="0" 
                                            max={generatedFrames.length - 1} 
                                            step="1"
                                            value={rotationIndex}
                                            onChange={(e) => setRotationIndex(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                                         />
                                     </div>
                                 </div>
                                 <p className="text-center text-[10px] text-gray-500 mt-4 font-black uppercase tracking-[0.3em] italic">360° Game Model Rotator</p>
                             </div>
                         </div>
                     ) : (
                         <div className="text-center opacity-10">
                             <Camera size={120} className="mx-auto mb-6" />
                             <p className="text-4xl font-black uppercase tracking-tighter italic">Source Required</p>
                         </div>
                     )}

                     {/* Grid Overlay for aesthetic */}
                     <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                 </div>
             </div>
        </div>
    </div>
  );
};

export default PlayerAvatarStudio;
