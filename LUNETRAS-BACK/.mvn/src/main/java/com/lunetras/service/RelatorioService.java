package com.lunetras.service;

import com.lunetras.model.AvaliacaoPsicogenetica;
import com.lunetras.repository.AvaliacaoPsicogeneticaRepository;

import java.util.List;

public class RelatorioService {
    private AvaliacaoPsicogeneticaRepository avaliacaoRepository;

    public List<AvaliacaoPsicogenetica> relatorioPorTurmaEBimestre(Long turmaId, Integer bimestre) {

        return avaliacaoRepository
                .findByAlunoTurmaIdAndBimestre(turmaId, bimestre);
    }
}
