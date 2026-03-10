package com.lunetras.controller;

import com.lunetras.dto.ProfessorCadastro;
import com.lunetras.dto.ProfessorCadastroResponse;
import com.lunetras.model.Usuario;
import com.lunetras.service.UsuarioService;
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


    // Cadastrar professor
    @PostMapping("/professores")
    public ResponseEntity<ProfessorCadastroResponse> cadastrarProfessor(
            @RequestBody @Valid ProfessorCadastro dto) {

        ProfessorCadastroResponse usuario = usuarioService.cadastrarProfessor(
                dto.getNome(),
                dto.getEmail()
        );

        return ResponseEntity.ok(usuario);
    }


    // Listar usuários
    @GetMapping
    public ResponseEntity<List<Usuario>> listarUsuarios() {

        return ResponseEntity.ok(usuarioService.listarUsuarios());
    }


    // Editar usuário
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> editarUsuario(
            @PathVariable Long id,
            @RequestParam String email) {

        return ResponseEntity.ok(
                usuarioService.atualizarEmail(id, email)
        );
    }


    // Desativar usuário
    @PatchMapping("/{id}/desativar")
    public ResponseEntity<Void> desativarUsuario(@PathVariable Long id) {

        usuarioService.desativarUsuario(id);

        return ResponseEntity.noContent().build();
    }

    // Reativar usuário
    @PatchMapping("/{id}/ativar")
    public ResponseEntity<Void> ativarUsuario(@PathVariable Long id) {

        usuarioService.ativarUsuario(id);

        return ResponseEntity.noContent().build();
    }
}

