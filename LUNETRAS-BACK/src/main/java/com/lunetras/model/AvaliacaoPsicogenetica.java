package com.lunetras.model;

import jakarta.persistence.*;
import java.time.LocalDate;


@Entity
@Table(name = "avaliacoes_psicogeneticas")
public class AvaliacaoPsicogenetica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    //1 a 4
    @Column(nullable = false)
    private Integer bimestre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NivelPsicogenetico nivel;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    // data da avaliacao
    @Column(nullable = false)
    private LocalDate dataAvaliacao;

    // periodo letivo (2026)
    @Column(nullable = false)
    private Integer periodoLetivo;

    @ManyToOne
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    // professor responsavel
    @ManyToOne
    @JoinColumn(name = "professor_id", nullable = false)
    private Usuario professor;

    public AvaliacaoPsicogenetica() {
    }

    public AvaliacaoPsicogenetica(Integer bimestre,
                                  NivelPsicogenetico nivel,
                                  String observacoes,
                                  LocalDate dataAvaliacao,
                                  Integer periodoLetivo,
                                  Aluno aluno,
                                  Usuario professor) {
        this.bimestre = bimestre;
        this.nivel = nivel;
        this.observacoes = observacoes;
        this.dataAvaliacao = dataAvaliacao;
        this.periodoLetivo = periodoLetivo;
        this.aluno = aluno;
        this.professor = professor;
    }


    public Long getId() {
        return id;
    }

    public Integer getBimestre() {
        return bimestre;
    }

    public NivelPsicogenetico getNivel() {
        return nivel;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public LocalDate getDataAvaliacao() {
        return dataAvaliacao;
    }

    public Integer getPeriodoLetivo() {
        return periodoLetivo;
    }

    public Aluno getAluno() {
        return aluno;
    }
    public Usuario getProfessor() {
        return professor;
    }

    public void setBimestre(Integer bimestre) {
        this.bimestre = bimestre;
    }

    public void setNivel(NivelPsicogenetico nivel) {
        this.nivel = nivel;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }

    public void setProfessor(Usuario professor) {
        this.professor = professor;
    }

    public void setDataAvaliacao(LocalDate dataAvaliacao) {
        this.dataAvaliacao = dataAvaliacao;
    }

    public void setPeriodoLetivo(Integer periodoLetivo) {
        this.periodoLetivo = periodoLetivo;
    }
}

