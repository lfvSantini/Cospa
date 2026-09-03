package com.cospa.api.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.text.Normalizer;
import java.util.regex.Pattern;

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
    ADIANTAMENTO_PAGO("ADIANTAMENTO PAGO"),
    SALDO_PAGO("SALDO PAGO"),
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
        if (value == null || value.isBlank()) {
            return PROGRAMADO;
        }

        String normalizado = normalizar(value);

        for (StatusViagem s : StatusViagem.values()) {
            if (normalizar(s.name()).equals(normalizado) || normalizar(s.descricao).equals(normalizado)) {
                return s;
            }
        }
        return PROGRAMADO;
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