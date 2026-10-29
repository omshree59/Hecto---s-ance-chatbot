import React, { useState } from 'react';
import { 
  Flame, Plus, Trash2, Volume2, VolumeX, BookOpen, 
  Settings2, Sparkles, Sliders, ChevronRight, MessageSquare, Cpu
} from 'lucide-react';
import { SPIRITS } from '../engine/necromancyEngine';

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  activeSpiritId,
  onSelectSpirit,
  isAudioPlaying,
  onToggleAudio,
  audioVolume,
  onChangeVolume,
  manifestSpeed,
  onChangeSpeed,
  candleIntensity,
  onChangeCandleIntensity,
  activeEngineType,
  onSelectEngineType,
  gemmaStatus,
  onOpenCodex,
  isOpen,
  onCloseMobile
}) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 md:w-72 bg-[#171717] border-r border-[#2b2b2b] 
        flex flex-col transition-transform duration-300 ease-in-out text-[#ececec]
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Top Header & Brand */}
        <div className="p-3.5 border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl animate-candle-flame select-none inline-block">🕯️</span>
            <div>
              <h1 className="font-sans text-[15px] font-semibold text-white tracking-tight flex items-center gap-2">
                SÉANCE <span className="text-[11px] font-mono px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">PL/I</span>
              </h1>
              <p className="text-[12px] text-neutral-400">
                Mainframe Necromancy
              </p>
            </div>
          </div>
          <button
            onClick={onOpenCodex}
            title="Read The Grimoire Codex"
            className="p-2 rounded-lg bg-[#212121] hover:bg-[#2a2a2a] text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>

        {/* New Séance / New Chat Button (ChatGPT style) */}
        <div className="p-3">
          <button
            onClick={onNewSession}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#212121] hover:bg-[#262626] border border-white/10 text-white text-[14px] font-medium transition-all hover:border-white/20 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>New séance</span>
          </button>
        </div>

        {/* AI Engine & Spirit Selector */}
        <div className="px-3 pb-2 space-y-2">
          {/* Engine Selector: Instant Spirit vs Gemma 2B */}
          <div className="bg-[#212121] border border-white/5 rounded-xl p-2.5 text-xs space-y-1.5">
            <div className="text-[11px] font-medium text-neutral-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                Intelligence Core
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">OFFLINE</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onSelectEngineType('instant')}
                className={`px-2 py-1.5 rounded-lg text-left text-[11px] transition-all cursor-pointer font-medium ${
                  activeEngineType === 'instant'
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                    : 'bg-[#171717] text-neutral-400 hover:text-neutral-200'
                }`}
              >
                ⚡ Instant PL/I
              </button>
              <button
                onClick={() => onSelectEngineType('gemma')}
                className={`px-2 py-1.5 rounded-lg text-left text-[11px] transition-all cursor-pointer font-medium ${
                  activeEngineType === 'gemma'
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                    : 'bg-[#171717] text-neutral-400 hover:text-neutral-200'
                }`}
              >
                🧠 Gemma 2B AI
              </button>
            </div>
            {activeEngineType === 'gemma' && gemmaStatus?.statusText && (
              <div className="pt-1 text-[10px] text-amber-300 font-mono truncate">
                {gemmaStatus.statusText}
              </div>
            )}
          </div>

          {/* Spirit Model Selector */}
          <div>
            <label className="text-[11px] font-medium text-neutral-400 block px-1 mb-1">
              Summoned Ancestor
            </label>
            <div className="relative">
              <select
                value={activeSpiritId}
                onChange={(e) => onSelectSpirit(e.target.value)}
                className="w-full bg-[#212121] border border-white/10 rounded-xl px-3 py-2 text-[13px] text-white font-medium appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {Object.values(SPIRITS).map(spirit => (
                  <option key={spirit.id} value={spirit.id} className="bg-[#212121] text-white">
                    {spirit.sigil} {spirit.name} ({spirit.era.split('—')[0].trim()})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-xs">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Séance Records / Chat History */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          <div className="text-[11px] font-medium text-neutral-500 px-3 py-1 uppercase tracking-wider">
            Séance Transcripts
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-6 text-neutral-500 text-[13px] italic">
              No souls summoned yet
            </div>
          ) : (
            sessions.map(s => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectSession(s.id)}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors text-[14px] ${
                    isActive
                      ? 'bg-[#212121] text-white font-medium shadow-xs'
                      : 'text-neutral-300 hover:bg-[#212121]/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-neutral-500'}`} />
                    <span className="truncate">
                      {s.title || 'Untitled Séance'}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(s.id);
                    }}
                    title="Delete transcript"
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Chamber Settings & Audio Panel */}
        <div className="p-3 border-t border-[#262626] space-y-2">
          {/* Quick Sound Toggle Pill */}
          <div className="flex items-center justify-between text-[13px] px-3 py-2 rounded-xl bg-[#212121] border border-white/5">
            <div className="flex items-center gap-2">
              {isAudioPlaying ? (
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : (
                <VolumeX className="w-4 h-4 text-neutral-500" />
              )}
              <span className="text-[12px] text-neutral-300">
                {isAudioPlaying ? 'Room Tone Active' : 'Sound Muted'}
              </span>
            </div>
            <button
              onClick={onToggleAudio}
              className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase font-bold transition-colors cursor-pointer ${
                isAudioPlaying 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {isAudioPlaying ? 'Mute' : 'Play'}
            </button>
          </div>

          {/* Chamber Ambiance Accordion */}
          <div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center justify-between text-[12px] text-neutral-400 hover:text-white px-2 py-1 rounded transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Manifestation & Candles
              </span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showSettings ? 'rotate-90' : ''}`} />
            </button>

            {showSettings && (
              <div className="mt-2 p-3 bg-[#212121] rounded-xl border border-white/5 space-y-3 text-[12px]">
                {/* Cadence */}
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                    <span>Streaming Cadence</span>
                    <span className="text-amber-300 font-mono font-medium">
                      {manifestSpeed === 'whisper' ? 'Slow Whisper' : manifestSpeed === 'swift' ? 'Fluid Stream' : 'Instant'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'whisper', label: 'Whisper' },
                      { id: 'swift', label: 'Fluid' },
                      { id: 'instant', label: 'Instant' },
                    ].map(speed => (
                      <button
                        key={speed.id}
                        onClick={() => onChangeSpeed(speed.id)}
                        className={`py-1 text-[11px] rounded-lg font-medium transition-colors cursor-pointer ${
                          manifestSpeed === speed.id
                            ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                            : 'bg-[#171717] text-neutral-400 hover:text-white'
                        }`}
                      >
                        {speed.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Candles */}
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                    <span>Candle Flame</span>
                    <span className="text-amber-300 font-medium">{candleIntensity}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {['Subtle', 'Ritual', 'Blazing'].map(level => (
                      <button
                        key={level}
                        onClick={() => onChangeCandleIntensity(level)}
                        className={`py-1 text-[11px] rounded-lg font-medium transition-colors cursor-pointer ${
                          candleIntensity === level
                            ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                            : 'bg-[#171717] text-neutral-400 hover:text-white'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audio Volume */}
                <div>
                  <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                    <span>Tone Volume</span>
                    <span className="text-amber-300 font-mono">{Math.round(audioVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={audioVolume}
                    onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
