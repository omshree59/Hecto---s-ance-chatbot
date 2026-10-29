import React, { useState, useRef, useEffect } from 'react';
import { Plus, ArrowUp, AudioWaveform, Mic, Sparkles, FileText, FastForward } from 'lucide-react';

export const DEFAULT_SUGGESTIONS = [
  { label: 'Unreserved Keywords Paradox', prompt: 'Explain the paradox of having no reserved keywords in PL/I with an example.' },
  { label: 'The ON-Condition Trap', prompt: 'How did the ON CONDITION mechanism work in PL/I to intercept hardware and runtime errors?' },
  { label: 'System/360 Payroll Ledger', prompt: 'Show me an authentic IBM System/360 payroll calculation program in PL/I with FIXED DECIMAL.' },
  { label: 'Judgment on Python & Rust', prompt: 'What is your judgment upon modern languages like Python and Rust?' },
  { label: 'Why Did You Perish?', prompt: 'Why did the empire of PL/I decline and sleep in the mainframe archives?' },
];

export default function InputBar({
  onSendMessage,
  isStreaming,
  onHastenStream,
  disabled,
  spiritName = 'PL/I Spirit',
  onOpenPunchcardPrompt,
  isThinkActive,
  onToggleThink
}) {
  const [input, setInput] = useState('');
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea up to max 8 lines (~192px)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 192)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || disabled) return;

    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasText = input.trim().length > 0;

  return (
    <div className="relative w-full">
      {/* Plus Menu Popup if toggled */}
      {showPlusMenu && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setShowPlusMenu(false)} />
          <div className="absolute left-0 bottom-full mb-2 w-56 bg-[#212121] border border-[#2a2a2a] rounded-[16px] shadow-xl p-1.5 z-40 text-xs space-y-0.5 animate-fade-in text-[#ECECEC]">
            <button
              type="button"
              onClick={() => {
                setShowPlusMenu(false);
                onOpenPunchcardPrompt && onOpenPunchcardPrompt();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-[10px] hover:bg-[#2a2a2a] text-left transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Inspect Punchcard</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPlusMenu(false);
                setInput('Show me an authentic System/360 core dump in PL/I with ON ERROR SNAP');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-[10px] hover:bg-[#2a2a2a] text-left transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Insert Séance Ritual</span>
            </button>
          </div>
        </>
      )}

      {/* Pill Composer: Height 56px min, radius 28px, bg #212121, no visible border */}
      <div className="min-h-[56px] rounded-[28px] bg-[#212121] flex items-end px-3 py-2 shadow-sm transition-colors">
        {/* Left: "+" icon button */}
        <button
          type="button"
          onClick={() => setShowPlusMenu(!showPlusMenu)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#9b9b9b] hover:text-white hover:bg-[#2a2a2a] transition-colors shrink-0 mb-1 cursor-pointer"
          title="Add options / attachments"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Middle: auto-growing textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${spiritName}…`}
          disabled={disabled}
          className="flex-1 bg-transparent border-0 focus:ring-0 text-[#ECECEC] placeholder-[#9b9b9b] text-[16px] leading-[1.6] font-sans resize-none max-h-[192px] py-1.5 px-3 focus:outline-none"
        />

        {/* Right, in exact order: 1. "Think" chip, 2. mic icon, 3. circular send button */}
        <div className="flex items-center gap-1.5 shrink-0 mb-1">
          {/* 1. "Think" chip */}
          <button
            type="button"
            onClick={onToggleThink}
            className={`px-2.5 py-1 rounded-full text-[12px] font-medium transition-colors cursor-pointer ${
              isThinkActive 
                ? 'bg-[#2f2f2f] text-white border border-[#383838]' 
                : 'text-[#9b9b9b] hover:text-white hover:bg-[#2a2a2a]'
            }`}
            title="Toggle slower, deeper contemplation mode"
          >
            Think
          </button>

          {/* 2. Mic icon */}
          <button
            type="button"
            onClick={() => {
              if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                recognition.onresult = (event) => {
                  const transcript = event.results[0][0].transcript;
                  setInput(prev => prev + (prev ? ' ' : '') + transcript);
                };
                recognition.start();
              } else {
                alert('Speech recognition is not supported in this browser.');
              }
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#9b9b9b] hover:text-white hover:bg-[#2a2a2a] transition-colors cursor-pointer"
            title="Dictate incantation"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* 3. Circular send button */}
          {isStreaming ? (
            <button
              type="button"
              onClick={onHastenStream}
              title="Hasten Manifestation (Instant Reveal)"
              className="px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-mono flex items-center gap-1 transition-all cursor-pointer animate-pulse"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Hasten</span>
            </button>
          ) : hasText ? (
            /* White circle with dark arrow when text is present */
            <button
              type="button"
              onClick={handleSubmit}
              disabled={disabled}
              className="w-8 h-8 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors flex items-center justify-center cursor-pointer shadow-xs"
              title="Send message"
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            </button>
          ) : (
            /* Blue circle with waveform icon when empty */
            <button
              type="button"
              onClick={() => {
                // Focus textarea
                textareaRef.current?.focus();
              }}
              className="w-8 h-8 rounded-full bg-[#10a37f] text-white hover:bg-[#1a7f64] transition-colors flex items-center justify-center cursor-pointer shadow-xs"
              title="Voice mode / Start summoning"
            >
              <AudioWaveform className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
