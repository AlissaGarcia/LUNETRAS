package com.lunetras.controller;
import com.lunetras.dto.ProfessorCadastro;
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


    // RF004 - Cadastrar Professor
    @PostMapping("/professores")
    public ResponseEntity<Usuario> cadastrarProfessor(
            @RequestBody @Valid ProfessorCadastro dto) {

        Usuario usuario = usuarioService.cadastrarProfessor(
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


    // RF006 - Editar Usuário
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> editarUsuario(
            @PathVariable Long id,
            @RequestParam String email) {

        return ResponseEntity.ok(
                usuarioService.atualizarEmail(id, email)
        );
    }


    // RF006 - Desativar Usuário
    @PatchMapping("/{id}/desativar")
    public ResponseEntity<Void> desativarUsuario(@PathVariable Long id) {

        usuarioService.desativarUsuario(id);

        return ResponseEntity.noContent().build();
    }
}