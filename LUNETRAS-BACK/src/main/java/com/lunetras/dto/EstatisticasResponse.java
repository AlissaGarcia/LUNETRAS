package com.lunetras.dto;

import java.util.List;
import java.util.Map;

public class EstatisticasResponse {
    private Long turmaId;
    private String nomeTurma;
    private Integer bimestre;
    private Integer periodoLetivo;
    private Integer totalAlunos;
    private Map<String, Integer> nivelParaQuantidade;
    private List<EstatisticaNivel> estatisticas;

    public EstatisticasResponse() {}

    // Getters
    public Long getTurmaId() { return turmaId; }
    public String getNomeTurma() { return nomeTurma; }
    public Integer getBimestre() { return bimestre; }
    public Integer getPeriodoLetivo() { return periodoLetivo; }
    public Integer getTotalAlunos() { return totalAlunos; }
    public Map<String, Integer> getNivelParaQuantidade() { return nivelParaQuantidade; }
    public List<EstatisticaNivel> getEstatisticas() { return estatisticas; }

    // Setters
    public void setTurmaId(Long turmaId) { this.turmaId = turmaId; }
    public void setNomeTurma(String nomeTurma) { this.nomeTurma = nomeTurma; }
    public void setBimestre(Integer bimestre) { this.bimestre = bimestre; }
    public void setPeriodoLetivo(Integer periodoLetivo) { this.periodoLetivo = periodoLetivo; }
    public void setTotalAlunos(Integer totalAlunos) { this.totalAlunos = totalAlunos; }
    public void setNivelParaQuantidade(Map<String, Integer> nivelParaQuantidade) {
        this.nivelParaQuantidade = nivelParaQuantidade;
    }
    public void setEstatisticas(List<EstatisticaNivel> estatisticas) { this.estatisticas = estatisticas; }
}