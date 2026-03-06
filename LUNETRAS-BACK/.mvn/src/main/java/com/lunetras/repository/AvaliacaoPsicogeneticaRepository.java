package com.lunetras.repository;

import com.lunetras.dto.EstatisticaNivel;
import com.lunetras.model.AvaliacaoPsicogenetica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AvaliacaoPsicogeneticaRepository
        extends JpaRepository<AvaliacaoPsicogenetica, Long> {

    Optional<AvaliacaoPsicogenetica> findByAlunoIdAndBimestreAndPeriodoLetivo(Long alunoId, Integer bimestre, Integer periodoLetivo);

    List<AvaliacaoPsicogenetica> findByAluno_Turma_IdAndBimestreAndPeriodoLetivo(Long turmaId, Integer bimestre, Integer periodoLetivo);

    @Query("""
        SELECT new com.lunetras.dto.EstatisticaNivel(a.nivel, COUNT(a))
        FROM AvaliacaoPsicogenetica a
        WHERE a.aluno.turma.id = :turmaId
        AND a.bimestre = :bimestre
        AND a.periodoLetivo = :periodoLetivo
        GROUP BY a.nivel
    """)
    List<EstatisticaNivel> contarPorNivel(Long turmaId, Integer bimestre, Integer periodoLetivo);
}