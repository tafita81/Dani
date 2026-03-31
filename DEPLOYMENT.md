# 🚀 Guia de Deploy Permanente - Assistente Carro

## Opções de Hospedagem Permanente

### 1. **Vercel (Recomendado)**
O Vercel é a plataforma ideal para projetos Next.js e Vite. Oferece deploy automático a cada push no GitHub.

#### Passos:
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Selecione o repositório `tafita81/Dani`
5. Configure as variáveis de ambiente (se necessário)
6. Clique em "Deploy"

**Resultado:** Seu site estará disponível em `assistente-carro.vercel.app` (ou domínio customizado)

---

### 2. **Netlify**
Alternativa simples com deploy automático via GitHub.

#### Passos:
1. Acesse [netlify.com](https://netlify.com)
2. Faça login com GitHub
3. Clique em "Add new site" > "Import an existing project"
4. Selecione `tafita81/Dani`
5. Configure o build:
   - **Build command:** `pnpm build`
   - **Publish directory:** `dist/public`
6. Clique em "Deploy site"

**Resultado:** Seu site estará disponível em um domínio Netlify

---

### 3. **Railway**
Plataforma moderna com suporte completo a Node.js e bancos de dados.

#### Passos:
1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project" > "Deploy from GitHub repo"
4. Selecione `tafita81/Dani`
5. Configure variáveis de ambiente
6. Railway fará o deploy automaticamente

**Resultado:** Seu site estará disponível em um domínio Railway

---

## 🔧 Configuração Local para Teste

```bash
# Instalar dependências
pnpm install

# Build do projeto
pnpm build

# Iniciar servidor de produção
pnpm start
```

---

## 📋 Checklist de Deploy

- [x] Arquivo `vercel.json` configurado
- [x] `package.json` com scripts de build
- [x] Repositório GitHub sincronizado
- [ ] Escolher plataforma de hospedagem
- [ ] Conectar repositório à plataforma
- [ ] Configurar domínio customizado (opcional)
- [ ] Validar funcionamento do Assistente Carro

---

## 🎯 Próximos Passos

1. **Escolha uma plataforma** (Vercel, Netlify ou Railway)
2. **Conecte seu repositório GitHub**
3. **Configure as variáveis de ambiente** (se necessário)
4. **Aguarde o deploy automático**
5. **Teste o Assistente Carro** no novo domínio

---

## 📞 Suporte

Se tiver dúvidas sobre o deploy, consulte a documentação oficial das plataformas:
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Railway Docs](https://docs.railway.app)

