package com.lunetras.dto;

import jakarta.validation.constraints.NotBlank;

public class TurmaRequest {
    @NotBlank(message = "O nome da turma é obrigatório")
    private String nome;

    @NotBlank(message = "O turno é obrigatório")
    private String turno;

    @NotBlank(message = "O ano escolar é obrigatório")
    private Integer ano;

    public String getNome() {
        return nome;
    }

    public Integer getAno() {
        return ano;
    }

    public String getTurno() {
        return turno;
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
}
