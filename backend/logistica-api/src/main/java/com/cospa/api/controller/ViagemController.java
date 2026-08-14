package com.cospa.api.controller;

import com.cospa.api.model.Viagem;
import com.cospa.api.service.ViagemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/viagens")
public class ViagemController {

    @Autowired
    private ViagemService service;

    // 1. Listar todas as viagens
    @GetMapping
    public List<Viagem> listarTodas() {
        return service.listarTodas();
    }

    // 2. Buscar viagem por ID
    @GetMapping("/{id}")
    public ResponseEntity<Viagem> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. Cadastrar nova viagem
    @PostMapping
    public ResponseEntity<Viagem> salvar(@RequestBody Viagem viagem) {
        Viagem salva = service.salvar(viagem);
        return ResponseEntity.ok(salva);
    }

    // 4. Atualizar viagem
    @PutMapping("/{id}")
    public ResponseEntity<Viagem> atualizar(@PathVariable Long id, @RequestBody Viagem viagem) {
        return service.atualizar(id, viagem)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. Finalizar viagem (PATCH)
    @PatchMapping("/{id}/finalizar")
    public ResponseEntity<Viagem> finalizar(@PathVariable Long id) {
        return service.finalizar(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 6. Deletar viagem
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (service.deletar(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}