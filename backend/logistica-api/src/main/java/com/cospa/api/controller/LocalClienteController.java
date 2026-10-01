package com.cospa.api.controller;

import com.cospa.api.dto.LocalClienteDTO;
import com.cospa.api.service.LocalClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rotas")
@CrossOrigin(origins = "*")
public class LocalClienteController {

    @Autowired
    private LocalClienteService service;

    @GetMapping
    public ResponseEntity<List<LocalClienteDTO>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<LocalClienteDTO>> buscarPorCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(service.buscarPorClienteId(clienteId));
    }

    @GetMapping("/cliente-nome/{nome}")
    public ResponseEntity<List<LocalClienteDTO>> buscarPorNomeCliente(@PathVariable String nome) {
        return ResponseEntity.ok(service.buscarPorNomeCliente(nome));
    }

    @PostMapping
    public ResponseEntity<LocalClienteDTO> criar(@RequestBody LocalClienteDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LocalClienteDTO> atualizar(@PathVariable Long id, @RequestBody LocalClienteDTO dto) {
        LocalClienteDTO atualizado = service.salvar(new LocalClienteDTO(
                id,
                dto.clienteId(),
                dto.clienteNome(),
                dto.nomeLocal(),
                dto.endereco(),
                dto.cep(),
                dto.cidade(),
                dto.uf(),
                dto.complemento(),
                dto.ativo()
        ));
        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (service.deletar(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}