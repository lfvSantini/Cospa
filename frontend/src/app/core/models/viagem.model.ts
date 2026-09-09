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
  descricao?: string;
  dataEnvio?: string;
}

export interface Viagem {
  id?: number;
  numeroOperacional?: string;
  numero_operacional?: string;
  
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
  
  perfilVeiculo?: string;
  perfil_veiculo?: string;
  carroceriaVeiculo?: string;
  carroceria_veiculo?: string;

  nomeMotorista?: string;
  nome_motorista?: string;
  cpfMotorista?: string;
  cpf_motorista?: string;
  placa?: string;
  placaSecundaria?: string;
  placa_secundaria?: string;
  
  fornecedorAgencia?: string;
  fornecedor_agencia?: string;
  agenciador?: string;
  especialistaCospa?: string;
  especialista_cospa?: string;
  
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
  valorAgenciador?: number;
  valor_agenciador?: number;
  valorEspecialistaCospa?: number;
  valor_especialista_cospa?: number;
  
  pagamentoLiberado?: boolean;
  pagamento_liberado?: boolean;
  pagamentoRealizadoStatus?: string;
  pagamento_realizado_status?: string;
  dataHoraPagamento?: string;
  data_hora_pagamento?: string;

  dataAdiantamento?: string;
  data_adiantamento?: string;
  pagoAdiantamento?: boolean;
  pago_adiantamento?: boolean;

  dataSaldo?: string;
  data_saldo?: string;
  pagoSaldo?: boolean;
  pago_saldo?: boolean;

  dataAdicional?: string;
  data_adicional?: string;
  pagoAdicional?: boolean;
  pago_adicional?: boolean;
  
  status: StatusViagem;
  observacao?: string;
  comprovantes?: Comprovante[];
}