package com.cospa.api.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class StatusViagemConverter implements AttributeConverter<StatusViagem, String> {

    @Override
    public String convertToDatabaseColumn(StatusViagem attribute) {
        if (attribute == null) {
            return StatusViagem.PROGRAMADO.getDescricao();
        }
        return attribute.getDescricao();
    }

    @Override
    public StatusViagem convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return StatusViagem.PROGRAMADO;
        }
        return StatusViagem.fromString(dbData);
    }
}