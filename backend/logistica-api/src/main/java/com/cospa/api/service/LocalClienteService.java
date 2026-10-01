package com.cospa.api.service;

import com.cospa.api.dto.LocalClienteDTO;
import com.cospa.api.model.Cliente;
import com.cospa.api.model.LocalCliente;
import com.cospa.api.repository.ClienteRepository;
import com.cospa.api.repository.LocalClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class LocalClienteService {

    @Autowired
    private LocalClienteRepository repository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Transactional(readOnly = true)
    public List<LocalClienteDTO> listarTodos() {
        return repository.findAllByOrderByNomeLocalAsc().stream()
                .map(LocalClienteDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LocalClienteDTO> buscarPorClienteId(Long clienteId) {
        return repository.findByClienteIdAndAtivoTrue(clienteId).stream()
                .map(LocalClienteDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LocalClienteDTO> buscarPorNomeCliente(String nomeCliente) {
        return repository.findByClienteNomeFantasiaIgnoreCaseAndAtivoTrue(nomeCliente.trim()).stream()
                .map(LocalClienteDTO::new)
                .toList();
    }

    @Transactional
    public LocalClienteDTO salvar(LocalClienteDTO dto) {
        Cliente cliente = clienteRepository.findById(dto.clienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com ID: " + dto.clienteId()));

        LocalCliente local = new LocalCliente();
        if (dto.id() != null) {
            local = repository.findById(dto.id()).orElse(local);
        }

        local.setCliente(cliente);
        local.setNomeLocal(dto.nomeLocal().toUpperCase().trim());
        local.setEndereco(dto.endereco().toUpperCase().trim());
        local.setCep(dto.cep() != null ? dto.cep().trim() : "");
        local.setCidade(dto.cidade().toUpperCase().trim());
        local.setUf(dto.uf().toUpperCase().trim());
        local.setComplemento(dto.complemento() != null ? dto.complemento().toUpperCase().trim() : "");
        local.setAtivo(dto.ativo() != null ? dto.ativo() : true);

        return new LocalClienteDTO(repository.save(local));
    }

    @Transactional
    public boolean deletar(Long id) {
        return repository.findById(id).map(l -> {
            repository.delete(l);
            return true;
        }).orElse(false);
    }
}