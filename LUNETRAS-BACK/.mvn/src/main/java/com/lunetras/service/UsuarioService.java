package com.lunetras.service;

import com.lunetras.model.Perfil;
import com.lunetras.model.Usuario;
import com.lunetras.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // RF004 + RF005
    public Usuario cadastrarProfessor(String nome, String email) {

        if (usuarioRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email já cadastrado.");
        }

        String senhaInicial = gerarSenhaInicial();

        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(senhaInicial));
        usuario.setPerfil(Perfil.PROFESSOR);
        usuario.setAtivo(true);

        Usuario salvo = usuarioRepository.save(usuario);

        System.out.println("Senha inicial do professor: " + senhaInicial);

        return salvo;
    }


    // RF006
    public Usuario atualizarEmail(Long id, String email) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Usuário não encontrado"));

        usuario.setEmail(email);

        return usuarioRepository.save(usuario);
    }


    // RF006
    public void desativarUsuario(Long id) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Usuário não encontrado"));

        usuario.setAtivo(false);

        usuarioRepository.save(usuario);
    }


    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }


    // geração de senha automática
    private String gerarSenhaInicial() {

        return UUID.randomUUID()
                .toString()
                .substring(0, 8);
    }

    public void cadastrarProfessor(Usuario usuario) {
    }
}
