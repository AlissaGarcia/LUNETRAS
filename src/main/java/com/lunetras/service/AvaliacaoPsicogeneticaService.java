package com.lunetras.service;


import com.lunetras.model.AvaliacaoPsicogenetica;
import com.lunetras.model.Aluno;
import com.lunetras.model.Usuario;
import com.lunetras.model.Perfil;
import com.lunetras.repository.AvaliacaoPsicogeneticaRepository;
import com.lunetras.repository.UsuarioRepository;
import com.lunetras.repository.AlunoRepository;
import org.springframework.stereotype.Service;


@Service
public class AvaliacaoPsicogeneticaService {

    private final AvaliacaoPsicogeneticaRepository avaliacaoPsicogeneticaRepository;
    private final AlunoRepository alunoRepository;
    private final UsuarioRepository usuarioRepository;

    public AvaliacaoPsicogeneticaService(
            AvaliacaoPsicogeneticaRepository avaliacaoPsicogeneticaRepository,
            AlunoRepository alunoRepository,
            UsuarioRepository usuarioRepository) {

        this.avaliacaoPsicogeneticaRepository = avaliacaoPsicogeneticaRepository;
        this.alunoRepository = alunoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public AvaliacaoPsicogenetica criar(AvaliacaoPsicogenetica avaliacao) {

        if (avaliacao.getAluno() == null || avaliacao.getAluno().getId() == null) {
            throw new IllegalArgumentException("Aluno é obrigatório");
        }

        if (avaliacao.getProfessor() == null || avaliacao.getProfessor().getId() == null) {
            throw new IllegalArgumentException("Professor é obrigatório");
        }


        if (avaliacao.getBimestre() < 1 || avaliacao.getBimestre() > 4) {
            throw new IllegalArgumentException("O bimestre deve ser entre 1 e 4");
        }

        if (avaliacao.getDataAvaliacao() == null) {
            throw new IllegalArgumentException("Data da avaliação é obrigatória");
        }

        if (avaliacao.getPeriodoLetivo() == null) {
            throw new IllegalArgumentException("Período letivo é obrigatório");
        }

        //busca aluno real do banco
        Aluno aluno = alunoRepository.findById(
                avaliacao.getAluno().getId()
                ).orElseThrow(() ->
                new IllegalArgumentException("Aluno não encontrado.")
        );


        //busca professor real do banco
        Usuario professor = usuarioRepository.findById(
                avaliacao.getProfessor().getId()
        ).orElseThrow(() ->
                new IllegalArgumentException("Professor não encontrado.")
        );

        //valida se é professor
        if (professor.getPerfil() != Perfil.PROFESSOR) {
            throw new IllegalArgumentException("Usuário informado não é professor");
        }

        //apenas uma avaliacao por bimestre
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
        avaliacao.setProfessor(professor);
        return avaliacaoPsicogeneticaRepository.save(avaliacao);
    }
}

