import React, { useMemo } from 'react';
import { X, Copy, Check, Sparkles } from 'lucide-react';

const HOLLERITH_MAP = {
  ' ': [],
  'A': [12, 1], 'B': [12, 2], 'C': [12, 3], 'D': [12, 4], 'E': [12, 5],
  'F': [12, 6], 'G': [12, 7], 'H': [12, 8], 'I': [12, 9],
  'J': [11, 1], 'K': [11, 2], 'L': [11, 3], 'M': [11, 4], 'N': [11, 5],
  'O': [11, 6], 'P': [11, 7], 'Q': [11, 8], 'R': [11, 9],
  '/': [0, 1], 'S': [0, 2], 'T': [0, 3], 'U': [0, 4], 'V': [0, 5],
  'W': [0, 6], 'X': [0, 7], 'Y': [0, 8], 'Z': [0, 9],
  '0': [0], '1': [1], '2': [2], '3': [3], '4': [4],
  '5': [5], '6': [6], '7': [7], '8': [8], '9': [9],
  '+': [12], '-': [11], '=': [6, 8], '(': [0, 4, 8], ')': [12, 4, 8],
  '*': [11, 4, 8], ',': [0, 3, 8], '.': [12, 3, 8], ';': [11, 6, 8],
  ':': [0, 2, 8], '\'': [4, 8], '"': [7, 8], '>': [0, 6, 8], '<': [12, 4, 8]
};

const ROWS = [12, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function PunchcardVisualizer({ lineText = '', onClose }) {
  const [copied, setCopied] = React.useState(false);

  const paddedText = useMemo(() => {
    let t = (lineText || '').trim().replace(/\t/g, '    ');
    if (t.length > 80) t = t.slice(0, 80);
    return t.padEnd(80, ' ');
  }, [lineText]);

  const punchMatrix = useMemo(() => {
    return Array.from(paddedText).map(char => {
      const upper = char.toUpperCase();
      return HOLLERITH_MAP[upper] || [];
    });
  }, [paddedText]);

  const handleCopyText = () => {
    navigator.clipboard.writeText(paddedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in text-[#ececec]">
      <div className="relative w-full max-w-5xl bg-[#212121] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1e1e1e] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                IBM 5081 Standard 80-Column Punchcard
              </h3>
              <p className="text-xs text-neutral-400">
                Hollerith 12-zone encoding as processed by the IBM 2540 Card Reader on System/360
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] text-xs text-white border border-white/10 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Card' : 'Copy Card Line'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#2a2a2a] text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card Body Container */}
        <div className="p-6 overflow-x-auto flex flex-col items-center justify-center bg-[#181818]">
          <div className="text-xs text-neutral-400 mb-3 flex items-center gap-4">
            <span>◄ Col 1-72: Sacred Incantation (PL/I Logic)</span>
            <span className="text-red-400 font-semibold">Col 73-80: Card Sequence Key ►</span>
          </div>

          {/* Actual Card Render */}
          <div className="relative min-w-[860px] w-full max-w-4xl bg-[#f5ebd7] text-[#2c2720] rounded-sm p-4 shadow-2xl border-2 border-[#d9cca8] select-none">
            {/* Top Cut Corner: Traditional 45-degree corner cut on column 1 */}
            <div 
              className="absolute top-0 left-0 w-6 h-6 bg-[#181818]" 
              style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} 
            />

            {/* IBM 5081 Logo & Header Info */}
            <div className="flex justify-between items-center text-[9px] font-mono tracking-widest text-[#7a6e5b] pb-1 border-b border-[#ded2b5]">
              <span className="font-bold">IBM 5081 STANDARD CARD FORM</span>
              <span>OS/360 OPERATING SYSTEM • SYSTEM/360 MAIN-FRAME</span>
              <span className="font-bold">ENDICOTT & HURSLEY LABS</span>
            </div>

            {/* Top row printed text (interpreting row) */}
            <div className="grid grid-cols-[repeat(80,_minmax(0,_1fr))] text-[10px] font-mono font-bold leading-tight my-1 text-[#1a1815] bg-[#ece2cb] py-0.5 px-0.5 rounded-xs">
              {Array.from(paddedText).map((char, colIdx) => (
                <div 
                  key={colIdx} 
                  className={`text-center h-4 overflow-hidden ${colIdx >= 72 ? 'text-red-700 font-extrabold' : ''}`}
                >
                  {char === ' ' ? '\u00A0' : char}
                </div>
              ))}
            </div>

            {/* Grid of Punch Holes */}
            <div className="mt-2 space-y-1">
              {ROWS.map(rowNum => (
                <div key={rowNum} className="flex items-center text-[8px] font-mono text-[#8a7f6c]">
                  <span className="w-5 text-right pr-1 font-bold select-none opacity-70">
                    {rowNum === 12 ? '12' : rowNum === 11 ? '11' : rowNum}
                  </span>
                  <div className="grid grid-cols-[repeat(80,_minmax(0,_1fr))] flex-1 gap-x-0.5">
                    {punchMatrix.map((punchedRows, colIdx) => {
                      const isPunched = punchedRows.includes(rowNum);
                      return (
                        <div key={colIdx} className="h-2.5 flex items-center justify-center">
                          {isPunched ? (
                            <div 
                              className="w-1.5 h-2.5 bg-[#181818] rounded-[1px] shadow-inner ring-1 ring-black/40"
                              title={`Col ${colIdx + 1}: Row ${rowNum} Punched`}
                            />
                          ) : (
                            <span className="text-[7px] text-[#b8ab92] select-none opacity-40">
                              {rowNum >= 0 && rowNum <= 9 ? rowNum : '•'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <span className="w-5 text-left pl-1 font-bold select-none opacity-70">
                    {rowNum === 12 ? '12' : rowNum === 11 ? '11' : rowNum}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Column Numbers (1 to 80 markers) */}
            <div className="flex items-center text-[7px] font-mono text-[#8a7f6c] mt-2 pt-1 border-t border-[#ded2b5]">
              <span className="w-5 text-right pr-1 opacity-50">COL</span>
              <div className="grid grid-cols-[repeat(80,_minmax(0,_1fr))] flex-1 text-center">
                {Array.from({ length: 80 }).map((_, i) => (
                  <span 
                    key={i} 
                    className={`select-none ${i === 0 || i === 71 || i === 79 || (i + 1) % 10 === 0 ? 'font-bold text-[#4a4235]' : 'opacity-30'}`}
                  >
                    {(i + 1) % 10 === 0 ? (i + 1) : (i === 0 ? '1' : (i + 1) % 5 === 0 ? '5' : '')}
                  </span>
                ))}
              </div>
              <span className="w-5 text-left pl-1 opacity-50">COL</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#1e1e1e] border-t border-white/10 text-xs text-neutral-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Card Feed Status: 80 Columns Verified • 0 Parity Check Errors</span>
          </div>
          <span className="font-mono text-neutral-300 text-xs">
            {paddedText.slice(0, 40)}...
          </span>
        </div>
      </div>
    </div>
  );
}
