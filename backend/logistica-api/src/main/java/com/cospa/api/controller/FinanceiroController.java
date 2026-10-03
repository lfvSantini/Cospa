package com.cospa.api.controller;

import com.cospa.api.model.LancamentoFinanceiro;
import com.cospa.api.model.TituloFinanceiro;
import com.cospa.api.service.FinanceiroService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/financeiro")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FinanceiroController {

    private final FinanceiroService financeiroService;

    @GetMapping("/receber")
    public ResponseEntity<List<TituloFinanceiro>> listarContasReceber() {
        return ResponseEntity.ok(financeiroService.listarPorTipo("A RECEBER"));
    }

    @GetMapping("/pagar")
    public ResponseEntity<List<TituloFinanceiro>> listarContasPagar() {
        return ResponseEntity.ok(financeiroService.listarPorTipo("A PAGAR"));
    }

    @GetMapping("/lancamentos")
    public ResponseEntity<List<LancamentoFinanceiro>> listarLancamentos() {
        return ResponseEntity.ok(financeiroService.listarTodosLancamentos());
    }

    @PostMapping("/sincronizar-legado")
    public ResponseEntity<String> sincronizarViagensLegadas() {
        int total = financeiroService.sincronizarTodasViagensAntigas();
        return ResponseEntity.ok("Sincronizadas " + total + " viagens com o módulo financeiro com sucesso!");
    }

    @PostMapping("/lancamentos/{id}/baixa")
    public ResponseEntity<LancamentoFinanceiro> liquidarParcela(
            @PathVariable Long id,
            @RequestParam("valorRealizado") BigDecimal valorRealizado,
            @RequestParam("dataEfetiva") String dataEfetiva,
            @RequestParam(value = "arquivo", required = false) MultipartFile arquivo,
            @RequestParam(value = "obs", required = false) String obs) {

        return ResponseEntity.ok(financeiroService.realizarBaixa(id, valorRealizado, dataEfetiva, arquivo, obs));
    }
}