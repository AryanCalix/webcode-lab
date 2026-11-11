import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Bot, RotateCcw, SendHorizontal, X } from 'lucide-react';
import { Alert } from './ui';
import { Markdown } from './Markdown';
import { useRequestAiChat } from '../features/exercises/hooks';
import type { AiChatMessage } from '../features/exercises/api';
import { getErrorMessage } from '../lib/errors';

interface AIChatProps {
  exerciseId: string;
  code: { html: string; css: string; js: string };
}

const WELCOME_MESSAGE: AiChatMessage = {
  role: 'assistant',
  content:
    'Halo! Saya asisten belajar WebCode Lab. Tanyakan konsep, minta petunjuk, atau minta penjelasan — saya memandu, bukan memberi solusi siap salin.',
};

const QUICK_PROMPTS = [
  'Dari mana saya harus mulai?',
  'Ada yang salah dengan kode saya?',
  'Jelaskan konsep di latihan ini',
];

export function AIChat({ exerciseId, code }: AIChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const requestChat = useRequestAiChat();

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, open, requestChat.isPending]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const sendMessage = (raw?: string) => {
    const content = (raw ?? input).trim();
    if (!content || requestChat.isPending) return;

    const nextMessages: AiChatMessage[] = [
      ...messages,
      { role: 'user' as const, content },
    ];
    setMessages(nextMessages);
    setInput('');
    setError(null);

    requestChat.mutate(
      { exerciseId, messages: nextMessages, code },
      {
        onSuccess: (result) => {
          setMessages((previous) => [...previous, { role: 'assistant', content: result.reply }]);
        },
        onError: (err) => {
          const message = getErrorMessage(err);
          setError(
            /failed to send|failed to fetch|network ?error/i.test(message)
              ? 'Asisten AI sedang tidak dapat dihubungi. Coba lagi sebentar lagi.'
              : message,
          );
        },
      },
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage();
  };

  const resetConversation = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput('');
    setError(null);
    inputRef.current?.focus();
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka asisten AI"
        aria-expanded={false}
        aria-controls="ai-chat-panel"
        className="group fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-[0_14px_30px_-10px_rgba(234,88,12,0.65)] transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <Bot className="h-6 w-6" strokeWidth={1.9} aria-hidden="true" />
        <span
          className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-cream-100 bg-emerald-500"
          aria-hidden="true"
        />
        <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">
          Tanya asisten
        </span>
      </button>
    );
  }

  return (
    <div
      id="ai-chat-panel"
      role="dialog"
      aria-label="Asisten AI WebCode Lab"
      className="fixed bottom-5 right-5 z-50 flex h-[min(34rem,calc(100dvh-2.5rem))] w-[calc(100vw-2.5rem)] max-w-[23.5rem] origin-bottom-right animate-scale-in flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_28px_60px_-24px_rgba(15,23,42,0.4)]"
    >
      <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-sm">
          <Bot className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">Asisten WebCode</p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Siap membantu
          </p>
        </div>
        <button
          type="button"
          onClick={resetConversation}
          disabled={requestChat.isPending || messages.length <= 1}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
          aria-label="Mulai ulang percakapan"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Tutup asisten AI"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>

      <div
        ref={listRef}
        aria-live="polite"
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-cream-50/70 px-4 py-4"
      >
        {messages.map((message, index) => {
          const isAssistant = message.role === 'assistant';

          return (
            <div
              key={index}
              className={
                isAssistant
                  ? 'max-w-[85%] rounded-2xl rounded-tl-sm border border-slate-200/80 bg-white px-3.5 py-2.5 text-[13.5px] leading-relaxed text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)]'
                  : 'ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-slate-900 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-white'
              }
            >
              {isAssistant ? (
                <Markdown className="chat-markdown">{message.content}</Markdown>
              ) : (
                <p className="whitespace-pre-line">{message.content}</p>
              )}
            </div>
          );
        })}

        {messages.length === 1 && !requestChat.isPending ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-700"
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}

        {requestChat.isPending ? (
          <div
            className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-slate-200/80 bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
            aria-label="Asisten sedang menulis"
          >
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="px-3 pb-1">
          <Alert tone="error">{error}</Alert>
        </div>
      ) : null}

      <form className="border-t border-slate-100 bg-white px-3 pb-2 pt-3" onSubmit={handleSubmit}>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Tulis pertanyaan…"
            className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
            maxLength={1000}
            aria-label="Pesan untuk asisten AI"
          />
          <button
            type="submit"
            disabled={requestChat.isPending || !input.trim()}
            aria-label="Kirim pesan"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:bg-slate-300"
          >
            <SendHorizontal className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          Asisten bisa keliru — periksa kembali hasilnya.
        </p>
      </form>
    </div>
  );
}

export default AIChat;
