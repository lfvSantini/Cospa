const API_BASE = 'http://localhost:8080/api';
const token = localStorage.getItem('token');
let listaMotoristas = [];
let listaViagensCache = []; // Guarda as viagens para carregar rápido na edição

if (!token) {
    window.location.href = 'index.html';
}

document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

// Helper para formatar LocalDateTime do backend (ex: "2026-08-07T12:30:00") para o input datetime-local ("2026-08-07T12:30")
function formatarParaDatetimeInput(dataStr) {
    if (!dataStr || dataStr === 'null') return '';
    return dataStr.slice(0, 16);
}

// Busca e lista viagens
async function carregarViagens() {
    try {
        const response = await fetch(`${API_BASE}/viagens`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            alert('Sessão expirada. Faça login novamente.');
            localStorage.removeItem('token');
            window.location.href = 'index.html';
            return;
        }

        listaViagensCache = await response.json();
        renderizarTabela(listaViagensCache);

    } catch (error) {
        console.error('Erro ao buscar viagens:', error);
    }
}

// Renderização da tabela de Viagens
function renderizarTabela(viagens) {
    const tbody = document.getElementById('viagensTbody');
    tbody.innerHTML = '';

    if (!viagens || viagens.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align: center;">Nenhuma viagem encontrada.</td></tr>`;
        return;
    }

    viagens.forEach(v => {
        const tr = document.createElement('tr');
        
        const temComprovante = v.urlFotoComprovante && v.urlFotoComprovante.trim() !== '' && v.urlFotoComprovante !== 'null';
        const comprovanteHtml = temComprovante
            ? `<button class="btn-action" style="background-color: #27ae60;" onclick="visualizarFoto('${v.urlFotoComprovante}')">Ver Foto</button>`
            : `<span style="color: #999; font-size: 12px;">Sem foto</span>`;

        const obs = v.observacao || '-';
        const obsDisplay = obs.length > 10 ? obs.substring(0, 10) + '...' : obs;

        const obsHtml = obs !== '-' 
            ? `<button type="button" class="btn-obs" onclick="abrirModalObs('${obs}')" title="Ver observação">${obsDisplay}</button>`
            : `<span style="color: #999;">-</span>`;

        const localColeta = v.localColeta || v.origem || '';
        const localEntrega = v.localEntrega || v.destino || '';
        const nomeMotorista = v.nomeMotorista || v.motorista || '';

        tr.innerHTML = `
            <td>#${v.id}</td>
            <td title="${v.cliente}">${v.cliente}</td>
            <td title="${localColeta}">${localColeta}</td>
            <td title="${localEntrega}">${localEntrega}</td>
            <td>${v.placa}</td>
            <td title="${nomeMotorista}">${nomeMotorista}</td>
            <td><span class="status-badge">${v.status || 'CRIADA'}</span></td>
            <td>${obsHtml}</td>
            <td>${comprovanteHtml}</td>
            <td class="actions-cell">
                <button class="btn-action" onclick="abrirModalUpload(${v.id})" title="Enviar Comprovante">Foto</button>
                <button class="btn-action" style="background-color: #f39c12;" onclick="abrirModalEditar(${v.id})" title="Alterar Viagem">Alterar</button>
                <button class="btn-action" style="background-color: #e74c3c;" onclick="deletarViagem(${v.id})" title="Excluir Viagem">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// EXCLUIR VIAGEM
async function deletarViagem(id) {
    if (!confirm(`Tem certeza que deseja excluir a Viagem #${id}?`)) return;

    try {
        const response = await fetch(`${API_BASE}/viagens/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('Viagem excluída com sucesso!');
            carregarViagens();
        } else {
            alert('Erro ao excluir a viagem.');
        }
    } catch (error) {
        console.error('Erro ao deletar viagem:', error);
    }
}

// Modal Observação
function abrirModalObs(texto) {
    document.getElementById('obsContent').textContent = texto;
    document.getElementById('obsModal').style.display = 'flex';
}

function fecharModalObs() {
    document.getElementById('obsModal').style.display = 'none';
}

// Carregar e listar Motoristas no Modal
async function carregarMotoristas() {
    try {
        const response = await fetch(`${API_BASE}/motoristas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            listaMotoristas = await response.json();
            preencherSelectsMotorista();
            renderizarTabelaMotoristas();
        } else {
            console.error('Erro ao buscar motoristas:', response.status);
        }
    } catch (error) {
        console.error('Erro de conexão ao carregar motoristas:', error);
    }
}

function preencherSelectsMotorista() {
    const selectCriar = document.getElementById('selectMotorista');
    const selectEditar = document.getElementById('editSelectMotorista');

    let options = '<option value="">Selecione um Motorista</option>';
    listaMotoristas.forEach(m => {
        options += `<option value="${m.id}" data-nome="${m.nome}" data-placa="${m.placa}" data-cpf="${m.cpf || ''}">${m.nome} (${m.placa})</option>`;
    });

    if (selectCriar) selectCriar.innerHTML = options;
    if (selectEditar) selectEditar.innerHTML = options;
}

// Renderiza as linhas da tabela dentro do Modal de Motoristas
function renderizarTabelaMotoristas() {
    const tbody = document.getElementById('motoristasTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!listaMotoristas || listaMotoristas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 1rem; color: #888;">Nenhum motorista cadastrado.</td></tr>`;
        return;
    }

    listaMotoristas.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding: 0.6rem;">${m.nome}</td>
            <td style="padding: 0.6rem;">${m.cpf || '-'}</td>
            <td style="padding: 0.6rem;">${m.placa}</td>
            <td style="padding: 0.6rem; text-align: right; display: flex; gap: 6px; justify-content: flex-end;">
                <button class="btn-action" style="background-color: #f39c12;" onclick="editarMotorista(${m.id}, '${m.nome}', '${m.cpf || ''}', '${m.placa}')">Editar</button>
                <button class="btn-action" style="background-color: #e74c3c;" onclick="deletarMotorista(${m.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Evento de Submissão para Cadastrar/Atualizar Motorista
const formMotorista = document.getElementById('motoristaForm');
if (formMotorista) {
    formMotorista.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('motoristaId').value;
        const nome = document.getElementById('motoristaNome').value;
        const cpf = document.getElementById('motoristaCpf') ? document.getElementById('motoristaCpf').value : '';
        const placa = document.getElementById('motoristaPlaca').value.toUpperCase();

        const url = id ? `${API_BASE}/motoristas/${id}` : `${API_BASE}/motoristas`;
        const method = id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nome, cpf, placa })
            });

            if (res.ok) {
                document.getElementById('motoristaForm').reset();
                document.getElementById('motoristaId').value = '';
                document.getElementById('btnSalvarMotorista').textContent = 'Cadastrar';
                await carregarMotoristas();
            } else {
                const err = await res.json().catch(() => ({}));
                alert('Erro ao salvar motorista: ' + (err.mensagem || 'Verifique se a placa ou CPF já existem.'));
            }
        } catch (error) {
            console.error('Erro ao salvar motorista:', error);
            alert('Falha na comunicação com o servidor.');
        }
    });
}

