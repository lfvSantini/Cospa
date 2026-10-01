package com.cospa.api.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.text.Normalizer;
import java.util.regex.Pattern;

public enum TipoOperacao {
    TRANSFERENCIA("Transferência"),
    COLETA("Coleta"),
    ENTREGA("Entrega"),
    DEVOLUCAO("Devolução");

    private final String descricao;

    TipoOperacao(String descricao) {
        this.descricao = descricao;
    }

    @JsonValue
    public String getDescricao() {
        return descricao;
    }

    @JsonCreator
    public static TipoOperacao fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalizado = normalizar(value);
        for (TipoOperacao t : TipoOperacao.values()) {
            if (normalizar(t.name()).equals(normalizado) || normalizar(t.descricao).equals(normalizado)) {
                return t;
            }
        }
        return null;
    }

    private static String normalizar(String str) {
        if (str == null) return "";
        String semAcento = Normalizer.normalize(str, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(semAcento)
                .replaceAll("")
                .replace("_", " ")
                .trim()
                .toUpperCase();
    }
}