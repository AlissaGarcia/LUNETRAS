package com.lunetras.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import com.lunetras.model.Usuario;

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

    //  relacionamento com professor
    @ManyToOne
    @JoinColumn(name = "professor_id")
    private Usuario professor;

    //uma turma possui vários alunos
    @OneToMany(mappedBy = "turma", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Aluno> alunos = new ArrayList<>();

    public Turma(){
    }

    public Turma(String nome, Integer ano, Usuario professor) {
        this.nome = nome;
        this.ano = ano;
        this.professor = professor;
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

    //  GETTER
    public Usuario getProfessor() {
        return professor;
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

    //  SETTER
    public void setProfessor(Usuario professor) {
        this.professor = professor;
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
