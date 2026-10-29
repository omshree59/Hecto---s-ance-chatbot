import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import PunchcardVisualizer from './components/PunchcardVisualizer';
import LoreModal from './components/LoreModal';
import { necromancyEngine, SPIRITS } from './engine/necromancyEngine';
import { gemmaEngine } from './engine/gemmaEngine';
import { seanceAudio } from './audio/seanceAudio';

const STORAGE_KEY = 'seance_sessions_v5';
const PINNED_KEY = 'seance_pinned_v1';

export default function App() {
  // --- Persistent Sessions & Settings ---
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    const initialId = 'seance-' + Date.now();
    return [{
      id: initialId,
      title: 'Invocation of the IBM System/360',
      spiritId: 'pli',
      timestamp: new Date().toISOString(),
      messages: [] // Empty state so "What shall we summon?" is shown!
    }];
  });

  const [pinnedSessionIds, setPinnedSessionIds] = useState(() => {
    try {
      const saved = localStorage.getItem(PINNED_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return sessions[0]?.id || '';
  });

  const [activeSpiritId, setActiveSpiritId] = useState(() => {
    const active = sessions.find(s => s.id === activeSessionId);
    return active?.spiritId || 'pli';
  });

  // AI Engine Type: 'instant' (PL/I Necromancy Engine) | 'gemma' (WebGPU Gemma 2B)
  const [activeEngineType, setActiveEngineType] = useState('instant');
  const [gemmaStatus, setGemmaStatus] = useState({
    isLoading: false,
    isReady: false,
    progress: 0,
    statusText: ''
  });

  // "Think" Mode (toggles deeper / deliberate manifestation mode)
  const [isThinkActive, setIsThinkActive] = useState(false);

  // Ambiance and Chamber Settings
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.35);
  const [manifestSpeed, setManifestSpeed] = useState('swift'); // 'whisper' | 'swift' | 'instant'
  const [candleIntensity, setCandleIntensity] = useState('Ritual'); // 'Subtle' | 'Ritual' | 'Blazing'

  // Modals & Navigation
  const [punchcardText, setPunchcardText] = useState(null);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Streaming State
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [streamingMessageData, setStreamingMessageData] = useState(null);
  const streamTimerRef = useRef(null);
  const initialTypingDelayRef = useRef(null);
  const fullResponseRef = useRef(null);

  // Subscribe to Gemma state changes
  useEffect(() => {
    const unsubscribe = gemmaEngine.subscribe(status => {
      setGemmaStatus(status);
    });
    return unsubscribe;
  }, []);

  // Save sessions & pinned to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {}
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem(PINNED_KEY, JSON.stringify(pinnedSessionIds));
    } catch (e) {}
  }, [pinnedSessionIds]);

  // Sync active spirit to engine
  useEffect(() => {
    necromancyEngine.setSpirit(activeSpiritId);
  }, [activeSpiritId]);

  // Audio volume sync
  useEffect(() => {
    seanceAudio.setVolume(audioVolume);
  }, [audioVolume]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // --- Handlers ---
  const handleToggleAudio = () => {
    const newState = seanceAudio.toggleAmbiance();
    setIsAudioPlaying(newState);
  };

  const handleTogglePin = (sessionId) => {
    setPinnedSessionIds(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId) 
        : [...prev, sessionId]
    );
  };

  const handleSelectSpirit = (newSpiritId) => {
    setActiveSpiritId(newSpiritId);
    necromancyEngine.setSpirit(newSpiritId);

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, spiritId: newSpiritId };
      }
      return s;
    }));

    seanceAudio.playChime();
  };

  const handleSelectEngineType = async (engineType) => {
    setActiveEngineType(engineType);
    if (engineType === 'gemma' && !gemmaEngine.isReady) {
      try {
        await gemmaEngine.initialize();
      } catch (err) {
        alert('WebGPU Error: ' + err.message + '\nDefaulting to Instant PL/I Engine.');
        setActiveEngineType('instant');
      }
    }
  };

  const handleNewSession = () => {
    if (isStreaming) handleHastenStream();

    const spirit = SPIRITS[activeSpiritId] || SPIRITS.pli;
    const newSessionId = 'seance-' + Date.now();
    const newSession = {
      id: newSessionId,
      title: `Séance of ${spirit.name}`,
      spiritId: activeSpiritId,
      timestamp: new Date().toISOString(),
      messages: [] // Empty state so "What shall we summon?" displays!
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setIsMobileMenuOpen(false);
    seanceAudio.playChime();
  };

  const handleDeleteSession = (sessionId) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      if (filtered.length === 0) {
        const fallbackId = 'seance-' + Date.now();
        return [{
          id: fallbackId,
          title: 'Invocation of the IBM System/360',
          spiritId: 'pli',
          timestamp: new Date().toISOString(),
          messages: []
        }];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleClearCurrentSession = () => {
    if (isStreaming) handleHastenStream();
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: [] };
      }
      return s;
    }));
  };

  const handleHastenStream = () => {
    if (!isStreaming || !fullResponseRef.current) return;

    if (initialTypingDelayRef.current) {
      clearTimeout(initialTypingDelayRef.current);
      initialTypingDelayRef.current = null;
    }

    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }

    const completed = fullResponseRef.current;
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: [...s.messages, completed]
        };
      }
      return s;
    }));

    setIsStreaming(false);
    setStreamingText('');
    setStreamingMessageData(null);
    fullResponseRef.current = null;
    seanceAudio.playChime();
  };

  // Send message to spirit (supports regeneration)
  const handleSendMessage = async (text, isRegenerate = false) => {
    if (!text.trim() || isStreaming) return;

    let updatedMessages = activeSession.messages;

    if (!isRegenerate) {
      const userMessage = {
        id: 'user-' + Date.now(),
        sender: 'user',
        text: text.trim(),
        timestamp: new Date().toISOString()
      };

      const isFirstUserMessage = !activeSession?.messages.some(m => m.sender === 'user');
      const updatedTitle = isFirstUserMessage
        ? text.slice(0, 32).trim() + (text.length > 32 ? '...' : '')
        : activeSession.title;

      updatedMessages = [...activeSession.messages, userMessage];

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: updatedTitle,
            messages: updatedMessages
          };
        }
        return s;
      }));
    }

    // --- GEMMA WEBGPU ROUTE ---
    if (activeEngineType === 'gemma') {
      setIsStreaming(true);
      setStreamingText('');
      const spiritMessage = {
        id: 'spirit-' + Date.now(),
        sender: 'spirit',
        spiritId: activeSpiritId,
        diagnosticCode: 'GEMMA2B-WEBGPU: NEURAL SOUL CHANNEL OPEN',
        punchcardLine: '000010 /* CHANNELD VIA GOOGLE GEMMA 2B ON WEBGPU */              GEM00010',
        text: '',
        timestamp: new Date().toISOString()
      };
      setStreamingMessageData(spiritMessage);

      try {
        let accumulatedText = '';
        await gemmaEngine.generateStream(updatedMessages, (delta, full) => {
          accumulatedText = full;
          setStreamingText(full);
          seanceAudio.playKeyClick();
        });

        spiritMessage.text = accumulatedText;
        setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, spiritMessage]
            };
          }
          return s;
        }));
        setIsStreaming(false);
        setStreamingText('');
        setStreamingMessageData(null);
        seanceAudio.playChime();
        return;
      } catch (err) {
        console.error('Gemma stream error, falling back to instant:', err);
      }
    }

    // --- INSTANT PL/I NECROMANCY ROUTE ---
    const responsePayload = necromancyEngine.generateResponse(text);
    const spiritMessage = {
      id: 'spirit-' + Date.now(),
      sender: 'spirit',
      spiritId: responsePayload.spirit,
      diagnosticCode: responsePayload.diagnosticCode,
      punchcardLine: responsePayload.punchcardLine,
      text: responsePayload.text,
      timestamp: responsePayload.timestamp
    };

    // Instant delivery
    if (manifestSpeed === 'instant') {
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, spiritMessage]
          };
        }
        return s;
      }));
      seanceAudio.playChime();
      return;
    }

    // Word-by-word streaming with initial 3-dot typing indicator
    setIsStreaming(true);
    setStreamingMessageData(spiritMessage);
    fullResponseRef.current = spiritMessage;
    setStreamingText(''); // Initially empty to show pulsing dots typing indicator

    // Break text into words/tokens
    const tokens = spiritMessage.text.match(/\S+\s*/g) || [spiritMessage.text];
    const baseInterval = manifestSpeed === 'whisper' ? 45 : 28;
    const tokenInterval = isThinkActive ? baseInterval * 1.5 : baseInterval;

    // Show typing indicator for ~350ms before first token arrives
    initialTypingDelayRef.current = setTimeout(() => {
      let tokenIndex = 0;
      let accumulated = '';

      streamTimerRef.current = setInterval(() => {
        if (tokenIndex < tokens.length) {
          accumulated += tokens[tokenIndex];
          setStreamingText(accumulated);
          tokenIndex++;

          if (tokenIndex % 4 === 0) {
            seanceAudio.playKeyClick();
          }
        } else {
          clearInterval(streamTimerRef.current);
          streamTimerRef.current = null;
          setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: [...s.messages, spiritMessage]
              };
            }
            return s;
          }));
          setIsStreaming(false);
          setStreamingText('');
          setStreamingMessageData(null);
          fullResponseRef.current = null;
          seanceAudio.playChime();
        }
      }, tokenInterval);
    }, 350);
  };

  // Regenerate response
  const handleRegenerate = (msgIndex) => {
    if (isStreaming) return;
    const currentMsgs = activeSession.messages;

    let userPrompt = '';
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (currentMsgs[i].sender === 'user') {
        userPrompt = currentMsgs[i].text;
        break;
      }
    }

    if (!userPrompt) return;

    const truncated = currentMsgs.slice(0, msgIndex);
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: truncated };
      }
      return s;
    }));

    handleSendMessage(userPrompt, true);
  };

  // Export séance as markdown file
  const handleExportSession = () => {
    if (!activeSession) return;
    const spirit = SPIRITS[activeSession.spiritId] || SPIRITS.pli;

    let md = `# SÉANCE TRANSCRIPT: ${activeSession.title}\n`;
    md += `*Summoned Entity: ${spirit.name} (${spirit.title})*\n`;
    md += `*Date of Invocations: ${new Date(activeSession.timestamp).toLocaleString()}*\n\n`;
    md += `---\n\n`;

    activeSession.messages.forEach(m => {
      if (m.sender === 'user') {
        md += `### 📜 THE MEDIUM (${new Date(m.timestamp).toLocaleTimeString()}):\n`;
        md += `${m.text}\n\n`;
      } else {
        md += `### 🕯️ ${spirit.name} [${m.diagnosticCode || 'IBM360'}]:\n`;
        if (m.punchcardLine) {
          md += `> Card Deck: \`${m.punchcardLine}\`\n\n`;
        }
        md += `${m.text}\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seance_${activeSession.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#000000] text-[#ECECEC]">
      {/* Sidebar matching ChatGPT's dark UI layout exactly */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          if (isStreaming) handleHastenStream();
          setActiveSessionId(id);
          setIsMobileMenuOpen(false);
        }}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        pinnedSessionIds={pinnedSessionIds}
        onTogglePin={handleTogglePin}
        activeSpiritId={activeSpiritId}
        onSelectSpirit={handleSelectSpirit}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={handleToggleAudio}
        audioVolume={audioVolume}
        onChangeVolume={setAudioVolume}
        manifestSpeed={manifestSpeed}
        onChangeSpeed={setManifestSpeed}
        candleIntensity={candleIntensity}
        onChangeCandleIntensity={setCandleIntensity}
        activeEngineType={activeEngineType}
        onSelectEngineType={handleSelectEngineType}
        gemmaStatus={gemmaStatus}
        onOpenCodex={() => setIsCodexOpen(true)}
        isOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Séance Chamber */}
      <ChatArea
        session={activeSession}
        activeSpiritId={activeSpiritId}
        onSelectSpirit={handleSelectSpirit}
        activeEngineType={activeEngineType}
        onSelectEngineType={handleSelectEngineType}
        gemmaStatus={gemmaStatus}
        onSendMessage={handleSendMessage}
        onNewSession={handleNewSession}
        onRegenerate={handleRegenerate}
        isStreaming={isStreaming}
        streamingText={streamingText}
        streamingMessageData={streamingMessageData}
        onHastenStream={handleHastenStream}
        onClearSession={handleClearCurrentSession}
        onExportSession={handleExportSession}
        onOpenPunchcard={(cardLine) => setPunchcardText(cardLine)}
        onOpenCodex={() => setIsCodexOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={handleToggleAudio}
        isThinkActive={isThinkActive}
        onToggleThink={() => setIsThinkActive(!isThinkActive)}
      />

      {/* Interactive Punchcard Modal */}
      {punchcardText && (
        <PunchcardVisualizer
          lineText={punchcardText}
          onClose={() => setPunchcardText(null)}
        />
      )}

      {/* The Book of Dead Languages Codex Modal */}
      {isCodexOpen && (
        <LoreModal
          onClose={() => setIsCodexOpen(false)}
          onSelectSpirit={handleSelectSpirit}
        />
      )}
    </div>
  );
}
