package com.lunetras.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class AvaliacaoPsicogenetica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Aluno aluno;

    @Enumerated(EnumType.STRING)
    private Bimestre bimestre;

    @Enumerated(EnumType.STRING)
    private NivelPsicogenetico nivel;

    private LocalDate dataAvaliacao;
    private String observacoes;

    public AvaliacaoPsicogenetica() {
    }

    public AvaliacaoPsicogenetica(
            Aluno aluno,
            Bimestre bimestre,
            NivelPsicogenetico nivel,
            LocalDate dataAvaliacao,
            String observacoes
    ) {
        this.aluno = aluno;
        this.bimestre = bimestre;
        this.nivel = nivel;
        this.dataAvaliacao = dataAvaliacao;
        this.observacoes = observacoes;
    }

    public Long getId() {
        return id;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public Bimestre getBimestre() {
        return bimestre;
    }

    public NivelPsicogenetico getNivel() {
        return nivel;
    }

    public LocalDate getDataAvaliacao() {
        return dataAvaliacao;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }

    public void setBimestre(Bimestre bimestre) {
        this.bimestre = bimestre;
    }

    public void setNivel(NivelPsicogenetico nivel) {
        this.nivel = nivel;
    }

    public void setDataAvaliacao(LocalDate dataAvaliacao) {
        this.dataAvaliacao = dataAvaliacao;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
}