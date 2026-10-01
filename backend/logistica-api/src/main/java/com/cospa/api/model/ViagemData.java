package com.cospa.api.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "viagem_datas")
public class ViagemData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viagem_id", nullable = false)
    @JsonBackReference
    private Viagem viagem;

    @Column(nullable = false, length = 20)
    private String tipo; // "COLETA" ou "ENTREGA"

    @Column(name = "data_prevista", length = 100)
    private String dataPrevista;

    @Column(name = "data_real", length = 100)
    private String dataReal;

    @Column(nullable = false)
    private Integer ordem = 0;

    public ViagemData() {}

    public ViagemData(String tipo, String dataPrevista, String dataReal, Integer ordem, Viagem viagem) {
        this.tipo = tipo;
        this.dataPrevista = dataPrevista;
        this.dataReal = dataReal;
        this.ordem = ordem;
        this.viagem = viagem;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Viagem getViagem() { return viagem; }
    public void setViagem(Viagem viagem) { this.viagem = viagem; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getDataPrevista() { return dataPrevista; }
    public void setDataPrevista(String dataPrevista) { this.dataPrevista = dataPrevista; }

    public String getDataReal() { return dataReal; }
    public void setDataReal(String dataReal) { this.dataReal = dataReal; }

    public Integer getOrdem() { return ordem; }
    public void setOrdem(Integer ordem) { this.ordem = ordem; }
}