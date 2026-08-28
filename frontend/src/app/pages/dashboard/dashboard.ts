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
import { Viagem, StatusViagem } from '../../core/models/viagem.model';
import { Motorista } from '../../core/models/motorista.model';
import { Cliente } from '../../core/models/cliente.model';
import { Fornecedor } from '../../core/models/fornecedor.model';
import { environment } from '../../../environments/environment';

export type TipoPagamentoRealizado = 'Não Realizado' | 'Adiantamento pago' | 'Saldo pago';

export interface PontoRota {
  local: string;
  endereco: string;
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
  cliente: string;
  origem: string[];
  destino: string[];
  placa: string;
  motorista: string;
  status: StatusViagem;
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
  placa: string;
  fornecedorVinculado: string;
  situacao: 'ATIVO' | 'INATIVO';
  informacoesAdicionais?: string;
  cnhFile?: File | null;
  crlvFile?: File | null;
  cnhPreviewName?: string;
  crlvPreviewName?: string;
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
  private cdr = inject(ChangeDetectorRef);

  uploadsUrl = environment.uploadsUrl || environment.apiUrl;
  isLoading: boolean = false;

  isDarkMode: boolean = true;
  isSidebarOpen: boolean = false;
  isManageOpen: boolean = false;
  openedActionMenuId: string | null = null;

  showAndamento: boolean = true;
  showPagar: boolean = true;
  showFinalizadas: boolean = false;

  modalType: 'TRIP_FORM' | 'PHOTO' | 'OBS' | 'DELETE' | 'FORNECEDOR' | 'CLIENTE' | 'MOTORISTA' | 'MOTORISTA_PHOTO' | null = null;
  private previousModalType: 'PHOTO' | 'MOTORISTA_PHOTO' | null = null;

  activeManageTab: 'CADASTRAR' | 'LISTAR' = 'CADASTRAR';
  manageSearchTerm: string = '';

  activePhotoTab: 'ADICIONAR' | 'LISTAR' = 'ADICIONAR';
  activeMotoristaPhotoTab: 'ADICIONAR' | 'LISTAR' = 'ADICIONAR';
  previewImageUrl: string | null = null;

  isDraggingComprovante: boolean = false;
  isDraggingMotoristaDoc: boolean = false;
  isDraggingCnh: boolean = false;
  isDraggingCrlv: boolean = false;

  novoComprovante = {
    descricao: '',
    arquivo: null as File | null,
    nomeArquivo: ''
  };

  novoDocMotorista = {
    nome: '',
    descricao: '',
    arquivo: null as File | null,
    nomeArquivo: ''
  };

  selectedMotorista: MotoristaModel | null = null;

  fornecedoresList: FornecedorModel[] = [];
  fornecedorForm: FornecedorModel = this.getEmptyFornecedor();
  isEditingFornecedor: boolean = false;

  clientesList: ClienteModel[] = [];
  clienteForm: ClienteModel = this.getEmptyCliente();
  isEditingCliente: boolean = false;

  motoristasList: MotoristaModel[] = [];
  motoristaForm: MotoristaModel = this.getEmptyMotorista();
  isEditingMotorista: boolean = false;

  tripForm = {
    id: '',
    clienteSelect: '',
    clienteManual: '',
    origens: [{ local: '', endereco: '' }] as PontoRota[],
    destinos: [{ local: '', endereco: '' }] as PontoRota[],
    motorista: '',
    agencia: 'Sem Agência (Frota Própria)',
    coletaPrevista: '',
    coletaReal: '',
    entregaPrevista: '',
    entregaReal: '',
    valorReceber: 0,
    adicionalReceber: 0,
    valorPagarMotorista: 0,
    adicionalPagarMotorista: 0,
    valorAdicionalAgencia: 0,
    pagamentoLiberado: false,
    pagamentoRealizado: 'Não Realizado' as TipoPagamentoRealizado,
    dataHoraPagada: '',
    statusInicial: 'PROGRAMADO' as StatusViagem,
    observacao: ''
  };

