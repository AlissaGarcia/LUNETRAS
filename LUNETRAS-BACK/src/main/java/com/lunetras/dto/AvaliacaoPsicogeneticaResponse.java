package com.lunetras.dto;

import java.time.LocalDate;

public class AvaliacaoPsicogeneticaResponse {
    private Long id;
    private Long alunoId;
    private String aluno;
    private Long turmaId;
    private String turma;
    private String nivel;
    private String status;
    private String observacoes;
    private LocalDate dataAvaliacao;
    private String bimestre;
    private String professorNome;

    public AvaliacaoPsicogeneticaResponse() {}

    public Long getId() { return id; }
    public Long getAlunoId() { return alunoId; }
    public String getAluno() { return aluno; }
    public Long getTurmaId() { return turmaId; }
    public String getTurma() { return turma; }
    public String getNivel() { return nivel; }
    public String getStatus() { return status; }
    public String getObservacoes() { return observacoes; }
    public LocalDate getDataAvaliacao() { return dataAvaliacao; }
    public String getBimestre() { return bimestre; }
    public String getProfessorNome() { return professorNome; }

    public void setId(Long id) { this.id = id; }
    public void setAlunoId(Long alunoId) { this.alunoId = alunoId; }
    public void setAluno(String aluno) { this.aluno = aluno; }
    public void setTurmaId(Long turmaId) { this.turmaId = turmaId; }
    public void setTurma(String turma) { this.turma = turma; }
    public void setNivel(String nivel) { this.nivel = nivel; }
    public void setStatus(String status) { this.status = status; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public void setDataAvaliacao(LocalDate dataAvaliacao) { this.dataAvaliacao = dataAvaliacao; }
    public void setBimestre(String bimestre) { this.bimestre = bimestre; }
    public void setProfessorNome(String professorNome) { this.professorNome = professorNome; }
}
