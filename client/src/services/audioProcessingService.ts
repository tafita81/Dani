/**
 * Serviço de Processamento de Áudio
 * - Grava áudio do microfone
 * - Detecta fim de pergunta (silêncio)
 * - Envia para IA processar
 * - Gera resposta com TTS
 */

export interface AudioChunk {
  timestamp: number;
  data: Uint8Array;
  duration: number;
}

export interface ConversationTurn {
  id: string;
  question: string;
  questionAudio?: Blob;
  answer: string;
  answerAudio?: Blob;
  timestamp: number;
  duration: number;
}

export class AudioProcessingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private silenceTimeout: NodeJS.Timeout | null = null;
  private silenceDuration = 2000; // 2 segundos de silêncio = fim da pergunta
  private minSpeechDuration = 500; // Mínimo 500ms de fala
  private isRecording = false;
  private recordingStartTime = 0;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isSpeaking = false;
  private speechThreshold = 30; // Limiar de volume para detectar fala

  /**
   * Iniciar gravação de áudio
   */
  async startRecording(
    onSilenceDetected?: (transcript: string) => void
  ): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      // Criar MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.isRecording = true;
      this.recordingStartTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Coletar dados a cada 100ms

      // Configurar analisador para detectar silêncio
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      this.analyser = audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);

      // Monitorar volume para detectar silêncio
      this.monitorSilence(onSilenceDetected);
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      throw error;
    }
  }

  /**
   * Monitorar silêncio para detectar fim de pergunta
   */
  private monitorSilence(onSilenceDetected?: (transcript: string) => void) {
    const checkSilence = () => {
      if (!this.analyser || !this.dataArray || !this.isRecording) return;

      this.analyser.getByteFrequencyData(this.dataArray as any);

      // Calcular volume médio
      const sum = this.dataArray.reduce((a, b) => a + b, 0);
      const average = sum / this.dataArray.length;

      // Detectar se está falando
      const wasSpeaking = this.isSpeaking;
      this.isSpeaking = average > this.speechThreshold;

      // Se havia fala e agora há silêncio
      if (wasSpeaking && !this.isSpeaking) {
        // Resetar timeout de silêncio
        if (this.silenceTimeout) {
          clearTimeout(this.silenceTimeout);
        }

        // Aguardar silêncio contínuo
        this.silenceTimeout = setTimeout(() => {
          if (!this.isSpeaking && this.isRecording) {
            // Fim da pergunta detectado
            this.stopRecording().then((blob) => {
              onSilenceDetected?.("");
            });
          }
        }, this.silenceDuration);
      } else if (this.isSpeaking && this.silenceTimeout) {
        // Usuário voltou a falar, cancelar timeout
        clearTimeout(this.silenceTimeout);
        this.silenceTimeout = null;
      }

      if (this.isRecording) {
        requestAnimationFrame(checkSilence);
      }
    };

    checkSilence();
  }

  /**
   * Parar gravação e retornar blob de áudio
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(new Blob());
        return;
      }

      this.isRecording = false;

      if (this.silenceTimeout) {
        clearTimeout(this.silenceTimeout);
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
        this.audioChunks = [];

        // Parar stream
        this.mediaRecorder!.stream.getTracks().forEach((track) => {
          track.stop();
        });

        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Converter blob de áudio para URL
   */
  blobToUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  /**
   * Enviar áudio para transcrição (via API)
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.wav");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro na transcrição: ${response.statusText}`);
      }

      const data = await response.json();
      return data.transcript || "";
    } catch (error) {
      console.error("Erro ao transcrever áudio:", error);
      return "";
    }
  }

  /**
   * Enviar pergunta para IA e obter resposta
   */
  async getAIResponse(question: string): Promise<string> {
    try {
      const response = await fetch("/api/ai-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          context: "assistente-carro",
          language: "pt-BR",
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na IA: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || "";
    } catch (error) {
      console.error("Erro ao obter resposta da IA:", error);
      return "Desculpe, não consegui processar sua pergunta.";
    }
  }

  /**
   * Converter texto para fala (TTS)
   */
  async textToSpeech(text: string, language: string = "pt-BR"): Promise<Blob> {
    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          language,
          voice: "female",
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro no TTS: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error("Erro ao gerar fala:", error);
      throw error;
    }
  }

  /**
   * Reproduzir áudio
   */
  async playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = this.blobToUrl(audioBlob);
        const audio = new Audio(url);

        audio.onended = () => {
          URL.revokeObjectURL(url);
          resolve();
        };

        audio.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Erro ao reproduzir áudio"));
        };

        audio.play().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Fluxo completo: gravar → transcrever → processar → responder
   */
  async processFullConversation(
    onProgress?: (stage: string) => void
  ): Promise<ConversationTurn> {
    const id = `turn-${Date.now()}`;
    const timestamp = Date.now();

    try {
      // 1. Gravar áudio
      onProgress?.("Gravando...");
      await this.startRecording();
      const questionAudio = await this.stopRecording();

      // 2. Transcrever
      onProgress?.("Transcrevendo...");
      const question = await this.transcribeAudio(questionAudio);

      if (!question.trim()) {
        throw new Error("Nenhuma fala detectada");
      }

      // 3. Processar com IA
      onProgress?.("Processando...");
      const answer = await this.getAIResponse(question);

      // 4. Gerar fala
      onProgress?.("Gerando resposta...");
      const answerAudio = await this.textToSpeech(answer);

      // 5. Reproduzir
      onProgress?.("Reproduzindo...");
      await this.playAudio(answerAudio);

      const duration = Date.now() - timestamp;

      return {
        id,
        question,
        questionAudio,
        answer,
        answerAudio,
        timestamp,
        duration,
      };
    } catch (error) {
      console.error("Erro no fluxo de conversação:", error);
      throw error;
    }
  }

  /**
   * Limpar recursos
   */
  cleanup() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
    }

    this.isRecording = false;
  }
}

export default new AudioProcessingService();
