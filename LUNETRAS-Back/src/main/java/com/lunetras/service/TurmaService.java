package com.lunetras.service;

import com.lunetras.dto.TurmaRequest;
import com.lunetras.dto.TurmaResponse;
import com.lunetras.model.Turma;
import com.lunetras.repository.TurmaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TurmaService {

    private final TurmaRepository turmaRepository;



    public TurmaService(TurmaRepository turmaRepository) {
        this.turmaRepository = turmaRepository;
    }

    public TurmaResponse criar(TurmaRequest dto) {
        Turma turma = new Turma();
        turma.setNome(dto.getNome());
        turma.setAno(dto.getAno());

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

    private TurmaResponse toResponse(Turma turma) {
        TurmaResponse response = new TurmaResponse();
        response.setId(turma.getId());
        response.setNome(turma.getNome());
        response.setAno(turma.getAno());
        return response;
    }
}