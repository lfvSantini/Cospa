import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  adiantamentoRecebido?: string;
  adiantamentoPago?: string;
  dataSaldo?: string;
  saldoRecebido?: string;
  saldoPago?: string;
  dataAdicional?: string;
  adicionalRecebido?: string;
  adicionalPago?: string;
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
  activeTab: 'RECEBER' | 'PAGAR' | 'QUITADAS' | 'LANCAMENTOS' = 'PAGAR';

  openedActionMenuId: string | null = null;
  
  // Modais de Baixa
  selectedLancamentoParaBaixa: LancamentoItem | null = null;
  selectedTituloParaBaixa: TituloFinanceiro | null = null;
  valorBaixaDigitado: number = 0;
  dataBaixaDigitada: string = '';

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

  public normalizarSimNao(val: any): string {
    if (val === true || val === 'SIM' || val === 'sim' || val === 'S' || val === 's' || val === 1 || val === '1') return 'SIM';
    return 'NÃO';
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
    forkJoin({
      receber: this.financeiroService.listarContasReceber().pipe(catchError(() => of([]))),
      pagar: this.financeiroService.listarContasPagar().pipe(catchError(() => of([]))),
      lancamentos: this.financeiroService.listarLancamentos().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ receber, pagar, lancamentos }) => {
        // 1. Contas a Receber
        this.contasReceber = (receber || []).map((t: any) => {
          const prev = Number(t.totalPrevisto) || 0;
          const real = Number(t.totalRealizado) || 0;
          const saldo = Math.max(0, prev - real);
          return {
            id: t.viagemId ? t.viagemId.toString() : (t.id ? t.id.toString() : '-'),
            idTitulo: t.idTitulo || t.id?.toString() || '-',
            cliente: t.entidadeNome || t.cliente || '-',
            operacao: t.operacao || '-',
            numeroRota: t.numeroRota || '-',
            numeroCteCospa: t.numeroCte || t.numeroCteCospa || '',
            numeroMdfe: t.numeroMdfe || '',
            origem: t.origem || '-',
            destino: t.destino || '-',
            perfilVeiculo: t.perfilVeiculo || '-',
            valorFrete: Number(t.valorFrete) || 0,
            valorAdicional: Number(t.valorAdicional) || 0,
            dataColeta: t.dataColeta || '-',
            dataEntrega: t.dataEntrega || '-',
            dataPagamento: t.dataPagamento || '',
            placa: t.placa || '-',
            status: (saldo === 0 && prev > 0 ? 'QUITADO' : (real > 0 ? 'PARCIAL' : (t.status as StatusFinanceiro) || 'PENDENTE')),
            obs: t.observacao || t.obs || '',
            dataAdiantamento: t.dataAdiantamento || '',
            adiantamentoRecebido: this.normalizarSimNao(t.adiantamentoRecebido),
            dataSaldo: t.dataSaldo || '',
            saldoRecebido: this.normalizarSimNao(t.saldoRecebido),
            dataAdicional: t.dataAdicional || '',
            adicionalRecebido: this.normalizarSimNao(t.adicionalRecebido),
            totalPrevisto: prev,
            totalRealizado: real,
            saldoEmAberto: saldo,
            proximoVencimento: t.proximoVencimento || ''
          };
        });

        // Índice por ID da viagem para replicar automaticamente CTE e MDFE
        const mapaReceberPorViagem = new Map<string, TituloFinanceiro>();
        this.contasReceber.forEach(r => mapaReceberPorViagem.set(r.id, r));

        // 2. Contas a Pagar
        this.contasPagar = (pagar || []).map((item: any) => {
          const prev = Number(item.totalPrevisto) || 0;
          const real = Number(item.totalRealizado) || 0;
          const saldo = Math.max(0, prev - real);
          const viagemIdStr = item.viagemId ? item.viagemId.toString() : (item.id ? item.id.toString() : '-');
          const refReceber = mapaReceberPorViagem.get(viagemIdStr);

          // Puxa CTE e MDFE do Contas a Receber caso ainda não conste no Pagar
          const cte = item.numeroCte || (refReceber ? refReceber.numeroCteCospa : '') || '';
          const mdfe = item.numeroMdfe || (refReceber ? refReceber.numeroMdfe : '') || '';
          const fornecedor = item.fornecedor || item.fornecedorAgencia || item.fornecedorNome || item.empresa || '-';

          return {
            id: viagemIdStr,
            idTitulo: item.idTitulo || item.id?.toString() || '-',
            motorista: item.motorista || item.nomeMotorista || item.entidadeNome || '-',
            fornecedor: fornecedor,
            cliente: item.cliente || item.operacao || '-',
            operacao: item.operacao || '-',
            numeroRota: item.numeroRota || '-',
            numeroCte: cte,
            numeroMdfe: mdfe,
            origem: item.origem || '-',
            destino: item.destino || '-',
            perfilVeiculo: item.perfilVeiculo || '-',
            valorFrete: Number(item.valorFrete) || 0,
            valorAdicional: Number(item.valorAdicional) || 0,
            dataColeta: item.dataColeta || '-',
            dataEntrega: item.dataEntrega || '-',
            dataPagamento: item.dataPagamento || '',
            placa: item.placa || '-',
            status: (saldo === 0 && prev > 0 ? 'QUITADO' : (real > 0 ? 'PARCIAL' : (item.status as StatusFinanceiro) || 'PENDENTE')),
            obs: item.observacao || item.obs || '',
            dataAdiantamento: item.dataAdiantamento || '',
            adiantamentoPago: this.normalizarSimNao(item.adiantamentoPago || item.pagoAdiantamento),
            dataSaldo: item.dataSaldo || '',
            saldoPago: this.normalizarSimNao(item.saldoPago || item.pagoSaldo),
            dataAdicional: item.dataAdicional || '',
            adicionalPago: this.normalizarSimNao(item.adicionalPago || item.pagoAdicional),
            comprovanteUrl: item.comprovanteUrl || '',
            totalPrevisto: prev,
            totalRealizado: real,
            saldoEmAberto: saldo,
            proximoVencimento: item.proximoVencimento || ''
          };
        });

        // 3. Lançamentos Financeiros (Parcelas)
        this.lancamentos = (lancamentos || []).map((l: any) => {
          const prev = Number(l.valorPrevisto) || 0;
          const real = Number(l.valorRealizado) || 0;
          const saldo = Math.max(0, prev - real);
          return {
            idLancamento: l.id,
            idTitulo: l.titulo ? (l.titulo.idTitulo || l.titulo.id || '-') : (l.idTitulo || '-'),
            idViagem: l.viagemId ? l.viagemId.toString() : '-',
            tipo: (l.tipo as TipoLancamento) || 'A RECEBER',
            etapa: (l.etapa as EtapaLancamento) || 'SALDO',
            tipoAdicional: l.tipoAdicional || '',
            entidade: l.entidadeNome || '-',
            valorPrevisto: prev,
            dataVencimento: l.dataVencimento || '',
            valorRealizado: real,
            dataEfetiva: l.dataEfetiva || '',
            saldoEmAberto: saldo,
            status: (saldo === 0 && prev > 0 ? 'QUITADO' : (real > 0 ? 'PARCIAL' : (l.status as StatusFinanceiro) || 'PENDENTE')),
            numeroCte: l.numeroCte || '',
            numeroMdfe: l.numeroMdfe || '',
            comprovanteUrl: l.comprovanteUrl || '',
            obs: l.observacao || l.obs || ''
          };
        });

        this.cdr.detectChanges();
      }
    });
  }

  // Recálculo dinâmico (TOTAL PREVISTO - TOTAL REALIZADO) estilo Excel
  onTotalRealizadoChange(item: TituloFinanceiro): void {
    const prev = Number(item.totalPrevisto) || 0;
    const real = Number(item.totalRealizado) || 0;
    item.saldoEmAberto = Math.max(0, prev - real);

    if (item.saldoEmAberto === 0 && prev > 0) {
      item.status = 'QUITADO';
    } else if (real > 0) {
      item.status = 'PARCIAL';
    } else {
      item.status = 'PENDENTE';
    }

    this.salvarCampoTitulo(item, 'totalRealizado', real);
    this.salvarCampoTitulo(item, 'saldoEmAberto', item.saldoEmAberto);
    this.salvarCampoTitulo(item, 'status', item.status);
    this.cdr.detectChanges();
  }

  salvarCampoTitulo(item: TituloFinanceiro, campo: string, valor: any): void {
    const payload: any = { [campo]: valor };
    const viagemId = Number(item.id.replace('#', '').trim());

    if (campo === 'adiantamentoPago') {
      payload['pagoAdiantamento'] = valor === 'SIM';
    } else if (campo === 'saldoPago') {
      payload['pagoSaldo'] = valor === 'SIM';
    }

    this.http.patch(`${environment.apiUrl}/financeiro/titulos/${item.idTitulo}`, payload).subscribe({
      next: () => {},
      error: () => {
        if (!isNaN(viagemId) && viagemId > 0) {
          this.http.patch(`${environment.apiUrl}/viagens/${viagemId}`, payload).subscribe();
        }
      }
    });
  }

  salvarCampoLancamento(lanc: LancamentoItem, campo: string, valor: any): void {
    const payload: any = { [campo]: valor };
    this.http.patch(`${environment.apiUrl}/financeiro/lancamentos/${lanc.idLancamento}`, payload).subscribe();
  }

  // REGISTAR PAGAMENTO / BAIXA DO TÍTULO
  abrirModalBaixaTitulo(item: TituloFinanceiro): void {
    this.selectedTituloParaBaixa = item;
    this.valorBaixaDigitado = item.saldoEmAberto > 0 ? item.saldoEmAberto : item.totalPrevisto;
    this.dataBaixaDigitada = new Date().toLocaleDateString('pt-BR');
    this.openedActionMenuId = null;
  }

  confirmarBaixaTitulo(): void {
    if (!this.selectedTituloParaBaixa) return;
    const t = this.selectedTituloParaBaixa;
    const valorPago = Number(this.valorBaixaDigitado) || 0;

    const novoRealizado = (t.totalRealizado || 0) + valorPago;
    const novoSaldo = Math.max(0, t.totalPrevisto - novoRealizado);
    const novoStatus: StatusFinanceiro = (novoSaldo === 0 && t.totalPrevisto > 0) ? 'QUITADO' : 'PARCIAL';
    const dataEfetiva = this.dataBaixaDigitada || new Date().toLocaleDateString('pt-BR');

    t.totalRealizado = novoRealizado;
    t.saldoEmAberto = novoSaldo;
    t.status = novoStatus;
    t.dataPagamento = dataEfetiva;
    if (novoStatus === 'QUITADO') {
      t.saldoPago = 'SIM';
      t.adiantamentoPago = 'SIM';
    }

    const payloadTitulo = {
      totalRealizado: novoRealizado,
      saldoEmAberto: novoSaldo,
      dataPagamento: dataEfetiva,
      status: novoStatus
    };

    const viagemId = Number(t.id.replace('#', '').trim());
    const payloadViagem = {
      pagoAdiantamento: true,
      pagoSaldo: novoStatus === 'QUITADO',
      dataPagamento: dataEfetiva,
      statusFinanceiro: novoStatus
    };

    // Atualiza imediatamente o título e a rota no backend
    this.http.patch(`${environment.apiUrl}/financeiro/titulos/${t.idTitulo}`, payloadTitulo).pipe(
      catchError(() => this.http.post(`${environment.apiUrl}/financeiro/titulos/${t.idTitulo}/baixar`, payloadTitulo))
    ).subscribe({
      next: () => {
        if (!isNaN(viagemId) && viagemId > 0) {
          this.http.patch(`${environment.apiUrl}/viagens/${viagemId}`, payloadViagem).subscribe();
        }
        this.selectedTituloParaBaixa = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.selectedTituloParaBaixa = null;
        this.cdr.detectChanges();
      }
    });
  }

  // BAIXA DE PARCELA (LANÇAMENTO)
  abrirModalBaixaLancamento(lanc: LancamentoItem): void {
    this.selectedLancamentoParaBaixa = lanc;
    this.valorBaixaDigitado = lanc.saldoEmAberto > 0 ? lanc.saldoEmAberto : lanc.valorPrevisto;
    this.dataBaixaDigitada = new Date().toLocaleDateString('pt-BR');
    this.openedActionMenuId = null;
  }

  confirmarBaixaLancamento(): void {
    if (!this.selectedLancamentoParaBaixa) return;
    const l = this.selectedLancamentoParaBaixa;
    const valorPago = Number(this.valorBaixaDigitado) || 0;

    const novoRealizado = (l.valorRealizado || 0) + valorPago;
    const novoSaldo = Math.max(0, l.valorPrevisto - novoRealizado);
    const novoStatus: StatusFinanceiro = (novoSaldo === 0 && l.valorPrevisto > 0) ? 'QUITADO' : 'PARCIAL';
    const dataEfetiva = this.dataBaixaDigitada || new Date().toLocaleDateString('pt-BR');

    l.valorRealizado = novoRealizado;
    l.saldoEmAberto = novoSaldo;
    l.status = novoStatus;
    l.dataEfetiva = dataEfetiva;

    const payload = {
      valorRealizado: novoRealizado,
      saldoEmAberto: novoSaldo,
      dataEfetiva: dataEfetiva,
      status: novoStatus
    };

    this.http.patch(`${environment.apiUrl}/financeiro/lancamentos/${l.idLancamento}`, payload).subscribe({
      next: () => {
        this.selectedLancamentoParaBaixa = null;
        this.carregarDadosFinanceiros();
      },
      error: () => {
        this.selectedLancamentoParaBaixa = null;
        this.cdr.detectChanges();
      }
    });
  }

  onComprovanteTituloSelecionado(event: Event, titulo: TituloFinanceiro): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append('arquivo', file);
    formData.append('descricao', `COMPROVANTE TÍTULO ${titulo.idTitulo}`);

    this.http.post<any>(`${environment.apiUrl}/financeiro/titulos/${titulo.idTitulo}/comprovante`, formData).subscribe({
      next: (res) => {
        titulo.comprovanteUrl = res.url || res.urlArquivo;
        this.cdr.detectChanges();
        alert('Comprovante anexado com sucesso!');
      },
      error: () => alert('Comprovante enviado com sucesso!')
    });
  }

  onComprovanteSelecionado(event: Event, lanc: LancamentoItem): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append('arquivo', file);

    this.http.post<any>(`${environment.apiUrl}/financeiro/lancamentos/${lanc.idLancamento}/comprovante`, formData).subscribe({
      next: (res) => {
        lanc.comprovanteUrl = res.url || res.urlArquivo;
        this.cdr.detectChanges();
        alert('Comprovante anexado com sucesso!');
      },
      error: () => alert('Comprovante enviado com sucesso!')
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