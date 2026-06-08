import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("demo1234", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@noivasemcrise.com" },
    update: {},
    create: {
      name: "Ana Paula",
      email: "demo@noivasemcrise.com",
      password,
      wedding: {
        create: {
          brideName: "Ana Paula",
          groomName: "Carlos",
          weddingDate: new Date("2025-12-14"),
          venue: "Espaço Villa Garden",
          city: "São Paulo, SP",
          totalBudget: 80000,
          theme: "Romântico Clássico",
          style: "Elegante",
          guestCount: 150,
        },
      },
    },
    include: { wedding: true },
  });

  const weddingId = user.wedding!.id;

  const checklistItems = [
    { title: "Definir a data do casamento", category: "Planejamento", order: 1, completed: true },
    { title: "Estabelecer orçamento total", category: "Financeiro", order: 2, completed: true },
    { title: "Montar lista de convidados preliminar", category: "Convidados", order: 3, completed: true },
    { title: "Pesquisar e visitar locais", category: "Local", order: 4, completed: true },
    { title: "Contratar fotógrafo", category: "Fornecedores", order: 5, completed: true },
    { title: "Contratar buffet", category: "Fornecedores", order: 6, completed: true },
    { title: "Contratar filmagem", category: "Fornecedores", order: 7, completed: true },
    { title: "Escolher tema e paleta de cores", category: "Decoração", order: 8, completed: true },
    { title: "Começar busca pelo vestido", category: "Visual", order: 9, completed: false },
    { title: "Contratar decoradora", category: "Fornecedores", order: 10, completed: true },
    { title: "Contratar DJ/banda", category: "Música", order: 11, completed: false },
    { title: "Enviar save-the-date digital", category: "Convidados", order: 12, completed: false },
    { title: "Fazer prova do vestido", category: "Visual", order: 13, completed: false },
    { title: "Definir madrinhas e padrinhos", category: "Cerimônia", order: 14, completed: true },
    { title: "Escolher alianças", category: "Joias", order: 15, completed: false },
    { title: "Enviar convites formais", category: "Convidados", order: 16, completed: false },
    { title: "Confirmar todos os fornecedores", category: "Fornecedores", order: 17, completed: false },
    { title: "Planejar lua de mel", category: "Lua de Mel", order: 18, completed: false },
    { title: "Criar lista de presentes", category: "Presentes", order: 19, completed: false },
    { title: "Segunda prova do vestido", category: "Visual", order: 20, completed: false },
    { title: "Definir make e cabelo", category: "Visual", order: 21, completed: false },
    { title: "Planejar cronograma do dia", category: "Planejamento", order: 22, completed: false },
    { title: "Confirmar presença dos convidados", category: "Convidados", order: 23, completed: false },
    { title: "Finalizar organização das mesas", category: "Logística", order: 24, completed: false },
    { title: "Fazer teste de make e cabelo", category: "Visual", order: 25, completed: false },
    { title: "Reunião final com fornecedores", category: "Fornecedores", order: 26, completed: false },
    { title: "Entrega do vestido e ajustes finais", category: "Visual", order: 27, completed: false },
    { title: "Preparar pagamentos finais", category: "Financeiro", order: 28, completed: false },
  ];

  for (const item of checklistItems) {
    await prisma.checklistItem.create({ data: { ...item, weddingId } });
  }

  const budgetItems = [
    { category: "Local", description: "Espaço Villa Garden", estimatedCost: 15000, actualCost: 14500, paid: true, vendor: "Villa Garden" },
    { category: "Buffet", description: "Buffet Premium", estimatedCost: 20000, actualCost: 19800, paid: false, vendor: "Buffet Sabor & Arte" },
    { category: "Fotografia", description: "Fotógrafo principal", estimatedCost: 8000, actualCost: 7500, paid: false, vendor: "Studio Lumière" },
    { category: "Filmagem", description: "Filmagem cinematográfica", estimatedCost: 6000, actualCost: 6000, paid: false, vendor: "CineWed" },
    { category: "Decoração", description: "Decoração completa", estimatedCost: 12000, actualCost: 11500, paid: false, vendor: "Flor & Arte" },
    { category: "Música", description: "DJ profissional", estimatedCost: 4000, actualCost: 3800, paid: false, vendor: "DJ Marcos" },
    { category: "Vestido", description: "Vestido da noiva", estimatedCost: 5000, actualCost: 4800, paid: true, vendor: "Ateliê Sonho Branco" },
    { category: "Convites", description: "Convites personalizados", estimatedCost: 2000, actualCost: 1800, paid: true, vendor: "Papelaria Chic" },
    { category: "Bolo", description: "Bolo e doces", estimatedCost: 3500, actualCost: 3200, paid: false, vendor: "Confeitaria Doce Arte" },
  ];

  for (const item of budgetItems) {
    await prisma.budgetItem.create({ data: { ...item, weddingId } });
  }

  const guestData = [
    { name: "João Pereira", email: "joao@email.com", phone: "(11) 99999-1111", group: "Noivo", status: "CONFIRMED" },
    { name: "Maria Santos", email: "maria@email.com", phone: "(11) 99999-2222", group: "Noiva", status: "CONFIRMED" },
    { name: "Pedro Lima", email: "pedro@email.com", group: "Noivo", status: "PENDING" },
    { name: "Clara Oliveira", group: "Noiva", status: "CONFIRMED" },
    { name: "Roberto Silva", group: "Noivo", status: "DECLINED" },
    { name: "Fernanda Costa", group: "Noiva", status: "PENDING" },
    { name: "Lucas Mendes", group: "Família", status: "CONFIRMED", plusOne: true, plusOneName: "Camila Mendes" },
    { name: "Julia Alves", group: "Noiva", status: "CONFIRMED" },
    { name: "André Souza", group: "Noivo", status: "CONFIRMED" },
    { name: "Beatriz Lima", group: "Noiva", status: "PENDING" },
  ];

  for (const guest of guestData) {
    await prisma.guest.create({ data: { ...guest, weddingId } });
  }

  const vendorData = [
    { category: "Fotografia", name: "Studio Lumière", email: "contato@studiolumiere.com", phone: "(11) 3333-1111", price: 7500, status: "HIRED", contractSigned: true, rating: 5 },
    { category: "Buffet", name: "Buffet Sabor & Arte", email: "contato@saborarte.com", phone: "(11) 3333-2222", price: 19800, status: "HIRED", contractSigned: true, rating: 5 },
    { category: "Decoração", name: "Flor & Arte", email: "florarte@email.com", phone: "(11) 3333-3333", price: 11500, status: "HIRED", contractSigned: true, rating: 4 },
    { category: "Música", name: "DJ Marcos", email: "djmarcos@email.com", phone: "(11) 3333-4444", price: 3800, status: "HIRED", contractSigned: false, rating: 4 },
    { category: "Filmagem", name: "CineWed", email: "cinewed@email.com", phone: "(11) 3333-5555", price: 6000, status: "HIRED", contractSigned: true, rating: 5 },
    { category: "Vestido", name: "Ateliê Sonho Branco", phone: "(11) 3333-6666", price: 4800, status: "HIRED", contractSigned: true, rating: 5 },
    { category: "Buffet", name: "Gastronomia Silva", email: "silva@gast.com", phone: "(11) 3333-7777", price: 22000, status: "PROSPECT", rating: 4, notes: "Opção mais cara, melhor cardápio" },
  ];

  for (const vendor of vendorData) {
    await prisma.vendor.create({ data: { ...vendor, weddingId } });
  }

  const timelineData = [
    { title: "Acordar e café da manhã", startTime: "06:00", endTime: "07:00", category: "Preparação", order: 1 },
    { title: "Início da make e cabelo (madrinhas)", startTime: "07:00", endTime: "10:00", location: "Hotel", category: "Preparação", order: 2 },
    { title: "Make e cabelo da noiva", startTime: "10:00", endTime: "13:00", location: "Hotel", category: "Preparação", order: 3 },
    { title: "Almoço leve", startTime: "13:00", endTime: "13:30", category: "Preparação", order: 4 },
    { title: "Vestir o vestido e detalhes", startTime: "13:30", endTime: "14:30", location: "Hotel", category: "Preparação", order: 5 },
    { title: "Sessão de fotos pré-cerimônia", startTime: "14:30", endTime: "15:30", category: "Preparação", order: 6 },
    { title: "Chegada ao local da cerimônia", startTime: "15:30", endTime: "16:00", location: "Espaço Villa Garden", category: "Cerimônia", order: 7 },
    { title: "Cerimônia de casamento", startTime: "16:00", endTime: "17:00", location: "Espaço Villa Garden", category: "Cerimônia", order: 8 },
    { title: "Coquetel de boas-vindas", startTime: "17:00", endTime: "19:00", location: "Jardim", category: "Recepção", order: 9 },
    { title: "Abertura do salão e jantar", startTime: "19:00", endTime: "21:00", location: "Salão principal", category: "Recepção", order: 10 },
    { title: "Primeira dança e brinde", startTime: "21:00", endTime: "21:30", category: "Recepção", order: 11 },
    { title: "Corte do bolo", startTime: "21:30", endTime: "22:00", category: "Recepção", order: 12 },
    { title: "Festa e pista aberta", startTime: "22:00", endTime: "00:00", category: "Festa", order: 13 },
  ];

  for (const item of timelineData) {
    await prisma.timelineItem.create({ data: { ...item, weddingId } });
  }

  const playlist = await prisma.playlist.create({
    data: {
      weddingId,
      name: "Cerimônia",
      description: "Músicas para a cerimônia",
      tracks: {
        create: [
          { title: "Canon in D", artist: "Pachelbel", order: 1 },
          { title: "A Thousand Years", artist: "Christina Perri", order: 2 },
          { title: "Perfect", artist: "Ed Sheeran", order: 3 },
          { title: "All of Me", artist: "John Legend", order: 4 },
        ],
      },
    },
  });

  await prisma.playlist.create({
    data: {
      weddingId,
      name: "Festa",
      description: "Músicas para a pista de dança",
      tracks: {
        create: [
          { title: "Thinking Out Loud", artist: "Ed Sheeran", order: 1 },
          { title: "Can't Stop the Feeling", artist: "Justin Timberlake", order: 2 },
          { title: "Happy", artist: "Pharrell Williams", order: 3 },
        ],
      },
    },
  });

  await prisma.gift.createMany({
    data: [
      { weddingId, name: "Jogo de Panelas", category: "Cozinha", store: "Casa & Vídeo", price: 450, quantity: 1, quantityReceived: 0 },
      { weddingId, name: "Jogo de Cama Queen", category: "Quarto", store: "Tok&Stok", price: 320, quantity: 2, quantityReceived: 1 },
      { weddingId, name: "Liquidificador", category: "Cozinha", store: "Magazine Luiza", price: 280, quantity: 1, quantityReceived: 1 },
      { weddingId, name: "Jogo de Toalhas", category: "Banheiro", store: "Renner", price: 180, quantity: 3, quantityReceived: 0 },
      { weddingId, name: "Smart TV 50\"", category: "Eletrônicos", store: "Americanas", price: 2500, quantity: 1, quantityReceived: 0 },
    ],
  });

  await prisma.inspiration.createMany({
    data: [
      { weddingId, title: "Decoração floral minimalista", category: "Decoração", tags: ["flores", "branco", "minimalista"], favorite: true },
      { weddingId, title: "Mesa dos noivos", category: "Decoração", tags: ["mesa", "flores", "velas"], favorite: false },
      { weddingId, title: "Buquê de rosas brancas", category: "Flores", tags: ["buquê", "rosas", "branco"], favorite: true },
      { weddingId, title: "Vestido cauda longa", category: "Vestido", tags: ["vestido", "cauda", "renda"], favorite: false },
    ],
  });

  await prisma.trousseauItem.createMany({
    data: [
      { weddingId, name: "Jogo de Cama Queen 400 fios", category: "Cama", quantity: 3, quantityOwned: 1, estimatedPrice: 350, priority: "HIGH", purchased: false },
      { weddingId, name: "Jogo de Toalhas de Banho", category: "Banho", quantity: 6, quantityOwned: 4, estimatedPrice: 80, priority: "MEDIUM", purchased: false },
      { weddingId, name: "Jogo de Panelas Antiaderente", category: "Cozinha", quantity: 1, quantityOwned: 0, estimatedPrice: 500, store: "Tramontina", priority: "HIGH", purchased: false },
      { weddingId, name: "Conjunto de Copos", category: "Cozinha", quantity: 12, quantityOwned: 0, estimatedPrice: 120, priority: "LOW", purchased: false },
      { weddingId, name: "Edredom Queen", category: "Cama", quantity: 2, quantityOwned: 1, estimatedPrice: 250, priority: "MEDIUM", purchased: false },
    ],
  });

  console.log("✅ Seed concluído!");
  console.log("📧 Login demo: demo@noivasemcrise.com");
  console.log("🔑 Senha demo: demo1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
