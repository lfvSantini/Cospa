package com.cospa.api.dto;

import com.cospa.api.model.LocalCliente;

public record LocalClienteDTO(
        Long id,
        Long clienteId,
        String clienteNome,
        String nomeLocal,
        String endereco,
        String cep,
        String cidade,
        String uf,
        String complemento,
        Boolean ativo
) {
    public LocalClienteDTO(LocalCliente local) {
        this(
                local.getId(),
                local.getCliente() != null ? local.getCliente().getId() : null,
                local.getCliente() != null ? (local.getCliente().getNomeFantasia() != null ? local.getCliente().getNomeFantasia() : local.getCliente().getNome()) : "",
                local.getNomeLocal(),
                local.getEndereco(),
                local.getCep(),
                local.getCidade(),
                local.getUf(),
                local.getComplemento(),
                local.getAtivo()
        );
    }
}