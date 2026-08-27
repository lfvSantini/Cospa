package com.cospa.api.controller;

import com.cospa.api.dto.ViagemRequestDTO;
import com.cospa.api.dto.ViagemResponseDTO;
import com.cospa.api.model.StatusViagem;
import com.cospa.api.model.Viagem;
import com.cospa.api.repository.ViagemRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/viagens")
@CrossOrigin(origins = "*")
public class ViagemController {

    @Autowired
    private ViagemRepository viagemRepository;

    @GetMapping
    public ResponseEntity<List<ViagemResponseDTO>> listarTodas() {
        List<ViagemResponseDTO> lista = viagemRepository.findAll().stream()
                .map(ViagemResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ViagemResponseDTO> buscarPorId(@PathVariable Long id) {
        return viagemRepository.findById(id)
                .map(v -> ResponseEntity.ok(new ViagemResponseDTO(v)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ViagemResponseDTO> criar(@RequestBody @Valid ViagemRequestDTO dto) {
        Viagem v = new Viagem();
        v.setId(dto.getId());
        copiarDtoParaEntidade(dto, v);
        Viagem salva = viagemRepository.save(v);
        return ResponseEntity.ok(new ViagemResponseDTO(salva));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ViagemResponseDTO> atualizar(@PathVariable Long id, @RequestBody @Valid ViagemRequestDTO dto) {
        return viagemRepository.findById(id).map(v -> {
            copiarDtoParaEntidade(dto, v);
            Viagem atualizada = viagemRepository.save(v);
            return ResponseEntity.ok(new ViagemResponseDTO(atualizada));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!viagemRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        viagemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void copiarDtoParaEntidade(ViagemRequestDTO dto, Viagem v) {
        v.setCliente(dto.getCliente());
        v.setLocalColeta(dto.getLocalColeta());
        v.setLocalEntrega(dto.getLocalEntrega());
        v.setOrigem(dto.getOrigem());
        v.setDestino(dto.getDestino());
        v.setOrigemNome(dto.getOrigemNome());
        v.setDestinoNome(dto.getDestinoNome());
        v.setNomeMotorista(dto.getNomeMotorista());
        v.setPlaca(dto.getPlaca());
        v.setFornecedorAgencia(dto.getFornecedorAgencia());

        // Conversão com tratamento de nulos e formatos de data
        v.setDataColetaPrevista(parseData(dto.getDataColetaPrevista()));
        v.setDataColetaReal(parseData(dto.getDataColetaReal()));
        v.setDataEntregaPrevista(parseData(dto.getDataEntregaPrevista()));
        v.setDataEntregaReal(parseData(dto.getDataEntregaReal()));

        v.setValorAReceber(dto.getValorAReceber());
        v.setValorAPagar(dto.getValorAPagar());
        v.setValorAdicionalReceber(dto.getValorAdicionalReceber());
        v.setValorAdicionalPagar(dto.getValorAdicionalPagar());
        v.setValorAdicionalAgencia(dto.getValorAdicionalAgencia());
        v.setPagamentoLiberado(dto.getPagamentoLiberado());
        v.setPagamentoRealizadoStatus(dto.getPagamentoRealizadoStatus());
        v.setDataHoraPagamento(dto.getDataHoraPagamento());
        v.setObservacao(dto.getObservacao());

        if (dto.getStatus() != null) {
            v.setStatus(dto.getStatus());
        } else {
            v.setStatus(StatusViagem.PROGRAMADO);
        }
    }

    private LocalDateTime parseData(String dataStr) {
        if (dataStr == null || dataStr.isBlank() || dataStr.equalsIgnoreCase("A confirmar") || dataStr.equals("-")) {
            return null;
        }

        dataStr = dataStr.trim();

        // 1. Formato ISO padrão: "2026-08-26T14:30:00" ou "2026-08-26T14:30"
        try {
            return LocalDateTime.parse(dataStr);
        } catch (Exception ignored) {}

        // 2. Formato Brasileiro com hora: "26/08/2026 14:30" ou "26/08/2026 14:30:00"
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm[:ss]");
            return LocalDateTime.parse(dataStr, formatter);
        } catch (Exception ignored) {}

        // 3. Formato Brasileiro apenas data: "26/08/2026" (define 00:00 como hora)
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            return LocalDate.parse(dataStr, formatter).atStartOfDay();
        } catch (Exception ignored) {}

        // 4. Formato ISO apenas data: "2026-08-26"
        try {
            return LocalDate.parse(dataStr).atStartOfDay();
        } catch (Exception ignored) {}

        return null;
    }
}