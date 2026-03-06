package com.lunetras.service;

import com.lunetras.dto.EstatisticaNivel;
import com.lunetras.model.AvaliacaoPsicogenetica;
import com.lunetras.repository.AvaliacaoPsicogeneticaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RelatorioService {
    private final AvaliacaoPsicogeneticaRepository avaliacaoRepository;

    public RelatorioService(AvaliacaoPsicogeneticaRepository avaliacaoRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
    }

    public List<AvaliacaoPsicogenetica> relatorioPorTurmaEBimestre(Long turmaId, Integer bimestre, Integer periodoLetivo) {
        return avaliacaoRepository.findByAluno_Turma_IdAndBimestreAndPeriodoLetivo(turmaId, bimestre, periodoLetivo);
    }

    public List<EstatisticaNivel> estatisticasPorNivel(Long turmaId, Integer bimestre, Integer periodoLetivo) {
        return avaliacaoRepository.contarPorNivel(turmaId, bimestre, periodoLetivo);
    }
}