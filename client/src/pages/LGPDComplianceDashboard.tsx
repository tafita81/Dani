import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
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
  LineChart,
  Line,
} from "recharts";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Lock,
  Shield,
  Download,
  Eye,
  EyeOff,
  Trash2,
  FileText,
} from "lucide-react";

interface AccessLog {
  id: string;
  patientId: string;
  patientName: string;
  accessedBy: string;
  accessType: "view" | "edit" | "export" | "delete";
  timestamp: Date;
  dataAccessed: string[];
  ipAddress?: string;
  reason?: string;
  status: "success" | "denied";
}

interface ConsentRecord {
  id: string;
  patientId: string;
  patientName: string;
  consentType: "data_processing" | "third_party_sharing" | "marketing" | "research";
  status: "granted" | "denied" | "revoked";
  grantedDate?: Date;
  revokedDate?: Date;
  expiryDate?: Date;
  documentUrl?: string;
}

interface DataSharingRecord {
  id: string;
  patientId: string;
  patientName: string;
  sharedWith: string;
  dataType: string[];
  sharedDate: Date;
  purpose: string;
  expiryDate?: Date;
  status: "active" | "expired" | "revoked";
}

export default function LGPDComplianceDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showAccessDetails, setShowAccessDetails] = useState(false);
  const [consentFilter, setConsentFilter] = useState<"all" | "granted" | "denied" | "revoked">("all");

  // Mock data - em produção, isso viria do backend
  const accessLogs: AccessLog[] = [
    {
      id: "1",
      patientId: "pat1",
      patientName: "João Silva",
      accessedBy: "Dani Coelho",
      accessType: "view",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      dataAccessed: ["Histórico de consultas", "Formulários psicológicos"],
      ipAddress: "192.168.1.100",
      reason: "Consulta clínica",
      status: "success",
    },
    {
      id: "2",
      patientId: "pat2",
      patientName: "Maria Santos",
      accessedBy: "Dani Coelho",
      accessType: "export",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      dataAccessed: ["Relatório de evolução"],
      ipAddress: "192.168.1.100",
      reason: "Exportação para relatório",
      status: "success",
    },
    {
      id: "3",
      patientId: "pat3",
      patientName: "Pedro Costa",
      accessedBy: "Sistema",
      accessType: "view",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      dataAccessed: ["Dados de agendamento"],
      ipAddress: "10.0.0.1",
      reason: "Sincronização automática",
      status: "success",
    },
  ];

  const consentRecords: ConsentRecord[] = [
    {
      id: "c1",
      patientId: "pat1",
      patientName: "João Silva",
      consentType: "data_processing",
      status: "granted",
      grantedDate: new Date("2026-01-15"),
      expiryDate: new Date("2027-01-15"),
      documentUrl: "/consents/pat1-data-processing.pdf",
    },
    {
      id: "c2",
      patientId: "pat1",
      patientName: "João Silva",
      consentType: "third_party_sharing",
      status: "denied",
      grantedDate: new Date("2026-01-15"),
    },
    {
      id: "c3",
      patientId: "pat2",
      patientName: "Maria Santos",
      consentType: "data_processing",
      status: "granted",
      grantedDate: new Date("2025-11-20"),
      expiryDate: new Date("2026-11-20"),
      documentUrl: "/consents/pat2-data-processing.pdf",
    },
    {
      id: "c4",
      patientId: "pat2",
      patientName: "Maria Santos",
      consentType: "marketing",
      status: "revoked",
      grantedDate: new Date("2025-11-20"),
      revokedDate: new Date("2026-02-10"),
    },
  ];

  const dataSharingRecords: DataSharingRecord[] = [
    {
      id: "ds1",
      patientId: "pat1",
      patientName: "João Silva",
      sharedWith: "Clínica Parceira XYZ",
      dataType: ["Diagnóstico", "Histórico de tratamento"],
      sharedDate: new Date("2026-02-01"),
      purpose: "Continuidade do tratamento",
      expiryDate: new Date("2026-08-01"),
      status: "active",
    },
    {
      id: "ds2",
      patientId: "pat2",
      patientName: "Maria Santos",
      sharedWith: "Hospital ABC",
      dataType: ["Avaliação psicológica"],
      sharedDate: new Date("2026-01-15"),
      purpose: "Avaliação pré-cirúrgica",
      expiryDate: new Date("2026-02-15"),
      status: "expired",
    },
  ];

  const filteredConsents =
    consentFilter === "all"
      ? consentRecords
      : consentRecords.filter((c) => c.status === consentFilter);

  const accessByType = [
    { name: "Visualização", value: accessLogs.filter((a) => a.accessType === "view").length },
    { name: "Edição", value: accessLogs.filter((a) => a.accessType === "edit").length },
    { name: "Exportação", value: accessLogs.filter((a) => a.accessType === "export").length },
    { name: "Deleção", value: accessLogs.filter((a) => a.accessType === "delete").length },
  ];

  const consentStatus = [
    { name: "Concedido", value: consentRecords.filter((c) => c.status === "granted").length },
    { name: "Negado", value: consentRecords.filter((c) => c.status === "denied").length },
    { name: "Revogado", value: consentRecords.filter((c) => c.status === "revoked").length },
  ];

  const COLORS = ["#10b981", "#ef4444", "#f59e0b"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Conformidade LGPD</h1>
        <p className="text-muted-foreground mt-2">
          Auditoria de acesso a dados, consentimentos e compartilhamento de informações
        </p>
      </div>

      {/* Alertas de Conformidade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Conformidade Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">Todos os acessos auditados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              Consentimentos Válidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {consentRecords.filter((c) => c.status === "granted").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {consentRecords.filter((c) => c.status === "granted" && c.expiryDate && new Date(c.expiryDate) < new Date()).length} próximos de expirar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-500" />
              Compartilhamentos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dataSharingRecords.filter((d) => d.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {dataSharingRecords.filter((d) => d.status === "expired").length} expirados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Acesso</CardTitle>
            <CardDescription>Distribuição de acessos aos dados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={accessByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status de Consentimentos</CardTitle>
            <CardDescription>Distribuição de consentimentos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={consentStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes seções */}
      <Tabs defaultValue="access-logs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="access-logs">Auditoria de Acesso</TabsTrigger>
          <TabsTrigger value="consents">Consentimentos</TabsTrigger>
          <TabsTrigger value="data-sharing">Compartilhamento</TabsTrigger>
        </TabsList>

        {/* Auditoria de Acesso */}
        <TabsContent value="access-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Acessos</CardTitle>
              <CardDescription>Todos os acessos a dados de pacientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accessLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold">{log.patientName}</div>
                        <div className="text-sm text-muted-foreground">
                          Acessado por: {log.accessedBy}
                        </div>
                      </div>
                      <Badge
                        variant={log.status === "success" ? "default" : "destructive"}
                      >
                        {log.status === "success" ? "✓ Sucesso" : "✗ Negado"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Tipo de Acesso:</span>
                        <div className="font-medium capitalize">{log.accessType}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data/Hora:</span>
                        <div className="font-medium">
                          {format(log.timestamp, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm mb-3">
                      <span className="text-muted-foreground">Dados Acessados:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {log.dataAccessed.map((data, idx) => (
                          <Badge key={idx} variant="outline">
                            {data}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {log.reason && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Motivo:</span> {log.reason}
                      </div>
                    )}

                    {log.ipAddress && (
                      <div className="text-xs text-muted-foreground mt-2">
                        IP: {log.ipAddress}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consentimentos */}
        <TabsContent value="consents" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Consentimentos de Pacientes</CardTitle>
                <CardDescription>Gestão de consentimentos LGPD</CardDescription>
              </div>
              <div className="flex gap-2">
                {["all", "granted", "denied", "revoked"].map((filter) => (
                  <Button
                    key={filter}
                    variant={consentFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setConsentFilter(filter as typeof consentFilter)}
                  >
                    {filter === "all"
                      ? "Todos"
                      : filter === "granted"
                        ? "Concedidos"
                        : filter === "denied"
                          ? "Negados"
                          : "Revogados"}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredConsents.map((consent) => (
                  <div
                    key={consent.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold">{consent.patientName}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {consent.consentType.replace(/_/g, " ")}
                        </div>
                      </div>
                      <Badge
                        variant={
                          consent.status === "granted"
                            ? "default"
                            : consent.status === "denied"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {consent.status === "granted"
                          ? "✓ Concedido"
                          : consent.status === "denied"
                            ? "✗ Negado"
                            : "⊘ Revogado"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {consent.grantedDate && (
                        <div>
                          <span className="text-muted-foreground">Data de Concessão:</span>
                          <div className="font-medium">
                            {format(consent.grantedDate, "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </div>
                      )}
                      {consent.expiryDate && (
                        <div>
                          <span className="text-muted-foreground">Validade:</span>
                          <div className="font-medium">
                            {format(consent.expiryDate, "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </div>
                      )}
                      {consent.revokedDate && (
                        <div>
                          <span className="text-muted-foreground">Data de Revogação:</span>
                          <div className="font-medium">
                            {format(consent.revokedDate, "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </div>
                      )}
                    </div>

                    {consent.documentUrl && (
                      <Button variant="link" size="sm" className="mt-3">
                        <FileText className="w-4 h-4 mr-2" />
                        Ver Documento
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compartilhamento de Dados */}
        <TabsContent value="data-sharing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compartilhamento de Dados</CardTitle>
              <CardDescription>Histórico de compartilhamentos com terceiros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataSharingRecords.map((sharing) => (
                  <div
                    key={sharing.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold">{sharing.patientName}</div>
                        <div className="text-sm text-muted-foreground">
                          Compartilhado com: {sharing.sharedWith}
                        </div>
                      </div>
                      <Badge
                        variant={
                          sharing.status === "active"
                            ? "default"
                            : sharing.status === "expired"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {sharing.status === "active"
                          ? "Ativo"
                          : sharing.status === "expired"
                            ? "Expirado"
                            : "Revogado"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Data de Compartilhamento:</span>
                        <div className="font-medium">
                          {format(sharing.sharedDate, "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </div>
                      {sharing.expiryDate && (
                        <div>
                          <span className="text-muted-foreground">Validade:</span>
                          <div className="font-medium">
                            {format(sharing.expiryDate, "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-sm mb-3">
                      <span className="text-muted-foreground">Dados Compartilhados:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {sharing.dataType.map((type, idx) => (
                          <Badge key={idx} variant="outline">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Motivo:</span> {sharing.purpose}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Detalhes
                      </Button>
                      {sharing.status === "active" && (
                        <Button variant="outline" size="sm" className="text-red-500">
                          <Lock className="w-4 h-4 mr-2" />
                          Revogar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Exportar Relatório */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Relatório de Conformidade</CardTitle>
          <CardDescription>Gere um relatório completo para auditoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Exportar como PDF
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar como CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
