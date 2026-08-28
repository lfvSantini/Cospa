package com.cospa.api.controller;

import com.cospa.api.dto.ViagemRequestDTO;
import com.cospa.api.dto.ViagemResponseDTO;
import com.cospa.api.model.Viagem;
import com.cospa.api.service.ViagemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/viagens")
@CrossOrigin(origins = "*")
public class ViagemController {

    @Autowired
    private ViagemService viagemService;

    @GetMapping
    public ResponseEntity<List<ViagemResponseDTO>> listarTodas() {
        List<ViagemResponseDTO> lista = viagemService.listarTodas().stream()
                .map(ViagemResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ViagemResponseDTO> buscarPorId(@PathVariable Long id) {
        return viagemService.buscarPorId(id)
                .map(v -> ResponseEntity.ok(new ViagemResponseDTO(v)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ViagemResponseDTO> criar(@RequestBody @Valid ViagemRequestDTO dto) {
        Viagem salva = viagemService.salvar(dto);
        return ResponseEntity.ok(new ViagemResponseDTO(salva));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ViagemResponseDTO> atualizar(@PathVariable Long id, @RequestBody @Valid ViagemRequestDTO dto) {
        // Upsert automático: Se a viagem com ID fornecido não existir, cria o registro sem gerar erro 404
        Viagem salva = viagemService.salvarOuAtualizar(id, dto);
        return ResponseEntity.ok(new ViagemResponseDTO(salva));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        boolean deletado = viagemService.deletar(id);
        if (!deletado) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}