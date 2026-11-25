/**
 * KLEIN STORE — Front-end (Layout Arcadia Dark Crimson)
 * Consome /api/jogos (GET, POST, PUT, DELETE)
 */

const API_URL = "/api/jogos";
const API_FINANCAS = "/api/financas";
const API_AUTH = "/api/auth";

const state = {
  usuario: null,
  googleEnabled: false,
  authMode: "login", // login | register
  itens: [],
  financas: [],
  busca: "",
  filtroTab: "todos", // todos | estoque | vendidos
  finFiltroTipo: "todos", // todos | ENTRADA | SAIDA
  finFiltroCategoria: "todas",
  finCatMode: "SAIDA", // SAIDA | ENTRADA
  viewMode: "grid",   // grid | table
  activeNav: "dashboard",
};

const els = {
  authScreen: document.getElementById("auth-screen"),
  appLayout: document.getElementById("app-layout"),
  tabAuthLogin: document.getElementById("tab-auth-login"),
  tabAuthRegister: document.getElementById("tab-auth-register"),
  authNomeGroup: document.getElementById("auth-nome-group"),
  authNome: document.getElementById("auth-nome"),
  authEmail: document.getElementById("auth-email"),
  authSenha: document.getElementById("auth-senha"),
  authError: document.getElementById("auth-error"),
  btnAuthSubmit: document.getElementById("btn-auth-submit"),
  btnGoogleLogin: document.getElementById("btn-google-login"),
  formAuth: document.getElementById("form-auth"),
  profileAvatar: document.getElementById("profile-avatar"),
  profileName: document.getElementById("profile-name"),
  btnLogout: document.getElementById("btn-logout"),
  btnLogoutMobile: document.getElementById("btn-logout-mobile"),
  statusApi: document.getElementById("status-api"),
  inputBusca: document.getElementById("input-busca"),
  navCountAll: document.getElementById("nav-count-all"),
  navCountFinancas: document.getElementById("nav-count-financas"),
  sidebarTopProfits: document.getElementById("sidebar-top-profits"),
  heroSection: document.getElementById("dashboard-hero-section"),
  catalogSection: document.getElementById("catalog-section"),
  financasView: document.getElementById("financas-view"),
  statusFinancas: document.getElementById("status-financas"),
  btnNovaFinanca: document.getElementById("btn-nova-financa"),
  finSaldo: document.getElementById("fin-saldo"),
  finSaldoSub: document.getElementById("fin-saldo-sub"),
  finEntradas: document.getElementById("fin-entradas"),
  finEntradasSub: document.getElementById("fin-entradas-sub"),
  finSaidas: document.getElementById("fin-saidas"),
  finSaidasSub: document.getElementById("fin-saidas-sub"),
  finFiltroCategoria: document.getElementById("fin-filtro-categoria"),
  finEmptyState: document.getElementById("fin-empty-state"),
  finLista: document.getElementById("fin-lista"),
  finCategoriasResumo: document.getElementById("fin-categorias-resumo"),
  modalFinanca: document.getElementById("modal-financa"),
  modalFinancaTitle: document.getElementById("modal-financa-title"),
  formFinanca: document.getElementById("form-financa"),
  finInputId: document.getElementById("fin-input-id"),
  finInputTipo: document.getElementById("fin-input-tipo"),
  btnTipoEntrada: document.getElementById("btn-tipo-entrada"),
  btnTipoSaida: document.getElementById("btn-tipo-saida"),
  finInputDescricao: document.getElementById("fin-input-descricao"),
  finInputValor: document.getElementById("fin-input-valor"),
  finInputData: document.getElementById("fin-input-data"),
  finInputCategoria: document.getElementById("fin-input-categoria"),
  recoveryFill: document.getElementById("recovery-fill"),
  statRecoveryPct: document.getElementById("stat-recovery-pct"),
  statRecoverySub: document.getElementById("stat-recovery-sub"),
  statTotalJogosSub: document.getElementById("stat-total-jogos-sub"),
  statSoldSub: document.getElementById("stat-sold-sub"),
  statFaltaSub: document.getElementById("stat-falta-sub"),
  statTotalPreco: document.getElementById("stat-total-preco"),
  statTotalVenda: document.getElementById("stat-total-venda"),
  statLucro: document.getElementById("stat-lucro"),
  catalogTitle: document.getElementById("catalog-title"),
  tableCount: document.getElementById("table-count"),
  emptyState: document.getElementById("empty-state"),
  cardsGrid: document.getElementById("cards-grid"),
  tableWrapper: document.getElementById("table-wrapper"),
  jogosBody: document.getElementById("jogos-body"),
  btnNovoJogo: document.getElementById("btn-novo-jogo"),
  btnRecarregar: document.getElementById("btn-recarregar"),
  btnApiInfo: document.getElementById("btn-api-info"),
  btnViewGrid: document.getElementById("btn-view-grid"),
  btnViewTable: document.getElementById("btn-view-table"),
  modalJogo: document.getElementById("modal-jogo"),
  modalJogoTitle: document.getElementById("modal-jogo-title"),
  modalApi: document.getElementById("modal-api"),
  formJogo: document.getElementById("form-jogo"),
  inputId: document.getElementById("input-id"),
  inputIdLote: document.getElementById("input-id-lote"),
  inputNome: document.getElementById("input-nome"),
  inputValorPago: document.getElementById("input-valor-pago"),
  inputValorVenda: document.getElementById("input-valor-venda"),
  groupValorVenda: document.getElementById("group-valor-venda"),
  inputStatus: document.getElementById("input-status"),
  labelStatusText: document.getElementById("label-status-text"),
  inputImg: document.getElementById("input-img"),
  toastContainer: document.getElementById("toast-container"),
};

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatarMoeda(valor) {
  const num = Number(valor);
  return moeda.format(Number.isFinite(num) ? num : 0);
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "toast-error" : type === "success" ? "toast-success" : ""}`;
  toast.textContent = message;
  els.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function setStatus(label, statusType) {
  els.statusApi.className = `status-inline status-${statusType}`;
  els.statusApi.querySelector(".status-text").textContent = label;
}

function resolverCapa(imgUrl) {
  if (!imgUrl) return null;
  const steamMatch = imgUrl.match(/\/steam\/apps\/(\d+)\//i);
  if (steamMatch) {
    const appId = steamMatch[1];
    return {
      src: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900.jpg`,
      heroSrc: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
      fallback: imgUrl,
      portrait: true,
    };
  }
  return { src: imgUrl, heroSrc: imgUrl, fallback: "", portrait: false };
}

