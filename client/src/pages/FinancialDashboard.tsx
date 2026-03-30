import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Users, DollarSign, AlertCircle } from "lucide-react";

interface FinancialData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ChurnData {
  month: string;
  churnRate: number;
  activePatients: number;
}

interface PaymentStatus {
  status: "paid" | "pending" | "overdue";
  count: number;
  amount: number;
}

export function FinancialDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"month" | "quarter" | "year">("month");

  // Mock data - em produção, viria do tRPC
  const financialData: FinancialData[] = [
    { month: "Jan", revenue: 5000, expenses: 1200, profit: 3800 },
    { month: "Fev", revenue: 6200, expenses: 1300, profit: 4900 },
    { month: "Mar", revenue: 7500, expenses: 1400, profit: 6100 },
    { month: "Abr", revenue: 8900, expenses: 1500, profit: 7400 },
    { month: "Mai", revenue: 9200, expenses: 1600, profit: 7600 },
    { month: "Jun", revenue: 10500, expenses: 1700, profit: 8800 },
  ];

  const churnData: ChurnData[] = [
    { month: "Jan", churnRate: 5, activePatients: 45 },
    { month: "Fev", churnRate: 4, activePatients: 48 },
    { month: "Mar", churnRate: 3, activePatients: 52 },
    { month: "Abr", churnRate: 2, activePatients: 58 },
    { month: "Mai", churnRate: 2, activePatients: 62 },
    { month: "Jun", churnRate: 1, activePatients: 68 },
  ];

  const paymentStatus: PaymentStatus[] = [
    { status: "paid", count: 45, amount: 8500 },
    { status: "pending", count: 8, amount: 1200 },
    { status: "overdue", count: 3, amount: 450 },
  ];

  // Cálculos
  const totalRevenue = useMemo(
    () => financialData.reduce((sum, item) => sum + item.revenue, 0),
    [financialData]
  );

  const totalExpenses = useMemo(
    () => financialData.reduce((sum, item) => sum + item.expenses, 0),
    [financialData]
  );

  const totalProfit = useMemo(() => totalRevenue - totalExpenses, [totalRevenue, totalExpenses]);

  const averageMonthlyRevenue = useMemo(
    () => Math.round(totalRevenue / financialData.length),
    [totalRevenue, financialData]
  );

  const currentChurnRate = useMemo(
    () => churnData[churnData.length - 1]?.churnRate || 0,
    [churnData]
  );

  const activePatients = useMemo(
    () => churnData[churnData.length - 1]?.activePatients || 0,
    [churnData]
  );

  const projectedRevenue = useMemo(() => {
    const lastMonthRevenue = financialData[financialData.length - 1]?.revenue || 0;
    const growthRate = 0.05; // 5% crescimento mensal
    return Math.round(lastMonthRevenue * (1 + growthRate * 12));
  }, [financialData]);

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  const handleExportReport = () => {
    // Implementar exportação de relatório
    console.log("Exportando relatório financeiro...");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Financeiro</h1>
          <p className="text-muted-foreground mt-2">Análise de receita, despesas e métricas</p>
        </div>
        <Button onClick={handleExportReport} className="gap-2">
          <Download className="w-4 h-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {(totalRevenue / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground">
              Média: R$ {averageMonthlyRevenue.toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {(totalProfit / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground">
              Margem: {((totalProfit / totalRevenue) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePatients}</div>
            <p className="text-xs text-muted-foreground">
              Churn: {currentChurnRate}% este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Projetado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {(projectedRevenue / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground">Próximos 12 meses</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receita vs Despesas */}
        <Card>
          <CardHeader>
            <CardTitle>Receita vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  name="Receita"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  name="Despesas"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lucro Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Lucro Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`}
                />
                <Bar dataKey="profit" fill="#3b82f6" name="Lucro" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status de Pagamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Status de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {paymentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} pagamentos`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Churn de Pacientes */}
        <Card>
          <CardHeader>
            <CardTitle>Retenção de Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={churnData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="churnRate"
                  stroke="#ef4444"
                  name="Taxa Churn (%)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="activePatients"
                  stroke="#10b981"
                  name="Pacientes Ativos"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            Alertas Financeiros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-yellow-800">
            • 3 pagamentos vencidos totalizando R$ 450
          </p>
          <p className="text-sm text-yellow-800">
            • 8 pagamentos pendentes totalizando R$ 1.200
          </p>
          <p className="text-sm text-green-800">
            • Taxa de churn diminuiu 50% em relação ao mês anterior ✓
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
