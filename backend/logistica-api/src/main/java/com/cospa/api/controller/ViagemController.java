package com.cospa.api.controller;

import com.cospa.api.model.StatusViagem;
import com.cospa.api.model.Viagem;
import com.cospa.api.service.ViagemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/viagens")
@CrossOrigin(origins = "*") // Permite chamadas do HTML/JS local
public class ViagemController {

    @Autowired
    private ViagemService viagemService;

    // Listar todas as viagens -> http://localhost:8080/api/viagens
    @GetMapping
    public ResponseEntity<List<Viagem>> listarTodas() {
        return ResponseEntity.ok(viagemService.listarTodas());
    }

    // Buscar viagem específica por ID -> http://localhost:8080/api/viagens/1
    @GetMapping("/{id}")
    public ResponseEntity<Viagem> buscarPorId(@PathVariable Long id) {
        return viagemService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Criar nova viagem
    @PostMapping
    public ResponseEntity<Viagem> criarViagem(@RequestBody Viagem viagem) {
        Viagem novaViagem = viagemService.criarViagem(viagem);
        return ResponseEntity.ok(novaViagem);
    }

    // Atualizar o status da viagem -> http://localhost:8080/api/viagens/1/status
    @PutMapping("/{id}/status")
    public ResponseEntity<Viagem> atualizarStatus(
            @PathVariable Long id,
            @RequestParam StatusViagem novoStatus,
            @RequestParam(required = false) String observacao,
            @RequestParam(required = false) String urlFoto) {

        Viagem viagemAtualizada = viagemService.atualizarStatus(id, novoStatus, observacao, urlFoto);
        return ResponseEntity.ok(viagemAtualizada);
    }
}