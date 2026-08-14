const API_BASE = 'http://localhost:8080/api';
const token = localStorage.getItem('token');

let listaMotoristas = [];
let listaViagensCache = [];

// Filas temporárias locais (Solução temporária até o port para Angular)
let filaDocsExtrasTemp = [];
let filaComprovantesTemp = [];

if (!token) {
    window.location.href = '../pages/index.html';
}

/* --- LOGOUT & CONTROLE DE TEMA --- */
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
    configurarDropEPaste('dropZoneViagem', 'fileInput', 'labelViagem');

    carregarMotoristas();
    carregarViagens();
});

const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '../pages/index.html';
    });
}

/* --- ATALHO TECLADO: FECHAR MODAIS COM ESC --- */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
        fecharModalNovaViagem();
        fecharModalEditarViagem();
        fecharModalMotoristas();
        fecharModalOutrosMotorista();
        fecharModalObs();
        fecharModal();
    }
});

/* --- ALTERNAR EXIBIÇÃO DO HISTÓRICO --- */
function toggleHistorico() {
    const container = document.getElementById('containerHistorico');
    const icon = document.getElementById('toggleIconHistorico');
    if (!container) return;

    container.classList.toggle('collapsed');
    if (icon) icon.classList.toggle('collapsed');
}

/* --- SUPORTE A DRAG & DROP E CTRL+V --- */
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
                    if (label) label.textContent = file.name || 'Imagem da Área de Transferência';
                    break;
                }
            }
        }
    });
}

/* --- MANIPULAÇÃO DE CAMPOS DUPLOS (NOME VISÍVEL & ENDEREÇO OCULTO) --- */
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
        if (n) {
            listaNomes.push(n);
            listaEnds.push(e || n);
        }
    });

    return {
        nomes: listaNomes.join('\n'),
        enderecos: listaEnds.join('\n')
    };
}

/* --- GESTÃO DE MOTORISTAS --- */
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
    
    let optionsHtml = '<option value="">Selecione o Motorista...</option>';
    listaMotoristas.filter(m => m.ativo).forEach(m => {
        optionsHtml += `<option value="${m.id}" data-placa="${m.placa}">${m.nome} (${m.placa})</option>`;
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
            <td>${situacaoHtml}</td>
            <td style="text-align: center;">${obsHtml}</td>
            <td>
                <div style="display: flex; gap: 4px; width: 100%;">
                    ${btnCnh} ${btnCrlv}
                    <button type="button" class="btn-action" style="background-color: #6c757d; margin-left: auto;" onclick="abrirModalOutrosMotorista(${m.id}, '${m.nome.replace(/'/g, "\\'")}')">Outros</button>
                </div>
            </td>
            <td style="text-align: right; white-space: nowrap;">
                <button type="button" class="btn-action" style="background-color: #f39c12;" onclick="editarMotorista(${m.id})">Editar</button>
                <button type="button" class="btn-action" style="background-color: #e74c3c;" onclick="deletarMotorista(${m.id})">Excluir</button>
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
    document.getElementById('motoristaFornecedor').value = '';
    document.getElementById('motoristaAtivo').value = 'true';
    document.getElementById('motoristaObservacoes').value = '';
    document.getElementById('motoristaCnhFile').value = '';
    document.getElementById('motoristaCrlvFile').value = '';
    document.getElementById('labelCnh').textContent = 'Arraste ou cole (Ctrl+V) a CNH';
    document.getElementById('labelCrlv').textContent = 'Arraste ou cole (Ctrl+V) o CRLV';
    document.getElementById('btnSalvarMotorista').textContent = 'Cadastrar Motorista';
}

