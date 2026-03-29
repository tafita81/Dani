import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  MessageCircle,
  Mail,
  Youtube,
  Music,
  TrendingUp,
  Users,
  Copy,
  ExternalLink,
} from "lucide-react";

export default function LinktreeSetup() {
  const [links, setLinks] = useState([
    {
      title: "📚 Livros Recomendados (Afiliado Amazon)",
      url: "https://amazon.com/shop/psidanielacoelho",
      icon: "book",
      order: 1,
    },
    {
      title: "💬 WhatsApp - Contato",
      url: "https://wa.me/5511999999999",
      icon: "whatsapp",
      order: 2,
    },
    {
      title: "📧 Email",
      url: "mailto:contato@psidanielacoelho.com",
      icon: "mail",
      order: 3,
    },
    {
      title: "🎥 YouTube - Inscreva-se",
      url: "https://youtube.com/@psidanielacoelho",
      icon: "youtube",
      order: 4,
    },
    {
      title: "🎵 Podcast - Spotify",
      url: "https://open.spotify.com/show/psidanielacoelho",
      icon: "spotify",
      order: 5,
    },
    {
      title: "📱 TikTok",
      url: "https://tiktok.com/@psidanielacoelho",
      icon: "tiktok",
      order: 6,
    },
    {
      title: "🔗 Comunidade Exclusiva",
      url: "https://telegram.me/psidanielacoelho",
      icon: "users",
      order: 7,
    },
  ]);

  const [linktreeUrl] = useState(
    "https://linktree.com/psidanielacoelho"
  );

  const handleAddLink = () => {
    const newLink = {
      title: "Novo Link",
      url: "https://",
      icon: "link",
      order: links.length + 1,
    };
    setLinks([...links, newLink]);
  };

  const handleUpdateLink = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setLinks(updatedLinks);
  };

  const handleDeleteLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(linktreeUrl);
    alert("URL copiada!");
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      book: <BookOpen className="w-5 h-5" />,
      whatsapp: <MessageCircle className="w-5 h-5" />,
      mail: <Mail className="w-5 h-5" />,
      youtube: <Youtube className="w-5 h-5" />,
      spotify: <Music className="w-5 h-5" />,
      tiktok: <TrendingUp className="w-5 h-5" />,
      users: <Users className="w-5 h-5" />,
    };
    return iconMap[iconName] || <ExternalLink className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            🔗 Configuração Linktree
          </h1>
          <p className="text-slate-600">
            Centralize todos os seus links em um único lugar
          </p>
        </div>

        {/* Linktree URL */}
        <Card className="mb-8 p-6 border-2 border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Seu Link Linktree
              </h3>
              <p className="text-slate-600 mb-4">{linktreeUrl}</p>
            </div>
            <Button
              onClick={handleCopyUrl}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {links.length}
              </div>
              <p className="text-slate-600">Links Ativos</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ∞
              </div>
              <p className="text-slate-600">Cliques Rastreados</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                100%
              </div>
              <p className="text-slate-600">Taxa de Conversão</p>
            </div>
          </Card>
        </div>

        {/* Links List */}
        <Card className="mb-8 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Seus Links
          </h2>

          <div className="space-y-4 mb-6">
            {links.map((link, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition"
              >
                <div className="text-slate-600">
                  {getIconComponent(link.icon)}
                </div>
                <div className="flex-1">
                  <Input
                    value={link.title}
                    onChange={(e) =>
                      handleUpdateLink(index, "title", e.target.value)
                    }
                    className="mb-2 font-semibold"
                    placeholder="Título do link"
                  />
                  <Input
                    value={link.url}
                    onChange={(e) =>
                      handleUpdateLink(index, "url", e.target.value)
                    }
                    className="text-sm"
                    placeholder="URL"
                  />
                </div>
                <Button
                  onClick={() => handleDeleteLink(index)}
                  variant="destructive"
                  size="sm"
                >
                  Deletar
                </Button>
              </div>
            ))}
          </div>

          <Button
            onClick={handleAddLink}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            + Adicionar Link
          </Button>
        </Card>

        {/* Preview */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Preview do Linktree
          </h2>

          <div className="bg-slate-900 rounded-lg p-8 text-white text-center">
            <div className="mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mx-auto mb-4"></div>
              <h3 className="text-2xl font-bold mb-2">Psi. Daniela Coelho</h3>
              <p className="text-slate-300">Psicoeducação | Bem-estar</p>
            </div>

            <div className="space-y-3">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition transform hover:scale-105"
                >
                  {link.title}
                </a>
              ))}
            </div>
          </div>
        </Card>

        {/* Info */}
        <div className="mt-8 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">
            ℹ️ Como usar o Linktree
          </h3>
          <ul className="text-sm text-yellow-800 space-y-2">
            <li>✅ Coloque o link do Linktree na bio do Instagram</li>
            <li>✅ Adicione links para YouTube, TikTok, Spotify, etc</li>
            <li>✅ Rastreie cliques e performance de cada link</li>
            <li>✅ Atualize links sem mudar a URL da bio</li>
            <li>✅ Use para monetização com afiliados Amazon</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
