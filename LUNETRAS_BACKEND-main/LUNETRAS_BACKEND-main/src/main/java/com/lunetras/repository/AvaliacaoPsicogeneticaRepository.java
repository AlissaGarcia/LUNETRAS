package com.lunetras.repository;

import com.lunetras.model.AvaliacaoPsicogenetica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AvaliacaoPsicogeneticaRepository
    extends JpaRepository<AvaliacaoPsicogenetica, Long> {
}
