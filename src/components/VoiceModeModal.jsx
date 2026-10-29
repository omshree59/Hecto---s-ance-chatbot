import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2, Sparkles, AudioWaveform } from 'lucide-react';
import { seanceSpeech } from '../audio/seanceSpeech';
import { SPIRITS } from '../engine/necromancyEngine';

export default function VoiceModeModal({
  isOpen,
  onClose,
  activeSpiritId,
  onSendMessageAsync
}) {
  const [status, setStatus] = useState('listening'); // 'listening' | 'thinking' | 'speaking'
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [spiritReplyText, setSpiritReplyText] = useState('');
  const silenceTimerRef = useRef(null);
  const transcriptBufferRef = useRef('');

  const spirit = SPIRITS[activeSpiritId] || SPIRITS.pli;

  useEffect(() => {
    if (!isOpen) {
      seanceSpeech.stopListening();
      seanceSpeech.stopSpeaking();
      return;
    }

    startListeningLoop();

    return () => {
      seanceSpeech.stopListening();
      seanceSpeech.stopSpeaking();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [isOpen, activeSpiritId]);

  const startListeningLoop = () => {
    setStatus('listening');
    setTranscript('');
    transcriptBufferRef.current = '';

    try {
      seanceSpeech.startListening({
        onStart: () => {
          setStatus('listening');
        },
        onTranscript: ({ final, interim }) => {
          const currentText = final || interim;
          if (currentText) {
            setTranscript(currentText);
            transcriptBufferRef.current = currentText;

            // Detect silence to auto-send (1.8s of silence after speech)
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              if (transcriptBufferRef.current.trim()) {
                handleUserSpokenSentence(transcriptBufferRef.current.trim());
              }
            }, 1800);
          }
        },
        onError: (err) => {
          console.warn('Voice recognition error:', err);
        },
        onEnd: () => {
          // Restart if still in voice mode and listening
          if (status === 'listening' && isOpen && !isMicMuted) {
            try { seanceSpeech.startListening(); } catch (e) {}
          }
        }
      });
    } catch (e) {
      console.warn('Could not start recognition:', e);
    }
  };

  const handleUserSpokenSentence = async (text) => {
    seanceSpeech.stopListening();
    setStatus('thinking');

    try {
      // Send to chatbot engine
      const response = await onSendMessageAsync(text);
      if (response && response.text) {
        setSpiritReplyText(response.text);
        setStatus('speaking');

        seanceSpeech.speak(response.text, activeSpiritId, {
          onStart: () => setStatus('speaking'),
          onEnd: () => {
            // Once spirit finishes chanting, resume listening!
            if (isOpen && !isMicMuted) {
              startListeningLoop();
            }
          }
        });
      } else {
        startListeningLoop();
      }
    } catch (err) {
      console.error('Voice loop error:', err);
      startListeningLoop();
    }
  };

  const toggleMic = () => {
    if (isMicMuted) {
      setIsMicMuted(false);
      startListeningLoop();
    } else {
      setIsMicMuted(true);
      seanceSpeech.stopListening();
      setStatus('listening');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-black/95 backdrop-blur-xl animate-fade-in text-[#ECECEC] select-none">
      {/* Top Header */}
      <div className="w-full max-w-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl animate-candle-flame">🕯️</span>
          <div>
            <div className="font-semibold text-sm text-white flex items-center gap-1.5">
              <span>{spirit.name}</span>
              <span className="text-xs text-[#9b9b9b] font-normal">Voice Séance</span>
            </div>
            <div className="text-xs text-[#9b9b9b] capitalize">
              {status === 'listening' ? (isMicMuted ? 'Microphone Muted' : 'Listening...') : status === 'thinking' ? 'Communing with the spirit...' : 'Chanting response...'}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-[#212121] hover:bg-[#2f2f2f] flex items-center justify-center text-[#ECECEC] transition-colors cursor-pointer"
          title="Exit voice mode"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Animated Voice Orb (ChatGPT Voice Mode style) */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        {/* Ambient Glow Ring */}
        <div 
          className={`absolute w-64 h-64 rounded-full transition-all duration-700 blur-3xl pointer-events-none opacity-40 ${
            status === 'speaking'
              ? 'scale-150 bg-amber-500'
              : status === 'thinking'
              ? 'scale-110 bg-cyan-500 animate-pulse'
              : 'scale-90 bg-emerald-500'
          }`}
        />

        {/* Central Pulsing Liquid Orb */}
        <div 
          className={`relative w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
            status === 'speaking'
              ? 'bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 scale-110 animate-pulse'
              : status === 'thinking'
              ? 'bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-400 scale-95 animate-spin-slow'
              : 'bg-gradient-to-tr from-[#1f2029] via-[#282936] to-[#3a3b4c] scale-100'
          }`}
        >
          {/* Inner Glyph */}
          <div className="text-4xl text-white select-none drop-shadow-md">
            {status === 'speaking' ? (
              <AudioWaveform className="w-12 h-12 animate-pulse" />
            ) : status === 'thinking' ? (
              <Sparkles className="w-10 h-10 animate-spin" />
            ) : (
              spirit.sigil
            )}
          </div>
        </div>

        {/* Subtitle / Live Transcript preview */}
        <div className="mt-8 max-w-md text-center px-4 min-h-[48px]">
          {status === 'speaking' ? (
            <p className="text-sm text-amber-200/90 font-serif italic line-clamp-2">
              "{spiritReplyText.slice(0, 140)}..."
            </p>
          ) : transcript ? (
            <p className="text-sm text-neutral-200 font-sans">
              "{transcript}"
            </p>
          ) : (
            <p className="text-xs text-[#9b9b9b]">
              Speak your question to {spirit.name}…
            </p>
          )}
        </div>
      </div>

      {/* Bottom Voice Controls */}
      <div className="flex items-center gap-4 mb-4">
        {/* Mute Mic Button */}
        <button
          onClick={toggleMic}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-md ${
            isMicMuted 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
              : 'bg-[#212121] text-[#ECECEC] hover:bg-[#2f2f2f]'
          }`}
          title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* End Voice Séance Button */}
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
          title="End voice session"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
