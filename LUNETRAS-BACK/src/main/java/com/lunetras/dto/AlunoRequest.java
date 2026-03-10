package com.lunetras.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class AlunoRequest {

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String email;

    @NotNull(message = "Data de nascimento é obrigatória")
    private LocalDate dataNascimento;

    private Long turmaId;

    private String nivel; // SEM_DADOS, ICONICA, etc

    private String status; // SEM_AVALIACAO, AVALIADO, REAVALIAR

    private String observacoes;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {

        this.nome = nome;
    }
    public LocalDate getDataNascimento(){

        return dataNascimento;
    }
    public void setDataNascimento(LocalDate dataNascimento) {

        this.dataNascimento =dataNascimento;
    }

    public Long getTurmaId() {
        return turmaId;
    }

    public void setTurmaId(Long turmaId) {
        this.turmaId = turmaId;
    }

    public String getEmail() {
        return email;
    }

    public String getNivel() {
        return nivel;
    }

    public void setNivel(String nivel) {
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

    public void setEmail(String email) {
        this.email = email;
    }
}
