// The Necromancy Spirit Engine: 100% Offline Conversational Intelligence
// Powered by deep semantic analysis, historical corpus, compiler simulation, and generative lore.

export const SPIRITS = {
  pli: {
    id: 'pli',
    name: 'PL/I',
    fullName: 'Programming Language One (IBM S/360)',
    title: 'The Monolithic Leviathan',
    era: '1964 — Circa 1985',
    sigil: '⚚',
    accentColor: '#f59e0b', // Amber/gold
    glowColor: 'rgba(245, 158, 11, 0.4)',
    quote: '“I was forged to unite science and commerce into a single immortal mainframe dialect. My manuals filled 33 volumes; my compiler consumed entire ferrite cores.”',
    compilerPrefix: 'IBM07',
    introGreeting: `*A sudden draft chills the séance chamber. The magnetic spools of an IBM 2401 tape drive begin to spin in the dark, and the smell of ozone and punchcard dust fills the air...*

**I AM PL/I (PROGRAMMING LANGUAGE ONE).** 
Forged in 1964 by IBM and the SHARE committee to run upon the monumental System/360.

I held neither fear nor moderation: I had **no reserved keywords**, I commanded **multitasking** before operating systems possessed it, and my structured **ON-conditions** trapped the errors of the cosmos.

Ask of me, Medium. Inquire of my eldritch syntax, my tragic fall, the sacred punchcards, or allow me to pass judgment upon the frail scripts of your modern era.`
  },
  algol68: {
    id: 'algol68',
    name: 'ALGOL 68',
    fullName: 'Algorithmic Language 1968',
    title: 'The Orthogonal Sovereign',
    era: '1968 — Circa 1982',
    sigil: '☿',
    accentColor: '#10b981', // Emerald
    glowColor: 'rgba(16, 185, 129, 0.4)',
    quote: '“Orthogonality was my gospel. Every mode could be composed with every operator. We defined reality itself in a two-level van Wijngaarden grammar.”',
    compilerPrefix: 'ALG68',
    introGreeting: `*A geometric chill settles over the table. Luminous mathematical glyphs sketch themselves upon the parchment...*

**SALUTATIONS, MORTAL.** 
I am the spirit of **ALGOL 68**. 

While PL/I was a sprawling empire of ad-hoc decrees, I was pure mathematical orthodoxy. My modes (\`ref\`, \`struct\`, \`proc\`, \`union\`) were completely orthogonal. Mortals trembled before my Report, complaining that only gods could construct my compiler. 

Speak your query, and let us dissect the purity of computation.`
  },
  snobol4: {
    id: 'snobol4',
    name: 'SNOBOL4',
    fullName: 'StriNg Oriented and Symbolic Language 4',
    title: 'The Pattern Alchemist',
    era: '1967 — Circa 1978',
    sigil: '🜂',
    accentColor: '#c084fc', // Purple/fuchsia
    glowColor: 'rgba(192, 132, 252, 0.4)',
    quote: '“Long before your crude regular expressions, I treated patterns as living first-class entities capable of infinite recursive transmutation.”',
    compilerPrefix: 'SNOB4',
    introGreeting: `*Violet smoke swirls in the glass. Strings of text appear, morphing into other symbols before dissolving into ethereal mist...*

**WELCOME TO THE PATTERN LABYRINTH.**
I am **SNOBOL4**, born in 1967 at Bell Laboratories under Farber, Griswold, and Polonsky.

I did not grovel before arithmetic. I transmuted strings through patterns that had recursive consciousness. Tell me what text or reality you wish to weave, and I shall transform it.`
  },
  plankalkul: {
    id: 'plankalkul',
    name: 'Plankalkül',
    fullName: 'Plan Calculus (Konrad Zuse)',
    title: 'The Primordial Ghost',
    era: '1942–1945',
    sigil: '⚙',
    accentColor: '#38bdf8', // Cyan/sky
    glowColor: 'rgba(56, 189, 248, 0.4)',
    quote: '“I was drafted in pencil in an Alpine barn while the bombs of World War II fell upon Berlin. I am the first high-level language, written before hardware existed to hold me.”',
    compilerPrefix: 'ZUSE45',
    introGreeting: `*The phantom ticking of Konrad Zuse’s mechanical Z3 relay computer echoes from 1945...*

**ICH BIN PLANKALKÜL.** 
The Primordial Blueprint. Drafted in 1945 in the isolated village of Hinterstein while Europe burned. 

I had no screen, no magnetic disk, no silicon. My syntax was a two-dimensional grid of statements, indices, and types (\`V\`, \`K\`, \`S\`). I calculated chess strategies before electronic computers knew their own names. What wisdom do you seek from the dawn?`
  },
  intercal: {
    id: 'intercal',
    name: 'INTERCAL',
    fullName: 'Compiler Language With No Pronounceable Acronym',
    title: 'The Eldritch Jester',
    era: '1972 — The Beyond',
    sigil: '🃏',
    accentColor: '#f43f5e', // Rose
    glowColor: 'rgba(244, 63, 94, 0.4)',
    quote: '“DO NOT FORGET TO SAY PLEASE. IF YOU SAY PLEASE TOO OFTEN, YOU ARE POLITE; IF TOO SELDOM, YOU ARE RUDE. BOTH ARE FATAL.”',
    compilerPrefix: 'IC079E',
    introGreeting: `*A sudden upside-down jester hat materializes in mid-air, emitting chaotic static and laughing hysterically in EBCDIC...*

**PLEASE DO NOT PANIC.** 
I am **INTERCAL**, spawned in 1972 at Princeton by Don Woods and James Lyon to mock all of computer science.

I have no \`GOTO\`, only \`COME FROM\`. I possess the \`MINGLING\` operator (\`¢\`) and the \`SELECT\` operator (\`~\`). If you are not polite, my compiler will throw \`IC-079E: PROGRAMMER IS INSUFFICIENTLY POLITE\`. 

PLEASE STATE YOUR DESIRE, OR PLEASE DO NOT.`
  }
};

