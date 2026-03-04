package com.lunetras.controller;
import com.lunetras.model.Usuario;
import com.lunetras.service.UsuarioService;
import com.lunetras.dto.ProfessorCadastro;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/admin/usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioController {
    private final UsuarioService usuarioService;


    // RF004 - Cadastrar Professor
    @PostMapping("/professores")
    public ResponseEntity<String> cadastrarProfessor(
            @RequestBody @Valid ProfessorCadastro dto) {

        String senhaGerada = usuarioService.cadastrarProfessor(
                dto.getNome(),
                dto.getEmail()
        );

        return ResponseEntity.ok(
                "Professor cadastrado com sucesso. Senha inicial: " + senhaGerada
        );
    }

    //listar professores
    @GetMapping("/professores")
    public ResponseEntity<List<Usuario>> listarProfessores() {
        return ResponseEntity.ok(usuarioService.listarProfessores());
    }


    // RF006 - Editar Usuário
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> editarUsuario(
            @PathVariable Long id,
            @RequestParam String nome) {

        return ResponseEntity.ok(usuarioService.editarUsuario(id, nome));
    }


    // RF006 - Desativar Usuário
    @PatchMapping("/{id}/desativar")
    public ResponseEntity<Void> desativarUsuario(@PathVariable Long id) {

        usuarioService.desativarUsuario(id);

        return ResponseEntity.noContent().build();
    }
}

