import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Mic, MicOff, Plus, Search, LogOut, Save } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  primaryApproach: string;
  status: string;
}

interface SessionState {
  clientId: number | null;
  clientName: string | null;
  isRecording: boolean;
  isMuted: boolean;
  transcription: string[];
  insights: string[];
  sessionStartTime: Date | null;
}

export default function AssistantClinico() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>({
    clientId: null,
    clientName: null,
    isRecording: false,
    isMuted: false,
    transcription: [],
    insights: [],
    sessionStartTime: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Buscar lista de clientes (simulado)
  useEffect(() => {
    // Simulação de clientes para teste
    const mockClients: Client[] = [
      { id: 1, name: 'Maria Silva', primaryApproach: 'TCC', status: 'active' },
      { id: 2, name: 'João Santos', primaryApproach: 'Gestalt', status: 'active' },
      { id: 3, name: 'Ana Costa', primaryApproach: 'Esquema', status: 'inactive' },
    ];
    setClients(mockClients);
    setFilteredClients(mockClients);
  }, []);



  // Filtrar clientes por busca
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      setFilteredClients(
        clients.filter((c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, clients]);

  // Iniciar sessão com cliente
  const handleStartSession = async (clientId: number) => {
    const selectedClient = clients.find((c) => c.id === clientId);
    if (!selectedClient) return;

    setSessionState((prev) => ({
      ...prev,
      clientId,
      clientName: selectedClient.name,
      sessionStartTime: new Date(),
    }));

    // Iniciar captura de áudio
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        // Processar áudio para transcrição
        processAudioChunk(event.data, clientId);
      };

      mediaRecorder.start(1000); // Processar a cada 1 segundo
      setSessionState((prev) => ({ ...prev, isRecording: true }));
      toast.success(`Sessão iniciada com ${selectedClient.name}`);
    } catch (error) {
      toast.error('Erro ao acessar microfone');
    }
  };

  // Processar chunk de áudio
  const processAudioChunk = async (audioData: Blob, clientId: number) => {
    if (sessionState.isMuted) return;

    // Enviar para backend para transcrição e análise
    const formData = new FormData();
    formData.append('audio', audioData);
    formData.append('clientId', clientId.toString());

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { transcription, insights } = await response.json();
        setSessionState((prev) => ({
          ...prev,
          transcription: [...prev.transcription, transcription],
          insights: [...prev.insights, ...insights],
        }));
      }
    } catch (error) {
      console.error('Erro ao transcrever:', error);
    }
  };

  // Encerrar sessão
  const handleEndSession = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }

    // Salvar sessão no banco de dados
    if (sessionState.clientId && sessionState.sessionStartTime) {
      try {
        await trpc.clinicalAssistant.endSession.mutate({
          clientId: sessionState.clientId,
          transcription: sessionState.transcription.join('\n'),
          insights: sessionState.insights.join('\n'),
          startTime: sessionState.sessionStartTime,
          endTime: new Date(),
        });

        toast.success('Sessão finalizada e salva com sucesso');
        setSessionState({
          clientId: null,
          clientName: null,
          isRecording: false,
          isMuted: false,
          transcription: [],
          insights: [],
          sessionStartTime: null,
        });
      } catch (error) {
        toast.error('Erro ao salvar sessão');
      }
    }
  };

  // Tela de seleção de cliente
  if (!sessionState.clientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Cabeçalho */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Estrategista Clínico
            </h1>
            <p className="text-gray-600">Selecione um cliente para iniciar a sessão</p>
          </div>

          {/* Botão Novo Cliente */}
          <button
            onClick={() => setShowNewClientForm(!showNewClientForm)}
            className="w-full mb-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Plus size={20} />
            Novo Cliente
          </button>

          {/* Formulário Novo Cliente */}
          {showNewClientForm && (
            <NewClientForm
              onSuccess={() => {
                setShowNewClientForm(false);
                // Recarregar lista de clientes
              }}
            />
          )}

          {/* Busca de Cliente */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar cliente por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Lista de Clientes */}
          <div className="space-y-3">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleStartSession(client.id)}
                  className="w-full bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-500 rounded-lg p-4 text-left transition"
                >
                  <div className="font-bold text-gray-800">{client.name}</div>
                  <div className="text-sm text-gray-600">
                    Abordagem: {client.primaryApproach}
                  </div>
                  <div className="text-xs text-gray-500">
                    Status: {client.status}
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                Nenhum cliente encontrado
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tela de sessão ativa
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho da Sessão */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {sessionState.clientName}
              </h1>
              <p className="text-gray-600">
                Sessão iniciada às{' '}
                {sessionState.sessionStartTime?.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setSessionState((prev) => ({
                    ...prev,
                    isMuted: !prev.isMuted,
                  }))
                }
                className={`p-3 rounded-full ${
                  sessionState.isMuted
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {sessionState.isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button
                onClick={handleEndSession}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition"
              >
                <LogOut size={20} />
                Encerrar Sessão
              </button>
            </div>
          </div>
        </div>

        {/* Painel de Transcrição */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transcrição */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Transcrição</h2>
            <div className="bg-gray-50 rounded p-4 h-96 overflow-y-auto">
              {sessionState.transcription.length > 0 ? (
                sessionState.transcription.map((line, idx) => (
                  <p key={idx} className="text-gray-700 mb-2 text-sm">
                    {line}
                  </p>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Aguardando transcrição...
                </p>
              )}
            </div>
          </div>

          {/* Insights Clínicos */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Insights Clínicos
            </h2>
            <div className="bg-green-50 rounded p-4 h-96 overflow-y-auto">
              {sessionState.insights.length > 0 ? (
                sessionState.insights.map((insight, idx) => (
                  <div key={idx} className="mb-3 p-2 bg-white rounded border-l-4 border-green-500">
                    <p className="text-gray-700 text-sm">{insight}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Analisando em tempo real...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de Formulário de Novo Cliente
function NewClientForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    primaryApproach: 'integrativa',
    mainComplaint: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simular cadastro
      const newClient: Client = {
        id: Math.random(),
        name: formData.name,
        primaryApproach: formData.primaryApproach,
        status: 'active',
      };
      toast.success('Cliente cadastrado com sucesso');
      onSuccess();
    } catch (error) {
      toast.error('Erro ao cadastrar cliente');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Novo Cliente</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nome completo"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="tel"
          placeholder="Telefone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={formData.primaryApproach}
          onChange={(e) =>
            setFormData({ ...formData, primaryApproach: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="tcc">TCC (Terapia Cognitivo-Comportamental)</option>
          <option value="terapia_esquema">Terapia do Esquema</option>
          <option value="gestalt">Gestalt</option>
          <option value="integrativa">Integrativa</option>
        </select>
        <textarea
          placeholder="Queixa principal"
          value={formData.mainComplaint}
          onChange={(e) =>
            setFormData({ ...formData, mainComplaint: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
        />
        <button
          type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <Save size={20} />
          Salvar e Selecionar
        </button>
      </form>
    </div>
  );
}
