package com.cospa.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "veiculos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Veiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String placa;

    @Column(name = "tipo_veiculo", nullable = false, length = 50)
    private String tipoVeiculo;

    @Column(name = "tipo_carroceria", length = 50)
    private String tipoCarroceria;

    @Column(length = 50)
    private String adicional;

    @Column(name = "numero_eixos", length = 20)
    private String numeroEixos;

    @Column(name = "cubagem_bau", length = 50)
    private String cubagemBau;

    @Column(name = "capacidade_peso", length = 50)
    private String capacidadePeso;

    @Column(name = "numero_paletes", length = 50)
    private String numeroPaletes;

    @Column(name = "ano_fabricacao", length = 10)
    private String anoFabricacao;

    @Column(name = "data_vencimento", length = 50)
    private String dataVencimento;

    @Column(length = 255)
    private String fornecedor;

    @Column(name = "numero_antt", length = 50)
    private String numeroAntt;

    @Column(name = "tipo_rastreador", length = 100)
    private String tipoRastreador;

    @Builder.Default
    @Column(length = 20)
    private String situacao = "ATIVO";

    @OneToMany(mappedBy = "veiculo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    @Builder.Default
    private List<VeiculoDocumento> documentos = new ArrayList<>();

    @ManyToMany(mappedBy = "veiculos", fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<Motorista> motoristas = new ArrayList<>();
}