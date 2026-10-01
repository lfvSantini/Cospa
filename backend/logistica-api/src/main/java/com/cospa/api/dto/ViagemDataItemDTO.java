package com.cospa.api.dto;

import com.cospa.api.model.ViagemData;

public record ViagemDataItemDTO(
        Long id,
        String tipo,
        String dataPrevista,
        String dataReal,
        Integer ordem
) {
    public ViagemDataItemDTO(ViagemData vd) {
        this(vd.getId(), vd.getTipo(), vd.getDataPrevista(), vd.getDataReal(), vd.getOrdem());
    }
}