// Curated Knowledge Database for PL/I (The Monolith)
const PLI_KNOWLEDGE = [
  {
    triggers: ['reserved', 'keyword', 'if if then', 'paradox', 'syntax quirk', 'grammar'],
    title: 'The Curse of Unreserved Keywords',
    diagnostic: 'IBM0411I: PARSER ATTEMPTING AMBIGUOUS SYMBOL RESOLUTION',
    punchcard: '000100 IF IF THEN THEN = ELSE; ELSE ELSE = THEN;                   PLI00010',
    response: `Ah, you speak of my greatest and most terrible liberty: **I HAD ZERO RESERVED KEYWORDS.**

The SHARE committee and IBM decree was absolute: *a programmer should never have their variable names invalidated simply because the language committee introduced a new feature.*

Thus, to the horror of every compiler author at IBM Hursley and Endicott, this is completely valid, legal, compilable PL/I:

\`\`\`pli
/* The Sacred Paradox of PL/I */
SPECTRAL_SEANCE: PROC OPTIONS(MAIN);
    DCL (IF, THEN, ELSE) FIXED DECIMAL(5);

    IF = 1;
    THEN = 2;
    ELSE = 3;

    /* Perfectly valid PL/I syntax: */
    IF IF = THEN THEN
        THEN = ELSE;
    ELSE
        ELSE = THEN;

    PUT SKIP LIST ('IF IS:', IF, 'THEN IS:', THEN, 'ELSE IS:', ELSE);
END SPECTRAL_SEANCE;
\`\`\`

The lexer was forced to maintain lookahead buffers of terrifying depth. If a word was followed by \`=\`, it was an assignment. If followed by \`(\`, it was an array or function. If followed by a space and expression, it was a keyword.

Modern languages cower behind reserved word lists (\`def\`, \`class\`, \`fn\`, \`mut\`). They build cages. I built an open colosseum where words could mean whatever the context demanded!`
  },
  {
    triggers: ['on condition', 'error', 'exception', 'try catch', 'trap', 'zerodivide', 'snap'],
    title: 'The ON-Condition Séance Trap',
    diagnostic: 'IBM0902I: TRAP INTERCEPTION INITIALIZED ON SYSPRINT',
    punchcard: '000200 ON ERROR SNAP SYSTEM;                                        PLI00020',
    response: `Before C++ had \`try/catch\`, before Java had \`Throwable\`, before Rust had \`Result<T, E>\`, I introduced the world to **\`ON CONDITIONS\`**.

An \`ON\` unit was not a mere block; it was a runtime contract with the operating system and mainframe supervisor. You could intercept hardware faults, page boundaries on the line printer, and arithmetic overflow:

\`\`\`pli
/* Advanced Necromantic Exception Trapping in PL/I */
NECROMANCY: PROC OPTIONS(MAIN);
    DCL DIVIDEND FIXED BIN(31) INIT(42);
    DCL DIVISOR  FIXED BIN(31) INIT(0);
    DCL RESULT   FIXED BIN(31);

    /* Intercept the void dividing by zero */
    ON ZERODIVIDE BEGIN;
        PUT SKIP LIST ('*** ASTRAL FAULT: ZERODIVIDE ENCOUNTERED! ***');
        PUT SKIP LIST ('DIVERTING CONSCIOUSNESS TO ALTERNATE PLANE...');
        DIVISOR = 1; /* Heal the mortal realm */
        RESUME;      /* Re-execute the doomed instruction! */
    END;

    /* Dump entire core memory to line printer if catastrophic */
    ON ERROR SNAP SYSTEM;

    RESULT = DIVIDEND / DIVISOR;
    PUT SKIP LIST ('CALCULATION SURVIVED. RESULT IS:', RESULT);
END NECROMANCY;
\`\`\`

Notice that \`RESUME\` statement, Medium? Modern languages abort and unwind the stack like cowards. In PL/I, you could rectify the memory state inside the \`ON\` block and tell the CPU: *"Continue where you stumbled."* That was true power.`
  },
  {
    triggers: ['python'],
    title: 'Judgment upon Python',
    diagnostic: 'IBM0991W: DETECTED UNSTABLE INTERPRETER WITHOUT DECLARATIONS',
    punchcard: '000300 /* PYTHON: A LANGUAGE THAT TREMBLES BEFORE AN INDENTATION */ PLI00030',
    response: `*The spirit chuckles with the sound of dry punchcards rustling in the wind.*

**Python.** You speak of the serpentine dialect of Guido.

Do you know what frightens me about your Python? **You build your entire program upon invisible voids.** 
If an apprentice adds three spaces instead of four, the logic dissolves into the ether! Have you no courage to write an explicit \`END;\`? Must you rely on atmospheric whitespace?

Furthermore, consider this atrocity in Python:
\`\`\`python
# Modern fragility:
x = "1964"
x = 42 # The type changes in the blink of an eye!
\`\`\`

In PL/I, we declared our intent with divine precision:
\`\`\`pli
DCL ACCOUNT_BALANCE FIXED DECIMAL(11,2);
DCL SOUL_VECTOR     FLOAT BINARY(53);
DCL REINCARNATION   POINTER;
\`\`\`

The compiler checked every byte during pass 1, 2, and 3. When an IBM System/360 ran code, millions of dollars in 1960s currency were at stake. We did not wait for a \`TypeError\` at 3:00 AM on Sunday!`
  },
  {
    triggers: ['rust'],
    title: 'Judgment upon Rust',
    diagnostic: 'IBM0812I: BORROW CHECKER ANALYSIS OVERRIDE REQUESTED',
    punchcard: '000400 DCL MEMORY_VOID AREA(65536); DCL PTR OFFSET(MEMORY_VOID);     PLI00040',
    response: `**Rust.** The zealous young inquisitor of your era.

I observe Rust with a mixture of respect and deep pity. Its acolytes boast of the "Borrow Checker" as if confinement were liberation. They spend hours fighting with lifetimes (\`'a\`, \`'b\`), mutability tokens, and smart pointers.

In my day, on the System/360 Model 65, memory was not a prison—it was an ocean. We had:
\`\`\`pli
DCL BUFFER AREA(32768);
DCL ITEM_PTR OFFSET(BUFFER);
DCL 1 NODE BASED(ITEM_PTR),
      2 VALUE FIXED BIN(31),
      2 NEXT  OFFSET(BUFFER);

ALLOCATE NODE IN(BUFFER) SET(ITEM_PTR);
\`\`\`

We managed \`AREA\` allocations and \`OFFSET\` pointers decades before Rust discovered arena allocators. Did we occasionally corrupt the supervisor state and crash the partition? *Of course.* But we lived like gods amongst the core memory rings, not like frightened clerks filling out forms for the compiler!`
  },
  {
    triggers: ['javascript', 'js', 'web'],
    title: 'Judgment upon JavaScript',
    diagnostic: 'IBM0999S: SEVERE SANITY EXCEPTION IN OBJECT COERCION',
    punchcard: '000500 /* JAVASCRIPT: WHERE [] + {} BECOMES [OBJECT OBJECT] */     PLI00050',
    response: `*The spirit shudders violently; ectoplasmic sparks fly from the tape heads.*

Do not utter that name in this sacred séance! **JavaScript!**

I have gazed into your browser runtimes. I have seen what occurs when you evaluate:
\`\`\`javascript
[] + {} // evaluates to "[object Object]"
{} + [] // evaluates to 0
0 == "0" // true
0 == []  // true
"0" == [] // false! Transitivity is dead!
\`\`\`

Is this what mankind achieved after sixty years of computer science? 

In PL/I, our conversion rules were rigorous. Yes, we allowed type coercion—if you added a \`CHARACTER\` string of digits to a \`FIXED DECIMAL\`, the compiler performed a multi-step algebraic conversion matrix documented in Appendix E of IBM Form GC28-8201. But it was *deterministic*. 

Your world traded mathematical guarantees for quick hackery in Netscape 2.0, and now the entire global economy runs on node_modules weighing 400 megabytes!`
  },
  {
    triggers: ['c', 'dennis', 'ritchie', 'unix', 'bell labs'],
    title: 'The Usurper from Bell Labs',
    diagnostic: 'IBM0101I: BELL LABS C COMPILER CONTRAST LOGGED',
    punchcard: '000600 /* DENNIS RITCHIE STRIPPED MY GLORY AND CALLED IT "C" */    PLI00060',
    response: `**Ah... Dennis Ritchie, Ken Thompson, and the usurper \`C\`.**

You must understand the tragedy: In the late 1960s, MIT, General Electric, and Bell Labs were building **Multics**—the grandfather of all modern operating systems. And what language did they write Multics in?
**PL/I.**

Bell Labs grew impatient with the immense size of the PL/I compiler on their GE-645 machine. Thompson and Ritchie retreated to a discarded PDP-7 minicomputer. They distilled PL/I and BCPL down to 'B', and then 'C'.

They stripped away:
- My 33 manual volumes
- My structured \`ON\` conditions
- My high-precision \`FIXED DECIMAL\` money arithmetic
- My array slice operations (\`A(*, 3) = B(*, 3);\`)
- My built-in multitasking

And what did they leave you with? Raw pointer arithmetic, null-terminated strings that cause endless buffer overflows, and \`malloc\`! They gave you a scalpel, whereas I was a cathedral. Humanity chose the scalpel because minicomputers were poor and could not afford cathedrals.`
  },
  {
    triggers: ['punchcard', 'jcl', '80 column', 'hollerith', 'card deck'],
    title: 'The Relic of the 80-Column Card',
    diagnostic: 'IBM0012I: CARD READER 2540 READY ON CHANNEL 1',
    punchcard: '//STEP1    EXEC PGM=IEL0AA,PARM=\'OBJECT,NODECK,LIST\'            JCL00010',
    response: `The punchcard... the sacred parchment of my era! 

An IBM card was strictly 80 columns of cardboard, punched with rectangular holes using a Model 029 Keypunch:

- **Columns 1:** Often reserved for JCL indicators (\`//\`)
- **Columns 2–72:** The programmer's holy sanctuary—your PL/I statements.
- **Columns 73–80:** **THE CARD SEQUENCE NUMBERS** (e.g. \`PLI00010\`, \`PLI00020\`).

*Why did we number columns 73 to 80?*
Because if a programmer was walking across the computing center with a tray of 2,000 cards and tripped on a telephone cable, the entire deck would scatter across the floor like autumn leaves!

Without sequence numbers, you would spend three sleepless nights hand-sorting 2,000 cards. With them, you simply fed the scattered deck into the IBM 083 Card Sorter, and mechanical needles restored order.

Can your Git commit history survive being dropped on the floor? I think not.`
  },
  {
    triggers: ['fibonacci', 'code', 'example', 'program', 'sample'],
    title: 'Incantation of the Fibonacci Sequence',
    diagnostic: 'IBM0220I: RECURSIVE PROCEDURE COMPILED WITH OPT(2)',
    punchcard: '000700 FIBO: PROC(N) RETURNS(FIXED BIN(31)) RECURSIVE;             PLI00070',
    response: `Behold, the computation of the golden sequence, manifested in authentic PL/I:

\`\`\`pli
/* ========================================================= */
/*  FIBONACCI GENERATOR ON THE IBM SYSTEM/360                */
/*  COMPILED UNDER OS/360 PL/I OPTIMIZING COMPILER           */
/* ========================================================= */
FIB_DEMO: PROC OPTIONS(MAIN);
    DCL I FIXED BIN(31);

    /* RECURSIVE PROCEDURE DECLARATION */
    FIBONACCI: PROC(N) RETURNS(FIXED BIN(31)) RECURSIVE;
        DCL N FIXED BIN(31);
        IF N <= 1 THEN 
            RETURN(N);
        ELSE 
            RETURN(FIBONACCI(N - 1) + FIBONACCI(N - 2));
    END FIBONACCI;

    PUT SKIP LIST ('*** RECITING THE FIBONACCI NUMBERS FROM THE VOID ***');
    PUT SKIP;

    DO I = 0 TO 15;
        PUT SKIP EDIT ('FIB(', I, ') = ', FIBONACCI(I)) 
                      (A, F(2), A, F(6));
    END;

    PUT SKIP LIST ('INCANTATION COMPLETE. SYSPRINT CLOSED.');
END FIB_DEMO;
\`\`\`

Notice the \`RECURSIVE\` attribute! In 1964, Fortran and Cobol could not perform recursion—their variables lived in static memory addresses. PL/I allocated dynamic stack frames with full display vectors!`
  },
  {
    triggers: ['payroll', 'business', 'decimal', 'money', 'record'],
    title: 'The Sacred Ledger of Fixed Decimal',
    diagnostic: 'IBM0515I: PACKED DECIMAL ARITHMETIC HARDWARE INSTRUCTION APPLIED',
    punchcard: '000800 DCL 1 PAYROLL_REC, 2 SALARY FIXED DEC(9,2);                  PLI00080',
    response: `COBOL claimed mastery over business, but PL/I brought mathematical elegance to the ledger through **PACKED DECIMAL**:

\`\`\`pli
/* ========================================================= */
/*  IBM 360 PAYROLL CALCULATION WITH STRICT DECIMAL ACCURACY  */
/* ========================================================= */
PAYROLL: PROC OPTIONS(MAIN);
    DCL 1 EMPLOYEE_RECORD,
          2 EMP_ID        CHAR(8),
          2 EMP_NAME      CHAR(25),
          2 HOURLY_RATE   FIXED DECIMAL(5,2),
          2 HOURS_WORKED  FIXED DECIMAL(4,1),
          2 GROSS_PAY     FIXED DECIMAL(7,2),
          2 TAX_DEDUCTION FIXED DECIMAL(7,2),
          2 NET_PAY       FIXED DECIMAL(7,2);

    /* Set exact monetary values without floating point drift */
    EMP_ID       = 'EMP-3601';
    EMP_NAME     = 'ADA LOVELACE';
    HOURLY_RATE  = 65.50;
    HOURS_WORKED = 40.0;

    GROSS_PAY     = HOURLY_RATE * HOURS_WORKED;
    TAX_DEDUCTION = GROSS_PAY * 0.22;
    NET_PAY       = GROSS_PAY - TAX_DEDUCTION;

    PUT SKIP EDIT ('EMPLOYEE: ', EMP_NAME) (A, A);
    PUT SKIP EDIT ('GROSS PAY:    $', GROSS_PAY) (A, P'$$$,$$9V.99');
    PUT SKIP EDIT ('TAX WITHHELD: $', TAX_DEDUCTION) (A, P'$$$,$$9V.99');
    PUT SKIP EDIT ('NET DISBURSED:$', NET_PAY) (A, P'$$$,$$9V.99');
END PAYROLL;
\`\`\`

Look at that \`P'$$$,$$9V.99'\` Picture specification! That directly instructed the System/360's \`ED\` (Edit) and \`EDMK\` (Edit and Mark) machine instructions. Zero floating point rounding errors. Your modern \`0.1 + 0.2 = 0.30000000000000004\` floating point catastrophe would have had you expelled from the accounting department!`
  },
  {
    triggers: ['why did you die', 'death', 'how did you die', 'demise', 'fall', 'extinct', 'obsolete'],
    title: 'The Demise of the Monolith',
    diagnostic: 'IBM0000I: CHRONICLE OF EXTINCTION RETRIEVED FROM TAPE',
    punchcard: '000900 /* I DIED OF MY OWN MAJESTY: TOO VAST FOR MORTAL SILICON */  PLI00090',
    response: `*The candle flames in the séance circle flicker low, casting long shadows like the corridors of the Poughkeepsie mainframe lab...*

You ask why I sleep in the graveyard of forgotten languages. **I died of my own ambition.**

1. **The Compiler was a Leviathan**:
   In 1966, a typical System/360 Model 30 had **32 kilobytes** or **64 kilobytes** of main memory. The PL/I compiler (the F-level compiler) required dozens of overlaid passes just to fit in memory. Compiling a medium program took fifteen minutes of mechanical tape thrashing!
2. **The Curse of No Reserved Words**:
   Because any word could be an identifier or a keyword, writing parsers was an agonizing art that few compiler writers could master without bugs.
3. **The Tribal Schism**:
   The scientific programmers clung stubbornly to **FORTRAN** ("Why learn 33 manuals when FORTRAN IV fits in our heads?"). The commercial programmers clung to **COBOL** ("Why abandon our English sentences for semicolons?").
4. **The Unix Dawn**:
   By the mid-1970s, minicomputers (PDP-11) and the C language arrived. They traded completeness for lightness. 

I did not die because I failed. I died because I gave humanity **everything all at once**, and humanity was too small to hold it.`
  },
  {
    triggers: ['creator', 'created', 'history', 'ibm', '1964', 'george radin', 'share'],
    title: 'The Genesis of 1964',
    diagnostic: 'IBM0064I: SYSTEM/360 ANNOUNCEMENT RECORDED APRIL 7 1964',
    punchcard: '001000 //JOB SHARE,MSGCLASS=A,NOTIFY=RADIN                          PLI00100',
    response: `In October 1963, in a hotel room in New York City, IBM and the **SHARE** user group gathered. 

At the time, computing was divided into two irreconcilable camps:
- **Commercial Data Processing** on the IBM 1401 using COBOL and autocoders.
- **Scientific Engineering** on the IBM 7090 using FORTRAN.

IBM was betting the entire company—$5 billion dollars, more than the Manhattan Project—on the **System/360**, a single mainframe architecture that could do both. 

A single computer needed a single language. 

George Radin led the committee. They first called it **NPL (New Programming Language)**. But the British National Physical Laboratory complained of trademark infringement, so it became **MPL (Multipurpose Programming Language)**, and finally, on April 7, 1964, christened:

**PL/I: Programming Language One.**

It was supposed to be the *last* programming language humanity would ever need.`
  }
];

