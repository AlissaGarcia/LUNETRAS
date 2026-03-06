package com.lunetras.service;

import com.lunetras.dto.AlunoRequest;
import com.lunetras.dto.AlunoResponse;
import com.lunetras.model.Aluno;
import com.lunetras.repository.AlunoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AlunoService {
    private final AlunoRepository alunoRepository;

    public AlunoService(AlunoRepository alunoRepository) {
        this.alunoRepository = alunoRepository;
    }

    public AlunoResponse criar(AlunoRequest dto) {
        Aluno aluno = new Aluno();
        aluno.setNome(dto.getNome());
        aluno.setEmail(dto.getEmail());
        aluno.setDataNascimento(dto.getDataNascimento());

        Aluno salvo = alunoRepository.save(aluno);
        return toResponse(salvo);
    }

    public List<AlunoResponse> listarTodos() {
        return alunoRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public AlunoResponse buscarPorId(Long id) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Aluno não encontrado"));
        return toResponse(aluno);
    }

    public void remover(Long id) {
        alunoRepository.deleteById(id);
    }

    private AlunoResponse toResponse(Aluno aluno) {
        AlunoResponse response = new AlunoResponse();
        response.setId(aluno.getId());
        response.setNome(aluno.getNome());
        response.setEmail(aluno.getEmail());
        response.setDataNascimento(aluno.getDataNascimento());
        return response;
    }
    public List<AlunoResponse> relatorioPorNivel(String nivel) {

        return alunoRepository.findByNivelPsicogenetico(nivel)
                .stream()
                .map(this::toResponse)
                .toList();
    }
}