package com.lunetras.dto;

public class LoginResponse {
    private String token;
    private String nome;
    private String perfil;
    private Long id;

    public LoginResponse(){}
      public LoginResponse(String token, String nome, String perfil, Long id) {
        this.token = token;
        this.nome = nome;
        this.perfil = perfil;
        this.id = id;
    }
    public String getToken() { 
        return token; 
    }
    public void setToken(String token) {
        this.token = token; 
    }
    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getPerfil() {
        return perfil;
    }

    public void setPerfil(String perfil) {
        this.perfil = perfil;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
}
