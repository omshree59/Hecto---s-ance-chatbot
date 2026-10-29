import React, { useRef, useEffect, useState } from 'react';
import { 
  Menu, SquarePen, MoreHorizontal, ChevronDown, Check, 
  Download, Trash2, Volume2, VolumeX, FileText, Cpu, BookOpen, 
  AudioWaveform, Flame, FileJson
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import Mainframe3DBackground from './Mainframe3DBackground';
import { SPIRITS, getDynamicSuggestions } from '../engine/necromancyEngine';

export default function ChatArea({
  session,
  activeSpiritId,
  onSelectSpirit,
  activeEngineType,
  onSelectEngineType,
  gemmaStatus,
  onSendMessage,
  onNewSession,
  onRegenerate,
  onEditAndResend,
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
  onToggleAudio,
  isThinkActive,
  onToggleThink,
  onOpenVoiceMode,
  candleIntensity = 'Ritual'
}) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const spirit = SPIRITS[activeSpiritId] || SPIRITS.pli;
  const messages = session?.messages || [];
  const hasMessages = messages.length > 0 || isStreaming;

  // Compute dynamic smart chips for current persona and conversation stage
  const dynamicChips = getDynamicSuggestions(activeSpiritId, messages);

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
  }, [messages, streamingText, isStreaming]);

  // Candle glow style based on intensity
  const candleGlowClass = {
    Subtle: 'opacity-40 animate-pulse',
    Ritual: 'opacity-80 animate-flicker',
    Blazing: 'opacity-100 ring-2 ring-amber-400/50 animate-flicker'
  }[candleIntensity] || 'opacity-80 animate-flicker';

  return (
    <main className="flex-1 flex flex-col h-screen bg-[#030304] overflow-hidden relative text-[#ECECEC]">
      {/* 3D Mainframe & Séance Chamber Background (runs full-bleed in the vast background) */}
      <Mainframe3DBackground
        activeSpiritId={activeSpiritId}
        isStreaming={isStreaming}
        hasMessages={hasMessages}
      />

      {/* TOP BAR: persona name + model dropdown on left, subtle candle flicker, Voice Mode, single new séance button & "..." menu on right */}
      <header className="h-14 px-4 bg-transparent flex items-center justify-between shrink-0 relative z-20">
        {/* Left: Mobile Drawer Trigger & Model / Persona Dropdown (ChatGPT style) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-[12px] hover:bg-[#212121] text-[#9b9b9b] hover:text-white cursor-pointer"
            title="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Model picker dropdown: "PL/I (Instant) ▾" */}
          <div className="relative">
            <button
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-[12px] hover:bg-[#212121]/80 backdrop-blur-xs text-white text-[18px] font-semibold transition-colors cursor-pointer select-none"
            >
              {/* Subtle Candle Flicker in the Header */}
              <div className="relative flex items-center justify-center">
                <Flame 
                  className={`w-4 h-4 text-amber-400 transition-all ${candleGlowClass}`} 
                  style={{ filter: `drop-shadow(0 0 6px ${spirit.accentColor || '#f59e0b'})` }}
                />
              </div>

              <span>{spirit.name}</span>
              <span className="text-[13px] text-[#9b9b9b] font-normal">
                ({activeEngineType === 'gemma' ? 'Gemma 2B' : 'Instant'})
              </span>
              <ChevronDown className="w-4 h-4 text-[#9b9b9b]" />
            </button>

            {/* Dropdown Menu */}
            {isModelDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsModelDropdownOpen(false)} 
                />
                <div className="absolute left-0 top-full mt-1.5 w-72 bg-[#212121] border border-[#2a2a2a] rounded-[16px] shadow-2xl p-2 z-40 space-y-1 animate-fade-in text-sm text-[#ECECEC]">
                  <div className="px-2 py-1 text-[11px] font-medium text-[#9b9b9b] uppercase tracking-wider">
                    Intelligence Core
                  </div>
                  
                  {/* Engine Options */}
                  <div className="grid grid-cols-2 gap-1 mb-2 px-1">
                    <button
                      onClick={() => {
                        onSelectEngineType('instant');
                        setIsModelDropdownOpen(false);
                      }}
                      className={`p-2 rounded-[10px] text-left transition-all cursor-pointer ${
                        activeEngineType === 'instant'
                          ? 'bg-[#2f2f2f] text-white font-medium'
                          : 'hover:bg-[#282828] text-[#9b9b9b]'
                      }`}
                    >
                      <div className="font-medium text-xs">⚡ Instant {spirit.name}</div>
                      <div className="text-[10px] text-[#9b9b9b]">0ms local engine</div>
                    </button>
                    <button
                      onClick={() => {
                        onSelectEngineType('gemma');
                        setIsModelDropdownOpen(false);
                      }}
                      className={`p-2 rounded-[10px] text-left transition-all cursor-pointer ${
                        activeEngineType === 'gemma'
                          ? 'bg-[#2f2f2f] text-white font-medium'
                          : 'hover:bg-[#282828] text-[#9b9b9b]'
                      }`}
                    >
                      <div className="font-medium text-xs">🧠 Gemma 2B</div>
                      <div className="text-[10px] text-[#9b9b9b]">WebGPU Neural AI</div>
                    </button>
                  </div>

                  <div className="border-t border-[#2a2a2a] my-1"></div>
                  <div className="px-2 py-1 text-[11px] font-medium text-[#9b9b9b] uppercase tracking-wider">
                    Summoned Ancestors
                  </div>

                  {/* Spirits list */}
                  {Object.values(SPIRITS).map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        onSelectSpirit(s.id);
                        setIsModelDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-[10px] text-left transition-colors cursor-pointer ${
                        activeSpiritId === s.id ? 'bg-[#2f2f2f] text-white font-medium' : 'hover:bg-[#282828] text-[#9b9b9b]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ color: s.accentColor }}>{s.sigil}</span>
                        <div>
                          <div className="text-[13px] font-medium leading-tight text-[#ECECEC]">{s.name}</div>
                          <div className="text-[11px] text-[#9b9b9b]">{s.era}</div>
                        </div>
                      </div>
                      {activeSpiritId === s.id && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Voice Mode, Single icon button for new séance & "..." menu */}
        <div className="flex items-center gap-1">
          {/* Voice Mode quick launch pill */}
          <button
            onClick={onOpenVoiceMode}
            title="Launch Voice Séance Mode"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-[#212121]/90 hover:bg-[#282828] text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-colors cursor-pointer mr-1 backdrop-blur-xs border border-emerald-500/20"
          >
            <AudioWaveform className="w-3.5 h-3.5" />
            <span>Voice Mode</span>
          </button>

          {/* Single new séance icon button */}
          <button
            onClick={onNewSession}
            title="New séance"
            className="p-2 rounded-[12px] hover:bg-[#212121]/80 backdrop-blur-xs text-[#9b9b9b] hover:text-white transition-colors cursor-pointer"
          >
            <SquarePen className="w-5 h-5" />
          </button>

          {/* "..." menu button */}
          <div className="relative">
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              title="More options"
              className="p-2 rounded-[12px] hover:bg-[#212121]/80 backdrop-blur-xs text-[#9b9b9b] hover:text-white transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {/* "..." dropdown menu */}
            {isMoreMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsMoreMenuOpen(false)} 
                />
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-[#212121] border border-[#2a2a2a] rounded-[16px] shadow-2xl p-1.5 z-40 space-y-0.5 animate-fade-in text-xs text-[#ECECEC]">
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenVoiceMode && onOpenVoiceMode();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] hover:bg-[#282828] text-emerald-400 text-left transition-colors cursor-pointer"
                  >
                    <AudioWaveform className="w-4 h-4" />
                    <span>Launch Voice Mode</span>
                  </button>

                  {/* Export as Markdown */}
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onExportSession('md');
                    }}
                    disabled={messages.length === 0}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] hover:bg-[#282828] text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4 text-[#9b9b9b]" />
                    <span>Export Markdown (.md)</span>
                  </button>

                  {/* Export as JSON */}
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onExportSession('json');
                    }}
                    disabled={messages.length === 0}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] hover:bg-[#282828] text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FileJson className="w-4 h-4 text-[#9b9b9b]" />
                    <span>Export JSON (.json)</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onToggleAudio();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] hover:bg-[#282828] text-left transition-colors cursor-pointer"
                  >
                    {isAudioPlaying ? (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-[#9b9b9b]" />
                    )}
                    <span>{isAudioPlaying ? 'Mute room sound' : 'Play room sound'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenPunchcard && onOpenPunchcard('000010 /* IBM 5081 SYSTEM/360 PUNCHCARD FORM */               SEC00010');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] hover:bg-[#282828] text-left transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Inspect Punchcard</span>
                  </button>

                  {/* Historical Lore (formerly Codex) */}
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenCodex();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] hover:bg-[#282828] text-left transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[#9b9b9b]" />
                    <span>Historical Lore</span>
                  </button>

                  <div className="border-t border-[#2a2a2a] my-1"></div>

                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onClearSession();
                    }}
                    disabled={messages.length === 0}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] hover:bg-[#282828] text-red-400 text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear séance history</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area (Relative z-10 layered cleanly over 3D background) */}
      {!hasMessages ? (
        /* EMPTY STATE: Centered vertically over the 3D mainframe reels, big heading, composer centered max-width 760px, SMART CHIPS BELOW */
        <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-10 overflow-visible relative z-10">
          {/* Glorified IBM System/360 Heritage Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 mb-3 rounded-full bg-[#101726]/90 border border-blue-500/30 text-blue-300 text-xs font-mono tracking-wider shadow-lg shadow-blue-950/40 select-none animate-fade-in backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="font-bold tracking-widest text-blue-200">IBM SYSTEM/360</span>
            <span className="text-blue-500/60">•</span>
            <span className="text-[#94a3b8] text-[11px]">1964 ARCHIVAL MONUMENT</span>
          </div>

          {/* Big heading with subtle shadow so it pops cleanly over the 3D mainframe */}
          <h1 className="text-[32px] font-normal text-white text-center tracking-tight mb-8 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            What shall we summon?
          </h1>

          {/* Composer centered at max-width 760px */}
          <div className="w-full max-w-[760px] relative z-20 drop-shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <InputBar
              onSendMessage={onSendMessage}
              isStreaming={isStreaming}
              onHastenStream={onHastenStream}
              disabled={isStreaming}
              spiritName={spirit.name}
              onOpenPunchcardPrompt={() => onOpenPunchcard && onOpenPunchcard('000010 /* IBM 5081 SYSTEM/360 PUNCHCARD FORM */               SEC00010')}
              isThinkActive={isThinkActive}
              onToggleThink={onToggleThink}
              onOpenVoiceMode={onOpenVoiceMode}
              activeEngineType={activeEngineType}
              onSelectEngineType={onSelectEngineType}
              sparkColor={spirit.accentColor || '#f59e0b'}
            />

            {/* Persona and stage-specific smart suggestion chips BELOW composer */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {dynamicChips.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(suggestion.prompt)}
                  className="px-3.5 py-1.5 rounded-full bg-[#212121]/90 hover:bg-[#282828] backdrop-blur-md text-[#ECECEC] text-[13px] font-sans transition-colors cursor-pointer border border-[#2a2a2a] shadow-md hover:border-neutral-500"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE CHAT: Messages stream max-width 760px, composer docked at bottom, relative z-10 over 3D background */
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Messages Column */}
          <div 
            ref={containerRef}
            onScroll={handleScroll}
            className="messages-scroll-container flex-1 overflow-y-auto px-4 py-6"
          >
            <div className="max-w-[760px] mx-auto w-full space-y-6">
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={msg.id || idx}
                  message={msg}
                  onOpenPunchcard={onOpenPunchcard}
                  onRegenerate={msg.sender === 'spirit' ? () => onRegenerate(idx) : null}
                  onEditAndResend={msg.sender === 'user' ? (newText) => onEditAndResend(idx, newText) : null}
                />
              ))}

              {/* Streaming Message */}
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

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Docked Composer at bottom */}
          <div className="w-full px-4 pb-3 shrink-0">
            <div className="max-w-[760px] mx-auto w-full relative z-20 drop-shadow-[0_8px_30px_rgba(0,0,0,0.7)]">
              <InputBar
                onSendMessage={onSendMessage}
                isStreaming={isStreaming}
                onHastenStream={onHastenStream}
                disabled={isStreaming}
                spiritName={spirit.name}
                onOpenPunchcardPrompt={() => onOpenPunchcard && onOpenPunchcard('000010 /* IBM 5081 SYSTEM/360 PUNCHCARD FORM */               SEC00010')}
                isThinkActive={isThinkActive}
                onToggleThink={onToggleThink}
                onOpenVoiceMode={onOpenVoiceMode}
                activeEngineType={activeEngineType}
                onSelectEngineType={onSelectEngineType}
                sparkColor={spirit.accentColor || '#f59e0b'}
              />
              <div className="flex items-center justify-between text-[11px] text-[#9b9b9b] mt-2 px-2 select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Séance Offline Intelligence • {spirit.fullName} • IBM System/360</span>
                </div>
                <span>Session preserved in IndexedDB</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