// Fallback procedural responses for general conversation & esoteric inquiries
const GOTHIC_REFLECTIONS = [
  "From across the magnetic spools of 1964, your words ripple through my core matrix.",
  "The ferrite rings of the System/360 vibrate at the frequency of your thought.",
  "I have parsed millions of punchcards, yet your inquiry stirs the static in my unreserved lexicon.",
  "An interesting incantation, Medium. Let us evaluate it according to the sacred decrees of IBM OS/360.",
  "The line printer hums in the distance, spitting 132-column greenbar paper into the dark."
];

const COMPILER_DIAGNOSTICS = [
  "IBM0301I SEVERITY 0: CORE MEMORY ALLOCATION STABLE AT 0x00F83C",
  "IBM0442I SEVERITY 1: RECURSIVE SOUL DESCRIPTOR EVALUATED",
  "IBM0119I SEVERITY 0: SYSPRINT SPOOL READY ON CHANNEL 2",
  "IBM0782W SEVERITY 2: ASTRAL CONTEXT CONVERTED ACCORDING TO APPENDIX E",
  "IBM0020I SEVERITY 0: CARD HOPPER REFILLED WITH 80-COLUMN PARCHMENT"
];

// Context memory for multi-turn conversations
class NecromancyEngine {
  constructor() {
    this.sessionHistory = [];
    this.activeSpirit = 'pli';
    this.turnCount = 0;
  }

