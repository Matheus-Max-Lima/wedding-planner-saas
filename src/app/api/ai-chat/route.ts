import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Rule {
  keywords: string[];
  response: string;
}

const rules: Rule[] = [
  {
    keywords: ["checklist", "tarefa", "lista de tarefas", "o que fazer", "preciso fazer"],
    response: `**Checklist completo por mês:**\n\n**12 meses antes:**\n• Definir data e estilo do casamento\n• Reservar o local da cerimônia e recepção\n• Estabelecer o orçamento total\n• Criar a lista de convidados\n\n**10 meses antes:**\n• Contratar fotógrafo e filmagem\n• Escolher e contratar o buffet\n• Pesquisar e reservar banda ou DJ\n\n**8 meses antes:**\n• Começar pesquisa do vestido de noiva\n• Contratar cerimonialista (se desejar)\n• Definir padrinhos e madrinhas\n\n**6 meses antes:**\n• Escolher e contratar decoração\n• Enviar save-the-date\n• Definir cardápio do buffet\n\n**4 meses antes:**\n• Enviar convites formais\n• Planejar a lua de mel\n• Degustação do cardápio\n\n**2 meses antes:**\n• Confirmar todos os fornecedores\n• Prova final do vestido\n• Definir cronograma do dia\n\n**1 mês antes:**\n• Confirmar presenças dos convidados\n• Definir disposição das mesas\n• Ensaio da cerimônia`,
  },
  {
    keywords: ["orçamento", "custo", "dinheiro", "preço", "quanto custa", "gastar", "economizar", "financeiro"],
    response: `**Distribuição ideal do orçamento:**\n\n🏛️ **Local + buffet:** 40-50%\n📸 **Fotografia + filmagem:** 10-15%\n🌸 **Decoração + flores:** 10-15%\n👗 **Vestido + trajes:** 8-12%\n🎵 **Música (DJ/banda):** 5-8%\n✉️ **Convites + papelaria:** 3-5%\n💄 **Beleza (make + cabelo):** 3-5%\n🍰 **Bolo de casamento:** 2-3%\n🎁 **Lembranças:** 1-2%\n\n**Dicas para economizar:**\n• Casamentos em dia de semana custam 20-30% menos\n• Buffet simples com qualidade supera buffet elaborado sem qualidade\n• Flores da estação custam menos e ficam mais bonitas\n• Fotógrafo é o que você vai ter para sempre — não economize aqui`,
  },
  {
    keywords: ["fornecedor", "buffet", "fotógrafo", "fotografia", "filmagem", "banda", "dj", "cerimonialista", "florista"],
    response: `**Como escolher fornecedores:**\n\n🔍 **Pesquisa:**\n• Peça ao menos 3 orçamentos por categoria\n• Veja portfólios e trabalhos anteriores no Instagram\n• Leia avaliações no Google e Casamentos.com.br\n• Priorize indicações de amigas\n\n📋 **Contrato:**\n• Exija contrato por escrito com todos os serviços\n• Verifique cláusulas de cancelamento\n• Confirme data e horário por escrito\n• Veja o que está e o que não está incluso\n\n⏰ **Quando contratar:**\n• Local e buffet: 12 meses antes\n• Fotógrafo e DJ/banda: 10-12 meses antes\n• Decoração: 8-10 meses antes\n• Make e cabelo: 6-8 meses antes`,
  },
  {
    keywords: ["cronograma", "horário", "dia do casamento", "roteiro do dia", "programação"],
    response: `**Cronograma típico do grande dia:**\n\n🌅 **Manhã:**\n• 6h00 - Acordar e café da manhã tranquilo\n• 7h00 - Início da make e cabelo das madrinhas\n• 8h00 - Make e cabelo da noiva\n• 12h00 - Almoço leve (não pule!)\n\n👗 **Tarde:**\n• 13h30 - Vestir o vestido + detalhes\n• 14h30 - Sessão de fotos pré-cerimônia\n• 15h30 - Chegada ao local da cerimônia\n• 16h00 - Cerimônia (duração: 30-60 min)\n\n🥂 **Noite:**\n• 17h00 - Coquetel de boas-vindas\n• 18h30 - Abertura do salão de recepção\n• 19h00 - Entrada dos noivos + primeira dança\n• 19h30 - Jantar\n• 21h00 - Corte do bolo\n• 21h30 - Pista de dança aberta\n• 00h00 - Encerramento\n\n💡 **Dica:** Adicione 30 minutos de margem em cada etapa!`,
  },
  {
    keywords: ["vestido", "noiva", "roupa", "look", "traje"],
    response: `**Guia do vestido de noiva:**\n\n⏰ **Quando começar:**\n• Inicie as buscas com 8-10 meses de antecedência\n• A encomenda do vestido pode levar 4-6 meses\n• Reserve 2-3 meses para alterações\n\n👗 **Estilos populares:**\n• **Ball Gown** - Princesa, rodado, cintura marcada\n• **A-Line** - Versátil, favorece todos os corpos\n• **Sereia** - Justo, valoriza as curvas\n• **Empire** - Justo no busto, solto abaixo\n• **Slip Dress** - Minimalista, moderno\n\n✨ **Dicas importantes:**\n• Experimente estilos que você nunca imaginou\n• Use sutiã de bojo invisível no dia\n• Leve a noiva que você quer ser, não a que outros esperam\n• Priorize conforto — você ficará no vestido por 8+ horas`,
  },
  {
    keywords: ["convidado", "lista de convidados", "número de convidados", "convite", "rsvp", "confirmação"],
    response: `**Gerenciamento de convidados:**\n\n📋 **Como montar a lista:**\n• Faça uma lista A (essenciais) e lista B (desejáveis)\n• Inclua família de ambos os lados proporcionalmente\n• Lembre-se: cada convidado custa em média R$150-300 no buffet\n\n✉️ **Comunicação:**\n• Save-the-date digital: 6 meses antes\n• Convite formal: 3-4 meses antes\n• Confirmação de presença (RSVP): 4-6 semanas antes\n• Lembrete para quem não confirmou: 2 semanas antes\n\n🍽️ **Disposição das mesas:**\n• Mesas de 8-10 pessoas são mais econômicas\n• Separe mesa de honra para família próxima\n• Aproxime pessoas com interesses em comum\n• Evite sentar ex-casais na mesma mesa`,
  },
  {
    keywords: ["lua de mel", "viagem", "honeymoon", "destino", "pós-casamento"],
    response: `**Planejamento da lua de mel:**\n\n🌍 **Destinos populares:**\n• **Internacional:** Maldivas, Grécia, Itália, Paris, Caribe\n• **Nacional:** Fernando de Noronha, Gramado, Foz do Iguaçu, Ilhabela\n• **Aventura:** Nova Zelândia, Costa Rica, Patagônia\n\n⏰ **Quando planejar:**\n• Reserve com 8-12 meses de antecedência\n• Voos internacionais ficam mais baratos com antecedência\n• Considere a época do ano no destino escolhido\n\n💡 **Dicas práticas:**\n• Verifique necessidade de visto (processar com 3-4 meses de antecedência)\n• Verifique vacinas necessárias\n• Avise bancos sobre a viagem para evitar bloqueio do cartão\n• Contrate seguro viagem\n• Leve documentos originais`,
  },
  {
    keywords: ["música", "playlist", "som", "dj", "banda", "canção", "trilha sonora", "entrada", "primeira dança"],
    response: `**Música no casamento:**\n\n🎵 **Momentos musicais:**\n• **Entrada dos padrinhos:** Clássica ou instrumental elegante\n• **Entrada da noiva:** Sua música favorita ou clássica especial\n• **Saída dos noivos:** Animada e festiva\n• **Coquetel:** Jazz, MPB, bossa nova\n• **Jantar:** Suave, ambiente para conversa\n• **Primeira dança:** Música do casal\n• **Festa:** Pop, axé, sertanejo — o que o casal ama!\n\n🎤 **DJ vs Banda:**\n• **DJ:** Mais versátil, menor custo (R$ 2-5k)\n• **Banda:** Mais impacto ao vivo, maior custo (R$ 8-20k)\n• **Ambos:** DJ para a festa, banda para a cerimônia\n\n📝 **Dica:** Monte playlists no Spotify para ter uma referência do estilo musical que você quer para cada momento.`,
  },
  {
    keywords: ["decoração", "flores", "floral", "buquê", "arranjo", "mesa", "cenário"],
    response: `**Decoração e flores:**\n\n🌸 **Tendências atuais:**\n• Minimalismo elegante com muito verde\n• Flores secas e pampas grass\n• Tons nude, terracota e sage green\n• Velas e luzes suspensas\n• Painéis florais na entrada\n\n💐 **Flores da estação (mais baratas):**\n• **Primavera:** Tulipas, rosas, peônias\n• **Verão:** Girassóis, gérberas, lírios\n• **Outono:** Cravos, dálias, flores secas\n• **Inverno:** Eucalipto, orquídeas, callas\n\n💡 **Como economizar na decoração:**\n• Flores brancas e verdes são mais baratas\n• Reutilize decoração da cerimônia na recepção\n• Velas e luzes criam muito efeito por pouco custo\n• Peça orçamento para 2-3 decoradores`,
  },
  {
    keywords: ["enxoval", "casa nova", "trousseau", "compras", "itens"],
    response: `**Guia do enxoval:**\n\n🛏️ **Cama (por casal):**\n• 4 jogos de lençol (200 fios ou mais)\n• 4 fronhas extras\n• 2 edredons/colchas (peso verão/inverno)\n• 4 travesseiros\n\n🚿 **Banho (por pessoa):**\n• 6 toalhas de banho\n• 6 toalhas de rosto\n• 4 toalhas de piso\n\n🍳 **Cozinha:**\n• Jogo de panelas completo\n• Jogo de facas de qualidade\n• Utensílios variados\n• Louças para 12 pessoas\n\n💡 **Marcas recomendadas:**\n• **Cama/banho:** Karsten, Döhler, Santista, Camesa\n• **Panelas:** Tramontina, Le Creuset, Brinox\n• **Facas:** Tramontina, Mundial\n\n🛒 **Dica:** Monte sua lista de presentes com itens do enxoval!`,
  },
  {
    keywords: ["despedida", "solteira", "solteiro", "bachlorette", "chá bar", "festa antes"],
    response: `**Planejamento da despedida:**\n\n📅 **Quando realizar:**\n• 1-3 meses antes do casamento\n• Evite a semana anterior (cansaço e imprevistos)\n• Prefira uma sexta-feira ou sábado de dia\n\n🎉 **Ideias populares:**\n• **Spa day** — relaxante e especial\n• **Jantar temático** em restaurante exclusivo\n• **Viagem de fim de semana** com as amigas\n• **Aula de culinária** ou coquetelaria\n• **Tour de vinhos** ou cervejaria\n• **Piquenique** temático instagramável\n\n💰 **Organização financeira:**\n• Divida custos igualmente entre as convidadas\n• Noiva normalmente não paga\n• Estabeleça orçamento por pessoa antes de planejar\n• Use apps de divisão de conta\n\n📝 **Lista de tarefas:**\n• Definir data com 2-3 meses de antecedência\n• Criar grupo com as madrinhas para organizar\n• Enviar convites com 3-4 semanas de antecedência`,
  },
  {
    keywords: ["mesas", "disposição", "seating", "lugar", "sentar", "organizar convidados"],
    response: `**Organização das mesas:**\n\n🪑 **Tipos de mesa:**\n• **Redonda (8-10 pessoas):** Facilita conversa entre todos\n• **Retangular (10-12 pessoas):** Aproveita melhor o espaço\n• **Mesa imperial:** Para grupos grandes, estilo banquete\n\n📊 **Estratégia de disposição:**\n• **Mesa de honra:** Noivos + pais de ambos os lados\n• **Mesas de padrinhos/madrinhas:** Próximas aos noivos\n• **Familia próxima:** Nas primeiras mesas\n• **Amigos jovens:** Próximos à pista de dança\n• **Idosos:** Longe dos alto-falantes e próximos aos banheiros\n\n💡 **Dicas:**\n• Nunca sente pessoas que tiveram conflitos próximas\n• Aproxime pessoas com interesses em comum\n• Faça simulação em papel antes do evento\n• Confirme com o local o número máximo por mesa`,
  },
  {
    keywords: ["obrigad", "perfeito", "ajud", "ótim", "maravilh", "incrível"],
    response: `Fico muito feliz em poder ajudar! 💕 Lembre-se: o casamento perfeito é aquele que reflete quem vocês são como casal. Não se prenda a padrões — crie o seu próprio! \n\nSe precisar de mais ajuda com qualquer detalhe do planejamento, é só perguntar. Estou aqui para tornar esse momento ainda mais especial! 💍✨`,
  },
];

