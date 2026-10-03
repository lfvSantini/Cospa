package com.cospa.api.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.text.Normalizer;
import java.util.regex.Pattern;

public enum StatusViagem {
    PROGRAMADO("PROGRAMADO"),
    A_CONTRATAR("A CONTRATAR"),
    AG_CARREGAMENTO("AG CARREGAMENTO"),
    CARREGAMENTO("CARREGAMENTO"),
    AG_DOC_CLIENTE("AG DOC CLIENTE"),
    AG_DOC_COSPA("AG DOC COSPA"),
    EM_ROTA("EM ROTA"),
    AG_DESCARGA("AG DESCARGA"),
    DESCARGA("DESCARGA"),
    AG_CANHOTO("AG CANHOTO"),
    FINALIZADO("FINALIZADO"),
    CANCELADA("CANCELADA");

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