type ModuleLanguage = 'html' | 'css' | 'js' | 'web';

const languageMeta: Record<
  ModuleLanguage,
  {
    name: string;
    wordmark: string;
    base: string;
    glowStrong: string;
    glowSoft: string;
    tint: string;
    accent: string;
    snippet: string;
  }
> = {
  html: {
    name: 'HTML5',
    wordmark: 'HTML',
    base: 'bg-[#1a0b05]',
    glowStrong: 'bg-[#f97316]/60',
    glowSoft: 'bg-[#fbbf24]/22',
    tint: 'bg-orange-50 ring-orange-100',
    accent: 'text-orange-300',
    snippet: '<h1>Halo, Web!</h1>',
  },
  css: {
    name: 'CSS3',
    wordmark: 'CSS',
    base: 'bg-[#050917]',
    glowStrong: 'bg-[#264de4]/60',
    glowSoft: 'bg-[#38bdf8]/25',
    tint: 'bg-blue-50 ring-blue-100',
    accent: 'text-sky-300',
    snippet: '.card { display: flex; }',
  },
  js: {
    name: 'JavaScript',
    wordmark: 'JS',
    base: 'bg-[#151106]',
    glowStrong: 'bg-[#facc15]/45',
    glowSoft: 'bg-[#f59e0b]/20',
    tint: 'bg-yellow-50 ring-yellow-100',
    accent: 'text-yellow-300',
    snippet: "const web = 'interaktif';",
  },
  web: {
    name: 'Web Dasar',
    wordmark: 'WEB',
    base: 'bg-[#0a0f1c]',
    glowStrong: 'bg-[#ea580c]/45',
    glowSoft: 'bg-[#3b82f6]/30',
    tint: 'bg-slate-50 ring-slate-200',
    accent: 'text-brand-300',
    snippet: 'HTML + CSS + JavaScript',
  },
};

/**
 * Picks a language cover from the module title. Lecturers can rename modules,
 * so unknown titles fall back to the combined web cover instead of guessing.
 */
function detectModuleLanguage(title: string): ModuleLanguage {
  const value = title.toLowerCase();

  if (/javascript|\bjs\b/.test(value)) return 'js';
  if (/\bcss\b|flexbox|grid|layout|tata letak|styling/.test(value)) return 'css';
  if (/\bhtml\b|semantic|struktur|markup/.test(value)) return 'html';
  return 'web';
}

function HtmlLogo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.4 2.8h19.2l-1.8 16.9L12 22.6l-7.8-2.9L2.4 2.8z" fill="#e34f26" />
      <path d="M12 4.6v16.5l6.2-2.4 1.5-14.1H12z" fill="#f06529" />
      <text
        x="12"
        y="14.5"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="5.1"
        fontWeight="800"
        letterSpacing="-0.3"
        fill="#fff"
      >
        HTML
      </text>
    </svg>
  );
}

function CssLogo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.4 2.8h19.2l-1.8 16.9L12 22.6l-7.8-2.9L2.4 2.8z" fill="#264de4" />
      <path d="M12 4.6v16.5l6.2-2.4 1.5-14.1H12z" fill="#2965f1" />
      <text
        x="12"
        y="14.7"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="5.6"
        fontWeight="800"
        letterSpacing="-0.3"
        fill="#fff"
      >
        CSS
      </text>
    </svg>
  );
}

function JsLogo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="3.5" fill="#f7df1e" />
      <text
        x="20"
        y="20"
        textAnchor="end"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="7.5"
        fontWeight="800"
        fill="#1e293b"
      >
        JS
      </text>
    </svg>
  );
}

function LanguageArtwork({
  language,
  size,
  spread = false,
}: {
  language: ModuleLanguage;
  size: number;
  spread?: boolean;
}) {
  if (language === 'web') {
    const itemSize = Math.round(size * (spread ? 0.48 : 0.6));

    return (
      <div className={`flex items-center ${spread ? 'gap-0.5' : '-space-x-2.5'}`}>
        <HtmlLogo size={itemSize} />
        <CssLogo size={itemSize} />
        <JsLogo size={itemSize} />
      </div>
    );
  }

  if (language === 'css') return <CssLogo size={size} />;
  if (language === 'js') return <JsLogo size={size} />;
  return <HtmlLogo size={size} />;
}

export function ModuleThumbnail({
  title,
  orderIndex,
}: {
  title: string;
  orderIndex: number;
}) {
  const language = detectModuleLanguage(title);
  const meta = languageMeta[language];
  const isWeb = language === 'web';

  return (
    <div className={`relative h-40 overflow-hidden ${meta.base}`}>
      <div
        aria-hidden="true"
        className={`absolute -right-14 -top-16 h-56 w-56 rounded-full blur-3xl ${meta.glowStrong}`}
      />
      <div
        aria-hidden="true"
        className={`absolute -bottom-24 -left-16 h-52 w-52 rounded-full blur-3xl ${meta.glowSoft}`}
      />
      <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-[0.16]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(120deg,transparent_38%,rgba(255,255,255,0.06)_50%,transparent_62%)]"
      />

      <div className="relative flex h-full items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">
            Modul {orderIndex}
            <span className="h-px w-4 bg-white/25" aria-hidden="true" />
            <span className={meta.accent}>{meta.name}</span>
          </p>
          <p className="mt-2.5 text-4xl font-black leading-none tracking-tight text-white">
            {meta.wordmark}
          </p>
          <p className={`mt-2.5 truncate font-mono text-[11px] ${meta.accent}`}>{meta.snippet}</p>
        </div>

        <div className="relative shrink-0">
          <div
            aria-hidden="true"
            className={`absolute -inset-4 rounded-full blur-2xl ${meta.glowStrong}`}
          />
          <div
            className={`relative flex h-16 items-center justify-center rounded-2xl bg-white shadow-[0_16px_36px_-14px_rgba(0,0,0,0.9)] ring-1 ring-white/70 ${
              isWeb ? 'px-3' : 'w-16'
            }`}
          >
            <LanguageArtwork language={language} size={40} spread={isWeb} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModuleLanguageIcon({ title, className = '' }: { title: string; className?: string }) {
  const language = detectModuleLanguage(title);
  const meta = languageMeta[language];

  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${meta.tint} ${className}`}
    >
      <LanguageArtwork
        language={language}
        size={language === 'web' ? 28 : 30}
        spread={language === 'web'}
      />
    </span>
  );
}
