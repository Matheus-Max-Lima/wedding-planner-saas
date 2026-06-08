import { NextRequest, NextResponse } from "next/server";
import { getSessionAndWedding } from "@/lib/api-helper";

interface Rule {
  keywords: string[];
  responses: string[];
}

const rules: Rule[] = [
  {
    keywords: ["checklist", "lista", "tarefa", "fazer", "pendente"],
    responses: [
      "Para organizar seu checklist, comece pelas tarefas com maior antecedência: local, buffet e fotografia devem ser reservados com 12-18 meses de antecedência. Use categorias para facilitar a visualização! 📋",
      "Uma dica valiosa: marque as tarefas por prioridade. Documentação, local e fornecedores principais vêm primeiro. O restante pode ser organizado mês a mês!",
    ],
  },
  {
    keywords: ["orcamento", "orçamento", "dinheiro", "custo", "gasto", "budget", "financ"],
    responses: [
      "Para um casamento equilibrado, a distribuição recomendada é: 40-50% local e buffet, 10-15% fotografia/filmagem, 8-12% música, 8-10% decoração, 5-8% vestido e trajes, e o restante para outros itens. 💰",
      "Dica de ouro: reserve sempre 10% do orçamento como reserva de emergência. Imprevistos acontecem e é melhor estar preparada!",
    ],
  },
  {
    keywords: ["convidado", "lista de convidados", "convite", "rsvp"],
    responses: [
      "Para a lista de convidados, uma boa prática é fazer 3 listas: confirmados, provavelmente virão, e talvez. Isso ajuda no planejamento do espaço e buffet. 👥",
      "Envie os convites com pelo menos 2-3 meses de antecedência. Para casamentos em alta temporada (novembro-fevereiro), considere 4 meses!",
    ],
  },
  {
    keywords: ["fornecedor", "buffet", "fotografo", "fotógrafo", "musica", "dj", "banda", "decorac"],
    responses: [
      "Ao contratar fornecedores, sempre peça referências e visite trabalhos anteriores. Para fotógrafos, analise o estilo das fotos — cada profissional tem uma assinatura única! 📸",
      "Dica importante: leia todos os contratos com atenção antes de assinar. Verifique cláusulas de cancelamento, o que está incluso e os prazos de entrega.",
    ],
  },
  {
    keywords: ["cronograma", "horario", "horário", "roteiro", "cerimonia", "cerimônia", "recepcao", "recepção"],
    responses: [
      "Um cronograma típico de casamento: chegada dos convidados (30 min antes), cerimônia (30-60 min), cocktail (1-1,5h), jantar e festa (4-6h). Sempre adicione 15-20 minutos de margem entre etapas! ⏰",
      "Para o dia do casamento, delegue um coordenador (profissional ou pessoa de confiança) para gerenciar o cronograma. Assim você curte cada momento sem preocupações!",
    ],
  },
  {
    keywords: ["vestido", "traje", "noiva", "roupa", "look"],
    responses: [
      "Comece a procurar o vestido com 9-12 meses de antecedência! As provas e ajustes levam tempo. Leve pessoas de confiança e abra a mente — às vezes o vestido ideal não é o que imaginamos. 👗",
      "Dica: o primeiro fitting do vestido deve acontecer com pelo menos 3 meses de antecedência. Deixe 2-3 provas de ajuste na agenda da costureira.",
    ],
  },
  {
    keywords: ["lua de mel", "viagem", "destino", "honeymoon"],
    responses: [
      "Para a lua de mel, reserve as passagens e hotel com 6-12 meses de antecedência, especialmente para destinos internacionais populares. Verifique a validade dos documentos! ✈️",
      "Dica de economia: considere viajar na semana seguinte ao casamento em vez de logo após — você estará mais descansada e os preços costumam ser menores!",
    ],
  },
  {
    keywords: ["musica", "música", "playlist", "som", "dj", "banda", "cancao", "canção"],
    responses: [
      "Para a trilha sonora do casamento, pense em 3 momentos: entrada da noiva (especial!), durante a cerimônia, e festa. Reúna músicas que significam algo para vocês como casal! 🎵",
      "Se contratar DJ, passe uma playlist de músicas que não podem faltar e outra de músicas que não quer de jeito nenhum. Isso ajuda muito o profissional a entender seu estilo!",
    ],
  },
  {
    keywords: ["decoracao", "decoração", "flor", "arranjo", "tema", "estilo", "paleta"],
    responses: [
      "Antes de definir a decoração, escolha uma paleta de cores (2-3 cores principais). Isso guia todas as decisões e dá coesão ao visual. As mais populares atualmente: terracota+verde, azul claro+dourado, e rose gold+branco. 🌸",
      "Dica de economia na decoração: invista onde mais aparece nas fotos (altar, mesa dos noivos, entrada). Para mesas de convidados, flores sazonais são mais econômicas!",
    ],
  },
  {
    keywords: ["enxoval", "casa", "presente", "lista", "loja"],
    responses: [
      "Para o enxoval, faça uma lista de presentes em lojas variadas com itens em diferentes faixas de preço. Inclua itens para cozinha, quarto, banheiro e decoração. Plataformas online são muito convenientes! 🏠",
      "Dica: cadastre sua lista de presentes com 4-6 meses de antecedência. Assim os convidados têm tempo de pesquisar e presentear com antecedência.",
    ],
  },
  {
    keywords: ["despedida", "chá bar", "cha bar", "festa solteira", "bachelorette"],
    responses: [
      "A despedida de solteira é tradição! Combine com suas melhores amigas um tema que represente você. Pode ser um jantar intimista, uma viagem de fim de semana, spa day, ou festa temática. 🎉",
      "Dica: faça a despedida de 1-2 semanas antes do casamento, não muito próxima, para você estar descansada e tranquila no grande dia!",
    ],
  },
  {
    keywords: ["mesa", "lugar", "assento", "acomoda", "seating"],
    responses: [
      "No plano de mesas, agrupe pessoas que se conhecem ou têm interesses em comum. Considere colocar idosos e famílias com crianças próximos à saída (mais fácil se precisar sair). 🪑",
      "Uma dica: imprima o diagrama do salão e use post-its com os nomes — fica mais fácil de mover as pessoas ao testar diferentes configurações!",
    ],
  },
  {
    keywords: ["ola", "olá", "oi", "bom dia", "boa tarde", "boa noite", "tudo bem", "como vai"],
    responses: [
      "Olá! Eu sou a Valentina, sua assistente de planejamento de casamento! 💕 Estou aqui para ajudar com todas as suas dúvidas sobre checklist, orçamento, fornecedores, cronograma, vestido, convidados e muito mais. O que você gostaria de saber?",
      "Oi! Que alegria falar com uma futura noiva! Sou a Valentina e sei tudo sobre planejamento de casamentos. Me pergunte sobre qualquer tema — desde o vestido até a lua de mel! 🌸",
    ],
  },
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

function findResponse(message: string): string {
  const normalized = normalizeText(message);
  for (const rule of rules) {
    const matched = rule.keywords.some((kw) => normalized.includes(normalizeText(kw)));
    if (matched) {
      return rule.responses[Math.floor(Math.random() * rule.responses.length)];
    }
  }
  const fallbacks = [
    "Que ótima pergunta! Para te dar a melhor resposta, pode me contar mais detalhes sobre o que você precisa? Posso ajudar com checklist, orçamento, fornecedores, vestido, convidados, lua de mel e muito mais! 💕",
    "Adorei sua pergunta! O planejamento de casamento tem muitos detalhes. Tente perguntar sobre um tema específico — como orçamento, fornecedores, cronograma ou decoração — e terei dicas especiais para você! 🌸",
    "Estou aqui para ajudar! Me fale mais sobre o que você precisa. Pode ser sobre o dia D, fornecedores, convidados, vestido... Cada casamento é único e adoraria ajudar a tornar o seu perfeito! ✨",
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

export async function POST(req: NextRequest) {
  const result = await getSessionAndWedding();
  if ("error" in result) return result.error;
  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });
  const response = findResponse(message);
  return NextResponse.json({ response, assistant: "Valentina" });
}
