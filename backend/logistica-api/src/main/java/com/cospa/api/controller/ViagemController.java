package com.cospa.api.controller;

import com.cospa.api.dto.ViagemRequestDTO;
import com.cospa.api.dto.ViagemResponseDTO;
import com.cospa.api.model.StatusViagem;
import com.cospa.api.service.ViagemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/viagens")
public class ViagemController {

    private final ViagemService service;

    public ViagemController(ViagemService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ViagemResponseDTO>> listar() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ViagemResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ViagemResponseDTO> criar(@RequestBody @Valid ViagemRequestDTO dto) {
        ViagemResponseDTO viagemCriada = service.salvar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(viagemCriada);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ViagemResponseDTO> atualizarStatus(@PathVariable Long id, @RequestParam StatusViagem status) {
        return ResponseEntity.ok(service.atualizarStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
    @PostMapping(value = "/{id}/comprovante", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ViagemResponseDTO> salvarComprovante(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(service.salvarComprovante(id, file));
    }
}