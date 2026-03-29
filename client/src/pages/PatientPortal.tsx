import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, FileText, TrendingUp, MessageSquare } from "lucide-react";

export default function PatientPortal() {
  const [activeTab, setActiveTab] = useState<
    "schedule" | "forms" | "evolution" | "messages"
  >("schedule");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Seu Espaço de Acompanhamento
          </h1>
          <p className="text-gray-600">
            Gerencie seus agendamentos, formulários e acompanhe sua evolução clínica
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <button
            onClick={() => setActiveTab("schedule")}
            className={`p-4 rounded-lg font-semibold transition ${
              activeTab === "schedule"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Calendar className="w-5 h-5 mx-auto mb-2" />
            Agendamentos
          </button>
          <button
            onClick={() => setActiveTab("forms")}
            className={`p-4 rounded-lg font-semibold transition ${
              activeTab === "forms"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FileText className="w-5 h-5 mx-auto mb-2" />
            Formulários
          </button>
          <button
            onClick={() => setActiveTab("evolution")}
            className={`p-4 rounded-lg font-semibold transition ${
              activeTab === "evolution"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <TrendingUp className="w-5 h-5 mx-auto mb-2" />
            Evolução
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`p-4 rounded-lg font-semibold transition ${
              activeTab === "messages"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <MessageSquare className="w-5 h-5 mx-auto mb-2" />
            Mensagens
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          {activeTab === "schedule" && <ScheduleSection />}
          {activeTab === "forms" && <FormsSection />}
          {activeTab === "evolution" && <EvolutionSection />}
          {activeTab === "messages" && <MessagesSection />}
        </div>
      </div>
    </div>
  );
}

function ScheduleSection() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Agende sua Consulta</h2>

      {/* Available Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[
          { date: "30/03/2026", time: "10:00", available: true },
          { date: "30/03/2026", time: "14:00", available: true },
          { date: "31/03/2026", time: "09:00", available: true },
          { date: "31/03/2026", time: "15:00", available: false },
        ].map((slot, idx) => (
          <Card
            key={idx}
            className={`p-4 cursor-pointer transition ${
              slot.available
                ? "hover:border-blue-500 hover:shadow-md"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{slot.date}</p>
                <p className="text-gray-600">{slot.time}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  slot.available
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {slot.available ? "Disponível" : "Ocupado"}
              </span>
            </div>
            {slot.available && (
              <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700">
                Agendar
              </Button>
            )}
          </Card>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="border-t pt-6">
        <h3 className="text-xl font-bold mb-4">Suas Consultas Agendadas</h3>
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="font-semibold text-blue-900">Próxima consulta</p>
          <p className="text-blue-800">29/03/2026 às 14:00</p>
          <p className="text-sm text-blue-700 mt-2">
            Com Psi. Daniela Coelho - Consultório
          </p>
          <Button className="mt-3 bg-blue-600 hover:bg-blue-700">
            Confirmar Presença
          </Button>
        </Card>
      </div>
    </div>
  );
}

function FormsSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Formulários Clínicos</h2>

      <div className="space-y-4">
        {[
          {
            name: "PHQ-9 (Depressão)",
            status: "pendente",
            dueDate: "31/03/2026",
          },
          {
            name: "GAD-7 (Ansiedade)",
            status: "pendente",
            dueDate: "31/03/2026",
          },
          {
            name: "Avaliação de Esquemas",
            status: "completo",
            dueDate: "28/03/2026",
          },
          {
            name: "Registro de Pensamentos",
            status: "em_progresso",
            dueDate: "30/03/2026",
          },
        ].map((form, idx) => (
          <Card key={idx} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{form.name}</p>
              <p className="text-sm text-gray-600">Prazo: {form.dueDate}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  form.status === "completo"
                    ? "bg-green-100 text-green-800"
                    : form.status === "em_progresso"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {form.status === "completo"
                  ? "✓ Completo"
                  : form.status === "em_progresso"
                    ? "Em Progresso"
                    : "Pendente"}
              </span>
              {form.status !== "completo" && (
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Responder
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EvolutionSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Sua Evolução Clínica</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-gray-600 mb-2">Humor Geral</p>
          <p className="text-3xl font-bold text-blue-600">7.2/10</p>
          <p className="text-sm text-gray-600 mt-2">↑ +0.5 desde última sessão</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-gray-600 mb-2">Ansiedade</p>
          <p className="text-3xl font-bold text-green-600">4.8/10</p>
          <p className="text-sm text-gray-600 mt-2">↓ -1.2 desde última sessão</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <p className="text-gray-600 mb-2">Qualidade de Sono</p>
          <p className="text-3xl font-bold text-purple-600">6.5/10</p>
          <p className="text-sm text-gray-600 mt-2">→ Mantido</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <p className="text-gray-600 mb-2">Engajamento em Técnicas</p>
          <p className="text-3xl font-bold text-orange-600">8.1/10</p>
          <p className="text-sm text-gray-600 mt-2">↑ +2.0 desde última sessão</p>
        </Card>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-xl font-bold mb-4">Técnicas Mais Efetivas</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            <span>Reestruturação Cognitiva (TCC)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            <span>Respiração Diafragmática</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            <span>Mindfulness</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function MessagesSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Mensagens Seguras</h2>

      <div className="space-y-4 mb-6">
        <Card className="p-4 bg-gray-50">
          <p className="text-sm text-gray-600">28/03/2026 - 10:30</p>
          <p className="font-semibold text-gray-800 mt-1">Psi. Daniela</p>
          <p className="text-gray-700 mt-2">
            Oi! Como você está se sentindo com as técnicas que trabalhamos? Temos
            espaço para conversar sobre isso na próxima sessão.
          </p>
        </Card>

        <Card className="p-4 bg-blue-50 ml-8">
          <p className="text-sm text-gray-600">28/03/2026 - 14:15</p>
          <p className="font-semibold text-blue-800 mt-1">Você</p>
          <p className="text-gray-700 mt-2">
            Oi Daniela! Estou bem, sim. A respiração diafragmática tem me ajudado
            bastante com a ansiedade.
          </p>
        </Card>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-bold mb-3">Enviar Mensagem</h3>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Digite sua mensagem aqui..."
          rows={4}
        ></textarea>
        <Button className="mt-3 bg-blue-600 hover:bg-blue-700">Enviar</Button>
      </div>
    </div>
  );
}
