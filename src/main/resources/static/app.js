/**
 * Front-end — GameVault (CRUD de ItemCadastrado)
 *
 * Endpoints esperados no back-end Spring Boot:
 *   GET    /api/jogos        -> lista todos os itens
 *   POST   /api/jogos        -> cria um novo item
 *   PUT    /api/jogos/{id}   -> atualiza um item existente (inclusive status)
 *   DELETE /api/jogos/{id}   -> exclui um item pelo ID
 *
 * Formato JSON alinhado com ItemCadastrado:
 *   {
 *     "id": 1,
 *     "idLote": 10,
 *     "nome": "Elden Ring",
 *     "valorPago": 150.00,
 *     "valorVenda": 220.00,
 *     "status": false,
 *     "img": "https://exemplo.com/capa.jpg"
 *   }
 */

const API_URL = "/api/jogos";

const state = {
  itens: [],
  filtro: "",
};

const els = {
  jogosBody: document.getElementById("jogos-body"),
  emptyState: document.getElementById("empty-state"),
  tableWrapper: document.getElementById("table-wrapper"),
  statusApi: document.getElementById("status-api"),
  tableCount: document.getElementById("table-count"),
  inputBusca: document.getElementById("input-busca"),
  statTotalJogos: document.getElementById("stat-total-jogos"),
  statTotalPreco: document.getElementById("stat-total-preco"),
  statTotalVenda: document.getElementById("stat-total-venda"),
  statLucro: document.getElementById("stat-lucro"),
  btnNovoJogo: document.getElementById("btn-novo-jogo"),
  btnRecarregar: document.getElementById("btn-recarregar"),
  btnApiInfo: document.getElementById("btn-api-info"),
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
  els.statusApi.className = `status-pill status-${statusType}`;
  els.statusApi.querySelector(".status-text").textContent = label;
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
    setStatus(`Conectado (${state.itens.length})`, "ok");
  } catch (err) {
    state.itens = [];
    if (err.status === 404) {
      setStatus("Falta GET /api/jogos", "pending");
    } else {
      setStatus(`Erro (${err.message})`, "error");
    }
  }
  renderTabela();
}

