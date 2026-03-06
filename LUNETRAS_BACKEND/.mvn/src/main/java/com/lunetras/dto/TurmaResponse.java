package com.lunetras.dto;

public class TurmaResponse {
    private Long id;
    private String nome;
    private Integer ano;
    private String turno;
    private String professorNome;

    public TurmaResponse() {
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
    public String getTurno() {
        return turno;
    }

    public String getProfessorNome() {
        return professorNome;
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
    public void setTurno(String turno) {
        this.turno = turno;
    }

    public void setProfessorNome(String professorNome) {
        this.professorNome = professorNome;

    }
}



