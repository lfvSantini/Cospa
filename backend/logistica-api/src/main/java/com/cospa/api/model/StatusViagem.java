package com.cospa.api.model;

public enum StatusViagem {
    A_CONTRATAR("Contratando"),
    CRIADA("Criada"),
    PROGRAMADO("Programado"),
    EM_ROTA("Em Rota"),
    AG_CARREGAMENTO("Ag. Carregamento"),
    CARREGAMENTO("Carregamento"),
    AG_DOCUMENTACAO("Ag. Documentação"),
    AG_DESCARGA("Ag. Descarga"),
    DESCARGA("Descarga"),
    FINALIZADO("Finalizado");

    private final String descricao;

    StatusViagem(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}