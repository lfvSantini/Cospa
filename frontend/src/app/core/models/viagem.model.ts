export type StatusViagem = 
  | 'A CONTRATAR' 
  | 'PROGRAMADO' 
  | 'AG CARREGAMENTO' 
  | 'CARREGAMENTO' 
  | 'EM ROTA' 
  | 'AG DOCUMENTAÇÃO' 
  | 'AG DESCARGA' 
  | 'DESCARGA' 
  | 'A PAGAR' 
  | 'ADIANTAMENTO PAGO' 
  | 'SALDO PAGO' 
  | 'FINALIZADO';

export interface Comprovante {
  id?: number;
  nome: string;
  urlArquivo: string;
}

export interface Viagem {
  id?: number;
  cliente: string;
  origem: string;
  origemNome?: string;
  origem_nome?: string;
  localColeta?: string;
  local_coleta?: string;
  
  destino: string;
  destinoNome?: string;
  destino_nome?: string;
  localEntrega?: string;
  local_entrega?: string;
  
  nomeMotorista?: string;
  nome_motorista?: string;
  cpfMotorista?: string;
  cpf_motorista?: string;
  placa?: string;
  placaSecundaria?: string;
  placa_secundaria?: string;
  
  fornecedorAgencia?: string;
  fornecedor_agencia?: string;
  
  dataColetaPrevista?: string;
  data_coleta_prevista?: string;
  dataColetaReal?: string;
  data_coleta_real?: string;
  dataEntregaPrevista?: string;
  data_entrega_prevista?: string;
  dataEntregaReal?: string;
  data_entrega_real?: string;
  
  valorAReceber?: number;
  valor_a_receber?: number;
  valorAdicionalReceber?: number;
  valor_adicional_receber?: number;
  valorAPagar?: number;
  valor_a_pagar?: number;
  valorAdicionalPagar?: number;
  valor_adicional_pagar?: number;
  valorAdicionalAgencia?: number;
  valor_adicional_agencia?: number;
  
  pagamentoLiberado?: boolean;
  pagamento_liberado?: boolean;
  pagamentoRealizadoStatus?: string;
  pagamento_realizado_status?: string;
  dataHoraPagamento?: string;
  data_hora_pagamento?: string;
  
  status: StatusViagem;
  observacao?: string;
  comprovantes?: Comprovante[];
}