
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Phone, Heart, Star, Sparkles, MessageCircle, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppState, FriendshipMessage } from './types';
import { generateFriendshipMessage } from './services/geminiService';
import { FloatingHearts } from './components/FloatingHearts';

const NO_BUTTON_MESSAGES = [
  "No?",
  "Are you sure?",
  "Think again! 🥺",
  "Pwease?",
  "Don't be mean!",
  "I'll cry... 😭",
  "Seriously? :(",
  "Last chance!",
  "Fine, but Yes is better!",
  "You're breaking my heart!"
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.ASKING);
  const [noCount, setNoCount] = useState(0);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const [friendshipData, setFriendshipData] = useState<FriendshipMessage | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Trigger audio playback when the state changes to CELEBRATING
  useEffect(() => {
    if (state === AppState.CELEBRATING) {
      if (audioRef.current) {
        audioRef.current.play().catch(err => {
          console.warn("Audio playback failed. Please ensure 'one-call-away.mp3' exists in the root folder.", err);
        });
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [state]);

  // Sync mute state with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleNoHover = useCallback(() => {
    if (state !== AppState.ASKING) return;
    
    setNoCount(prev => prev + 1);
    
    // Move the button to a random position within the viewport
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);
    
    setNoButtonPos({ x, y });
  }, [state]);

  const handleYes = async () => {
    setState(AppState.CELEBRATING);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff69b4', '#ff1493', '#ffc0cb', '#ffd700']
    });

    setLoading(true);
    try {
      const data = await generateFriendshipMessage();
      setFriendshipData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setState(AppState.ASKING);
    setNoCount(0);
    setNoButtonPos({ x: 0, y: 0 });
    setFriendshipData(null);
    setIsMuted(false);
  };

  const yesButtonSize = 1 + (noCount * 0.2);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-blue-50 overflow-hidden">
      <FloatingHearts />

      {/* HTML5 Audio element - Rename your MP3 to 'one-call-away.mp3' and place it in the project root. */}
      <audio 
        ref={audioRef} 
        src="one-call-away.mp3" 
        loop 
        preload="auto"
      />

      {state === AppState.ASKING ? (
        <div className="z-10 text-center max-w-lg animate-fade-in">
          <div className="relative inline-block mb-8">
            <div className="bg-white p-6 rounded-full shadow-xl animate-float">
              <Phone className="w-16 h-16 text-pink-500" />
            </div>
            <Heart className="absolute -top-2 -right-2 w-8 h-8 text-red-500 animate-pulse fill-red-500" />
            <Sparkles className="absolute -bottom-2 -left-2 w-8 h-8 text-yellow-400" />
          </div>

          <h1 className="text-4xl md:text-5xl font-pacifico text-pink-600 mb-6 drop-shadow-sm">
            Will you be my <br/>One Call Away friend? ☎️
          </h1>
          
          <p className="text-gray-600 mb-12 text-lg">
            I'm only one call away, I'll be there to save the day! 🎵
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 min-h-[100px]">
            <button
              onClick={handleYes}
              style={{ transform: `scale(${yesButtonSize})` }}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all duration-300 hover:shadow-green-200 active:scale-95 z-20 flex items-center gap-2"
            >
              <Heart className="w-5 h-5 fill-white" /> YES!
            </button>

            <button
              onMouseEnter={handleNoHover}
              onClick={handleNoHover}
              style={{
                position: noCount > 0 ? 'fixed' : 'relative',
                left: noCount > 0 ? `${noButtonPos.x}px` : 'auto',
                top: noCount > 0 ? `${noButtonPos.y}px` : 'auto',
                transition: 'all 0.2s ease-out'
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold py-3 px-8 rounded-full shadow transition-colors whitespace-nowrap"
            >
              {noCount === 0 ? "No" : NO_BUTTON_MESSAGES[Math.min(noCount - 1, NO_BUTTON_MESSAGES.length - 1)]}
            </button>
          </div>
        </div>
      ) : (
        <div className="z-10 text-center max-w-2xl w-full animate-in fade-in zoom-in duration-500">
          <div className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl border-4 border-pink-200 relative">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-pink-500 text-white p-4 rounded-full shadow-lg">
              <Star className="w-8 h-8 fill-white" />
            </div>
            
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="absolute top-4 right-4 p-2 text-pink-400 hover:text-pink-600 transition-colors"
              title={isMuted ? "Unmute Music" : "Mute Music"}
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>

            {loading ? (
              <div className="flex flex-col items-center py-10">
                <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-pink-600 font-semibold animate-pulse">Generating your friendship certificate...</p>
              </div>
            ) : friendshipData ? (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-pacifico text-pink-600 mb-2">
                  {friendshipData.title}
                </h2>
                
                <div className="h-px bg-pink-100 w-full" />

                <p className="text-xl text-gray-700 italic leading-relaxed">
                   "{friendshipData.message}"
                </p>

                <div className="bg-pink-50 rounded-2xl p-6 text-left border border-pink-100">
                  <h3 className="text-pink-600 font-bold flex items-center gap-2 mb-3">
                    <MessageCircle className="w-5 h-5" /> Why we're besties:
                  </h3>
                  <ul className="space-y-3">
                    {friendshipData.reasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700">
                        <span className="text-pink-400 font-bold">★</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => {
                        window.open(`https://wa.me/?text=I%20just%20accepted%20the%20friendship%20proposal!%20One%20Call%20Away%20Besties!%20☎️❤️`, '_blank');
                    }}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
                  >
                    Share with me! 📱
                  </button>
                  <button 
                    onClick={reset}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold py-3 px-8 rounded-full transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Try Again
                  </button>
                </div>
              </div>
            ) : (
                <div className="py-10">
                    <p className="text-red-400">Oops! Something went wrong, but we're still besties! ❤️</p>
                    <button onClick={reset} className="mt-4 text-pink-500 underline">Try again</button>
                </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-center gap-4 text-pink-400">
            <Heart className="w-6 h-6 fill-pink-400 animate-pulse" />
            <Heart className="w-6 h-6 fill-pink-400 animate-pulse delay-75" />
            <Heart className="w-6 h-6 fill-pink-400 animate-pulse delay-150" />
          </div>
        </div>
      )}

      {/* Music-like vibe status bar (aesthetic) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/60 backdrop-blur-sm px-6 py-2 rounded-full border border-pink-100 flex items-center gap-4 shadow-sm z-50">
        <div className="flex gap-1 items-end h-4">
            <div className={`w-1 bg-pink-400 rounded-full animate-bounce h-2 ${isMuted ? 'animate-none opacity-30' : ''}`} />
            <div className={`w-1 bg-pink-400 rounded-full animate-bounce h-4 delay-75 ${isMuted ? 'animate-none opacity-30' : ''}`} />
            <div className={`w-1 bg-pink-400 rounded-full animate-bounce h-3 delay-150 ${isMuted ? 'animate-none opacity-30' : ''}`} />
            <div className={`w-1 bg-pink-400 rounded-full animate-bounce h-1 delay-200 ${isMuted ? 'animate-none opacity-30' : ''}`} />
        </div>
        <p className="text-xs font-bold text-pink-600 uppercase tracking-widest">
            {state === AppState.ASKING ? "Waiting for response..." : (isMuted ? "Music Paused" : "Now Playing: One Call Away 🎵")}
        </p>
      </div>
    </div>
  );
};

export default App;
