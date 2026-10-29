import React, { useState, useEffect } from 'react';
import { 
  SquarePen, Search, PanelLeft, BookOpen, Flame, Volume2, 
  VolumeX, Pin, Trash2, Cpu, ChevronDown, Check, User, X,
  Pencil, MessageSquare
} from 'lucide-react';
import { SPIRITS } from '../engine/necromancyEngine';
import { seanceDB } from '../db/seanceDB';

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  pinnedSessionIds = [],
  onTogglePin,
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
  onCloseMobile,
  onToggleSidebar
}) {
  const [showCandleSettings, setShowCandleSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitleText, setEditTitleText] = useState('');

  // Perform full-text search across messages in IndexedDB when searchQuery changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    let isCurrent = true;
    const timer = setTimeout(async () => {
      try {
        const matches = await seanceDB.searchSessions(searchQuery);
        if (isCurrent) {
          setSearchResults(matches);
        }
      } catch (e) {
        // Fallback to title filtering
        if (isCurrent) {
          const q = searchQuery.toLowerCase();
          const fallbackMatches = sessions
            .filter(s => (s.title || '').toLowerCase().includes(q))
            .map(s => ({ session: s, matchedSnippet: s.title }));
          setSearchResults(fallbackMatches);
        }
      }
    }, 150);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [searchQuery, sessions]);

  const handleStartRename = (session, e) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitleText(session.title || '');
  };

  const handleSaveRename = (sessionId) => {
    if (editTitleText.trim() && onRenameSession) {
      onRenameSession(sessionId, editTitleText.trim());
    }
    setEditingSessionId(null);
  };

  const pinnedSessions = sessions.filter(s => pinnedSessionIds.includes(s.id));
  const recentSessions = sessions.filter(s => !pinnedSessionIds.includes(s.id));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#171717] border-r border-[#2a2a2a] 
        flex flex-col text-[#ECECEC] transition-transform duration-200 ease-in-out shrink-0 select-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* 1. Header row: app name "Séance" (bold, 20px) + search icon + sidebar-toggle icon */}
        <div className="h-14 px-3.5 flex items-center justify-between border-b border-transparent shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-sans text-[20px] font-bold text-white tracking-tight">
              Séance
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#212121] text-[#9b9b9b] rounded-[6px] border border-[#2a2a2a] font-medium">
              PL/I
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setIsSearching(!isSearching);
                if (isSearching) {
                  setSearchQuery('');
                  setSearchResults([]);
                }
              }}
              className="p-2 rounded-[12px] hover:bg-[#212121] text-[#9b9b9b] hover:text-[#ECECEC] transition-colors cursor-pointer"
              title="Search séances"
            >
              {isSearching ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
            <button
              onClick={onToggleSidebar || onCloseMobile}
              className="p-2 rounded-[12px] hover:bg-[#212121] text-[#9b9b9b] hover:text-[#ECECEC] transition-colors cursor-pointer"
              title="Toggle sidebar"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search bar row if searching */}
        {isSearching && (
          <div className="px-3 pb-2 shrink-0">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search séances & topics..."
                autoFocus
                className="w-full bg-[#212121] text-[#ECECEC] placeholder-[#9b9b9b] text-sm px-3 py-1.5 rounded-[12px] border border-[#2a2a2a] focus:outline-none focus:border-neutral-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2. "New séance" row with pencil/compose icon, highlighted background #212121 */}
        <div className="px-3 pt-1 pb-2 shrink-0">
          <button
            onClick={onNewSession}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] bg-[#212121] hover:bg-[#282828] text-white text-[15px] font-medium transition-colors cursor-pointer"
          >
            <SquarePen className="w-4 h-4 text-[#ECECEC]" />
            <span>New séance</span>
          </button>
        </div>

        {/* 3. Nav list (Codex, Manifestation & Candles, Sound toggle) */}
        <div className="px-3 space-y-0.5 shrink-0 border-b border-[#242424] pb-2">
          {/* Codex */}
          <button
            onClick={onOpenCodex}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[12px] hover:bg-[#212121] text-[15px] text-[#ECECEC] transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#9b9b9b]" />
            <span>Codex</span>
          </button>

          {/* Manifestation & Candles */}
          <button
            onClick={() => setShowCandleSettings(!showCandleSettings)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] hover:bg-[#212121] text-[15px] text-[#ECECEC] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Manifestation & Candles</span>
            </div>
            <span className="text-[12px] text-[#9b9b9b] font-mono">
              {candleIntensity}
            </span>
          </button>

          {/* Manifestation Drawer inline if open */}
          {showCandleSettings && (
            <div className="p-3 bg-[#1e1e1e] rounded-[12px] space-y-2.5 my-1 text-xs text-[#9b9b9b] border border-[#2a2a2a]">
              <div className="flex justify-between items-center text-[11px]">
                <span>Speed: <strong className="text-white">{manifestSpeed}</strong></span>
                <div className="flex gap-1">
                  {['whisper', 'swift', 'instant'].map(spd => (
                    <button
                      key={spd}
                      onClick={() => onChangeSpeed(spd)}
                      className={`px-2 py-0.5 rounded-[6px] text-[10px] uppercase font-mono ${
                        manifestSpeed === spd ? 'bg-[#2f2f2f] text-white font-semibold' : 'hover:text-white'
                      }`}
                    >
                      {spd[0]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span>Candle: <strong className="text-white">{candleIntensity}</strong></span>
                <div className="flex gap-1">
                  {['Subtle', 'Ritual', 'Blazing'].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => onChangeCandleIntensity(lvl)}
                      className={`px-1.5 py-0.5 rounded-[6px] text-[10px] ${
                        candleIntensity === lvl ? 'bg-[#2f2f2f] text-white font-semibold' : 'hover:text-white'
                      }`}
                    >
                      {lvl[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sound (Muted / Play toggle) */}
          <button
            onClick={onToggleAudio}
            className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] hover:bg-[#212121] text-[15px] text-[#ECECEC] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              {isAudioPlaying ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-[#9b9b9b]" />
              )}
              <span>Sound {isAudioPlaying ? '(Play)' : '(Muted)'}</span>
            </div>
            <span className="text-[11px] font-mono text-[#9b9b9b]">
              {isAudioPlaying ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* 4, 5, 6, 7. Scrollable Section: Search results or Pinned, Projects, Recents */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* SEARCH RESULTS VIEW */}
          {isSearching && searchQuery.trim() ? (
            <div>
              <div className="text-[12px] font-semibold text-neutral-400 px-3 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>Search Results ({searchResults.length})</span>
              </div>
              {searchResults.length === 0 ? (
                <div className="text-[13px] text-[#9b9b9b] px-3 py-2 italic opacity-60">
                  No séances found matching "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map(({ session: s, matchedSnippet }) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        onSelectSession(s.id);
                        if (isOpen && onCloseMobile) onCloseMobile();
                      }}
                      className={`p-2.5 rounded-[12px] cursor-pointer transition-colors border border-transparent ${
                        s.id === activeSessionId 
                          ? 'bg-[#212121] border-[#2a2a2a] text-white' 
                          : 'hover:bg-[#212121] text-[#ECECEC]'
                      }`}
                    >
                      <div className="text-[14px] font-medium truncate">
                        {s.title || 'Untitled Séance'}
                      </div>
                      <div className="text-[11px] text-[#9b9b9b] line-clamp-2 mt-0.5 font-mono">
                        {matchedSnippet}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* 4. Section label "Pinned" */}
              <div>
                <div className="text-[14px] text-[#9b9b9b] px-3 pb-1 font-medium">
                  Pinned
                </div>
                {pinnedSessions.length === 0 ? (
                  <div className="text-[13px] text-[#9b9b9b] px-3 py-1 opacity-60 italic">
                    No pinned séances
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {pinnedSessions.map(s => {
                      const isActive = s.id === activeSessionId;
                      const isEditingThis = editingSessionId === s.id;

                      return (
                        <div
                          key={s.id}
                          onClick={() => onSelectSession(s.id)}
                          className={`group flex items-center justify-between px-3 py-1.5 rounded-[12px] cursor-pointer text-[14px] transition-colors ${
                            isActive ? 'bg-[#212121] text-white font-medium' : 'text-[#ECECEC] hover:bg-[#212121]'
                          }`}
                        >
                          {isEditingThis ? (
                            <input
                              type="text"
                              value={editTitleText}
                              onChange={(e) => setEditTitleText(e.target.value)}
                              onBlur={() => handleSaveRename(s.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(s.id);
                                if (e.key === 'Escape') setEditingSessionId(null);
                              }}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              className="w-full bg-[#171717] text-white text-xs px-2 py-0.5 rounded border border-neutral-500 focus:outline-none"
                            />
                          ) : (
                            <>
                              <span className="truncate pr-2">{s.title || 'Untitled Séance'}</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                                <button
                                  onClick={(e) => handleStartRename(s, e)}
                                  className="p-1 text-[#9b9b9b] hover:text-white"
                                  title="Rename séance"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onTogglePin && onTogglePin(s.id);
                                  }}
                                  className="p-1 text-[#9b9b9b] hover:text-white"
                                  title="Unpin"
                                >
                                  <Pin className="w-3.5 h-3.5 fill-current" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 5. Section label "Projects" with muted empty state "No projects" */}
              <div>
                <div className="text-[14px] text-[#9b9b9b] px-3 pb-1 font-medium">
                  Projects
                </div>
                <div className="text-[13px] text-[#9b9b9b] px-3 py-1 opacity-60">
                  No projects
                </div>
              </div>

              {/* 6. Section label "Recents", then list of séance transcripts */}
              <div>
                <div className="text-[14px] text-[#9b9b9b] px-3 pb-1 font-medium">
                  Recents
                </div>
                {recentSessions.length === 0 ? (
                  <div className="text-[13px] text-[#9b9b9b] px-3 py-1 opacity-60 italic">
                    No recent séances
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {recentSessions.map(s => {
                      const isActive = s.id === activeSessionId;
                      const isEditingThis = editingSessionId === s.id;

                      return (
                        <div
                          key={s.id}
                          onClick={() => onSelectSession(s.id)}
                          className={`group flex items-center justify-between px-3 py-1.5 rounded-[12px] cursor-pointer text-[14px] transition-colors ${
                            isActive ? 'bg-[#212121] text-white font-medium' : 'text-[#ECECEC] hover:bg-[#212121]'
                          }`}
                        >
                          {isEditingThis ? (
                            <input
                              type="text"
                              value={editTitleText}
                              onChange={(e) => setEditTitleText(e.target.value)}
                              onBlur={() => handleSaveRename(s.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(s.id);
                                if (e.key === 'Escape') setEditingSessionId(null);
                              }}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              className="w-full bg-[#171717] text-white text-xs px-2 py-0.5 rounded border border-neutral-500 focus:outline-none"
                            />
                          ) : (
                            <>
                              <span className="truncate pr-2">{s.title || 'Untitled Séance'}</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                                <button
                                  onClick={(e) => handleStartRename(s, e)}
                                  className="p-1 text-[#9b9b9b] hover:text-white"
                                  title="Rename séance"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                {onTogglePin && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onTogglePin(s.id);
                                    }}
                                    className="p-1 text-[#9b9b9b] hover:text-white"
                                    title="Pin to top"
                                  >
                                    <Pin className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteSession(s.id);
                                  }}
                                  className="p-1 text-[#9b9b9b] hover:text-red-400"
                                  title="Delete transcript"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 8. Bottom (sticky): Intelligence Core switch, Ancestor dropdown, User profile row */}
        <div className="p-3 border-t border-[#242424] bg-[#171717] space-y-2 shrink-0">
          {/* Intelligence Core switch (Instant / Gemma 2B, OFFLINE badge) */}
          <div className="p-2 bg-[#212121] rounded-[12px] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-[#9b9b9b] px-1 font-medium">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-[#ECECEC]" />
                Intelligence Core
              </span>
              <span className="text-[10px] font-mono text-emerald-400">OFFLINE</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => onSelectEngineType('instant')}
                className={`py-1 px-1.5 rounded-[8px] text-[11px] font-medium text-center transition-colors cursor-pointer ${
                  activeEngineType === 'instant'
                    ? 'bg-[#2f2f2f] text-white'
                    : 'text-[#9b9b9b] hover:text-[#ECECEC]'
                }`}
              >
                Instant
              </button>
              <button
                onClick={() => onSelectEngineType('gemma')}
                className={`py-1 px-1.5 rounded-[8px] text-[11px] font-medium text-center transition-colors cursor-pointer ${
                  activeEngineType === 'gemma'
                    ? 'bg-[#2f2f2f] text-white'
                    : 'text-[#9b9b9b] hover:text-[#ECECEC]'
                }`}
              >
                Gemma 2B
              </button>
            </div>
          </div>

          {/* Summoned Ancestor dropdown (compact) */}
          <div className="relative">
            <select
              value={activeSpiritId}
              onChange={(e) => onSelectSpirit(e.target.value)}
              className="w-full bg-[#212121] border border-transparent rounded-[12px] px-3 py-1.5 text-[13px] text-white font-medium appearance-none focus:outline-none cursor-pointer"
            >
              {Object.values(SPIRITS).map(spirit => (
                <option key={spirit.id} value={spirit.id} className="bg-[#212121] text-white">
                  {spirit.sigil} {spirit.name} ({spirit.era.split('—')[0].trim()})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#9b9b9b] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* User profile row (avatar + name) */}
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-[12px] hover:bg-[#212121] transition-colors cursor-pointer text-[14px]">
            <div className="w-7 h-7 rounded-full bg-[#2f2f2f] flex items-center justify-center text-xs font-semibold text-white">
              <User className="w-4 h-4 text-[#ECECEC]" />
            </div>
            <div className="truncate font-medium text-[#ECECEC]">
              The Medium
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
