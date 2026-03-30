import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
} from "lucide-react";

interface MetricData {
  date: string;
  sent: number;
  delivered: number;
  confirmed: number;
  cancelled: number;
  failed: number;
}

interface ChannelMetrics {
  channel: string;
  sent: number;
  delivered: number;
  rate: number;
}

export function NotificationMetrics() {
  // Dados fictícios para demonstração
  const [timeRange] = useState<"7d" | "30d" | "90d">("30d");

  const metricsData: MetricData[] = useMemo(
    () => [
      {
        date: "01/03",
        sent: 15,
        delivered: 14,
        confirmed: 12,
        cancelled: 1,
        failed: 1,
      },
      {
        date: "02/03",
        sent: 18,
        delivered: 17,
        confirmed: 15,
        cancelled: 2,
        failed: 1,
      },
      {
        date: "03/03",
        sent: 12,
        delivered: 12,
        confirmed: 11,
        cancelled: 0,
        failed: 0,
      },
      {
        date: "04/03",
        sent: 20,
        delivered: 19,
        confirmed: 17,
        cancelled: 2,
        failed: 1,
      },
      {
        date: "05/03",
        sent: 16,
        delivered: 16,
        confirmed: 14,
        cancelled: 1,
        failed: 0,
      },
      {
        date: "06/03",
        sent: 22,
        delivered: 21,
        confirmed: 19,
        cancelled: 2,
        failed: 1,
      },
      {
        date: "07/03",
        sent: 19,
        delivered: 18,
        confirmed: 16,
        cancelled: 1,
        failed: 1,
      },
    ],
    []
  );

  const channelMetrics: ChannelMetrics[] = [
    { channel: "E-mail", sent: 120, delivered: 115, rate: 95.8 },
    { channel: "WhatsApp", sent: 110, delivered: 108, rate: 98.2 },
    { channel: "SMS", sent: 45, delivered: 42, rate: 93.3 },
  ];

  const confirmationData = [
    { name: "Confirmadas", value: 104, color: "#10b981" },
    { name: "Canceladas", value: 9, color: "#ef4444" },
    { name: "Talvez", value: 12, color: "#f59e0b" },
  ];

  // Cálculos de métricas
  const totalSent = metricsData.reduce((acc, d) => acc + d.sent, 0);
  const totalDelivered = metricsData.reduce((acc, d) => acc + d.delivered, 0);
  const totalConfirmed = metricsData.reduce((acc, d) => acc + d.confirmed, 0);
  const totalCancelled = metricsData.reduce((acc, d) => acc + d.cancelled, 0);
  const totalFailed = metricsData.reduce((acc, d) => acc + d.failed, 0);

  const deliveryRate = ((totalDelivered / totalSent) * 100).toFixed(1);
  const confirmationRate = ((totalConfirmed / totalDelivered) * 100).toFixed(1);
  const cancellationRate = ((totalCancelled / totalDelivered) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Métricas de Notificações</h1>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Enviadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent}</div>
            <p className="text-xs text-gray-600">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Taxa de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveryRate}%</div>
            <p className="text-xs text-gray-600">{totalDelivered} entregues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Confirmadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmationRate}%</div>
            <p className="text-xs text-gray-600">{totalConfirmed} confirmações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              Canceladas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancellationRate}%</div>
            <p className="text-xs text-gray-600">{totalCancelled} cancelamentos</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Tendência */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Notificações (Últimos 7 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="sent"
                stroke="#3b82f6"
                name="Enviadas"
              />
              <Line
                type="monotone"
                dataKey="delivered"
                stroke="#10b981"
                name="Entregues"
              />
              <Line
                type="monotone"
                dataKey="confirmed"
                stroke="#8b5cf6"
                name="Confirmadas"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Canais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sent" fill="#3b82f6" name="Enviadas" />
                <Bar dataKey="delivered" fill="#10b981" name="Entregues" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxa de Confirmação</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={confirmationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {confirmationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Canais */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Canal</th>
                  <th className="text-right py-2 px-4">Enviadas</th>
                  <th className="text-right py-2 px-4">Entregues</th>
                  <th className="text-right py-2 px-4">Taxa Entrega</th>
                </tr>
              </thead>
              <tbody>
                {channelMetrics.map((metric) => (
                  <tr key={metric.channel} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{metric.channel}</td>
                    <td className="text-right py-2 px-4">{metric.sent}</td>
                    <td className="text-right py-2 px-4">{metric.delivered}</td>
                    <td className="text-right py-2 px-4">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {metric.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">💡 Recomendações</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            ✅ <strong>WhatsApp tem melhor taxa de entrega:</strong> Considere
            priorizar WhatsApp para confirmações críticas.
          </p>
          <p>
            📈 <strong>Tendência positiva:</strong> Taxa de confirmação aumentou
            5% nos últimos 7 dias.
          </p>
          <p>
            🕐 <strong>Timing ideal:</strong> Lembretes enviados 24h antes têm
            taxa de confirmação 15% maior.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
