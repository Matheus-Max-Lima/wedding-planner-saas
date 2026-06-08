# 💍 Até o Altar

> Plataforma SaaS completa de planejamento de casamento. Do checklist à lua de mel, tudo em um só lugar.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)

---

## ✨ Sobre o Projeto

O **Até o Altar** é uma plataforma SaaS completa para planejamento de casamentos. Desenvolvida com foco em casais brasileiros, reúne todas as ferramentas necessárias para organizar cada detalhe do grande dia — desde o orçamento até a disposição das mesas — em uma interface elegante, responsiva e fácil de usar.

---

## 🎯 Funcionalidades

### 🏠 Dashboard
- Countdown personalizado para a data do casamento
- Métricas em tempo real (orçamento, convidados, checklist, fornecedores)
- Acesso rápido a todas as seções
- Visão geral de tarefas pendentes

### ✅ Checklist de 12 Meses
- Tarefas organizadas mês a mês (12 até 1 mês antes)
- 13 categorias (Venue, Buffet, Fotografia, Vestido, etc.)
- Prioridades: Alta, Média, Baixa
- Filtros por status, categoria e mês
- Barra de progresso por período

### 💰 Planejamento Financeiro
- Controle de orçamento total vs. realizado
- Custos estimados vs. custos reais por categoria
- Registro de parcelas e datas de vencimento
- Gráficos interativos com Recharts
- Alertas de parcelas próximas ao vencimento

### 👥 Gestão de Convidados
- Lista completa com status de RSVP
- Filtros por status (confirmado, pendente, recusou) e lado (noiva/noivo)
- Registro de acompanhantes (plus one)
- Restrições alimentares
- Exportação de dados

### 🏛️ Gestão de Fornecedores
- Cadastro por categoria (Buffet, Foto, Decoração, etc.)
- Status do relacionamento: Prospect → Contactado → Contratado
- Sistema de avaliação por estrelas
- Comparador side-by-side entre fornecedores
- Controle de contratos e pagamentos

### 🗓️ Cronograma do Grande Dia
- Linha do tempo visual e interativa
- Eventos categorizados (Preparação, Cerimônia, Recepção, Festa)
- Localização e responsável por cada evento
- Ordenação manual
- Impressão do cronograma

### 🎁 Lista de Presentes
- Cards visuais por categoria
- Status: Disponível → Reservado → Recebido
- Link para a loja do produto
- Controle de valor total da lista

### 🖼️ Painel de Inspirações
- Grid estilo Pinterest
- Categorias (Vestido, Decoração, Flores, Penteado, etc.)
- Sistema de favoritos
- Tags personalizadas
- Link para fonte da imagem

### 🎵 Playlist do Casamento
- 4 playlists por momento: Cerimônia, Coquetel, Jantar e Festa
- Adicionar músicas com artista e duração
- Exportar playlist em texto
- Integração planejada com Spotify

### ✈️ Lua de Mel
- Planner completo de destino e datas
- Controle de orçamento da viagem
- Checklist de documentos e preparativos
- Itinerário de atividades

### 🎉 Despedida de Solteira/Solteiro
- Planner completo com tema e local
- Lista de atividades com horário e custo
- Lista de convidadas com confirmação de presença
- Controle de orçamento

### 🛍️ Enxoval
- Itens organizados por categoria (Cama, Banho, Cozinha, Sala, Outros)
- Progresso de aquisição com barra visual
- Controle de marcas e preços
- Valor total adquirido vs. total planejado

### 🪑 Organização de Mesas
- Visualização de todas as mesas do salão
- Capacidade por mesa (redonda ou retangular)
- Atribuição de convidados por dropdown
- Convidados sem mesa em painel lateral

### 🤖 Valentina — Assistente de IA
- Chat inteligente especializado em casamentos
- 12 tópicos com respostas detalhadas
- Ações rápidas pré-configuradas
- Dicas sobre: checklist, orçamento, fornecedores, cronograma, vestido, convidados, lua de mel, música, decoração, enxoval e despedida

### ⚙️ Configurações
- Edição de perfil pessoal
- Dados do casamento (data, local, cidade)
- Gerenciamento de orçamento total
- Zona de perigo (exclusão de conta)

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 5 |
| Estilização | Tailwind CSS 4 |
| Autenticação | NextAuth.js v4 |
| Banco de dados | PostgreSQL + Prisma 7 |
| ORM | Prisma com adapter pg |
| Gráficos | Recharts |
| Ícones | Lucide React |
| Notificações | Sonner |
| Formulários | React Hook Form + Zod |
| UI Base | Radix UI |

---

## 🗄️ Banco de Dados

O schema Prisma inclui **20+ modelos** completamente relacionados:

```
User → Wedding → ChecklistItem
                → BudgetItem → BudgetInstallment
                → Guest → Table
                → Vendor
                → TimelineItem
                → Gift
                → Inspiration
                → Playlist → Track
                → Honeymoon → HoneymoonActivity
                → Bachelorette → BacheloretteActivity
                               → BacheloretteGuest
                → TrousseauItem
```

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- PostgreSQL (local ou hospedado — [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app))

### Passo a passo

**1. Clone o repositório**
```bash
git clone https://github.com/matheus-max-lima/casamento.git
cd casamento
```