function editarMotorista(id) {
    const m = listaMotoristas.find(x => x.id === id);
    if (!m) return;

    document.getElementById('motoristaId').value = m.id;
    document.getElementById('motoristaNome').value = m.nome || '';
    document.getElementById('motoristaCpf').value = m.cpf || '';
    document.getElementById('motoristaPlaca').value = m.placa || '';
    document.getElementById('motoristaFornecedor').value = m.fornecedor || '';
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
        fornecedor: document.getElementById('motoristaFornecedor').value,
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

/* =========================================================================
   SOLUÇÃO TEMPORÁRIA (ATÉ O PORT PARA ANGULAR):
   Armazena os documentos extras em memória temporária localmente. 
   O envio ao backend e o recarregamento ocorrem apenas 1 única vez ao clicar em "Salvar e Fechar".
   ========================================================================= */

async function abrirModalOutrosMotorista(id, nomeMotorista) {
    document.getElementById('modalMotoristaId').value = id;
    document.getElementById('modalMotoristaInfo').textContent = nomeMotorista;
    document.getElementById('docExtraNome').value = '';
    document.getElementById('fileInputMotoristaExtra').value = '';
    document.getElementById('labelMotoristaExtra').textContent = 'Arraste ou Ctrl+V';

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
        <td>${nome} <span style="font-size: 10px; color: #f39c12; font-weight: bold;">(Pronto para salvar)</span></td>
        <td style="text-align: right;">
            <span style="font-size: 11px; color: #888;">Pendente</span>
        </td>
    `;
    tbody.appendChild(tr);

    nomeInput.value = '';
    fileInput.value = '';
    document.getElementById('labelMotoristaExtra').textContent = 'Arraste ou Ctrl+V';
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
                    <td>${doc.nome}</td>
                    <td style="text-align: right; display: flex; gap: 6px; justify-content: flex-end;">
                        <button type="button" class="btn-action" style="background-color: #27ae60;" onclick="visualizarFoto('${doc.urlArquivo}')">Ver</button>
                        <button type="button" class="btn-action" style="background-color: #e74c3c;" onclick="deletarDocumentoExtraMotorista(${doc.id}, ${motoristaId})">Excluir</button>
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
        if (res.ok) {
            await carregarDocumentosExtrasMotorista(motoristaId);
        }
    } catch (e) {
        console.error('Erro ao deletar documento:', e);
    }
}

/* --- GESTÃO DE VIAGENS --- */
async function carregarViagens() {
    try {
        const response = await fetch(`${API_BASE}/viagens`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '../pages/index.html';
            return;
        }

        listaViagensCache = await response.json();
        const ativas = listaViagensCache.filter(v => !v.status || v.status.toUpperCase() !== 'FINALIZADO');
        const finalizadas = listaViagensCache.filter(v => v.status && v.status.toUpperCase() === 'FINALIZADO');

        renderizarTabelaAtivas(ativas);
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
        const motorista = v.nomeMotorista || v.motorista || '-';

        tr.innerHTML = `
            <td>#${v.id}</td>
            <td>${v.cliente || '-'}</td>
            <td title="${coletaFull}">${coletaNome}</td>
            <td title="${entregaFull}">${entregaNome}</td>
            <td>${placa}</td>
            <td>${motorista}</td>
            <td><span class="status-badge">${v.status || 'PROGRAMADO'}</span></td>
            <td style="text-align: center;">${obsHtml}</td>
            <td class="actions-cell">
                <button type="button" class="btn-action" style="background-color: #0056b3;" onclick="abrirModalUpload(${v.id})">Foto</button>
                <button type="button" class="btn-action" style="background-color: #f39c12;" onclick="abrirModalEditar(${v.id})">Alterar</button>
                <button type="button" class="btn-action" style="background-color: #e74c3c;" onclick="deletarViagem(${v.id})">Excluir</button>
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
        const motorista = v.nomeMotorista || v.motorista || '-';

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
                <button type="button" class="btn-action" style="background-color: #0056b3;" onclick="abrirModalUpload(${v.id}, true)">Foto</button>
                <button type="button" class="btn-action" style="background-color: #f39c12;" onclick="abrirModalEditar(${v.id}, true)">Visualizar</button>
                <button type="button" class="btn-action" style="background-color: #e74c3c;" onclick="deletarViagem(${v.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/* =========================================================================
   COMPROVANTES DA VIAGEM (FILA TEMPORÁRIA)
   ========================================================= */

async function abrirModalUpload(id, apenasVisualizacao = false) {
    document.getElementById('modalViagemId').value = id;
    document.getElementById('modalViagemInfo').textContent = `#${id}`;

    const form = document.getElementById('uploadForm');
    if (form) {
        document.getElementById('comprovanteNome').value = '';
        document.getElementById('fileInput').value = '';
        document.getElementById('labelViagem').textContent = 'Arraste ou Ctrl+V';
        form.style.display = apenasVisualizacao ? 'none' : 'block';
    }

    filaComprovantesTemp = [];
    await carregarComprovantesViagem(id, apenasVisualizacao);
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
        <td>${nome} <span style="font-size: 10px; color: #f39c12; font-weight: bold;">(Pronto para salvar)</span></td>
        <td style="text-align: right;">
            <span style="font-size: 11px; color: #888;">Pendente</span>
        </td>
    `;
    tbody.appendChild(tr);

    nomeInput.value = '';
    fileInput.value = '';
    document.getElementById('labelViagem').textContent = 'Arraste ou Ctrl+V';
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

async function carregarComprovantesViagem(viagemId, apenasVisualizacao = false) {
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
                const btnExcluir = !apenasVisualizacao 
                    ? `<button type="button" class="btn-action" style="background-color: #e74c3c;" onclick="deletarComprovante(${c.id}, ${viagemId})">Excluir</button>` 
                    : '';

                tr.innerHTML = `
                    <td>${c.nome || c.descricao || 'Comprovante'}</td>
                    <td style="text-align: right; display: flex; gap: 6px; justify-content: flex-end;">
                        <button type="button" class="btn-action" style="background-color: #27ae60;" onclick="visualizarFoto('${c.urlArquivo || c.url}')">Ver</button>
                        ${btnExcluir}
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
        if (res.ok) {
            await carregarComprovantesViagem(viagemId);
        }
    } catch (e) {
        console.error('Erro ao deletar comprovante:', e);
    }
}

/* --- CADASTRO E EDIÇÃO DE VIAGEM --- */
function abrirModalNovaViagem() { 
    document.getElementById('viagemId').value = '';
    document.getElementById('cliente').value = '';
    document.getElementById('dataColetaPrevista').value = '';
    document.getElementById('dataColetaReal').value = '';
    document.getElementById('dataEntregaPrevista').value = '';
    document.getElementById('dataEntregaReal').value = '';
    document.getElementById('valorAReceber').value = '';
    document.getElementById('valorAdicionalReceber').value = '';
    document.getElementById('valorAPagar').value = '';
    document.getElementById('valorAdicionalPagar').value = '';
    document.getElementById('pagamentoLiberado').checked = false;
    document.getElementById('pagamentoRealizadoStatus').value = 'NAO_REALIZADO';
    document.getElementById('observacao').value = '';

    const containerOrigens = document.getElementById('containerOrigens');
    if (containerOrigens) {
        containerOrigens.innerHTML = '';
        adicionarCampoDuplo('containerOrigens', 'origem-nome', 'origem-end', 'Ponto de Origem', 'Endereço da Coleta');
    }

    const containerDestinos = document.getElementById('containerDestinos');
    if (containerDestinos) {
        containerDestinos.innerHTML = '';
        adicionarCampoDuplo('containerDestinos', 'destino-nome', 'destino-end', 'Ponto de Destino', 'Endereço da Entrega');
    }

    document.getElementById('novaViagemModal').style.display = 'flex'; 
}

function fecharModalNovaViagem() { document.getElementById('novaViagemModal').style.display = 'none'; }

async function salvarNovaViagem() {
    const origens = obterValoresDuplos('origem-nome', 'origem-end');
    const destinos = obterValoresDuplos('destino-nome', 'destino-end');

    const selMot = document.getElementById('selectMotorista');
    const optSelected = selMot.options[selMot.selectedIndex];

    const payload = {
        id: document.getElementById('viagemId').value,
        cliente: document.getElementById('cliente').value,
        origemNome: origens.nomes,
        localColeta: origens.enderecos,
        origem: origens.enderecos,
        destinoNome: destinos.nomes,
        localEntrega: destinos.enderecos,
        destino: destinos.enderecos,
        nomeMotorista: optSelected ? optSelected.text.split(' (')[0] : '',
        placa: optSelected ? optSelected.getAttribute('data-placa') : '',
        dataColetaPrevista: document.getElementById('dataColetaPrevista').value,
        dataColetaReal: document.getElementById('dataColetaReal').value,
        dataEntregaPrevista: document.getElementById('dataEntregaPrevista').value,
        dataEntregaReal: document.getElementById('dataEntregaReal').value,
        valorAReceber: document.getElementById('valorAReceber').value || 0,
        valorAdicionalReceber: document.getElementById('valorAdicionalReceber').value || 0,
        valorAPagar: document.getElementById('valorAPagar').value || 0,
        valorAdicionalPagar: document.getElementById('valorAdicionalPagar').value || 0,
        pagamentoLiberado: document.getElementById('pagamentoLiberado').checked,
        pagamentoRealizadoStatus: document.getElementById('pagamentoRealizadoStatus').value,
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
            carregarViagens();
        } else {
            alert('Erro ao cadastrar viagem.');
        }
    } catch (e) {
        console.error('Erro ao cadastrar viagem:', e);
    }
}

