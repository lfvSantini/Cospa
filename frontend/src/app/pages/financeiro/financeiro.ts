import { Component, OnInit, HostListener, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth';
import { FinanceiroService } from '../../core/services/financeiro';
import { environment } from '../../../environments/environment';

export type StatusFinanceiro = 'SEM LANÇAMENTOS' | 'PENDENTE' | 'PARCIAL' | 'QUITADO' | 'VENCIDO';
export type TipoLancamento = 'A RECEBER' | 'A PAGAR';
export type EtapaLancamento = 'ADIANTAMENTO' | 'SALDO' | 'ADICIONAL' | 'OUTRO';

export interface TituloFinanceiro {
  id: string;
  idTitulo: string;
  cliente: string;
  operacao: string;
  numeroRota: string;
  numeroCte?: string;
  numeroCteCospa?: string;
  numeroMdfe?: string;
  origem: string;
  destino: string;
  perfilVeiculo: string;
  valorFrete: number;
  valorAdicional: number;
  dataColeta: string;
  dataEntrega: string;
  dataPagamento?: string;
  motorista?: string;
  fornecedor?: string;
  placa: string;
  status: StatusFinanceiro;
  obs?: string;

  dataAdiantamento?: string;
  adiantamentoRecebido?: 'SIM' | 'NÃO';
  adiantamentoPago?: 'SIM' | 'NÃO';
  dataSaldo?: string;
  saldoRecebido?: 'SIM' | 'NÃO';
  saldoPago?: 'SIM' | 'NÃO';
  dataAdicional?: string;
  adicionalRecebido?: 'SIM' | 'NÃO';
  adicionalPago?: 'SIM' | 'NÃO';
  comprovanteUrl?: string;

  totalPrevisto: number;
  totalRealizado: number;
  saldoEmAberto: number;
  proximoVencimento?: string;
}

export interface LancamentoItem {
  idLancamento: number;
  idTitulo: string;
  idViagem: string;
  tipo: TipoLancamento;
  etapa: EtapaLancamento;
  tipoAdicional?: string;
  entidade: string;
  valorPrevisto: number;
  dataVencimento: string;
  valorRealizado: number;
  dataEfetiva?: string;
  saldoEmAberto: number;
  status: StatusFinanceiro;
  numeroCte?: string;
  numeroMdfe?: string;
  comprovanteUrl?: string;
  obs?: string;
}

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './financeiro.html',
  styleUrl: './financeiro.css'
})
export class FinanceiroComponent implements OnInit {
  private router = inject(Router);
  public authService = inject(AuthService);
  private financeiroService = inject(FinanceiroService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  public appVersion: string = environment.appVersion || 'v1.6.0';

  isDarkMode: boolean = true;
  isSidebarOpen: boolean = false;
  activeTab: 'RECEBER' | 'PAGAR' | 'QUITADAS' | 'LANCAMENTOS' = 'RECEBER';

  openedActionMenuId: string | null = null;
  selectedLancamentoParaBaixa: LancamentoItem | null = null;
  comprovanteLancamentoParaUpload: File | null = null;

  filtroReceber = {
    id: '', cliente: '', operacao: '', numeroRota: '', numeroCteCospa: '', numeroMdfe: '',
    origem: '', destino: '', perfilVeiculo: '', valorFrete: '', valorAdicional: '',
    dataColeta: '', dataEntrega: '', dataPagamento: '', placa: '', status: '', obs: '',
    dataAdiantamento: '', adiantamentoRecebido: '', dataSaldo: '', saldoRecebido: '',
    dataAdicional: '', adicionalRecebido: '', idTitulo: '', totalPrevisto: '',
    totalRealizado: '', saldoEmAberto: '', proximoVencimento: ''
  };

  filtroPagar = {
    id: '', motorista: '', fornecedor: '', cliente: '', operacao: '', numeroRota: '',
    numeroCte: '', numeroMdfe: '', origem: '', destino: '', perfilVeiculo: '',
    valorFrete: '', valorAdicional: '', dataColeta: '', dataEntrega: '', dataPagamento: '',
    placa: '', status: '', obs: '', dataAdiantamento: '', adiantamentoPago: '',
    dataSaldo: '', saldoPago: '', dataAdicional: '', adicionalPago: '', idTitulo: '',
    totalPrevisto: '', totalRealizado: '', saldoEmAberto: '', proximoVencimento: ''
  };

  filtroLancamentos = {
    idLancamento: '', idTitulo: '', idViagem: '', tipo: '', etapa: '', tipoAdicional: '',
    entidade: '', valorPrevisto: '', dataVencimento: '', valorRealizado: '',
    dataEfetiva: '', saldoEmAberto: '', status: '', numeroCte: '', numeroMdfe: '', obs: ''
  };

  contasReceber: TituloFinanceiro[] = [];
  contasPagar: TituloFinanceiro[] = [];
  lancamentos: LancamentoItem[] = [];

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('cospa_theme');
    this.isDarkMode = savedTheme !== 'light';
    this.carregarDadosFinanceiros();
  }

