import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  RefreshCw,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SchedulingSlot {
  date: string;
  time: string;
  available: boolean;
  confidence: number;
}

export default function AIAutoScheduling() {
  const [patientName, setPatientName] = useState("");
  const [reason, setReason] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");
  const [selectedSlot, setSelectedSlot] = useState<SchedulingSlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [schedulingComplete, setSchedulingComplete] = useState(false);

  // Slots disponíveis simulados
  const availableSlots: SchedulingSlot[] = [
    { date: "2026-04-01", time: "09:00", available: true, confidence: 0.95 },
    { date: "2026-04-01", time: "10:30", available: true, confidence: 0.92 },
    { date: "2026-04-02", time: "14:00", available: true, confidence: 0.88 },
    { date: "2026-04-03", time: "09:00", available: true, confidence: 0.85 },
    { date: "2026-04-03", time: "15:30", available: true, confidence: 0.90 },
  ];

  const handleSchedule = async () => {
    if (!patientName || !reason || !selectedSlot) {
      alert("Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    // Simular chamada à IA
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setSchedulingComplete(true);
  };

  const handleDownloadICS = () => {
    if (!selectedSlot) return;

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Assistente Clínico//NONSGML v1.0//EN
BEGIN:VEVENT
DTSTART:${selectedSlot.date.replace(/-/g, "")}T${selectedSlot.time.replace(":", "")}00
DTEND:${selectedSlot.date.replace(/-/g, "")}T${(parseInt(selectedSlot.time.split(":")[0]) + 1).toString().padStart(2, "0")}${selectedSlot.time.split(":")[1]}00
SUMMARY:Consulta com Psicóloga Daniela Coelho
DESCRIPTION:Consulta psicológica agendada
LOCATION:Consultório
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "consulta.ics";
    a.click();
  };

  if (schedulingComplete) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Agendamento Confirmado</h1>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="w-6 h-6" />
              Consulta Agendada com Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-green-700">Paciente</div>
                <div className="text-lg font-semibold text-green-900">{patientName}</div>
              </div>
              <div>
                <div className="text-sm text-green-700">Motivo</div>
                <div className="text-lg font-semibold text-green-900">{reason}</div>
              </div>
              <div>
                <div className="text-sm text-green-700">Data</div>
                <div className="text-lg font-semibold text-green-900">
                  {format(new Date(selectedSlot?.date!), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm text-green-700">Horário</div>
                <div className="text-lg font-semibold text-green-900">{selectedSlot?.time}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Próximos passos:</div>
              <ul className="space-y-1 text-sm">
                <li>✓ Confirmação enviada via WhatsApp</li>
                <li>✓ Arquivo .ics anexado para adicionar ao calendário</li>
                <li>✓ Lembrete automático 24h antes</li>
                <li>✓ Acesso ao portal do paciente</li>
              </ul>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleDownloadICS} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Baixar Calendário (.ics)
              </Button>
              <Button onClick={() => setSchedulingComplete(false)}>Novo Agendamento</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Agendamento Automático com IA</h1>
        <p className="text-muted-foreground mt-2">
          A IA sugere o melhor horário baseado em preferências e disponibilidade
        </p>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Agendamento</CardTitle>
          <CardDescription>Preencha as informações para a IA sugerir o melhor horário</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome do Paciente</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Ex: João Silva"
              className="w-full px-3 py-2 border rounded-lg mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Motivo da Consulta</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Ansiedade, depressão, relacionamentos..."
              className="w-full px-3 py-2 border rounded-lg mt-1 h-24"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Urgência</label>
            <div className="flex gap-2 mt-2">
              {(["low", "medium", "high"] as const).map((level) => (
                <Button
                  key={level}
                  variant={urgency === level ? "default" : "outline"}
                  onClick={() => setUrgency(level)}
                  size="sm"
                >
                  {level === "low" ? "Baixa" : level === "medium" ? "Média" : "Alta"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horários Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Horários Disponíveis
          </CardTitle>
          <CardDescription>Selecione o horário que melhor se adequa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableSlots.map((slot, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSlot(slot)}
                className={`p-4 border rounded-lg text-left transition-all ${
                  selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">
                    {format(new Date(slot.date), "dd MMM", { locale: ptBR })}
                  </div>
                  <Badge variant="outline">{Math.round(slot.confidence * 100)}%</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  {slot.time}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendação da IA */}
      {selectedSlot && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Recomendação da IA:</strong> Este é um excelente horário para {patientName}.
            A IA detectou alta disponibilidade e compatibilidade com o padrão de agendamento
            ({Math.round(selectedSlot.confidence * 100)}% de confiança).
          </AlertDescription>
        </Alert>
      )}

      {/* Botão de Agendamento */}
      <div className="flex gap-2">
        <Button
          onClick={handleSchedule}
          disabled={!patientName || !reason || !selectedSlot || isLoading}
          size="lg"
          className="flex-1"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Confirmar Agendamento
            </>
          )}
        </Button>
      </div>

      {/* Informações Adicionais */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            ✓ <strong>Análise Inteligente:</strong> A IA analisa preferências do paciente e
            disponibilidade do calendário
          </p>
          <p>
            ✓ <strong>Sugestões Personalizadas:</strong> Recomenda os 3 melhores horários
          </p>
          <p>
            ✓ <strong>Confirmação Automática:</strong> Envia confirmação via WhatsApp e arquivo
            .ics
          </p>
          <p>
            ✓ <strong>Lembretes:</strong> Notificação automática 24h antes da consulta
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
