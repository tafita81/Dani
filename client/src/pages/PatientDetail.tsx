import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PatientDetail() {
  const params = useParams();
  const patientId = params.id;

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Paciente ID: {patientId}</p>
          <p className="text-muted-foreground mt-2">Página em desenvolvimento</p>
        </CardContent>
      </Card>
    </div>
  );
}
