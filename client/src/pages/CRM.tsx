import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Users, CheckCircle } from "lucide-react";

export default function CRM() {
  const leadsQuery = trpc.leads.list.useQuery();

  const leads = leadsQuery.data || [];
  const leadsByStatus = {
    novo: leads.filter((l: any) => l.status === "novo"),
    contato: leads.filter((l: any) => l.status === "contato"),
    proposta: leads.filter((l: any) => l.status === "proposta"),
    convertido: leads.filter((l: any) => l.status === "convertido"),
  };

  const conversionRate = leads.length > 0
    ? Math.round((leadsByStatus.convertido.length / leads.length) * 100)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "novo":
        return "bg-blue-100 text-blue-800";
      case "contato":
        return "bg-yellow-100 text-yellow-800";
      case "proposta":
        return "bg-purple-100 text-purple-800";
      case "convertido":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "novo":
        return "Novo";
      case "contato":
        return "Em Contato";
      case "proposta":
        return "Proposta";
      case "convertido":
        return "Convertido";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">CRM de Leads</h1>
          <p className="text-gray-600">Gerenciamento de pipeline de vendas</p>
        </div>
        <Button className="bg-green-700 hover:bg-green-800 text-white gap-2">
          <Plus className="w-4 h-4" />
          Novo Lead
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-green-500 border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              Total de Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{leads.length}</div>
            <p className="text-xs text-gray-600 mt-1">Todos os leads</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500 border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Taxa de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{conversionRate}%</div>
            <p className="text-xs text-gray-600 mt-1">
              {leadsByStatus.convertido.length} convertidos
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500 border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Em Processamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">
              {leadsByStatus.contato.length + leadsByStatus.proposta.length}
            </div>
            <p className="text-xs text-gray-600 mt-1">Contato + Proposta</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500 border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              Novos Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{leadsByStatus.novo.length}</div>
            <p className="text-xs text-gray-600 mt-1">Aguardando contato</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Novo */}
        <Card className="border-2 border-blue-500 border-dashed">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-700">Novo</CardTitle>
            <CardDescription>{leadsByStatus.novo.length} leads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {leadsByStatus.novo.map((lead: any, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-move hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-black text-sm">{lead.name || "Lead"}</p>
                <p className="text-xs text-gray-600">{lead.email || "-"}</p>
                <p className="text-xs text-gray-600">{lead.phone || "-"}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Em Contato */}
        <Card className="border-2 border-yellow-500 border-dashed">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-yellow-700">Em Contato</CardTitle>
            <CardDescription>{leadsByStatus.contato.length} leads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {leadsByStatus.contato.map((lead: any, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-move hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-black text-sm">{lead.name || "Lead"}</p>
                <p className="text-xs text-gray-600">{lead.email || "-"}</p>
                <p className="text-xs text-gray-600">{lead.phone || "-"}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Proposta */}
        <Card className="border-2 border-purple-500 border-dashed">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-purple-700">Proposta</CardTitle>
            <CardDescription>{leadsByStatus.proposta.length} leads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {leadsByStatus.proposta.map((lead: any, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-purple-50 border border-purple-200 rounded-lg cursor-move hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-black text-sm">{lead.name || "Lead"}</p>
                <p className="text-xs text-gray-600">{lead.email || "-"}</p>
                <p className="text-xs text-gray-600">{lead.phone || "-"}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Convertido */}
        <Card className="border-2 border-green-500 border-dashed">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-green-700">Convertido</CardTitle>
            <CardDescription>{leadsByStatus.convertido.length} leads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {leadsByStatus.convertido.map((lead: any, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-green-50 border border-green-200 rounded-lg cursor-move hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-black text-sm">{lead.name || "Lead"}</p>
                <p className="text-xs text-gray-600">{lead.email || "-"}</p>
                <p className="text-xs text-gray-600">{lead.phone || "-"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
