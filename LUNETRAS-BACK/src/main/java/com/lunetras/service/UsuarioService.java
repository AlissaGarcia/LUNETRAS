package com.lunetras.service;

import com.lunetras.model.Perfil;
import com.lunetras.model.Usuario;
import com.lunetras.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;


    // RF004 + RF005 - Cadastrar Professor
    public String cadastrarProfessor(String nome, String email) {

        if (usuarioRepository.existsByEmail(email)) {
            throw new RuntimeException("E-mail já cadastrado.");
        }

        String senhaGerada = gerarSenhaAleatoria();

        Usuario professor = new Usuario();
        professor.setNome(nome);
        professor.setEmail(email);
        professor.setSenha(passwordEncoder.encode(senhaGerada));
        professor.setPerfil(Perfil.PROFESSOR);
        professor.setAtivo(true);

        usuarioRepository.save(professor);

        return senhaGerada; // Admin visualiza a senha inicial
    }


    // RF006 - Editar Usuário
    public Usuario editarUsuario(Long id, String nome) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        usuario.setNome(nome);

        return usuarioRepository.save(usuario);
    }


    // RF006 - Desativar Usuário
    public void desativarUsuario(Long id) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        usuario.setAtivo(false);

        usuarioRepository.save(usuario);
    }

    //listar professores
    public List<Usuario> listarProfessores() {
        return usuarioRepository.findAll()
                .stream()
                .filter(usuario -> usuario.getPerfil() == Perfil.PROFESSOR)
                .toList();
    }

    // metodo auxiliar - gerar senha
    private String gerarSenhaAleatoria() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
