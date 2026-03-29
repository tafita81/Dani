
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Upload, Trash2, ExternalLink } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function Documents() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: patients } = trpc.patients.list.useQuery();
  const patientId = selectedPatientId ? parseInt(selectedPatientId) : 0;
  const { data: docs, isLoading, refetch } = trpc.documents.list.useQuery(
    { patientId },
    { enabled: !!patientId }
  );
  const uploadMutation = trpc.documents.upload.useMutation();
  const deleteMutation = trpc.documents.delete.useMutation();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !patientId) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo máximo: 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        await uploadMutation.mutateAsync({
          patientId,
          fileName: file.name,
          fileData: base64,
          mimeType: file.type,
          fileSize: file.size,
        });
        toast.success("Documento enviado!");
        refetch();
      } catch {
        toast.error("Erro ao enviar documento");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Documento removido");
      refetch();
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const categoryLabels: Record<string, string> = {
    evolution: "Evolução",
    report: "Laudo",
    exam: "Exame",
    prescription: "Prescrição",
    other: "Outro",
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Evoluções clínicas, laudos, exames e anexos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione um paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients?.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
            />
            <Button
              className="gap-2"
              disabled={!patientId || uploadMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {uploadMutation.isPending ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>

        {!selectedPatientId ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Selecione um paciente para ver seus documentos</p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !docs?.length ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum documento para este paciente</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <Card key={doc.id} className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{doc.fileName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(0)} KB` : ""}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {categoryLabels[doc.category] || doc.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
