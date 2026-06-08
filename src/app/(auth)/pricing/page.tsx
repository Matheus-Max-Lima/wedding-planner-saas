import Link from "next/link";
import { Check, X, Sparkles, Shield, Zap } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Gratuito",
    price: null,
    priceLabel: "R$ 0",
    period: "para sempre",
    description: "Comece a planejar seu casamento sem custo algum.",
    icon: "🌸",
    highlight: false,
    cta: "Começar Grátis",
    ctaHref: "/register",
    ctaStyle: "outline" as const,
    features: [
      { label: "Dashboard completo", included: true },
      { label: "Checklist (até 20 itens)", included: true },
      { label: "Lista de convidados (até 50)", included: true },
      { label: "Fornecedores (até 5)", included: true },
      { label: "Controle de orçamento básico", included: true },
      { label: "Valentina IA", included: false },
      { label: "Exportar PDF", included: false },
      { label: "Integrações (Spotify, Google)", included: false },
      { label: "Colaboração com noivo(a)", included: false },
      { label: "Suporte prioritário", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    priceLabel: "R$ 29",
    period: "por mês",
    description: "Tudo que você precisa para um planejamento completo.",
    icon: "💍",
    highlight: true,
    badge: "Mais popular",
    cta: "Assinar Pro",
    ctaHref: "/register?plan=pro",
    ctaStyle: "filled" as const,
    features: [
      { label: "Dashboard completo", included: true },
      { label: "Checklist ilimitado", included: true },
      { label: "Convidados ilimitados", included: true },
      { label: "Fornecedores ilimitados", included: true },
      { label: "Controle de orçamento completo", included: true },
      { label: "Valentina IA", included: true },
      { label: "Exportar PDF", included: true },
      { label: "Integrações (Spotify, Google)", included: true },
      { label: "Colaboração com noivo(a)", included: false },
      { label: "Suporte prioritário", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 49,
    priceLabel: "R$ 49",
    period: "por mês",
    description: "A experiência definitiva com suporte exclusivo.",
    icon: "✨",
    highlight: false,
    cta: "Assinar Premium",
    ctaHref: "/register?plan=premium",
    ctaStyle: "outline" as const,
    features: [
      { label: "Dashboard completo", included: true },
      { label: "Checklist ilimitado", included: true },
      { label: "Convidados ilimitados", included: true },
      { label: "Fornecedores ilimitados", included: true },
      { label: "Controle de orçamento completo", included: true },
      { label: "Valentina IA com contexto completo", included: true },
      { label: "Exportar PDF", included: true },
      { label: "Integrações (Spotify, Google)", included: true },
      { label: "Colaboração com noivo(a)", included: true },
      { label: "Suporte prioritário", included: true },
    ],
  },
];

const faqs = [
  {
    question: "Posso cancelar a qualquer momento?",
    answer:
      "Sim! Você pode cancelar sua assinatura a qualquer momento, sem multa. O acesso continua até o fim do período pago.",
  },
  {
    question: "O plano gratuito expira?",
    answer:
      "Não. O plano gratuito é válido para sempre, sem limite de tempo. Você pode usar todas as funcionalidades gratuitas sem preocupação.",
  },
  {
    question: "Como funciona a Valentina IA?",
    answer:
      "A Valentina é nossa assistente de inteligência artificial especializada em casamentos brasileiros. Ela responde perguntas sobre orçamento, checklist, fornecedores, cronograma e muito mais — disponível 24h por dia.",
  },
  {
    question: "Posso fazer upgrade ou downgrade depois?",
    answer:
      "Sim, você pode mudar de plano a qualquer momento. O ajuste de cobrança é feito automaticamente de forma proporcional.",
  },
  {
    question: "Os dados do meu casamento ficam salvos se eu cancelar?",
    answer:
      "Seus dados ficam disponíveis por 30 dias após o cancelamento. Nesse período você pode exportar tudo em PDF. Após esse prazo os dados são removidos.",
  },
  {
    question: "Quais formas de pagamento são aceitas?",
    answer:
      "Aceitamos cartão de crédito (Visa, Mastercard, Amex), Pix e boleto bancário, processados com segurança via Stripe.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#fdf8f5]">
      {/* Header nav */}
      <header className="border-b border-stone-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-rose-600 font-bold text-lg">
            <span className="text-2xl">💍</span> Até o Altar
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-stone-600 hover:text-stone-800 transition-colors">
              Entrar
            </Link>
            <Link
              href="/register"
              className="text-sm bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm shadow-rose-200"
            >
              Começar Grátis
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Planos e preços
          </div>
          <h1 className="text-4xl font-bold text-stone-800 mb-4">
            Planeje o casamento dos seus sonhos
          </h1>
          <p className="text-lg text-stone-500 max-w-xl mx-auto">
            Comece gratuitamente e faça upgrade quando quiser. Sem surpresas na fatura.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 flex flex-col ${
                plan.highlight
                  ? "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-2xl shadow-rose-200 scale-[1.03] z-10"
                  : "bg-white border border-stone-200 shadow-sm"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full shadow-sm whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div className="text-3xl mb-3">{plan.icon}</div>
              <h2 className={`text-xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-stone-800"}`}>
                {plan.name}
              </h2>
              <p className={`text-sm mb-5 ${plan.highlight ? "text-rose-100" : "text-stone-500"}`}>
                {plan.description}
              </p>

              <div className="mb-6">
                <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-stone-800"}`}>
                  {plan.priceLabel}
                </span>
                <span className={`text-sm ml-1 ${plan.highlight ? "text-rose-200" : "text-stone-400"}`}>
                  /{plan.period}
                </span>
              </div>

              <Link
                href={plan.ctaHref}
                className={`block text-center py-3 px-6 rounded-2xl font-semibold text-sm transition-all mb-8 ${
                  plan.highlight
                    ? "bg-white text-rose-600 hover:bg-rose-50 shadow-sm"
                    : plan.ctaStyle === "filled"
                    ? "bg-rose-500 text-white hover:bg-rose-600 shadow-sm shadow-rose-200"
                    : "border-2 border-stone-300 text-stone-700 hover:border-rose-300 hover:text-rose-600"
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature.label} className="flex items-start gap-2.5 text-sm">
                    {feature.included ? (
                      <Check
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          plan.highlight ? "text-rose-200" : "text-emerald-500"
                        }`}
                      />
                    ) : (
                      <X
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          plan.highlight ? "text-rose-300/60" : "text-stone-300"
                        }`}
                      />
                    )}
                    <span
                      className={
                        feature.included
                          ? plan.highlight
                            ? "text-white"
                            : "text-stone-700"
                          : plan.highlight
                          ? "text-rose-300/60"
                          : "text-stone-400"
                      }
                    >
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-8 mb-20 text-stone-500">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-5 h-5 text-emerald-500" />
            Pagamento seguro via Stripe
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-5 h-5 text-amber-500" />
            Ativação imediata
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-5 h-5 text-rose-500" />
            Cancele quando quiser
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-stone-800 text-center mb-8">
            Perguntas frequentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-stone-800 mb-2">{faq.question}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-3xl p-12">
          <div className="text-4xl mb-4">💕</div>
          <h2 className="text-2xl font-bold text-stone-800 mb-3">
            Pronta para começar?
          </h2>
          <p className="text-stone-500 mb-8 max-w-sm mx-auto">
            Junte-se a milhares de noivas que já planejam o casamento dos sonhos com o Até o Altar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-2xl font-semibold text-sm transition-colors shadow-lg shadow-rose-200"
            >
              Começar Grátis
            </Link>
            <Link
              href="/register?plan=pro"
              className="border-2 border-rose-300 text-rose-600 hover:bg-rose-50 px-8 py-3 rounded-2xl font-semibold text-sm transition-colors"
            >
              Ver plano Pro
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-stone-100 mt-12 py-8 text-center text-sm text-stone-400">
        <p>© 2026 Até o Altar · Feito com 💕 para o seu grande dia</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/login" className="hover:text-stone-600 transition-colors">Entrar</Link>
          <Link href="/register" className="hover:text-stone-600 transition-colors">Cadastrar</Link>
        </div>
      </footer>
    </div>
  );
}