  selectedViagem: ViagemItem | null = null;
  selectedListOrigin: 'andamento' | 'pagar' | 'finalizadas' = 'andamento';
  isEditing: boolean = false;

  viagensAndamento: ViagemItem[] = [];
  viagensPagar: ViagemItem[] = [];
  viagensFinalizadas: ViagemItem[] = [];

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('cospa_theme');
    this.isDarkMode = savedTheme !== 'light';
    this.carregarTodosDados();
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
          } else if (this.modalType === 'MOTORISTA') {
            if (!this.motoristaForm.cnhFile) {
              this.motoristaForm.cnhFile = pastedFile;
              this.motoristaForm.cnhPreviewName = pastedFile.name;
            } else {
              this.motoristaForm.crlvFile = pastedFile;
              this.motoristaForm.crlvPreviewName = pastedFile.name;
            }
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

  toggleRowActions(event: Event, id: string): void {
    event.stopPropagation();
    this.openedActionMenuId = this.openedActionMenuId === id ? null : id;
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

  logout(): void {
    this.authService.logout();
  }

  closeModal(): void {
    this.modalType = null;
    this.previousModalType = null;
    this.selectedViagem = null;
    this.selectedMotorista = null;
    this.activeManageTab = 'CADASTRAR';
    this.activePhotoTab = 'ADICIONAR';
    this.activeMotoristaPhotoTab = 'ADICIONAR';
    this.manageSearchTerm = '';
    this.previewImageUrl = null;
    this.isDraggingComprovante = false;
    this.isDraggingMotoristaDoc = false;
    this.isDraggingCnh = false;
    this.isDraggingCrlv = false;
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

  baixarBackupZip(): void {
    const urlBackup = `${environment.apiUrl}/admin/backup/uploads-zip`;
    window.open(urlBackup, '_blank');
    this.closeSidebar();
  }

  onRestaurarBackupSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length > 0) {
      if (!target.files || target.files.length === 0) return;
      const file = target.files[0];
      if (!file.name.endsWith('.zip')) {
        alert('Por favor, selecione um arquivo no formato .zip');
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

  carregarViagens(): void {
    this.isLoading = true;
    this.viagemService.listarTodas().subscribe({
      next: (viagens: Viagem[]) => {
        this.viagensAndamento = [];
        this.viagensPagar = [];
        this.viagensFinalizadas = [];

        (viagens || []).forEach((v: Viagem) => {
          const item = this.mapViagemParaItem(v);
          const st = (item.status || '').toString().toUpperCase().replace(/_/g, ' ').trim();

          if (st === 'FINALIZADO') {
            this.viagensFinalizadas.push(item);
          } else if (st === 'A PAGAR') {
            this.viagensPagar.push(item);
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

    return {
      id: `#${v.id}`,
      rawId: v.id || 0,
      cliente: v.cliente,
      origem: origens.length ? origens : ['-'],
      destino: destinos.length ? destinos : ['-'],
      placa: v.placa || '-',
      motorista: v.nomeMotorista || v.nome_motorista || 'A Contratar',
      status: v.status,
      obs: v.observacao || '-',
      fotos: fotos,
      rawViagem: v
    };
  }

  prosseguirParaPagar(item: ViagemItem): void {
    if (!item.rawViagem) return;
    const atualizada: any = { 
      ...item.rawViagem, 
      id: item.rawId,
      status: 'A_PAGAR' 
    };
    
    this.viagemService.salvar(atualizada).subscribe({
      next: () => {
        this.showPagar = true;
        this.closeRowActions();
        this.carregarViagens();
      },
      error: (err) => {
        console.error('Erro ao avançar viagem para A Pagar:', err);
        alert('Erro ao atualizar status da viagem.');
      }
    });
  }

  finalizarViagem(item: ViagemItem): void {
    if (!item.rawViagem) return;
    const atualizada: any = { 
      ...item.rawViagem, 
      id: item.rawId,
      status: 'FINALIZADO' 
    };
    
    this.viagemService.salvar(atualizada).subscribe({
      next: () => {
        this.showFinalizadas = true;
        this.closeRowActions();
        this.carregarViagens();
      },
      error: (err) => {
        console.error('Erro ao finalizar viagem:', err);
        alert('Erro ao finalizar viagem.');
      }
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

  trocarAbaFoto(aba: 'ADICIONAR' | 'LISTAR', event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.activePhotoTab = aba;
    this.cdr.detectChanges();
  }

  onComprovanteFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      this.novoComprovante.arquivo = file;
      this.novoComprovante.nomeArquivo = file.name;
      if (!this.novoComprovante.descricao.trim()) {
        this.novoComprovante.descricao = file.name.replace(/\.[^/.]+$/, '');
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
        this.novoComprovante.descricao = file.name.replace(/\.[^/.]+$/, '');
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
    const nomeDescricao = this.novoComprovante.descricao.trim();
    const arquivoParaEnvio = this.novoComprovante.arquivo;

    this.viagemService.uploadComprovante(
      viagemAtual.rawId,
      nomeDescricao,
      arquivoParaEnvio
    ).subscribe({
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
    
    const viagemAtual = this.selectedViagem;

    this.viagemService.deletarComprovante(viagemAtual.rawId, id).subscribe({
      next: () => {
        if (viagemAtual.fotos) {
          viagemAtual.fotos = viagemAtual.fotos.filter(f => f.id !== id);
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
          placa: m.placa,
          fornecedorVinculado: m.fornecedor || 'Sem Agência (Frota Própria)',
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
        this.cdr.detectChanges();
      },
      error: (err: unknown) => console.error('Erro ao carregar motoristas:', err)
    });
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
        this.novoDocMotorista.nome = file.name.replace(/\.[^/.]+$/, '');
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
        this.novoDocMotorista.nome = file.name.replace(/\.[^/.]+$/, '');
      }
      this.cdr.detectChanges();
    }
  }

  adicionarDocMotorista(): void {
    if (!this.selectedMotorista || !this.novoDocMotorista.arquivo) {
      alert('Selecione um arquivo para adicionar.');
      return;
    }

    const tipoDoc: string = this.novoDocMotorista.nome.trim() || 'Documento';

    this.motoristaService.uploadDocumento(
      this.selectedMotorista.id,
      tipoDoc,
      this.novoDocMotorista.arquivo
    ).subscribe({
      next: () => {
        this.carregarMotoristas();
        this.novoDocMotorista = { nome: '', descricao: '', arquivo: null, nomeArquivo: '' };
        this.activeMotoristaPhotoTab = 'LISTAR';
        this.cdr.detectChanges();
      },
      error: () => alert('Erro ao fazer upload do documento do motorista.')
    });
  }

  removerDocMotorista(event: Event, id: number): void {
    event.stopPropagation();
    this.motoristaService.deletarDocumentoExtra(id).subscribe({
      next: () => this.carregarMotoristas(),
      error: () => alert('Erro ao excluir documento.')
    });
  }

  public getEmptyMotorista(): MotoristaModel {
    return { 
      id: 0, 
      nome: '', 
      cpf: '', 
      placa: '', 
      fornecedorVinculado: '', 
      situacao: 'ATIVO', 
      informacoesAdicionais: '', 
      cnhPreviewName: '', 
      crlvPreviewName: '', 
      documentos: [] 
    };
  }

  openGerenciarMotoristas(): void {
    this.motoristaForm = this.getEmptyMotorista();
    this.isEditingMotorista = false;
    this.activeManageTab = 'CADASTRAR';
    this.modalType = 'MOTORISTA';
    this.isManageOpen = false;
    this.cdr.detectChanges();
  }

  salvarMotorista(): void {
    if (!this.motoristaForm.nome.trim()) return;

    const payload: Motorista = {
      id: this.isEditingMotorista ? this.motoristaForm.id : undefined,
      nome: this.motoristaForm.nome,
      cpf: this.motoristaForm.cpf,
      placa: this.motoristaForm.placa,
      fornecedor: this.motoristaForm.fornecedorVinculado || 'Sem Agência (Frota Própria)',
      situacao: this.motoristaForm.situacao,
      ativo: this.motoristaForm.situacao === 'ATIVO',
      informacoesAdicionais: this.motoristaForm.informacoesAdicionais
    };

    this.motoristaService.salvar(payload).subscribe({
      next: (motSalvo: Motorista) => {
        if (this.motoristaForm.cnhFile && motSalvo.id) {
          this.motoristaService.uploadDocumento(motSalvo.id, 'CNH', this.motoristaForm.cnhFile).subscribe();
        }
        if (this.motoristaForm.crlvFile && motSalvo.id) {
          this.motoristaService.uploadDocumento(motSalvo.id, 'CRLV', this.motoristaForm.crlvFile).subscribe();
        }
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

  onCnhDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingCnh = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.motoristaForm.cnhFile = file;
      this.motoristaForm.cnhPreviewName = file.name;
      this.cdr.detectChanges();
    }
  }

  onCrlvDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingCrlv = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.motoristaForm.crlvFile = file;
      this.motoristaForm.crlvPreviewName = file.name;
      this.cdr.detectChanges();
    }
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
        this.cdr.detectChanges();
      },
      error: (err: unknown) => console.error('Erro ao carregar clientes:', err)
    });
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
    this.cdr.detectChanges();
  }

  salvarCliente(): void {
    if (!this.clienteForm.nomeFantasia.trim()) return;

    const payload: Cliente = {
      id: this.isEditingCliente ? this.clienteForm.id : undefined,
      nome: this.clienteForm.nomeFantasia,
      nomeFantasia: this.clienteForm.nomeFantasia,
      razaoSocial: this.clienteForm.razaoSocial,
      cnpjCpf: this.clienteForm.cnpjCpf,
      nomeContato: this.clienteForm.nomeContato,
      telefone: this.clienteForm.telefone,
      email: this.clienteForm.email,
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
          situacao: (f.situacao === 'INATIVO' || f.ativo === false) ? 'INATIVO' : 'ATIVO',
          obs: f.obs || f.observacoes || ''
        }));
        this.cdr.detectChanges();
      },
      error: (err: unknown) => console.error('Erro ao carregar fornecedores:', err)
    });
  }

  public getEmptyFornecedor(): FornecedorModel {
    return { id: 0, nome: '', cnpjCpf: '', nomeContato: '', telefone: '', email: '', chavePix: '', situacao: 'ATIVO', obs: '' };
  }

  openGerenciarFornecedores(): void {
    this.fornecedorForm = this.getEmptyFornecedor();
    this.isEditingFornecedor = false;
    this.activeManageTab = 'CADASTRAR';
    this.modalType = 'FORNECEDOR';
    this.isManageOpen = false;
    this.cdr.detectChanges();
  }

  salvarFornecedor(): void {
    if (!this.fornecedorForm.nome.trim()) return;

    const payload: Fornecedor = {
      id: this.isEditingFornecedor ? this.fornecedorForm.id : undefined,
      nome: this.fornecedorForm.nome,
      cnpjCpf: this.fornecedorForm.cnpjCpf,
      nomeContato: this.fornecedorForm.nomeContato,
      telefone: this.fornecedorForm.telefone,
      email: this.fornecedorForm.email,
      chavePix: this.fornecedorForm.chavePix,
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

  addOrigem(): void { this.tripForm.origens.push({ local: '', endereco: '' }); this.cdr.detectChanges(); }
  removeOrigem(index: number): void { if (this.tripForm.origens.length > 1) this.tripForm.origens.splice(index, 1); this.cdr.detectChanges(); }
  addDestino(): void { this.tripForm.destinos.push({ local: '', endereco: '' }); this.cdr.detectChanges(); }
  removeDestino(index: number): void { if (this.tripForm.destinos.length > 1) this.tripForm.destinos.splice(index, 1); this.cdr.detectChanges(); }

  openNovaViagemModal(): void {
    this.isEditing = false;
    this.tripForm = {
      id: '',
      clienteSelect: '',
      clienteManual: '',
      origens: [{ local: '', endereco: '' }],
      destinos: [{ local: '', endereco: '' }],
      motorista: '',
      agencia: 'Sem Agência (Frota Própria)',
      coletaPrevista: '',
      coletaReal: '',
      entregaPrevista: '',
      entregaReal: '',
      valorReceber: 0,
      adicionalReceber: 0,
      valorPagarMotorista: 0,
      adicionalPagarMotorista: 0,
      valorAdicionalAgencia: 0,
      pagamentoLiberado: false,
      pagamentoRealizado: 'Não Realizado',
      dataHoraPagada: '',
      statusInicial: 'PROGRAMADO',
      observacao: ''
    };
    this.modalType = 'TRIP_FORM';
    this.cdr.detectChanges();
  }

  openEditarModal(item: ViagemItem, origin: 'andamento' | 'pagar' | 'finalizadas'): void {
    this.isEditing = true;
    this.selectedViagem = item;
    this.selectedListOrigin = origin;

    const raw: any = item.rawViagem;
    
    const rawColetaArr = (raw?.localColeta || raw?.local_coleta || '').split(';').map((s: string) => s.trim());
    const origensMapeadas: PontoRota[] = item.origem.map((o, idx) => ({
      local: o === '-' ? '' : o,
      endereco: rawColetaArr[idx] || (rawColetaArr.length === 1 && rawColetaArr[0] !== o ? rawColetaArr[0] : '')
    }));

    const rawEntregaArr = (raw?.localEntrega || raw?.local_entrega || '').split(';').map((s: string) => s.trim());
    const destinosMapeados: PontoRota[] = item.destino.map((d, idx) => ({
      local: d === '-' ? '' : d,
      endereco: rawEntregaArr[idx] || (rawEntregaArr.length === 1 && rawEntregaArr[0] !== d ? rawEntregaArr[0] : '')
    }));

    this.tripForm = {
      id: item.id.replace('#', ''),
      clienteSelect: item.cliente,
      clienteManual: '',
      origens: origensMapeadas.length > 0 ? origensMapeadas : [{ local: '', endereco: '' }],
      destinos: destinosMapeados.length > 0 ? destinosMapeados : [{ local: '', endereco: '' }],
      motorista: item.motorista === 'A Contratar' ? '' : item.motorista,
      agencia: raw?.fornecedorAgencia || raw?.fornecedor_agencia || 'Sem Agência (Frota Própria)',
      coletaPrevista: (raw?.dataColetaPrevista || raw?.data_coleta_prevista || '') === 'A confirmar' ? '' : (raw?.dataColetaPrevista || raw?.data_coleta_prevista || ''),
      coletaReal: (raw?.dataColetaReal || raw?.data_coleta_real || '') === 'A confirmar' ? '' : (raw?.dataColetaReal || raw?.data_coleta_real || ''),
      entregaPrevista: (raw?.dataEntregaPrevista || raw?.data_entrega_prevista || '') === 'A confirmar' ? '' : (raw?.dataEntregaPrevista || raw?.data_entrega_prevista || ''),
      entregaReal: (raw?.dataEntregaReal || raw?.data_entrega_real || '') === 'A confirmar' ? '' : (raw?.dataEntregaReal || raw?.data_entrega_real || ''),
      valorReceber: raw?.valorAReceber || raw?.valor_a_receber || 0,
      adicionalReceber: raw?.valorAdicionalReceber || raw?.valor_adicional_receber || 0,
      valorPagarMotorista: raw?.valorAPagar || raw?.valor_a_pagar || 0,
      adicionalPagarMotorista: raw?.valorAdicionalPagar || raw?.valor_adicional_pagar || 0,
      valorAdicionalAgencia: raw?.valorAdicionalAgencia || raw?.valor_adicional_agencia || 0,
      pagamentoLiberado: raw?.pagamentoLiberado ?? raw?.pagamento_liberado ?? false,
      pagamentoRealizado: (raw?.pagamentoRealizadoStatus || raw?.pagamento_realizado_status as TipoPagamentoRealizado) || 'Não Realizado',
      dataHoraPagada: raw?.dataHoraPagamento || raw?.data_hora_pagamento || '',
      statusInicial: item.status,
      observacao: item.obs === '-' ? '' : (item.obs || '')
    };

    this.modalType = 'TRIP_FORM';
    this.closeRowActions();
    this.cdr.detectChanges();
  }

  salvarViagemForm(): void {
    const rawIdInput = (this.tripForm.id || '').toString().trim();

    if (!this.isEditing && (!rawIdInput || isNaN(Number(rawIdInput)) || Number(rawIdInput) <= 0)) {
      alert('Por favor, informe o Nº da Viagem (ID) antes de cadastrar.');
      return;
    }

    const idFinal = this.isEditing && this.selectedViagem 
      ? this.selectedViagem.rawId 
      : Number(rawIdInput);

    const nomeClienteFinal = (this.tripForm.clienteManual || '').trim() || this.tripForm.clienteSelect;
    if (!nomeClienteFinal) {
      alert('Por favor, selecione ou digite o nome do Cliente.');
      return;
    }

    const origensLocaisArray = (this.tripForm.origens || [])
      .map(o => (o.local || '').trim())
      .filter(o => o.length > 0);
    const origensEnderecosArray = (this.tripForm.origens || [])
      .map(o => (o.endereco || '').trim());

    const destinosLocaisArray = (this.tripForm.destinos || [])
      .map(d => (d.local || '').trim())
      .filter(d => d.length > 0);
    const destinosEnderecosArray = (this.tripForm.destinos || [])
      .map(d => (d.endereco || '').trim());

    const strOrigemLocal = origensLocaisArray.join('; ') || 'Origem não informada';
    const strOrigemEndereco = origensEnderecosArray.join('; ') || strOrigemLocal;

    const strDestinoLocal = destinosLocaisArray.join('; ') || 'Destino não informado';
    const strDestinoEndereco = destinosEnderecosArray.join('; ') || strDestinoLocal;

    let motoristaFinal = 'A Contratar';
    let placaFinal = '-';
    let cpfFinal = '';

    if (this.tripForm.motorista && this.tripForm.motorista.trim() !== '') {
      const motSelected = this.motoristasList.find(m => m.nome.toLowerCase() === this.tripForm.motorista.toLowerCase());
      motoristaFinal = motSelected ? motSelected.nome : this.tripForm.motorista;
      placaFinal = motSelected ? motSelected.placa : '-';
      cpfFinal = motSelected ? motSelected.cpf : '';
    }

    const payload: any = {
      id: idFinal,
      cliente: nomeClienteFinal,

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

      nomeMotorista: motoristaFinal,
      nome_motorista: motoristaFinal,
      cpfMotorista: cpfFinal,
      cpf_motorista: cpfFinal,
      placa: placaFinal,

      fornecedorAgencia: this.tripForm.agencia || 'Sem Agência (Frota Própria)',
      fornecedor_agencia: this.tripForm.agencia || 'Sem Agência (Frota Própria)',

      dataColetaPrevista: this.tripForm.coletaPrevista || '',
      data_coleta_prevista: this.tripForm.coletaPrevista || '',
      dataColetaReal: this.tripForm.coletaReal || '',
      data_coleta_real: this.tripForm.coletaReal || '',

      dataEntregaPrevista: this.tripForm.entregaPrevista || '',
      data_entrega_prevista: this.tripForm.entregaPrevista || '',
      dataEntregaReal: this.tripForm.entregaReal || '',
      data_entrega_real: this.tripForm.entregaReal || '',

      valorAReceber: Number(this.tripForm.valorReceber) || 0,
      valor_a_receber: Number(this.tripForm.valorReceber) || 0,
      valorAdicionalReceber: Number(this.tripForm.adicionalReceber) || 0,
      valor_adicional_receber: Number(this.tripForm.adicionalReceber) || 0,

      valorAPagar: Number(this.tripForm.valorPagarMotorista) || 0,
      valor_a_pagar: Number(this.tripForm.valorPagarMotorista) || 0,
      valorAdicionalPagar: Number(this.tripForm.adicionalPagarMotorista) || 0,
      valor_adicional_pagar: Number(this.tripForm.adicionalPagarMotorista) || 0,

      valorAdicionalAgencia: Number(this.tripForm.valorAdicionalAgencia) || 0,
      valor_adicional_agencia: Number(this.tripForm.valorAdicionalAgencia) || 0,

      pagamentoLiberado: !!this.tripForm.pagamentoLiberado,
      pagamento_liberado: !!this.tripForm.pagamentoLiberado,
      pagamentoRealizadoStatus: this.tripForm.pagamentoRealizado || 'Não Realizado',
      pagamento_realizado_status: this.tripForm.pagamentoRealizado || 'Não Realizado',
      dataHoraPagamento: this.tripForm.dataHoraPagada || '',
      data_hora_pagamento: this.tripForm.dataHoraPagada || '',

      status: this.tripForm.statusInicial || 'PROGRAMADO',
      observacao: (this.tripForm.observacao || '').trim()
    };

    this.viagemService.salvar(payload).subscribe({
      next: () => {
        this.carregarViagens();
        this.closeModal();
      },
      error: (err: any) => {
        console.error('Erro ao salvar viagem:', err);
        const msg = err.error?.reason || err.error?.message || err.error?.mensagem || (typeof err.error === 'string' ? err.error : null) || 'Verifique se o ID informado já existe.';
        alert('Erro ao salvar viagem: ' + msg);
      }
    });
  }

  get filteredFornecedores(): FornecedorModel[] {
    const t = this.manageSearchTerm.toLowerCase();
    return this.fornecedoresList.filter(f => f.nome.toLowerCase().includes(t) || f.cnpjCpf.toLowerCase().includes(t) || f.nomeContato.toLowerCase().includes(t));
  }

  get filteredClientes(): ClienteModel[] {
    const t = this.manageSearchTerm.toLowerCase();
    return this.clientesList.filter(c => c.nomeFantasia.toLowerCase().includes(t) || c.razaoSocial.toLowerCase().includes(t) || c.cnpjCpf.toLowerCase().includes(t));
  }

  get filteredMotoristas(): MotoristaModel[] {
    const t = this.manageSearchTerm.toLowerCase();
    return this.motoristasList.filter(m => m.nome.toLowerCase().includes(t) || m.placa.toLowerCase().includes(t) || m.cpf.toLowerCase().includes(t));
  }

  openObsModal(item: ViagemItem): void {
    this.selectedViagem = item;
    this.modalType = 'OBS';
    this.closeRowActions();
    this.cdr.detectChanges();
  }

  salvarObs(): void {
    if (this.selectedViagem && this.selectedViagem.rawViagem) {
      const payload: any = { ...this.selectedViagem.rawViagem, observacao: this.selectedViagem.obs };
      this.viagemService.salvar(payload).subscribe({
        next: () => this.carregarViagens(),
        error: () => alert('Erro ao salvar observação.')
      });
    }
    this.closeModal();
  }

  openExcluirModal(item: ViagemItem, origin: 'andamento' | 'pagar' | 'finalizadas'): void {
    this.selectedViagem = item;
    this.selectedListOrigin = origin;
    this.modalType = 'DELETE';
    this.closeRowActions();
    this.cdr.detectChanges();
  }

  confirmarExclusao(): void {
    if (this.selectedViagem) {
      this.viagemService.deletar(this.selectedViagem.rawId).subscribe({
        next: () => {
          this.carregarViagens();
          this.closeModal();
        },
        error: () => alert('Erro ao excluir viagem.')
      });
    }
  }

  onFileSelected(event: Event, tipo: 'CNH' | 'CRLV'): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      if (tipo === 'CNH') {
        this.motoristaForm.cnhFile = file;
        this.motoristaForm.cnhPreviewName = file.name;
      } else {
        this.motoristaForm.crlvFile = file;
        this.motoristaForm.crlvPreviewName = file.name;
      }
      this.cdr.detectChanges();
    }
  }
}