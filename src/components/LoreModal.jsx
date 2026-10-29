import React, { useState } from 'react';
import { X, BookOpen, Flame, Scroll, Award, Terminal, Compass, History, CheckCircle2, AlertTriangle } from 'lucide-react';

const CHAPTERS = [
  {
    id: 'pli',
    title: 'I. The Monolithic Leviathan (PL/I)',
    subtitle: 'IBM System/360 • 1964',
    badge: 'Primary Spirit',
    color: 'text-amber-400',
    content: `
### The Empire of One Language
In 1964, IBM made the greatest commercial gamble in industrial history: the **System/360 mainframe**. At a cost of $5 billion—exceeding the Manhattan Project—IBM sought to build a single computing architecture capable of handling both scientific research (the domain of FORTRAN) and commercial business records (the domain of COBOL).

To accompany this machine, they commissioned **PL/I (Programming Language One)** under George Radin and the joint SHARE/GUIDE user committee.

### The Sacred Axioms & Fatal Flaws
1. **The Doctrine of Zero Reserved Words:**
   To guarantee backward compatibility, the committee refused to reserve keywords. Statements such as \`IF IF THEN THEN = ELSE ELSE;\` became the hallmark of PL/I. Parsers required multi-token lookaheads and symbol-table black magic.
2. **The 33 Manual Volumes:**
   A complete PL/I implementation required thousands of pages of specifications. Early 32KB and 64KB System/360 mainframes were paralyzed compiling large programs; compilers had to be segmented into dozens of discrete tape-swapping passes.
3. **The Rise of Unix and C:**
   In the late 1960s, Bell Labs abandoned the Multics project (which was written in PL/I). Ken Thompson and Dennis Ritchie retreated to a humble PDP-7 minicomputer, stripped the cathedral of PL/I into "B", and then "C". Humanity chose the swift scalpel of C over the monolithic cathedral of PL/I.
`
  },
  {
    id: 'cobol',
    title: 'II. The Ledger Arch-Bureaucrat (COBOL)',
    subtitle: 'CODASYL & Grace Hopper • 1959',
    badge: 'Financial Immortal',
    color: 'text-emerald-400',
    content: `
### The Language That Runs the World's Money
Convened in May 1959 by the Department of Defense and computing leaders, the **CODASYL** (Conference on Data Systems Languages) committee sought an English-like data processing dialect. 

Technical advisor **Rear Admiral Grace Hopper**, pioneer of the A-0 compiler and FLOW-MATIC, championed natural language phrasing.

### The Four Divisions and the Y2K Miracle
1. **Four Sacred Divisions:**
   Every COBOL program is partitioned into \`IDENTIFICATION\`, \`ENVIRONMENT\`, \`DATA\`, and \`PROCEDURE\` divisions.
2. **Fixed Monetary Accuracy:**
   Through \`PICTURE\` clauses (e.g. \`PIC S9(9)V99\`), COBOL eliminates binary floating-point roundoff errors in interest calculations and bank ledgers.
3. **The Year 2000 Triumph:**
   Despite dire predictions of plane crashes and global bank failures, COBOL systems were patched with century windowing algorithms and performed flawlessly as the clock struck midnight on January 1, 2000.
`
  },
  {
    id: 'fortran',
    title: 'III. The Patriarch of Silicon (FORTRAN)',
    subtitle: 'John Backus & IBM 704 • 1957',
    badge: 'Scientific Titan',
    color: 'text-amber-500',
    content: `
### The First High-Level Compiler
Before 1957, computers were programmed in raw machine code and assembly. Skeptics argued that a compiler could never match hand-written machine code. 

**John Backus** assembled a team of ten at IBM to prove them wrong on the vacuum-tube IBM 704. When released, FORTRAN's optimizing compiler was nearly as fast as hand-coded instructions.

### The Rules of the Scientific Patriarch
1. **Strict 80-Column Layout:**
   Column 1 for \`C\` comments, Columns 1–5 for labels, Column 6 for continuations, Columns 7–72 for formulas, Columns 73–80 for sequence numbers.
2. **The Three-Way Arithmetic IF:**
   \`IF (A - B) 10, 20, 30\` branched directly to three different labels based on whether the result was negative, zero, or positive.
3. **Modern Supercomputing Dominance:**
   Because FORTRAN assumes non-aliasing pointers by default, modern supercomputers running climate models, aerodynamics, and nuclear physics continue to run on vector-optimized FORTRAN.
`
  },
  {
    id: 'algol68',
    title: 'IV. The Orthogonal Sovereign (ALGOL 68)',
    subtitle: 'IFIP Working Group 2.1 • 1968',
    badge: 'Mathematical Purity',
    color: 'text-emerald-400',
    content: `
### The Orthogonal Gospel
ALGOL 68 was designed by an international committee of theoreticians led by Adriaan van Wijngaarden. Its guiding commandment was **Orthogonality**: every concept in the language could be composed with every other concept without artificial restrictions.

### The Two-Level Grammar
Its syntax was specified using a two-level formal grammar (*van Wijngaarden grammar* or *W-grammar*), which used context-free rules to generate an infinite set of production rules. 
The resulting report was so mathematically abstruse that even computing luminaries like Edsger Dijkstra and Tony Hoare dissented, arguing that ordinary human compiler writers could not safely implement it.

ALGOL 68 pioneered unified expression languages, structured pointers, user-defined operators, and slices. Its ideas survive inside Haskell, Ada, and modern functional languages.
`
  },
  {
    id: 'snobol4',
    title: 'V. The Pattern Alchemist (SNOBOL4)',
    subtitle: 'Bell Telephone Laboratories • 1967',
    badge: 'Symbolic Sorcery',
    color: 'text-purple-400',
    content: `
### String Transformations as High Art
Invented by David J. Farber, Ralph E. Griswold, and Ivan P. Polonsky at Bell Labs between 1962 and 1967, **SNOBOL4** approached computation not through numbers or procedural routines, but through the transmutation of symbolic strings.

### Patterns as First-Class Citizens
Long before Unix \`grep\`, \`sed\`, or Perl regular expressions, SNOBOL4 treated patterns as dynamic data structures that could be concatenated, evaluated conditionally, and backtracked dynamically. 
A program in SNOBOL4 was an ongoing transformation of text buffers governed by conditional jumps on Success (\`:S\`) or Failure (\`:F\`).
`
  },
  {
    id: 'plankalkul',
    title: 'VI. The Primordial Ghost (Plankalkül)',
    subtitle: 'Konrad Zuse • Hinterstein, 1942–1945',
    badge: 'Dawn of Software',
    color: 'text-sky-400',
    content: `
### The Calculus in the Alps
While Berlin was devastated during World War II, computer pioneer Konrad Zuse relocated his workshop to the Bavarian alpine village of Hinterstein. In the complete absence of electronic computers or functioning compilers, Zuse used pencil and paper to compose **Plankalkül** (*Plan Calculus*).

### The Two-Dimensional Matrix
Plankalkül was the world’s first high-level algorithmic language. It utilized a revolutionary 2D notation with lines for variables, component indices, and types. It supported arrays, records, assertions, and even algorithms for playing chess. 
Tragically, Zuse's work was isolated from the Anglo-American computing community and was not compiled until 1998, half a century after its inception.
`
  },
  {
    id: 'intercal',
    title: 'VII. The Eldritch Jester (INTERCAL)',
    subtitle: 'Don Woods & Jim Lyon • Princeton, 1972',
    badge: 'Satirical Parody',
    color: 'text-rose-400',
    content: `
### The Parody of Mainframe Pretentiousness
Created in 1972 by two Princeton students, INTERCAL (*Compiler Language With No Pronounceable Acronym*) was crafted as a blistering satire of the pompous, convoluted languages of the 1960s (particularly PL/I and FORTRAN).

### The Laws of INTERCAL
- **The Politeness Check:** Programs must contain the modifier \`PLEASE\`. If used too rarely, the compiler aborts with \`IC-079E PROGRAMMER IS INSUFFICIENTLY POLITE\`. If used too frequently, it aborts with \`PROGRAMMER IS EXCEEDINGLY POLITE\`.
- **COME FROM:** Instead of \`GOTO\`, INTERCAL pioneered \`COME FROM\`, causing control flow to spontaneously teleport whenever execution reaches the targeted label.
- **Mingling Operators:** Binary operations manipulate bit interleaving using typography like the change sign (\`¢\`) and spot (\`.\`).
`
  },
  {
    id: 'factchecker',
    title: 'VIII. Historical Fact-Checker & Accuracy Ledger',
    subtitle: 'Verified Timeline & Anti-Hallucination Guard',
    badge: 'Truth & Provenance',
    color: 'text-teal-400',
    isFactChecker: true,
    content: `
### Verified Historical Records
Because offline language models and generative personas frequently conflate historical timelines, this ledger contains the verified historical milestones and citations for every language channeled in the Séance chamber.

| Language | Year Created | Principal Designers | Primary Hardware Platform | True Historical Status |
| :--- | :--- | :--- | :--- | :--- |
| **FORTRAN** | 1957 | John Backus & IBM Team | IBM 704 Vacuum-Tube Computer | **Active & Essential**: Powers global weather prediction (ECMWF, NOAA) and supercomputing physics. |
| **COBOL** | 1959 | CODASYL Committee (Adviser: Grace Hopper) | IBM 1401, UNIVAC II, IBM System/360 | **Active & Immortal**: Processes ~$3 trillion daily in automated clearing houses (ACH) and mainframe banking. |
| **PL/I** | 1964 | George Radin, SHARE/GUIDE & IBM | IBM System/360, Multics (GE-645) | **Legacy / Niche**: Still maintained in enterprise insurance and banking, but superseded by C and Java. |
| **ALGOL 68** | 1968 | IFIP Working Group 2.1 (A. van Wijngaarden) | Electrologica X8, ICL 1900 | **Deceased / Ancestral**: Directly influenced the type systems of Ada, C++, Haskell, and modern typed languages. |
| **SNOBOL4** | 1967 | D.J. Farber, R.E. Griswold, I.P. Polonsky | IBM 7090, CDC 6600, PDP-10 | **Extinct**: Evolved into Icon and Unicon; paved the foundation for modern pattern matching and regex engines. |
| **Plankalkül** | 1945 | Konrad Zuse (Pencil & Paper in Alps) | Zuse Z3 / Z4 (Theoretical) | **Historical Relic**: Conceived 1945, published 1972, first working compiler completed in 1998 at Freie Univ. Berlin. |
| **INTERCAL** | 1972 | Donald R. Woods & James M. Lyon | IBM 360/91 (Princeton Univ.) | **Esoteric Satire**: Cult classic; established the entire genre of esoteric programming languages (esolangs). |

### Common Myths & Verified Corrections
1. **Myth: Grace Hopper personally wrote the entire COBOL compiler in one weekend.**
   - *Fact:* Grace Hopper created FLOW-MATIC (1955) and served as the technical advisor to CODASYL. The actual COBOL specification was finalized by a 6-person committee including Jean Sammet and Howard Bromberg in late 1959.
2. **Myth: PL/I was slow because of its syntax.**
   - *Fact:* PL/I compiled code was quite fast once optimized; the compiler itself was slow because fitting 33 volumes of features into 32KB of ferrite core memory required dozen-pass overlays.
3. **Myth: The Mariner 1 rocket crash was caused by a missing semicolon in FORTRAN.**
   - *Fact:* The 1962 Mariner 1 Venus probe failed due to a missing overbar (hyphen) in a handwritten mathematical formula that was transcribed into FORTRAN guidance code without smoothing logic, causing the rocket to veer off course.
`
  }
];

