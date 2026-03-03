package com.lunetras.service;


import com.lunetras.model.AvaliacaoPsicogenetica;
import com.lunetras.model.Aluno;
import com.lunetras.repository.AvaliacaoPsicogeneticaRepository;
import com.lunetras.repository.AlunoRepository;
import org.springframework.stereotype.Service;


@Service
public class AvaliacaoPsicogeneticaService {

    private final AvaliacaoPsicogeneticaRepository avaliacaoPsicogeneticaRepository;
    private final AlunoRepository alunoRepository;

    public AvaliacaoPsicogeneticaService(
            AvaliacaoPsicogeneticaRepository avaliacaoPsicogeneticaRepository,
            AlunoRepository alunoRepository) {
        this.avaliacaoPsicogeneticaRepository = avaliacaoPsicogeneticaRepository;
        this.alunoRepository = alunoRepository;
    }

    public AvaliacaoPsicogenetica criar(AvaliacaoPsicogenetica avaliacao) {

        if (avaliacao.getAluno() == null || avaliacao.getAluno().getId() == null) {
            throw new IllegalArgumentException("Aluno é obrigatório");
        }

        if (avaliacao.getBimestre() < 1 || avaliacao.getBimestre() > 4) {
            throw new IllegalArgumentException("O bimestre deve ser entre 1 e 4");
        }



        Aluno aluno = alunoRepository.findById(
                avaliacao.getAluno().getId()
                ).orElseThrow(() ->
                new IllegalArgumentException("Aluno não encontrado.")
        );



        boolean jaExiste = avaliacaoPsicogeneticaRepository
                .findByAlunoIdAndBimestre(
                        avaliacao.getAluno().getId(),
                        avaliacao.getBimestre()
                ).isPresent();

        if (jaExiste) {
            throw new IllegalArgumentException(
                    "O aluno já possui avaliação neste bimestre"
            );
        }
        avaliacao.setAluno(aluno);
        return avaliacaoPsicogeneticaRepository.save(avaliacao);
    }
}

