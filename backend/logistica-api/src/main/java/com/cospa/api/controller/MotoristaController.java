package com.cospa.api.controller;

import com.cospa.api.model.Motorista;
import com.cospa.api.repository.MotoristaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/motoristas")
public class MotoristaController {

    private final MotoristaRepository repository;

    public MotoristaController(MotoristaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Motorista> listar() {
        return repository.findAll();
    }

    @PostMapping
    public Motorista criar(@RequestBody Motorista motorista) {
        return repository.save(motorista);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Motorista> atualizar(@PathVariable Long id, @RequestBody Motorista dto) {
        return repository.findById(id).map(m -> {
            m.setNome(dto.getNome());
            m.setPlaca(dto.getPlaca());
            return ResponseEntity.ok(repository.save(m));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}