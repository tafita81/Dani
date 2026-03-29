import { useParams } from "wouter";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, TrendingUp, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";

/**
 * Dashboard de Evolução do Paciente
 * Mostra gráficos comparativos de evolução clínica ao longo das sessões
 */
export default function PatientEvolutionDashboard() {
  const { patientId } = useParams<{ patientId: string }>();
  
  // Dados simulados para demonstração
  const moodData = [
    { session: "Sessão 1", mood: 3, anxiety: 7, depression: 6, date: "15/03" },
    { session: "Sessão 2", mood: 4, anxiety: 6, depression: 5, date: "18/03" },
    { session: "Sessão 3", mood: 5, anxiety: 5, depression: 4, date: "22/03" },
    { session: "Sessão 4", mood: 6, anxiety: 4, depression: 3, date: "25/03" },
    { session: "Sessão 5", mood: 7, anxiety: 3, depression: 2, date: "29/03" },
  ];

  const techniquesUsed = [
    { technique: "TCC", sessions: 5, effectiveness: 8.5 },
    { technique: "Respiração", sessions: 4, effectiveness: 7.8 },
    { technique: "Reestruturação Cognitiva", sessions: 3, effectiveness: 8.2 },
    { technique: "Exposição Gradual", sessions: 2, effectiveness: 7.5 },
    { technique: "Mindfulness", sessions: 4, effectiveness: 8.0 },
  ];

  const skillsProgress = [
    { skill: "Autorregulação", value: 65 },
    { skill: "Assertividade", value: 58 },
    { skill: "Resolução de Problemas", value: 72 },
    { skill: "Comunicação", value: 68 },
    { skill: "Inteligência Emocional", value: 75 },
  ];

  const inventoryScores = [
    { name: "BDI-II", initial: 28, current: 12, improvement: 57 },
    { name: "BAI", initial: 32, current: 14, improvement: 56 },
    { name: "PHQ-9", initial: 18, current: 7, improvement: 61 },
    { name: "GAD-7", initial: 19, current: 8, improvement: 58 },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Evolução Clínica do Paciente</h1>
          <p className="text-gray-500 mt-1">Análise comparativa de progresso ao longo das sessões</p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Humor Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">7/10</div>
              <div className="flex items-center gap-1 text-green-600">
                <ArrowUp className="w-4 h-4" />
                <span className="text-sm">+4 pontos</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Melhora de 57% desde início</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ansiedade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">3/10</div>
              <div className="flex items-center gap-1 text-green-600">
                <ArrowDown className="w-4 h-4" />
                <span className="text-sm">-4 pontos</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Redução de 56% desde início</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Depressão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">2/10</div>
              <div className="flex items-center gap-1 text-green-600">
                <ArrowDown className="w-4 h-4" />
                <span className="text-sm">-4 pontos</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Redução de 61% desde início</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sessões Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">5</div>
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Frequência: 2x por semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução de Humor, Ansiedade e Depressão */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Sintomas</CardTitle>
            <CardDescription>Progresso ao longo das sessões</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="mood" stroke="#10b981" name="Humor" strokeWidth={2} />
                <Line type="monotone" dataKey="anxiety" stroke="#f59e0b" name="Ansiedade" strokeWidth={2} />
                <Line type="monotone" dataKey="depression" stroke="#ef4444" name="Depressão" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Técnicas Utilizadas */}
        <Card>
          <CardHeader>
            <CardTitle>Técnicas Mais Efetivas</CardTitle>
            <CardDescription>Efetividade por técnica utilizada</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={techniquesUsed}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="technique" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="effectiveness" fill="#3b82f6" name="Efetividade (0-10)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Habilidades Desenvolvidas */}
        <Card>
          <CardHeader>
            <CardTitle>Habilidades Desenvolvidas</CardTitle>
            <CardDescription>Progresso em competências clínicas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillsProgress}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Progresso (%)" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventários Psicológicos */}
        <Card>
          <CardHeader>
            <CardTitle>Inventários Psicológicos</CardTitle>
            <CardDescription>Comparação inicial vs atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryScores.map((inventory) => (
                <div key={inventory.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{inventory.name}</span>
                    <span className="text-sm text-green-600 font-semibold">
                      {inventory.improvement}% melhora
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="text-sm text-gray-500">{inventory.initial}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(inventory.initial / 35) * 100}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-500">{inventory.current}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(inventory.current / 35) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações Clínicas</CardTitle>
          <CardDescription>Baseado na evolução observada</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span>Continuar com técnicas de TCC - mostrando alta efetividade (8.5/10)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span>Aumentar frequência de mindfulness - paciente respondendo bem</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">→</span>
              <span>Considerar introduzir técnicas de assertividade - área com menor progresso</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">→</span>
              <span>Manter acompanhamento mensal com inventários para monitorar manutenção de ganhos</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
