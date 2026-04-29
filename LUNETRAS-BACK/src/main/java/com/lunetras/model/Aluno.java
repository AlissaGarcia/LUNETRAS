package com.lunetras.model;

import com.lunetras.model.NivelPsicogenetico;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "alunos")
public class Aluno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private LocalDate dataNascimento;

   @ManyToOne
   @JoinColumn (name = "turma_id")
   private Turma turma;

    @Enumerated(EnumType.STRING)
    private NivelPsicogenetico nivel = NivelPsicogenetico.SEM_DADOS;

    private String status = "SEM_AVALIACAO";

    @Column(columnDefinition = "TEXT")
    private String observacoes;


   public Aluno() {
   }

    public Aluno(String nome, String email, LocalDate dataNascimento) {
        this.nome = nome;
        this.email = email;
        this.dataNascimento = dataNascimento;
    }

    public Long getId() {

       return id;

    }

    public void setId(Long id) {

       this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public Turma getTurma() {
        return turma;
    }

    public void setTurma(Turma turma) {
        this.turma = turma;
    }

    public NivelPsicogenetico getNivel() {
        return nivel;
    }

    public void setNivel(NivelPsicogenetico nivel) {
        this.nivel = nivel;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }
}