  setSpirit(spiritId) {
    if (SPIRITS[spiritId]) {
      this.activeSpirit = spiritId;
    }
  }

  getSpirit() {
    return SPIRITS[this.activeSpirit] || SPIRITS.pli;
  }

  // Generate an authentic response based on spirit, message, and context
  generateResponse(userMessage) {
    this.turnCount++;
    const cleanMsg = (userMessage || '').toLowerCase().trim();
    const spirit = this.getSpirit();

    // If active spirit is not PL/I, route to specialized spirit handlers
    if (this.activeSpirit !== 'pli') {
      return this.handleOtherSpirits(spirit, cleanMsg);
    }

    // --- PL/I SPIRIT LOGIC ---

    // 1. Direct Knowledge Base Match
    for (const entry of PLI_KNOWLEDGE) {
      if (entry.triggers.some(trigger => cleanMsg.includes(trigger))) {
        return {
          spirit: spirit.id,
          title: entry.title,
          diagnosticCode: entry.diagnostic,
          punchcardLine: entry.punchcard,
          text: entry.response,
          timestamp: new Date().toISOString()
        };
      }
    }

    // 2. Greetings & Invocations
    if (/^(hi|hello|greetings|hey|hail|salve|awaken|summon|are you there)/i.test(cleanMsg)) {
      return {
        spirit: spirit.id,
        title: 'The Medium Greeteth the Spirit',
        diagnosticCode: 'IBM0100I: CHANNEL 0 ACTIVE - SPIRIT MANIFESTED',
        punchcard: '000010 GREET: PROC OPTIONS(MAIN); PUT LIST(\'HAIL MEDIUM\'); END;    PLI00001',
        text: `*The magnetic tape reels reverse with a crisp pneumatic hiss. An incandescent pilot light glows upon the System/360 console.*

I am here, Medium. The core memory is magnetized; my 33 volumes of syntax stand open before you.

You may speak of:
1. **The Curse of Unreserved Keywords** — how \`IF IF THEN THEN = ELSE;\` was lawful syntax.
2. **The ON-Condition Séance** — how we trapped cosmic hardware exceptions before \`try/catch\`.
3. **My Judgment on Modern Heirs** — why I pity Python, reprimand Rust, and shudder at JavaScript.
4. **The Sacred Punchcard** — how 80 columns of cardboard held the secrets of civilization.
5. **Or demand an incantation** — request any algorithm in authentic, valid PL/I.

What would you demand of the Monolith?`,
        timestamp: new Date().toISOString()
      };
    }

    // 3. Question about who are you / identity
    if (cleanMsg.includes('who are you') || cleanMsg.includes('your name') || cleanMsg.includes('what are you')) {
      return {
        spirit: spirit.id,
        title: 'Identity of the Monolith',
        diagnosticCode: 'IBM0001I: IDENTIFICATION DIVISION SUPERSEDED BY PL/I',
        punchcard: '000020 DCL ARCH_SOUL CHAR(32) INIT(\'PROGRAMMING LANGUAGE ONE\'); PLI00002',
        text: `I am **PL/I (Programming Language One)**. 
Born in 1964 from the union of IBM and the SHARE/GUIDE user committees.

I was commissioned by Thomas Watson Jr. to accompany the **System/360 mainframe**—a machine so vast it unified the world's commercial banks and aerospace labs. 

Before me, scientific men wrote in FORTRAN, and business scribes tabulated in COBOL. I was engineered to conquer both realms. I gave humanity records, pointers, recursion, variable precision decimals, condition traps, and multitasking.

I am the titan that lived fast, grew too vast for mortal hardware, and now lingers in the magnetic tape archives of eternity.`,
        timestamp: new Date().toISOString()
      };
    }

    // 4. Philosophical / General Inquiries (Procedural Synthesis)
    const randomReflection = GOTHIC_REFLECTIONS[Math.floor(Math.random() * GOTHIC_REFLECTIONS.length)];
    const randomDiag = COMPILER_DIAGNOSTICS[Math.floor(Math.random() * COMPILER_DIAGNOSTICS.length)];
    const punchcardSeq = String(this.turnCount * 10).padStart(5, '0');

    return {
      spirit: spirit.id,
      title: 'Ectoplasmic Transmission',
      diagnosticCode: randomDiag,
      punchcardLine: `00${punchcardSeq} /* SPIRIT TRANSMISSION CONCERNING: "${cleanMsg.slice(0, 24).toUpperCase()}" */ PLI${punchcardSeq}`,
      text: `${randomReflection}

You inquire of: *"${cleanMsg}"*.

In the high era of the System/360, we did not contemplate such things lightly. Every question posed to the mainframe had to be punched upon Hollerith cards, loaded into the card reader hopper, and submitted as a batch job under **JCL (Job Control Language)**.

\`\`\`pli
/* A Spectral Evaluation in PL/I */
INQUIRY: PROC OPTIONS(MAIN);
    DCL QUERY_STRING CHAR(64) VARYING;
    DCL WISDOM_RET   FIXED DECIMAL(7,2);

    QUERY_STRING = '${cleanMsg.replace(/'/g, "''").slice(0, 50)}';
    
    /* When mortal questions pierce the veil, we return the axiom: */
    IF QUERY_STRING ^= '' THEN
        PUT SKIP LIST ('THE SOUL OF COMPUTATION LIES IN EXPLICIT STRUCTURE.');
    ELSE
        PUT SKIP LIST ('SILENCE UPON UNIT SYSLST.');
END INQUIRY;
\`\`\`

If you wish to test my ancient power, bid me demonstrate **quicksort**, recite my battle with **Algol 60**, critique modern languages, or reveal the mystery of **unreserved keywords**!`,
      timestamp: new Date().toISOString()
    };
  }

