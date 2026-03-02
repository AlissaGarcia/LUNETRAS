package com.lunetras.repository;

import com.lunetras.model.AvaliacaoPsicogenetica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AvaliacaoPsicogeneticaRepository
    extends JpaRepository<AvaliacaoPsicogenetica, Long> {
    Optional<AvaliacaoPsicogenetica>
    findByAlunoIdAndBimestre(Long alunoId, Integer bimestre);
}
