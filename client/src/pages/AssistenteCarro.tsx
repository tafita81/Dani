/**
 * AssistenteCarro.tsx — Interface do Assistente Clínico Mãos-Livres
 *
 * Exatamente como no app publicado:
 * - Microfone (Web Speech API pt-BR)
 * - Modo Turbo
 * - Sugestões clicáveis
 * - TTS para resposta em áudio
 * - Status: Página carregada ✓ / Captura de Microfone / Reconhecimento de voz
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "../services/trpc";
import { Mic, MicOff, Volume2, VolumeX, Zap } from "lucide-react";

// ── Tipos Web Speech API ──────────────────────────────────────
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Status = "idle" | "listening" | "processing" | "speaking" | "error";

const STATUS_LABELS: Record<Status, string> = {
  idle:       "Aguardando",
  listening:  "Escutando...",
  processing: "Processando...",
  speaking:   "Respondendo...",
  error:      "Erro — tente novamente",
};

export default function AssistenteCarro() {
  const [status, setStatus]         = useState<Status>("idle");
  const [micActive, setMicActive]   = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [turboMode, setTurboMode]   = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse]     = useState("");
  const [history, setHistory]       = useState<Array<{ role: "user" | "ai"; text: string }>>([]);

  const recognitionRef = useRef<any>(null);
  const synthRef       = useRef<SpeechSynthesisUtterance | null>(null);

  // ── Buscar sugestões do backend ───────────────────────────
  const { data: suggestionsData } = trpc.carAssistant.suggestions.useQuery();
  const voiceCommandMutation = trpc.carAssistant.voiceCommand.useMutation();

  const suggestions = suggestionsData?.suggestions ?? [
    "📅 Agenda de hoje",
    "👤 Próximo paciente",
    "📈 Ver evolução de paciente",
    "😴 Listar pacientes inativos",
  ];

  // ── TTS — falar resposta ──────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!soundEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setStatus("speaking");
    utterance.onend   = () => setStatus("idle");
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [soundEnabled]);

  // ── Processar transcrição ─────────────────────────────────
  const processTranscript = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setStatus("processing");
    setTranscript(text);
    setHistory(h => [...h, { role: "user", text }]);

    try {
      const result = await voiceCommandMutation.mutateAsync({ transcript: text, turboMode });
      setResponse(result.response);
      setHistory(h => [...h, { role: "ai", text: result.response }]);
      if (soundEnabled) speak(result.response);
      else setStatus("idle");
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }, [turboMode, soundEnabled, speak, voiceCommandMutation]);

  // ── Inicializar Web Speech API ────────────────────────────
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = "pt-BR";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      processTranscript(text);
    };
    rec.onerror = () => {
      setStatus("error");
      setVoiceActive(false);
      setTimeout(() => setStatus("idle"), 2000);
    };
    rec.onend = () => setVoiceActive(false);

    recognitionRef.current = rec;
  }, [processTranscript]);

  // ── Ativar microfone ──────────────────────────────────────
  const toggleMic = useCallback(async () => {
    if (!micActive) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicActive(true);
      } catch {
        alert("Permita o acesso ao microfone nas configurações do navegador.");
      }
    } else {
      setMicActive(false);
      setVoiceActive(false);
      recognitionRef.current?.stop();
    }
  }, [micActive]);

  // ── Iniciar escuta ────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!micActive || !recognitionRef.current) return;
    setVoiceActive(true);
    setStatus("listening");
    recognitionRef.current.start();
  }, [micActive]);

  // ── Clique em sugestão ────────────────────────────────────
  const handleSuggestion = (text: string) => {
    // Remove emoji do início
    const clean = text.replace(/^[\p{Emoji}\s]+/u, "").trim();
    processTranscript(clean);
  };

  // ── Parar som ─────────────────────────────────────────────
  const stopSound = () => {
    window.speechSynthesis?.cancel();
    setStatus("idle");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-start p-4 pt-8">

      {/* Header */}
      <div className="w-full max-w-md mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-3xl">🚗</span>
          <h1 className="text-2xl font-bold text-white">Assistente Carro</h1>
        </div>
        <p className="text-purple-300 text-sm">Conversa com IA em Português Brasileiro</p>
      </div>

      {/* Status cards */}
      <div className="w-full max-w-md grid grid-cols-1 gap-2 mb-6">
        <StatusCard label="Página carregada" value="✓ Ativo" ok />
        <StatusCard label="Captura de Microfone" value={micActive ? "✓ Ativa" : "Inativa"} ok={micActive} />
        <StatusCard label="Reconhecimento de voz" value={voiceActive ? "✓ Ativo" : "Inativo"} ok={voiceActive} />
        <StatusCard label="Idioma" value="Português Brasileiro" ok />
      </div>

      {/* Status principal */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur rounded-2xl p-4 mb-4 text-center">
        <div className={`text-lg font-semibold ${status === "error" ? "text-red-400" : status === "speaking" ? "text-green-400" : status === "listening" ? "text-yellow-400" : "text-white"}`}>
          {STATUS_LABELS[status]}
        </div>
        {transcript && (
          <p className="text-purple-200 text-sm mt-1 italic">"{transcript}"</p>
        )}
        {response && (
          <p className="text-white text-sm mt-2">{response}</p>
        )}
      </div>

      {/* Sugestões */}
      <div className="w-full max-w-md mb-4">
        <p className="text-purple-300 text-xs mb-2 font-semibold uppercase tracking-wide">Sugestões</p>
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSuggestion(s)}
              disabled={status === "processing" || status === "speaking"}
              className="bg-white/10 hover:bg-white/20 text-white text-xs rounded-xl p-3 text-left transition disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Botões de controle */}
      <div className="w-full max-w-md grid grid-cols-3 gap-3 mb-4">
        {/* Microfone */}
        <button
          onClick={toggleMic}
          className={`flex flex-col items-center gap-1 p-4 rounded-2xl font-semibold text-sm transition ${
            micActive
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "bg-white/10 hover:bg-white/20 text-purple-300"
          }`}
        >
          {micActive ? <Mic size={22} /> : <MicOff size={22} />}
          {micActive ? "Capturando" : "Mic Off"}
        </button>

        {/* Escutar */}
        <button
          onClick={startListening}
          disabled={!micActive || voiceActive || status === "processing"}
          className={`flex flex-col items-center gap-1 p-4 rounded-2xl font-semibold text-sm transition ${
            voiceActive
              ? "bg-yellow-500 text-white animate-pulse"
              : "bg-white/10 hover:bg-white/20 text-purple-300 disabled:opacity-40"
          }`}
        >
          <Volume2 size={22} />
          {voiceActive ? "Escutando..." : "Escutar"}
        </button>

        {/* Parar som */}
        <button
          onClick={stopSound}
          className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-purple-300 font-semibold text-sm transition"
        >
          <VolumeX size={22} />
          Parar Som
        </button>
      </div>

      {/* Modo Turbo */}
      <div className="w-full max-w-md">
        <button
          onClick={() => setTurboMode(t => !t)}
          className={`w-full flex items-center justify-between p-4 rounded-2xl font-semibold transition ${
            turboMode
              ? "bg-yellow-500/20 border border-yellow-500 text-yellow-300"
              : "bg-white/10 text-purple-300"
          }`}
        >
          <span className="flex items-center gap-2">
            <Zap size={18} />
            Modo Turbo
          </span>
          <span className={`text-sm px-2 py-0.5 rounded-full ${turboMode ? "bg-yellow-500 text-black" : "bg-white/20 text-purple-300"}`}>
            {turboMode ? "Ativo" : "Inativo"}
          </span>
        </button>
      </div>

      {/* Como usar */}
      <div className="w-full max-w-md mt-4 bg-white/5 rounded-2xl p-4">
        <p className="text-purple-300 text-xs font-semibold mb-2">📋 Como Usar:</p>
        <ol className="text-purple-200 text-xs space-y-1 list-decimal list-inside">
          <li>Clique em "Capturando" para ativar o microfone</li>
          <li>Clique em "Escutar" para começar a ouvir</li>
          <li>Faça sua pergunta</li>
        </ol>
      </div>
    </div>
  );
}

// ── Componente auxiliar de status ─────────────────────────────
function StatusCard({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-2">
      <span className="text-purple-300 text-xs">{label}</span>
      <span className={`text-xs font-semibold ${ok ? "text-green-400" : "text-gray-400"}`}>
        {value}
      </span>
    </div>
  );
}
