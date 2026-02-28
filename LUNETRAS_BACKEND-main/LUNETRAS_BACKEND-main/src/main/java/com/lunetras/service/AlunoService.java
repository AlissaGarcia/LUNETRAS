package com.lunetras.service;

import com.lunetras.model.Aluno;
import com.lunetras.repository.AlunoRepository;
import org.springframework.stereotype.Service;

import java.util.List;


public class AlunoService {

    private final AlunoRepository alunoRepository;

    public AlunoService(AlunoRepository alunoRepository) {
        this.alunoRepository = alunoRepository;
    }

    // Cadastrar um novo aluno
    public Aluno cadastrarAluno(Aluno aluno) {
       validarAluno(aluno);
        return alunoRepository.save(aluno);
    }

    // Buscar aluno por ID
    public Aluno buscarPorId(Long id) {
        return alunoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Aluno não encontrado"));
    }

    // Listar todos os alunos
    public List<Aluno> listarTodos() {
        return alunoRepository.findAll();
    }

    // Associar aluno a uma turma
    public Aluno atualizarAluno(Long id, Aluno alunoAtualizado) {
        Aluno alunoExistente = buscarPorId(id);

        alunoExistente.setNome(alunoAtualizado.getNome());
        alunoExistente.setDataNascimento(alunoAtualizado.getDataNascimento());
        alunoExistente.setTurma(alunoAtualizado.getTurma());

        validarAluno(alunoExistente);

        return alunoRepository.save(alunoExistente);
    }

    // Regra de negócio
   private void validarAluno(Aluno aluno) {

        if(aluno == null) {
            throw new IllegalArgumentException("Aluno não pode ser nulo");
        }

        if(aluno.getNome() == null || aluno.getNome().isBlank()) {
            throw new IllegalArgumentException("Nome do aluno é obrigatório");
        }

        if (aluno.getDataNascimento() == null) {
            throw new IllegalArgumentException("Data de nascimento é obrigatória");
        }

        if (aluno.getTurma() == null) {
            throw new IllegalArgumentException("O aluno deve estar vinculado a uma turma");
        }
    }
}