import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus, Trash2, Edit3, Check, X, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, AlertTriangle, Flame,
  BarChart2, BookOpen, ShoppingBag, History, Target
} from "lucide-react";

const R$ = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const pct = (v, dec = 1) => `${(v || 0).toFixed(dec)}%`;

function load(k, fb) {
  try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; }
  catch { return fb; }
}
function persist(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

const CATS = ["Proteínas", "Laticínios", "Pães & Massas", "Molhos & Temperos", "Vegetais", "Embalagens", "Outros"];
const UNIDADES = ["g", "kg", "ml", "L", "un"];
const META_CMV = 35;

const SEED_INSUMOS = [
  { id: 1, nome: "Blend Artesanal 180g", categoria: "Proteínas", preco: 0.089, unidade: "g", historico: [{ data: "2025-03-01", preco: 0.075 }, { data: "2025-04-01", preco: 0.082 }, { data: "2025-06-01", preco: 0.089 }] },
  { id: 2, nome: "Queijo Cheddar", categoria: "Laticínios", preco: 0.052, unidade: "g", historico: [{ data: "2025-03-01", preco: 0.044 }, { data: "2025-05-01", preco: 0.048 }, { data: "2025-06-01", preco: 0.052 }] },
  { id: 3, nome: "Pão Brioche", categoria: "Pães & Massas", preco: 2.8, unidade: "un", historico: [{ data: "2025-04-01", preco: 2.5 }, { data: "2025-06-01", preco: 2.8 }] },
  { id: 4, nome: "Bacon Defumado", categoria: "Proteínas", preco: 0.065, unidade: "g", historico: [{ data: "2025-04-01", preco: 0.058 }, { data: "2025-06-01", preco: 0.065 }] },
  { id: 5, nome: "Alface Americana", categoria: "Vegetais", preco: 0.018, unidade: "g", historico: [{ data: "2025-06-01", preco: 0.018 }] },
  { id: 6, nome: "Tomate", categoria: "Vegetais", preco: 0.012, unidade: "g", historico: [{ data: "2025-06-01", preco: 0.012 }] },
  { id: 7, nome: "Molho Especial", categoria: "Molhos & Temperos", preco: 0.034, unidade: "ml", historico: [{ data: "2025-06-01", preco: 0.034 }] },
  { id: 8, nome: "Embalagem Kraft", categoria: "Embalagens", preco: 0.85, unidade: "un", historico: [{ data: "2025-06-01", preco: 0.85 }] },
];
const SEED_LANCHES = [
  { id: 1, nome: "Smash Burguer Clássico", precoVenda: 28.9, itens: [{ insumoId: 1, qtd: 180 }, { insumoId: 2, qtd: 30 }, { insumoId: 3, qtd: 1 }, { insumoId: 5, qtd: 20 }, { insumoId: 6, qtd: 30 }, { insumoId: 7, qtd: 15 }, { insumoId: 8, qtd: 1 }] },
  { id: 2, nome: "X-Bacon Duplo", precoVenda: 38.9, itens: [{ insumoId: 1, qtd: 360 }, { insumoId: 2, qtd: 50 }, { insumoId: 4, qtd: 60 }, { insumoId: 3, qtd: 1 }, { insumoId: 7, qtd: 20 }, { insumoId: 8, qtd: 1 }] },
  { id: 3, nome: "Smash Cheddar Bacon", precoVenda: 34.9, itens: [{ insumoId: 1, qtd: 180 }, { insumoId: 2, qtd: 50 }, { insumoId: 4, qtd: 40 }, { insumoId: 3, qtd: 1 }, { insumoId: 5, qtd: 20 }, { insumoId: 7, qtd: 15 }, { insumoId: 8, qtd: 1 }] },
];
const SEED_VENDAS = [
  { lancheId: 1, qtd: 210 }, { lancheId: 2, qtd: 143 }, { lancheId: 3, qtd: 187 },
];

export default function App() {
  const [tela, setTela] = useState("diagnostico");
  const [insumos, setInsumos] = useState(() => load("crv3_ins", SEED_INSUMOS));
  const [lanches, setLanches] = useState(() => load("crv3_lan", SEED_LANCHES));
  const [vendas, setVendas] = useState(() => load("crv3_vnd", SEED_VENDAS));

  useEffect(() => persist("crv3_ins", insumos), [insumos]);
  useEffect(() => persist("crv3_lan", lanches), [lanches]);
  useEffect(() => persist("crv3_vnd", vendas), [vendas]);

  const calcCusto = useCallback((lanche) =>
    (lanche.itens || []).reduce((s, it) => {
      const ins = insumos.find(i => i.id === it.insumoId);
      return s + (ins ? ins.preco * it.qtd : 0);
    }, 0), [insumos]);

  const tabs = [
    { id: "diagnostico", label: "Diagnóstico", icon: <BarChart2 size={16} /> },
    { id: "cardapio",    label: "Cardápio",    icon: <BookOpen size={16} /> },
    { id: "insumos",     label: "Insumos",     icon: <ShoppingBag size={16} /> },
  ];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#0f0f0f", minHeight: "100vh", color: "#fafaf9" }}>
      <div style={{ background: "#0f0f0f", borderBottom: "1px solid #1f1f1f", padding: "0 20px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ background: "#f97316", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Flame size={20} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>CRV <span style={{ color: "#f97316" }}>Pro</span></div>
                <div style={{ fontSize: 11, color: "#57534e" }}>Controle de Receita e Venda</div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, paddingBottom: 0 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTela(t.id)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 16px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: "none", borderBottom: tela === t.id ? "2px solid #f97316" : "2px solid transparent",
                color: tela === t.id ? "#f97316" : "#78716c", transition: "all .15s",
              }}>{t.icon}{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>
        {tela === "diagnostico" && <TelaDiagnostico lanches={lanches} vendas={vendas} setVendas={setVendas} insumos={insumos} calcCusto={calcCusto} />}
        {tela === "cardapio"    && <TelaCardapio lanches={lanches} setLanches={setLanches} insumos={insumos} calcCusto={calcCusto} />}
        {tela === "insumos"     && <TelaInsumos insumos={insumos} setInsumos={setInsumos} />}
      </div>
    </div>
  );
}

function TelaDiagnostico({ lanches, vendas, setVendas, insumos, calcCusto }) {
  const [editVenda, setEditVenda] = useState(null);
  const [vendaVal, setVendaVal] = useState("");

  const stats = useMemo(() => {
    let faturamento = 0, custoTotal = 0, lucro = 0;
    const porLanche = lanches.map(l => {
      const v = vendas.find(x => x.lancheId === l.id);
      const qtd = v?.qtd || 0;
      const custo = calcCusto(l);
      const fat = l.precoVenda * qtd;
      const cust = custo * qtd;
      const luc = fat - cust;
      const cmv = fat > 0 ? (cust / fat) * 100 : 0;
      faturamento += fat; custoTotal += cust; lucro += luc;
      return { ...l, qtd, custo, fat, cust, luc, cmv };
    });
    const cmvGeral = faturamento > 0 ? (custoTotal / faturamento) * 100 : 0;
    const perdaPotencial = lanches.reduce((s, l) => {
      const v = vendas.find(x => x.lancheId === l.id);
      const qtd = v?.qtd || 0;
      const custo = calcCusto(l);
      const precoIdeal = custo / (META_CMV / 100);
      const diff = precoIdeal - l.precoVenda;
      return diff > 0 ? s + diff * qtd : s;
    }, 0);
    return { faturamento, custoTotal, lucro, cmvGeral, porLanche, perdaPotencial };
  }, [lanches, vendas, calcCusto]);

  function salvarVenda(lancheId) {
    const v = parseInt(vendaVal);
    if (!v || v < 0) return;
    setVendas(prev => {
      const idx = prev.findIndex(x => x.lancheId === lancheId);
      if (idx >= 0) return prev.map((x, i) => i === idx ? { ...x, qtd: v } : x);
      return [...prev, { lancheId, qtd: v }];
    });
    setEditVenda(null); setVendaVal("");
  }

  const cmvColor = stats.cmvGeral <= META_CMV ? "#22c55e" : stats.cmvGeral <= META_CMV + 8 ? "#f59e0b" : "#ef4444";
  const cmvStatus = stats.cmvGeral <= META_CMV ? "✅ Saudável" : stats.cmvGeral <= META_CMV + 8 ? "⚠️ Atenção" : "🚨 Perigoso";

  const porCat = useMemo(() => {
    const map = {};
    insumos.forEach(ins => { if (!map[ins.categoria]) map[ins.categoria] = 0; });
    lanches.forEach(l => {
      const v = vendas.find(x => x.lancheId === l.id);
      const qtd = v?.qtd || 0;
      if (!qtd) return;
      l.itens.forEach(it => {
        const ins = insumos.find(i => i.id === it.insumoId);
        if (!ins) return;
        if (!map[ins.categoria]) map[ins.categoria] = 0;
        map[ins.categoria] += ins.preco * it.qtd * qtd;
      });
    });
    return Object.entries(map).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  }, [insumos, lanches, vendas]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {stats.perdaPotencial > 0 && (
        <div style={{ background: "linear-gradient(135deg, #450a0a, #7f1d1d)", border: "1px solid #ef4444", borderRadius: 16, padding: "18px 20px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <AlertTriangle size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#fca5a5" }}>Você está deixando dinheiro na mesa</div>
              <div style={{ fontSize: 13, color: "#f87171", marginTop: 4, lineHeight: 1.5 }}>
                Com os preços atuais, você perde{" "}
                <span style={{ fontWeight: 900, fontSize: 17, color: "#ffffff" }}>{R$(stats.perdaPotencial)}</span>
                {" "}este mês comparado ao preço ideal de venda.
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <KPI label="Faturamento" value={R$(stats.faturamento)} sub="este mês" accent="#f97316" />
        <KPI label="Custo total" value={R$(stats.custoTotal)} sub="em insumos" accent="#ef4444" />
        <KPI label="Lucro bruto" value={R$(stats.lucro)} sub="antes fixos" accent="#22c55e" />
      </div>

      <DarkCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: "#78716c", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>CMV — Custo da Mercadoria Vendida</div>
            <div style={{ fontSize: 11, color: "#57534e", marginTop: 3 }}>Meta ideal para hamburguerias: abaixo de {META_CMV}%</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: cmvColor, letterSpacing: "-0.03em" }}>{pct(stats.cmvGeral)}</div>
            <div style={{ fontSize: 12, color: cmvColor, fontWeight: 600 }}>{cmvStatus}</div>
          </div>
        </div>
        <div style={{ position: "relative", marginBottom: 8 }}>
          <div style={{ height: 12, borderRadius: 999, background: "linear-gradient(to right, #22c55e 0%, #22c55e 35%, #f59e0b 43%, #ef4444 60%, #ef4444 100%)", opacity: 0.25 }} />
          <div style={{ position: "absolute", top: 0, left: 0, height: 12, borderRadius: 999, background: cmvColor, width: `${Math.min(stats.cmvGeral, 100)}%`, transition: "width 1s ease" }} />
          <div style={{ position: "absolute", top: -4, left: `${META_CMV}%`, transform: "translateX(-50%)" }}>
            <div style={{ width: 2, height: 20, background: "#f97316" }} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#57534e" }}>
          <span>0%</span>
          <span style={{ color: "#f97316" }}>meta {META_CMV}%</span>
          <span>100%</span>
        </div>
      </DarkCard>

      {porCat.length > 0 && (
        <DarkCard>
          <SectionLabel icon={<Target size={14} />}>Custo por categoria</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            {porCat.map(([cat, val]) => {
              const barPct = stats.custoTotal > 0 ? (val / stats.custoTotal) * 100 : 0;
              const barColor = cat === "Proteínas" && barPct > 50 ? "#ef4444" : "#f97316";
              return (
                <div key={cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "#d6d3d1" }}>{cat}</span>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "#78716c" }}>{pct(barPct)}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#fafaf9", fontFamily: "monospace" }}>{R$(val)}</span>
                    </div>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: "#1f1f1f" }}>
                    <div style={{ height: 6, borderRadius: 999, background: barColor, width: `${barPct}%`, transition: "width 0.8s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </DarkCard>
      )}

      <DarkCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <SectionLabel icon={<BookOpen size={14} />}>Desempenho por lanche</SectionLabel>
          <span style={{ fontSize: 11, color: "#57534e" }}>Clique para editar vendas</span>
        </div>
        {stats.porLanche.map(l => {
          const cmvColor = l.cmv <= META_CMV ? "#22c55e" : l.cmv <= META_CMV + 8 ? "#f59e0b" : "#ef4444";
          const isEditing = editVenda === l.id;
          return (
            <div key={l.id} style={{ borderTop: "1px solid #1f1f1f", paddingTop: 14, paddingBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#fafaf9" }}>{l.nome}</div>
                  <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
                    <MiniStat label="Custo unit." value={R$(l.custo)} />
                    <MiniStat label="Venda" value={R$(l.precoVenda)} />
                    <MiniStat label="CMV" value={pct(l.cmv)} color={cmvColor} />
                    <MiniStat label="Lucro unit." value={R$(l.precoVenda - l.custo)} color="#22c55e" />
                  </div>
                </div>
                <div style={{ textAlign: "right", marginLeft: 12 }}>
                  {isEditing ? (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input type="number" value={vendaVal} onChange={e => setVendaVal(e.target.value)}
                        placeholder="qtd" style={{ width: 64, background: "#1f1f1f", border: "1px solid #3f3f3f", borderRadius: 8, padding: "6px 8px", color: "white", fontSize: 13, textAlign: "center" }} />
                      <button onClick={() => salvarVenda(l.id)} style={{ background: "#22c55e", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "white", display: "flex" }}><Check size={14} /></button>
                      <button onClick={() => setEditVenda(null)} style={{ background: "#3f3f3f", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "white", display: "flex" }}><X size={14} /></button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditVenda(l.id); setVendaVal(l.qtd || ""); }}
                      style={{ background: "none", border: "1px solid #3f3f3f", borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "#78716c", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                      <Edit3 size={12} />
                      <span>{l.qtd > 0 ? `${l.qtd} vendas` : "Informar vendas"}</span>
                    </button>
                  )}
                  {l.qtd > 0 && (
                    <div style={{ fontSize: 12, color: "#57534e", marginTop: 4 }}>
                      Fat: <span style={{ color: "#f97316", fontWeight: 700 }}>{R$(l.fat)}</span>
                    </div>
                  )}
                </div>
              </div>
              {l.qtd > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ height: 4, borderRadius: 999, background: "#1f1f1f" }}>
                    <div style={{ height: 4, borderRadius: 999, background: cmvColor, width: `${Math.min(l.cmv, 100)}%` }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </DarkCard>
    </div>
  );
}

function TelaCardapio({ lanches, setLanches, insumos, calcCusto }) {
  const [modo, setModo] = useState("lista");
  const [editId, setEditId] = useState(null);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [itens, setItens] = useState([]);
  const [expandido, setExpandido] = useState(null);

  function abrirNovo() { setModo("form"); setEditId(null); setNome(""); setPreco(""); setItens([{ insumoId: insumos[0]?.id, qtd: "" }]); }
  function abrirEdicao(l) { setModo("form"); setEditId(l.id); setNome(l.nome); setPreco(l.precoVenda); setItens(l.itens.map(i => ({ ...i, qtd: String(i.qtd) }))); }
  function addItem() { setItens(p => [...p, { insumoId: insumos[0]?.id, qtd: "" }]); }
  function removeItem(idx) { setItens(p => p.filter((_, i) => i !== idx)); }
  function updItem(idx, f, v) { setItens(p => p.map((it, i) => i === idx ? { ...it, [f]: v } : it)); }

  const custoPreview = useMemo(() =>
    itens.reduce((s, it) => {
      const ins = insumos.find(i => i.id === Number(it.insumoId));
      return s + (ins && it.qtd ? ins.preco * parseFloat(it.qtd) : 0);
    }, 0), [itens, insumos]);

  const margemPreview = preco && custoPreview > 0 ? ((parseFloat(preco) - custoPreview) / parseFloat(preco)) * 100 : null;
  const cmvPreview = preco && custoPreview > 0 ? (custoPreview / parseFloat(preco)) * 100 : null;

  function salvar() {
    if (!nome.trim() || !preco) return;
    const itensFiltrados = itens.filter(it => it.insumoId && parseFloat(it.qtd) > 0)
      .map(it => ({ insumoId: Number(it.insumoId), qtd: parseFloat(it.qtd) }));
    if (!itensFiltrados.length) return;
    const precoNum = parseFloat(preco);
    if (editId) {
      setLanches(p => p.map(l => l.id === editId ? { ...l, nome: nome.trim(), precoVenda: precoNum, itens: itensFiltrados } : l));
    } else {
      setLanches(p => [...p, { id: Date.now(), nome: nome.trim(), precoVenda: precoNum, itens: itensFiltrados }]);
    }
    setModo("lista");
  }

  if (!insumos.length) return (
    <DarkCard style={{ textAlign: "center", padding: "40px 20px" }}>
      <ShoppingBag size={32} color="#57534e" style={{ margin: "0 auto 12px" }} />
      <div style={{ color: "#78716c", fontWeight: 700 }}>Cadastre insumos primeiro</div>
    </DarkCard>
  );

  if (modo === "form") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setModo("lista")} style={{ background: "#1f1f1f", border: "none", borderRadius: 8, padding: "8px", cursor: "pointer", color: "#78716c", display: "flex" }}><X size={18} /></button>
        <span style={{ fontWeight: 800, fontSize: 17 }}>{editId ? "Editar lanche" : "Novo lanche"}</span>
      </div>
      <DarkCard>
        <FieldLabel>Nome do lanche</FieldLabel>
        <DarkInput placeholder="Ex: Smash Burguer Clássico" value={nome} onChange={e => setNome(e.target.value)} />
        <FieldLabel style={{ marginTop: 14 }}>Preço de venda (R$)</FieldLabel>
        <DarkInput type="number" placeholder="0,00" value={preco} onChange={e => setPreco(e.target.value)} />
      </DarkCard>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <SectionLabel icon={<Plus size={13} />}>Ingredientes</SectionLabel>
          <button onClick={addItem} style={{ background: "#1f1f1f", border: "1px solid #3f3f3f", borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "#f97316", fontSize: 13, fontWeight: 700 }}>+ Adicionar</button>
        </div>
        {itens.map((it, idx) => {
          const ins = insumos.find(i => i.id === Number(it.insumoId));
          const c = ins && it.qtd ? ins.preco * parseFloat(it.qtd) : null;
          return (
            <div key={idx} style={{ background: "#141414", border: "1px solid #1f1f1f", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select value={it.insumoId} onChange={e => updItem(idx, "insumoId", e.target.value)}
                  style={{ flex: 1, background: "#1f1f1f", border: "1px solid #3f3f3f", borderRadius: 8, padding: "8px 10px", color: "#fafaf9", fontSize: 13 }}>
                  {insumos.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                </select>
                <button onClick={() => removeItem(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#57534e", display: "flex" }}><X size={15} /></button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <DarkInput type="number" placeholder="Quantidade" value={it.qtd} onChange={e => updItem(idx, "qtd", e.target.value)} style={{ flex: 1 }} />
                <span style={{ fontSize: 12, color: "#78716c", minWidth: 24 }}>{ins?.unidade}</span>
                {c !== null && <span style={{ fontSize: 13, fontWeight: 700, color: "#f97316", minWidth: 60, textAlign: "right", fontFamily: "monospace" }}>{R$(c)}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {custoPreview > 0 && (
        <div style={{ background: "#141414", border: "1px solid #1f1f1f", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "#78716c" }}>Custo de produção</span>
            <span style={{ fontWeight: 800, color: "#f97316", fontFamily: "monospace" }}>{R$(custoPreview)}</span>
          </div>
          {preco && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#78716c" }}>CMV</span>
                <span style={{ fontWeight: 700, color: cmvPreview <= META_CMV ? "#22c55e" : "#ef4444", fontFamily: "monospace" }}>{pct(cmvPreview)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#78716c" }}>Margem de lucro</span>
                <span style={{ fontWeight: 700, color: "#22c55e", fontFamily: "monospace" }}>{pct(margemPreview)}</span>
              </div>
              {cmvPreview > META_CMV && (
                <div style={{ marginTop: 10, background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#fca5a5", display: "flex", gap: 6, alignItems: "center" }}>
                  <AlertTriangle size={13} color="#ef4444" />
                  CMV acima da meta. Preço ideal mínimo: <strong style={{ color: "white" }}>{R$(custoPreview / (META_CMV / 100))}</strong>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <button onClick={salvar} style={{ width: "100%", background: "#f97316", color: "white", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
        <Check size={16} style={{ display: "inline", marginRight: 8, verticalAlign: "middle" }} />
        {editId ? "Salvar alterações" : "Criar lanche"}
      </button>
    </div>
  );

  return (
    <div>
      <button onClick={abrirNovo} style={{ width: "100%", background: "#f97316", color: "white", border: "none", borderRadius: 12, padding: "13px", fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
        <Plus size={16} /> Novo lanche
      </button>
      {lanches.length === 0 ? (
        <DarkCard style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🍔</div>
          <div style={{ color: "#78716c", fontWeight: 700 }}>Cardápio vazio</div>
        </DarkCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {lanches.map(l => {
            const custo = calcCusto(l);
            const cmv = l.precoVenda > 0 ? (custo / l.precoVenda) * 100 : 0;
            const margem = l.precoVenda > 0 ? ((l.precoVenda - custo) / l.precoVenda) * 100 : 0;
            const cmvC = cmv <= META_CMV ? "#22c55e" : cmv <= META_CMV + 8 ? "#f59e0b" : "#ef4444";
            const open = expandido === l.id;
            return (
              <DarkCard key={l.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#fafaf9" }}>{l.nome}</div>
                    <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
                      <MiniStat label="Custo" value={R$(custo)} />
                      <MiniStat label="Venda" value={R$(l.precoVenda)} color="#f97316" />
                      <MiniStat label="CMV" value={pct(cmv)} color={cmvC} />
                      <MiniStat label="Margem" value={pct(margem)} color="#22c55e" />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginLeft: 10 }}>
                    <IconBtn onClick={() => abrirEdicao(l)}><Edit3 size={14} /></IconBtn>
                    <IconBtn onClick={() => setLanches(p => p.filter(x => x.id !== l.id))} danger><Trash2 size={14} /></IconBtn>
                    <IconBtn onClick={() => setExpandido(open ? null : l.id)}>{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</IconBtn>
                  </div>
                </div>
                {open && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #1f1f1f" }}>
                    {l.itens.map((it, i) => {
                      const ins = insumos.find(x => x.id === it.insumoId);
                      if (!ins) return null;
                      const c = ins.preco * it.qtd;
                      const pctItem = custo > 0 ? (c / custo) * 100 : 0;
                      return (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#78716c", marginBottom: 8, alignItems: "center" }}>
                          <span style={{ flex: 1 }}>{ins.nome} × {it.qtd}{ins.unidade}</span>
                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <div style={{ width: 60, height: 3, background: "#1f1f1f", borderRadius: 999 }}>
                              <div style={{ height: 3, background: "#f97316", borderRadius: 999, width: `${pctItem}%` }} />
                            </div>
                            <span style={{ fontFamily: "monospace", color: "#d6d3d1", minWidth: 52, textAlign: "right" }}>{R$(c)}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, paddingTop: 10, borderTop: "1px solid #1f1f1f", marginTop: 4 }}>
                      <span style={{ color: "#78716c" }}>Total</span>
                      <span style={{ color: "#f97316", fontFamily: "monospace" }}>{R$(custo)}</span>
                    </div>
                  </div>
                )}
              </DarkCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TelaInsumos({ insumos, setInsumos }) {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [unidade, setUnidade] = useState("g");
  const [categoria, setCategoria] = useState(CATS[0]);
  const [editId, setEditId] = useState(null);
  const [editPreco, setEditPreco] = useState("");
  const [showHist, setShowHist] = useState(null);

  function adicionar() {
    if (!nome.trim() || !preco || parseFloat(preco) <= 0) return;
    setInsumos(p => [...p, {
      id: Date.now(), nome: nome.trim(), preco: parseFloat(preco),
      unidade, categoria,
      historico: [{ data: new Date().toISOString().slice(0, 10), preco: parseFloat(preco) }],
    }]);
    setNome(""); setPreco(""); setUnidade("g"); setCategoria(CATS[0]);
  }

  function salvarEdicao(id) {
    const v = parseFloat(editPreco);
    if (!v || v <= 0) return;
    const hoje = new Date().toISOString().slice(0, 10);
    setInsumos(p => p.map(i => {
      if (i.id !== id) return i;
      const hist = [...(i.historico || [])];
      if (hist[hist.length - 1]?.preco !== v) hist.push({ data: hoje, preco: v });
      return { ...i, preco: v, historico: hist };
    }));
    setEditId(null);
  }

  const porCat = useMemo(() => {
    const map = {};
    insumos.forEach(i => { if (!map[i.categoria]) map[i.categoria] = []; map[i.categoria].push(i); });
    return map;
  }, [insumos]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <DarkCard>
        <SectionLabel icon={<Plus size={13} />}>Novo insumo</SectionLabel>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <FieldLabel>Nome</FieldLabel>
            <DarkInput placeholder="Ex: Queijo Cheddar" value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 10 }}>
            <div>
              <FieldLabel>Preço por unidade (R$)</FieldLabel>
              <DarkInput type="number" step="0.001" placeholder="0,000" value={preco} onChange={e => setPreco(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Unidade</FieldLabel>
              <DarkSelect value={unidade} onChange={e => setUnidade(e.target.value)}>
                {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
              </DarkSelect>
            </div>
          </div>
          <div>
            <FieldLabel>Categoria</FieldLabel>
            <DarkSelect value={categoria} onChange={e => setCategoria(e.target.value)}>
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </DarkSelect>
          </div>
          {nome && preco > 0 && (
            <div style={{ background: "#1f1f1f", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#a8a29e" }}>
              {nome}: <strong style={{ color: "#f97316" }}>{R$(parseFloat(preco))}/{unidade}</strong>
            </div>
          )}
          <button onClick={adicionar} style={{ background: "#f97316", color: "white", border: "none", borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
            Adicionar insumo
          </button>
        </div>
      </DarkCard>

      {Object.entries(porCat).map(([cat, items]) => (
        <div key={cat}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#57534e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{cat}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map(ins => {
              const hist = ins.historico || [];
              const variacao = hist.length >= 2 ? ((hist[hist.length - 1].preco - hist[hist.length - 2].preco) / hist[hist.length - 2].preco) * 100 : null;
              const isEditing = editId === ins.id;
              const showH = showHist === ins.id;
              return (
                <DarkCard key={ins.id} style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#fafaf9" }}>{ins.nome}</div>
                      <div style={{ display: "flex", gap: 10, marginTop: 4, alignItems: "center" }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#f97316" }}>{R$(ins.preco)}/{ins.unidade}</span>
                        {variacao !== null && (
                          <span style={{ fontSize: 12, color: variacao > 0 ? "#ef4444" : "#22c55e", display: "flex", alignItems: "center", gap: 3 }}>
                            {variacao > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {pct(Math.abs(variacao))} na última compra
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {hist.length > 1 && (
                        <IconBtn onClick={() => setShowHist(showH ? null : ins.id)} title="Histórico">
                          <History size={14} />
                        </IconBtn>
                      )}
                      <IconBtn onClick={() => { setEditId(ins.id); setEditPreco(ins.preco); }}><Edit3 size={14} /></IconBtn>
                      <IconBtn danger onClick={() => setInsumos(p => p.filter(i => i.id !== ins.id))}><Trash2 size={14} /></IconBtn>
                    </div>
                  </div>

                  {isEditing && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1f1f1f" }}>
                      <FieldLabel>Novo preço por {ins.unidade}</FieldLabel>
                      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                        <DarkInput type="number" step="0.001" style={{ flex: 1 }} placeholder={ins.preco} value={editPreco} onChange={e => setEditPreco(e.target.value)} />
                        <button onClick={() => salvarEdicao(ins.id)} style={{ background: "#22c55e", border: "none", borderRadius: 8, padding: "0 14px", cursor: "pointer", color: "white", display: "flex", alignItems: "center" }}><Check size={15} /></button>
                        <button onClick={() => setEditId(null)} style={{ background: "#3f3f3f", border: "none", borderRadius: 8, padding: "0 12px", cursor: "pointer", color: "white", display: "flex", alignItems: "center" }}><X size={14} /></button>
                      </div>
                      {editPreco && ins.preco && (
                        <div style={{ marginTop: 8, fontSize: 12, color: parseFloat(editPreco) > ins.preco ? "#ef4444" : "#22c55e" }}>
                          Variação: {parseFloat(editPreco) > ins.preco ? "+" : ""}{pct(((parseFloat(editPreco) - ins.preco) / ins.preco) * 100)} em relação ao preço atual
                        </div>
                      )}
                    </div>
                  )}

                  {showH && hist.length > 1 && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1f1f1f" }}>
                      <FieldLabel>Histórico de preços</FieldLabel>
                      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                        {[...hist].reverse().map((h, i) => {
                          const prev = [...hist].reverse()[i + 1];
                          const diff = prev ? ((h.preco - prev.preco) / prev.preco) * 100 : null;
                          return (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                              <span style={{ color: "#78716c" }}>{h.data}</span>
                              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                {diff !== null && (
                                  <span style={{ fontSize: 11, color: diff > 0 ? "#ef4444" : "#22c55e", display: "flex", alignItems: "center", gap: 2 }}>
                                    {diff > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{pct(Math.abs(diff))}
                                  </span>
                                )}
                                <span style={{ fontFamily: "monospace", fontWeight: 700, color: i === 0 ? "#f97316" : "#d6d3d1" }}>{R$(h.preco)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </DarkCard>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function DarkCard({ children, style }) {
  return <div style={{ background: "#141414", border: "1px solid #1f1f1f", borderRadius: 16, padding: "18px 18px", ...style }}>{children}</div>;
}

function DarkInput({ style, ...props }) {
  return (
    <input {...props} style={{
      width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10,
      padding: "10px 12px", color: "#fafaf9", fontSize: 14, outline: "none", boxSizing: "border-box", ...style
    }}
      onFocus={e => e.target.style.borderColor = "#f97316"}
      onBlur={e => e.target.style.borderColor = "#2a2a2a"}
    />
  );
}

function DarkSelect({ children, style, ...props }) {
  return (
    <select {...props} style={{
      width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10,
      padding: "10px 12px", color: "#fafaf9", fontSize: 14, outline: "none", boxSizing: "border-box", ...style
    }}>
      {children}
    </select>
  );
}

function FieldLabel({ children, style }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: "#57534e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, ...style }}>{children}</div>;
}

function SectionLabel({ children, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#78716c", textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {icon && <span style={{ color: "#f97316" }}>{icon}</span>}
      {children}
    </div>
  );
}

function KPI({ label, value, sub, accent }) {
  return (
    <div style={{ background: "#141414", border: "1px solid #1f1f1f", borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#57534e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 900, color: accent, letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#57534e", marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function MiniStat({ label, value, color = "#78716c" }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#57534e", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color, fontFamily: "monospace", marginTop: 2 }}>{value}</div>
    </div>
  );
}

function IconBtn({ children, onClick, danger, title }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: h ? (danger ? "#450a0a" : "#1f1f1f") : "none", border: "none", borderRadius: 8, padding: "7px", cursor: "pointer", color: h ? (danger ? "#ef4444" : "#f97316") : "#57534e", display: "flex", transition: "all .12s" }}>
      {children}
    </button>
  );
}
