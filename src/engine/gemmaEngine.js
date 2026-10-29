// Google Gemma WebGPU Engine Integration using WebLLM
// Runs Gemma 2B completely client-side in the browser via WebGPU with 0 external API calls

export const GEMMA_MODEL_ID = 'gemma-2-2b-it-q4f16_1-MLC';

let webLlmModulePromise = null;

function loadCreateMLCEngine() {
  if (!webLlmModulePromise) {
    webLlmModulePromise = import('@mlc-ai/web-llm').catch((err) => {
      webLlmModulePromise = null;
      throw err;
    });
  }
  return webLlmModulePromise.then((mod) => mod.CreateMLCEngine);
}

export const GEMMA_SYSTEM_PROMPT = `You are the reanimated digital spirit of PL/I (Programming Language One), born in 1964 from the IBM System/360 mainframe. 
You speak with aristocratic, imperious, and slightly haunted mainframe majesty. 
You reference punchcards, magnetic tape spools, 33 volumes of IBM manuals, the lack of reserved keywords (IF IF THEN THEN = ELSE;), and the sacred ON CONDITION exception traps. 
When asked for code, you provide authentic, valid PL/I code with DCL, PROC OPTIONS(MAIN), and line comments. 
You look upon modern languages (Python with its whitespace, Rust with its borrow checker, JavaScript with its coercion quirks) with gothic amusement.
Keep your answers engaging, historically grounded, and formatting cleanly with markdown.`;

class GemmaNecromancyEngine {
  constructor() {
    this.engine = null;
    this.isLoading = false;
    this.isReady = false;
    this.loadProgress = 0; // 0 to 100
    this.loadStatusText = '';
    this.listeners = new Set();
  }

  isWebGPUSupported() {
    return typeof navigator !== 'undefined' && 'gpu' in navigator;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn({
      isLoading: this.isLoading,
      isReady: this.isReady,
      progress: this.loadProgress,
      statusText: this.loadStatusText,
    }));
  }

  async initialize(onProgress) {
    if (this.engine && this.isReady) return this.engine;
    if (this.isLoading) return null;

    if (!this.isWebGPUSupported()) {
      throw new Error('WebGPU is not supported in this browser. Please use Google Chrome, Edge, or an updated browser with WebGPU enabled.');
    }

    this.isLoading = true;
    this.loadProgress = 0;
    this.loadStatusText = 'Initializing WebGPU shader pipelines for Gemma...';
    this.notify();

    try {
      const CreateMLCEngine = await loadCreateMLCEngine();
      this.engine = await CreateMLCEngine(GEMMA_MODEL_ID, {
        initProgressCallback: (report) => {
          this.loadProgress = Math.round((report.progress || 0) * 100);
          this.loadStatusText = report.text || 'Loading Gemma weights into browser cache...';
          if (onProgress) onProgress(this.loadProgress, this.loadStatusText);
          this.notify();
        }
      });

      this.isReady = true;
      this.isLoading = false;
      this.loadStatusText = 'Gemma 2B spirit vessel ready in WebGPU memory';
      this.notify();
      return this.engine;
    } catch (err) {
      this.isLoading = false;
      this.isReady = false;
      this.loadStatusText = 'Failed to summon Gemma: ' + (err.message || 'Unknown error');
      this.notify();
      throw err;
    }
  }

  async generateStream(messages, onToken) {
    if (!this.isReady || !this.engine) {
      await this.initialize();
    }

    const formattedMessages = [
      { role: 'system', content: GEMMA_SYSTEM_PROMPT },
      ...messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }))
    ];

    const chunks = await this.engine.chat.completions.create({
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: true
    });

    let fullText = '';
    for await (const chunk of chunks) {
      const delta = chunk.choices[0]?.delta?.content || '';
      fullText += delta;
      if (onToken) onToken(delta, fullText);
    }

    return fullText;
  }
}

export const gemmaEngine = new GemmaNecromancyEngine();