function abrirModalEditar(id, apenasVisualizacao = false) {
    const v = listaViagensCache.find(x => x.id === id);
    if (!v) return;

    document.getElementById('editViagemId').value = v.id;
    document.getElementById('editCliente').value = v.cliente || '';
    document.getElementById('editCliente').disabled = apenasVisualizacao;

    const containerOrigens = document.getElementById('containerEditOrigens');
    containerOrigens.innerHTML = '';
    const nomesOrigem = (v.origemNome || '').split('\n');
    const endsOrigem = (v.localColeta || v.origem || '').split('\n');
    nomesOrigem.forEach((nome, i) => {
        adicionarCampoDuplo('containerEditOrigens', 'edit-origem-nome', 'edit-origem-end', 'Nome Origem', 'Endereço Origem', nome, endsOrigem[i] || '', apenasVisualizacao);
    });

    const containerDestinos = document.getElementById('containerEditDestinos');
    containerDestinos.innerHTML = '';
    const nomesDestino = (v.destinoNome || '').split('\n');
    const endsDestino = (v.localEntrega || v.destino || '').split('\n');
    nomesDestino.forEach((nome, i) => {
        adicionarCampoDuplo('containerEditDestinos', 'edit-destino-nome', 'edit-destino-end', 'Nome Destino', 'Endereço Destino', nome, endsDestino[i] || '', apenasVisualizacao);
    });

    const selMot = document.getElementById('editSelectMotorista');
    selMot.disabled = apenasVisualizacao;
    for (let opt of selMot.options) {
        if (opt.getAttribute('data-placa') === v.placa) {
            opt.selected = true;
            break;
        }
    }

    document.getElementById('editDataColetaPrevista').value = v.dataColetaPrevista || '';
    document.getElementById('editDataColetaReal').value = v.dataColetaReal || '';
    document.getElementById('editDataEntregaPrevista').value = v.dataEntregaPrevista || '';
    document.getElementById('editDataEntregaReal').value = v.dataEntregaReal || '';
    ['editDataColetaPrevista', 'editDataColetaReal', 'editDataEntregaPrevista', 'editDataEntregaReal'].forEach(f => document.getElementById(f).disabled = apenasVisualizacao);

    document.getElementById('editValorAReceber').value = (v.valorAReceber && v.valorAReceber > 0) ? v.valorAReceber : '';
    document.getElementById('editValorAdicionalReceber').value = (v.valorAdicionalReceber && v.valorAdicionalReceber > 0) ? v.valorAdicionalReceber : '';
    document.getElementById('editValorAPagar').value = (v.valorAPagar && v.valorAPagar > 0) ? v.valorAPagar : '';
    document.getElementById('editValorAdicionalPagar').value = (v.valorAdicionalPagar && v.valorAdicionalPagar > 0) ? v.valorAdicionalPagar : '';
    ['editValorAReceber', 'editValorAdicionalReceber', 'editValorAPagar', 'editValorAdicionalPagar'].forEach(f => document.getElementById(f).disabled = apenasVisualizacao);

    document.getElementById('editPagamentoLiberado').checked = !!v.pagamentoLiberado;
    document.getElementById('editPagamentoRealizadoStatus').value = v.pagamentoRealizadoStatus || 'NAO_REALIZADO';
    ['editPagamentoLiberado', 'editPagamentoRealizadoStatus'].forEach(f => document.getElementById(f).disabled = apenasVisualizacao);

    const selStatus = document.getElementById('editStatus');
    selStatus.value = v.status || 'PROGRAMADO';
    selStatus.disabled = apenasVisualizacao;

    document.getElementById('editObservacao').value = v.observacao || '';
    document.getElementById('editObservacao').disabled = apenasVisualizacao;

    document.getElementById('editarViagemModal').style.display = 'flex';
}

