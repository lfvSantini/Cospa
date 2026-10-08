import { Component, OnInit, HostListener, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth';
import { ViagemService } from '../../core/services/viagem';
import { MotoristaService } from '../../core/services/motorista';
import { ClienteService } from '../../core/services/cliente';
import { FornecedorService } from '../../core/services/fornecedor';
import { VeiculoService } from '../../core/services/veiculo';
import { RotaService, LocalCliente } from '../../core/services/rota';
import { Viagem, TipoOperacao, TipoAdicional, ViagemDataItem } from '../../core/models/viagem.model';
import { Motorista } from '../../core/models/motorista.model';
import { Cliente } from '../../core/models/cliente.model';
import { Fornecedor } from '../../core/models/fornecedor.model';
import { environment } from '../../../environments/environment';

export interface PontoRotaCompleto {
  local: string;
  endereco: string;
  linkLocalizacao?: string;
  dataPrevista: string;
  dataReal: string;
}

export interface ComprovanteItem {
  id: number;
  descricao: string;
  url: string;
  nomeArquivo: string;
  dataEnvio: string;
}

export interface ViagemItem {
  id: string;
  rawId: number;
  numeroOperacional: string;
  cliente: string;
  origem: string[];
  destino: string[];
  coletaPrevista: string;
  entregaPrevista: string;
  placa: string;
  motorista: string;
  status: string;
  obs?: string;
  fotos?: ComprovanteItem[];
  rawViagem?: Viagem;
}

export interface FornecedorModel {
  id: number;
  nome: string;
  cnpjCpf: string;
  nomeContato: string;
  telefone: string;
  email: string;
  chavePix: string;
  formaPagamento: string;
  situacao: 'ATIVO' | 'INATIVO';
  obs?: string;
}

export interface ClienteModel {
  id: number;
  nomeFantasia: string;
  razaoSocial: string;
  cnpjCpf: string;
  nomeContato: string;
  telefone: string;
  email: string;
  situacao: 'ATIVO' | 'INATIVO';
  obs?: string;
}

export interface MotoristaModel {
  id: number;
  nome: string;
  cpf: string;
  telefone?: string;
  email?: string;
  placa?: string;
  fornecedorVinculado: string;
  situacao: 'ATIVO' | 'INATIVO';
  informacoesAdicionais?: string;
  documentos?: ComprovanteItem[];
}

export interface VeiculoModel {
  id: number;
  placa: string;
  tipoVeiculo: string;
  tipoCarroceria: string;
  adicional: string;
  numeroEixos: string;
  cubagemBau: string;
  capacidadePeso: string;
  numeroPaletes: string;
  anoFabricacao: string;
  dataVencimento: string;
  cidadeUf: string;
  fornecedor: string;
  agenciador: string;
  numeroAntt: string;
  tipoRastreador: string;
  idRastreador: string;
  tagPedagio: string;
  situacao: 'ATIVO' | 'INATIVO';
  documentos?: ComprovanteItem[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  public authService = inject(AuthService);
  private http = inject(HttpClient);
  private viagemService = inject(ViagemService);
  private motoristaService = inject(MotoristaService);
  private clienteService = inject(ClienteService);
  private fornecedorService = inject(FornecedorService);
  private veiculoService = inject(VeiculoService);
  private rotaService = inject(RotaService);
  private cdr = inject(ChangeDetectorRef);

  public appVersion: string = environment.appVersion;

  uploadsUrl = environment.uploadsUrl || environment.apiUrl;
  isLoading: boolean = false;

  isDarkMode: boolean = true;
  isSidebarOpen: boolean = false;
  isManageOpen: boolean = false;

  openedActionMenuId: number | null = null;

  showAndamento: boolean = true;
  showFinalizadas: boolean = false;

  listaStatus: string[] = [
    'PROGRAMADO',
    'A CONTRATAR',
    'AG CARREGAMENTO',
    'CARREGAMENTO',
    'AG DOC CLIENTE',
    'AG DOC COSPA',
    'EM ROTA',
    'AG DESCARGA',
    'DESCARGA',
    'AG CANHOTO',
    'FINALIZADO'
  ];

  filtroColunas = {
    id: '',
    numeroRota: '',
    cliente: '',
    origem: '',
    destino: '',
    coletaPrevista: '',
    entregaPrevista: '',
    placa: '',
    motorista: '',
    status: '',
    obs: ''
  };

  modalType: 'TRIP_FORM' | 'PHOTO' | 'OBS' | 'CANCELAR' | 'FORNECEDOR' | 'CLIENTE' | 'MOTORISTA' | 'VEICULO' | 'MOTORISTA_PHOTO' | 'VEICULO_PHOTO' | 'ROTA' | null = null;
  private previousModalType: 'PHOTO' | 'MOTORISTA_PHOTO' | 'VEICULO_PHOTO' | null = null;

  activeManageTab: 'CADASTRAR' | 'LISTAR' = 'CADASTRAR';
  manageSearchTerm: string = '';
  buscaLocalCadastro: string = '';
  buscaVeiculoCadastro: string = '';

  activePhotoTab: 'ADICIONAR' | 'LISTAR' = 'ADICIONAR';
  activeMotoristaPhotoTab: 'ADICIONAR' | 'LISTAR' = 'ADICIONAR';
  activeVeiculoPhotoTab: 'ADICIONAR' | 'LISTAR' = 'ADICIONAR';
  previewImageUrl: string | null = null;

  isDraggingComprovante: boolean = false;
  isDraggingMotoristaDoc: boolean = false;
  isDraggingVeiculoDoc: boolean = false;

  novoComprovante = { descricao: '', arquivo: null as File | null, nomeArquivo: '' };
  novoDocMotorista = { nome: '', descricao: '', arquivo: null as File | null, nomeArquivo: '' };
  novoDocVeiculo = { nome: '', descricao: '', arquivo: null as File | null, nomeArquivo: '' };

  selectedMotorista: MotoristaModel | null = null;
  selectedVeiculo: VeiculoModel | null = null;

  fornecedoresList: FornecedorModel[] = [];
  filteredFornecedores: FornecedorModel[] = [];
  fornecedorForm: FornecedorModel = this.getEmptyFornecedor();
  isEditingFornecedor: boolean = false;

  clientesList: ClienteModel[] = [];
  filteredClientes: ClienteModel[] = [];
  clienteForm: ClienteModel = this.getEmptyCliente();
  isEditingCliente: boolean = false;

  motoristasList: MotoristaModel[] = [];
  filteredMotoristas: MotoristaModel[] = [];
  motoristaForm: MotoristaModel = this.getEmptyMotorista();
  isEditingMotorista: boolean = false;

  veiculosList: VeiculoModel[] = [];
  filteredVeiculos: VeiculoModel[] = [];
  veiculoForm: VeiculoModel = this.getEmptyVeiculo();
  isEditingVeiculo: boolean = false;

  rotasList: LocalCliente[] = [];
  filteredRotas: LocalCliente[] = [];
  locaisDoClienteSelecionado: LocalCliente[] = [];
  rotaForm: LocalCliente = this.getEmptyRota();
  isEditingRota: boolean = false;

  tiposVeiculosOpcoes: string[] = [
    'Carro de passeio', 'Fiorino', 'Van', 'HR', 'Vuc', '3.4',
    'Toco', 'Truck', 'Bitruck', 'Cavalo', 'Bau reboque', 'Bitrem', 'Rodotrem'
  ];

  tiposCarroceriaOpcoes: string[] = [
    'Nenhum', 'Bau Seco', 'Bau Refrigerado', 'Baú Frigorífico', 'Bau Blindado',
    'Bau Plataforma', 'Sider', 'Aberta', 'Graneleira'
  ];

  tiposTagPedagioOpcoes: string[] = [
    'Nenhum', 'Sem Parar', 'Veloe', 'ConectCar', 'Move Mais', 'Taggy', 'Outro'
  ];

  tiposOperacaoOpcoes: TipoOperacao[] = [
    'Transferência', 'Coleta', 'Entrega', 'Devolução'
  ];

  tiposAdicionalOpcoes: string[] = [
    'Ajudante', 'Diária', 'Multa', 'Complemento de frete'
  ];

  tripForm = {
    id: '',
    clienteSelect: '',
    tipoOperacao: 'Coleta' as TipoOperacao,
    origens: [{ local: '', endereco: '', linkLocalizacao: '', dataPrevista: '', dataReal: '' }] as PontoRotaCompleto[],
    destinos: [{ local: '', endereco: '', linkLocalizacao: '', dataPrevista: '', dataReal: '' }] as PontoRotaCompleto[],
    perfilVeiculo: '',
    carroceriaVeiculo: 'Nenhum',
    motorista: '',
    placa: '',
    placaSecundaria: '',
    agencia: 'Frota Própria',
    agenciador: '',
    especialistaCospa: '',
    valorReceber: 0,
    adicionalReceber: 0,
    tipoAdicionalReceber: '' as string,
    valorPagarMotorista: 0,
    adicionalPagarMotorista: 0,
    tipoAdicionalPagar: '' as string,
    valorAgenciador: 0,
    valorEspecialistaCospa: 0,
    pagamentoLiberado: false,
    dataAdiantamento: '',
    pagoAdiantamento: false,
    dataSaldo: '',
    pagoSaldo: false,
    dataAdicional: '',
    pagoAdicional: false,
    statusInicial: 'PROGRAMADO' as string,
    observacao: ''
  };

  selectedViagem: ViagemItem | null = null;
  selectedListOrigin: 'andamento' | 'finalizadas' = 'andamento';
  isEditing: boolean = false;
  motivoCancelamento: string = '';

  viagensAndamento: ViagemItem[] = [];
  viagensFinalizadas: ViagemItem[] = [];

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('cospa_theme');
    this.isDarkMode = savedTheme !== 'light';
    this.carregarTodosDados();
  }

  private normalizarTexto(texto: string | null | undefined): string {
    if (!texto) return '';
    return texto
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  contarPorStatus(st: string): number {
    const todas = [...this.viagensAndamento, ...this.viagensFinalizadas];
    return todas.filter(v => (v.status || '').toString().trim().toUpperCase() === st.trim().toUpperCase()).length;
  }

  alterarStatusRapido(item: ViagemItem, novoStatus: string): void {
    if (!item || !item.rawId) return;
    const statusAntigo = item.status;
    item.status = novoStatus;

    const statusFormatado = novoStatus.trim().toUpperCase().replace(/\s+/g, '_');

    this.http.patch(`${environment.apiUrl}/viagens/${item.rawId}/status?status=${encodeURIComponent(statusFormatado)}`, {}).subscribe({
      next: () => {
        this.carregarViagens();
      },
      error: (err) => {
        console.error('Erro ao atualizar status rápido:', err);
        item.status = statusAntigo;
        this.cdr.detectChanges();
      }
    });
  }

  @HostListener('window:paste', ['$event'])
  handlePaste(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData;
    if (!clipboardData || !clipboardData.items) return;

    for (let i = 0; i < clipboardData.items.length; i++) {
      const item = clipboardData.items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          const timestamp = new Date().getTime();
          const ext = file.type.split('/')[1] || 'png';
          const pastedFile = new File([file], `print_${timestamp}.${ext}`, { type: file.type });

          if (this.modalType === 'PHOTO') {
            this.novoComprovante.arquivo = pastedFile;
            this.novoComprovante.nomeArquivo = pastedFile.name;
            if (!this.novoComprovante.descricao.trim()) {
              this.novoComprovante.descricao = 'Comprovante Colado';
            }
            this.activePhotoTab = 'ADICIONAR';
            this.cdr.detectChanges();
            event.preventDefault();
            break;
          } else if (this.modalType === 'MOTORISTA_PHOTO') {
            this.novoDocMotorista.arquivo = pastedFile;
            this.novoDocMotorista.nomeArquivo = pastedFile.name;
            if (!this.novoDocMotorista.nome.trim()) {
              this.novoDocMotorista.nome = 'Documento Colado';
            }
            this.activeMotoristaPhotoTab = 'ADICIONAR';
            this.cdr.detectChanges();
            event.preventDefault();
            break;
          } else if (this.modalType === 'VEICULO_PHOTO') {
            this.novoDocVeiculo.arquivo = pastedFile;
            this.novoDocVeiculo.nomeArquivo = pastedFile.name;
            if (!this.novoDocVeiculo.nome.trim()) {
              this.novoDocVeiculo.nome = 'Documento Colado';
            }
            this.activeVeiculoPhotoTab = 'ADICIONAR';
            this.cdr.detectChanges();
            event.preventDefault();
            break;
          }
        }
      }
    }
  }

  carregarTodosDados(): void {
    this.carregarViagens();
    this.carregarMotoristas();
    this.carregarClientes();
    this.carregarFornecedores();
    this.carregarVeiculos();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('cospa_theme', this.isDarkMode ? 'dark' : 'light');
    this.cdr.detectChanges();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.cdr.detectChanges();
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
    this.cdr.detectChanges();
  }

  toggleManageMenu(event?: Event): void {
    if (event) event.stopPropagation();
    this.isManageOpen = !this.isManageOpen;
    this.openedActionMenuId = null;
    this.cdr.detectChanges();
  }

  toggleRowActions(event: Event, rawId: number): void {
    event.stopPropagation();
    this.openedActionMenuId = this.openedActionMenuId === rawId ? null : rawId;
    this.isManageOpen = false;
    this.cdr.detectChanges();
  }

  closeRowActions(): void {
    this.openedActionMenuId = null;
    this.cdr.detectChanges();
  }

  closeAllMenus(): void {
    this.isManageOpen = false;
    this.openedActionMenuId = null;
    this.cdr.detectChanges();
  }

  goToModules(): void {
    this.router.navigate(['/modules']);
  }

  goToFinanceiro(): void {
    this.router.navigate(['/financeiro']);
  }

  logout(): void {
    this.authService.logout();
  }

  closeModal(): void {
    this.modalType = null;
    this.previousModalType = null;
    this.selectedViagem = null;
    this.selectedMotorista = null;
    this.selectedVeiculo = null;
    this.activeManageTab = 'CADASTRAR';
    this.activePhotoTab = 'ADICIONAR';
    this.activeMotoristaPhotoTab = 'ADICIONAR';
    this.activeVeiculoPhotoTab = 'ADICIONAR';
    this.manageSearchTerm = '';
    this.buscaLocalCadastro = '';
    this.buscaVeiculoCadastro = '';
    this.previewImageUrl = null;
    this.motivoCancelamento = '';
    this.isDraggingComprovante = false;
    this.isDraggingMotoristaDoc = false;
    this.isDraggingVeiculoDoc = false;
    this.cdr.detectChanges();
  }

  trocarAbaGerenciar(tab: 'CADASTRAR' | 'LISTAR', event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.activeManageTab = tab;
    this.cdr.detectChanges();
  }

  trocarAbaFoto(aba: 'ADICIONAR' | 'LISTAR', event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.activePhotoTab = aba;
    this.cdr.detectChanges();
  }

  trocarAbaMotoristaFoto(aba: 'ADICIONAR' | 'LISTAR', event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.activeMotoristaPhotoTab = aba;
    this.cdr.detectChanges();
  }

  trocarAbaVeiculoFoto(aba: 'ADICIONAR' | 'LISTAR', event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.activeVeiculoPhotoTab = aba;
    this.cdr.detectChanges();
  }

  baixarBackupZip(): void {
    window.open(`${environment.apiUrl}/admin/backup/uploads-zip`, '_blank');
    this.closeSidebar();
  }

  onRestaurarBackupSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target || !target.files || target.files.length === 0) return;

    const file = target.files[0];
    if (!file.name.endsWith('.zip')) {
      alert('Selecione um arquivo .zip');
      return;
    }

    if (!confirm('Deseja restaurar este backup completo? As fotos e o banco de dados serão atualizados com o conteúdo do .zip.')) {
      target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.http.post(`${environment.apiUrl}/admin/backup/restaurar-zip`, formData, { responseType: 'text' })
      .subscribe({
        next: (res) => {
          alert(res);
          this.carregarTodosDados();
          target.value = '';
          this.closeSidebar();
        },
        error: (err) => {
          alert('Erro ao restaurar backup: ' + (err.error || err.message));
          target.value = '';
        }
      });
  }

  public isPdf(url: string | null | undefined): boolean {
    if (!url) return false;
    return url.toLowerCase().includes('.pdf') || url.toLowerCase().endsWith('.pdf');
  }

  public sanitizarUrlArquivo(url: string | null | undefined): string {
    if (!url) return '';
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      const rawBase = environment.apiUrl || this.uploadsUrl || '';
      const baseDomain = rawBase.replace(/\/api\/?$/, '').replace(/\/uploads\/?$/, '').replace(/\/+$/, '');
      const cleanPath = url.replace(/^\/+/, '');
      fullUrl = `${baseDomain}/${cleanPath}`;
    }
    return fullUrl.replace(/\/uploads\/+uploads\//g, '/uploads/');
  }

  docUrl(url: string | null | undefined): string {
    return this.sanitizarUrlArquivo(url);
  }

  onMotoristaSelectChange(): void {
    if (!this.tripForm.motorista) return;
    let nomeBusca = this.normalizarTexto(this.tripForm.motorista);

    if (nomeBusca.includes(' (cpf:')) {
      nomeBusca = nomeBusca.split(' (cpf:')[0].trim();
    }

    const mot = this.motoristasList.find(m => this.normalizarTexto(m.nome) === nomeBusca);
    if (mot) {
      this.tripForm.motorista = mot.nome;
      if (mot.fornecedorVinculado) {
        this.tripForm.agencia = mot.fornecedorVinculado;
      }
    }
    this.cdr.detectChanges();
  }

  // CORREÇÃO PONTUAL: Não sobrescrever o Perfil/Carroceria da viagem pela placa do veículo
  onPlacaSelectChange(): void {
    if (!this.tripForm.placa) return;
    let placaBusca = this.tripForm.placa.trim().toUpperCase();

    if (placaBusca.includes(' - ')) {
      placaBusca = placaBusca.split(' - ')[0].trim();
      this.tripForm.placa = placaBusca;
    }

    const veic = this.veiculosList.find(v => v.placa.toUpperCase() === placaBusca);
    if (veic) {
      if (veic.fornecedor) {
        this.tripForm.agencia = veic.fornecedor;
      }
      // O perfil e carroceria são preenchidos conforme o cliente solicita e NÃO são alterados automaticamente pela placa
    }
    this.cdr.detectChanges();
  }

  addOrigem(): void {
    this.tripForm.origens.push({ local: '', endereco: '', linkLocalizacao: '', dataPrevista: '', dataReal: '' });
    this.cdr.detectChanges();
  }

  removeOrigem(index: number): void {
    if (this.tripForm.origens.length > 1) {
      this.tripForm.origens.splice(index, 1);
      this.cdr.detectChanges();
    }
  }

  addDestino(): void {
    this.tripForm.destinos.push({ local: '', endereco: '', linkLocalizacao: '', dataPrevista: '', dataReal: '' });
    this.cdr.detectChanges();
  }

  removeDestino(index: number): void {
    if (this.tripForm.destinos.length > 1) {
      this.tripForm.destinos.splice(index, 1);
      this.cdr.detectChanges();
    }
  }

  getEmptyRota(): LocalCliente {
    return {
      clienteId: 0,
      nomeLocal: '',
      endereco: '',
      cep: '',
      cidade: '',
      uf: '',
      complemento: '',
      linkLocalizacao: '',
      ativo: true
    };
  }

  openGerenciarRotas(): void {
    this.rotaForm = this.getEmptyRota();
    this.isEditingRota = false;
    this.activeManageTab = 'CADASTRAR';
    this.modalType = 'ROTA';
    this.isManageOpen = false;
    this.buscaLocalCadastro = '';
    this.carregarRotas();
    this.cdr.detectChanges();
  }

  carregarRotas(): void {
    this.rotaService.listar().subscribe({
      next: (data: LocalCliente[]) => {
        this.rotasList = data || [];
        this.filtrarRotas();
        this.cdr.detectChanges();
      },
      error: (err: unknown) => console.error('Erro ao carregar rotas:', err)
    });
  }

  filtrarRotas(): void {
    const t = this.normalizarTexto(this.manageSearchTerm);
    if (!t) {
      this.filteredRotas = [...this.rotasList];
      return;
    }
    this.filteredRotas = this.rotasList.filter(r =>
      this.normalizarTexto(r.nomeLocal).includes(t) ||
      this.normalizarTexto(r.clienteNome).includes(t) ||
      this.normalizarTexto(r.cidade).includes(t) ||
      this.normalizarTexto(r.endereco).includes(t)
    );
  }

  onSelecionarLocalBusca(nome: string): void {
    if (!nome) return;
    const nomeNormal = this.normalizarTexto(nome);
    const encontrado = this.rotasList.find(r => this.normalizarTexto(r.nomeLocal) === nomeNormal);
    if (encontrado) {
      this.editarRota(encontrado);
      this.buscaLocalCadastro = '';
    }
  }

  salvarRota(): void {
    if (!this.rotaForm.clienteId || !this.rotaForm.nomeLocal.trim() || !this.rotaForm.endereco.trim()) {
      alert('Selecione o cliente e informe o nome do local e o endereço.');
      return;
    }

    const payload: LocalCliente = {
      ...this.rotaForm,
      clienteId: Number(this.rotaForm.clienteId),
      nomeLocal: this.rotaForm.nomeLocal.toUpperCase().trim(),
      endereco: this.rotaForm.endereco.toUpperCase().trim(),
      cidade: (this.rotaForm.cidade || '').toUpperCase().trim(),
      uf: (this.rotaForm.uf || '').toUpperCase().trim(),
      complemento: (this.rotaForm.complemento || '').toUpperCase().trim(),
      linkLocalizacao: (this.rotaForm.linkLocalizacao || '').trim()
    };

    this.rotaService.salvar(payload).subscribe({
      next: () => {
        this.carregarRotas();
        this.activeManageTab = 'LISTAR';
        this.rotaForm = this.getEmptyRota();
        this.isEditingRota = false;
        this.buscaLocalCadastro = '';
        if (this.tripForm.clienteSelect) {
          this.onClienteSelectChange(this.tripForm.clienteSelect);
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => alert('Erro ao salvar local da rota: ' + (err?.error?.message || err?.message || 'Erro'))
    });
  }

  editarRota(r: LocalCliente): void {
    this.rotaForm = { ...r };
    this.isEditingRota = true;
    this.activeManageTab = 'CADASTRAR';
    this.cdr.detectChanges();
  }

  cancelarEdicaoRota(): void {
    this.rotaForm = this.getEmptyRota();
    this.isEditingRota = false;
    this.buscaLocalCadastro = '';
    this.cdr.detectChanges();
  }

  excluirRota(id?: number): void {
    if (!id || !confirm('Deseja realmente excluir este local de rota?')) return;
    this.rotaService.deletar(id).subscribe({
      next: () => {
        this.carregarRotas();
        if (this.tripForm.clienteSelect) {
          this.onClienteSelectChange(this.tripForm.clienteSelect);
        }
      },
      error: () => alert('Erro ao excluir local da rota.')
    });
  }

  onClienteSelectChange(nomeCliente: string): void {
    if (!nomeCliente || !nomeCliente.trim()) {
      this.locaisDoClienteSelecionado = [];
      return;
    }
    const nomeLimpo = nomeCliente.trim();

    this.http.get<LocalCliente[]>(`${environment.apiUrl}/rotas/buscar?nome=${encodeURIComponent(nomeLimpo)}`).subscribe({
      next: (locais: LocalCliente[]) => {
        this.locaisDoClienteSelecionado = locais || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.rotaService.buscarPorNomeCliente(nomeLimpo).subscribe({
          next: (locais: LocalCliente[]) => {
            this.locaisDoClienteSelecionado = locais || [];
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Erro ao buscar locais do cliente selecionado:', err)
        });
      }
    });
  }

  onOrigemLocalSelect(origIndex: number, nomeLocal: string): void {
    const nomeNormal = this.normalizarTexto(nomeLocal);
    const encontrado = this.locaisDoClienteSelecionado.find(
      l => this.normalizarTexto(l.nomeLocal) === nomeNormal
    );
    if (encontrado) {
      const compl = encontrado.complemento ? ` - ${encontrado.complemento}` : '';
      const cepStr = encontrado.cep ? `, CEP: ${encontrado.cep}` : '';
      this.tripForm.origens[origIndex].local = encontrado.nomeLocal;
      this.tripForm.origens[origIndex].endereco = `${encontrado.endereco}${compl} - ${encontrado.cidade}/${encontrado.uf}${cepStr}`;
      this.tripForm.origens[origIndex].linkLocalizacao = encontrado.linkLocalizacao || '';
    }
  }

  onDestinoLocalSelect(destIndex: number, nomeLocal: string): void {
    const nomeNormal = this.normalizarTexto(nomeLocal);
    const encontrado = this.locaisDoClienteSelecionado.find(
      l => this.normalizarTexto(l.nomeLocal) === nomeNormal
    );
    if (encontrado) {
      const compl = encontrado.complemento ? ` - ${encontrado.complemento}` : '';
      const cepStr = encontrado.cep ? `, CEP: ${encontrado.cep}` : '';
      this.tripForm.destinos[destIndex].local = encontrado.nomeLocal;
      this.tripForm.destinos[destIndex].endereco = `${encontrado.endereco}${compl} - ${encontrado.cidade}/${encontrado.uf}${cepStr}`;
      this.tripForm.destinos[destIndex].linkLocalizacao = encontrado.linkLocalizacao || '';
    }
  }

  carregarViagens(): void {
    this.isLoading = true;
    this.viagemService.listarTodas().subscribe({
      next: (viagens: Viagem[]) => {
        this.viagensAndamento = [];
        this.viagensFinalizadas = [];

        (viagens || []).forEach((v: Viagem) => {
          const item = this.mapViagemParaItem(v);
          const st = (item.status || '').toString().toUpperCase().replace(/_/g, ' ').trim();

          if (st === 'FINALIZADO' || st === 'CANCELADA') {
            this.viagensFinalizadas.push(item);
          } else {
            this.viagensAndamento.push(item);
          }
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Erro ao carregar viagens:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private mapViagemParaItem(v: any): ViagemItem {
    const rawOrigem = v.origem || v.origem_nome || v.origemNome || '';
    const rawDestino = v.destino || v.destino_nome || v.destinoNome || '';

    const origens = rawOrigem ? rawOrigem.split(';').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [];
    const destinos = rawDestino ? rawDestino.split(';').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [];

    const fotos: ComprovanteItem[] = (v.comprovantes || []).map((c: any) => ({
      id: c.id || 0,
      descricao: c.nome || c.descricao || 'Comprovante',
      url: this.sanitizarUrlArquivo(c.urlArquivo || c.url),
      nomeArquivo: c.nome || c.nomeArquivo || 'Arquivo',
      dataEnvio: c.dataEnvio || ''
    }));

    const rawNumOp = v.numeroOperacional ?? v.numero_operacional ?? v.numeroCte ?? '';
    const numOpStr = (rawNumOp !== null && rawNumOp !== undefined) ? String(rawNumOp).trim() : '';
    const displayId = numOpStr ? numOpStr : `#${v.id}`;

    return {
      id: displayId,
      rawId: v.id || 0,
      numeroOperacional: numOpStr,
      cliente: v.cliente,
      origem: origens.length ? origens : ['-'],
      destino: destinos.length ? destinos : ['-'],
      coletaPrevista: v.dataColetaPrevista || v.data_coleta_prevista || '-',
      entregaPrevista: v.dataEntregaPrevista || v.data_entrega_prevista || '-',
      placa: v.placa || '-',
      motorista: v.nomeMotorista || v.nome_motorista || 'A Contratar',
      status: v.status,
      obs: v.observacao || '-',
      fotos: fotos,
      rawViagem: v
    };
  }

  filtrarListaViagens(lista: ViagemItem[]): ViagemItem[] {
    return (lista || []).filter(item => {
      const matchId = !this.filtroColunas.id || item.rawId.toString().includes(this.filtroColunas.id.trim().replace(/^#/, ''));
      
      const termoRota = this.normalizarTexto(this.filtroColunas.numeroRota);
      const matchRota = !termoRota ||
        this.normalizarTexto(item.id).includes(termoRota) ||
        this.normalizarTexto(item.numeroOperacional).includes(termoRota);

      const matchCliente = !this.filtroColunas.cliente || this.normalizarTexto(item.cliente).includes(this.normalizarTexto(this.filtroColunas.cliente));
      const matchOrigem = !this.filtroColunas.origem || item.origem.some(o => this.normalizarTexto(o).includes(this.normalizarTexto(this.filtroColunas.origem)));
      const matchDestino = !this.filtroColunas.destino || item.destino.some(d => this.normalizarTexto(d).includes(this.normalizarTexto(this.filtroColunas.destino)));
      const matchColeta = !this.filtroColunas.coletaPrevista || this.normalizarTexto(item.coletaPrevista).includes(this.normalizarTexto(this.filtroColunas.coletaPrevista));
      const matchEntrega = !this.filtroColunas.entregaPrevista || this.normalizarTexto(item.entregaPrevista).includes(this.normalizarTexto(this.filtroColunas.entregaPrevista));
      const matchPlaca = !this.filtroColunas.placa || this.normalizarTexto(item.placa).includes(this.normalizarTexto(this.filtroColunas.placa));
      
      const matchMotorista = !this.filtroColunas.motorista || this.normalizarTexto(item.motorista).includes(this.normalizarTexto(this.filtroColunas.motorista));
      const matchStatus = !this.filtroColunas.status || this.normalizarTexto(item.status).includes(this.normalizarTexto(this.filtroColunas.status));
      const matchObs = !this.filtroColunas.obs || this.normalizarTexto(item.obs).includes(this.normalizarTexto(this.filtroColunas.obs));

      return matchId && matchRota && matchCliente && matchOrigem && matchDestino && matchColeta && matchEntrega && matchPlaca && matchMotorista && matchStatus && matchObs;
    });
  }

  finalizarViagem(item: ViagemItem): void {
    if (!item.rawViagem) return;
    const atualizada: any = { ...item.rawViagem, id: item.rawId, status: 'FINALIZADO' };

    this.viagemService.salvar(atualizada, true, item.rawId).subscribe({
      next: () => {
        this.showFinalizadas = true;
        this.closeRowActions();
        this.carregarViagens();
      },
      error: () => alert('Erro ao finalizar rota.')
    });
  }

  openFotoModal(item: ViagemItem): void {
    this.selectedViagem = item;
    if (!this.selectedViagem.fotos) {
      this.selectedViagem.fotos = [];
    }
    this.novoComprovante = { descricao: '', arquivo: null, nomeArquivo: '' };
    this.activePhotoTab = (this.selectedViagem.fotos && this.selectedViagem.fotos.length > 0) ? 'LISTAR' : 'ADICIONAR';
    this.modalType = 'PHOTO';
    this.closeRowActions();
    this.cdr.detectChanges();
  }

  onComprovanteFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      this.novoComprovante.arquivo = file;
      this.novoComprovante.nomeArquivo = file.name;
      if (!this.novoComprovante.descricao.trim()) {
        this.novoComprovante.descricao = file.name.replace(/\.[^/.]+$/, '').toUpperCase();
      }
      this.cdr.detectChanges();
    }
  }

  onComprovanteDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingComprovante = true;
  }

  onComprovanteDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingComprovante = false;
  }

  onComprovanteDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingComprovante = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.novoComprovante.arquivo = file;
      this.novoComprovante.nomeArquivo = file.name;
      if (!this.novoComprovante.descricao.trim()) {
        this.novoComprovante.descricao = file.name.replace(/\.[^/.]+$/, '').toUpperCase();
      }
      this.cdr.detectChanges();
    }
  }

  adicionarComprovante(): void {
    if (!this.selectedViagem || !this.novoComprovante.arquivo || !this.novoComprovante.descricao.trim()) {
      alert('Selecione um arquivo (ou cole com Ctrl+V) e informe uma descrição.');
      return;
    }

    const viagemAtual = this.selectedViagem;
    const nomeDescricao = this.novoComprovante.descricao.trim().toUpperCase();
    const arquivoParaEnvio = this.novoComprovante.arquivo;

    this.viagemService.uploadComprovante(viagemAtual.rawId, nomeDescricao, arquivoParaEnvio).subscribe({
      next: (compSalvo: any) => {
        const novoItem: ComprovanteItem = {
          id: compSalvo?.id || Date.now(),
          descricao: compSalvo?.nome || nomeDescricao,
          url: this.sanitizarUrlArquivo(compSalvo?.urlArquivo || compSalvo?.url || ''),
          nomeArquivo: compSalvo?.nome || arquivoParaEnvio.name,
          dataEnvio: compSalvo?.dataEnvio || 'Agora'
        };

        if (!viagemAtual.fotos) {
          viagemAtual.fotos = [];
        }
        viagemAtual.fotos.unshift(novoItem);

        this.novoComprovante = { descricao: '', arquivo: null, nomeArquivo: '' };
        this.activePhotoTab = 'LISTAR';
        this.carregarViagens();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro no upload do comprovante:', err);
        alert('Erro ao enviar comprovante.');
      }
    });
  }

  removerComprovante(event: Event, id: number): void {
    event.stopPropagation();
    if (!this.selectedViagem) return;

    this.viagemService.deletarComprovante(this.selectedViagem.rawId, id).subscribe({
      next: () => {
        if (this.selectedViagem?.fotos) {
          this.selectedViagem.fotos = this.selectedViagem.fotos.filter(f => f.id !== id);
        }
        this.carregarViagens();
        this.cdr.detectChanges();
      },
      error: () => alert('Erro ao deletar comprovante.')
    });
  }

  abrirPreviewFoto(url: string): void {
    const urlFormatada = this.sanitizarUrlArquivo(url);
    if (this.isPdf(urlFormatada)) {
      window.open(urlFormatada, '_blank');
      return;
    }
    this.previousModalType = this.modalType as any;
    this.modalType = null;
    this.previewImageUrl = urlFormatada;
    this.cdr.detectChanges();
  }

  abrirImagemNovaAba(event: Event, url: string): void {
    event.stopPropagation();
    window.open(this.sanitizarUrlArquivo(url), '_blank');
  }

  fecharPreviewFoto(): void {
    this.previewImageUrl = null;
    if (this.previousModalType) {
      this.modalType = this.previousModalType;
      this.previousModalType = null;
    }
    this.cdr.detectChanges();
  }

  carregarMotoristas(): void {
    this.motoristaService.listar().subscribe({
      next: (data: Motorista[]) => {
        this.motoristasList = (data || []).map((m: any) => ({
          id: m.id || 0,
          nome: m.nome,
          cpf: m.cpf || '',
          telefone: m.telefone || '',
          email: m.email || '',
          fornecedorVinculado: m.fornecedor || 'Frota Própria',
          situacao: (m.situacao === 'INATIVO' || m.ativo === false) ? 'INATIVO' : 'ATIVO',
          informacoesAdicionais: m.informacoesAdicionais || m.observacoes || '',
          documentos: (m.documentos || []).map((d: any) => ({
            id: d.id || 0,
            descricao: d.descricao || d.nome || '',
            url: this.sanitizarUrlArquivo(d.url || d.urlArquivo),
            nomeArquivo: d.nomeArquivo || d.descricao || '',
            dataEnvio: d.dataEnvio || ''
          }))
        }));
        this.filtrarMotoristas();
        this.cdr.detectChanges();
      },
      error: (err: unknown) => console.error('Erro ao carregar motoristas:', err)
    });
  }

  filtrarMotoristas(): void {
    const t = this.normalizarTexto(this.manageSearchTerm);
    if (!t) {
      this.filteredMotoristas = [...this.motoristasList];
      return;
    }
    this.filteredMotoristas = this.motoristasList.filter(m =>
      this.normalizarTexto(m.nome).includes(t) ||
      this.normalizarTexto(m.cpf).includes(t) ||
      this.normalizarTexto(m.telefone).includes(t) ||
      this.normalizarTexto(m.email).includes(t) ||
      this.normalizarTexto(m.fornecedorVinculado).includes(t)
    );
  }

  openMotoristaFotosModal(m: MotoristaModel): void {
    this.selectedMotorista = m;
    this.novoDocMotorista = { nome: '', descricao: '', arquivo: null, nomeArquivo: '' };
    this.activeMotoristaPhotoTab = (m.documentos && m.documentos.length > 0) ? 'LISTAR' : 'ADICIONAR';
    this.modalType = 'MOTORISTA_PHOTO';
    this.cdr.detectChanges();
  }

  onMotoristaDocSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      this.novoDocMotorista.arquivo = file;
      this.novoDocMotorista.nomeArquivo = file.name;
      if (!this.novoDocMotorista.nome.trim()) {
        this.novoDocMotorista.nome = file.name.replace(/\.[^/.]+$/, '').toUpperCase();
      }
      this.cdr.detectChanges();
    }
  }

  onMotoristaDocDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingMotoristaDoc = true;
  }

  onMotoristaDocDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingMotoristaDoc = false;
  }

  onMotoristaDocDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingMotoristaDoc = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.novoDocMotorista.arquivo = file;
      this.novoDocMotorista.nomeArquivo = file.name;
      if (!this.novoDocMotorista.nome.trim()) {
        this.novoDocMotorista.nome = file.name.replace(/\.[^/.]+$/, '').toUpperCase();
      }
      this.cdr.detectChanges();
    }
  }

  adicionarDocMotorista(): void {
    if (!this.selectedMotorista || !this.novoDocMotorista.arquivo) {
      alert('Selecione um arquivo para adicionar.');
      return;
    }

    const tipoDoc: string = this.novoDocMotorista.nome.trim().toUpperCase() || 'DOCUMENTO';
    const arquivoParaEnvio = this.novoDocMotorista.arquivo;
    const motoristaAtual = this.selectedMotorista;

    this.motoristaService.uploadDocumento(motoristaAtual.id, tipoDoc, arquivoParaEnvio).subscribe({
      next: (docSalvo: any) => {
        const novoDoc: ComprovanteItem = {
          id: docSalvo?.id || Date.now(),
          descricao: docSalvo?.descricao || docSalvo?.nome || tipoDoc,
          url: this.sanitizarUrlArquivo(docSalvo?.url || docSalvo?.urlArquivo || ''),
          nomeArquivo: docSalvo?.nomeArquivo || arquivoParaEnvio.name,
          dataEnvio: docSalvo?.dataEnvio || 'Agora'
        };

        if (!motoristaAtual.documentos) {
          motoristaAtual.documentos = [];
        }
        motoristaAtual.documentos.unshift(novoDoc);

        const motNaLista = this.motoristasList.find(m => m.id === motoristaAtual.id);
        if (motNaLista) {
          motNaLista.documentos = [...motoristaAtual.documentos];
        }

        this.filtrarMotoristas();
        this.novoDocMotorista = { nome: '', descricao: '', arquivo: null, nomeArquivo: '' };
        this.activeMotoristaPhotoTab = 'LISTAR';
        this.carregarMotoristas();
        this.cdr.detectChanges();
      },
      error: () => alert('Erro ao fazer upload do documento do motorista.')
    });
  }

  removerDocMotorista(event: Event, id: number): void {
    event.stopPropagation();
    if (!this.selectedMotorista) return;

    const motoristaAtual = this.selectedMotorista;

    this.motoristaService.deletarDocumentoExtra(id).subscribe({
      next: () => {
        if (motoristaAtual.documentos) {
          motoristaAtual.documentos = motoristaAtual.documentos.filter(d => d.id !== id);
        }

        const motNaLista = this.motoristasList.find(m => m.id === motoristaAtual.id);
        if (motNaLista) {
          motNaLista.documentos = (motoristaAtual.documentos || []).filter(d => d.id !== id);
        }

        this.filtrarMotoristas();
        this.carregarMotoristas();
        this.cdr.detectChanges();
      },
      error: () => alert('Erro ao excluir documento.')
    });
  }

  public getEmptyMotorista(): MotoristaModel {
    return { id: 0, nome: '', cpf: '', telefone: '', email: '', fornecedorVinculado: '', situacao: 'ATIVO', informacoesAdicionais: '', documentos: [] };
  }

  openGerenciarMotoristas(): void {
    this.motoristaForm = this.getEmptyMotorista();
    this.isEditingMotorista = false;
    this.activeManageTab = 'CADASTRAR';
    this.modalType = 'MOTORISTA';
    this.isManageOpen = false;
    this.filtrarMotoristas();
    this.cdr.detectChanges();
  }

  salvarMotorista(): void {
    if (!this.motoristaForm.nome.trim()) return;

    const cpfLimpo = (this.motoristaForm.cpf || '').replace(/\D/g, '').trim();
    const idAtual = this.isEditingMotorista ? this.motoristaForm.id : null;

    if (cpfLimpo) {
      const motoristaExistente = this.motoristasList.find(m => {
        const cpfCadastrado = (m.cpf || '').replace(/\D/g, '').trim();
        return cpfCadastrado === cpfLimpo && m.id !== idAtual;
      });

      if (motoristaExistente) {
        alert(`Atenção: O CPF "${this.motoristaForm.cpf}" já está cadastrado para o motorista "${motoristaExistente.nome}"!`);
        return;
      }
    }

    const payload: any = {
      id: this.isEditingMotorista ? this.motoristaForm.id : undefined,
      nome: this.motoristaForm.nome.toUpperCase(),
      cpf: this.motoristaForm.cpf.toUpperCase(),
      telefone: (this.motoristaForm.telefone || '').toUpperCase(),
      email: (this.motoristaForm.email || '').toUpperCase(),
      fornecedor: this.motoristaForm.fornecedorVinculado || 'Frota Própria',
      situacao: this.motoristaForm.situacao,
      ativo: this.motoristaForm.situacao === 'ATIVO',
      informacoesAdicionais: this.motoristaForm.informacoesAdicionais
    };

    this.motoristaService.salvar(payload).subscribe({
      next: () => {
        this.carregarMotoristas();
        this.activeManageTab = 'LISTAR';
        this.cancelarEdicaoMotorista();
        this.cdr.detectChanges();
      },
      error: () => alert('Erro ao salvar motorista.')
    });
  }

  editarMotorista(m: MotoristaModel): void {
    this.motoristaForm = { ...m };
    this.isEditingMotorista = true;
    this.activeManageTab = 'CADASTRAR';
    this.cdr.detectChanges();
  }

  excluirMotorista(id: number): void {
    if (!confirm('Deseja realmente excluir este motorista?')) return;
    this.motoristaService.deletar(id).subscribe({
      next: () => this.carregarMotoristas(),
      error: () => alert('Erro ao excluir motorista.')
    });
  }

  cancelarEdicaoMotorista(): void {
    this.motoristaForm = this.getEmptyMotorista();
    this.isEditingMotorista = false;
    this.cdr.detectChanges();
  }

  carregarVeiculos(): void {
    this.veiculoService.listar().subscribe({
      next: (data: any[]) => {
        this.veiculosList = (data || []).map((v: any) => ({
          id: v.id || 0,
          placa: v.placa || '',
          tipoVeiculo: v.tipoVeiculo || 'Truck',
          tipoCarroceria: v.tipoCarroceria || 'Nenhum',
          adicional: v.adicional || '',
          numeroEixos: v.numeroEixos || '',
          cubagemBau: v.cubagemBau || '',
          capacidadePeso: v.capacidadePeso || '',
          numeroPaletes: v.numeroPaletes || '',
          anoFabricacao: v.anoFabricacao || '',
          dataVencimento: v.dataVencimento || '',
          cidadeUf: v.cidadeUf || v.cidade_uf || '',
          fornecedor: v.fornecedor || 'Frota Própria',
          agenciador: v.agenciador || '',
          numeroAntt: v.numeroAntt || '',
          tipoRastreador: v.tipoRastreador || '',
          idRastreador: v.idRastreador || '',
          tagPedagio: v.tagPedagio || v.tag_pedagio || 'Nenhum',
          situacao: v.situacao || 'ATIVO',
          documentos: (v.documentos || []).map((d: any) => ({
            id: d.id || 0,
            descricao: d.descricao || d.nome || '',
            url: this.sanitizarUrlArquivo(d.url || d.urlArquivo),
            nomeArquivo: d.nomeArquivo || d.descricao || '',
            dataEnvio: d.dataEnvio || ''
          }))
        }));
        this.filtrarVeiculos();
        this.cdr.detectChanges();
      },
      error: (err: unknown) => console.error('Erro ao carregar veículos:', err)
    });
  }

  filtrarVeiculos(): void {
    const t = this.normalizarTexto(this.manageSearchTerm);
    if (!t) {
      this.filteredVeiculos = [...this.veiculosList];
      return;
    }
    this.filteredVeiculos = this.veiculosList.filter(v =>
      this.normalizarTexto(v.placa).includes(t) ||
      this.normalizarTexto(v.tipoVeiculo).includes(t) ||
      this.normalizarTexto(v.tipoCarroceria).includes(t) ||
      this.normalizarTexto(v.cidadeUf).includes(t) ||
      this.normalizarTexto(v.fornecedor).includes(t) ||
      this.normalizarTexto(v.agenciador).includes(t) ||
      this.normalizarTexto(v.idRastreador).includes(t)
    );
  }

  public getEmptyVeiculo(): VeiculoModel {
    return {
      id: 0,
      placa: '',
      tipoVeiculo: 'Truck',
      tipoCarroceria: 'Nenhum',
      adicional: '',
      numeroEixos: '',
      cubagemBau: '',
      capacidadePeso: '',
      numeroPaletes: '',
      anoFabricacao: '',
      dataVencimento: '',
      cidadeUf: '',
      fornecedor: 'Frota Própria',
      agenciador: '',
      numeroAntt: '',
      tipoRastreador: '',
      idRastreador: '',
      tagPedagio: 'Nenhum',
      situacao: 'ATIVO',
      documentos: []
    };
  }

  openGerenciarVeiculos(): void {
    this.veiculoForm = this.getEmptyVeiculo();
    this.isEditingVeiculo = false;
    this.activeManageTab = 'CADASTRAR';
    this.modalType = 'VEICULO';
    this.isManageOpen = false;
    this.buscaVeiculoCadastro = '';
    this.filtrarVeiculos();
    this.cdr.detectChanges();
  }

  onSelecionarVeiculoBusca(placaOuNome: string): void {
    if (!placaOuNome) return;
    const termo = this.normalizarTexto(placaOuNome);
    const encontrado = this.veiculosList.find(v => this.normalizarTexto(v.placa) === termo || this.normalizarTexto(v.placa).startsWith(termo));
    if (encontrado) {
      this.editarVeiculo(encontrado);
      this.buscaVeiculoCadastro = '';
    }
  }

  salvarVeiculo(): void {
    const placaLimpa = (this.veiculoForm.placa || '').toUpperCase().trim();
    if (!placaLimpa) {
      alert('Informe a placa do veículo.');
      return;
    }

    const idAtual = this.isEditingVeiculo ? this.veiculoForm.id : null;
    const placaExistente = this.veiculosList.find(v =>
      v.placa.toUpperCase().trim() === placaLimpa && v.id !== idAtual
    );

    if (placaExistente) {
      alert(`Atenção: A placa "${placaLimpa}" já está cadastrada no sistema!`);
      return;
    }

    const payload: any = {
      id: this.isEditingVeiculo ? this.veiculoForm.id : undefined,
      placa: placaLimpa,
      tipoVeiculo: this.veiculoForm.tipoVeiculo || 'Truck',
      tipoCarroceria: this.veiculoForm.tipoCarroceria || 'Nenhum',
      adicional: this.veiculoForm.adicional || '',
      numeroEixos: this.veiculoForm.numeroEixos || '',
      cubagemBau: this.veiculoForm.cubagemBau || '',
      capacidadePeso: this.veiculoForm.capacidadePeso || '',
      numeroPaletes: this.veiculoForm.numeroPaletes || '',
      anoFabricacao: this.veiculoForm.anoFabricacao || '',
      dataVencimento: this.veiculoForm.dataVencimento || '',
      cidadeUf: (this.veiculoForm.cidadeUf || '').toUpperCase().trim(),
      fornecedor: this.veiculoForm.fornecedor || 'Frota Própria',
      agenciador: this.veiculoForm.agenciador || '',
      numeroAntt: this.veiculoForm.numeroAntt || '',
      tipoRastreador: this.veiculoForm.tipoRastreador || '',
      idRastreador: this.veiculoForm.idRastreador || '',
      tagPedagio: this.veiculoForm.tagPedagio || 'Nenhum',
      situacao: this.veiculoForm.situacao || 'ATIVO'
    };

    this.veiculoService.salvar(payload).subscribe({
      next: () => {
        this.carregarVeiculos();
        this.activeManageTab = 'LISTAR';
        this.cancelarEdicaoVeiculo();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro detalhado ao salvar veículo:', err);
        const msg = err.error?.message || err.error?.error || err.error?.reason || (typeof err.error === 'string' ? err.error : (err.message || 'Erro ao processar dados no servidor.'));
        alert('Erro ao salvar veículo: ' + msg);
      }
    });
  }

  editarVeiculo(v: VeiculoModel): void {
    this.veiculoForm = { ...v };
    this.isEditingVeiculo = true;
    this.activeManageTab = 'CADASTRAR';
    this.buscaVeiculoCadastro = '';
    this.cdr.detectChanges();
  }

  excluirVeiculo(id: number): void {
    if (!confirm('Deseja realmente excluir este veículo? Esta ação não pode ser desfeita.')) {
      return;
    }
    this.veiculoService.deletar(id).subscribe({
      next: () => this.carregarVeiculos(),
      error: () => alert('Erro ao excluir veículo.')
    });
  }

  cancelarEdicaoVeiculo(): void {
    this.veiculoForm = this.getEmptyVeiculo();
    this.isEditingVeiculo = false;
    this.buscaVeiculoCadastro = '';
    this.cdr.detectChanges();
  }

  openVeiculoFotosModal(v: VeiculoModel): void {
    this.selectedVeiculo = v;
    this.novoDocVeiculo = { nome: '', descricao: '', arquivo: null, nomeArquivo: '' };
    this.activeVeiculoPhotoTab = (v.documentos && v.documentos.length > 0) ? 'LISTAR' : 'ADICIONAR';
    this.modalType = 'VEICULO_PHOTO';
    this.cdr.detectChanges();
  }

  onVeiculoDocSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      this.novoDocVeiculo.arquivo = file;
      this.novoDocVeiculo.nomeArquivo = file.name;
      if (!this.novoDocVeiculo.nome.trim()) {
        this.novoDocVeiculo.nome = file.name.replace(/\.[^/.]+$/, '').toUpperCase();
      }
      this.cdr.detectChanges();
    }
  }

  onVeiculoDocDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingVeiculoDoc = true;
  }

  onVeiculoDocDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingVeiculoDoc = false;
  }

  onVeiculoDocDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingVeiculoDoc = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.novoDocVeiculo.arquivo = file;
      this.novoDocVeiculo.nomeArquivo = file.name;
      if (!this.novoDocVeiculo.nome.trim()) {
        this.novoDocVeiculo.nome = file.name.replace(/\.[^/.]+$/, '').toUpperCase();
      }
      this.cdr.detectChanges();
    }
  }

  adicionarDocVeiculo(): void {
    if (!this.selectedVeiculo || !this.novoDocVeiculo.arquivo) {
      alert('Selecione um arquivo para adicionar.');
      return;
    }

    const tipoDoc: string = this.novoDocVeiculo.nome.trim().toUpperCase() || 'DOCUMENTO';
    const arquivoParaEnvio = this.novoDocVeiculo.arquivo;
    const veiculoAtual = this.selectedVeiculo;

    this.veiculoService.uploadDocumento(veiculoAtual.id, tipoDoc, arquivoParaEnvio).subscribe({
      next: (docSalvo: any) => {
        const novoDoc: ComprovanteItem = {
          id: docSalvo?.id || Date.now(),
          descricao: docSalvo?.descricao || docSalvo?.nome || tipoDoc,
          url: this.sanitizarUrlArquivo(docSalvo?.url || docSalvo?.urlArquivo || ''),
          nomeArquivo: docSalvo?.nomeArquivo || arquivoParaEnvio.name,
          dataEnvio: docSalvo?.dataEnvio || 'Agora'
        };

        if (!veiculoAtual.documentos) {
          veiculoAtual.documentos = [];
        }
        veiculoAtual.documentos.unshift(novoDoc);

        const veicNaLista = this.veiculosList.find(v => v.id === veiculoAtual.id);
        if (veicNaLista) {
          veicNaLista.documentos = [...veiculoAtual.documentos];
        }

        this.filtrarVeiculos();
        this.novoDocVeiculo = { nome: '', descricao: '', arquivo: null, nomeArquivo: '' };
        this.activeVeiculoPhotoTab = 'LISTAR';
        this.carregarVeiculos();
        this.cdr.detectChanges();
      },
      error: () => alert('Erro ao fazer upload do documento do veículo.')
    });
  }

  removerDocVeiculo(event: Event, id: number): void {
    event.stopPropagation();
    if (!this.selectedVeiculo) return;

    this.veiculoService.deletarDocumento(id).subscribe({
      next: () => {
        if (this.selectedVeiculo?.documentos) {
          this.selectedVeiculo.documentos = this.selectedVeiculo.documentos.filter(d => d.id !== id);
        }

        const veicNaLista = this.veiculosList.find(v => v.id === this.selectedVeiculo?.id);
        if (veicNaLista && veicNaLista.documentos) {
          veicNaLista.documentos = veicNaLista.documentos.filter(d => d.id !== id);
        }

        this.filtrarVeiculos();
        this.carregarVeiculos();
        this.cdr.detectChanges();
      },
      error: () => alert('Erro ao excluir documento do veículo.')
    });
  }

  carregarClientes(): void {
    this.clienteService.listar().subscribe({
      next: (data: Cliente[]) => {
        this.clientesList = (data || []).map((c: any) => ({
          id: c.id || 0,
          nomeFantasia: c.nomeFantasia || c.nome,
          razaoSocial: c.razaoSocial || c.nome,
          cnpjCpf: c.cnpjCpf || '',
          nomeContato: c.nomeContato || '',
          telefone: c.telefone || '',
          email: c.email || '',
          situacao: (c.situacao === 'INATIVO' || c.ativo === false) ? 'INATIVO' : 'ATIVO',
          obs: c.obs || c.observacoes || ''
        }));
        this.filtrarClientes();
        this.cdr.detectChanges();
      },
      error: (err: unknown) => console.error('Erro ao carregar clientes:', err)
    });
  }

  filtrarClientes(): void {
    const t = this.normalizarTexto(this.manageSearchTerm);
    if (!t) {
      this.filteredClientes = [...this.clientesList];
      return;
    }
    this.filteredClientes = this.clientesList.filter(c =>
      this.normalizarTexto(c.nomeFantasia).includes(t) ||
      this.normalizarTexto(c.razaoSocial).includes(t) ||
      this.normalizarTexto(c.cnpjCpf).includes(t)
    );
  }

  public getEmptyCliente(): ClienteModel {
    return { id: 0, nomeFantasia: '', razaoSocial: '', cnpjCpf: '', nomeContato: '', telefone: '', email: '', situacao: 'ATIVO', obs: '' };
  }

  openGerenciarClientes(): void {
    this.clienteForm = this.getEmptyCliente();
    this.isEditingCliente = false;
    this.activeManageTab = 'CADASTRAR';
    this.modalType = 'CLIENTE';
    this.isManageOpen = false;
    this.filtrarClientes();
    this.cdr.detectChanges();
  }

  salvarCliente(): void {
    if (!this.clienteForm.nomeFantasia.trim()) return;

    const docLimpo = (this.clienteForm.cnpjCpf || '').replace(/\D/g, '').trim();
    const idAtual = this.isEditingCliente ? this.clienteForm.id : null;

    if (docLimpo) {
      const clienteExistente = this.clientesList.find(c => {
        const docCadastrado = (c.cnpjCpf || '').replace(/\D/g, '').trim();
        return docCadastrado === docLimpo && c.id !== idAtual;
      });

      if (clienteExistente) {
        alert(`Atenção: O CNPJ/CPF "${this.clienteForm.cnpjCpf}" já está cadastrado para o cliente "${clienteExistente.nomeFantasia}"!`);
        return;
      }
    }

    const payload: Cliente = {
      id: this.isEditingCliente ? this.clienteForm.id : undefined,
      nome: this.clienteForm.nomeFantasia.toUpperCase(),
      nomeFantasia: this.clienteForm.nomeFantasia.toUpperCase(),
      razaoSocial: this.clienteForm.razaoSocial.toUpperCase(),
      cnpjCpf: this.clienteForm.cnpjCpf.toUpperCase(),
      nomeContato: this.clienteForm.nomeContato.toUpperCase(),
      telefone: this.clienteForm.telefone.toUpperCase(),
      email: this.clienteForm.email.toUpperCase(),
      situacao: this.clienteForm.situacao,
      ativo: this.clienteForm.situacao === 'ATIVO',
      obs: this.clienteForm.obs
    };

    this.clienteService.salvar(payload).subscribe({
      next: () => {
        this.carregarClientes();
        this.activeManageTab = 'LISTAR';
        this.cancelarEdicaoCliente();
        this.cdr.detectChanges();
      },
      error: () => alert('Erro ao salvar cliente.')
    });
  }

  editarCliente(c: ClienteModel): void {
    this.clienteForm = { ...c };
    this.isEditingCliente = true;
    this.activeManageTab = 'CADASTRAR';
    this.cdr.detectChanges();
  }

  excluirCliente(id: number): void {
    if (!confirm('Deseja realmente excluir este cliente?')) return;
    this.clienteService.deletar(id).subscribe({
      next: () => this.carregarClientes(),
      error: () => alert('Erro ao excluir cliente.')
    });
  }

  cancelarEdicaoCliente(): void {
    this.clienteForm = this.getEmptyCliente();
    this.isEditingCliente = false;
    this.cdr.detectChanges();
  }

  carregarFornecedores(): void {
    this.fornecedorService.listar().subscribe({
      next: (data: Fornecedor[]) => {
        this.fornecedoresList = (data || []).map((f: any) => ({
          id: f.id || 0,
          nome: f.nome,
          cnpjCpf: f.cnpjCpf || '',
          nomeContato: f.nomeContato || '',
          telefone: f.telefone || '',
          email: f.email || '',
          chavePix: f.chavePix || '',
          formaPagamento: f.formaPagamento || (f as any).forma_pagamento || '',
          situacao: (f.situacao === 'INATIVO' || f.ativo === false) ? 'INATIVO' : 'ATIVO',
          obs: f.obs || f.observacoes || ''
        }));
        this.filtrarFornecedores();
        this.cdr.detectChanges();
      },
      error: (err: unknown) => console.error('Erro ao carregar fornecedores:', err)
    });
  }

  filtrarFornecedores(): void {
    const t = this.normalizarTexto(this.manageSearchTerm);
    if (!t) {
      this.filteredFornecedores = [...this.fornecedoresList];
      return;
    }
    this.filteredFornecedores = this.fornecedoresList.filter(f =>
      this.normalizarTexto(f.nome).includes(t) ||
      this.normalizarTexto(f.cnpjCpf).includes(t) ||
      this.normalizarTexto(f.nomeContato).includes(t) ||
      this.normalizarTexto(f.formaPagamento).includes(t)
    );
  }

  public getEmptyFornecedor(): FornecedorModel {
    return { id: 0, nome: '', cnpjCpf: '', nomeContato: '', telefone: '', email: '', chavePix: '', formaPagamento: '', situacao: 'ATIVO', obs: '' };
  }

  openGerenciarFornecedores(): void {
    this.fornecedorForm = this.getEmptyFornecedor();
    this.isEditingFornecedor = false;
    this.activeManageTab = 'CADASTRAR';
    this.modalType = 'FORNECEDOR';
    this.isManageOpen = false;
    this.filtrarFornecedores();
    this.cdr.detectChanges();
  }

  salvarFornecedor(): void {
    if (!this.fornecedorForm.nome.trim()) return;

    const docLimpo = (this.fornecedorForm.cnpjCpf || '').replace(/\D/g, '').trim();
    const idAtual = this.isEditingFornecedor ? this.fornecedorForm.id : null;

    if (docLimpo) {
      const docExistente = this.fornecedoresList.find(f => {
        const docCadastrado = (f.cnpjCpf || '').replace(/\D/g, '').trim();
        return docCadastrado === docLimpo && f.id !== idAtual;
      });

      if (docExistente) {
        alert(`Atenção: O CNPJ/CPF "${this.fornecedorForm.cnpjCpf}" já está cadastrado para o fornecedor "${docExistente.nome}"!`);
        return;
      }
    }

    const payload: any = {
      id: this.isEditingFornecedor ? this.fornecedorForm.id : undefined,
      nome: this.fornecedorForm.nome.toUpperCase(),
      cnpjCpf: this.fornecedorForm.cnpjCpf.toUpperCase(),
      nomeContato: this.fornecedorForm.nomeContato.toUpperCase(),
      telefone: this.fornecedorForm.telefone.toUpperCase(),
      email: this.fornecedorForm.email.toUpperCase(),
      chavePix: this.fornecedorForm.chavePix.toUpperCase(),
      formaPagamento: (this.fornecedorForm.formaPagamento || '').toUpperCase(),
      forma_pagamento: (this.fornecedorForm.formaPagamento || '').toUpperCase(),
      situacao: this.fornecedorForm.situacao,
      ativo: this.fornecedorForm.situacao === 'ATIVO',
      obs: this.fornecedorForm.obs
    };

    this.fornecedorService.salvar(payload).subscribe({
      next: () => {
        this.carregarFornecedores();
        this.activeManageTab = 'LISTAR';
        this.cancelarEdicaoFornecedor();
        this.cdr.detectChanges();
      },
      error: () => alert('Erro ao salvar fornecedor.')
    });
  }

  editarFornecedor(f: FornecedorModel): void {
    this.fornecedorForm = { ...f };
    this.isEditingFornecedor = true;
    this.activeManageTab = 'CADASTRAR';
    this.cdr.detectChanges();
  }

  excluirFornecedor(id: number): void {
    if (!confirm('Deseja realmente excluir este fornecedor?')) return;
    this.fornecedorService.deletar(id).subscribe({
      next: () => this.carregarFornecedores(),
      error: () => alert('Erro ao excluir fornecedor.')
    });
  }

  cancelarEdicaoFornecedor(): void {
    this.fornecedorForm = this.getEmptyFornecedor();
    this.isEditingFornecedor = false;
    this.cdr.detectChanges();
  }

  openNovaViagemModal(): void {
    this.isEditing = false;
    this.locaisDoClienteSelecionado = [];
    this.tripForm = {
      id: '',
      clienteSelect: '',
      tipoOperacao: 'Coleta',
      origens: [{ local: '', endereco: '', linkLocalizacao: '', dataPrevista: '', dataReal: '' }],
      destinos: [{ local: '', endereco: '', linkLocalizacao: '', dataPrevista: '', dataReal: '' }],
      perfilVeiculo: '',
      carroceriaVeiculo: 'Nenhum',
      motorista: '',
      placa: '',
      placaSecundaria: '',
      agencia: 'Frota Própria',
      agenciador: '',
      especialistaCospa: '',
      valorReceber: 0,
      adicionalReceber: 0,
      tipoAdicionalReceber: '',
      valorPagarMotorista: 0,
      adicionalPagarMotorista: 0,
      tipoAdicionalPagar: '',
      valorAgenciador: 0,
      valorEspecialistaCospa: 0,
      pagamentoLiberado: false,
      dataAdiantamento: '',
      pagoAdiantamento: false,
      dataSaldo: '',
      pagoSaldo: false,
      dataAdicional: '',
      pagoAdicional: false,
      statusInicial: 'PROGRAMADO',
      observacao: ''
    };
    this.modalType = 'TRIP_FORM';
    this.cdr.detectChanges();
  }

  openEditarModal(item: ViagemItem, origin: 'andamento' | 'finalizadas'): void {
    this.isEditing = true;
    this.selectedViagem = item;
    this.selectedListOrigin = origin;

    const raw: any = item.rawViagem;

    const rawColetaLocais = item.origem.map(o => o === '-' ? '' : o);
    const rawColetaEnds = (raw?.localColeta || raw?.local_coleta || '').split(';').map((s: string) => s.trim());
    const rawColetaPrev = (raw?.dataColetaPrevista || raw?.data_coleta_prevista || '').split(';').map((s: string) => s.trim());
    const rawColetaReal = (raw?.dataColetaReal || raw?.data_coleta_real || '').split(';').map((s: string) => s.trim());

    const datasRelacionaisColeta = (raw?.datas || []).filter((d: any) => (d.tipo || '').toUpperCase() === 'COLETA');

    const totalColetas = Math.max(rawColetaLocais.length, rawColetaEnds.length, datasRelacionaisColeta.length, 1);
    const origensMapeadas: PontoRotaCompleto[] = [];

    for (let i = 0; i < totalColetas; i++) {
      const dRel = datasRelacionaisColeta[i];
      origensMapeadas.push({
        local: rawColetaLocais[i] || '',
        endereco: rawColetaEnds[i] || (rawColetaEnds.length === 1 && rawColetaEnds[0] !== rawColetaLocais[i] ? rawColetaEnds[0] : ''),
        linkLocalizacao: raw?.linkLocalizacao || '',
        dataPrevista: dRel?.dataPrevista || (rawColetaPrev[i] === 'A confirmar' ? '' : (rawColetaPrev[i] || '')),
        dataReal: dRel?.dataReal || (rawColetaReal[i] === 'A confirmar' ? '' : (rawColetaReal[i] || ''))
      });
    }

    const rawEntregaLocais = item.destino.map(d => d === '-' ? '' : d);
    const rawEntregaEnds = (raw?.localEntrega || raw?.local_entrega || '').split(';').map((s: string) => s.trim());
    const rawEntregaPrev = (raw?.dataEntregaPrevista || raw?.data_entrega_prevista || '').split(';').map((s: string) => s.trim());
    const rawEntregaReal = (raw?.dataEntregaReal || raw?.data_entrega_real || '').split(';').map((s: string) => s.trim());

    const datasRelacionaisEntrega = (raw?.datas || []).filter((d: any) => (d.tipo || '').toUpperCase() === 'ENTREGA');

    const totalEntregas = Math.max(rawEntregaLocais.length, rawEntregaEnds.length, datasRelacionaisEntrega.length, 1);
    const destinosMapeados: PontoRotaCompleto[] = [];

    for (let j = 0; j < totalEntregas; j++) {
      const dRel = datasRelacionaisEntrega[j];
      destinosMapeados.push({
        local: rawEntregaLocais[j] || '',
        endereco: rawEntregaEnds[j] || (rawEntregaEnds.length === 1 && rawEntregaEnds[0] !== rawEntregaLocais[j] ? rawEntregaEnds[0] : ''),
        linkLocalizacao: raw?.linkLocalizacao || '',
        dataPrevista: dRel?.dataPrevista || (rawEntregaPrev[j] === 'A confirmar' ? '' : (rawEntregaPrev[j] || '')),
        dataReal: dRel?.dataReal || (rawEntregaReal[j] === 'A confirmar' ? '' : (rawEntregaReal[j] || ''))
      });
    }

    const rawPlaca = item.placa || '';
    const placasSplit = rawPlaca.split(' / ').map(p => p.trim());
    const placa1 = placasSplit[0] && placasSplit[0] !== '-' ? placasSplit[0] : '';
    const placa2 = placasSplit[1] || (raw?.placaSecundaria || raw?.placa_secundaria || '');

    const valorParaInput = item.numeroOperacional || item.rawId.toString();

    this.tripForm = {
      id: valorParaInput,
      clienteSelect: item.cliente,
      tipoOperacao: raw?.tipoOperacao || raw?.tipo_operacao || 'Coleta',
      origens: origensMapeadas.length > 0 ? origensMapeadas : [{ local: '', endereco: '', linkLocalizacao: '', dataPrevista: '', dataReal: '' }],
      destinos: destinosMapeados.length > 0 ? destinosMapeados : [{ local: '', endereco: '', linkLocalizacao: '', dataPrevista: '', dataReal: '' }],
      perfilVeiculo: raw?.perfilVeiculo || raw?.perfil_veiculo || '',
      carroceriaVeiculo: raw?.carroceriaVeiculo || raw?.carroceria_veiculo || 'Nenhum',
      motorista: item.motorista === 'A Contratar' ? '' : item.motorista,
      placa: placa1,
      placaSecundaria: placa2,
      agencia: raw?.fornecedorAgencia || raw?.fornecedor_agencia || 'Frota Própria',
      agenciador: raw?.agenciador || '',
      especialistaCospa: raw?.especialistaCospa || raw?.especialista_cospa || '',
      valorReceber: raw?.valorAReceber || raw?.valor_a_receber || 0,
      adicionalReceber: raw?.valorAdicionalReceber || raw?.valor_adicional_receber || 0,
      tipoAdicionalReceber: raw?.tipoAdicionalReceber || raw?.tipo_adicional_receber || '',
      valorPagarMotorista: raw?.valorAPagar || raw?.valor_a_pagar || 0,
      adicionalPagarMotorista: raw?.valorAdicionalPagar || raw?.valor_adicional_pagar || 0,
      tipoAdicionalPagar: raw?.tipoAdicionalPagar || raw?.tipo_adicional_pagar || '',
      valorAgenciador: raw?.valorAgenciador || raw?.valor_agenciador || raw?.valorAdicionalAgencia || raw?.valor_adicional_agencia || 0,
      valorEspecialistaCospa: raw?.valorEspecialistaCospa || raw?.valor_especialista_cospa || 0,
      pagamentoLiberado: raw?.pagamentoLiberado ?? raw?.pagamento_liberado ?? false,
      dataAdiantamento: raw?.dataAdiantamento || raw?.data_adiantamento || '',
      pagoAdiantamento: !!(raw?.pagoAdiantamento ?? raw?.pago_adiantamento ?? false),
      dataSaldo: raw?.dataSaldo || raw?.data_saldo || '',
      pagoSaldo: !!(raw?.pagoSaldo ?? raw?.pago_saldo ?? false),
      dataAdicional: raw?.dataAdicional || raw?.data_adicional || '',
      pagoAdicional: !!(raw?.pagoAdicional ?? raw?.pago_adicional ?? false),
      statusInicial: item.status,
      observacao: item.obs === '-' ? '' : (item.obs || '')
    };

    if (item.cliente) {
      this.onClienteSelectChange(item.cliente);
    }

    this.modalType = 'TRIP_FORM';
    this.closeRowActions();
    this.cdr.detectChanges();
  }

  salvarViagemForm(): void {
    const rawIdInput = (this.tripForm.id || '').toString().trim();
    const idOriginal = this.isEditing && this.selectedViagem ? this.selectedViagem.rawId : null;

    const nomeClienteFinal = (this.tripForm.clienteSelect || '').trim();
    if (!nomeClienteFinal) {
      alert('Por favor, selecione o Cliente.');
      return;
    }

    const origensLocaisArray = (this.tripForm.origens || []).map(o => (o.local || '').trim().toUpperCase()).filter(Boolean);
    const origensEnderecosArray = (this.tripForm.origens || []).map(o => (o.endereco || '').trim().toUpperCase());
    const destinosLocaisArray = (this.tripForm.destinos || []).map(d => (d.local || '').trim().toUpperCase()).filter(Boolean);
    const destinosEnderecosArray = (this.tripForm.destinos || []).map(d => (d.endereco || '').trim().toUpperCase());

    const strOrigemLocal = origensLocaisArray.join('; ') || 'ORIGEM NÃO INFORMADA';
    const strOrigemEndereco = origensEnderecosArray.join('; ') || strOrigemLocal;
    const strDestinoLocal = destinosLocaisArray.join('; ') || 'DESTINO NÃO INFORMADO';
    const strDestinoEndereco = destinosEnderecosArray.join('; ') || strDestinoLocal;

    const p1 = (this.tripForm.placa || '').split(' - ')[0].trim().toUpperCase();
    const p2 = (this.tripForm.placaSecundaria || '').split(' - ')[0].trim().toUpperCase();

    let placaFinal = '-';
    if (p1 && p2) {
      placaFinal = `${p1} / ${p2}`;
    } else if (p1) {
      placaFinal = p1;
    } else if (p2) {
      placaFinal = p2;
    }

    let motoristaFinal = 'A Contratar';
    let cpfFinal = '';

    if (this.tripForm.motorista && this.tripForm.motorista.trim() !== '') {
      let motBusca = this.normalizarTexto(this.tripForm.motorista);
      if (motBusca.includes(' (cpf:')) {
        motBusca = motBusca.split(' (cpf:')[0].trim();
      }
      const motSelected = this.motoristasList.find(m => this.normalizarTexto(m.nome) === motBusca);
      motoristaFinal = motSelected ? motSelected.nome : this.tripForm.motorista.toUpperCase();
      cpfFinal = motSelected ? (motSelected.cpf || '') : '';
    }

    const strColetaPrevista = this.tripForm.origens.map(o => (o.dataPrevista || '').trim()).join('; ');
    const strColetaReal = this.tripForm.origens.map(o => (o.dataReal || '').trim()).join('; ');
    const strEntregaPrevista = this.tripForm.destinos.map(d => (d.dataPrevista || '').trim()).join('; ');
    const strEntregaReal = this.tripForm.destinos.map(d => (d.dataReal || '').trim()).join('; ');

    const normalizarTipoAdicional = (tipo: string | null | undefined): string | null => {
      if (!tipo || tipo === 'Nenhum' || tipo.trim() === '') return null;
      const t = tipo.trim().toUpperCase();
      if (t.includes('DIARIA') || t.includes('DIÁRIA')) return 'DIARIA';
      if (t.includes('AJUDANTE')) return 'AJUDANTE';
      if (t.includes('MULTA')) return 'MULTA';
      if (t.includes('COMPLEMENTO')) return 'COMPLEMENTO_DE_FRETE';
      return t;
    };

    const datasArrayPayload: ViagemDataItem[] = [
      ...this.tripForm.origens.map((o, idx) => ({
        tipo: 'COLETA' as const,
        dataPrevista: (o.dataPrevista || '').trim().toUpperCase() || 'A CONFIRMAR',
        dataReal: (o.dataReal || '').trim().toUpperCase() || '',
        ordem: idx
      })),
      ...this.tripForm.destinos.map((d, idx) => ({
        tipo: 'ENTREGA' as const,
        dataPrevista: (d.dataPrevista || '').trim().toUpperCase() || 'A CONFIRMAR',
        dataReal: (d.dataReal || '').trim().toUpperCase() || '',
        ordem: idx
      }))
    ];

    const tipoOpNormalizado = this.normalizarTipoOperacao(this.tripForm.tipoOperacao);
    const tipoAdicRecNormalizado = normalizarTipoAdicional(this.tripForm.tipoAdicionalReceber);
    const tipoAdicPagNormalizado = normalizarTipoAdicional(this.tripForm.tipoAdicionalPagar);

    const payload: any = {
      ...(this.isEditing ? { id: idOriginal } : {}),
      numeroOperacional: rawIdInput,
      numero_operacional: rawIdInput,
      cliente: nomeClienteFinal.toUpperCase(),
      tipoOperacao: tipoOpNormalizado,
      tipo_operacao: tipoOpNormalizado,

      origem: strOrigemLocal,
      origemNome: strOrigemLocal,
      origem_nome: strOrigemLocal,
      localColeta: strOrigemEndereco,
      local_coleta: strOrigemEndereco,

      destino: strDestinoLocal,
      destinoNome: strDestinoLocal,
      destino_nome: strDestinoLocal,
      localEntrega: strDestinoEndereco,
      local_entrega: strDestinoEndereco,

      perfilVeiculo: this.tripForm.perfilVeiculo,
      perfil_veiculo: this.tripForm.perfilVeiculo,
      carroceriaVeiculo: this.tripForm.carroceriaVeiculo,
      carroceria_veiculo: this.tripForm.carroceriaVeiculo,

      nomeMotorista: motoristaFinal,
      nome_motorista: motoristaFinal,
      cpfMotorista: cpfFinal,
      cpf_motorista: cpfFinal,
      placa: placaFinal,
      placaSecundaria: p2,
      placa_secundaria: p2,

      fornecedorAgencia: this.tripForm.agencia || 'Frota Própria',
      fornecedor_agencia: this.tripForm.agencia || 'Frota Própria',
      agenciador: this.tripForm.agenciador || '',
      especialistaCospa: this.tripForm.especialistaCospa || '',
      especialista_cospa: this.tripForm.especialistaCospa || '',

      dataColetaPrevista: strColetaPrevista.toUpperCase(),
      data_coleta_prevista: strColetaPrevista.toUpperCase(),
      dataColetaReal: strColetaReal.toUpperCase(),
      data_coleta_real: strColetaReal.toUpperCase(),

      dataEntregaPrevista: strEntregaPrevista.toUpperCase(),
      data_entrega_prevista: strEntregaPrevista.toUpperCase(),
      dataEntregaReal: strEntregaReal.toUpperCase(),
      data_entrega_real: strEntregaReal.toUpperCase(),

      datas: datasArrayPayload,

      valorAReceber: Number(this.tripForm.valorReceber) || 0,
      valor_a_receber: Number(this.tripForm.valorReceber) || 0,
      valorAdicionalReceber: Number(this.tripForm.adicionalReceber) || 0,
      valor_adicional_receber: Number(this.tripForm.adicionalReceber) || 0,
      tipoAdicionalReceber: tipoAdicRecNormalizado,
      tipo_adicional_receber: tipoAdicRecNormalizado,

      valorAPagar: Number(this.tripForm.valorPagarMotorista) || 0,
      valor_a_pagar: Number(this.tripForm.valorPagarMotorista) || 0,
      valorAdicionalPagar: Number(this.tripForm.adicionalPagarMotorista) || 0,
      valor_adicional_pagar: Number(this.tripForm.adicionalPagarMotorista) || 0,
      tipoAdicionalPagar: tipoAdicPagNormalizado,
      tipo_adicional_pagar: tipoAdicPagNormalizado,

      valorAgenciador: Number(this.tripForm.valorAgenciador) || 0,
      valor_agenciador: Number(this.tripForm.valorAgenciador) || 0,
      valorEspecialistaCospa: Number(this.tripForm.valorEspecialistaCospa) || 0,
      valor_especialista_cospa: Number(this.tripForm.valorEspecialistaCospa) || 0,

      pagamentoLiberado: !!this.tripForm.pagamentoLiberado,
      pagamento_liberado: !!this.tripForm.pagamentoLiberado,

      dataAdiantamento: (this.tripForm.dataAdiantamento || '').toUpperCase(),
      data_adiantamento: (this.tripForm.dataAdiantamento || '').toUpperCase(),
      pagoAdiantamento: !!this.tripForm.pagoAdiantamento,
      pago_adiantamento: !!this.tripForm.pagoAdiantamento,

      dataSaldo: (this.tripForm.dataSaldo || '').toUpperCase(),
      data_saldo: (this.tripForm.dataSaldo || '').toUpperCase(),
      pagoSaldo: !!this.tripForm.pagoSaldo,
      pago_saldo: !!this.tripForm.pagoSaldo,

      dataAdicional: (this.tripForm.dataAdicional || '').toUpperCase(),
      data_adicional: (this.tripForm.dataAdicional || '').toUpperCase(),
      pagoAdicional: !!this.tripForm.pagoAdicional,
      pago_adicional: !!this.tripForm.pagoAdicional,

      status: this.tripForm.statusInicial || 'PROGRAMADO',
      observacao: (this.tripForm.observacao || '').trim().toUpperCase()
    };

    this.viagemService.salvar(payload, this.isEditing, idOriginal).subscribe({
      next: () => {
        this.carregarViagens();
        this.closeModal();
      },
      error: (err: any) => {
        console.error('Erro detalhado ao salvar rota:', err);

        let detalhe = 'Verifique os dados preenchidos.';
        if (err.error) {
          if (typeof err.error === 'string') {
            detalhe = err.error;
          } else if (err.error.errors && Array.isArray(err.error.errors)) {
            detalhe = err.error.errors.map((e: any) => `${e.field}: ${e.defaultMessage}`).join(' | ');
          } else if (err.error.message) {
            detalhe = err.error.message;
          } else if (err.error.detail) {
            detalhe = err.error.detail;
          } else {
            detalhe = JSON.stringify(err.error);
          }
        } else if (err.message) {
          detalhe = err.message;
        }

        alert('Erro ao salvar rota (400):\n' + detalhe);
      }
    });
  }

  private normalizarTipoOperacao(op: string): string {
    if (!op) return 'COLETA';
    const valorLimpo = op.toUpperCase().trim();
    const dePara: { [key: string]: string } = {
      'TRANSFERÊNCIA': 'TRANSFERENCIA',
      'TRANSFERENCIA': 'TRANSFERENCIA',
      'COLETA': 'COLETA',
      'ENTREGA': 'ENTREGA',
      'DEVOLUÇÃO': 'DEVOLUCAO',
      'DEVOLUCAO': 'DEVOLUCAO'
    };
    return dePara[valorLimpo] || valorLimpo.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  openObsModal(item: ViagemItem): void {
    this.selectedViagem = item;
    this.modalType = 'OBS';
    this.closeRowActions();
    this.cdr.detectChanges();
  }

  salvarObs(): void {
    if (this.selectedViagem && this.selectedViagem.rawViagem) {
      const payload: any = { ...this.selectedViagem.rawViagem, observacao: (this.selectedViagem.obs || '').toUpperCase() };
      this.viagemService.salvar(payload, true, this.selectedViagem.rawId).subscribe({
        next: () => this.carregarViagens(),
        error: () => alert('Erro ao salvar observação.')
      });
    }
    this.closeModal();
  }

  openCancelarModal(item: ViagemItem, origin: 'andamento' | 'finalizadas'): void {
    this.selectedViagem = item;
    this.selectedListOrigin = origin;
    this.motivoCancelamento = '';
    this.modalType = 'CANCELAR';
    this.closeRowActions();
    this.cdr.detectChanges();
  }

  confirmarCancelamento(): void {
    if (!this.selectedViagem) return;

    const rawId = this.selectedViagem.rawId;
    const motivo = (this.motivoCancelamento || '').trim().toUpperCase();

    this.http.patch(`${environment.apiUrl}/viagens/${rawId}/cancelar`, { motivo }).subscribe({
      next: () => {
        this.showFinalizadas = true;
        this.carregarViagens();
        this.closeModal();
      },
      error: (err) => {
        console.error('Erro ao cancelar rota:', err);
        alert('Erro ao cancelar rota.');
      }
    });
  }
}