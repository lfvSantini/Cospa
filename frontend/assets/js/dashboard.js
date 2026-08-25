const API_BASE = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
    ? 'http://localhost:8080/api'
    : 'https://cospa-production.up.railway.app/api';

const token = localStorage.getItem('token');

let listaMotoristas = [];
let listaFornecedores = [];
let listaClientes = [];
let listaViagensCache = [];

let filaDocsExtrasTemp = [];
let filaComprovantesTemp = [];
let filaDocsClientesTemp = [];

if (!token) {
    window.location.href = '/index.html';
}

/* --- ORDEM PRIORITÁRIA DE STATUS --- */
const ORDEM_STATUS = {
    'A_CONTRATAR': 1,
    'PROGRAMADO': 2,
    'AG_CARREGAMENTO': 3,
    'CARREGAMENTO': 4,
    'EM_ROTA': 5,
    'AG_DOCUMENTACAO': 6,
    'AG_DESCARGA': 7,
    'DESCARGA': 8,
    'FINALIZADO': 9
};

/* --- INICIALIZAÇÃO & TEMA --- */
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

    if (themeToggle) {
        themeToggle.checked = currentTheme === 'dark';

        themeToggle.addEventListener('change', () => {
            const newTheme = themeToggle.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    configurarDropEPaste('dropZoneCnh', 'motoristaCnhFile', 'labelCnh');
    configurarDropEPaste('dropZoneCrlv', 'motoristaCrlvFile', 'labelCrlv');
    configurarDropEPaste('dropZoneMotoristaExtra', 'fileInputMotoristaExtra', 'labelMotoristaExtra');
    configurarDropEPaste('dropZoneClienteDoc', 'fileInputClienteDoc', 'labelClienteDoc');
    configurarDropEPaste('dropZoneViagem', 'fileInput', 'labelViagem');

    const selCliNovo = document.getElementById('selectCliente');
    if (selCliNovo) {
        selCliNovo.addEventListener('change', () => {
            if (selCliNovo.value) document.getElementById('clienteManual').value = selCliNovo.value;
        });
    }

    const selCliEdit = document.getElementById('editSelectCliente');
    if (selCliEdit) {
        selCliEdit.addEventListener('change', () => {
            if (selCliEdit.value) document.getElementById('editClienteManual').value = selCliEdit.value;
        });
    }

    carregarClientes();
    carregarFornecedores();
    carregarMotoristas();
    carregarViagens();
});

const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/index.html';
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
        fecharModalNovaViagem();
        fecharModalEditarViagem();
        fecharModalMotoristas();
        fecharModalFornecedores();
        fecharModalClientes();
        fecharModalDocsCliente();
        fecharModalOutrosMotorista();
        fecharModalObs();
        fecharModal();
    }
});

function toggleSecao(containerId, iconId) {
    const container = document.getElementById(containerId);
    const icon = document.getElementById(iconId);
    if (!container) return;

    container.classList.toggle('collapsed');
    if (icon) icon.classList.toggle('collapsed');
}

function configurarDropEPaste(dropZoneId, fileInputId, labelId) {
    const dropZone = document.getElementById(dropZoneId);
    const fileInput = document.getElementById(fileInputId);
    const label = document.getElementById(labelId);
    if (!dropZone || !fileInput) return;

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            fileInput.files = files;
            if (label) label.textContent = files[0].name;
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0 && label) {
            label.textContent = fileInput.files[0].name;
        }
    });

    window.addEventListener('paste', (e) => {
        if (dropZone.offsetWidth > 0 && dropZone.offsetHeight > 0) {
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            for (let item of items) {
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    const container = new DataTransfer();
                    container.items.add(file);
                    fileInput.files = container.files;
                    if (label) label.textContent = file.name || 'Imagem Colada';
                    break;
                }
            }
        }
    });
}

function adicionarCampoDuplo(containerId, nomeClass, endClass, placeholderNome, placeholderEnd, valNome = '', valEnd = '', disabled = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isFirst = container.children.length === 0;
    const div = document.createElement('div');
    div.className = 'dynamic-input-row';
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.gap = '4px';
    div.style.marginBottom = '8px';

    const disabledAttr = disabled ? 'disabled' : '';
    let btnHtml = '';
    if (!disabled) {
        btnHtml = isFirst
            ? `<button type="button" class="btn-add" style="align-self: flex-end;" onclick="adicionarCampoDuplo('${containerId}', '${nomeClass}', '${endClass}', '${placeholderNome}', '${placeholderEnd}')">+</button>`
            : `<button type="button" class="btn-remove" style="align-self: flex-end;" onclick="removerCampo(this)">-</button>`;
    }

    div.innerHTML = `
        <div style="display: flex; gap: 4px; width: 100%;">
            <input type="text" class="${nomeClass}" value="${valNome}" placeholder="${placeholderNome}" ${disabledAttr} style="flex: 1;">
            ${btnHtml}
        </div>
        <input type="text" class="${endClass}" value="${valEnd}" placeholder="${placeholderEnd}" ${disabledAttr} style="font-size: 11px;">
    `;
    container.appendChild(div);
}

function removerCampo(button) {
    const row = button.closest('.dynamic-input-row');
    if (row) row.remove();
}

function obterValoresDuplos(nomeClass, endClass) {
    const nomes = document.querySelectorAll(`.${nomeClass}`);
    const ends = document.querySelectorAll(`.${endClass}`);
    const listaNomes = [];
    const listaEnds = [];

    nomes.forEach((input, i) => {
        const n = input.value.trim();
        const e = ends[i] ? ends[i].value.trim() : '';
        if (n || e) {
            listaNomes.push(n || e);
            listaEnds.push(e || n);
        }
    });

    return {
        nomes: listaNomes.join('\n'),
        enderecos: listaEnds.join('\n')
    };
}

