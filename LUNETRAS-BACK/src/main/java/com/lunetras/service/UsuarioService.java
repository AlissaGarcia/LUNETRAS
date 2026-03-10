package com.lunetras.service;

import com.lunetras.dto.ProfessorCadastroResponse;
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
    public ProfessorCadastroResponse cadastrarProfessor(String nome, String email) {

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

        ProfessorCadastroResponse response = new ProfessorCadastroResponse();
        response.setId(salvo.getId());
        response.setNome(salvo.getNome());
        response.setEmail(salvo.getEmail());
        response.setPerfil(salvo.getPerfil() != null ? salvo.getPerfil().name() : null);
        response.setAtivo(salvo.getAtivo());
        response.setSenhaInicial(senhaInicial);
        return response;
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

    public void ativarUsuario(Long id) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Usuário não encontrado"));

        usuario.setAtivo(true);

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
}

