package com.cospa.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "lancamentos_financeiros")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LancamentoFinanceiro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "titulo_id", nullable = false)
    @JsonIgnore
    private TituloFinanceiro titulo;

    @Column(name = "viagem_id")
    private Long viagemId;

    @Column(nullable = false)
    private String tipo; // "A RECEBER" ou "A PAGAR"

    @Column(nullable = false)
    private String etapa; // "ADIANTAMENTO", "SALDO", "ADICIONAL"

    @Column(name = "tipo_adicional")
    private String tipoAdicional;

    @Column(name = "entidade_nome", nullable = false)
    private String entidadeNome;

    @Column(name = "valor_previsto")
    private BigDecimal valorPrevisto = BigDecimal.ZERO;

    @Column(name = "valor_realizado")
    private BigDecimal valorRealizado = BigDecimal.ZERO;

    @Column(name = "saldo_em_aberto")
    private BigDecimal saldoEmAberto = BigDecimal.ZERO;

    @Column(name = "data_vencimento")
    private String dataVencimento;

    @Column(name = "data_efetiva")
    private String dataEfetiva;

    private String status = "PENDENTE";

    @Column(name = "numero_cte")
    private String numeroCte;

    @Column(name = "numero_mdfe")
    private String numeroMdfe;

    @Column(name = "comprovante_url")
    private String comprovanteUrl;

    private String observacao;
}