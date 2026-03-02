package com.lunetras.model;

import jakarta.persistence.*;


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

    @ManyToOne
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    public AvaliacaoPsicogenetica() {
    }

    public AvaliacaoPsicogenetica(Integer bimestre,
                                  NivelPsicogenetico nivel,
                                  String observacoes,
                                  Aluno aluno) {
        this.bimestre = bimestre;
        this.nivel = nivel;
        this.observacoes = observacoes;
        this.aluno = aluno;
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

    public Aluno getAluno() {
        return aluno;
    }

    public void setAluno(Aluno aluno) {
    }
}
