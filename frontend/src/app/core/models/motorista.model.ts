export interface MotoristaDocumento {
  id?: number;
  descricao?: string;
  nome?: string;
  url?: string;
  urlArquivo?: string;
  nomeArquivo?: string;
  dataEnvio?: string;
}

export interface Motorista {
  id?: number;
  nome: string;
  cpf?: string;
  placa?: string;
  fornecedor?: string;
  situacao?: 'ATIVO' | 'INATIVO' | string;
  ativo?: boolean;
  urlCnh?: string;
  urlCrlv?: string;
  urlCompEndereco?: string;
  informacoesAdicionais?: string;
  observacoes?: string;
  documentos?: MotoristaDocumento[];
}