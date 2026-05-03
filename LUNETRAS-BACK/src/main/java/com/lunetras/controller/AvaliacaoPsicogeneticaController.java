package com.lunetras.controller;

import com.lunetras.dto.AvaliacaoPsicogeneticaResponse;
import com.lunetras.model.AvaliacaoPsicogenetica;
import com.lunetras.service.AvaliacaoPsicogeneticaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/avaliacoes")
public class AvaliacaoPsicogeneticaController {
    private final AvaliacaoPsicogeneticaService avaliacaoService;

    public AvaliacaoPsicogeneticaController(
            AvaliacaoPsicogeneticaService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    @PostMapping
    public ResponseEntity<AvaliacaoPsicogenetica> criar(
            @RequestBody AvaliacaoPsicogenetica avaliacao) {

        AvaliacaoPsicogenetica criada =
                avaliacaoService.criar(avaliacao);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(criada);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AvaliacaoPsicogeneticaResponse> buscarPorId(
            @PathVariable Long id) {

        AvaliacaoPsicogenetica avaliacao = avaliacaoService.buscarPorId(id);
        AvaliacaoPsicogeneticaResponse response = toResponse(avaliacao);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/aluno/{alunoId}")
    public ResponseEntity<List<AvaliacaoPsicogeneticaResponse>> listarPorAluno(
            @PathVariable Long alunoId) {

        List<AvaliacaoPsicogenetica> avaliacoes = avaliacaoService.listarPorAluno(alunoId);
        List<AvaliacaoPsicogeneticaResponse> responses = avaliacoes.stream()
            .map(this::toResponse)
            .toList();

        return ResponseEntity.ok(responses);
    }

    private AvaliacaoPsicogeneticaResponse toResponse(AvaliacaoPsicogenetica avaliacao) {
        AvaliacaoPsicogeneticaResponse response = new AvaliacaoPsicogeneticaResponse();
        response.setId(avaliacao.getId());
        response.setAlunoId(avaliacao.getAluno().getId());
        response.setAluno(avaliacao.getAluno().getNome());

        if(avaliacao.getAluno().getTurma() != null){
            response.setTurmaId(avaliacao.getAluno().getTurma().getId());
            response.setTurma(avaliacao.getAluno().getTurma().getNome());
        }
        response.setNivel(avaliacao.getNivel().name());
        response.setStatus(avaliacao.getStatus());
        response.setObservacoes(avaliacao.getObservacoes());
        response.setDataAvaliacao(avaliacao.getDataAvaliacao());
        response.setBimestre(String.valueOf(avaliacao.getBimestre()));
        response.setProfessorNome(avaliacao.getProfessor().getNome());

        return response;
    }
}