// MÓDULO DE CLIENTES
async function carregarClientes() {
    try {
        const res = await fetch(`${API_BASE}/clientes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            listaClientes = await res.json();
            preencherSelectClientes();
            renderizarTabelaClientes();
        }
    } catch (e) {
        console.error('Erro ao carregar clientes:', e);
    }
}

function preencherSelectClientes() {
    const selNovo = document.getElementById('selectCliente');
    const selEdit = document.getElementById('editSelectCliente');

    let optionsHtml = '<option value="">Selecione um Cliente cadastrado...</option>';
    listaClientes.filter(c => c.ativo).forEach(c => {
        optionsHtml += `<option value="${c.nome}">${c.nome}</option>`;
    });

    if (selNovo) selNovo.innerHTML = optionsHtml;
    if (selEdit) selEdit.innerHTML = optionsHtml;
}

function renderizarTabelaClientes() {
    const tbody = document.getElementById('clientesTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    listaClientes.forEach(c => {
        const tr = document.createElement('tr');
        const situacaoHtml = c.ativo
            ? `<span class="badge-ativo" style="background:#28a745; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">Ativo</span>`
            : `<span class="badge-inativo" style="background:#dc3545; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">Inativo</span>`;

        tr.innerHTML = `
            <td>${c.nome}</td>
            <td>${c.cnpjCpf || '-'}</td>
            <td>${c.contato || '-'}</td>
            <td>${c.telefone || '-'}</td>
            <td>${situacaoHtml}</td>
            <td style="text-align: right;">
                <div class="btn-action-group">
                    <button type="button" class="btn-action" style="background-color: #0056b3; width: 85px !important;" onclick="abrirModalDocsCliente(${c.id}, '${c.nome.replace(/'/g, "\\'")}')">Anexos</button>
                </div>
            </td>
            <td style="text-align: right; white-space: nowrap;">
                <div class="btn-action-group">
                    <button type="button" class="btn-action" style="background-color: #f39c12;" onclick="editarCliente(${c.id})">Editar</button>
                    <button type="button" class="btn-action" style="background-color: #e74c3c;" onclick="deletarCliente(${c.id})">Excluir</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function abrirModalClientes() { document.getElementById('clientesModal').style.display = 'flex'; }
function fecharModalClientes() {
    limparFormCliente();
    document.getElementById('clientesModal').style.display = 'none';
}

function limparFormCliente() {
    document.getElementById('clienteId').value = '';
    document.getElementById('clienteNome').value = '';
    document.getElementById('clienteRazaoSocial').value = '';
    document.getElementById('clienteCnpjCpf').value = '';
    document.getElementById('clienteContato').value = '';
    document.getElementById('clienteTelefone').value = '';
    document.getElementById('clienteEmail').value = '';
    document.getElementById('clienteAtivo').value = 'true';
    document.getElementById('clienteObservacoes').value = '';
    document.getElementById('btnSalvarCliente').textContent = 'Cadastrar Cliente';
}

function editarCliente(id) {
    const c = listaClientes.find(x => x.id === id);
    if (!c) return;

    document.getElementById('clienteId').value = c.id;
    document.getElementById('clienteNome').value = c.nome || '';
    document.getElementById('clienteRazaoSocial').value = c.razaoSocial || '';
    document.getElementById('clienteCnpjCpf').value = c.cnpjCpf || '';
    document.getElementById('clienteContato').value = c.contato || '';
    document.getElementById('clienteTelefone').value = c.telefone || '';
    document.getElementById('clienteEmail').value = c.email || '';
    document.getElementById('clienteAtivo').value = c.ativo ? 'true' : 'false';
    document.getElementById('clienteObservacoes').value = c.observacoes || '';

    document.getElementById('btnSalvarCliente').textContent = 'Atualizar Cliente';
}

async function salvarCliente() {
    const id = document.getElementById('clienteId').value;
    const nome = document.getElementById('clienteNome').value.trim();

    if (!nome) return alert('Informe o nome do cliente.');

    const payload = {
        nome: nome,
        razaoSocial: document.getElementById('clienteRazaoSocial').value,
        cnpjCpf: document.getElementById('clienteCnpjCpf').value,
        contato: document.getElementById('clienteContato').value,
        telefone: document.getElementById('clienteTelefone').value,
        email: document.getElementById('clienteEmail').value,
        ativo: document.getElementById('clienteAtivo').value === 'true',
        observacoes: document.getElementById('clienteObservacoes').value
    };

    const url = id ? `${API_BASE}/clientes/${id}` : `${API_BASE}/clientes`;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert(id ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
            limparFormCliente();
            await carregarClientes();
        } else {
            alert('Erro ao salvar cliente.');
        }
    } catch (e) {
        console.error('Erro ao salvar cliente:', e);
    }
}

async function deletarCliente(id) {
    if (!confirm('Deseja realmente excluir este cliente?')) return;
    try {
        const res = await fetch(`${API_BASE}/clientes/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) await carregarClientes();
    } catch (e) {
        console.error('Erro ao excluir cliente:', e);
    }
}

/* --- DOCUMENTOS DO CLIENTE --- */
async function abrirModalDocsCliente(id, nomeCliente) {
    document.getElementById('modalClienteId').value = id;
    document.getElementById('modalClienteInfo').textContent = nomeCliente;
    document.getElementById('fileInputClienteDoc').value = '';
    document.getElementById('labelClienteDoc').textContent = 'Arraste o Arquivo';

    filaDocsClientesTemp = [];
    await carregarDocsCliente(id);
    document.getElementById('clienteDocsModal').style.display = 'flex';
}

function enviarDocCliente() {
    const tipo = document.getElementById('clienteDocTipo').value;
    const fileInput = document.getElementById('fileInputClienteDoc');
    const file = fileInput.files[0];

    if (!file) return alert('Selecione, arraste ou cole um arquivo.');

    filaDocsClientesTemp.push({ tipo: tipo, file: file });

    const tbody = document.getElementById('clienteDocsTbody');
    const trVazia = tbody.querySelector('td[colspan="3"]');
    if (trVazia) tbody.innerHTML = '';

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td style="width: 120px;"><strong>${tipo}</strong></td>
        <td style="word-break: break-word;">${file.name} <span style="font-size: 10px; color: #f39c12; font-weight: bold;">(Pronto para salvar)</span></td>
        <td style="text-align: right;"><span style="font-size: 11px; color: #888;">Pendente</span></td>
    `;
    tbody.appendChild(tr);

    fileInput.value = '';
    document.getElementById('labelClienteDoc').textContent = 'Arraste o Arquivo';
}

async function fecharModalDocsCliente() {
    const clienteId = document.getElementById('modalClienteId').value;
    const btnFechar = document.querySelector('#clienteDocsModal .btn-cancel');

    if (filaDocsClientesTemp.length > 0) {
        if (btnFechar) {
            btnFechar.textContent = 'Salvando arquivos...';
            btnFechar.disabled = true;
        }

        try {
            const uploads = filaDocsClientesTemp.map(item => {
                const formData = new FormData();
                formData.append('file', item.file);
                formData.append('tipo', item.tipo);

                return fetch(`${API_BASE}/clientes/${clienteId}/documentos`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
            });

            await Promise.all(uploads);
            alert('Documentos do cliente salvos com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar documentos do cliente:', error);
            alert('Ocorreu um erro ao salvar alguns documentos.');
        } finally {
            filaDocsClientesTemp = [];
            if (btnFechar) {
                btnFechar.textContent = 'Salvar e Fechar';
                btnFechar.disabled = false;
            }
        }
    }

    document.getElementById('clienteDocsModal').style.display = 'none';
    await carregarClientes();
}

async function carregarDocsCliente(clienteId) {
    const tbody = document.getElementById('clienteDocsTbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Carregando...</td></tr>';

    try {
        const res = await fetch(`${API_BASE}/clientes/${clienteId}/documentos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const lista = await res.json();
            tbody.innerHTML = '';

            if (lista.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhum documento anexado.</td></tr>';
                return;
            }

            lista.forEach(doc => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="width: 120px;"><strong>${doc.tipo}</strong></td>
                    <td style="word-break: break-word;">${doc.nomeArquivo || 'Arquivo'}</td>
                    <td style="text-align: right;">
                        <div class="btn-action-group">
                            <button type="button" class="btn-action" style="background-color: #27ae60;" onclick="visualizarFoto('${doc.urlArquivo}')">Ver</button>
                            <button type="button" class="btn-action" style="background-color: #e74c3c;" onclick="deletarDocCliente(${doc.id}, ${clienteId})">Excluir</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        console.error('Erro ao carregar documentos do cliente:', e);
    }
}

async function deletarDocCliente(docId, clienteId) {
    if (!confirm('Deseja excluir este documento?')) return;
    try {
        const res = await fetch(`${API_BASE}/clientes/documentos/${docId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) await carregarDocsCliente(clienteId);
    } catch (e) {
        console.error('Erro ao excluir documento:', e);
    }
}

// MÓDULO DE FORNECEDORES
async function carregarFornecedores() {
    try {
        const res = await fetch(`${API_BASE}/fornecedores`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            listaFornecedores = await res.json();
            preencherSelectFornecedores();
            renderizarTabelaFornecedores();
        }
    } catch (e) {
        console.error('Erro ao carregar fornecedores:', e);
    }
}

function preencherSelectFornecedores() {
    const selMot = document.getElementById('motoristaFornecedorSelect');
    const selViagem = document.getElementById('selectFornecedorViagem');
    const selViagemEdit = document.getElementById('editSelectFornecedorViagem');

    let optMot = '<option value="">Sem Fornecedor / Próprio</option>';
    let optViagem = '<option value="">Sem Agência (Frota Própria)</option>';

    listaFornecedores.filter(f => f.ativo).forEach(f => {
        optMot += `<option value="${f.nome}">${f.nome}</option>`;
        optViagem += `<option value="${f.nome}">${f.nome}</option>`;
    });

    if (selMot) selMot.innerHTML = optMot;
    if (selViagem) selViagem.innerHTML = optViagem;
    if (selViagemEdit) selViagemEdit.innerHTML = optViagem;
}

function renderizarTabelaFornecedores() {
    const tbody = document.getElementById('fornecedoresTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    listaFornecedores.forEach(f => {
        const tr = document.createElement('tr');
        const situacaoHtml = f.ativo
            ? `<span class="badge-ativo" style="background:#28a745; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">Ativo</span>`
            : `<span class="badge-inativo" style="background:#dc3545; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">Inativo</span>`;

        tr.innerHTML = `
            <td>${f.nome}</td>
            <td>${f.cnpjCpf || '-'}</td>
            <td>${f.contato || '-'}</td>
            <td>${f.telefone || '-'}</td>
            <td>${f.chavePix || '-'}</td>
            <td>${situacaoHtml}</td>
            <td style="text-align: right; white-space: nowrap;">
                <div class="btn-action-group">
                    <button type="button" class="btn-action" style="background-color: #f39c12;" onclick="editarFornecedor(${f.id})">Editar</button>
                    <button type="button" class="btn-action" style="background-color: #e74c3c;" onclick="deletarFornecedor(${f.id})">Excluir</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function abrirModalFornecedores() { document.getElementById('fornecedoresModal').style.display = 'flex'; }
function fecharModalFornecedores() {
    limparFormFornecedor();
    document.getElementById('fornecedoresModal').style.display = 'none';
}

function limparFormFornecedor() {
    document.getElementById('fornecedorId').value = '';
    document.getElementById('fornecedorNome').value = '';
    document.getElementById('fornecedorCnpjCpf').value = '';
    document.getElementById('fornecedorContato').value = '';
    document.getElementById('fornecedorTelefone').value = '';
    document.getElementById('fornecedorEmail').value = '';
    document.getElementById('fornecedorChavePix').value = '';
    document.getElementById('fornecedorAtivo').value = 'true';
    document.getElementById('fornecedorObservacoes').value = '';
    document.getElementById('btnSalvarFornecedor').textContent = 'Cadastrar Fornecedor';
}

function editarFornecedor(id) {
    const f = listaFornecedores.find(x => x.id === id);
    if (!f) return;

    document.getElementById('fornecedorId').value = f.id;
    document.getElementById('fornecedorNome').value = f.nome || '';
    document.getElementById('fornecedorCnpjCpf').value = f.cnpjCpf || '';
    document.getElementById('fornecedorContato').value = f.contato || '';
    document.getElementById('fornecedorTelefone').value = f.telefone || '';
    document.getElementById('fornecedorEmail').value = f.email || '';
    document.getElementById('fornecedorChavePix').value = f.chavePix || '';
    document.getElementById('fornecedorAtivo').value = f.ativo ? 'true' : 'false';
    document.getElementById('fornecedorObservacoes').value = f.observacoes || '';

    document.getElementById('btnSalvarFornecedor').textContent = 'Atualizar Fornecedor';
}

async function salvarFornecedor() {
    const id = document.getElementById('fornecedorId').value;
    const nome = document.getElementById('fornecedorNome').value.trim();

    if (!nome) return alert('Informe o nome do fornecedor/agência.');

    const payload = {
        nome: nome,
        cnpjCpf: document.getElementById('fornecedorCnpjCpf').value,
        contato: document.getElementById('fornecedorContato').value,
        telefone: document.getElementById('fornecedorTelefone').value,
        email: document.getElementById('fornecedorEmail').value,
        chavePix: document.getElementById('fornecedorChavePix').value,
        ativo: document.getElementById('fornecedorAtivo').value === 'true',
        observacoes: document.getElementById('fornecedorObservacoes').value
    };

    const url = id ? `${API_BASE}/fornecedores/${id}` : `${API_BASE}/fornecedores`;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert(id ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor cadastrado com sucesso!');
            limparFormFornecedor();
            await carregarFornecedores();
        } else {
            alert('Erro ao salvar fornecedor.');
        }
    } catch (e) {
        console.error('Erro ao salvar fornecedor:', e);
    }
}

async function deletarFornecedor(id) {
    if (!confirm('Deseja realmente excluir este fornecedor?')) return;
    try {
        const res = await fetch(`${API_BASE}/fornecedores/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) await carregarFornecedores();
    } catch (e) {
        console.error('Erro ao excluir fornecedor:', e);
    }
}

// MÓDULO DE MOTORISTAS
async function carregarMotoristas() {
    try {
        const res = await fetch(`${API_BASE}/motoristas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            listaMotoristas = await res.json();
            preencherSelectMotoristas();
            renderizarTabelaMotoristas();
        }
    } catch (e) {
        console.error('Erro ao carregar motoristas:', e);
    }
}

function preencherSelectMotoristas() {
    const selNovo = document.getElementById('selectMotorista');
    const selEdit = document.getElementById('editSelectMotorista');

    let optionsHtml = '<option value="">Sem Motorista (A Contratar)</option>';
    listaMotoristas.filter(m => m.ativo).forEach(m => {
        optionsHtml += `<option value="${m.id}" data-placa="${m.placa}" data-fornecedor="${m.fornecedor || ''}">${m.nome} (${m.placa})</option>`;
    });

    if (selNovo) selNovo.innerHTML = optionsHtml;
    if (selEdit) selEdit.innerHTML = optionsHtml;
}

function renderizarTabelaMotoristas() {
    const tbody = document.getElementById('motoristasTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    listaMotoristas.forEach(m => {
        const tr = document.createElement('tr');
        const situacaoHtml = m.ativo
            ? `<span class="badge-ativo" style="background:#28a745; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">Ativo</span>`
            : `<span class="badge-inativo" style="background:#dc3545; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">Inativo</span>`;

        const obs = m.observacoes || '-';
        const obsDisplay = obs.length > 12 ? obs.substring(0, 12) + '...' : obs;
        const obsHtml = obs !== '-' ? `<button type="button" class="btn-obs" onclick="abrirModalObs('${obs.replace(/'/g, "\\'").replace(/\n/g, "\\n")}')">${obsDisplay}</button>` : `-`;

        const btnCnh = m.urlCnh ? `<button type="button" class="btn-action" style="background-color: #0056b3;" onclick="visualizarFoto('${m.urlCnh}')">CNH</button>` : '';
        const btnCrlv = m.urlCrlv ? `<button type="button" class="btn-action" style="background-color: #0056b3;" onclick="visualizarFoto('${m.urlCrlv}')">CRLV</button>` : '';

        tr.innerHTML = `
            <td>${m.nome}</td>
            <td>${m.cpf || '-'}</td>
            <td>${m.placa}</td>
            <td>${m.fornecedor || 'Próprio'}</td>
            <td>${situacaoHtml}</td>
            <td style="text-align: center;">${obsHtml}</td>
            <td>
                <div class="btn-action-group" style="justify-content: flex-start;">
                    ${btnCnh} ${btnCrlv}
                    <button type="button" class="btn-action" style="background-color: #6c757d; margin-left: auto;" onclick="abrirModalOutrosMotorista(${m.id}, '${m.nome.replace(/'/g, "\\'")}')">Outros</button>
                </div>
            </td>
            <td style="text-align: right; white-space: nowrap;">
                <div class="btn-action-group">
                    <button type="button" class="btn-action" style="background-color: #f39c12;" onclick="editarMotorista(${m.id})">Editar</button>
                    <button type="button" class="btn-action" style="background-color: #e74c3c;" onclick="deletarMotorista(${m.id})">Excluir</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function abrirModalMotoristas() { document.getElementById('motoristasModal').style.display = 'flex'; }
function fecharModalMotoristas() {
    limparFormMotorista();
    document.getElementById('motoristasModal').style.display = 'none';
}

function limparFormMotorista() {
    document.getElementById('motoristaId').value = '';
    document.getElementById('motoristaNome').value = '';
    document.getElementById('motoristaCpf').value = '';
    document.getElementById('motoristaPlaca').value = '';
    document.getElementById('motoristaFornecedorSelect').value = '';
    document.getElementById('motoristaAtivo').value = 'true';
    document.getElementById('motoristaObservacoes').value = '';
    document.getElementById('motoristaCnhFile').value = '';
    document.getElementById('motoristaCrlvFile').value = '';
    document.getElementById('labelCnh').textContent = 'Arraste a CNH';
    document.getElementById('labelCrlv').textContent = 'Arraste o CRLV';
    document.getElementById('btnSalvarMotorista').textContent = 'Cadastrar Motorista';
}

function editarMotorista(id) {
    const m = listaMotoristas.find(x => x.id === id);
    if (!m) return;

    document.getElementById('motoristaId').value = m.id;
    document.getElementById('motoristaNome').value = m.nome || '';
    document.getElementById('motoristaCpf').value = m.cpf || '';
    document.getElementById('motoristaPlaca').value = m.placa || '';
    document.getElementById('motoristaFornecedorSelect').value = m.fornecedor || '';
    document.getElementById('motoristaAtivo').value = m.ativo ? 'true' : 'false';
    document.getElementById('motoristaObservacoes').value = m.observacoes || '';

    document.getElementById('btnSalvarMotorista').textContent = 'Atualizar Motorista';
}

async function deletarMotorista(id) {
    if (!confirm('Deseja realmente excluir este motorista?')) return;

    try {
        const res = await fetch(`${API_BASE}/motoristas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            alert('Motorista excluído com sucesso!');
            await carregarMotoristas();
        } else {
            alert('Erro ao excluir motorista.');
        }
    } catch (e) {
        console.error('Erro ao excluir motorista:', e);
    }
}

async function salvarMotorista() {
    const id = document.getElementById('motoristaId').value;
    const nome = document.getElementById('motoristaNome').value.trim();
    const placa = document.getElementById('motoristaPlaca').value.trim();

    if (!nome || !placa) {
        alert('Preencha os campos obrigatórios (Nome e Placa).');
        return;
    }

    const payload = {
        nome: nome,
        cpf: document.getElementById('motoristaCpf').value,
        placa: placa,
        fornecedor: document.getElementById('motoristaFornecedorSelect').value,
        ativo: document.getElementById('motoristaAtivo').value === 'true',
        observacoes: document.getElementById('motoristaObservacoes').value
    };

    const url = id ? `${API_BASE}/motoristas/${id}` : `${API_BASE}/motoristas`;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const motoristaSalvo = await res.json();
            const motId = motoristaSalvo.id || id;

            const cnhFile = document.getElementById('motoristaCnhFile').files[0];
            if (cnhFile) {
                const fdCnh = new FormData();
                fdCnh.append('file', cnhFile);
                fdCnh.append('tipo', 'CNH');
                await fetch(`${API_BASE}/motoristas/${motId}/documentos`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: fdCnh
                });
            }

            const crlvFile = document.getElementById('motoristaCrlvFile').files[0];
            if (crlvFile) {
                const fdCrlv = new FormData();
                fdCrlv.append('file', crlvFile);
                fdCrlv.append('tipo', 'CRLV');
                await fetch(`${API_BASE}/motoristas/${motId}/documentos`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: fdCrlv
                });
            }

            alert(id ? 'Motorista atualizado com sucesso!' : 'Motorista salvo com sucesso!');
            limparFormMotorista();
            await carregarMotoristas();
        } else {
            alert('Erro ao salvar motorista.');
        }
    } catch (e) {
        console.error('Erro ao salvar motorista:', e);
    }
}

