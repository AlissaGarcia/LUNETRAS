package com.lunetras.service;

import com.lunetras.model.AvaliacaoPsicogenetica;
import com.lunetras.repository.AvaliacaoPsicogeneticaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AvaliacaoPsicogeneticaService {

    private final AvaliacaoPsicogeneticaRepository avaliacaoPsicogeneticaRepository;

    //injeção dependências pelo Spring
    public AvaliacaoPsicogeneticaService(
            AvaliacaoPsicogeneticaRepository avaliacaoPsicogeneticaRepository) {

        this.avaliacaoPsicogeneticaRepository = avaliacaoPsicogeneticaRepository;
    }

    public AvaliacaoPsicogenetica criarAvaliacao(AvaliacaoPsicogenetica avaliacao) {
        validarAvaliacao(avaliacao);
        return avaliacaoPsicogeneticaRepository.save(avaliacao);
    }

    public AvaliacaoPsicogenetica buscarPorId(Long id) {
        return avaliacaoPsicogeneticaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Avaliação não encontrada"));
    }

    public List<AvaliacaoPsicogenetica> listarTodas() {
        return avaliacaoPsicogeneticaRepository.findAll();
    }
    private void validarAvaliacao(AvaliacaoPsicogenetica avaliacao) {

        if(avaliacao == null) {
            throw new IllegalArgumentException("A avaliação não pode ser nula");
        }
        if (avaliacao.getBimestre() == null) {
            throw new IllegalArgumentException("Bimestre é obrigatório");
        }

        if (avaliacao.getNivel() == null) {
            throw new IllegalArgumentException("Nível psicogenético é obrigatório");
        }

        if (avaliacao.getDataAvaliacao() == null) {
            throw new IllegalArgumentException("Data da avaliação é obrigatória");
        }
    }

    }

