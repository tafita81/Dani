import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Plus, Search, Filter } from "lucide-react";
import { toast } from "sonner";

export default function Pacientes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [originFilter, setOriginFilter] = useState<string>("");
  const [genderFilter, setGenderFilter] = useState<string>("");

  // Fetch patients
  const patientsQuery = trpc.patients.list.useQuery();

  // Filter patients
  const filteredPatients = useMemo(() => {
    if (!patientsQuery.data) return [];

    return patientsQuery.data.filter((patient: any) => {
      const matchesSearch =
        searchTerm === "" ||
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm) ||
        patient.cpf?.includes(searchTerm);

      const matchesStatus = statusFilter === "" || patient.status === statusFilter;
      const matchesOrigin = originFilter === "" || patient.origin === originFilter;
      const matchesGender = genderFilter === "" || patient.gender === genderFilter;

      return matchesSearch && matchesStatus && matchesOrigin && matchesGender;
    });
  }, [patientsQuery.data, searchTerm, statusFilter, originFilter, genderFilter]);

  const handleExportCSV = () => {
    if (filteredPatients.length === 0) {
      toast.error("Nenhum paciente para exportar");
      return;
    }

    const headers = ["Nome", "Email", "Telefone", "CPF", "Status", "Origem", "Gênero"];
    const rows = filteredPatients.map((p: any) => [
      p.name || "",
      p.email || "",
      p.phone || "",
      p.cpf || "",
      p.status || "",
      p.origin || "",
      p.gender || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pacientes_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success(`${filteredPatients.length} pacientes exportados`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "lead":
        return "bg-blue-100 text-blue-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "lead":
        return "Lead";
      case "inactive":
        return "Inativo";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Pacientes</h1>
          <p className="text-gray-600">
            {filteredPatients.length} paciente{filteredPatients.length !== 1 ? "s" : ""} encontrado
            {filteredPatients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-green-500 text-green-700 hover:bg-green-50 gap-2"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
          <Button className="bg-green-700 hover:bg-green-800 text-white gap-2">
            <Plus className="w-4 h-4" />
            Novo Paciente
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-2 border-green-500 border-dashed">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, CPF, e-mail..."
                className="pl-10 border-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-green-500">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={originFilter} onValueChange={setOriginFilter}>
                <SelectTrigger className="border-green-500">
                  <SelectValue placeholder="Origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as Origens</SelectItem>
                  <SelectItem value="Plano de Saúde">Plano de Saúde</SelectItem>
                  <SelectItem value="Google">Google</SelectItem>
                  <SelectItem value="Indicação">Indicação</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Site">Site</SelectItem>
                  <SelectItem value="Indicação médica">Indicação médica</SelectItem>
                </SelectContent>
              </Select>

              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="border-green-500">
                  <SelectValue placeholder="Gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os Gêneros</SelectItem>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                  <SelectItem value="O">Outro</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="border-green-500 text-green-700 hover:bg-green-50 gap-2"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setOriginFilter("");
                  setGenderFilter("");
                }}
              >
                <Filter className="w-4 h-4" />
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card className="border-2 border-green-500 border-dashed">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-green-500 border-dashed">
                  <th className="text-left py-3 px-4 font-semibold text-black">Nome</th>
                  <th className="text-left py-3 px-4 font-semibold text-black">Contato</th>
                  <th className="text-left py-3 px-4 font-semibold text-black">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-black">Origem</th>
                  <th className="text-left py-3 px-4 font-semibold text-black">Gênero</th>
                  <th className="text-left py-3 px-4 font-semibold text-black">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient: any) => (
                    <tr
                      key={patient.id}
                      className="border-b-2 border-green-500 border-dashed hover:bg-green-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-xs">
                            {patient.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <span className="font-medium text-black">{patient.name || "-"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p className="text-black">{patient.phone || "-"}</p>
                          <p className="text-gray-600">{patient.email || "-"}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(patient.status || "")}`}>
                          {getStatusLabel(patient.status || "")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-black">{patient.origin || "-"}</td>
                      <td className="py-3 px-4 text-black">{patient.gender || "-"}</td>
                      <td className="py-3 px-4">
                        <Button
                          variant="link"
                          size="sm"
                          className="text-green-700 hover:text-green-800"
                        >
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-gray-600">
                      Nenhum paciente encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
