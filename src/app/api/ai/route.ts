import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";

const weddingTips: Record<string, string[]> = {
  budget: [
    "Defina o orçamento total antes de começar qualquer contratação.",
    "Reserve 10-15% do orçamento para imprevistos.",
    "Compare pelo menos 3 fornecedores antes de fechar contrato.",
    "Negocie pacotes completos para conseguir descontos.",
    "Prefira pagamentos parcelados para manter o fluxo de caixa.",
  ],
  venue: [
    "Visite o espaço em diferentes horários do dia para ver a iluminação natural.",
    "Verifique a capacidade máxima e mínima do local.",
    "Pergunte sobre a política de fornecedores externos.",
    "Confirme se há espaço para fotógrafo e banda.",
    "Verifique a disponibilidade de estacionamento.",
  ],
  guests: [
    "Faça uma lista A e lista B para os convidados.",
    "Envie os convites com pelo menos 2 meses de antecedência.",
    "Confirme as presenças com 1 mês de antecedência.",
    "Considere restrições alimentares de todos os convidados.",
    "Organize o transporte para convidados de outras cidades.",
  ],
  vendors: [
    "Sempre assine contrato com todos os fornecedores.",
    "Verifique referências e portfólio antes de contratar.",
    "Defina horários e entregas com clareza no contrato.",
    "Faça um dia de assessoria antes do grande dia.",
    "Tenha um plano B para fornecedores essenciais.",
  ],
  timeline: [
    "Comece a preparar a noiva com pelo menos 4-5 horas de antecedência.",
    "Reserve tempo extra entre cada evento do cronograma.",
    "Designe alguém de confiança para coordenar o dia.",
    "Faça um ensaio do cronograma com a equipe.",
    "Tenha uma lista de contatos de todos os fornecedores.",
  ],
};

function getAIResponse(message: string, weddingInfo: any): string {
  const msg = message.toLowerCase();

  if (msg.includes("orçamento") || msg.includes("dinheiro") || msg.includes("preço") || msg.includes("custo")) {
    const tips = weddingTips.budget;
    const tip = tips[Math.floor(Math.random() * tips.length)];
    return `💰 **Dica sobre Orçamento:**\n\n${tip}\n\n${weddingInfo ? `Seu orçamento atual é de R$ ${weddingInfo.totalBudget.toLocaleString("pt-BR")}. ` : ""}Lembre-se de sempre documentar todos os gastos!`;
  }

  if (msg.includes("local") || msg.includes("espaço") || msg.includes("venue") || msg.includes("salão")) {
    const tips = weddingTips.venue;
    const tip = tips[Math.floor(Math.random() * tips.length)];
    return `🏛️ **Dica sobre Espaço/Venue:**\n\n${tip}\n\nEscolher o local certo é uma das decisões mais importantes do seu casamento!`;
  }

  if (msg.includes("convidado") || msg.includes("lista") || msg.includes("convite")) {
    const tips = weddingTips.guests;
    const tip = tips[Math.floor(Math.random() * tips.length)];
    return `👥 **Dica sobre Convidados:**\n\n${tip}\n\nGerenciar bem os convidados é fundamental para o sucesso do evento!`;
  }

  if (msg.includes("fornecedor") || msg.includes("fotógrafo") || msg.includes("buffet") || msg.includes("banda") || msg.includes("dj")) {
    const tips = weddingTips.vendors;
    const tip = tips[Math.floor(Math.random() * tips.length)];
    return `🤝 **Dica sobre Fornecedores:**\n\n${tip}\n\nBons fornecedores fazem toda a diferença no seu grande dia!`;
  }

  if (msg.includes("cronograma") || msg.includes("horário") || msg.includes("agenda") || msg.includes("dia do casamento")) {
    const tips = weddingTips.timeline;
    const tip = tips[Math.floor(Math.random() * tips.length)];
    return `📅 **Dica sobre Cronograma:**\n\n${tip}\n\nUm bom cronograma garante que tudo aconteça no momento certo!`;
  }

  if (msg.includes("lua de mel") || msg.includes("viagem")) {
    return `✈️ **Dica sobre Lua de Mel:**\n\nEscolha o destino com pelo menos 6 meses de antecedência para conseguir melhores preços. Considere viajar alguns dias após o casamento para recuperar o ânimo. Não se esqueça de verificar a documentação necessária para viagens internacionais!`;
  }

  if (msg.includes("vestido") || msg.includes("enxoval") || msg.includes("roupa")) {
    return `👗 **Dica sobre Vestido/Enxoval:**\n\nO vestido de noiva deve ser escolhido com pelo menos 6-8 meses de antecedência para que haja tempo para ajustes. Faça a prova final 1 mês antes do casamento. Cuide bem dos detalhes do enxoval para o lar que vocês vão construir juntos!`;
  }

  if (msg.includes("música") || msg.includes("trilha") || msg.includes("banda") || msg.includes("dj")) {
    return `🎵 **Dica sobre Música:**\n\nCrie playlists específicas para cada momento: chegada dos convidados, cerimônia, coquetel e festa. Compartilhe suas músicas favoritas com o DJ/banda. A música é responsável por 30% da energia do evento!`;
  }

  if (msg.includes("flores") || msg.includes("decoração") || msg.includes("floral")) {
    return `🌸 **Dica sobre Decoração:**\n\nEscolha flores da estação para reduzir custos. Defina a paleta de cores do casamento antes de escolher a decoração. Peça ao decorador referências fotográficas do que você imagina para seu grande dia!`;
  }

  if (msg.includes("olá") || msg.includes("oi") || msg.includes("boa") || msg.includes("tudo bem") || msg.includes("ajuda")) {
    return `💍 **Olá! Sou sua assistente de casamento!**\n\nEstou aqui para te ajudar a planejar o casamento dos seus sonhos! Posso te dar dicas sobre:\n\n• 💰 Orçamento e financeiro\n• 👥 Gestão de convidados\n• 🏛️ Escolha do espaço\n• 🤝 Seleção de fornecedores\n• 📅 Cronograma do dia\n• 🌸 Decoração e flores\n• 🎵 Música e entretenimento\n• ✈️ Lua de mel\n• 👗 Vestido e enxoval\n\nSobre o que você gostaria de saber?`;
  }

  const allTips = [...weddingTips.budget, ...weddingTips.vendors, ...weddingTips.guests];
  const randomTip = allTips[Math.floor(Math.random() * allTips.length)];

  return `💡 **Dica de planejamento:**\n\n${randomTip}\n\nPosso te ajudar com orçamento, convidados, fornecedores, cronograma, lua de mel e muito mais! O que você gostaria de saber?`;
}

export async function POST(req: NextRequest) {
  const ctx = await getSessionAndWedding();
  if ("error" in ctx) return ctx.error;

  const { message } = await req.json();
  if (!message) return NextResponse.json({ error: "Mensagem obrigatória" }, { status: 400 });

  const wedding = await prisma.wedding.findUnique({
    where: { id: ctx.weddingId },
    include: {
      _count: { select: { guests: true, checklistItems: true, budgetItems: true } },
    },
  });

  const response = getAIResponse(message, wedding);

  return NextResponse.json({ response });
}