function atualizarLabelStatusModal() {
  els.labelStatusText.textContent = els.inputStatus.checked ? "Vendido" : "Em estoque";
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function carregarItens() {
  try {
    const dados = await apiRequest(API_URL);
    state.itens = Array.isArray(dados) ? dados : [];
    setStatus(`Online (${state.itens.length})`, "ok");
  } catch (err) {
    state.itens = [];
    setStatus(err.status === 404 ? "Sem /api/jogos" : `Erro ${err.message}`, "error");
  }
  renderTudo();
}

function renderTudo() {
  renderMetricas();
  renderSidebarTopProfits();
  renderCatalogo();
}

function renderMetricas() {
  const totalItens = state.itens.length;
  const vendidos = state.itens.filter((i) => Boolean(i.status));
  const estoque = state.itens.filter((i) => !i.status);

  const totalPago = state.itens.reduce((acc, i) => acc + (Number(i.valorPago) || 0), 0);
  const faturamento = vendidos.reduce((acc, i) => acc + (Number(i.valorVenda) || 0), 0);
  const lucroTotal = state.itens
    .filter((i) => i.valorVenda != null && i.valorVenda !== "")
    .reduce((acc, i) => acc + ((Number(i.valorVenda) || 0) - (Number(i.valorPago) || 0)), 0);

  const faltaRecuperar = Math.max(0, totalPago - faturamento);
  const pctRecuperado = totalPago > 0 ? Math.min(100, (faturamento / totalPago) * 100) : 0;
  const margemMedia = faturamento > 0 ? (lucroTotal / faturamento) * 100 : 0;

  els.navCountAll.textContent = String(totalItens);

  els.recoveryFill.style.width = `${pctRecuperado.toFixed(1)}%`;
  els.statRecoveryPct.textContent = `${pctRecuperado.toFixed(1)}%`;
  els.statRecoverySub.textContent =
    faltaRecuperar > 0 ? `Falta recuperar ${formatarMoeda(faltaRecuperar)}` : "100% do investimento recuperado!";

  els.statTotalJogosSub.textContent = `${totalItens} itens • ${estoque.length} em estoque`;
  els.statSoldSub.textContent = `${vendidos.length} vendas concluídas`;
  els.statFaltaSub.textContent = `Margem média de ${margemMedia.toFixed(1)}%`;

  els.statTotalPreco.textContent = formatarMoeda(totalPago);
  els.statTotalVenda.textContent = formatarMoeda(faturamento);
  els.statLucro.textContent = formatarMoeda(lucroTotal);
  els.statLucro.className = `kpi-value mono ${lucroTotal >= 0 ? "positive" : "negative"}`;
}

function renderSidebarTopProfits() {
  const comLucro = state.itens
    .filter((i) => i.valorVenda != null && i.valorVenda !== "")
    .map((i) => ({ ...i, lucro: (Number(i.valorVenda) || 0) - (Number(i.valorPago) || 0) }))
    .sort((a, b) => b.lucro - a.lucro)
    .slice(0, 5);

  els.sidebarTopProfits.innerHTML = "";
  comLucro.forEach((item) => {
    const capa = resolverCapa(item.img);
    const el = document.createElement("div");
    el.className = "mini-profit-item";
    el.innerHTML = `
      ${capa ? `<img class="mini-thumb" src="${escapeHtml(capa.src)}" alt="" loading="lazy" onerror="this.style.display='none'" />` : `<div class="mini-thumb"></div>`}
      <div class="mini-info">
        <span class="mini-name">${escapeHtml(item.nome)}</span>
        <span class="mini-sub">+${formatarMoeda(item.lucro)}</span>
      </div>
    `;
    el.addEventListener("click", () => abrirEdicao(item));
    els.sidebarTopProfits.appendChild(el);
  });
}

function getItensFiltrados() {
  const termo = state.busca.trim().toLowerCase();
  let lista = state.itens.filter((item) => {
    if (state.filtroTab === "estoque" && item.status) return false;
    if (state.filtroTab === "vendidos" && !item.status) return false;
    if (!termo) return true;
    const nome = String(item.nome ?? "").toLowerCase();
    const lote = String(item.idLote ?? "").toLowerCase();
    return nome.includes(termo) || lote.includes(termo);
  });

  if (state.filtroTab === "lucro") {
    lista = [...lista].sort((a, b) => {
      const la = a.valorVenda != null ? Number(a.valorVenda) - Number(a.valorPago) : -999999;
      const lb = b.valorVenda != null ? Number(b.valorVenda) - Number(b.valorPago) : -999999;
      return lb - la;
    });
  }
  return lista;
}

function renderCatalogo() {
  const lista = getItensFiltrados();
  els.tableCount.textContent = lista.length === 1 ? "1 jogo" : `${lista.length} jogos`;

  if (lista.length === 0) {
    els.emptyState.classList.remove("hidden");
    els.cardsGrid.classList.add("hidden");
    els.tableWrapper.classList.add("hidden");
    return;
  }

  els.emptyState.classList.add("hidden");

  if (state.viewMode === "grid") {
    els.cardsGrid.classList.remove("hidden");
    els.tableWrapper.classList.add("hidden");
    renderCardsGrid(lista);
  } else {
    els.cardsGrid.classList.add("hidden");
    els.tableWrapper.classList.remove("hidden");
    renderTableView(lista);
  }
}

function renderCardsGrid(lista) {
  els.cardsGrid.innerHTML = "";
  lista.forEach((item) => {
    const valorPago = Number(item.valorPago) || 0;
    const temVenda = item.valorVenda != null && item.valorVenda !== "";
    const valorVenda = temVenda ? Number(item.valorVenda) : null;
    const lucro = temVenda ? valorVenda - valorPago : null;
    const vendido = Boolean(item.status);
    const capa = resolverCapa(item.img ? String(item.img).trim() : "");

    const imgHtml = capa
      ? `<img
           class="${capa.portrait ? "portrait-cover" : ""}"
           src="${escapeHtml(capa.src)}"
           alt="${escapeHtml(item.nome)}"
           loading="lazy"
           onerror="${capa.fallback ? `this.onerror=null;this.classList.remove('portrait-cover');this.src='${escapeHtml(capa.fallback)}'` : `this.style.display='none'`}"
         />`
      : "";

    const lucroHtml = temVenda
      ? `<span class="profit-pill mono ${lucro >= 0 ? "positive" : "negative"}">${lucro > 0 ? "+" : ""}${formatarMoeda(lucro)}</span>`
      : `<span class="mono" style="font-size:11.5px;color:var(--text-muted)">Sem venda</span>`;

    const card = document.createElement("article");
    card.className = "game-card";
    card.innerHTML = `
      <div class="game-card-cover">
        ${imgHtml}
        <span class="card-lote-tag mono">#${escapeHtml(item.idLote ?? "-")}</span>
        <label class="card-status-chip ${vendido ? "sold" : "stock"}">
          <input type="checkbox" ${vendido ? "checked" : ""} />
          <span>${vendido ? "Vendido" : "Estoque"}</span>
        </label>
      </div>
      <div class="game-card-body">
        <h4 class="game-card-title" title="${escapeHtml(item.nome)}">${escapeHtml(item.nome)}</h4>
        <div class="game-card-prices">
          <span>Pago <strong class="mono">${formatarMoeda(valorPago)}</strong></span>
          <span>Venda <strong class="mono">${temVenda ? formatarMoeda(valorVenda) : "—"}</strong></span>
        </div>
        <div class="game-card-footer">
          ${lucroHtml}
          <div class="card-actions">
            <button class="btn-mini btn-edit" type="button">Editar</button>
            <button class="btn-mini danger btn-delete" type="button">✕</button>
          </div>
        </div>
      </div>
    `;

    card.querySelector('.card-status-chip input').addEventListener("change", (e) => {
      alternarStatus(item, e.target.checked);
    });
    card.querySelector(".btn-edit").addEventListener("click", () => abrirEdicao(item));
    card.querySelector(".btn-delete").addEventListener("click", () => excluirItem(item));
    els.cardsGrid.appendChild(card);
  });
}

function renderTableView(lista) {
  els.jogosBody.innerHTML = "";
  lista.forEach((item) => {
    const valorPago = Number(item.valorPago) || 0;
    const temVenda = item.valorVenda != null && item.valorVenda !== "";
    const valorVenda = temVenda ? Number(item.valorVenda) : null;
    const lucro = temVenda ? valorVenda - valorPago : null;
    const vendido = Boolean(item.status);
    const capa = resolverCapa(item.img ? String(item.img).trim() : "");

    const thumbHtml = capa
      ? `<div class="game-case">
           <img
             class="${capa.portrait ? "portrait-cover" : ""}"
             src="${escapeHtml(capa.src)}"
             alt="${escapeHtml(item.nome)}"
             loading="lazy"
             onerror="${capa.fallback ? `this.onerror=null;this.classList.remove('portrait-cover');this.src='${escapeHtml(capa.fallback)}'` : `this.style.display='none'`}"
           />
         </div>`
      : `<div class="game-case"></div>`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="col-lote"><span class="lote-badge mono">#${escapeHtml(item.idLote ?? "-")}</span></td>
      <td class="col-nome">
        <div class="item-cell">${thumbHtml}<span>${escapeHtml(item.nome)}</span></div>
      </td>
      <td class="col-money mono">${formatarMoeda(valorPago)}</td>
      <td class="col-money mono">${temVenda ? formatarMoeda(valorVenda) : '<span style="color:var(--text-muted)">—</span>'}</td>
      <td class="col-money">
        ${temVenda
          ? `<span class="profit-pill mono ${lucro >= 0 ? "positive" : "negative"}">${lucro > 0 ? "+" : ""}${formatarMoeda(lucro)}</span>`
          : '<span style="color:var(--text-muted)">—</span>'}
      </td>
      <td class="col-status">
        <label class="status-toggle ${vendido ? "sold" : "stock"}">
          <input type="checkbox" ${vendido ? "checked" : ""} />
          <span>${vendido ? "Vendido" : "Em estoque"}</span>
        </label>
      </td>
      <td class="col-actions">
        <div class="actions-cell">
          <button class="btn-mini btn-edit" type="button">Editar</button>
          <button class="btn-mini danger btn-delete" type="button">Excluir</button>
        </div>
      </td>
    `;

    tr.querySelector('.status-toggle input').addEventListener("change", (e) => {
      alternarStatus(item, e.target.checked);
    });
    tr.querySelector(".btn-edit").addEventListener("click", () => abrirEdicao(item));
    tr.querySelector(".btn-delete").addEventListener("click", () => excluirItem(item));
    els.jogosBody.appendChild(tr);
  });
}

// Navegação lateral e abas
function aplicarNavegacao(nav) {
  state.activeNav = nav;
  document.querySelectorAll(".nav-item, .mobile-nav-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.nav === nav)
  );

  const isFinancas = nav === "financas";
  const showDashboard = nav === "dashboard";

  els.heroSection.classList.toggle("hidden", !showDashboard);
  els.catalogSection.classList.toggle("hidden", isFinancas);
  els.financasView.classList.toggle("hidden", !isFinancas);

  if (isFinancas) {
    carregarFinancas();
  }
}

function setFiltroTab(tab) {
  state.filtroTab = tab;
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.filter === tab));
  renderCatalogo();
}

function setViewMode(mode) {
  state.viewMode = mode;
  els.btnViewGrid.classList.toggle("active", mode === "grid");
  els.btnViewTable.classList.toggle("active", mode === "table");
  renderCatalogo();
}

// Modais e CRUD
function abrirCriacao() {
  els.modalJogoTitle.textContent = "Novo Item";
  els.inputId.value = "";
  els.inputIdLote.value = "1";
  els.inputNome.value = "";
  els.inputValorPago.value = "";
  els.inputValorVenda.value = "";
  els.inputStatus.checked = false;
  els.inputImg.value = "";
  els.groupValorVenda.classList.add("hidden");
  atualizarLabelStatusModal();
  els.modalJogo.classList.remove("hidden");
  setTimeout(() => els.inputNome.focus(), 30);
}

function abrirEdicao(item) {
  els.modalJogoTitle.textContent = "Editar Item";
  els.inputId.value = item.id ?? "";
  els.inputIdLote.value = item.idLote ?? "";
  els.inputNome.value = item.nome ?? "";
  els.inputValorPago.value = item.valorPago ?? "";
  els.inputValorVenda.value = item.valorVenda ?? "";
  els.inputStatus.checked = Boolean(item.status);
  els.inputImg.value = item.img ?? "";
  els.groupValorVenda.classList.remove("hidden");
  atualizarLabelStatusModal();
  els.modalJogo.classList.remove("hidden");
  setTimeout(() => els.inputValorVenda.focus(), 30);
}

function fecharModais() {
  els.modalJogo.classList.add("hidden");
  els.modalFinanca.classList.add("hidden");
  els.modalApi.classList.add("hidden");
}

async function salvarItem(payload, id) {
  const isEdit = Boolean(id);
  const url = isEdit ? `${API_URL}/${id}` : API_URL;
  const method = isEdit ? "PUT" : "POST";

  try {
    await apiRequest(url, { method, body: JSON.stringify(payload) });
    showToast(isEdit ? "Item atualizado!" : "Item cadastrado!", "success");
    fecharModais();
    await carregarItens();
  } catch (err) {
    showToast(`Erro ao salvar (${err.message})`, "error");
  }
}

async function alternarStatus(item, novoStatus) {
  const payload = {
    idLote: item.idLote,
    nome: item.nome,
    valorPago: item.valorPago,
    valorVenda: item.valorVenda,
    status: novoStatus,
    img: item.img ?? "",
  };
  try {
    await apiRequest(`${API_URL}/${item.id}`, { method: "PUT", body: JSON.stringify(payload) });
    showToast(novoStatus ? `"${item.nome}" marcado como vendido.` : `"${item.nome}" voltou ao estoque.`, "success");
    await carregarItens();
  } catch (err) {
    showToast(`Erro ao atualizar status (${err.message})`, "error");
    await carregarItens();
  }
}

async function excluirItem(item) {
  if (!confirm(`Deseja excluir "${item.nome}"?`)) return;
  try {
    await apiRequest(`${API_URL}/${item.id}`, { method: "DELETE" });
    showToast(`"${item.nome}" removido.`, "success");
    await carregarItens();
  } catch (err) {
    showToast(`Erro ao excluir (${err.message})`, "error");
  }
}

// Eventos
document.querySelectorAll(".nav-item, .mobile-nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => aplicarNavegacao(btn.dataset.nav));
});

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => setFiltroTab(btn.dataset.filter));
});

els.btnViewGrid.addEventListener("click", () => setViewMode("grid"));
els.btnViewTable.addEventListener("click", () => setViewMode("table"));
els.btnNovoJogo.addEventListener("click", abrirCriacao);
els.btnRecarregar.addEventListener("click", () => {
  carregarItens();
  carregarFinancas();
});
els.btnApiInfo.addEventListener("click", () => els.modalApi.classList.remove("hidden"));
els.inputStatus.addEventListener("change", atualizarLabelStatusModal);

els.inputBusca.addEventListener("input", (e) => {
  state.busca = e.target.value;
  if (state.activeNav === "financas") renderFinancas();
  else renderCatalogo();
});

document.querySelectorAll("[data-close-modal]").forEach((btn) => {
  btn.addEventListener("click", fecharModais);
});

[els.modalJogo, els.modalApi].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharModais();
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fecharModais();
});

els.formJogo.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = els.inputId.value.trim();
  const rawVenda = els.inputValorVenda.value.trim();
  const valorVenda = id && rawVenda !== "" ? Number(rawVenda) : null;
  const payload = {
    idLote: Number(els.inputIdLote.value),
    nome: els.inputNome.value.trim(),
    valorPago: Number(els.inputValorPago.value),
    valorVenda,
    status: els.inputStatus.checked,
    img: els.inputImg.value.trim(),
  };
  await salvarItem(payload, id);
});

// ================= MÓDULO FINANÇAS (/api/financas) =================
function setStatusFinancas(texto, tipo) {
  els.statusFinancas.textContent = texto;
  els.statusFinancas.className = `financas-status ${tipo}`;
}

function formatarDataBr(isoDate) {
  if (!isoDate) return "—";
  const partes = String(isoDate).split("-");
  if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
  return String(isoDate);
}

async function carregarFinancas() {
  try {
    const dados = await apiRequest(API_FINANCAS);
    state.financas = Array.isArray(dados) ? dados : [];
    setStatusFinancas(`Conectado (${state.financas.length})`, "ok");
  } catch (err) {
    state.financas = [];
    setStatusFinancas(
      err.status === 404 ? "Falta criar /api/financas" : `Erro (${err.message})`,
      err.status === 404 ? "pending" : "error"
    );
  }
  renderFinancas();
}

function renderFinancas() {
  els.navCountFinancas.textContent = String(state.financas.length);

  const entradas = state.financas.filter((f) => String(f.tipo).toUpperCase() === "ENTRADA");
  const saidas = state.financas.filter((f) => String(f.tipo).toUpperCase() === "SAIDA");

  const totalEntradas = entradas.reduce((acc, f) => acc + (Number(f.valor) || 0), 0);
  const totalSaidas = saidas.reduce((acc, f) => acc + (Number(f.valor) || 0), 0);
  const saldo = totalEntradas - totalSaidas;

  els.finSaldo.textContent = formatarMoeda(saldo);
  els.finSaldo.className = `kpi-value mono ${saldo >= 0 ? "positive" : "negative"}`;
  els.finSaldoSub.textContent = saldo >= 0 ? "Saldo positivo" : "Gastos acima dos ganhos";

  els.finEntradas.textContent = formatarMoeda(totalEntradas);
  els.finEntradasSub.textContent = `${entradas.length} entrada(s) registrada(s)`;

  els.finSaidas.textContent = formatarMoeda(totalSaidas);
  els.finSaidasSub.textContent = `${saidas.length} gasto(s) registrado(s)`;

  // Atualiza select de categorias
  const categoriasUnicas = [...new Set(state.financas.map((f) => f.categoria).filter(Boolean))].sort();
  const prevCat = state.finFiltroCategoria;
  els.finFiltroCategoria.innerHTML = `<option value="todas">Todas as categorias</option>`;
  categoriasUnicas.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    els.finFiltroCategoria.appendChild(opt);
  });
  els.finFiltroCategoria.value = categoriasUnicas.includes(prevCat) ? prevCat : "todas";
  state.finFiltroCategoria = els.finFiltroCategoria.value;

  // Filtra lançamentos
  const termo = state.busca.trim().toLowerCase();
  const filtrados = state.financas
    .filter((f) => {
      if (state.finFiltroTipo !== "todos" && String(f.tipo).toUpperCase() !== state.finFiltroTipo) return false;
      if (state.finFiltroCategoria !== "todas" && f.categoria !== state.finFiltroCategoria) return false;
      if (!termo) return true;
      return (
        String(f.descricao ?? "").toLowerCase().includes(termo) ||
        String(f.categoria ?? "").toLowerCase().includes(termo)
      );
    })
    .sort((a, b) => String(b.data ?? "").localeCompare(String(a.data ?? "")));

  els.finLista.innerHTML = "";
  if (filtrados.length === 0) {
    els.finEmptyState.classList.remove("hidden");
  } else {
    els.finEmptyState.classList.add("hidden");
    filtrados.forEach((item) => {
      const isEntrada = String(item.tipo).toUpperCase() === "ENTRADA";
      const row = document.createElement("div");
      row.className = "fin-row";
      row.innerHTML = `
        <div class="fin-dir-icon ${isEntrada ? "entrada" : "saida"}">${isEntrada ? "↑" : "↓"}</div>
        <div class="fin-row-info">
          <span class="fin-row-desc">${escapeHtml(item.descricao)}</span>
          <div class="fin-row-meta">
            <span class="fin-cat-chip">${escapeHtml(item.categoria || "Sem categoria")}</span>
            <span>${formatarDataBr(item.data)}</span>
          </div>
        </div>
        <strong class="fin-row-value mono ${isEntrada ? "positive" : "negative"}">
          ${isEntrada ? "+" : "-"}${formatarMoeda(item.valor)}
        </strong>
        <div class="card-actions">
          <button class="btn-mini btn-edit" type="button">Editar</button>
          <button class="btn-mini danger btn-delete" type="button">✕</button>
        </div>
      `;
      row.querySelector(".btn-edit").addEventListener("click", () => abrirEdicaoFinanca(item));
      row.querySelector(".btn-delete").addEventListener("click", () => excluirFinanca(item));
      els.finLista.appendChild(row);
    });
  }

  // Resumo por categoria
  const grupo = state.financas.filter((f) => String(f.tipo).toUpperCase() === state.finCatMode);
  const totalGrupo = grupo.reduce((acc, f) => acc + (Number(f.valor) || 0), 0);
  const mapa = new Map();
  grupo.forEach((f) => {
    const cat = f.categoria || "Outros";
    mapa.set(cat, (mapa.get(cat) || 0) + (Number(f.valor) || 0));
  });

  const ordenado = [...mapa.entries()].sort((a, b) => b[1] - a[1]);
  els.finCategoriasResumo.innerHTML = "";
  if (ordenado.length === 0) {
    els.finCategoriasResumo.innerHTML = `<div class="cat-empty">Nenhum registro de ${state.finCatMode === "SAIDA" ? "gastos" : "ganhos"} ainda.</div>`;
  } else {
    ordenado.forEach(([cat, val]) => {
      const pct = totalGrupo > 0 ? (val / totalGrupo) * 100 : 0;
      const el = document.createElement("div");
      el.className = "cat-bar-item";
      el.innerHTML = `
        <div class="cat-bar-head">
          <span class="cat-bar-name">${escapeHtml(cat)}</span>
          <span class="cat-bar-val mono">${formatarMoeda(val)} (${pct.toFixed(0)}%)</span>
        </div>
        <div class="cat-bar-track">
          <div class="cat-bar-fill ${state.finCatMode === "SAIDA" ? "saida" : "entrada"}" style="width: ${pct.toFixed(1)}%"></div>
        </div>
      `;
      els.finCategoriasResumo.appendChild(el);
    });
  }
}

function setTipoModalFinanca(tipo) {
  els.finInputTipo.value = tipo;
  els.btnTipoEntrada.className = `tipo-option ${tipo === "ENTRADA" ? "active-entrada" : ""}`;
  els.btnTipoSaida.className = `tipo-option ${tipo === "SAIDA" ? "active-saida" : ""}`;
}

function abrirCriacaoFinanca() {
  els.modalFinancaTitle.textContent = "Novo Lançamento";
  els.finInputId.value = "";
  els.finInputDescricao.value = "";
  els.finInputValor.value = "";
  els.finInputData.value = new Date().toISOString().slice(0, 10);
  els.finInputCategoria.value = "Salário";
  setTipoModalFinanca("ENTRADA");
  els.modalFinanca.classList.remove("hidden");
  setTimeout(() => els.finInputDescricao.focus(), 30);
}

function abrirEdicaoFinanca(item) {
  els.modalFinancaTitle.textContent = "Editar Lançamento";
  els.finInputId.value = item.id ?? "";
  els.finInputDescricao.value = item.descricao ?? "";
  els.finInputValor.value = item.valor ?? "";
  els.finInputData.value = item.data ?? new Date().toISOString().slice(0, 10);
  els.finInputCategoria.value = item.categoria ?? "Outros";
  setTipoModalFinanca(String(item.tipo || "ENTRADA").toUpperCase());
  els.modalFinanca.classList.remove("hidden");
  setTimeout(() => els.finInputDescricao.focus(), 30);
}

async function salvarFinanca(payload, id) {
  const isEdit = Boolean(id);
  const url = isEdit ? `${API_FINANCAS}/${id}` : API_FINANCAS;
  const method = isEdit ? "PUT" : "POST";
  try {
    await apiRequest(url, { method, body: JSON.stringify(payload) });
    showToast(isEdit ? "Lançamento atualizado!" : "Lançamento salvo!", "success");
    fecharModais();
    await carregarFinancas();
  } catch (err) {
    showToast(`Erro ao salvar (${method} ${url} → ${err.message})`, "error");
  }
}

async function excluirFinanca(item) {
  if (!confirm(`Deseja excluir "${item.descricao}"?`)) return;
  try {
    await apiRequest(`${API_FINANCAS}/${item.id}`, { method: "DELETE" });
    showToast(`"${item.descricao}" removido.`, "success");
    await carregarFinancas();
  } catch (err) {
    showToast(`Erro ao excluir (${err.message})`, "error");
  }
}

// Eventos Finanças
els.btnNovaFinanca.addEventListener("click", abrirCriacaoFinanca);
els.btnTipoEntrada.addEventListener("click", () => {
  setTipoModalFinanca("ENTRADA");
  if (["Alimentação", "Moradia", "Contas Fixas", "Transporte", "Lazer", "Saúde", "Compras"].includes(els.finInputCategoria.value)) {
    els.finInputCategoria.value = "Salário";
  }
});
els.btnTipoSaida.addEventListener("click", () => {
  setTipoModalFinanca("SAIDA");
  if (["Salário", "Renda Extra", "Vendas de Jogos"].includes(els.finInputCategoria.value)) {
    els.finInputCategoria.value = "Alimentação";
  }
});

document.querySelectorAll(".fin-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.finFiltroTipo = btn.dataset.finFilter;
    document.querySelectorAll(".fin-tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
    renderFinancas();
  });
});

document.querySelectorAll(".cat-mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.finCatMode = btn.dataset.catMode;
    document.querySelectorAll(".cat-mode-btn").forEach((b) => b.classList.toggle("active", b === btn));
    renderFinancas();
  });
});

els.finFiltroCategoria.addEventListener("change", (e) => {
  state.finFiltroCategoria = e.target.value;
  renderFinancas();
});

els.formFinanca.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = els.finInputId.value.trim();
  const payload = {
    descricao: els.finInputDescricao.value.trim(),
    valor: Number(els.finInputValor.value),
    tipo: els.finInputTipo.value,
    categoria: els.finInputCategoria.value,
    data: els.finInputData.value,
  };
  await salvarFinanca(payload, id);
});

els.modalFinanca.addEventListener("click", (e) => {
  if (e.target === els.modalFinanca) fecharModais();
});

// ================= AUTENTICAÇÃO (Login, Cadastro e Google) =================
function setAuthMode(mode) {
  state.authMode = mode;
  const isRegister = mode === "register";
  els.tabAuthLogin.classList.toggle("active", !isRegister);
  els.tabAuthRegister.classList.toggle("active", isRegister);
  els.authNomeGroup.classList.toggle("hidden", !isRegister);
  els.authNome.required = isRegister;
  els.authSenha.autocomplete = isRegister ? "new-password" : "current-password";
  els.btnAuthSubmit.textContent = isRegister ? "Criar Conta Grátis" : "Entrar na Conta";
  els.authError.classList.add("hidden");
}

function mostrarErroAuth(msg) {
  els.authError.textContent = msg;
  els.authError.classList.remove("hidden");
}

function atualizarPerfilUI(user) {
  els.profileName.textContent = user.nome || user.email;
  if (user.fotoUrl) {
    els.profileAvatar.innerHTML = `<img src="${escapeHtml(user.fotoUrl)}" alt="" />`;
  } else {
    const iniciais = (user.nome || user.email || "KS")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("");
    els.profileAvatar.textContent = iniciais || "KS";
  }
}

function mostrarApp(user) {
  state.usuario = user;
  atualizarPerfilUI(user);
  els.authScreen.classList.add("hidden");
  els.appLayout.classList.remove("hidden");
  carregarItens();
  carregarFinancas();
}

function mostrarLogin() {
  state.usuario = null;
  state.itens = [];
  state.financas = [];
  els.appLayout.classList.add("hidden");
  els.authScreen.classList.remove("hidden");
}

async function verificarSessao() {
  try {
    const cfg = await apiRequest(`${API_AUTH}/config`);
    state.googleEnabled = Boolean(cfg && cfg.googleEnabled);
  } catch {
    state.googleEnabled = false;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("authError")) {
    mostrarErroAuth("Não foi possível entrar com o Google. Verifique as credenciais ou use e-mail e senha.");
    window.history.replaceState({}, "", "/");
  }

  try {
    const user = await apiRequest(`${API_AUTH}/me`);
    mostrarApp(user);
  } catch {
    mostrarLogin();
  }
}

async function fazerLogout() {
  try {
    await apiRequest(`${API_AUTH}/logout`, { method: "POST" });
  } catch {}
  mostrarLogin();
  showToast("Você saiu da sua conta.", "info");
}

els.tabAuthLogin.addEventListener("click", () => setAuthMode("login"));
els.tabAuthRegister.addEventListener("click", () => setAuthMode("register"));

els.btnGoogleLogin.addEventListener("click", () => {
  if (!state.googleEnabled) {
    mostrarErroAuth(
      "Login com Google ainda precisa das chaves GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET configuradas. Por enquanto, entre com seu e-mail e senha abaixo!"
    );
    return;
  }
  window.location.href = "/oauth2/authorization/google";
});

els.formAuth.addEventListener("submit", async (e) => {
  e.preventDefault();
  els.authError.classList.add("hidden");
  const isRegister = state.authMode === "register";
  const endpoint = isRegister ? `${API_AUTH}/register` : `${API_AUTH}/login`;
  const payload = isRegister
    ? {
        nome: els.authNome.value.trim(),
        email: els.authEmail.value.trim(),
        senha: els.authSenha.value,
      }
    : {
        email: els.authEmail.value.trim(),
        senha: els.authSenha.value,
      };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      mostrarErroAuth(data.erro || "Erro ao autenticar.");
      return;
    }
    els.authSenha.value = "";
    mostrarApp(data);
    showToast(isRegister ? `Bem-vindo, ${data.nome}!` : `Olá, ${data.nome}!`, "success");
  } catch {
    mostrarErroAuth("Não foi possível conectar ao servidor.");
  }
});

els.btnLogout.addEventListener("click", fazerLogout);
els.btnLogoutMobile.addEventListener("click", fazerLogout);

// Inicializa verificando se o usuário já está logado
verificarSessao();
