import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Zap, AlertCircle } from "lucide-react";

interface Suggestion {
  type: "technique" | "question" | "alert";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  timestamp: Date;
}

interface TherapistSuggestionsProps {
  suggestions: Suggestion[];
  isVisible: boolean;
}

export default function TherapistSuggestions({
  suggestions,
  isVisible,
}: TherapistSuggestionsProps) {
  if (!isVisible) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "technique":
        return <Zap className="h-4 w-4" />;
      case "question":
        return <Lightbulb className="h-4 w-4" />;
      case "alert":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-80 bg-gradient-to-b from-blue-50 to-purple-50 border-l border-blue-200 overflow-y-auto">
      <div className="p-4 space-y-4">
        <div className="sticky top-0 bg-gradient-to-b from-blue-50 to-purple-50 pb-2">
          <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Sugestões em Tempo Real
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Apenas você vê estas sugestões
          </p>
        </div>

        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Aguardando análise...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion, idx) => (
              <Card key={idx} className="bg-white/80 backdrop-blur border-blue-100">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <div className="text-blue-600 mt-0.5">
                        {getIcon(suggestion.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-800 truncate">
                          {suggestion.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`text-xs whitespace-nowrap ${getPriorityColor(
                        suggestion.priority
                      )}`}
                    >
                      {suggestion.priority === "high"
                        ? "Urgente"
                        : suggestion.priority === "medium"
                          ? "Médio"
                          : "Baixo"}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400 pt-1 border-t border-gray-100">
                    {suggestion.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
