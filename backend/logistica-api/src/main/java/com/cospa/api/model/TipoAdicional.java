package com.cospa.api.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.text.Normalizer;
import java.util.regex.Pattern;

public enum TipoAdicional {
    AJUDANTE("Ajudante"),
    DIARIA("Diária"),
    MULTA("Multa"),
    COMPLEMENTO_FRETE("Complemento de frete");

    private final String descricao;

    TipoAdicional(String descricao) {
        this.descricao = descricao;
    }

    @JsonValue
    public String getDescricao() {
        return descricao;
    }

    @JsonCreator
    public static TipoAdicional fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalizado = normalizar(value);
        for (TipoAdicional t : TipoAdicional.values()) {
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
