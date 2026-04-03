import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, TrendingUp, Clock, FileText, Play } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({
    totalPatients: 57,
    activePatients: 57,
    appointmentsToday: 6,
    appointmentsThisWeek: 35,
    activeLeads: 18,
    recentSessions: 5,
  });

  // Fetch patients
  const patientsQuery = trpc.patients.list.useQuery();
  
  // Fetch appointments
  const appointmentsQuery = trpc.appointments.list.useQuery();

  // Calculate stats
  useEffect(() => {
    if (patientsQuery.data) {
      const total = patientsQuery.data.length;
      const active = patientsQuery.data.filter((p: any) => p.status === "active").length;
      setStats(prev => ({
        ...prev,
        totalPatients: total,
        activePatients: active,
      }));
    }
  }, [patientsQuery.data]);

  // Get upcoming appointments (next 5)
  const upcomingAppointments = appointmentsQuery.data?.slice(0, 5) || [];

  // Get recent sessions
  const recentSessions = appointmentsQuery.data?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-black">Bom dia, Dra. Daniela.</h1>
        <p className="text-gray-600">Aqui está o resumo do seu consultório hoje.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pacientes Ativos */}
        <Card className="border-2 border-green-500 border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              Pacientes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{stats.activePatients}</div>
            <p className="text-xs text-gray-600 mt-1">de {stats.totalPatients} totais</p>
          </CardContent>
        </Card>

        {/* Consultas Hoje */}
        <Card className="border-2 border-green-500 border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-600" />
              Consultas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{stats.appointmentsToday}</div>
            <p className="text-xs text-gray-600 mt-1">Nesta semana: {stats.appointmentsThisWeek}</p>
          </CardContent>
        </Card>

        {/* Leads Ativos */}
        <Card className="border-2 border-green-500 border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Leads Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{stats.activeLeads}</div>
            <p className="text-xs text-gray-600 mt-1">Aguardando conversão</p>
          </CardContent>
        </Card>

        {/* Ação Rápida */}
        <Card className="border-2 border-green-500 border-dashed flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Ação Rápida</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-end">
            <Button
              className="w-full bg-green-700 hover:bg-green-800 text-white gap-2"
              onClick={() => setLocation("/assistente")}
            >
              <Play className="w-4 h-4" />
              Iniciar Assistente
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas Consultas */}
        <div className="lg:col-span-2">
          <Card className="border-2 border-green-500 border-dashed">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg font-bold">Próximas Consultas</CardTitle>
                <CardDescription>Próximos 5 agendamentos</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-green-500 text-green-700 hover:bg-green-50"
                onClick={() => setLocation("/agendamentos")}
              >
                Ver agenda completa
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((apt: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-0">
                      <div className="text-sm font-bold text-green-700 min-w-fit">
                        {new Date(apt.scheduledAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-black">{apt.patientName || "Paciente"}</p>
                        <p className="text-sm text-gray-600">{apt.type || "Sessão Individual"} • 50 min</p>
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-green-700 hover:text-green-800"
                      >
                        Prontuário
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm">Nenhuma consulta agendada</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Últimas Notas Geradas */}
        <div>
          <Card className="border-2 border-green-500 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Últimas Notas Geradas</CardTitle>
              <CardDescription>Últimas 5 sessões</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSessions.length > 0 ? (
                  recentSessions.map((session: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0 cursor-pointer hover:bg-green-50 p-2 rounded"
                    >
                      <FileText className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-black text-sm truncate">
                          {session.patientName || "Paciente"}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {session.type || "Sessão"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(session.scheduledAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm">Nenhuma nota registrada</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
