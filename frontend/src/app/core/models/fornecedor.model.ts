export interface Fornecedor {
  id?: number;
  nome: string;
  cnpjCpf?: string;
  nomeContato?: string;
  telefone?: string;
  email?: string;
  chavePix?: string;
  situacao?: 'ATIVO' | 'INATIVO' | string;
  obs?: string;
  observacoes?: string;
  ativo?: boolean;
}