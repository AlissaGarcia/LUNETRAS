package com.lunetras.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "turmas")
public class Turma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

   @Column(nullable = false)
   private String nome;

   @Column(nullable = false)
   private Integer ano; // primeiro ao quinto

    //uma turma possui vários alunos
    @OneToMany(mappedBy = "turma", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Aluno> alunos = new ArrayList<>();

    public Turma(){
    }

    public Turma(String nome, Integer ano) {
        this.nome = nome;
        this.ano = ano;
    }

   public Long getId() {
        return id;
   }

   public String getNome() {
        return nome;
   }

   public Integer getAno() {
       return ano;
   }

   public List<Aluno> getAlunos() {
        return alunos;
   }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setAno(Integer ano) {
        this.ano = ano;
    }

    //rn

    public void adicionarAluno(Aluno aluno) {
        alunos.add(aluno);
        aluno.setTurma(this);
    }

    public void removerAluno(Aluno aluno) {
        alunos.remove(aluno);
        aluno.setTurma(null);
    }
}
