import Link from "next/link";

export default function HomePage() {
  const features = [
    { emoji: "✅", title: "Checklist de 12 meses", desc: "Nunca esqueça nenhum detalhe com nosso checklist inteligente por mês" },
    { emoji: "💰", title: "Controle Financeiro", desc: "Gerencie orçamento, parcelas e pagamentos em um só lugar" },
    { emoji: "👥", title: "Gestão de Convidados", desc: "RSVP digital, organização de mesas e controle de confirmações" },
    { emoji: "⭐", title: "Fornecedores", desc: "Cadastre, compare e gerencie todos os seus fornecedores" },
    { emoji: "🌸", title: "Painel de Inspirações", desc: "Salve ideias de decoração, vestido, buquê e muito mais" },
    { emoji: "🤖", title: "IA Assistente", desc: "Valentina, sua consultora de casamento com inteligência artificial" },
  ];

  const testimonials = [
    { name: "Mariana & Felipe", location: "São Paulo, SP", text: "A plataforma foi essencial para organizar tudo. Nunca imaginei que planejar o casamento pudesse ser tão tranquilo!", avatar: "M" },
    { name: "Camila & Rafael", location: "Rio de Janeiro, RJ", text: "O controle de orçamento me salvou! Consegui economizar R$8.000 com as sugestões da IA.", avatar: "C" },
    { name: "Juliana & Pedro", location: "Belo Horizonte, MG", text: "Tudo que eu precisava em um só lugar. O checklist de 12 meses é perfeito, não deixei passar nada!", avatar: "J" },
  ];

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#1c1917" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid #fce7e7", padding: "0 1.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem" }}>💍</span>
            <span style={{ fontWeight: 800, fontSize: "1.2rem", background: "linear-gradient(135deg, #f43f5e, #d4af37)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Noiva sem Crise
            </span>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <a href="#features" style={{ color: "#6b7280", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>Funcionalidades</a>
            <a href="#depoimentos" style={{ color: "#6b7280", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>Depoimentos</a>
            <Link href="/login" style={{ color: "#f43f5e", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>Entrar</Link>
            <Link href="/register" style={{ background: "linear-gradient(135deg, #f43f5e, #fb7185)", color: "white", padding: "0.5rem 1.25rem", borderRadius: "0.625rem", textDecoration: "none", fontSize: "0.9rem", fontWeight: 700 }}>
              Começar grátis
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #fff0f2 0%, #fdf8f5 50%, #fffbeb 100%)", padding: "6rem 1.5rem 5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "#fce7e7", color: "#f43f5e", padding: "0.375rem 1rem", borderRadius: "9999px", fontSize: "0.85rem", fontWeight: 600, marginBottom: "1.5rem" }}>
            💍 Planejamento de casamento completo
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, color: "#1a1a2e", lineHeight: 1.15, marginBottom: "1.5rem" }}>
            Planeje o casamento dos seus{" "}
            <span style={{ background: "linear-gradient(135deg, #f43f5e, #d4af37)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              sonhos
            </span>
            {" "}sem stress
          </h1>
          <p style={{ fontSize: "1.2rem", color: "#6b7280", maxWidth: "600px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
            Tudo que você precisa para organizar cada detalhe do seu grande dia: checklist, orçamento, fornecedores, convidados e muito mais.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{ background: "linear-gradient(135deg, #f43f5e, #fb7185)", color: "white", padding: "1rem 2rem", borderRadius: "0.875rem", textDecoration: "none", fontSize: "1.05rem", fontWeight: 700, boxShadow: "0 8px 24px rgba(244,63,94,0.35)" }}>
              Começar grátis agora 💍
            </Link>
            <Link href="/login" style={{ background: "white", color: "#374151", padding: "1rem 2rem", borderRadius: "0.875rem", textDecoration: "none", fontSize: "1.05rem", fontWeight: 600, border: "1.5px solid #fce7e7", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              Já tenho conta →
            </Link>
          </div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", maxWidth: "500px", margin: "3rem auto 0" }}>
            {[["500+", "Casais planejaram"], ["98%", "Satisfação"], ["R$ 50k+", "Economizados"]].map(([val, label], i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f43f5e" }}>{val}</div>
                <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "5rem 1.5rem", background: "white" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, color: "#1a1a2e", marginBottom: "1rem" }}>
              Tudo em um só lugar
            </h2>
            <p style={{ color: "#6b7280", fontSize: "1.1rem", maxWidth: "500px", margin: "0 auto" }}>
              Ferramentas completas para cada etapa do seu planejamento
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {features.map((f, i) => (
              <div key={i} style={{ background: "#fdf8f5", borderRadius: "1rem", padding: "1.75rem", border: "1px solid #fce7e7", transition: "transform 0.2s" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{f.emoji}</div>
                <h3 style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1a1a2e", marginBottom: "0.5rem" }}>{f.title}</h3>
                <p style={{ color: "#6b7280", lineHeight: 1.6, fontSize: "0.95rem" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" style={{ padding: "5rem 1.5rem", background: "linear-gradient(135deg, #fff0f2, #fdf8f5)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, color: "#1a1a2e", marginBottom: "3rem" }}>
            O que as noivas dizem 💕
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ background: "white", borderRadius: "1.25rem", padding: "1.75rem", border: "1px solid #fce7e7", boxShadow: "0 4px 16px rgba(244,63,94,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1rem" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #f43f5e, #fb7185)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1.1rem" }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: "0.95rem" }}>{t.name}</div>
                    <div style={{ color: "#9ca3af", fontSize: "0.8rem" }}>{t.location}</div>
                  </div>
                </div>
                <p style={{ color: "#4b5563", lineHeight: 1.7, fontSize: "0.95rem", fontStyle: "italic" }}>&ldquo;{t.text}&rdquo;</p>
                <div style={{ marginTop: "1rem", color: "#f59e0b", fontSize: "1.1rem" }}>★★★★★</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "5rem 1.5rem", background: "linear-gradient(135deg, #f43f5e, #fb7185)", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 900, color: "white", marginBottom: "1rem" }}>
          Comece a planejar hoje 💍
        </h2>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.1rem", marginBottom: "2rem" }}>
          Junte-se a centenas de noivas que já usam a plataforma
        </p>
        <Link href="/register" style={{ background: "white", color: "#f43f5e", padding: "1rem 2.5rem", borderRadius: "0.875rem", textDecoration: "none", fontSize: "1.05rem", fontWeight: 800, display: "inline-block" }}>
          Criar conta grátis →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ background: "#1a1a2e", color: "white", padding: "2rem 1.5rem", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.25rem" }}>💍</span>
          <span style={{ fontWeight: 700, color: "#fb7185" }}>Noiva sem Crise</span>
        </div>
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
          © {new Date().getFullYear()} Noiva sem Crise. Feito com 💕 para tornar seu casamento perfeito.
        </p>
      </footer>
    </div>
  );
}
