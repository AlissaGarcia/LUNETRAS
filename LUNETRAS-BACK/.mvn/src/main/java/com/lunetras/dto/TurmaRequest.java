package com.lunetras.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TurmaRequest {
    @NotBlank(message = "O nome da turma é obrigatório")
    private String nome;

    @NotBlank(message = "O turno é obrigatório")
    private String turno;

    @NotNull(message = "O ano escolar é obrigatório")
    @Min(value = 1, message = "O ano escolar deve ser maior que zero")
    private Integer ano;

    @NotNull(message = "O professor é obrigatório")
    private Long professorId;

    public String getNome() {
        return nome;
    }

    public Integer getAno() {
        return ano;
    }

    public String getTurno() {
        return turno;
    }

    public Long getProfessorId() {
        return professorId;
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

    public void setProfessorId(Long professorId) {
        this.professorId = professorId;
    }
}
