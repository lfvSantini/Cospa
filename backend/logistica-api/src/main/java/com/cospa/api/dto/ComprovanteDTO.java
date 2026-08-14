package com.cospa.api.dto;

import com.cospa.api.model.Comprovante;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComprovanteDTO {

    private Long id;
    private String nome;
    private String urlArquivo;

    // Construtor que converte a Entidade Comprovante em DTO
    public ComprovanteDTO(Comprovante entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.nome = entity.getNome();
            this.urlArquivo = entity.getUrlArquivo();
        }
    }
}