package com.lunetras.dto;

import java.time.LocalDateTime;

public class TurmaResponse {
    private Long id;
    private String nome;
    private Integer ano;
    private String turno;
    private String professorNome;
    private Integer totalAlunos;
    private Integer alunosAlfabeticos;
    private Integer pendencias;
    private Boolean ativa;
    private LocalDateTime criadoEm;

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

    public Integer getTotalAlunos() {
        return totalAlunos;
    }

    public Integer getAlunosAlfabeticos() {
        return alunosAlfabeticos;
    }

    public Integer getPendencias() {
        return pendencias;
    }

    public Boolean getAtiva() {
        return ativa;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
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

    public void setTotalAlunos(Integer totalAlunos) {
        this.totalAlunos = totalAlunos;
    }

    public void setAlunosAlfabeticos(Integer alunosAlfabeticos) {
        this.alunosAlfabeticos = alunosAlfabeticos;
    }

    public void setPendencias(Integer pendencias) {
        this.pendencias = pendencias;
    }

    public void setAtiva(Boolean ativa) {
        this.ativa = ativa;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }
}