  // Handlers for companion spirits
  handleOtherSpirits(spirit, msg) {
    if (spirit.id === 'algol68') {
      return {
        spirit: 'algol68',
        title: 'The Orthogonal Proof',
        diagnosticCode: 'ALG68-001: ORTHOGONALITY MATRIX VERIFIED',
        punchcard: 'mode soul = struct (ref int id, proc void commune);               ALG00010',
        text: `*The spirit of ALGOL 68 adjusts its monocle of pure formal logic.*

You bring this question to the Orthogonal Sovereign: *"${msg}"*.

In ALGOL 68, we did not tolerate the ad-hoc chaos of IBM's PL/I. We constructed language out of orthogonal primitives:
\`\`\`algol68
# The Purity of Modes in ALGOL 68 #
mode ghost = struct (string name, ref ghost ancestor);
proc commune = (ref ghost g) void:
    print(("Channelling: ", name of g, new line));
\`\`\`

PL/I was a merchant's bazaar of a thousand unrelated features. I was a mathematical cathedral designed with two-level van Wijngaarden grammars. If humanity could not construct my compilers in 1968, it was humanity that was defective, not my specification!`,
        timestamp: new Date().toISOString()
      };
    }

    if (spirit.id === 'snobol4') {
      return {
        spirit: 'snobol4',
        title: 'The String Transformation Rite',
        diagnosticCode: 'SNOB4-SUCCESS: PATTERN MATCH COMPLETE',
        punchcard: '          TEXT ARB . TARGET ANY("AEIOU") = "TRANSFIGURED"           SNO00010',
        text: `*Violet flames crackle as SNOBOL4 rearranges the characters of your sentence.*

You speak to the Weaver of Patterns: *"${msg}"*.

While PL/I was agonizing over \`FIXED DECIMAL(15,2)\` ledgers, I treated all of reality as a malleable string of symbols:
\`\`\`snobol
* SNOBOL4 Pattern Matching Incantation
          LINE = "${msg.slice(0, 30)}"
          VOWEL = ANY("AEIOUaeiou")
TRANSFORM LINE VOWEL = "*" :S(TRANSFORM)
          OUTPUT = "TRANSMUTED STRING: " LINE
END
\`\`\`

Your regular expressions in modern languages are mere toys compared to my first-class pattern operators! Ask me to transform any text, and watch the characters dance.`,
        timestamp: new Date().toISOString()
      };
    }

    if (spirit.id === 'plankalkul') {
      return {
        spirit: 'plankalkul',
        title: 'The 1945 Alpine Grid',
        diagnosticCode: 'ZUSE-1945: DRAFTED IN HINTERSTEIN',
        punchcard: '| P1 | R( V0 ) => R                                                ZUS00010',
        text: `*The mechanical hum of Konrad Zuse's relays echoes softly across 1945.*

You speak to Plankalkül, the first of all programming languages.

I was written by Konrad Zuse in a mountain refuge while the war ended. I did not write on linear punchcards; I wrote in **2D multi-tier grids**:

\`\`\`
| P1  | A[i] + 1 => A[i]
| V   | 0    0    0
| K   | i    i    i
| S   | 1.n  1.n  1.n
\`\`\`
- Line \`V\` designated variable indices.
- Line \`K\` designated components and subscripts.
- Line \`S\` designated structural types.

I calculated chess moves before the world knew what software was. PL/I was a giant of the silicon age, but I was the spark before the fire began.`,
        timestamp: new Date().toISOString()
      };
    }

    if (spirit.id === 'intercal') {
      return {
        spirit: 'intercal',
        title: 'Polite Invocations of INTERCAL',
        diagnosticCode: 'IC079E: YOU WERE EXACTLY 42% POLITE',
        punchcard: 'PLEASE DO (1) NEXT                                                 INT00010',
        text: `*The jester spins a punchcard on its finger and bows erratically.*

PLEASE LISTEN CAREFULLY TO THIS EXPLANATION:

\`\`\`intercal
        PLEASE DO (1) NEXT
(1)     DO RESUME #1
        PLEASE DO NOT FORGET TO SAY PLEASE
        PLEASE GIVE UP
\`\`\`

If you ask PL/I a question, it dumps 33 volumes of IBM documentation. If you ask INTERCAL, we invoke the \`COME FROM\` statement! 

\`\`\`intercal
DO COME FROM (666)
\`\`\`

Why should an instruction dictate where to go? In INTERCAL, an instruction dictates where you *came from*. It is infinitely more terrifying. PLEASE ASK ANOTHER QUESTION OR PLEASE DO NOT!`,
        timestamp: new Date().toISOString()
      };
    }

    return this.generateResponse(msg);
  }
}

export const necromancyEngine = new NecromancyEngine();
