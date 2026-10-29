import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import rust from 'highlight.js/lib/languages/rust';
import java from 'highlight.js/lib/languages/java';
import bash from 'highlight.js/lib/languages/bash';
import jsonLang from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import sql from 'highlight.js/lib/languages/sql';
import markdown from 'highlight.js/lib/languages/markdown';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c++', cpp);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('java', java);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('json', jsonLang);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);
import { 
  Copy, Check, Volume2, VolumeX, RotateCw, Terminal, FileText,
  Pencil, X, ArrowUp
} from 'lucide-react';
import { SPIRITS } from '../engine/necromancyEngine';
import { seanceSpeech } from '../audio/seanceSpeech';

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

// Typewriter reveal for the stage-direction line (*...*)
function TypewriterStageDirection({ text, isStreaming }) {
  const [revealedLength, setRevealedLength] = useState(isStreaming ? 0 : text.length);

  useEffect(() => {
    if (!isStreaming) {
      setRevealedLength(text.length);
      return;
    }

    setRevealedLength(0);
    const interval = setInterval(() => {
      setRevealedLength(prev => {
        if (prev >= text.length) {
          clearInterval(interval);
          return text.length;
        }
        return prev + 2;
      });
    }, 18);

    return () => clearInterval(interval);
  }, [text, isStreaming]);

  const displayed = text.slice(0, revealedLength);

  return (
    <div className="italic text-amber-300/90 text-[15px] leading-relaxed mb-3 font-normal border-l-2 border-amber-500/40 pl-3 py-0.5">
      *{displayed}*{revealedLength < text.length && <span className="inline-block w-1.5 h-3.5 bg-amber-400 ml-0.5 animate-pulse" />}
    </div>
  );
}

export default function MessageBubble({
  message,
  onOpenPunchcard,
  onRegenerate,
  onEditAndResend,
  isStreaming = false
}) {
  const [copiedText, setCopiedText] = useState(false);
  const [isSpeakingThis, setIsSpeakingThis] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || '');
  const editTextareaRef = useRef(null);

  const isUser = message.sender === 'user';
  const spirit = SPIRITS[message.spiritId] || SPIRITS.pli;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSpeakingThis) {
        seanceSpeech.stopSpeaking();
      }
    };
  }, [isSpeakingThis]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.selectionStart = editTextareaRef.current.value.length;
    }
  }, [isEditing]);

  // Copy message text
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.text || '');
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Upgraded Persona Text-to-Speech
  const handleSpeak = () => {
    if (isSpeakingThis) {
      seanceSpeech.stopSpeaking();
      setIsSpeakingThis(false);
      return;
    }

    seanceSpeech.speak(message.text, message.spiritId || 'pli', {
      onStart: () => setIsSpeakingThis(true),
      onEnd: () => setIsSpeakingThis(false)
    });
  };

  // Handle Edit Submit
  const handleSaveAndResend = () => {
    if (!editText.trim()) return;
    setIsEditing(false);
    if (onEditAndResend) {
      onEditAndResend(editText.trim());
    }
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
  // Includes hover actions: Copy & Edit-and-resend
  if (isUser) {
    if (isEditing) {
      return (
        <div className="flex justify-end animate-fade-in w-full">
          <div className="w-full max-w-[70%] bg-[#212121] border border-[#3a3a3a] text-[#ECECEC] rounded-[18px] p-3 shadow-lg">
            <textarea
              ref={editTextareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveAndResend();
                } else if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditText(message.text || '');
                }
              }}
              rows={Math.min(6, Math.max(2, editText.split('\n').length))}
              className="w-full bg-[#171717] text-[#ECECEC] text-[15px] leading-relaxed p-2.5 rounded-[12px] border border-[#2e2e2e] focus:outline-none focus:border-neutral-500 resize-none font-sans"
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditText(message.text || '');
                }}
                className="px-3 py-1.5 rounded-[10px] text-xs text-[#9b9b9b] hover:text-white hover:bg-[#282828] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAndResend}
                disabled={!editText.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-white text-black hover:bg-neutral-200 text-xs font-medium transition-colors cursor-pointer disabled:opacity-40"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Save & Resend</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-end group animate-fade-in w-full items-center gap-2">
        {/* User hover actions: Edit & Copy */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[#9b9b9b]">
          {onEditAndResend && (
            <button
              onClick={() => {
                setEditText(message.text || '');
                setIsEditing(true);
              }}
              className="p-1.5 rounded-[8px] hover:bg-[#212121] hover:text-white transition-colors cursor-pointer"
              title="Edit and resend"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleCopyMessage}
            className="p-1.5 rounded-[8px] hover:bg-[#212121] hover:text-white transition-colors cursor-pointer"
            title="Copy message"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="max-w-[70%] bg-[#2f2f2f] text-[#ECECEC] rounded-[20px] py-[10px] px-[16px] text-[16px] leading-[1.75] tracking-[-0.01em] shadow-xs">
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
      </div>
    );
  }

  // Assistant Message: No bubble, plain text, full column width, avatar on left, line-height 1.75, 16px
  return (
    <div className={`flex items-start gap-3.5 group animate-fade-in w-full transition-colors rounded-xl p-1 ${
      isSpeakingThis ? 'bg-amber-500/[0.03]' : ''
    }`}>
      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        <div 
          className={`w-7 h-7 rounded-full bg-[#212121] border border-[#2a2a2a] flex items-center justify-center font-bold text-xs shadow-xs transition-transform ${
            isSpeakingThis ? 'scale-110 ring-2 ring-amber-500/50' : ''
          }`}
          style={{ color: spirit.accentColor }}
        >
          {spirit.sigil}
        </div>
      </div>

      {/* Main Content Column */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Subtle name, era and speaking wave badge */}
        <div className="flex items-center gap-2 text-[#9b9b9b] text-xs">
          <span 
            className="font-semibold"
            style={{ color: spirit.accentColor }}
          >
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
          {isSpeakingThis && (
            <span className="flex items-center gap-1 text-[11px] text-amber-400 font-mono animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              CHANTING
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
          <div className={`text-[16px] leading-[1.75] tracking-[-0.01em] text-[#ECECEC] ${spirit.fontFlavor || 'font-sans'}`}>
            {/* Italic amber stage direction strictly at start of message with typewriter reveal */}
            {stageDirection && (
              <TypewriterStageDirection 
                text={stageDirection} 
                isStreaming={isStreaming} 
              />
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
              className={`p-1.5 rounded-[8px] transition-colors cursor-pointer ${
                isSpeakingThis ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-[#212121] hover:text-white'
              }`}
              title={isSpeakingThis ? 'Stop chanting' : 'Chant response aloud'}
            >
              {isSpeakingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
