import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js';
import { 
  Copy, Check, Volume2, RotateCw, Terminal, FileText 
} from 'lucide-react';
import { SPIRITS } from '../engine/necromancyEngine';

function CodeBlock({ language, code, onOpenPunchcard }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightedHtml = useMemo(() => {
    try {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(code, { language }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch (e) {
      return code;
    }
  }, [code, language]);

  const firstLine = code.split('\n')[0] || '';

  return (
    <div className="my-4 rounded-[12px] overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-xs">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-white/5 text-neutral-400 font-mono-code text-xs">
        <span className="uppercase tracking-wider font-semibold text-neutral-300">
          {language || 'code'}
        </span>
        <div className="flex items-center gap-2">
          {onOpenPunchcard && (
            <button
              onClick={() => onOpenPunchcard(firstLine || code.slice(0, 72))}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#2a2a2a] hover:bg-[#333333] text-amber-300 text-xs font-mono-code transition-colors cursor-pointer"
              title="View as 80-Column IBM Punchcard"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Card</span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#2a2a2a] hover:bg-[#333333] text-neutral-300 hover:text-white text-xs font-sans transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Syntax highlighted code */}
      <pre className="p-4 overflow-x-auto font-mono-code text-[14px] leading-relaxed text-[#ECECEC] bg-[#0d0d0d]">
        <code 
          className="hljs" 
          dangerouslySetInnerHTML={{ __html: highlightedHtml }} 
        />
      </pre>
    </div>
  );
}

export default function MessageBubble({
  message,
  onOpenPunchcard,
  onRegenerate,
  isStreaming = false
}) {
  const [copiedText, setCopiedText] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.sender === 'user';
  const spirit = SPIRITS[message.spiritId] || SPIRITS.pli;

  // Copy entire message text
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.text || '');
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Text-to-Speech
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = (message.text || '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[*_#]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 0.85;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Parse initial stage direction if text begins with *...*
  const { stageDirection, markdownBody } = useMemo(() => {
    const raw = message.text || '';
    const match = raw.match(/^\*([^*\n]+(?:\n[^*\n]+)*)\*(\n\n|\n|$)/);
    if (match) {
      return {
        stageDirection: match[1].trim(),
        markdownBody: raw.slice(match[0].length)
      };
    }
    return {
      stageDirection: null,
      markdownBody: raw
    };
  }, [message.text]);

  // User Message: Right-aligned bubble, bg #2f2f2f, radius 20px, padding 10px 16px, max-width 70%
  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in w-full">
        <div className="max-w-[70%] bg-[#2f2f2f] text-[#ECECEC] rounded-[20px] py-[10px] px-[16px] text-[16px] leading-[1.75] tracking-[-0.01em] shadow-xs">
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
      </div>
    );
  }

  // Assistant Message: No bubble, plain text, full column width, avatar on left, line-height 1.75, 16px
  return (
    <div className="flex items-start gap-3.5 group animate-fade-in w-full">
      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        <div 
          className="w-7 h-7 rounded-full bg-[#212121] border border-[#2a2a2a] flex items-center justify-center font-bold text-xs shadow-xs"
          style={{ color: spirit.accentColor }}
        >
          {spirit.sigil}
        </div>
      </div>

      {/* Main Content Column */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Subtle name and era */}
        <div className="flex items-center gap-2 text-[#9b9b9b] text-xs">
          <span className="font-semibold text-neutral-300">
            {spirit.name}
          </span>
          <span className="text-[11px] font-mono opacity-70">
            {spirit.era}
          </span>
          {message.diagnosticCode && (
            <span className="text-[10px] font-mono-code text-emerald-400/90 bg-[#171717] px-1.5 py-0.5 rounded border border-[#2a2a2a]">
              {message.diagnosticCode}
            </span>
          )}
        </div>

        {/* Typing indicator: three pulsing dots before first token arrives */}
        {isStreaming && !message.text ? (
          <div className="flex items-center gap-1.5 py-2">
            <span className="w-2 h-2 rounded-full bg-[#9b9b9b] typing-dot"></span>
            <span className="w-2 h-2 rounded-full bg-[#9b9b9b] typing-dot"></span>
            <span className="w-2 h-2 rounded-full bg-[#9b9b9b] typing-dot"></span>
          </div>
        ) : (
          <div className="text-[16px] leading-[1.75] tracking-[-0.01em] text-[#ECECEC] font-sans">
            {/* Italic amber stage direction strictly at start of message */}
            {stageDirection && (
              <div className="italic text-amber-300/90 text-[15px] leading-relaxed mb-3 font-normal">
                *{stageDirection}*
              </div>
            )}

            {/* Markdown rendering via react-markdown + remark-gfm */}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-[1.5rem] font-semibold text-[#ECECEC] mt-[1.2em] mb-2 leading-tight">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-[1.25rem] font-semibold text-[#ECECEC] mt-[1.2em] mb-2 leading-snug">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-[1.1rem] font-semibold text-[#ECECEC] mt-[1.2em] mb-2 leading-snug">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-3.5 last:mb-0 leading-[1.75] text-[16px] text-[#ECECEC]">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="pl-[1.5rem] my-3 list-disc space-y-[0.4rem] text-[#ECECEC] leading-[1.75]">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="pl-[1.5rem] my-3 list-decimal space-y-[0.4rem] text-[#ECECEC] leading-[1.75]">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="leading-[1.75]">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-amber-400 pl-4 py-1 italic text-neutral-300 my-3 leading-[1.75]">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4 border border-white/10 rounded-[12px]">
                    <table className="w-full text-left text-sm text-[#ECECEC] border-collapse">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-white/[0.06] text-white border-b border-white/10 font-semibold">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-white/5">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="even:bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2.5 font-semibold text-white">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2.5 text-neutral-300">{children}</td>
                ),
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                    {children}
                  </a>
                ),
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const content = String(children);
                  if (!match && !content.includes('\n')) {
                    return (
                      <code className="font-mono-code text-[0.9em] bg-white/[0.08] px-[6px] py-[2px] rounded-[6px] text-amber-200/90" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <CodeBlock
                      language={match ? match[1] : ''}
                      code={content.replace(/\n$/, '')}
                      onOpenPunchcard={onOpenPunchcard}
                    />
                  );
                }
              }}
            >
              {markdownBody}
            </ReactMarkdown>

            {/* Blinking cursor at end of streaming message */}
            {isStreaming && (
              <span className="inline-block w-[2px] h-[18px] bg-[#ECECEC] ml-1 animate-blinking-cursor align-middle" />
            )}
          </div>
        )}

        {/* Action row under each assistant reply: copy, regenerate, speak - visible on hover only */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between pt-1 text-[#9b9b9b] text-xs">
          {/* Card footer (kept monospace) */}
          <div>
            {message.punchcardLine && (
              <button
                onClick={() => onOpenPunchcard && onOpenPunchcard(message.punchcardLine)}
                className="flex items-center gap-1.5 hover:text-amber-300 font-mono-code text-[11px] transition-colors cursor-pointer"
                title="Inspect Hollerith Punchcard"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Card: {message.punchcardLine.slice(0, 24)}...</span>
              </button>
            )}
          </div>

          {/* Action buttons: copy, regenerate, speak */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyMessage}
              className="p-1.5 rounded-[8px] hover:bg-[#212121] hover:text-white transition-colors cursor-pointer"
              title="Copy message"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-[8px] hover:bg-[#212121] hover:text-white transition-colors cursor-pointer"
                title="Regenerate response"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleSpeak}
              className={`p-1.5 rounded-[8px] hover:bg-[#212121] transition-colors cursor-pointer ${
                isSpeaking ? 'text-amber-400' : 'hover:text-white'
              }`}
              title={isSpeaking ? 'Stop voice' : 'Read aloud'}
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