/* --- OUTROS DOCUMENTOS DO MOTORISTA --- */
async function abrirModalOutrosMotorista(id, nomeMotorista) {
    document.getElementById('modalMotoristaId').value = id;
    document.getElementById('modalMotoristaInfo').textContent = nomeMotorista;
    document.getElementById('docExtraNome').value = '';
    document.getElementById('fileInputMotoristaExtra').value = '';
    document.getElementById('labelMotoristaExtra').textContent = 'Arraste o Arquivo';

    filaDocsExtrasTemp = [];
    await carregarDocumentosExtrasMotorista(id);
    document.getElementById('motoristaOutrosModal').style.display = 'flex';
}

function enviarDocExtraMotorista() {
    const nomeInput = document.getElementById('docExtraNome');
    const fileInput = document.getElementById('fileInputMotoristaExtra');
    const nome = nomeInput.value.trim();
    const file = fileInput.files[0];

    if (!nome) return alert('Informe o nome ou descrição do documento.');
    if (!file) return alert('Selecione, arraste ou cole um arquivo.');

    filaDocsExtrasTemp.push({ nome: nome, file: file });

    const tbody = document.getElementById('motoristaOutrosTbody');
    const trVazia = tbody.querySelector('td[colspan="2"]');
    if (trVazia) tbody.innerHTML = '';

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td style="word-break: break-word;">${nome} <span style="font-size: 10px; color: #f39c12; font-weight: bold;">(Pronto para salvar)</span></td>
        <td style="text-align: right;"><span style="font-size: 11px; color: #888;">Pendente</span></td>
    `;
    tbody.appendChild(tr);

    nomeInput.value = '';
    fileInput.value = '';
    document.getElementById('labelMotoristaExtra').textContent = 'Arraste o Arquivo';
}

async function fecharModalOutrosMotorista() {
    const motoristaId = document.getElementById('modalMotoristaId').value;
    const btnFechar = document.querySelector('#motoristaOutrosModal .btn-cancel');

    if (filaDocsExtrasTemp.length > 0) {
        if (btnFechar) {
            btnFechar.textContent = 'Salvando arquivos...';
            btnFechar.disabled = true;
        }

        try {
            const uploads = filaDocsExtrasTemp.map(item => {
                const formData = new FormData();
                formData.append('file', item.file);
                formData.append('nome', item.nome);

                return fetch(`${API_BASE}/motoristas/${motoristaId}/documentos-extras`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
            });

            await Promise.all(uploads);
            alert('Todos os documentos foram salvos com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar documentos em lote:', error);
            alert('Ocorreu um erro ao salvar alguns documentos.');
        } finally {
            filaDocsExtrasTemp = [];
            if (btnFechar) {
                btnFechar.textContent = 'Salvar e Fechar';
                btnFechar.disabled = false;
            }
        }
    }

    document.getElementById('motoristaOutrosModal').style.display = 'none';
    await carregarMotoristas();
}

async function carregarDocumentosExtrasMotorista(motoristaId) {
    const tbody = document.getElementById('motoristaOutrosTbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="2" style="text-align: center;">Carregando...</td></tr>';

    try {
        const res = await fetch(`${API_BASE}/motoristas/${motoristaId}/documentos-extras`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const lista = await res.json();
            tbody.innerHTML = '';

            if (lista.length === 0) {
                tbody.innerHTML = '<tr><td colspan="2" style="text-align: center;">Nenhum documento cadastrado.</td></tr>';
                return;
            }

            lista.forEach(doc => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="word-break: break-word;">${doc.nome}</td>
                    <td style="text-align: right;">
                        <div class="btn-action-group">
                            <button type="button" class="btn-action" style="background-color: #27ae60;" onclick="visualizarFoto('${doc.urlArquivo}')">Ver</button>
                            <button type="button" class="btn-action" style="background-color: #e74c3c;" onclick="deletarDocumentoExtraMotorista(${doc.id}, ${motoristaId})">Excluir</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        console.error('Erro ao carregar documentos extras:', e);
    }
}

async function deletarDocumentoExtraMotorista(docId, motoristaId) {
    if (!confirm('Deseja excluir este documento?')) return;
    try {
        const res = await fetch(`${API_BASE}/motoristas/documentos-extras/${docId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) await carregarDocumentosExtrasMotorista(motoristaId);
    } catch (e) {
        console.error('Erro ao deletar documento:', e);
    }
}

