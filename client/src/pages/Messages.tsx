
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Messages() {
  const { data: messages, isLoading } = trpc.messages.recent.useQuery();

  const channelColors: Record<string, string> = {
    whatsapp: "bg-emerald-100 text-emerald-700",
    telegram: "bg-blue-100 text-blue-700",
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mensagens</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Histórico de interações via WhatsApp e Telegram
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !messages?.length ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma mensagem registrada</p>
              <p className="text-xs mt-1">
                As mensagens recebidas via WhatsApp e Telegram aparecerão aqui
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-2">
              {messages.map((msg) => (
                <Card key={msg.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={`text-[10px] ${channelColors[msg.channel] || "bg-gray-100 text-gray-700"}`}
                          >
                            {msg.channel === "whatsapp" ? "WhatsApp" : "Telegram"}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {msg.direction === "inbound" ? "Recebida" : "Enviada"}
                          </span>
                        </div>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(msg.createdAt).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </>
  );
}
