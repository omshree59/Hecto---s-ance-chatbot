import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import PunchcardVisualizer from './components/PunchcardVisualizer';
import LoreModal from './components/LoreModal';
import VoiceModeModal from './components/VoiceModeModal';
import { necromancyEngine, SPIRITS } from './engine/necromancyEngine';
import { gemmaEngine } from './engine/gemmaEngine';
import { seanceAudio } from './audio/seanceAudio';
import { seanceDB } from './db/seanceDB';

export default function App() {
  // --- Persistent Sessions & Settings from IndexedDB ---
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState('');
  const [pinnedSessionIds, setPinnedSessionIds] = useState([]);
  const [isDBReady, setIsDBReady] = useState(false);

  // Active persona spirit ID
  const [activeSpiritId, setActiveSpiritId] = useState('pli');

  // AI Engine Type: 'instant' (Necromancy Spirit Engine) | 'gemma' (WebGPU Gemma 2B)
  const [activeEngineType, setActiveEngineType] = useState('instant');
  const [gemmaStatus, setGemmaStatus] = useState({
    isLoading: false,
    isReady: false,
    progress: 0,
    statusText: ''
  });

  // "Think" Mode (toggles deeper / deliberate manifestation mode)
  const [isThinkActive, setIsThinkActive] = useState(false);
  const isThinkActiveRef = useRef(false);
  const activeEngineTypeRef = useRef(activeEngineType);

  // Ambiance and Chamber Settings
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.35);
  const [manifestSpeed, setManifestSpeed] = useState('swift'); // 'whisper' | 'swift' | 'instant'
  const [candleIntensity, setCandleIntensity] = useState('Ritual'); // 'Subtle' | 'Ritual' | 'Blazing'

  // Modals & Navigation
  const [punchcardText, setPunchcardText] = useState(null);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);

  // Streaming State
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [streamingMessageData, setStreamingMessageData] = useState(null);
  const streamTimerRef = useRef(null);
  const initialTypingDelayRef = useRef(null);
  const fullResponseRef = useRef(null);

  // 1. Initialize from IndexedDB on startup
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const loadedSessions = await seanceDB.getAllSessions();
        if (isMounted) {
          if (loadedSessions && loadedSessions.length > 0) {
            setSessions(loadedSessions);
            setActiveSessionId(loadedSessions[0].id);
            setActiveSpiritId(loadedSessions[0].spiritId || 'pli');
            setPinnedSessionIds(loadedSessions.filter(s => s.pinned).map(s => s.id));
          } else {
            // Create default session
            const initialSession = {
              id: 'seance-' + Date.now(),
              title: 'Invocation of the IBM System/360',
              spiritId: 'pli',
              pinned: false,
              timestamp: new Date().toISOString(),
              messages: []
            };
            await seanceDB.saveSession(initialSession);
            setSessions([initialSession]);
            setActiveSessionId(initialSession.id);
            setActiveSpiritId('pli');
          }
          setIsDBReady(true);
        }
      } catch (e) {
        console.error('Failed to init IndexedDB:', e);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  // Subscribe to Gemma state changes
  useEffect(() => {
    const unsubscribe = gemmaEngine.subscribe(status => {
      setGemmaStatus(status);
    });
    return unsubscribe;
  }, []);

  // Sync active spirit to necromancy engine
  useEffect(() => {
    necromancyEngine.setSpirit(activeSpiritId);
  }, [activeSpiritId]);

  // Audio volume sync
  useEffect(() => {
    seanceAudio.setVolume(audioVolume);
  }, [audioVolume]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Helper to persist session update to state & IndexedDB
  const updateSession = useCallback(async (sessionId, updater) => {
    setSessions(prev => {
      const next = prev.map(s => {
        if (s.id === sessionId) {
          const updated = typeof updater === 'function' ? updater(s) : { ...s, ...updater };
          seanceDB.saveSession(updated).catch(console.error);
          return updated;
        }
        return s;
      });
      return next;
    });
  }, []);

  // --- Handlers ---
  const handleToggleAudio = () => {
    const newState = seanceAudio.toggleAmbiance();
    setIsAudioPlaying(newState);
  };

  const handleTogglePin = async (sessionId) => {
    await seanceDB.togglePinSession(sessionId);
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return { ...s, pinned: !s.pinned };
      }
      return s;
    }));
    setPinnedSessionIds(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId) 
        : [...prev, sessionId]
    );
  };

  const handleRenameSession = async (sessionId, newTitle) => {
    if (!newTitle.trim()) return;
    await seanceDB.renameSession(sessionId, newTitle.trim());
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return { ...s, title: newTitle.trim() };
      }
      return s;
    }));
  };

  const handleSelectSpirit = (newSpiritId) => {
    setActiveSpiritId(newSpiritId);
    necromancyEngine.setSpirit(newSpiritId);

    if (activeSessionId) {
      updateSession(activeSessionId, { spiritId: newSpiritId });
    }

    seanceAudio.playChime();
  };

  const handleSelectEngineType = async (engineType) => {
    activeEngineTypeRef.current = engineType;
    setActiveEngineType(engineType);
    if (engineType === 'gemma' && !gemmaEngine.isReady) {
      try {
        await gemmaEngine.initialize();
      } catch (err) {
        alert('WebGPU Error: ' + err.message + '\nDefaulting to Instant Engine.');
        activeEngineTypeRef.current = 'instant';
        setActiveEngineType('instant');
      }
    }
  };

  const handleNewSession = async () => {
    if (isStreaming) handleHastenStream();

    const spirit = SPIRITS[activeSpiritId] || SPIRITS.pli;
    const newSessionId = 'seance-' + Date.now();
    const newSession = {
      id: newSessionId,
      title: `Séance of ${spirit.name}`,
      spiritId: activeSpiritId,
      pinned: false,
      timestamp: new Date().toISOString(),
      messages: [] // Empty state so "What shall we summon?" displays!
    };

    await seanceDB.saveSession(newSession);
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setIsMobileMenuOpen(false);
    seanceAudio.playChime();
  };

  const handleDeleteSession = async (sessionId) => {
    await seanceDB.deleteSession(sessionId);
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      if (filtered.length === 0) {
        const fallbackId = 'seance-' + Date.now();
        const fallbackSession = {
          id: fallbackId,
          title: 'Invocation of the IBM System/360',
          spiritId: 'pli',
          pinned: false,
          timestamp: new Date().toISOString(),
          messages: []
        };
        seanceDB.saveSession(fallbackSession);
        setActiveSessionId(fallbackId);
        return [fallbackSession];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0].id);
        setActiveSpiritId(filtered[0].spiritId || 'pli');
      }
      return filtered;
    });
  };

  const handleClearCurrentSession = () => {
    if (isStreaming) handleHastenStream();
    if (activeSessionId) {
      updateSession(activeSessionId, { messages: [] });
    }
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
    if (activeSessionId) {
      updateSession(activeSessionId, s => ({
        ...s,
        messages: [...s.messages, completed]
      }));
    }

    setIsStreaming(false);
    setStreamingText('');
    setStreamingMessageData(null);
    fullResponseRef.current = null;
    seanceAudio.playChime();
  };

  // Async message dispatcher used by Voice Mode
  const handleSendMessageAsync = async (text) => {
    if (!text.trim()) return null;

    const userMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    const isFirst = !activeSession?.messages.some(m => m.sender === 'user');
    const updatedTitle = isFirst ? text.slice(0, 32).trim() : activeSession.title;
    const updatedMsgs = [...(activeSession?.messages || []), userMessage];

    updateSession(activeSessionId, {
      title: updatedTitle,
      messages: updatedMsgs
    });

    if (activeEngineTypeRef.current === 'gemma' && gemmaEngine.isReady) {
      try {
        let full = '';
        await gemmaEngine.generateStream(updatedMsgs, (delta, acc) => {
          full = acc;
        });
        const reply = {
          id: 'spirit-' + Date.now(),
          sender: 'spirit',
          spiritId: activeSpiritId,
          diagnosticCode: 'GEMMA2B-WEBGPU: NEURAL CHANNEL OPEN',
          text: full,
          timestamp: new Date().toISOString()
        };
        updateSession(activeSessionId, s => ({
          ...s,
          messages: [...s.messages, reply]
        }));
        return reply;
      } catch (e) {
        console.warn('Gemma fallback in voice mode:', e);
      }
    }

    // Instant Engine response with Persona Memory
    const payload = necromancyEngine.generateResponse(text, updatedMsgs);
    const spiritReply = {
      id: 'spirit-' + Date.now(),
      sender: 'spirit',
      spiritId: payload.spirit,
      diagnosticCode: payload.diagnosticCode,
      punchcardLine: payload.punchcardLine,
      text: payload.text,
      timestamp: payload.timestamp
    };

    updateSession(activeSessionId, s => ({
      ...s,
      messages: [...s.messages, spiritReply]
    }));

    return spiritReply;
  };

  // Standard chat message submission
  const handleSendMessage = async (text, isRegenerate = false, customHistory = null) => {
    if (!text.trim() || isStreaming) return;

    let updatedMessages = customHistory || activeSession?.messages || [];

    if (!isRegenerate) {
      const userMessage = {
        id: 'user-' + Date.now(),
        sender: 'user',
        text: text.trim(),
        timestamp: new Date().toISOString()
      };

      const isFirstUserMessage = !updatedMessages.some(m => m.sender === 'user');
      const updatedTitle = isFirstUserMessage
        ? text.slice(0, 32).trim() + (text.length > 32 ? '...' : '')
        : activeSession.title;

      updatedMessages = [...updatedMessages, userMessage];

      updateSession(activeSessionId, {
        title: updatedTitle,
        messages: updatedMessages
      });
    }

    // --- GEMMA WEBGPU ROUTE ---
    if (activeEngineTypeRef.current === 'gemma') {
      setIsStreaming(true);
      setStreamingText('');
      const spiritMessage = {
        id: 'spirit-' + Date.now(),
        sender: 'spirit',
        spiritId: activeSpiritId,
        diagnosticCode: 'GEMMA2B-WEBGPU: NEURAL SOUL CHANNEL OPEN',
        punchcardLine: '000010 /* CHANNELLED VIA GOOGLE GEMMA 2B ON WEBGPU */             GEM00010',
        text: '',
        timestamp: new Date().toISOString()
      };
      setStreamingMessageData(spiritMessage);

      try {
        let accumulatedText = '';
        await gemmaEngine.generateStream(updatedMessages, (delta, full) => {
          accumulatedText = full;
          setStreamingText(full);
          seanceAudio.playKeyClick(activeSpiritId);
        });

        spiritMessage.text = accumulatedText;
        updateSession(activeSessionId, s => ({
          ...s,
          messages: [...s.messages, spiritMessage]
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

    // --- INSTANT NECROMANCY SPIRIT ROUTE (With Persona Memory) ---
    const responsePayload = necromancyEngine.generateResponse(text, updatedMessages);
    const spiritMessage = {
      id: 'spirit-' + Date.now(),
      sender: 'spirit',
      spiritId: responsePayload.spirit,
      diagnosticCode: responsePayload.diagnosticCode,
      punchcardLine: responsePayload.punchcardLine,
      text: responsePayload.text,
      timestamp: responsePayload.timestamp
    };

    if (manifestSpeed === 'instant') {
      updateSession(activeSessionId, s => ({
        ...s,
        messages: [...s.messages, spiritMessage]
      }));
      seanceAudio.playChime();
      return;
    }

    // Word-by-word streaming with initial 3-dot typing indicator and persona typing sounds
    setIsStreaming(true);
    setStreamingMessageData(spiritMessage);
    fullResponseRef.current = spiritMessage;
    setStreamingText('');

    const tokens = spiritMessage.text.match(/\S+\s*/g) || [spiritMessage.text];
    const baseInterval = manifestSpeed === 'whisper' ? 45 : 28;
    const tokenInterval = isThinkActiveRef.current ? baseInterval * 1.5 : baseInterval;

    initialTypingDelayRef.current = setTimeout(() => {
      let tokenIndex = 0;
      let accumulated = '';

      streamTimerRef.current = setInterval(() => {
        if (tokenIndex < tokens.length) {
          accumulated += tokens[tokenIndex];
          setStreamingText(accumulated);
          tokenIndex++;

          if (tokenIndex % 3 === 0) {
            seanceAudio.playKeyClick(spiritMessage.spiritId || activeSpiritId);
          }
        } else {
          clearInterval(streamTimerRef.current);
          streamTimerRef.current = null;
          updateSession(activeSessionId, s => ({
            ...s,
            messages: [...s.messages, spiritMessage]
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

  // Regenerate spirit response
  const handleRegenerate = (msgIndex) => {
    if (isStreaming) return;
    const currentMsgs = activeSession?.messages || [];

    let userPrompt = '';
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (currentMsgs[i].sender === 'user') {
        userPrompt = currentMsgs[i].text;
        break;
      }
    }

    if (!userPrompt) return;

    const truncated = currentMsgs.slice(0, msgIndex);
    updateSession(activeSessionId, { messages: truncated });
    handleSendMessage(userPrompt, true, truncated);
  };

  // Edit-and-resend last or any past user message
  const handleEditAndResend = (msgIndex, newText) => {
    if (isStreaming || !newText.trim()) return;
    const currentMsgs = activeSession?.messages || [];

    // Slice all messages before this message index
    const prefix = currentMsgs.slice(0, msgIndex);
    
    // Create updated user message
    const updatedUserMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: newText.trim(),
      timestamp: new Date().toISOString()
    };

    const newHistory = [...prefix, updatedUserMsg];
    updateSession(activeSessionId, { messages: newHistory });

    // Re-trigger response with new history
    handleSendMessage(newText.trim(), true, newHistory);
  };

  // Export session as either Markdown (.md) or JSON (.json)
  const handleExportSession = (format = 'md') => {
    if (!activeSession) return;
    const spirit = SPIRITS[activeSession.spiritId] || SPIRITS.pli;
    const safeTitle = (activeSession.title || 'seance').replace(/[^a-z0-9]/gi, '_').toLowerCase();

    if (format === 'json') {
      const exportData = {
        app: "Séance Offline Chatbot",
        version: "2.0",
        exportTimestamp: new Date().toISOString(),
        session: {
          id: activeSession.id,
          title: activeSession.title,
          spiritId: activeSession.spiritId,
          spiritName: spirit.name,
          spiritFullName: spirit.fullName,
          createdTimestamp: activeSession.timestamp,
          messages: activeSession.messages || []
        }
      };

      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `seance_${safeTitle}.json`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    // Markdown export
    let md = `# SÉANCE TRANSCRIPT: ${activeSession.title}\n`;
    md += `*Summoned Entity: ${spirit.name} (${spirit.title})*\n`;
    md += `*Date of Invocations: ${new Date(activeSession.timestamp).toLocaleString()}*\n\n`;
    md += `---\n\n`;

    (activeSession.messages || []).forEach(m => {
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
    link.download = `seance_${safeTitle}.md`;
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
          const sel = sessions.find(s => s.id === id);
          if (sel?.spiritId) {
            setActiveSpiritId(sel.spiritId);
            necromancyEngine.setSpirit(sel.spiritId);
          }
          setIsMobileMenuOpen(false);
        }}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
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
        onEditAndResend={handleEditAndResend}
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
        onToggleThink={() => {
          isThinkActiveRef.current = !isThinkActiveRef.current;
          setIsThinkActive(isThinkActiveRef.current);
        }}
        onOpenVoiceMode={() => setIsVoiceModeOpen(true)}
        candleIntensity={candleIntensity}
      />

      {/* ChatGPT-style Voice Séance Mode Modal */}
      <VoiceModeModal
        isOpen={isVoiceModeOpen}
        onClose={() => setIsVoiceModeOpen(false)}
        activeSpiritId={activeSpiritId}
        onSendMessageAsync={handleSendMessageAsync}
      />

      {/* Interactive Punchcard Modal */}
      {punchcardText && (
        <PunchcardVisualizer
          lineText={punchcardText}
          onClose={() => setPunchcardText(null)}
          spiritAccentColor={SPIRITS[activeSpiritId]?.accentColor || '#f59e0b'}
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