function fecharModalEditarViagem() { document.getElementById('editarViagemModal').style.display = 'none'; }

async function salvarEdicaoViagem() {
    const id = document.getElementById('editViagemId').value;
    const origens = obterValoresDuplos('edit-origem-nome', 'edit-origem-end');
    const destinos = obterValoresDuplos('edit-destino-nome', 'edit-destino-end');

    const selMot = document.getElementById('editSelectMotorista');
    const optSelected = selMot.options[selMot.selectedIndex];

    const payload = {
        cliente: document.getElementById('editCliente').value,
        origemNome: origens.nomes,
        localColeta: origens.enderecos,
        origem: origens.enderecos,
        destinoNome: destinos.nomes,
        localEntrega: destinos.enderecos,
        destino: destinos.enderecos,
        nomeMotorista: optSelected ? optSelected.text.split(' (')[0] : '',
        placa: optSelected ? optSelected.getAttribute('data-placa') : '',
        dataColetaPrevista: document.getElementById('editDataColetaPrevista').value,
        dataColetaReal: document.getElementById('editDataColetaReal').value,
        dataEntregaPrevista: document.getElementById('editDataEntregaPrevista').value,
        dataEntregaReal: document.getElementById('editDataEntregaReal').value,
        valorAReceber: document.getElementById('editValorAReceber').value || 0,
        valorAdicionalReceber: document.getElementById('valorAdicionalReceber') ? document.getElementById('valorAdicionalReceber').value : (document.getElementById('editValorAdicionalReceber') ? document.getElementById('editValorAdicionalReceber').value : 0),
        valorAPagar: document.getElementById('editValorAPagar').value || 0,
        valorAdicionalPagar: document.getElementById('editValorAdicionalPagar').value || 0,
        pagamentoLiberado: document.getElementById('editPagamentoLiberado').checked,
        pagamentoRealizadoStatus: document.getElementById('editPagamentoRealizadoStatus').value,
        status: document.getElementById('editStatus').value,
        observacao: document.getElementById('editObservacao').value
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
            carregarViagens();
        }
    } catch (e) {
        console.error('Erro ao atualizar viagem:', e);
    }
}

async function deletarViagem(id) {
    if (!confirm(`Deseja realmente excluir a viagem #${id}?`)) return;
    try {
        const res = await fetch(`${API_BASE}/viagens/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) carregarViagens();
    } catch (e) {
        console.error('Erro ao deletar viagem:', e);
    }
}

/* --- VISUALIZADOR DE FOTOS / DOCUMENTOS --- */
function visualizarFoto(url) {
    if (!url) return alert('Arquivo não encontrado.');
    window.open(url, '_blank');
}

function abrirModalObs(texto) {
    document.getElementById('obsContent').textContent = texto;
    document.getElementById('obsModal').style.display = 'flex';
}
function fecharModalObs() { document.getElementById('obsModal').style.display = 'none'; }