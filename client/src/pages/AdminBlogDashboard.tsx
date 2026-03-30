import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Edit2, Trash2, Eye, Save, X } from "lucide-react";

/**
 * Admin Panel para gerenciar blog
 */
export function AdminBlogDashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "geral" as const,
    tags: "",
    featuredImage: "",
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleNewPost = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "geral",
      tags: "",
      featuredImage: "",
    });
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags.join(", "),
      featuredImage: post.featuredImage || "",
    });
  };

  const handleSavePost = () => {
    if (!formData.title || !formData.excerpt || !formData.content) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    const newPost = {
      id: editingPost?.id || `post-${Date.now()}`,
      ...formData,
      tags: formData.tags.split(",").map((t) => t.trim()),
      views: editingPost?.views || 0,
      likes: editingPost?.likes || 0,
      createdAt: editingPost?.createdAt || new Date(),
      updatedAt: new Date(),
      published: editingPost?.published || false,
    };

    if (editingPost) {
      setPosts(posts.map((p) => (p.id === editingPost.id ? newPost : p)));
    } else {
      setPosts([...posts, newPost]);
    }

    setEditingPost(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "geral",
      tags: "",
      featuredImage: "",
    });
  };

  const handleDeletePost = (id: string) => {
    if (confirm("Tem certeza que deseja deletar este post?")) {
      setPosts(posts.filter((p) => p.id !== id));
    }
  };

  const handlePublishPost = (id: string) => {
    setPosts(
      posts.map((p) => (p.id === id ? { ...p, published: !p.published } : p))
    );
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryColors: Record<string, string> = {
    tcc: "bg-blue-100 text-blue-800",
    te: "bg-purple-100 text-purple-800",
    gestalt: "bg-green-100 text-green-800",
    geral: "bg-gray-100 text-gray-800",
    "bem-estar": "bg-pink-100 text-pink-800",
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Painel de Admin - Blog</h1>
          <p className="text-muted-foreground">
            Gerencie posts, categorias e publicações
          </p>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="editor">
              {editingPost ? "Editar Post" : "Novo Post"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <Input
                placeholder="Buscar posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={handleNewPost}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Post
              </Button>
            </div>

            <div className="grid gap-4">
              {filteredPosts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum post encontrado</p>
                  </CardContent>
                </Card>
              ) : (
                filteredPosts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{post.title}</CardTitle>
                          <CardDescription>{post.excerpt}</CardDescription>
                        </div>
                        <Badge
                          className={categoryColors[post.category]}
                          variant="outline"
                        >
                          {post.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 flex-wrap">
                          {post.tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePublishPost(post.id)
                            }
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            {post.published ? "Publicado" : "Rascunho"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPost(post)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingPost ? "Editar Post" : "Criar Novo Post"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Título *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Título do post"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Resumo *
                  </label>
                  <Textarea
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    placeholder="Resumo do post (aparece na listagem)"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Conteúdo (Markdown) *
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="# Título\n\nConteúdo em markdown..."
                    rows={10}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Categoria
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value as any })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tcc">TCC</SelectItem>
                        <SelectItem value="te">Terapia do Esquema</SelectItem>
                        <SelectItem value="gestalt">Gestalt</SelectItem>
                        <SelectItem value="geral">Geral</SelectItem>
                        <SelectItem value="bem-estar">Bem-estar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tags (separadas por vírgula)
                    </label>
                    <Input
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      placeholder="psicologia, ansiedade, depressão"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    URL da Imagem em Destaque
                  </label>
                  <Input
                    value={formData.featuredImage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        featuredImage: e.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSavePost}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingPost ? "Atualizar Post" : "Criar Post"}
                  </Button>
                  {editingPost && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingPost(null);
                        setFormData({
                          title: "",
                          excerpt: "",
                          content: "",
                          category: "geral",
                          tags: "",
                          featuredImage: "",
                        });
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  )}
                </div>

                {previewMode && (
                  <div className="border rounded-lg p-4 bg-muted">
                    <h3 className="font-bold text-lg mb-2">{formData.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {formData.excerpt}
                    </p>
                    <div className="prose prose-sm max-w-none">
                      {/* Renderizar markdown aqui */}
                      <p>{formData.content}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
