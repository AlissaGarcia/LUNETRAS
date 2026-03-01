package com.lunetras.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Aluno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private LocalDate dataNascimento;

    @OneToMany(mappedBy = "aluno", cascade = CascadeType.ALL)
    private List<AvaliacaoPsicogenetica> avaliacoes = new ArrayList<>();

    @ManyToOne
    private Turma turma;

    public Aluno() {
    }

    public Aluno(String nome, LocalDate dataNascimento) {
        this.nome = nome;
        this.dataNascimento = dataNascimento;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public List<AvaliacaoPsicogenetica> getAvaliacoes() {
        return avaliacoes;
    }

    public Turma getTurma() {
        return turma;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public void setTurma(Turma turma) {
        this.turma = turma;
    }
}