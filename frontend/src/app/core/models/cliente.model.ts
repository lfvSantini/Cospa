export interface ClienteDocumento {
  id?: number;
  tipo: string;
  nomeArquivo?: string;
  urlArquivo: string;
  dataUpload?: string;
}

export interface Cliente {
  id?: number;
  nome: string;
  nomeFantasia?: string;
  razaoSocial?: string;
  cnpjCpf?: string;
  nomeContato?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  situacao?: string;
  ativo?: boolean;
  obs?: string;
  observacoes?: string;
  documentos?: ClienteDocumento[];
}