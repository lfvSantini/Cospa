package com.cospa.api.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum StatusViagem {
    A_CONTRATAR("A CONTRATAR"),
    CRIADA("CRIADA"),
    PROGRAMADO("PROGRAMADO"),
    AG_CARREGAMENTO("AG CARREGAMENTO"),
    CARREGAMENTO("CARREGAMENTO"),
    EM_ROTA("EM ROTA"),
    AG_DOCUMENTACAO("AG DOCUMENTAÇÃO"),
    AG_DESCARGA("AG DESCARGA"),
    DESCARGA("DESCARGA"),
    A_PAGAR("A PAGAR"),
    FINALIZADO("FINALIZADO");

    private final String descricao;

    StatusViagem(String descricao) {
        this.descricao = descricao;
    }

    @JsonValue
    public String getDescricao() {
        return descricao;
    }

    @JsonCreator
    public static StatusViagem fromString(String value) {
        if (value == null || value.isBlank()) return PROGRAMADO;
        for (StatusViagem s : StatusViagem.values()) {
            if (s.name().equalsIgnoreCase(value) || s.descricao.equalsIgnoreCase(value)) {
                return s;
            }
        }
        return PROGRAMADO;
    }
}