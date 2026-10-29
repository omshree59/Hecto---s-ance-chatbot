import React, { useRef, useEffect, useState } from 'react';
import { 
  Menu, Trash2, Download, BookOpen, Volume2, 
  VolumeX, Sparkles, ChevronDown, Check, Cpu 
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import { SPIRITS } from '../engine/necromancyEngine';

export default function ChatArea({
  session,
  activeSpiritId,
  onSelectSpirit,
  activeEngineType,
  onSelectEngineType,
  gemmaStatus,
  onSendMessage,
  onRegenerate,
  isStreaming,
  streamingText,
  streamingMessageData,
  onHastenStream,
  onClearSession,
  onExportSession,
  onOpenPunchcard,
  onOpenCodex,
  onOpenMobileMenu,
  isAudioPlaying,
  onToggleAudio
}) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const spirit = SPIRITS[activeSpiritId] || SPIRITS.pli;

  // Track if user is near bottom before triggering auto-scroll
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 140;
    }
  };

  // Auto-scroll to bottom only if user is already near bottom
  useEffect(() => {
    if (isNearBottomRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session?.messages, streamingText, isStreaming]);

  const messages = session?.messages || [];

  return (
    <main className="flex-1 flex flex-col h-screen bg-[#212121] overflow-hidden relative text-[#ECECEC]">
      {/* Top Header Bar */}
      <header className="h-14 px-4 bg-[#212121]/95 backdrop-blur-md border-b border-[#2b2b2b] flex items-center justify-between shrink-0 z-20">
        {/* Left: Mobile Toggle & ChatGPT-style Model Selector Dropdown */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-[#2f2f2f] text-neutral-300 hover:text-white cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Model / Spirit Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#2f2f2f] text-white text-[15px] font-semibold transition-colors cursor-pointer"
            >
              <span className="text-lg animate-candle-flame inline-block">🕯️</span>
              <span>{spirit.name}</span>
              <span className="text-xs text-neutral-400 font-normal">
                ({activeEngineType === 'gemma' ? 'Gemma 2B' : 'Instant'})
              </span>
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </button>

            {/* Model Selector Dropdown Menu */}
            {isModelDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsModelDropdownOpen(false)} 
                />
                <div className="absolute left-0 top-full mt-1.5 w-72 bg-[#282828] border border-white/10 rounded-2xl shadow-2xl p-2 z-40 space-y-1 animate-fade-in text-sm">
                  <div className="px-2 py-1 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                    Select Intelligence Engine
                  </div>
                  
                  {/* Engine Options */}
                  <div className="grid grid-cols-2 gap-1 mb-2 px-1">
                    <button
                      onClick={() => {
                        onSelectEngineType('instant');
                        setIsModelDropdownOpen(false);
                      }}
                      className={`p-2 rounded-xl text-left transition-all cursor-pointer ${
                        activeEngineType === 'instant'
                          ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                          : 'hover:bg-[#333333] text-neutral-300'
                      }`}
                    >
                      <div className="font-semibold text-xs">⚡ Instant PL/I</div>
                      <div className="text-[10px] text-neutral-400">0ms local engine</div>
                    </button>
                    <button
                      onClick={() => {
                        onSelectEngineType('gemma');
                        setIsModelDropdownOpen(false);
                      }}
                      className={`p-2 rounded-xl text-left transition-all cursor-pointer ${
                        activeEngineType === 'gemma'
                          ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                          : 'hover:bg-[#333333] text-neutral-300'
                      }`}
                    >
                      <div className="font-semibold text-xs">🧠 Gemma 2B</div>
                      <div className="text-[10px] text-neutral-400">WebGPU Neural AI</div>
                    </button>
                  </div>

                  <div className="border-t border-white/5 my-1"></div>
                  <div className="px-2 py-1 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                    Select Spirit Entity
                  </div>

                  {/* Spirit Options */}
                  {Object.values(SPIRITS).map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        onSelectSpirit(s.id);
                        setIsModelDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                        activeSpiritId === s.id ? 'bg-[#383838] text-white font-medium' : 'hover:bg-[#333333] text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{s.sigil}</span>
                        <div>
                          <div className="text-[13px] font-medium leading-tight">{s.name}</div>
                          <div className="text-[11px] text-neutral-400">{s.era}</div>
                        </div>
                      </div>
                      {activeSpiritId === s.id && <Check className="w-4 h-4 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1">
          {/* Audio Toggle */}
          <button
            onClick={onToggleAudio}
            title={isAudioPlaying ? 'Mute Séance Tone' : 'Play Room Tone'}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isAudioPlaying
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'hover:bg-[#2f2f2f] text-neutral-400 hover:text-white'
            }`}
          >
            {isAudioPlaying ? (
              <Volume2 className="w-4 h-4 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Export Transcript */}
          <button
            onClick={onExportSession}
            title="Export Séance Transcript (.md)"
            disabled={messages.length === 0}
            className="p-2 rounded-lg hover:bg-[#2f2f2f] text-neutral-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Open Grimoire Codex */}
          <button
            onClick={onOpenCodex}
            title="The Book of Dead Languages"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#2f2f2f] text-neutral-300 hover:text-white text-[13px] transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Codex</span>
          </button>

          {/* Clear Chat */}
          <button
            onClick={onClearSession}
            title="Clear Chat"
            disabled={messages.length === 0}
            className="p-2 rounded-lg hover:bg-[#2f2f2f] text-neutral-400 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Gemma Loading Banner */}
      {activeEngineType === 'gemma' && gemmaStatus?.isLoading && (
        <div className="bg-amber-950/60 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 animate-spin text-amber-400" />
            <span>{gemmaStatus.statusText}</span>
          </div>
          <span className="font-mono font-bold">{gemmaStatus.progress}%</span>
        </div>
      )}

      {/* Message Feed / Chat Stream - Centered Column max-width 720px */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        <div className="max-w-[720px] mx-auto w-full">
          {messages.length === 0 && !isStreaming ? (
            /* Empty State: Centered 720px Welcome Screen */
            <div className="py-12 md:py-20 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div 
                  className="absolute inset-0 rounded-full border border-amber-500/30 animate-rune-spin-slow"
                />
                <div className="relative text-4xl select-none animate-candle-flame">
                  🕯️
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
                  What would you ask of {spirit.name}?
                </h2>
                <p className="text-[15px] text-neutral-400 max-w-lg mx-auto leading-relaxed">
                  {spirit.quote}
                </p>
              </div>

              {/* Quick Ritual Gateways */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left pt-4">
                {[
                  {
                    title: 'The Curse of Zero Reserved Words',
                    desc: 'Discover why "IF IF THEN THEN = ELSE;" is legal PL/I syntax.',
                    prompt: 'Explain the paradox of having no reserved keywords in PL/I with an authentic code example.'
                  },
                  {
                    title: 'The ON-Condition Séance Trap',
                    desc: 'How the System/360 trapped hardware zerodivide and line printer faults.',
                    prompt: 'Demonstrate how the ON CONDITION mechanism handled runtime errors in PL/I.'
                  },
                  {
                    title: 'Judgment upon Python & Rust',
                    desc: 'Hear the monolithic mainframe ghost roast whitespace and borrow checkers.',
                    prompt: 'What is your honest judgment upon modern languages like Python, Rust, and JavaScript?'
                  },
                  {
                    title: 'The Sacred 80-Column Punchcard',
                    desc: 'Why columns 73–80 held the salvation of dropped card decks.',
                    prompt: 'Tell me the history of the 80-column IBM punchcard and show me a JCL card deck.'
                  }
                ].map((gateway, gIdx) => (
                  <button
                    key={gIdx}
                    onClick={() => onSendMessage(gateway.prompt)}
                    className="p-4 rounded-2xl bg-[#282828] hover:bg-[#303030] border border-white/5 text-left transition-all group cursor-pointer shadow-xs"
                  >
                    <div className="text-[14px] font-semibold text-white mb-1 flex items-center justify-between">
                      <span>{gateway.title}</span>
                      <Sparkles className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                    <p className="text-[13px] text-neutral-400 leading-relaxed">
                      {gateway.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Render Messages with exactly 24px vertical spacing */
            <div className="space-y-6">
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={msg.id || idx}
                  message={msg}
                  onOpenPunchcard={onOpenPunchcard}
                  onRegenerate={msg.sender === 'spirit' ? () => onRegenerate(idx) : null}
                />
              ))}

              {/* Streaming Message with typing indicator / cursor */}
              {isStreaming && streamingMessageData && (
                <MessageBubble
                  message={{
                    ...streamingMessageData,
                    text: streamingText
                  }}
                  isStreaming={true}
                  onOpenPunchcard={onOpenPunchcard}
                />
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating ChatGPT Input Crucible */}
      <InputBar
        onSendMessage={onSendMessage}
        isStreaming={isStreaming}
        onHastenStream={onHastenStream}
        disabled={isStreaming}
      />
    </main>
  );
}
