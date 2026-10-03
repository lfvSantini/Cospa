import { Component, OnInit, HostListener, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  private cdr = inject(ChangeDetectorRef);

  public appVersion: string = environment.appVersion || 'v1.6.0';

  isDarkMode: boolean = true;
  isSidebarOpen: boolean = false;
  activeTab: 'RECEBER' | 'PAGAR' | 'QUITADAS' | 'LANCAMENTOS' = 'RECEBER';

  openedActionMenuId: string | null = null;

  filtroReceber = {
    id: '',
    cliente: '',
    operacao: '',
    numeroRota: '',
    numeroCteCospa: '',
    numeroMdfe: '',
    origem: '',
    destino: '',
    perfilVeiculo: '',
    valorFrete: '',
    valorAdicional: '',
    dataColeta: '',
    dataEntrega: '',
    dataPagamento: '',
    placa: '',
    status: '',
    obs: '',
    dataAdiantamento: '',
    adiantamentoRecebido: '',
    dataSaldo: '',
    saldoRecebido: '',
    dataAdicional: '',
    adicionalRecebido: '',
    idTitulo: '',
    totalPrevisto: '',
    totalRealizado: '',
    saldoEmAberto: '',
    proximoVencimento: ''
  };

  filtroPagar = {
    id: '',
    cliente: '',
    operacao: '',
    numeroRota: '',
    numeroCte: '',
    numeroMdfe: '',
    origem: '',
    destino: '',
    perfilVeiculo: '',
    valorFrete: '',
    valorAdicional: '',
    dataColeta: '',
    dataEntrega: '',
    dataPagamento: '',
    fornecedor: '',
    placa: '',
    status: '',
    obs: '',
    dataAdiantamento: '',
    adiantamentoPago: '',
    dataSaldo: '',
    saldoPago: '',
    dataAdicional: '',
    adicionalPago: '',
    idTitulo: '',
    totalPrevisto: '',
    totalRealizado: '',
    saldoEmAberto: '',
    proximoVencimento: ''
  };

  filtroLancamentos = {
    idLancamento: '',
    idTitulo: '',
    idViagem: '',
    tipo: '',
    etapa: '',
    tipoAdicional: '',
    entidade: '',
    valorPrevisto: '',
    dataVencimento: '',
    valorRealizado: '',
    dataEfetiva: '',
    saldoEmAberto: '',
    status: '',
    numeroCte: '',
    numeroMdfe: '',
    obs: ''
  };

  contasReceber: TituloFinanceiro[] = [];
  contasPagar: TituloFinanceiro[] = [];
  lancamentos: LancamentoItem[] = [];

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('cospa_theme');
    this.isDarkMode = savedTheme !== 'light';
    this.carregarDadosFinanceiros();
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
    if (this.isSidebarOpen) {
      this.isSidebarOpen = false;
    }
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
  // Retorna apenas títulos em aberto para as abas principais
  get receberAbertas(): TituloFinanceiro[] {
    return this.contasReceber.filter(t => t.status !== 'QUITADO');
  }

  get pagarAbertas(): TituloFinanceiro[] {
    return this.contasPagar.filter(t => t.status !== 'QUITADO');
  }

  // Retorna apenas o histórico de quitadas
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
          numeroCteCospa: t.numeroCte || '-',
          numeroMdfe: t.numeroMdfe || '-',
          origem: t.origem || '-',
          destino: t.destino || '-',
          perfilVeiculo: t.perfilVeiculo || '-',
          valorFrete: t.valorFrete || 0,
          valorAdicional: t.valorAdicional || 0,
          dataColeta: t.dataColeta || '-',
          dataEntrega: t.dataEntrega || '-',
          dataPagamento: t.dataPagamento || '-',
          placa: t.placa || '-',
          status: (t.status as StatusFinanceiro) || 'PENDENTE',
          obs: t.observacao || '-',
          totalPrevisto: t.totalPrevisto || 0,
          totalRealizado: t.totalRealizado || 0,
          saldoEmAberto: t.saldoEmAberto || 0,
          proximoVencimento: t.proximoVencimento || '-'
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao listar contas a receber:', err)
    });

    this.financeiroService.listarContasPagar().subscribe({
      next: (dados) => {
        this.contasPagar = (dados || []).map(t => ({
          id: t.viagemId ? t.viagemId.toString() : t.id.toString(),
          idTitulo: t.idTitulo,
          fornecedor: t.entidadeNome,
          cliente: t.operacao || '-',
          operacao: t.operacao || '-',
          numeroRota: t.numeroRota || '-',
          numeroCte: t.numeroCte || '-',
          numeroMdfe: t.numeroMdfe || '-',
          origem: t.origem || '-',
          destino: t.destino || '-',
          perfilVeiculo: t.perfilVeiculo || '-',
          valorFrete: t.valorFrete || 0,
          valorAdicional: t.valorAdicional || 0,
          dataColeta: t.dataColeta || '-',
          dataEntrega: t.dataEntrega || '-',
          dataPagamento: t.dataPagamento || '-',
          placa: t.placa || '-',
          status: (t.status as StatusFinanceiro) || 'PENDENTE',
          obs: t.observacao || '-',
          totalPrevisto: t.totalPrevisto || 0,
          totalRealizado: t.totalRealizado || 0,
          saldoEmAberto: t.saldoEmAberto || 0,
          proximoVencimento: t.proximoVencimento || '-'
        }));
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
          dataVencimento: l.dataVencimento || '-',
          valorRealizado: l.valorRealizado || 0,
          dataEfetiva: l.dataEfetiva || '-',
          saldoEmAberto: l.saldoEmAberto || 0,
          status: (l.status as StatusFinanceiro) || 'PENDENTE',
          numeroCte: l.numeroCte || '-',
          numeroMdfe: l.numeroMdfe || '-',
          comprovanteUrl: l.comprovanteUrl || '',
          obs: l.observacao || '-'
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao listar lançamentos:', err)
    });
  }

  filtrarReceber(lista: TituloFinanceiro[]): TituloFinanceiro[] {
    return (lista || []).filter(item => {
      const matchId = !this.filtroReceber.id || item.id.includes(this.filtroReceber.id.trim().replace('#', ''));
      const matchCliente = !this.filtroReceber.cliente || item.cliente.toLowerCase().includes(this.filtroReceber.cliente.toLowerCase());
      const matchOp = !this.filtroReceber.operacao || item.operacao.toLowerCase().includes(this.filtroReceber.operacao.toLowerCase());
      const matchRota = !this.filtroReceber.numeroRota || item.numeroRota.toLowerCase().includes(this.filtroReceber.numeroRota.toLowerCase());
      const matchCte = !this.filtroReceber.numeroCteCospa || (item.numeroCteCospa || '').toLowerCase().includes(this.filtroReceber.numeroCteCospa.toLowerCase());
      const matchMdfe = !this.filtroReceber.numeroMdfe || (item.numeroMdfe || '').toLowerCase().includes(this.filtroReceber.numeroMdfe.toLowerCase());
      const matchOrigem = !this.filtroReceber.origem || item.origem.toLowerCase().includes(this.filtroReceber.origem.toLowerCase());
      const matchDestino = !this.filtroReceber.destino || item.destino.toLowerCase().includes(this.filtroReceber.destino.toLowerCase());
      const matchStatus = !this.filtroReceber.status || item.status.toLowerCase().includes(this.filtroReceber.status.toLowerCase());
      const matchVenc = !this.filtroReceber.proximoVencimento || (item.proximoVencimento || '').includes(this.filtroReceber.proximoVencimento);

      return matchId && matchCliente && matchOp && matchRota && matchCte && matchMdfe && matchOrigem && matchDestino && matchStatus && matchVenc;
    });
  }

  filtrarPagar(lista: TituloFinanceiro[]): TituloFinanceiro[] {
    return (lista || []).filter(item => {
      const matchId = !this.filtroPagar.id || item.id.includes(this.filtroPagar.id.trim().replace('#', ''));
      const matchCliente = !this.filtroPagar.cliente || item.cliente.toLowerCase().includes(this.filtroPagar.cliente.toLowerCase());
      const matchForn = !this.filtroPagar.fornecedor || (item.fornecedor || '').toLowerCase().includes(this.filtroPagar.fornecedor.toLowerCase());
      const matchRota = !this.filtroPagar.numeroRota || item.numeroRota.toLowerCase().includes(this.filtroPagar.numeroRota.toLowerCase());
      const matchPlaca = !this.filtroPagar.placa || item.placa.toLowerCase().includes(this.filtroPagar.placa.toLowerCase());
      const matchStatus = !this.filtroPagar.status || item.status.toLowerCase().includes(this.filtroPagar.status.toLowerCase());
      const matchVenc = !this.filtroPagar.proximoVencimento || (item.proximoVencimento || '').includes(this.filtroPagar.proximoVencimento);

      return matchId && matchCliente && matchForn && matchRota && matchPlaca && matchStatus && matchVenc;
    });
  }

  filtrarLancamentos(lista: LancamentoItem[]): LancamentoItem[] {
    return (lista || []).filter(item => {
      const matchId = !this.filtroLancamentos.idLancamento || item.idLancamento.toString().includes(this.filtroLancamentos.idLancamento.trim().replace('#', ''));
      const matchTit = !this.filtroLancamentos.idTitulo || item.idTitulo.toLowerCase().includes(this.filtroLancamentos.idTitulo.toLowerCase());
      
      const filtroViagem = this.filtroLancamentos.idViagem.trim().replace('#', '');
      const itemViagem = (item.idViagem || '').replace('#', '').trim();
      const matchViagem = !filtroViagem || itemViagem === filtroViagem;

      const matchTipo = !this.filtroLancamentos.tipo || item.tipo.toLowerCase().includes(this.filtroLancamentos.tipo.toLowerCase());
      const matchEtapa = !this.filtroLancamentos.etapa || item.etapa.toLowerCase().includes(this.filtroLancamentos.etapa.toLowerCase());
      const matchEnt = !this.filtroLancamentos.entidade || item.entidade.toLowerCase().includes(this.filtroLancamentos.entidade.toLowerCase());
      const matchStatus = !this.filtroLancamentos.status || item.status.toLowerCase().includes(this.filtroLancamentos.status.toLowerCase());

      return matchId && matchTit && matchViagem && matchTipo && matchEtapa && matchEnt && matchStatus;
    });
  }

  abrirModalBaixa(item: TituloFinanceiro): void {
    alert(`Registo de liquidação do título ${item.idTitulo} (Rota #${item.id})`);
  }

  abrirModalBaixaLancamento(lanc: LancamentoItem): void {
    alert(`Registo de liquidação da parcela #${lanc.idLancamento} - ${lanc.etapa}`);
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
    if (url) {
      window.open(url, '_blank');
    }
  }
}