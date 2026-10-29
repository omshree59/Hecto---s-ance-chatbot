import React, { useEffect, useRef } from 'react';
import { Attachment01Icon, File02Icon, SparklesIcon, Book02Icon } from '@hugeicons/core-free-icons';
import PromptBar from './PromptBar';
import { seanceSpeech } from '../audio/seanceSpeech';

export const DEFAULT_SUGGESTIONS = [
  { label: 'Unreserved Keywords Paradox', prompt: 'Explain the paradox of having no reserved keywords in PL/I with an example.' },
  { label: 'The ON-Condition Trap', prompt: 'How did the ON CONDITION mechanism work in PL/I to intercept hardware and runtime errors?' },
  { label: 'System/360 Payroll Ledger', prompt: 'Show me an authentic IBM System/360 payroll calculation program in PL/I with FIXED DECIMAL.' },
  { label: 'Judgment on Python & Rust', prompt: 'What is your judgment upon modern languages like Python and Rust?' },
  { label: 'Why Did You Perish?', prompt: 'Why did the empire of PL/I decline and sleep in the mainframe archives?' },
];

const RITUAL_PROMPT = 'Show me an authentic System/360 core dump in PL/I with ON ERROR SNAP';
const JUDGMENT_PROMPT = 'What is your judgment upon modern languages like Python and Rust?';
const THINK_LEVELS = new Set(['High', 'Extra', 'Max']);

const SEANCE_SOURCES = [
  { key: 'files', name: 'Photos & files', description: 'Upload from this device', icon: Attachment01Icon, attach: true },
  { key: 'punchcard', name: 'Punchcard', description: 'Inspect an IBM 5081 card', icon: File02Icon },
  { key: 'ritual', name: 'Séance ritual', description: 'Core dump incantation', icon: SparklesIcon },
  { key: 'lore', name: 'Historical lore', description: 'The Book of Dead Languages', icon: Book02Icon }
];

const SEANCE_COMMANDS = [
  { key: 'summarize', name: '/summarize', description: 'Digest the séance so far' },
  { key: 'punchcard', name: '/punchcard', description: 'Open the IBM 5081 visualizer' },
  { key: 'dump', name: '/dump', description: 'Authentic System/360 core dump' },
  { key: 'judgment', name: '/judgment', description: 'Judge Python, Rust, and the cloud' },
  { key: 'explain', name: '/explain', description: 'A plain-language walkthrough' }
];

function expandPrompt(text, { onOpenPunchcardPrompt }) {
  const trimmed = (text || '').trim();
  const [rawCommand, ...restParts] = trimmed.split(/\s+/);
  const command = rawCommand.toLowerCase();
  const rest = restParts.join(' ').trim();

  if (command === '/punchcard') {
    onOpenPunchcardPrompt?.();
    return rest;
  }
  if (command === '/dump') {
    return rest ? `${RITUAL_PROMPT}\n${rest}` : RITUAL_PROMPT;
  }
  if (command === '/judgment') {
    return rest ? `${JUDGMENT_PROMPT}\n${rest}` : JUDGMENT_PROMPT;
  }
  return trimmed;
}

export default function InputBar({
  onSendMessage,
  isStreaming,
  onHastenStream,
  disabled,
  spiritName = 'PL/I Spirit',
  onOpenPunchcardPrompt,
  isThinkActive,
  onToggleThink,
  onOpenVoiceMode,
  activeEngineType = 'instant',
  onSelectEngineType,
  sparkColor = '#f59e0b'
}) {
  const fileInputRef = useRef(null);
  const filePickResolve = useRef(null);

  useEffect(() => {
    const stop = () => seanceSpeech.stopListening();
    window.addEventListener('prompt-bar-dictate-stop', stop);
    return () => {
      window.removeEventListener('prompt-bar-dictate-stop', stop);
      seanceSpeech.stopListening();
    };
  }, []);

  const pickFiles = () =>
    new Promise(resolve => {
      const input = fileInputRef.current;
      if (!input) {
        resolve([]);
        return;
      }
      filePickResolve.current = resolve;
      const finish = files => {
        filePickResolve.current = null;
        input.onchange = null;
        input.oncancel = null;
        resolve(files);
      };
      input.onchange = () => {
        const names = Array.from(input.files || []).map(file => file.name);
        input.value = '';
        finish(names);
      };
      input.oncancel = () => finish([]);
      input.click();
    });

  const transcribe = () =>
    new Promise((resolve, reject) => {
      let collected = '';
      try {
        seanceSpeech.startListening({
          onTranscript: ({ final }) => {
            if (final) collected = collected ? `${collected} ${final}` : final;
          },
          onEnd: () => resolve(collected.trim()),
          onError: err => {
            if (err === 'aborted' || err === 'no-speech' || err === 'canceled') {
              resolve(collected.trim());
              return;
            }
            reject(err);
          }
        });
      } catch (err) {
        alert(err.message || 'Speech recognition not supported in this browser.');
        reject(err);
      }
    });

  const send = (text, { attachments = [], model } = {}) => {
    if (disabled && !isStreaming) return;

    if (model?.key && model.key !== activeEngineType && onSelectEngineType) {
      onSelectEngineType(model.key);
    }

    let composed = expandPrompt(text, { onOpenPunchcardPrompt });
    if (attachments.length > 0) {
      const note = `[Attached artifacts: ${attachments.join(', ')}]`;
      composed = composed ? `${composed}\n\n${note}` : note;
    }

    if (!composed) return;
    onSendMessage(composed);
  };

  return (
    <div className="relative w-full">
      <input ref={fileInputRef} type="file" multiple className="hidden" tabIndex={-1} aria-hidden="true" />
      <PromptBar
        placeholder={`Message ${spiritName}…`}
        sources={SEANCE_SOURCES}
        commands={SEANCE_COMMANDS}
        models={[
          { key: 'instant', name: 'Instant', tag: '0ms' },
          { key: 'gemma', name: 'Gemma 2B', tag: 'WebGPU' }
        ]}
        defaultModel={activeEngineType}
        efforts={['Low', 'Medium', 'High', 'Extra', 'Max']}
        defaultEffort={isThinkActive ? 'High' : 'Medium'}
        onEffortChange={effort => {
          const think = THINK_LEVELS.has(effort);
          if (typeof isThinkActive === 'boolean' && think !== isThinkActive && onToggleThink) {
            onToggleThink();
          }
        }}
        busy={isStreaming}
        onSend={send}
        onStop={onHastenStream}
        onAttach={pickFiles}
        onDictate={transcribe}
        background="#212121"
        color="#f5f5f5"
        menuBackground="#2a2a2a"
        sparkColor={sparkColor}
        sparkBoost={1}
        width={760}
        radius={22}
        maxRows={5}
        morphDuration={240}
        squash={0.12}
        tilt={8}
        pressScale={0.96}
        className="w-full max-w-full z-20"
      />
    </div>
  );
}