**2. Instale as dependências**
```bash
npm install
```

**3. Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/casamento"
NEXTAUTH_SECRET="gere-uma-string-aleatoria-de-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

Para gerar o `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

**4. Execute as migrations**
```bash
npx prisma migrate dev --name init
```

**5. Popule o banco com dados de demonstração**
```bash
npx prisma db seed
```

**6. Inicie o servidor**
```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 🔐 Conta de Demonstração

| Campo | Valor |
|---|---|
| Email | `demo@ateoaltar.com` |
| Senha | `demo1234` |

A conta demo vem pré-carregada com:
- Casamento em 14/12/2025 no Espaço Villa Garden, São Paulo
- 35 itens de checklist em 7 períodos
- 8 itens de orçamento totalizando ~R$ 73.000
- 8 convidados com diferentes status de RSVP
- 6 fornecedores contratados

---

## 📁 Estrutura do Projeto

```
casamento/
├── prisma/
│   ├── schema.prisma        # Schema completo do banco (20+ modelos)
│   └── seed.ts              # Dados de demonstração
├── src/
│   ├── app/
│   │   ├── page.tsx                       # Landing page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                 # Layout com sidebar
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── checklist/page.tsx
│   │   │   ├── budget/page.tsx
│   │   │   ├── guests/page.tsx
│   │   │   ├── vendors/page.tsx
│   │   │   ├── timeline/page.tsx
│   │   │   ├── gifts/page.tsx
│   │   │   ├── inspiration/page.tsx
│   │   │   ├── music/page.tsx
│   │   │   ├── honeymoon/page.tsx
│   │   │   ├── bachelorette/page.tsx
│   │   │   ├── trousseau/page.tsx
│   │   │   ├── seating/page.tsx
│   │   │   ├── ai-assistant/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/        # NextAuth handlers
│   │       ├── auth/register/             # Cadastro de usuário
│   │       ├── auth/login/               # Login
│   │       ├── ai-chat/                  # Valentina IA
│   │       ├── checklist/[id]/
│   │       ├── budget/[id]/
│   │       ├── guests/[id]/
│   │       ├── vendors/[id]/
│   │       ├── timeline/[id]/
│   │       ├── gifts/[id]/
│   │       ├── inspiration/[id]/
│   │       ├── music/playlists/[id]/
│   │       ├── music/tracks/[id]/
│   │       ├── honeymoon/activities/[id]/
│   │       ├── bachelorette/activities/[id]/
│   │       ├── bachelorette/guests/[id]/
│   │       ├── trousseau/[id]/
│   │       ├── seating/[id]/
│   │       └── settings/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── DashboardShell.tsx
│   │   ├── providers/
│   │   │   └── AuthProvider.tsx
│   │   └── ui/                           # Componentes Radix UI
│   ├── lib/
│   │   ├── auth.ts                       # Configuração NextAuth
│   │   ├── prisma.ts                     # Cliente Prisma singleton
│   │   ├── api-helper.ts                 # Helper de sessão e casamento
│   │   └── utils.ts
│   └── types/
│       └── index.ts
└── .env.example
```

---

## ☁️ Deploy em Produção

### Vercel + Neon (recomendado)

1. Crie um banco gratuito em [neon.tech](https://neon.tech)
2. Faça push do código para o GitHub
3. Importe o repositório em [vercel.com](https://vercel.com)
4. Configure as variáveis de ambiente no painel da Vercel:
   ```
   DATABASE_URL=<sua connection string do Neon>
   NEXTAUTH_SECRET=<string aleatória de 32 chars>
   NEXTAUTH_URL=https://seu-app.vercel.app
   ```
5. Deploy automático!
6. Após o primeiro deploy, execute as migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Railway

1. Crie um projeto em [railway.app](https://railway.app)
2. Adicione um banco PostgreSQL ao projeto
3. Configure as variáveis de ambiente
4. Build command: `npx prisma generate && next build`
5. Start command: `next start`

---

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev                    # Iniciar servidor de desenvolvimento
npm run build                  # Build de produção
npm run start                  # Iniciar servidor de produção

# Banco de dados
npx prisma studio              # Abrir Prisma Studio (GUI visual)
npx prisma migrate dev         # Criar nova migration
npx prisma migrate reset       # Resetar banco e re-seed
npx prisma generate            # Regenerar cliente Prisma
npx prisma db seed             # Popular banco com dados demo

# Utilitários
npx prisma format              # Formatar schema.prisma
```

---

## 🎨 Design System

A paleta de cores segue um tema **rose-gold elegante**:

| Token | Hex | Uso |
|---|---|---|
| Rose 500 | `#f43f5e` | Cor primária, CTAs |
| Rose 100 | `#ffe4e6` | Backgrounds sutis |
| Gold | `#d4af37` | Acentos premium |
| Stone 800 | `#292524` | Textos principais |
| Stone 50 | `#fafaf9` | Backgrounds neutros |
| Cream | `#fdf8f5` | Background da aplicação |

---

## 📄 Licença

MIT © 2025 [Matheus Max Lima](https://github.com/matheus-max-lima)

---

<div align="center">
  Feito com 💍 para tornar o planejamento do casamento mais simples e especial.
</div>
