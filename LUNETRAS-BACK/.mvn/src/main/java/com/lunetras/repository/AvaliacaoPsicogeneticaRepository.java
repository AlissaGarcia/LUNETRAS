package com.lunetras.repository;

import com.lunetras.dto.EstatisticaNivel;
import com.lunetras.model.AvaliacaoPsicogenetica;
import com.lunetras.dto.EstatisticaNivel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

@Repository
public interface AvaliacaoPsicogeneticaRepository
        extends JpaRepository<AvaliacaoPsicogenetica, Long> {

    // RF012 - impedir duplicidade de avaliação no mesmo bimestre
    Optional<AvaliacaoPsicogenetica>
    findByAlunoIdAndBimestre(Long alunoId, Integer bimestre);


    // RF016 - buscar avaliações por turma e bimestre
    List<AvaliacaoPsicogenetica>
    findByAlunoTurmaIdAndBimestre(Long turmaId, Integer bimestre);



    // gera estatística por nível psicogenético
    @Query("""
        SELECT new com.lunetras.dto.EstatisticaNivelDTO(a.nivel, COUNT(a))
        FROM AvaliacaoPsicogenetica a
        WHERE a.aluno.turma.id = :turmaId
        AND a.bimestre = :bimestre
        GROUP BY a.nivel
    """)
    List<EstatisticaNivel> contarPorNivel(Long turmaId, Integer bimestre);

}