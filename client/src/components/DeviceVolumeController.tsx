import React, { useEffect, useState } from "react";
import { Volume2, VolumeX, Volume1 } from "lucide-react";

interface DeviceVolumeControllerProps {
  onVolumeChange?: (volume: number) => void;
  onMuteToggle?: (isMuted: boolean) => void;
}

/**
 * Componente para controlar volume do dispositivo iOS
 * Detecta botões físicos de volume e toque
 */
export function DeviceVolumeController({
  onVolumeChange,
  onMuteToggle,
}: DeviceVolumeControllerProps) {
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [lastVolumeEvent, setLastVolumeEvent] = useState<Date | null>(null);

  // Detectar mudanças de volume do dispositivo
  useEffect(() => {
    // Método 1: Detectar através de eventos de teclado (simulação)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Botão de volume up (seta para cima ou tecla específica)
      if (
        e.key === "ArrowUp" ||
        e.code === "VolumeUp" ||
        e.key === "+"
      ) {
        e.preventDefault();
        handleVolumeUp();
      }
      // Botão de volume down (seta para baixo ou tecla específica)
      else if (
        e.key === "ArrowDown" ||
        e.code === "VolumeDown" ||
        e.key === "-"
      ) {
        e.preventDefault();
        handleVolumeDown();
      }
      // Tecla de mudo (M ou 0)
      else if (e.key === "m" || e.key === "M" || e.key === "0") {
        e.preventDefault();
        handleMuteToggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Método 2: Detectar através de eventos de mídia
    const handleMediaKeyDown = (e: any) => {
      if (e.key === "MediaVolumeUp") {
        handleVolumeUp();
      } else if (e.key === "MediaVolumeDown") {
        handleVolumeDown();
      } else if (e.key === "MediaTrackNext") {
        handleVolumeUp();
      } else if (e.key === "MediaTrackPrevious") {
        handleVolumeDown();
      }
    };

    navigator.mediaSession?.setActionHandler("play", () => {
      handleVolumeUp();
    });
    navigator.mediaSession?.setActionHandler("pause", () => {
      handleVolumeDown();
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [volume, isMuted]);

  // Aumentar volume
  const handleVolumeUp = () => {
    const newVolume = Math.min(volume + 10, 100);
    setVolume(newVolume);
    setIsMuted(false);
    setLastVolumeEvent(new Date());

    onVolumeChange?.(newVolume);

    // Feedback visual
    playVolumeHaptic();
  };

  // Diminuir volume
  const handleVolumeDown = () => {
    const newVolume = Math.max(volume - 10, 0);
    setVolume(newVolume);
    setLastVolumeEvent(new Date());

    onVolumeChange?.(newVolume);

    // Feedback visual
    playVolumeHaptic();
  };

  // Alternar mudo
  const handleMuteToggle = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    setLastVolumeEvent(new Date());

    onMuteToggle?.(newMutedState);

    // Feedback visual
    playVolumeHaptic();
  };

  // Feedback háptico (vibração)
  const playVolumeHaptic = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
  };

  // Detectar toque duplo para mudo
  useEffect(() => {
    let touchCount = 0;
    let lastTouchTime = 0;

    const handleTouchEnd = () => {
      const now = Date.now();
      if (now - lastTouchTime < 300) {
        touchCount++;
        if (touchCount === 2) {
          handleMuteToggle();
          touchCount = 0;
        }
      } else {
        touchCount = 1;
      }
      lastTouchTime = now;
    };

    window.addEventListener("touchend", handleTouchEnd);
    return () => window.removeEventListener("touchend", handleTouchEnd);
  }, [isMuted]);

  // Renderizar indicador de volume
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="w-6 h-6 text-red-500" />;
    } else if (volume < 33) {
      return <Volume1 className="w-6 h-6 text-yellow-500" />;
    } else {
      return <Volume2 className="w-6 h-6 text-green-500" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
      {/* Título */}
      <div className="flex items-center gap-2 mb-3">
        {getVolumeIcon()}
        <span className="text-sm font-semibold text-gray-700">
          Controle de Volume
        </span>
      </div>

      {/* Display de Volume */}
      <div className="bg-gray-100 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-600">Nível</span>
          <span className="text-lg font-bold text-blue-600">
            {isMuted ? "MUDO" : `${volume}%`}
          </span>
        </div>

        {/* Barra de Volume */}
        <div className="w-full bg-gray-300 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isMuted
                ? "bg-red-500"
                : volume < 33
                  ? "bg-yellow-500"
                  : volume < 66
                    ? "bg-blue-500"
                    : "bg-green-500"
            }`}
            style={{ width: `${isMuted ? 0 : volume}%` }}
          />
        </div>
      </div>

      {/* Botões de Controle */}
      <div className="grid grid-cols-3 gap-2">
        {/* Diminuir Volume */}
        <button
          onClick={handleVolumeDown}
          className="bg-blue-100 hover:bg-blue-200 text-blue-600 font-bold py-2 px-3 rounded transition"
          title="Diminuir volume (Seta para baixo)"
        >
          −
        </button>

        {/* Mudo */}
        <button
          onClick={handleMuteToggle}
          className={`font-bold py-2 px-3 rounded transition ${
            isMuted
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
          title="Alternar mudo (M)"
        >
          {isMuted ? "🔇" : "🔔"}
        </button>

        {/* Aumentar Volume */}
        <button
          onClick={handleVolumeUp}
          className="bg-green-100 hover:bg-green-200 text-green-600 font-bold py-2 px-3 rounded transition"
          title="Aumentar volume (Seta para cima)"
        >
          +
        </button>
      </div>

      {/* Instruções */}
      <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded">
        <p className="font-semibold mb-1">Controles:</p>
        <ul className="space-y-0.5">
          <li>⬆️ Aumentar volume</li>
          <li>⬇️ Diminuir volume</li>
          <li>M Alternar mudo</li>
          <li>👆👆 Duplo toque = Mudo</li>
        </ul>
      </div>

      {/* Timestamp do último evento */}
      {lastVolumeEvent && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Último evento: {lastVolumeEvent.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

/**
 * Hook para usar o controlador de volume do dispositivo
 */
export function useDeviceVolume() {
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleMuteToggle = (muted: boolean) => {
    setIsMuted(muted);
  };

  return {
    volume,
    isMuted,
    handleVolumeChange,
    handleMuteToggle,
  };
}
