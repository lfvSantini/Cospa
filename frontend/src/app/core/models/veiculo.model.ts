export interface VeiculoDocumentoItem {
  id: number;
  descricao: string;
  url: string;
  nomeArquivo: string;
  dataEnvio: string;
}

export interface Veiculo {
  id?: number;
  placa: string;
  tipoVeiculo: string;
  tipoCarroceria?: string;
  adicional?: string;
  numeroEixos?: string;
  cubagemBau?: string;
  capacidadePeso?: string;
  numeroPaletes?: string;
  anoFabricacao?: string;
  dataVencimento?: string;
  fornecedor?: string;
  numeroAntt?: string;
  tipoRastreador?: string;
  situacao?: 'ATIVO' | 'INATIVO';
  documentos?: VeiculoDocumentoItem[];
}