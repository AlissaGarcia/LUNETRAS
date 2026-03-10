package com.lunetras.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfessorCadastroResponse {
    private Long id;
    private String nome;
    private String email;
    private String perfil;
    private Boolean ativo;

    /**
     * Senha inicial gerada automaticamente. Deve ser exibida apenas uma vez ao admin.
     */
    private String senhaInicial;
}

