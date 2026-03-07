package com.lunetras.service;

import com.lunetras.dto.TurmaRequest;
import com.lunetras.dto.TurmaResponse;
import com.lunetras.model.Turma;
import com.lunetras.model.Usuario;
import com.lunetras.model.Perfil;
import com.lunetras.repository.TurmaRepository;
import com.lunetras.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TurmaService {


    private final TurmaRepository turmaRepository;
    private final UsuarioRepository usuarioRepository;

    public TurmaService(TurmaRepository turmaRepository,
                        UsuarioRepository usuarioRepository) {
        this.turmaRepository = turmaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public TurmaResponse criar(TurmaRequest dto) {

        Usuario professor = usuarioRepository.findById(dto.getProfessorId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Professor não encontrado"));

        if (professor.getPerfil() != Perfil.PROFESSOR) {
            throw new IllegalArgumentException("Usuário informado não é um professor");
        }

        Turma turma = new Turma();
        turma.setNome(dto.getNome());
        turma.setAno(dto.getAno());
        turma.setTurno(dto.getTurno());
        turma.setProfessor(professor);

        Turma salva = turmaRepository.save(turma);
        return toResponse(salva);
    }

    public List<TurmaResponse> listarTodas() {
        return turmaRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TurmaResponse buscarPorId(Long id) {
        Turma turma = turmaRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Turma não encontrada"));
        return toResponse(turma);
    }

    public void remover(Long id) {
        turmaRepository.deleteById(id);
    }


    public TurmaResponse vincularProfessor(Long turmaId, Long professorId) {

        Turma turma = turmaRepository.findById(turmaId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Turma não encontrada"));

        Usuario professor = usuarioRepository.findById(professorId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Professor não encontrado"));

        if (professor.getPerfil() != Perfil.PROFESSOR) {
            throw new IllegalArgumentException("Usuário informado não é um professor");
        }

        turma.setProfessor(professor);

        Turma salva = turmaRepository.save(turma);

        return toResponse(salva);
    }

    private TurmaResponse toResponse(Turma turma) {
        TurmaResponse response = new TurmaResponse();
        response.setId(turma.getId());
        response.setNome(turma.getNome());
        response.setAno(turma.getAno());
        response.setTurno(turma.getTurno());

        if (turma.getProfessor() != null) {
            response.setProfessorNome(turma.getProfessor().getNome());
        }

        return response;
    }
}