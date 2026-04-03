import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export default function Agendamentos() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const appointmentsQuery = trpc.appointments.list.useQuery();

  const hours = Array.from({ length: 13 }, (_, i) => 9 + i); // 9h to 21h
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - date.getDay() + i);
    return date;
  });

  const getAppointmentsForSlot = (day: Date, hour: number) => {
    if (!appointmentsQuery.data) return [];
    return appointmentsQuery.data.filter((apt: any) => {
      const aptDate = new Date(apt.startTime || apt.scheduledAt);
      return (
        aptDate.getDate() === day.getDate() &&
        aptDate.getMonth() === day.getMonth() &&
        aptDate.getFullYear() === day.getFullYear() &&
        aptDate.getHours() === hour
      );
    });
  };

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const today = new Date();
  const isCurrentWeek =
    days[0].getMonth() === today.getMonth() &&
    days[0].getFullYear() === today.getFullYear() &&
    Math.abs(days[0].getDate() - today.getDate()) < 7;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Agendamentos</h1>
          <p className="text-gray-600">Visualização semanal de consultas</p>
        </div>
        <Button className="bg-green-700 hover:bg-green-800 text-white gap-2">
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Calendar Controls */}
      <Card className="border-2 border-green-500 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="icon"
              className="border-green-500 text-green-700 hover:bg-green-50"
              onClick={previousWeek}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="text-center">
              <h2 className="text-lg font-bold text-black">
                {days[0].toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}{" "}
                - Semana de {days[0].getDate()} a {days[6].getDate()}
              </h2>
              {isCurrentWeek && (
                <p className="text-sm text-green-600 font-semibold">Semana atual</p>
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="border-green-500 text-green-700 hover:bg-green-50"
              onClick={nextWeek}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-green-500 border-dashed">
                  <th className="text-left py-3 px-4 font-semibold text-black w-16">Hora</th>
                  {days.map((day, idx) => (
                    <th
                      key={idx}
                      className="text-center py-3 px-2 font-semibold text-black border-l-2 border-green-500 border-dashed"
                    >
                      <div className="text-xs text-gray-600">
                        {day.toLocaleDateString("pt-BR", { weekday: "short" })}
                      </div>
                      <div className="text-lg font-bold text-black">{day.getDate()}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map((hour) => (
                  <tr key={hour} className="border-b-2 border-green-500 border-dashed">
                    <td className="py-3 px-4 font-semibold text-black bg-gray-50">
                      {String(hour).padStart(2, "0")}:00
                    </td>
                    {days.map((day, dayIdx) => {
                      const appointments = getAppointmentsForSlot(day, hour);
                      return (
                        <td
                          key={dayIdx}
                          className="py-3 px-2 border-l-2 border-green-500 border-dashed hover:bg-green-50 cursor-pointer"
                        >
                          {appointments.length > 0 ? (
                            <div className="space-y-1">
                              {appointments.map((apt: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="bg-green-100 border border-green-500 rounded p-1 text-xs font-semibold text-green-700 truncate"
                                  title={`${apt.patientName || "Paciente"} - ${apt.appointmentType === "first" ? "Primeiro" : apt.appointmentType === "return" ? "Retorno" : "Rotina"}`}
                                >
                                  <div className="truncate">{apt.patientName || "Paciente"}</div>
                                  <div className="text-xs opacity-75">
                                    {apt.appointmentType === "first" ? "Primeiro" : 
                                     apt.appointmentType === "return" ? "Retorno" :
                                     apt.appointmentType === "routine" ? "Rotina" : "Rotina"}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-300 text-xs">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card className="border-2 border-green-500 border-dashed">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Próximos Agendamentos</CardTitle>
          <CardDescription>Próximas 10 consultas agendadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {appointmentsQuery.data?.slice(0, 10).map((apt: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 border-b-2 border-green-500 border-dashed last:border-0 hover:bg-green-50 rounded cursor-pointer"
              >
                <div className="flex-1">
                  <p className="font-semibold text-black">{apt.patientName || "Paciente"}</p>
                  <p className="text-sm text-gray-600">
                    {apt.startTime ? new Date(apt.startTime).toLocaleDateString("pt-BR") : "Data inválida"} às{" "}
                    {apt.startTime ? new Date(apt.startTime).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }) : "Hora inválida"}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-green-100 text-green-800">
                    {apt.appointmentType === "first" ? "Primeiro" : 
                     apt.appointmentType === "return" ? "Retorno" :
                     apt.appointmentType === "routine" ? "Rotina" :
                     apt.appointmentType === "evaluation" ? "Avaliação" :
                     apt.appointmentType === "follow_up" ? "Follow-up" :
                     apt.appointmentType === "emergency" ? "Emergência" : "Rotina"}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    {apt.modality === "online" ? "Online" : 
                     apt.modality === "hybrid" ? "Híbrido" : "Presencial"}
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-800">
                    {apt.status === "scheduled" ? "Agendado" :
                     apt.status === "confirmed" ? "Confirmado" :
                     apt.status === "done" ? "Realizado" :
                     apt.status === "cancelled" ? "Cancelado" :
                     apt.status === "no_show" ? "Falta" : "Agendado"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