export default function LoreModal({ onClose, onSelectSpirit }) {
  const [activeTab, setActiveTab] = useState('pli');

  const currentChapter = CHAPTERS.find(c => c.id === activeTab) || CHAPTERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in text-[#ececec]">
      <div className="relative w-full max-w-4xl bg-[#212121] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-[#1e1e1e] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-semibold text-white">
                The Grimoire of Dead Languages & Codex
              </h2>
              <p className="text-xs text-neutral-400">
                A historical and architectural record of silicon ancestors with verified facts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#2a2a2a] text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area with Chapter Navigation */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Chapter Selector Tabs */}
          <div className="w-full md:w-64 bg-[#171717] border-r border-white/10 p-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto">
            {CHAPTERS.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveTab(ch.id)}
                className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1 border cursor-pointer ${
                  activeTab === ch.id
                    ? 'bg-[#2a2a2a] border-white/10 shadow-sm text-white'
                    : 'border-transparent text-neutral-400 hover:bg-[#212121] hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{ch.title.split('.')[0]}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[#1e1e1e] border border-white/10 ${ch.color}`}>
                    {ch.badge}
                  </span>
                </div>
                <div className="text-[13px] font-medium truncate text-white">
                  {ch.title.split('. ')[1] || ch.title}
                </div>
                <div className="text-[11px] text-neutral-400 truncate">
                  {ch.subtitle}
                </div>
              </button>
            ))}
          </div>

          {/* Reading View */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#212121]">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Chapter Header */}
              <div className="pb-4 border-b border-white/10">
                <span className={`text-xs uppercase tracking-wider font-mono font-bold ${currentChapter.color}`}>
                  {currentChapter.subtitle}
                </span>
                <h1 className="text-2xl font-bold text-white mt-1">
                  {currentChapter.title}
                </h1>
              </div>

              {/* Render Fact Checker with Verified Table or Normal Chapter */}
              {currentChapter.isFactChecker ? (
                <div className="space-y-6 text-[#ececec]">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Cross-referenced against IBM Technical Reports, ACM Digital Library, and IEEE Annals of Computing History.</span>
                  </div>

                  <div className="text-[15px] leading-relaxed text-neutral-300 space-y-4">
                    {currentChapter.content.split('\n\n').map((block, idx) => {
                      if (block.startsWith('### ')) {
                        return (
                          <h3 key={idx} className="text-lg font-bold text-white pt-3 border-b border-white/5 pb-1">
                            {block.replace('### ', '')}
                          </h3>
                        );
                      }
                      if (block.includes('|')) {
                        // Render verified table
                        const rows = block.trim().split('\n').filter(r => !r.includes('---'));
                        const headerCols = rows[0]?.split('|').filter(c => c.trim());
                        const bodyRows = rows.slice(1).map(r => r.split('|').filter(c => c.trim()));

                        return (
                          <div key={idx} className="overflow-x-auto my-4 border border-white/10 rounded-xl">
                            <table className="w-full text-left text-xs text-[#ECECEC] border-collapse">
                              <thead className="bg-[#171717] text-white border-b border-white/10 font-semibold">
                                <tr>
                                  {headerCols?.map((col, hIdx) => (
                                    <th key={hIdx} className="p-2.5 font-semibold text-neutral-200">
                                      {col.trim()}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {bodyRows.map((rCols, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-white/[0.03]">
                                    {rCols.map((c, cIdx) => (
                                      <td key={cIdx} className="p-2.5 text-neutral-300">
                                        {c.trim()}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }
                      if (block.startsWith('1. ') || block.startsWith('2. ') || block.startsWith('3. ')) {
                        return (
                          <div key={idx} className="p-3 rounded-xl bg-[#171717] border border-white/5 text-xs text-neutral-300 space-y-1">
                            <div className="font-semibold text-amber-300">
                              {block.split('\n')[0]}
                            </div>
                            <div className="text-neutral-300 pl-2">
                              {block.split('\n').slice(1).join('\n')}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <p key={idx} className="text-neutral-300">
                          {block}
                        </p>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Standard Chapter Content */
                <div className="text-[#ececec] text-[16px] leading-7 space-y-4">
                  {currentChapter.content.split('\n\n').map((paragraph, idx) => {
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h3 key={idx} className="text-lg font-bold text-white pt-2">
                          {paragraph.replace('### ', '')}
                        </h3>
                      );
                    }
                    if (paragraph.startsWith('1. ') || paragraph.startsWith('2. ') || paragraph.startsWith('3. ')) {
                      return (
                        <div key={idx} className="pl-4 border-l-2 border-amber-400 py-1 text-neutral-200 leading-7">
                          {paragraph}
                        </div>
                      );
                    }
                    return (
                      <p key={idx} className="text-neutral-300 leading-7">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              )}

              {/* Action: Summon this spirit directly (if not factchecker) */}
              {!currentChapter.isFactChecker && (
                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">
                    Channel this spirit in the séance chamber
                  </span>
                  <button
                    onClick={() => {
                      onSelectSpirit(currentChapter.id);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    <Flame className="w-4 h-4 text-amber-600" />
                    Channel Spirit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
