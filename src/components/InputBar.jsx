import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, FastForward } from 'lucide-react';

const QUICK_RITUALS = [
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
  disabled
}) {
  const [input, setInput] = useState('');
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

  const handleQuickRitual = (promptText) => {
    if (disabled) return;
    onSendMessage(promptText);
  };

  return (
    <div className="w-full max-w-[720px] mx-auto px-4 pb-3">
      {/* Quick Ritual Prompts / Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2.5 scrollbar-none text-[13px]">
        {QUICK_RITUALS.map((ritual, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickRitual(ritual.prompt)}
            disabled={disabled}
            className="shrink-0 px-3.5 py-1.5 rounded-full bg-[#2a2a2a] hover:bg-[#333333] text-neutral-300 hover:text-white border border-white/5 text-[13px] font-sans transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            {ritual.label}
          </button>
        ))}
      </div>

      {/* Input Box: Rounded 24px container, subtle border, #2F2F2F */}
      <div className="relative rounded-[24px] bg-[#2F2F2F] border border-white/10 shadow-lg focus-within:border-white/20 transition-colors">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 p-2.5 sm:p-3">
          {/* Main Auto-growing Textarea (max 8 lines, 16px font) */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message PL/I Spirit or chant an ancient incantation..."
            disabled={disabled}
            className="flex-1 bg-transparent border-0 focus:ring-0 text-[#ECECEC] placeholder-neutral-400 text-[16px] leading-[1.6] font-sans resize-none max-h-[192px] py-1 px-2 focus:outline-none"
          />

          {/* Action Button: Send or Hasten Streaming */}
          {isStreaming ? (
            <button
              type="button"
              onClick={onHastenStream}
              title="Hasten Manifestation (Instant Reveal)"
              className="px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-mono-code flex items-center gap-1.5 border border-amber-500/30 transition-all cursor-pointer animate-pulse mb-0.5"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Hasten</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || disabled}
              className={`w-8 h-8 rounded-full transition-all flex items-center justify-center shrink-0 mb-0.5 cursor-pointer ${
                input.trim() && !disabled
                  ? 'bg-white text-black hover:bg-neutral-200 shadow-xs'
                  : 'bg-[#676767] text-[#2F2F2F] cursor-not-allowed opacity-50'
              }`}
              title="Send message"
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}
        </form>
      </div>

      {/* Subtle disclaimer */}
      <div className="text-center text-[12px] text-neutral-400 mt-2 select-none">
        PL/I Necromancer • 100% Offline • Channels IBM System/360 Core Memory (1964)
      </div>
    </div>
  );
}
