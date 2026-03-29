import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  History,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Download,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Service {
  id: string;
  name: string;
  type: string;
  currentPrice: number;
  originalPrice: number;
  status: "active" | "inactive";
  lastModified: string;
}

interface PriceChange {
  id: string;
  serviceName: string;
  previousPrice: number;
  newPrice: number;
  changeReason: string;
  changeDate: string;
  percentageChange: number;
}

export default function PricingManagement() {
  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      name: "Consulta Online Premium",
      type: "online",
      currentPrice: 600,
      originalPrice: 600,
      status: "active",
      lastModified: "2026-03-29",
    },
    {
      id: "2",
      name: "Sessão Presencial Premium",
      type: "presencial",
      currentPrice: 1000,
      originalPrice: 1000,
      status: "active",
      lastModified: "2026-03-29",
    },
    {
      id: "3",
      name: "Programa 90 Dias",
      type: "programa",
      currentPrice: 12000,
      originalPrice: 12000,
      status: "active",
      lastModified: "2026-03-29",
    },
    {
      id: "4",
      name: "Masterclass Domínio Emocional",
      type: "curso",
      currentPrice: 1500,
      originalPrice: 1500,
      status: "active",
      lastModified: "2026-03-29",
    },
    {
      id: "5",
      name: "Grupo VIP Mensal",
      type: "grupo",
      currentPrice: 300,
      originalPrice: 300,
      status: "active",
      lastModified: "2026-03-29",
    },
  ]);

  const [priceHistory, setPriceHistory] = useState<PriceChange[]>([
    {
      id: "1",
      serviceName: "Consulta Online Premium",
      previousPrice: 500,
      newPrice: 600,
      changeReason: "Aumento de demanda - Posicionamento Premium",
      changeDate: "2026-03-15",
      percentageChange: 20,
    },
    {
      id: "2",
      serviceName: "Sessão Presencial Premium",
      previousPrice: 800,
      newPrice: 1000,
      changeReason: "Reconhecimento de CRP - Autoridade estabelecida",
      changeDate: "2026-03-20",
      percentageChange: 25,
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [showNewService, setShowNewService] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    type: "online",
    price: "",
  });

  const handleEditPrice = (service: Service) => {
    setEditingId(service.id);
    setEditValue(service.currentPrice.toString());
  };

  const handleSavePrice = (serviceId: string) => {
    const newPrice = parseInt(editValue);
    if (newPrice > 0) {
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        const oldPrice = service.currentPrice;
        const percentageChange = ((newPrice - oldPrice) / oldPrice) * 100;

        // Atualizar serviço
        setServices(
          services.map((s) =>
            s.id === serviceId
              ? { ...s, currentPrice: newPrice, lastModified: new Date().toISOString().split("T")[0] }
              : s
          )
        );

        // Adicionar ao histórico
        setPriceHistory([
          {
            id: `change_${Date.now()}`,
            serviceName: service.name,
            previousPrice: oldPrice,
            newPrice,
            changeReason: "Ajuste manual de preço",
            changeDate: new Date().toISOString().split("T")[0],
            percentageChange,
          },
          ...priceHistory,
        ]);

        setEditingId(null);
      }
    }
  };

  const handleAddService = () => {
    if (newService.name && newService.price) {
      const price = parseInt(newService.price);
      setServices([
        ...services,
        {
          id: `service_${Date.now()}`,
          name: newService.name,
          type: newService.type,
          currentPrice: price,
          originalPrice: price,
          status: "active",
          lastModified: new Date().toISOString().split("T")[0],
        },
      ]);
      setNewService({ name: "", type: "online", price: "" });
      setShowNewService(false);
    }
  };

  const handleDeleteService = (serviceId: string) => {
    setServices(services.filter((s) => s.id !== serviceId));
  };

  const handleBulkIncrease = (percentage: number) => {
    const updatedServices = services.map((s) => {
      const newPrice = Math.round(s.currentPrice * (1 + percentage / 100));
      const percentageChange = ((newPrice - s.currentPrice) / s.currentPrice) * 100;

      setPriceHistory((prev) => [
        {
          id: `change_${Date.now()}_${s.id}`,
          serviceName: s.name,
          previousPrice: s.currentPrice,
          newPrice,
          changeReason: `Aumento em lote de ${percentage}%`,
          changeDate: new Date().toISOString().split("T")[0],
          percentageChange,
        },
        ...prev,
      ]);

      return { ...s, currentPrice: newPrice, lastModified: new Date().toISOString().split("T")[0] };
    });

    setServices(updatedServices);
  };

  const totalMonthlyRevenue = services.reduce((sum, s) => sum + s.currentPrice * 10, 0); // Assumir 10 clientes por serviço
  const totalRevenueIncrease = priceHistory.reduce((sum, h) => sum + (h.newPrice - h.previousPrice), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Preços</h1>
          <p className="text-muted-foreground mt-2">Controle completo de valores de consultas e serviços</p>
        </div>
        <Button onClick={() => setShowNewService(!showNewService)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Serviço
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Receita Mensal Projetada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ {totalMonthlyRevenue.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground mt-1">Baseado em 10 clientes/serviço</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Impacto de Preços
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">R$ {totalRevenueIncrease.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground mt-1">Aumento total desde o início</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Serviços Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{services.filter((s) => s.status === "active").length}</div>
            <p className="text-xs text-muted-foreground mt-1">De {services.length} total</p>
          </CardContent>
        </Card>
      </div>

      {/* Novo Serviço */}
      {showNewService && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Adicionar Novo Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Nome do Serviço</label>
                <Input
                  placeholder="Ex: Consulta Online"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <select
                  value={newService.type}
                  onChange={(e) => setNewService({ ...newService, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md mt-1"
                >
                  <option value="online">Online</option>
                  <option value="presencial">Presencial</option>
                  <option value="programa">Programa</option>
                  <option value="curso">Curso</option>
                  <option value="grupo">Grupo</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Preço (R$)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddService} className="gap-2">
                <Save className="w-4 h-4" />
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setShowNewService(false)} className="gap-2">
                <X className="w-4 h-4" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Abas */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="bulk">Ações em Lote</TabsTrigger>
        </TabsList>

        {/* Serviços */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Serviços</CardTitle>
              <CardDescription>Clique para editar preços</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Preço Atual</TableHead>
                      <TableHead>Preço Original</TableHead>
                      <TableHead>Variação</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => {
                      const variation = ((service.currentPrice - service.originalPrice) / service.originalPrice) * 100;
                      const isEditing = editingId === service.id;

                      return (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{service.type}</Badge>
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-24"
                              />
                            ) : (
                              `R$ ${service.currentPrice.toLocaleString("pt-BR")}`
                            )}
                          </TableCell>
                          <TableCell>R$ {service.originalPrice.toLocaleString("pt-BR")}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {variation > 0 ? (
                                <TrendingUp className="w-4 h-4 text-green-600" />
                              ) : variation < 0 ? (
                                <TrendingDown className="w-4 h-4 text-red-600" />
                              ) : null}
                              <span className={variation > 0 ? "text-green-600" : variation < 0 ? "text-red-600" : ""}>
                                {variation > 0 ? "+" : ""}
                                {variation.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={service.status === "active" ? "default" : "secondary"}>
                              {service.status === "active" ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {isEditing ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleSavePrice(service.id)}
                                    className="gap-1"
                                  >
                                    <Save className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingId(null)}
                                    className="gap-1"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditPrice(service)}
                                    className="gap-1"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteService(service.id)}
                                    className="gap-1 text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Histórico de Mudanças de Preço
              </CardTitle>
              <CardDescription>Todas as alterações de preço realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {priceHistory.map((change) => (
                  <div key={change.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{change.serviceName}</h4>
                        <p className="text-sm text-muted-foreground">{change.changeDate}</p>
                      </div>
                      <Badge variant={change.percentageChange > 0 ? "default" : "secondary"}>
                        {change.percentageChange > 0 ? "+" : ""}
                        {change.percentageChange.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      <div>
                        <p className="text-sm text-muted-foreground">De</p>
                        <p className="font-bold">R$ {change.previousPrice.toLocaleString("pt-BR")}</p>
                      </div>
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Para</p>
                        <p className="font-bold">R$ {change.newPrice.toLocaleString("pt-BR")}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Motivo: {change.changeReason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ações em Lote */}
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Ações em Lote</CardTitle>
              <CardDescription>Aplicar mudanças a todos os serviços simultaneamente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleBulkIncrease(10)}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <TrendingUp className="w-4 h-4" />
                  Aumentar 10%
                </Button>
                <Button
                  onClick={() => handleBulkIncrease(20)}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <TrendingUp className="w-4 h-4" />
                  Aumentar 20%
                </Button>
                <Button
                  onClick={() => handleBulkIncrease(25)}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <TrendingUp className="w-4 h-4" />
                  Aumentar 25%
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Resumo de Impacto</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Aumentos em lote aplicam a todos os serviços simultaneamente</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Cada mudança é registrada no histórico com motivo "Aumento em lote"</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Recomendado para posicionamento premium pós-CRP</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recomendações */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            Recomendações de Preço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Com CRP aprovado: Aumentar 25-50% para posicionamento premium</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Consulta Online: R$ 600-800 (era R$ 150-200)</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Sessão Presencial: R$ 1000-1500 (era R$ 200-300)</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Programa 90 Dias: R$ 12000-20000 (era R$ 3000-5000)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