function resolverCapa(imgUrl) {
  if (!imgUrl) return null;
  const steamMatch = imgUrl.match(/\/steam\/apps\/(\d+)\//i);
  if (steamMatch) {
    const appId = steamMatch[1];
    return {
      src: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900.jpg`,
      fallback: imgUrl,
      portrait: true,
    };
  }
  return { src: imgUrl, fallback: "", portrait: false };
}

function renderTabela() {
  const termo = state.filtro.trim().toLowerCase();
  const filtrados = state.itens.filter((item) => {
    if (!termo) return true;
    const nome = String(item.nome ?? "").toLowerCase();
    const lote = String(item.idLote ?? "").toLowerCase();
    return nome.includes(termo) || lote.includes(termo);
  });

  const totalPago = state.itens.reduce((acc, item) => acc + (Number(item.valorPago) || 0), 0);
  const totalVendido = state.itens
    .filter((item) => Boolean(item.status) && item.valorVenda != null)
    .reduce((acc, item) => acc + (Number(item.valorVenda) || 0), 0);
  const lucroTotal = state.itens
    .filter((item) => item.valorVenda != null)
    .reduce(
      (acc, item) => acc + ((Number(item.valorVenda) || 0) - (Number(item.valorPago) || 0)),
      0
    );

  els.statTotalJogos.textContent = String(state.itens.length);
  els.statTotalPreco.textContent = formatarMoeda(totalPago);
  els.statTotalVenda.textContent = formatarMoeda(totalVendido);
  els.statLucro.textContent = formatarMoeda(lucroTotal);
  els.statLucro.className = `summary-value mono ${lucroTotal >= 0 ? "positive" : "negative"}`;

  els.tableCount.textContent =
    filtrados.length === 1 ? "1 registro" : `${filtrados.length} registros`;

  if (state.itens.length === 0) {
    els.emptyState.classList.remove("hidden");
    els.tableWrapper.classList.add("hidden");
    return;
  }

  els.emptyState.classList.add("hidden");
  els.tableWrapper.classList.remove("hidden");
  els.jogosBody.innerHTML = "";

  filtrados.forEach((item) => {
    const valorPago = Number(item.valorPago) || 0;
    const temVenda = item.valorVenda != null && item.valorVenda !== "";
    const valorVenda = temVenda ? Number(item.valorVenda) : null;
    const lucro = temVenda ? valorVenda - valorPago : null;
    const sinal = lucro != null && lucro > 0 ? "+" : "";
    const vendido = Boolean(item.status);
    const imgUrl = item.img ? String(item.img).trim() : "";

    const capa = resolverCapa(imgUrl);
    const thumbHtml = capa
      ? `<div class="game-case">
           <img
             class="item-thumb ${capa.portrait ? "portrait-cover" : ""}"
             src="${escapeHtml(capa.src)}"
             alt="${escapeHtml(item.nome)}"
             loading="lazy"
             onerror="${capa.fallback ? `this.onerror=null;this.classList.remove('portrait-cover');this.src='${escapeHtml(capa.fallback)}'` : `this.style.display='none'`}"
           />
         </div>`
      : `<div class="item-thumb-placeholder" aria-hidden="true">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
             <rect x="2" y="6" width="20" height="12" rx="4" />
             <path d="M6 12h4" /><path d="M8 10v4" />
           </svg>
         </div>`;

    const vendaHtml = temVenda ? formatarMoeda(valorVenda) : `<span style="color: var(--text-muted)">—</span>`;
    const lucroHtml = temVenda
      ? `<span class="profit-pill mono ${lucro >= 0 ? "positive" : "negative"}">${sinal}${formatarMoeda(lucro)}</span>`
      : `<span style="color: var(--text-muted)">—</span>`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="col-lote"><span class="lote-badge mono">#${escapeHtml(item.idLote ?? "-")}</span></td>
      <td class="col-nome">
        <div class="item-cell">
          ${thumbHtml}
          <span>${escapeHtml(item.nome)}</span>
        </div>
      </td>
      <td class="col-money mono">${formatarMoeda(valorPago)}</td>
      <td class="col-money mono">${vendaHtml}</td>
      <td class="col-money">${lucroHtml}</td>
      <td class="col-status">
        <label class="status-toggle ${vendido ? "sold" : "stock"}">
          <input type="checkbox" ${vendido ? "checked" : ""} />
          <span>${vendido ? "Vendido" : "Em estoque"}</span>
        </label>
      </td>
      <td class="col-actions">
        <div class="actions-cell">
          <button class="btn btn-action btn-edit" type="button">Editar</button>
          <button class="btn btn-action btn-delete" type="button">Excluir</button>
        </div>
      </td>
    `;

    tr.querySelector('.status-toggle input[type="checkbox"]').addEventListener("change", (e) => {
      alternarStatus(item, e.target.checked);
    });
    tr.querySelector(".btn-edit").addEventListener("click", () => abrirEdicao(item));
    tr.querySelector(".btn-delete").addEventListener("click", () => excluirItem(item));
    els.jogosBody.appendChild(tr);
  });
}

function abrirCriacao() {
  els.modalJogoTitle.textContent = "Novo Item";
  els.inputId.value = "";
  els.inputIdLote.value = "";
  els.inputNome.value = "";
  els.inputValorPago.value = "";
  els.inputValorVenda.value = "";
  els.inputStatus.checked = false;
  els.inputImg.value = "";
  els.groupValorVenda.classList.add("hidden");
  atualizarLabelStatusModal();
  els.modalJogo.classList.remove("hidden");
  setTimeout(() => els.inputIdLote.focus(), 30);
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
  setTimeout(() => els.inputNome.focus(), 30);
}

function fecharModais() {
  els.modalJogo.classList.add("hidden");
  els.modalApi.classList.add("hidden");
}

async function salvarItem(payload, id) {
  const isEdit = Boolean(id);
  const url = isEdit ? `${API_URL}/${id}` : API_URL;
  const method = isEdit ? "PUT" : "POST";

  try {
    await apiRequest(url, {
      method,
      body: JSON.stringify(payload),
    });
    showToast(isEdit ? "Item atualizado com sucesso." : "Item cadastrado com sucesso.", "success");
    fecharModais();
    await carregarItens();
  } catch (err) {
    showToast(`Erro ao salvar (${method} ${url} → ${err.message})`, "error");
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
    await apiRequest(`${API_URL}/${item.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    showToast(novoStatus ? `"${item.nome}" marcado como vendido.` : `"${item.nome}" voltou para o estoque.`, "success");
    await carregarItens();
  } catch (err) {
    showToast(`Erro ao atualizar status (PUT ${API_URL}/${item.id} → ${err.message})`, "error");
    await carregarItens();
  }
}

async function excluirItem(item) {
  if (!confirm(`Deseja excluir "${item.nome}" (Lote #${item.idLote})?`)) return;
  try {
    await apiRequest(`${API_URL}/${item.id}`, { method: "DELETE" });
    showToast(`"${item.nome}" removido.`, "success");
    await carregarItens();
  } catch (err) {
    showToast(`Erro ao excluir (DELETE ${API_URL}/${item.id} → ${err.message})`, "error");
  }
}

// Eventos
els.btnNovoJogo.addEventListener("click", abrirCriacao);
els.btnRecarregar.addEventListener("click", carregarItens);
els.btnApiInfo.addEventListener("click", () => els.modalApi.classList.remove("hidden"));
els.inputStatus.addEventListener("change", atualizarLabelStatusModal);

els.inputBusca.addEventListener("input", (e) => {
  state.filtro = e.target.value;
  renderTabela();
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

// Inicializa
carregarItens();