// MÓDULO DE VIAGENS
async function carregarViagens() {
    try {
        const response = await fetch(`${API_BASE}/viagens`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            console.error('Erro de permissão ou token expirado ao carregar viagens:', response.status);
            return;
        }

        listaViagensCache = await response.json();

        const ativas = listaViagensCache
            .filter(v => !v.status || v.status.toUpperCase() !== 'FINALIZADO')
            .sort((a, b) => (ORDEM_STATUS[a.status] || 99) - (ORDEM_STATUS[b.status] || 99));

        const aPagar = listaViagensCache.filter(v => v.status && v.status.toUpperCase() === 'FINALIZADO' && v.pagamentoRealizadoStatus !== 'SALDO_PAGO');
        const finalizadas = listaViagensCache.filter(v => v.status && v.status.toUpperCase() === 'FINALIZADO' && v.pagamentoRealizadoStatus === 'SALDO_PAGO');

        renderizarTabelaAtivas(ativas);
        renderizarTabelaPagar(aPagar);
        renderizarTabelaHistorico(finalizadas);
    } catch (error) {
        console.error('Erro ao buscar viagens:', error);
    }
}

function renderizarTabelaAtivas(viagens) {
    const tbody = document.getElementById('viagensTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!viagens || viagens.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 1rem;">Nenhuma viagem em andamento.</td></tr>`;
        return;
    }

    viagens.forEach(v => {
        const tr = document.createElement('tr');
        const obs = v.observacao || '-';
        const obsDisplay = obs.length > 10 ? obs.substring(0, 10) + '...' : obs;
        const obsHtml = obs !== '-' ? `<button type="button" class="btn-obs" onclick="abrirModalObs('${obs.replace(/'/g, "\\'").replace(/\n/g, "\\n")}')">${obsDisplay}</button>` : `-`;

        const coletaNome = (v.origemNome || v.localColeta || v.origem || '-').toString().replace(/\n/g, '<br>');
        const entregaNome = (v.destinoNome || v.localEntrega || v.destino || '-').toString().replace(/\n/g, '<br>');
        const coletaFull = (v.localColeta || v.origem || '-');
        const entregaFull = (v.localEntrega || v.destino || '-');

        const placa = v.placa || (v.motorista ? v.motorista.placa : '-');
        const motorista = v.nomeMotorista || (v.motorista ? v.motorista.nome : 'A Contratar');
        const statusTexto = (v.status || 'PROGRAMADO').replace(/_/g, ' ');

        tr.innerHTML = `
            <td>#${v.id}</td>
            <td>${v.cliente || '-'}</td>
            <td title="${coletaFull}">${coletaNome}</td>
            <td title="${entregaFull}">${entregaNome}</td>
            <td>${placa}</td>
            <td>${motorista}</td>
            <td><span class="status-badge">${statusTexto}</span></td>
            <td style="text-align: center;">${obsHtml}</td>
            <td class="actions-cell">
                <div class="btn-group">
                    <button type="button" class="btn-action" style="background-color: #0056b3;" onclick="abrirModalUpload(${v.id})">Foto</button>
                    <button type="button" class="btn-action" style="background-color: #f39c12;" onclick="abrirModalEditar(${v.id})">Alterar</button>
                    <button type="button" class="btn-action" style="background-color: #e74c3c;" onclick="deletarViagem(${v.id})">Excluir</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarTabelaPagar(viagens) {
    const tbody = document.getElementById('pagarTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!viagens || viagens.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 1rem;">Nenhuma viagem a pagar.</td></tr>`;
        return;
    }

    viagens.forEach(v => {
        const tr = document.createElement('tr');
        const obs = v.observacao || '-';
        const obsDisplay = obs.length > 10 ? obs.substring(0, 10) + '...' : obs;
        const obsHtml = obs !== '-' ? `<button type="button" class="btn-obs" onclick="abrirModalObs('${obs.replace(/'/g, "\\'").replace(/\n/g, "\\n")}')">${obsDisplay}</button>` : `-`;

        const coletaNome = (v.origemNome || v.localColeta || v.origem || '-').toString().replace(/\n/g, '<br>');
        const entregaNome = (v.destinoNome || v.localEntrega || v.destino || '-').toString().replace(/\n/g, '<br>');
        const coletaFull = (v.localColeta || v.origem || '-');
        const entregaFull = (v.localEntrega || v.destino || '-');

        const placa = v.placa || (v.motorista ? v.motorista.placa : '-');
        const motorista = v.nomeMotorista || (v.motorista ? v.motorista.nome : '-');

        tr.innerHTML = `
            <td>#${v.id}</td>
            <td>${v.cliente || '-'}</td>
            <td title="${coletaFull}">${coletaNome}</td>
            <td title="${entregaFull}">${entregaNome}</td>
            <td>${placa}</td>
            <td>${motorista}</td>
            <td><span class="status-badge" style="background-color: #e67e22; color: #ffffff;">A PAGAR</span></td>
            <td style="text-align: center;">${obsHtml}</td>
            <td class="actions-cell">
                <div class="btn-group">
                    <button type="button" class="btn-action" style="background-color: #0056b3;" onclick="abrirModalUpload(${v.id})">Foto</button>
                    <button type="button" class="btn-action" style="background-color: #f39c12;" onclick="abrirModalEditar(${v.id})">Alterar</button>
                    <button type="button" class="btn-action" style="background-color: #e74c3c;" onclick="deletarViagem(${v.id})">Excluir</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarTabelaHistorico(viagens) {
    const tbody = document.getElementById('historicoTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!viagens || viagens.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 1rem;">Nenhuma viagem finalizada.</td></tr>`;
        return;
    }

    viagens.forEach(v => {
        const tr = document.createElement('tr');
        const obs = v.observacao || '-';
        const obsDisplay = obs.length > 10 ? obs.substring(0, 10) + '...' : obs;
        const obsHtml = obs !== '-' ? `<button type="button" class="btn-obs" onclick="abrirModalObs('${obs.replace(/'/g, "\\'").replace(/\n/g, "\\n")}')">${obsDisplay}</button>` : `-`;

        const coletaNome = (v.origemNome || v.localColeta || v.origem || '-').toString().replace(/\n/g, '<br>');
        const entregaNome = (v.destinoNome || v.localEntrega || v.destino || '-').toString().replace(/\n/g, '<br>');
        const coletaFull = (v.localColeta || v.origem || '-');
        const entregaFull = (v.localEntrega || v.destino || '-');

        const placa = v.placa || (v.motorista ? v.motorista.placa : '-');
        const motorista = v.nomeMotorista || (v.motorista ? v.motorista.nome : '-');

        tr.innerHTML = `
            <td>#${v.id}</td>
            <td>${v.cliente || '-'}</td>
            <td title="${coletaFull}">${coletaNome}</td>
            <td title="${entregaFull}">${entregaNome}</td>
            <td>${placa}</td>
            <td>${motorista}</td>
            <td><span class="status-badge">FINALIZADO</span></td>
            <td style="text-align: center;">${obsHtml}</td>
            <td class="actions-cell">
                <div class="btn-group">
                    <button type="button" class="btn-action" style="background-color: #0056b3;" onclick="abrirModalUpload(${v.id})">Foto</button>
                    <button type="button" class="btn-action" style="background-color: #f39c12;" onclick="abrirModalEditar(${v.id})">Alterar</button>
                    <button type="button" class="btn-action" style="background-color: #e74c3c;" onclick="deletarViagem(${v.id})">Excluir</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/* --- COMPROVANTES DA VIAGEM --- */
async function abrirModalUpload(id) {
    document.getElementById('modalViagemId').value = id;
    document.getElementById('modalViagemInfo').textContent = `#${id}`;

    document.getElementById('comprovanteNome').value = '';
    document.getElementById('fileInput').value = '';
    document.getElementById('labelViagem').textContent = 'Arraste o Arquivo';

    filaComprovantesTemp = [];
    await carregarComprovantesViagem(id);
    document.getElementById('uploadModal').style.display = 'flex';
}

function enviarComprovanteViagem() {
    const nomeInput = document.getElementById('comprovanteNome');
    const fileInput = document.getElementById('fileInput');
    const nome = nomeInput.value.trim();
    const file = fileInput.files[0];

    if (!nome) return alert('Informe o nome ou descrição do comprovante.');
    if (!file) return alert('Selecione, arraste ou cole um arquivo.');

    filaComprovantesTemp.push({ nome: nome, file: file });

    const tbody = document.getElementById('comprovantesTbody');
    const trVazia = tbody.querySelector('td[colspan="2"]');
    if (trVazia) tbody.innerHTML = '';

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td style="word-break: break-word;">${nome} <span style="font-size: 10px; color: #f39c12; font-weight: bold;">(Pronto para salvar)</span></td>
        <td style="text-align: right;"><span style="font-size: 11px; color: #888;">Pendente</span></td>
    `;
    tbody.appendChild(tr);

    nomeInput.value = '';
    fileInput.value = '';
    document.getElementById('labelViagem').textContent = 'Arraste o Arquivo';
}

async function fecharModal() {
    const viagemId = document.getElementById('modalViagemId').value;
    const btnFechar = document.querySelector('#uploadModal .btn-cancel');

    if (filaComprovantesTemp.length > 0) {
        if (btnFechar) {
            btnFechar.textContent = 'Salvando arquivos...';
            btnFechar.disabled = true;
        }

        try {
            const uploads = filaComprovantesTemp.map(item => {
                const formData = new FormData();
                formData.append('file', item.file);
                formData.append('nome', item.nome);

                return fetch(`${API_BASE}/viagens/${viagemId}/comprovantes`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
            });

            await Promise.all(uploads);
            alert('Comprovantes salvos com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar comprovantes em lote:', error);
            alert('Ocorreu um erro ao salvar alguns comprovantes.');
        } finally {
            filaComprovantesTemp = [];
            if (btnFechar) {
                btnFechar.textContent = 'Salvar e Fechar';
                btnFechar.disabled = false;
            }
        }
    }

    document.getElementById('uploadModal').style.display = 'none';
    await carregarViagens();
}

async function carregarComprovantesViagem(viagemId) {
    const tbody = document.getElementById('comprovantesTbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="2" style="text-align: center;">Carregando...</td></tr>';

    try {
        const res = await fetch(`${API_BASE}/viagens/${viagemId}/comprovantes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const lista = await res.json();
            tbody.innerHTML = '';

            if (lista.length === 0) {
                tbody.innerHTML = '<tr><td colspan="2" style="text-align: center;">Nenhum comprovante anexado.</td></tr>';
                return;
            }

            lista.forEach(c => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="word-break: break-word;">${c.nome || c.descricao || 'Comprovante'}</td>
                    <td style="text-align: right;">
                        <div class="btn-action-group">
                            <button type="button" class="btn-action" style="background-color: #27ae60;" onclick="visualizarFoto('${c.urlArquivo || c.url}')">Ver</button>
                            <button type="button" class="btn-action" style="background-color: #e74c3c;" onclick="deletarComprovante(${c.id}, ${viagemId})">Excluir</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        console.error('Erro ao carregar comprovantes:', e);
    }
}

async function deletarComprovante(comprovanteId, viagemId) {
    if (!confirm('Deseja excluir este comprovante?')) return;
    try {
        const res = await fetch(`${API_BASE}/viagens/${viagemId}/comprovantes/${comprovanteId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) await carregarComprovantesViagem(viagemId);
    } catch (e) {
        console.error('Erro ao deletar comprovante:', e);
    }
}

/* --- CADASTRO E EDIÇÃO DE VIAGEM --- */
function abrirModalNovaViagem() {
    document.getElementById('viagemId').value = '';
    document.getElementById('selectCliente').value = '';
    document.getElementById('clienteManual').value = '';
    document.getElementById('dataColetaPrevista').value = '';
    document.getElementById('dataColetaReal').value = '';
    document.getElementById('dataEntregaPrevista').value = '';
    document.getElementById('dataEntregaReal').value = '';
    document.getElementById('valorAReceber').value = '';
    document.getElementById('valorAdicionalReceber').value = '';
    document.getElementById('valorAPagar').value = '';
    document.getElementById('valorAdicionalPagar').value = '';
    document.getElementById('valorAdicionalAgencia').value = '';
    document.getElementById('selectFornecedorViagem').value = '';
    document.getElementById('pagamentoLiberado').checked = false;
    document.getElementById('pagamentoRealizadoStatus').value = 'NAO_REALIZADO';
    document.getElementById('dataHoraPagamento').value = '';
    document.getElementById('novoStatus').value = 'PROGRAMADO';
    document.getElementById('observacao').value = '';

    const containerOrigens = document.getElementById('containerOrigens');
    if (containerOrigens) {
        containerOrigens.innerHTML = '';
        adicionarCampoDuplo('containerOrigens', 'origem-nome', 'origem-end', 'Ponto de Origem', 'Rua da Coleta');
    }

    const containerDestinos = document.getElementById('containerDestinos');
    if (containerDestinos) {
        containerDestinos.innerHTML = '';
        adicionarCampoDuplo('containerDestinos', 'destino-nome', 'destino-end', 'Ponto de Destino', 'Rua da Entrega');
    }

    document.getElementById('novaViagemModal').style.display = 'flex';
}

function fecharModalNovaViagem() { document.getElementById('novaViagemModal').style.display = 'none'; }

async function salvarNovaViagem() {
    const origens = obterValoresDuplos('origem-nome', 'origem-end');
    const destinos = obterValoresDuplos('destino-nome', 'destino-end');

    const selMot = document.getElementById('selectMotorista');
    const optSelected = selMot.options[selMot.selectedIndex];
    const isMotoristaEscolhido = selMot.value !== "" && selMot.value !== null;

    const clienteFinal = document.getElementById('clienteManual').value.trim() || document.getElementById('selectCliente').value;

    if (!clienteFinal) {
        alert('Informe o cliente da viagem.');
        return;
    }

    const payload = {
        id: document.getElementById('viagemId').value,
        cliente: clienteFinal,
        origemNome: origens.nomes,
        localColeta: origens.enderecos,
        origem: origens.enderecos,
        destinoNome: destinos.nomes,
        localEntrega: destinos.enderecos,
        destino: destinos.enderecos,
        nomeMotorista: isMotoristaEscolhido ? optSelected.text.split(' (')[0] : 'A Contratar',
        placa: isMotoristaEscolhido ? optSelected.getAttribute('data-placa') : '-',
        fornecedorAgencia: document.getElementById('selectFornecedorViagem').value,
        dataColetaPrevista: document.getElementById('dataColetaPrevista').value,
        dataColetaReal: document.getElementById('dataColetaReal').value,
        dataEntregaPrevista: document.getElementById('dataEntregaPrevista').value,
        dataEntregaReal: document.getElementById('dataEntregaReal').value,
        valorAReceber: parseFloat(document.getElementById('valorAReceber').value) || 0,
        valorAdicionalReceber: parseFloat(document.getElementById('valorAdicionalReceber').value) || 0,
        valorAPagar: parseFloat(document.getElementById('valorAPagar').value) || 0,
        valorAdicionalPagar: parseFloat(document.getElementById('valorAdicionalPagar').value) || 0,
        valorAdicionalAgencia: parseFloat(document.getElementById('valorAdicionalAgencia').value) || 0,
        pagamentoLiberado: document.getElementById('pagamentoLiberado').checked,
        pagamentoRealizadoStatus: document.getElementById('pagamentoRealizadoStatus').value,
        dataHoraPagamento: document.getElementById('dataHoraPagamento').value,
        status: isMotoristaEscolhido ? document.getElementById('novoStatus').value : 'A_CONTRATAR',
        observacao: document.getElementById('observacao').value
    };

    try {
        const res = await fetch(`${API_BASE}/viagens`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('Viagem cadastrada com sucesso!');
            fecharModalNovaViagem();
            await carregarViagens();
        } else {
            alert('Erro ao cadastrar viagem.');
        }
    } catch (e) {
        console.error('Erro ao cadastrar viagem:', e);
    }
}

function abrirModalEditar(id) {
    const v = listaViagensCache.find(x => String(x.id) === String(id));
    if (!v) return;

    document.getElementById('editViagemId').value = v.id;
    document.getElementById('editClienteManual').value = v.cliente || '';
    document.getElementById('editSelectCliente').value = v.cliente || '';

    // Origens
    const containerOrigens = document.getElementById('containerEditOrigens');
    containerOrigens.innerHTML = '';
    const nomesOrigem = (v.origemNome || '').split('\n').filter(x => x.trim() !== '');
    const endsOrigem = (v.localColeta || v.origem || '').split('\n').filter(x => x.trim() !== '');
    const maxOrigens = Math.max(nomesOrigem.length, endsOrigem.length, 1);
    for (let i = 0; i < maxOrigens; i++) {
        adicionarCampoDuplo('containerEditOrigens', 'edit-origem-nome', 'edit-origem-end', 'Nome Origem', 'Endereço Origem', nomesOrigem[i] || '', endsOrigem[i] || '', false);
    }

    // Destinos
    const containerDestinos = document.getElementById('containerEditDestinos');
    containerDestinos.innerHTML = '';
    const nomesDestino = (v.destinoNome || '').split('\n').filter(x => x.trim() !== '');
    const endsDestino = (v.localEntrega || v.destino || '').split('\n').filter(x => x.trim() !== '');
    const maxDestinos = Math.max(nomesDestino.length, endsDestino.length, 1);
    for (let i = 0; i < maxDestinos; i++) {
        adicionarCampoDuplo('containerEditDestinos', 'edit-destino-nome', 'edit-destino-end', 'Nome Destino', 'Endereço Destino', nomesDestino[i] || '', endsDestino[i] || '', false);
    }

    const selMot = document.getElementById('editSelectMotorista');
    selMot.value = "";
    for (let opt of selMot.options) {
        if (opt.getAttribute('data-placa') === v.placa && v.placa && v.placa !== '-') {
            opt.selected = true;
            break;
        }
    }

    document.getElementById('editSelectFornecedorViagem').value = v.fornecedorAgencia || '';

    document.getElementById('editDataColetaPrevista').value = v.dataColetaPrevista || '';
    document.getElementById('editDataColetaReal').value = v.dataColetaReal || '';
    document.getElementById('editDataEntregaPrevista').value = v.dataEntregaPrevista || '';
    document.getElementById('editDataEntregaReal').value = v.dataEntregaReal || '';

    document.getElementById('editValorAReceber').value = (v.valorAReceber && v.valorAReceber > 0) ? v.valorAReceber : '';
    document.getElementById('editValorAdicionalReceber').value = (v.valorAdicionalReceber && v.valorAdicionalReceber > 0) ? v.valorAdicionalReceber : '';
    document.getElementById('editValorAPagar').value = (v.valorAPagar && v.valorAPagar > 0) ? v.valorAPagar : '';
    document.getElementById('editValorAdicionalPagar').value = (v.valorAdicionalPagar && v.valorAdicionalPagar > 0) ? v.valorAdicionalPagar : '';
    document.getElementById('editValorAdicionalAgencia').value = (v.valorAdicionalAgencia && v.valorAdicionalAgencia > 0) ? v.valorAdicionalAgencia : '';

    document.getElementById('editPagamentoLiberado').checked = !!v.pagamentoLiberado;
    document.getElementById('editPagamentoRealizadoStatus').value = v.pagamentoRealizadoStatus || 'NAO_REALIZADO';
    document.getElementById('editDataHoraPagamento').value = v.dataHoraPagamento || '';

    const selStatus = document.getElementById('editStatus');
    selStatus.value = v.status || 'PROGRAMADO';

    document.getElementById('editObservacao').value = v.observacao || '';

    const btnFin = document.getElementById('btnFinalizarViagemModal');
    if (btnFin) {
        const isEmAndamento = !v.status || v.status.toUpperCase() !== 'FINALIZADO';
        const isAPagar = v.status && v.status.toUpperCase() === 'FINALIZADO' && v.pagamentoRealizadoStatus !== 'SALDO_PAGO';

        if (isEmAndamento) {
            btnFin.style.display = 'inline-flex';
            btnFin.textContent = 'Finalizar Viagem';
            btnFin.onclick = () => finalizarOperacaoPeloModal();
        } else if (isAPagar) {
            btnFin.style.display = 'inline-flex';
            btnFin.textContent = 'Finalizar Viagem';
            btnFin.onclick = () => finalizarPagamentoPeloModal();
        } else {
            btnFin.style.display = 'none';
        }
    }

    document.getElementById('editarViagemModal').style.display = 'flex';
}

function fecharModalEditarViagem() { document.getElementById('editarViagemModal').style.display = 'none'; }

async function salvarEdicaoViagem() {
    const id = document.getElementById('editViagemId').value;
    if (!id) return alert('ID da viagem não informado.');

    const origens = obterValoresDuplos('edit-origem-nome', 'edit-origem-end');
    const destinos = obterValoresDuplos('edit-destino-nome', 'edit-destino-end');

    const selMot = document.getElementById('editSelectMotorista');
    const optSelected = selMot.options[selMot.selectedIndex];
    const isMotoristaEscolhido = selMot.value !== "" && selMot.value !== null;

    const clienteFinal = document.getElementById('editClienteManual').value.trim() || document.getElementById('editSelectCliente').value;

    if (!clienteFinal) {
        return alert('Informe o cliente.');
    }

    const payload = {
        id: Number(id),
        cliente: clienteFinal,
        origemNome: origens.nomes,
        localColeta: origens.enderecos,
        origem: origens.enderecos,
        destinoNome: destinos.nomes,
        localEntrega: destinos.enderecos,
        destino: destinos.enderecos,
        nomeMotorista: isMotoristaEscolhido ? optSelected.text.split(' (')[0] : 'A Contratar',
        placa: isMotoristaEscolhido ? optSelected.getAttribute('data-placa') : '-',
        fornecedorAgencia: document.getElementById('editSelectFornecedorViagem').value || '',
        dataColetaPrevista: document.getElementById('editDataColetaPrevista').value || '',
        dataColetaReal: document.getElementById('editDataColetaReal').value || '',
        dataEntregaPrevista: document.getElementById('editDataEntregaPrevista').value || '',
        dataEntregaReal: document.getElementById('editDataEntregaReal').value || '',
        valorAReceber: parseFloat(document.getElementById('editValorAReceber').value) || 0,
        valorAdicionalReceber: parseFloat(document.getElementById('editValorAdicionalReceber').value) || 0,
        valorAPagar: parseFloat(document.getElementById('editValorAPagar').value) || 0,
        valorAdicionalPagar: parseFloat(document.getElementById('editValorAdicionalPagar').value) || 0,
        valorAdicionalAgencia: parseFloat(document.getElementById('editValorAdicionalAgencia').value) || 0,
        pagamentoLiberado: document.getElementById('editPagamentoLiberado').checked,
        pagamentoRealizadoStatus: document.getElementById('editPagamentoRealizadoStatus').value,
        dataHoraPagamento: document.getElementById('editDataHoraPagamento').value || '',
        status: document.getElementById('editStatus').value,
        observacao: document.getElementById('editObservacao').value || ''
    };

    try {
        const res = await fetch(`${API_BASE}/viagens/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('Viagem atualizada com sucesso!');
            fecharModalEditarViagem();
            await carregarViagens();
        } else {
            const errData = await res.text();
            alert('Erro ao atualizar viagem: ' + (errData || res.statusText));
        }
    } catch (e) {
        console.error('Erro ao atualizar viagem:', e);
        alert('Erro de conexão ao atualizar viagem.');
    }
}

/* --- PASSO 1: MOVE DE "EM ANDAMENTO" PARA "VIAGENS A PAGAR" --- */
async function finalizarOperacaoPeloModal() {
    const id = document.getElementById('editViagemId').value;
    if (!confirm(`Deseja finalizar a operação da viagem #${id}? Ela será movida para "Viagens a Pagar".`)) return;

    document.getElementById('editStatus').value = 'FINALIZADO';
    await salvarEdicaoViagem();
}

/* --- PASSO 2: MOVE DE "VIAGENS A PAGAR" PARA "HISTÓRICO DE FINALIZADAS" --- */
async function finalizarPagamentoPeloModal() {
    const id = document.getElementById('editViagemId').value;
    if (!confirm(`Deseja confirmar a quitação da viagem #${id}? Ela será movida para o "Histórico de Viagens Finalizadas".`)) return;

    document.getElementById('editStatus').value = 'FINALIZADO';
    document.getElementById('editPagamentoRealizadoStatus').value = 'SALDO_PAGO';
    document.getElementById('editPagamentoLiberado').checked = true;

    const inputHora = document.getElementById('editDataHoraPagamento');
    if (!inputHora.value.trim()) {
        const agora = new Date();
        const dia = String(agora.getDate()).padStart(2, '0');
        const mes = String(agora.getMonth() + 1).padStart(2, '0');
        const ano = agora.getFullYear();
        const hora = String(agora.getHours()).padStart(2, '0');
        const min = String(agora.getMinutes()).padStart(2, '0');
        inputHora.value = `${dia}/${mes}/${ano} ${hora}:${min}`;
    }

    await salvarEdicaoViagem();
}

async function deletarViagem(id) {
    if (!confirm(`Deseja realmente excluir a viagem #${id}?`)) return;
    try {
        const res = await fetch(`${API_BASE}/viagens/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) await carregarViagens();
    } catch (e) {
        console.error('Erro ao deletar viagem:', e);
    }
}

function visualizarFoto(url) {
    if (!url || url === 'null' || url === '-' || url.trim() === '') {
        return alert('Arquivo não anexado ou inexistente.');
    }

    const hostBackend = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
        ? 'http://localhost:8080'
        : 'https://cospa-production.up.railway.app';

    let urlFinal = url.trim();

    if (!urlFinal.startsWith('http://') && !urlFinal.startsWith('https://')) {
        const caminhoLimpo = urlFinal.startsWith('/') ? urlFinal : `/${urlFinal}`;
        urlFinal = `${hostBackend}${caminhoLimpo}`;
    }

    window.open(urlFinal, '_blank');
}

function abrirModalObs(texto) {
    document.getElementById('obsContent').textContent = texto;
    document.getElementById('obsModal').style.display = 'flex';
}
function fecharModalObs() { document.getElementById('obsModal').style.display = 'none'; }