const DEFAULT_RESPONSE = `Olá! Sou a **Valentina** 💍, sua assistente de planejamento de casamento!\n\nPosso ajudar com:\n• 📋 Checklist e tarefas por mês\n• 💰 Planejamento de orçamento\n• ⭐ Dicas para escolher fornecedores\n• 🕐 Cronograma do grande dia\n• 👗 Escolha do vestido de noiva\n• 👥 Organização de convidados e mesas\n• ✈️ Planejamento da lua de mel\n• 🎵 Música e playlist\n• 🌸 Decoração e flores\n• 🏠 Enxoval e casa nova\n• 🎉 Despedida de solteira\n\nSobre o que você gostaria de saber?`;

function getRuleResponse(message: string): string {
  const lower = message.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  for (const rule of rules) {
    const normalizedKeywords = rule.keywords.map((k) =>
      k.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    );
    if (normalizedKeywords.some((k) => lower.includes(k))) {
      return rule.response;
    }
  }
  return DEFAULT_RESPONSE;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  try {
    const { message, stream: wantStream } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    if (process.env.ANTHROPIC_API_KEY) {
      // Fetch wedding context from DB
      const wedding = await prisma.wedding.findUnique({
        where: { userId },
        select: {
          id: true,
          brideName: true,
          groomName: true,
          weddingDate: true,
          city: true,
          totalBudget: true,
        },
      });

      const weddingContext = wedding
        ? `Noivos: ${wedding.brideName} e ${wedding.groomName}. Data do casamento: ${
            wedding.weddingDate
              ? new Date(wedding.weddingDate).toLocaleDateString("pt-BR")
              : "não definida"
          }. Cidade: ${wedding.city || "não definida"}. Orçamento total: ${
            wedding.totalBudget
              ? `R$ ${wedding.totalBudget.toLocaleString("pt-BR")}`
              : "não definido"
          }.`
        : "Casamento ainda não cadastrado.";

      const weddingId = wedding?.id ?? null;

      if (wantStream) {
        // Streaming response via SSE
        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            stream: true,
            system: `Você é Valentina, assistente de planejamento de casamento da plataforma "Até o Altar".
Você é especialista em casamentos brasileiros. Responda sempre em português, de forma calorosa e prática.
O usuário está planejando um casamento. Forneça dicas específicas, listas e orientações úteis.
Contexto do casamento: ${weddingContext}`,
            messages: [{ role: "user", content: message }],
          }),
        });

        if (anthropicRes.ok && anthropicRes.body) {
          const encoder = new TextEncoder();
          const readable = new ReadableStream({
            async start(controller) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ weddingId, source: "claude" })}\n\n`)
              );
              const reader = anthropicRes.body!.getReader();
              const decoder = new TextDecoder();
              let buffer = "";

              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split("\n");
                  buffer = lines.pop() ?? "";

                  for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    const data = line.slice(6).trim();
                    if (data === "[DONE]") continue;
                    try {
                      const parsed = JSON.parse(data);
                      if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                        controller.enqueue(
                          encoder.encode(
                            `data: ${JSON.stringify({ delta: parsed.delta.text })}\n\n`
                          )
                        );
                      } else if (parsed.type === "message_stop") {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                      }
                    } catch {
                      // skip malformed lines
                    }
                  }
                }
              } finally {
                controller.close();
              }
            },
          });

          return new Response(readable, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        }
        // Fall through to non-streaming Claude if stream request failed
      }

      // Non-streaming Claude call
      const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: `Você é Valentina, assistente de planejamento de casamento da plataforma "Até o Altar".
Você é especialista em casamentos brasileiros. Responda sempre em português, de forma calorosa e prática.
O usuário está planejando um casamento. Forneça dicas específicas, listas e orientações úteis.
Contexto do casamento: ${weddingContext}`,
          messages: [{ role: "user", content: message }],
        }),
      });

      if (anthropicRes.ok) {
        const data = await anthropicRes.json();
        const response = data.content?.[0]?.text ?? "Desculpe, não consegui processar sua mensagem.";
        return NextResponse.json({ response, source: "claude", weddingId });
      }

      // If Claude API fails for any reason, fall through to rule-based fallback
    }

    // Rule-based fallback — get weddingId for history key
    let weddingId: string | null = null;
    try {
      const wedding = await prisma.wedding.findUnique({
        where: { userId },
        select: { id: true },
      });
      weddingId = wedding?.id ?? null;
    } catch {
      // ignore
    }

    const response = getRuleResponse(message);
    return NextResponse.json({ response, source: "rules", weddingId });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