function editarMotorista(id, nome, cpf, placa) {
    document.getElementById('motoristaId').value = id;
    document.getElementById('motoristaNome').value = nome;
    if (document.getElementById('motoristaCpf')) document.getElementById('motoristaCpf').value = cpf;
    document.getElementById('motoristaPlaca').value = placa;
    document.getElementById('btnSalvarMotorista').textContent = 'Atualizar';
}

// Deletar Motorista
async function deletarMotorista(id) {
    if (!confirm('Deseja realmente excluir este motorista?')) return;
    try {
        const res = await fetch(`${API_BASE}/motoristas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            await carregarMotoristas();
        } else {
            alert('Erro ao excluir motorista.');
        }
    } catch (error) {
        console.error('Erro ao deletar motorista:', error);
    }
}

// Controladores dos Modais
function abrirModalMotoristas() { document.getElementById('motoristasModal').style.display = 'flex'; }
function fecharModalMotoristas() { document.getElementById('motoristasModal').style.display = 'none'; }
function abrirModalNovaViagem() { document.getElementById('novaViagemForm').reset(); document.getElementById('novaViagemModal').style.display = 'flex'; }
function fecharModalNovaViagem() { document.getElementById('novaViagemModal').style.display = 'none'; }

// ABRIR MODAL EDITAR (Carrega todos os dados detalhados da viagem)
function abrirModalEditar(id) {
    const v = listaViagensCache.find(item => item.id === id);
    if (!v) return;

    document.getElementById('editViagemIdAntigo').value = v.id;
    document.getElementById('editViagemId').value = v.id;
    document.getElementById('editViagemIdTitle').textContent = `#${v.id}`;
    document.getElementById('editCliente').value = v.cliente || '';
    document.getElementById('editOrigem').value = v.localColeta || v.origem || '';
    document.getElementById('editDestino').value = v.localEntrega || v.destino || '';
    document.getElementById('editStatus').value = v.status || 'CRIADA';
    document.getElementById('editObservacao').value = (v.observacao && v.observacao !== 'null') ? v.observacao : '';

    // Novos campos
    if (document.getElementById('editCpfMotorista')) {
        document.getElementById('editCpfMotorista').value = v.cpfMotorista || '';
    }
    if (document.getElementById('editDataColetaPrevista')) {
        document.getElementById('editDataColetaPrevista').value = formatarParaDatetimeInput(v.dataColetaPrevista);
    }
    if (document.getElementById('editDataColetaReal')) {
        document.getElementById('editDataColetaReal').value = formatarParaDatetimeInput(v.dataColetaReal);
    }
    if (document.getElementById('editDataEntregaPrevista')) {
        document.getElementById('editDataEntregaPrevista').value = formatarParaDatetimeInput(v.dataEntregaPrevista);
    }
    if (document.getElementById('editDataEntregaReal')) {
        document.getElementById('editDataEntregaReal').value = formatarParaDatetimeInput(v.dataEntregaReal);
    }

    // Seleção do Motorista
    const select = document.getElementById('editSelectMotorista');
    if (select) {
        for (let option of select.options) {
            if (option.getAttribute('data-nome') === v.nomeMotorista) {
                option.selected = true;
                break;
            }
        }
    }
    
    document.getElementById('editarViagemModal').style.display = 'flex';
}
function fecharModalEditarViagem() { document.getElementById('editarViagemModal').style.display = 'none'; }

function abrirModalUpload(id) {
    document.getElementById('modalViagemId').value = id;
    document.getElementById('modalViagemInfo').textContent = `Viagem #${id}`;
    document.getElementById('uploadModal').style.display = 'flex';
}
function fecharModal() { document.getElementById('uploadModal').style.display = 'none'; }

// Cadastrar Viagem
document.getElementById('novaViagemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const select = document.getElementById('selectMotorista');
    const optionSelecionada = select.options[select.selectedIndex];

    if (!optionSelecionada || !optionSelecionada.value) {
        alert('Por favor, selecione um motorista.');
        return;
    }

    const novaViagem = {
        id: Number(document.getElementById('viagemId').value),
        cliente: document.getElementById('cliente').value,
        localColeta: document.getElementById('origem').value,
        localEntrega: document.getElementById('destino').value,
        nomeMotorista: optionSelecionada.getAttribute('data-nome'),
        placa: optionSelecionada.getAttribute('data-placa'),
        observacao: document.getElementById('observacao').value
    };

    try {
        const response = await fetch(`${API_BASE}/viagens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(novaViagem)
        });

        if (response.ok) {
            alert('Viagem cadastrada com sucesso!');
            fecharModalNovaViagem();
            carregarViagens();
        } else {
            alert('Erro ao cadastrar viagem.');
        }
    } catch (error) {
        console.error('Erro ao cadastrar viagem:', error);
    }
});

// Alterar Viagem (COM OS NOVOS CAMPOS NO PAYLOAD)
document.getElementById('editarViagemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const idAntigo = document.getElementById('editViagemIdAntigo').value;
    const novoId = Number(document.getElementById('editViagemId').value);
    
    const select = document.getElementById('editSelectMotorista');
    const optionSelecionada = select.options[select.selectedIndex];

    if (!optionSelecionada || !optionSelecionada.value) {
        alert('Por favor, selecione um motorista.');
        return;
    }

    const viagemAtualizada = {
        id: novoId,
        cliente: document.getElementById('editCliente').value,
        localColeta: document.getElementById('editOrigem').value,
        localEntrega: document.getElementById('editDestino').value,
        nomeMotorista: optionSelecionada.getAttribute('data-nome'),
        placa: optionSelecionada.getAttribute('data-placa'),
        cpfMotorista: document.getElementById('editCpfMotorista') ? document.getElementById('editCpfMotorista').value : null,
        dataColetaPrevista: document.getElementById('editDataColetaPrevista') ? (document.getElementById('editDataColetaPrevista').value || null) : null,
        dataColetaReal: document.getElementById('editDataColetaReal') ? (document.getElementById('editDataColetaReal').value || null) : null,
        dataEntregaPrevista: document.getElementById('editDataEntregaPrevista') ? (document.getElementById('editDataEntregaPrevista').value || null) : null,
        dataEntregaReal: document.getElementById('editDataEntregaReal') ? (document.getElementById('editDataEntregaReal').value || null) : null,
        status: document.getElementById('editStatus').value,
        observacao: document.getElementById('editObservacao').value
    };

    try {
        const response = await fetch(`${API_BASE}/viagens/${idAntigo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(viagemAtualizada)
        });

        if (response.ok) {
            alert('Viagem alterada com sucesso!');
            fecharModalEditarViagem();
            carregarViagens();
        } else {
            alert('Erro ao alterar viagem.');
        }
    } catch (error) {
        console.error('Erro ao alterar viagem:', error);
    }
});

// Upload Foto
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('modalViagemId').value;
    const fileInput = document.getElementById('fileInput');
    
    if (!fileInput.files[0]) {
        alert('Selecione um arquivo.');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        const response = await fetch(`${API_BASE}/viagens/${id}/comprovante`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        if (response.ok) {
            alert('Comprovante enviado com sucesso!');
            fecharModal();
            carregarViagens();
        } else {
            alert('Erro ao enviar comprovante.');
        }
    } catch (error) {
        console.error('Erro no upload:', error);
    }
});

// Visualizar Foto
async function visualizarFoto(urlFoto) {
    try {
        const response = await fetch(`http://localhost:8080${urlFoto}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Foto não encontrada.');
        const blob = await response.blob();
        window.open(URL.createObjectURL(blob), '_blank');
    } catch (error) {
        alert(error.message);
    }
}

// Inicializa
carregarMotoristas();
carregarViagens();