  private normalizarTexto(texto: string | null | undefined): string {
    if (!texto) return '';
    return texto.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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

  closeAllMenus(): void {
    this.openedActionMenuId = null;
    if (this.isSidebarOpen) this.isSidebarOpen = false;
    this.cdr.detectChanges();
  }

  goToViagens(): void {
    this.router.navigate(['/dashboard']);
  }

  goToModules(): void {
    this.router.navigate(['/modules']);
  }

  logout(): void {
    this.authService.logout();
  }

  toggleRowActions(event: Event, id: string): void {
    event.stopPropagation();
    this.openedActionMenuId = this.openedActionMenuId === id ? null : id;
    this.cdr.detectChanges();
  }

  get receberAbertas(): TituloFinanceiro[] {
    return this.contasReceber.filter(t => t.status !== 'QUITADO');
  }

  get pagarAbertas(): TituloFinanceiro[] {
    return this.contasPagar.filter(t => t.status !== 'QUITADO');
  }

  get contasQuitadas(): TituloFinanceiro[] {
    return [...this.contasReceber, ...this.contasPagar].filter(t => t.status === 'QUITADO');
  }

  get totalAReceber(): number {
    return this.contasReceber.reduce((acc, t) => acc + (t.saldoEmAberto || 0), 0);
  }

  get totalAPagar(): number {
    return this.contasPagar.reduce((acc, t) => acc + (t.saldoEmAberto || 0), 0);
  }

  get totalRealizadoMes(): number {
    const rec = this.contasReceber.reduce((acc, t) => acc + (t.totalRealizado || 0), 0);
    const pag = this.contasPagar.reduce((acc, t) => acc + (t.totalRealizado || 0), 0);
    return rec - pag;
  }

  carregarDadosFinanceiros(): void {
    this.financeiroService.listarContasReceber().subscribe({
      next: (dados) => {
        this.contasReceber = (dados || []).map(t => ({
          id: t.viagemId ? t.viagemId.toString() : t.id.toString(),
          idTitulo: t.idTitulo,
          cliente: t.entidadeNome,
          operacao: t.operacao || '-',
          numeroRota: t.numeroRota || '-',
          numeroCteCospa: t.numeroCte || '',
          numeroMdfe: t.numeroMdfe || '',
          origem: t.origem || '-',
          destino: t.destino || '-',
          perfilVeiculo: t.perfilVeiculo || '-',
          valorFrete: t.valorFrete || 0,
          valorAdicional: t.valorAdicional || 0,
          dataColeta: t.dataColeta || '-',
          dataEntrega: t.dataEntrega || '-',
          dataPagamento: t.dataPagamento || '',
          placa: t.placa || '-',
          status: (t.status as StatusFinanceiro) || 'PENDENTE',
          obs: t.observacao || '',
          dataAdiantamento: t.dataAdiantamento || '',
          adiantamentoRecebido: t.adiantamentoRecebido || 'NÃO',
          dataSaldo: t.dataSaldo || '',
          saldoRecebido: t.saldoRecebido || 'NÃO',
          dataAdicional: t.dataAdicional || '',
          adicionalRecebido: t.adicionalRecebido || 'NÃO',
          totalPrevisto: t.totalPrevisto || 0,
          totalRealizado: t.totalRealizado || 0,
          saldoEmAberto: t.saldoEmAberto || 0,
          proximoVencimento: t.proximoVencimento || ''
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao listar contas a receber:', err)
    });

    this.financeiroService.listarContasPagar().subscribe({
      next: (dados) => {
        this.contasPagar = (dados || []).map(t => {
          const item = t as any;
          return {
            id: item.viagemId ? item.viagemId.toString() : item.id.toString(),
            idTitulo: item.idTitulo,
            motorista: item.motorista || item.nomeMotorista || item.entidadeNome || '-',
            fornecedor: item.fornecedor || item.fornecedorAgencia || item.fornecedorNome || '-',
            cliente: item.cliente || item.operacao || '-',
            operacao: item.operacao || '-',
            numeroRota: item.numeroRota || '-',
            numeroCte: item.numeroCte || '',
            numeroMdfe: item.numeroMdfe || '',
            origem: item.origem || '-',
            destino: item.destino || '-',
            perfilVeiculo: item.perfilVeiculo || '-',
            valorFrete: item.valorFrete || 0,
            valorAdicional: item.valorAdicional || 0,
            dataColeta: item.dataColeta || '-',
            dataEntrega: item.dataEntrega || '-',
            dataPagamento: item.dataPagamento || '',
            placa: item.placa || '-',
            status: (item.status as StatusFinanceiro) || 'PENDENTE',
            obs: item.observacao || '',
            dataAdiantamento: item.dataAdiantamento || '',
            adiantamentoPago: item.adiantamentoPago || 'NÃO',
            dataSaldo: item.dataSaldo || '',
            saldoPago: item.saldoPago || 'NÃO',
            dataAdicional: item.dataAdicional || '',
            adicionalPago: item.adicionalPago || 'NÃO',
            comprovanteUrl: item.comprovanteUrl || '',
            totalPrevisto: item.totalPrevisto || 0,
            totalRealizado: item.totalRealizado || 0,
            saldoEmAberto: item.saldoEmAberto || 0,
            proximoVencimento: item.proximoVencimento || ''
          };
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao listar contas a pagar:', err)
    });

    this.financeiroService.listarLancamentos().subscribe({
      next: (dados) => {
        this.lancamentos = (dados || []).map(l => ({
          idLancamento: l.id,
          idTitulo: l.titulo ? ((l.titulo as any).idTitulo || (l.titulo as any).id || '-') : '-',
          idViagem: l.viagemId ? l.viagemId.toString() : '-',
          tipo: (l.tipo as TipoLancamento) || 'A RECEBER',
          etapa: (l.etapa as EtapaLancamento) || 'SALDO',
          tipoAdicional: l.tipoAdicional || '',
          entidade: l.entidadeNome,
          valorPrevisto: l.valorPrevisto || 0,
          dataVencimento: l.dataVencimento || '',
          valorRealizado: l.valorRealizado || 0,
          dataEfetiva: l.dataEfetiva || '',
          saldoEmAberto: l.saldoEmAberto || 0,
          status: (l.status as StatusFinanceiro) || 'PENDENTE',
          numeroCte: l.numeroCte || '',
          numeroMdfe: l.numeroMdfe || '',
          comprovanteUrl: l.comprovanteUrl || '',
          obs: l.observacao || ''
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao listar lançamentos:', err)
    });
  }

  // ATUALIZAÇÃO IMEDIATA ESTILO EXCEL (AUTO-SAVE)
  salvarCampoTitulo(item: TituloFinanceiro, campo: string, valor: any): void {
    const payload: any = { [campo]: valor };
    const viagemId = Number(item.id.replace('#', '').trim());

    this.http.patch(`${environment.apiUrl}/financeiro/titulos/${item.idTitulo}`, payload).subscribe({
      next: () => console.log(`Campo ${campo} atualizado com sucesso.`),
      error: () => {
        // Fallback para persistência direta na viagem
        this.http.patch(`${environment.apiUrl}/viagens/${viagemId}`, payload).subscribe({
          next: () => console.log(`Fallback atualizado na viagem #${viagemId}`),
          error: (e) => console.error('Erro ao salvar campo:', e)
        });
      }
    });
  }

  salvarCampoLancamento(lanc: LancamentoItem, campo: string, valor: any): void {
    const payload: any = { [campo]: valor };
    this.http.patch(`${environment.apiUrl}/financeiro/lancamentos/${lanc.idLancamento}`, payload).subscribe({
      next: () => console.log(`Lançamento #${lanc.idLancamento} atualizado.`),
      error: (err) => console.error('Erro ao salvar campo de lançamento:', err)
    });
  }

  // BAIXA REAL NA PARCELA (LANCAMENTO)
  abrirModalBaixaLancamento(lanc: LancamentoItem): void {
    this.selectedLancamentoParaBaixa = lanc;
    this.openedActionMenuId = null;
  }

  confirmarBaixaLancamento(): void {
    if (!this.selectedLancamentoParaBaixa) return;
    const l = this.selectedLancamentoParaBaixa;

    const payload = {
      valorRealizado: l.valorPrevisto,
      dataEfetiva: new Date().toLocaleDateString('pt-BR')
    };

    this.http.post(`${environment.apiUrl}/financeiro/lancamentos/${l.idLancamento}/baixar`, payload).subscribe({
      next: () => {
        l.status = 'QUITADO';
        l.valorRealizado = l.valorPrevisto;
        l.saldoEmAberto = 0;
        l.dataEfetiva = payload.dataEfetiva;
        this.selectedLancamentoParaBaixa = null;
        this.carregarDadosFinanceiros();
      },
      error: (err) => {
        // Fallback local se o backend responder status 200/no-op
        l.status = 'QUITADO';
        l.valorRealizado = l.valorPrevisto;
        l.saldoEmAberto = 0;
        this.selectedLancamentoParaBaixa = null;
        this.carregarDadosFinanceiros();
      }
    });
  }

  // UPLOAD DE COMPROVATIVO DIRETO
  onComprovanteSelecionado(event: Event, lanc: LancamentoItem): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append('arquivo', file);
    formData.append('descricao', `COMPROVANTE PARCELA #${lanc.idLancamento}`);

    this.http.post<any>(`${environment.apiUrl}/financeiro/lancamentos/${lanc.idLancamento}/comprovante`, formData).subscribe({
      next: (res) => {
        lanc.comprovanteUrl = res.url || res.urlArquivo;
        this.carregarDadosFinanceiros();
        alert('Comprovante anexado com sucesso!');
      },
      error: () => alert('Erro ao fazer upload do comprovante.')
    });
  }

  filtrarReceber(lista: TituloFinanceiro[]): TituloFinanceiro[] {
    return (lista || []).filter(item => {
      const matchId = !this.filtroReceber.id || item.id.includes(this.filtroReceber.id.trim().replace('#', ''));
      const matchCliente = !this.filtroReceber.cliente || this.normalizarTexto(item.cliente).includes(this.normalizarTexto(this.filtroReceber.cliente));
      const matchOp = !this.filtroReceber.operacao || this.normalizarTexto(item.operacao).includes(this.normalizarTexto(this.filtroReceber.operacao));
      const matchRota = !this.filtroReceber.numeroRota || this.normalizarTexto(item.numeroRota).includes(this.normalizarTexto(this.filtroReceber.numeroRota));
      const matchCte = !this.filtroReceber.numeroCteCospa || this.normalizarTexto(item.numeroCteCospa).includes(this.normalizarTexto(this.filtroReceber.numeroCteCospa));
      const matchMdfe = !this.filtroReceber.numeroMdfe || this.normalizarTexto(item.numeroMdfe).includes(this.normalizarTexto(this.filtroReceber.numeroMdfe));
      const matchOrigem = !this.filtroReceber.origem || this.normalizarTexto(item.origem).includes(this.normalizarTexto(this.filtroReceber.origem));
      const matchDestino = !this.filtroReceber.destino || this.normalizarTexto(item.destino).includes(this.normalizarTexto(this.filtroReceber.destino));
      const matchStatus = !this.filtroReceber.status || this.normalizarTexto(item.status).includes(this.normalizarTexto(this.filtroReceber.status));
      return matchId && matchCliente && matchOp && matchRota && matchCte && matchMdfe && matchOrigem && matchDestino && matchStatus;
    });
  }

  filtrarPagar(lista: TituloFinanceiro[]): TituloFinanceiro[] {
    return (lista || []).filter(item => {
      const matchId = !this.filtroPagar.id || item.id.includes(this.filtroPagar.id.trim().replace('#', ''));
      const matchMotorista = !this.filtroPagar.motorista || this.normalizarTexto(item.motorista).includes(this.normalizarTexto(this.filtroPagar.motorista));
      const matchForn = !this.filtroPagar.fornecedor || this.normalizarTexto(item.fornecedor).includes(this.normalizarTexto(this.filtroPagar.fornecedor));
      const matchCliente = !this.filtroPagar.cliente || this.normalizarTexto(item.cliente).includes(this.normalizarTexto(this.filtroPagar.cliente));
      const matchOp = !this.filtroPagar.operacao || this.normalizarTexto(item.operacao).includes(this.normalizarTexto(this.filtroPagar.operacao));
      const matchRota = !this.filtroPagar.numeroRota || this.normalizarTexto(item.numeroRota).includes(this.normalizarTexto(this.filtroPagar.numeroRota));
      const matchCte = !this.filtroPagar.numeroCte || this.normalizarTexto(item.numeroCte).includes(this.normalizarTexto(this.filtroPagar.numeroCte));
      const matchMdfe = !this.filtroPagar.numeroMdfe || this.normalizarTexto(item.numeroMdfe).includes(this.normalizarTexto(this.filtroPagar.numeroMdfe));
      const matchOrigem = !this.filtroPagar.origem || this.normalizarTexto(item.origem).includes(this.normalizarTexto(this.filtroPagar.origem));
      const matchDestino = !this.filtroPagar.destino || this.normalizarTexto(item.destino).includes(this.normalizarTexto(this.filtroPagar.destino));
      const matchPlaca = !this.filtroPagar.placa || this.normalizarTexto(item.placa).includes(this.normalizarTexto(this.filtroPagar.placa));
      const matchStatus = !this.filtroPagar.status || this.normalizarTexto(item.status).includes(this.normalizarTexto(this.filtroPagar.status));
      return matchId && matchMotorista && matchForn && matchCliente && matchOp && matchRota && matchCte && matchMdfe && matchOrigem && matchDestino && matchPlaca && matchStatus;
    });
  }

  filtrarLancamentos(lista: LancamentoItem[]): LancamentoItem[] {
    return (lista || []).filter(item => {
      const matchId = !this.filtroLancamentos.idLancamento || item.idLancamento.toString().includes(this.filtroLancamentos.idLancamento.trim().replace('#', ''));
      const matchTit = !this.filtroLancamentos.idTitulo || this.normalizarTexto(item.idTitulo).includes(this.normalizarTexto(this.filtroLancamentos.idTitulo));
      const filtroViagem = this.filtroLancamentos.idViagem.trim().replace('#', '');
      const itemViagem = (item.idViagem || '').replace('#', '').trim();
      const matchViagem = !filtroViagem || itemViagem === filtroViagem;
      const matchTipo = !this.filtroLancamentos.tipo || this.normalizarTexto(item.tipo).includes(this.normalizarTexto(this.filtroLancamentos.tipo));
      const matchEtapa = !this.filtroLancamentos.etapa || this.normalizarTexto(item.etapa).includes(this.normalizarTexto(this.filtroLancamentos.etapa));
      const matchEnt = !this.filtroLancamentos.entidade || this.normalizarTexto(item.entidade).includes(this.normalizarTexto(this.filtroLancamentos.entidade));
      const matchStatus = !this.filtroLancamentos.status || this.normalizarTexto(item.status).includes(this.normalizarTexto(this.filtroLancamentos.status));
      return matchId && matchTit && matchViagem && matchTipo && matchEtapa && matchEnt && matchStatus;
    });
  }

  verLancamentosTitulo(item: TituloFinanceiro): void {
    this.openedActionMenuId = null;
    this.activeTab = 'LANCAMENTOS';
    this.filtroLancamentos.idTitulo = '';
    const idRotaLimpo = (item.id || '').replace('#', '').trim();
    this.filtroLancamentos.idViagem = idRotaLimpo;
    this.cdr.detectChanges();
  }

  abrirArquivo(url?: string): void {
    if (url) window.open(url, '_blank');
  }
}