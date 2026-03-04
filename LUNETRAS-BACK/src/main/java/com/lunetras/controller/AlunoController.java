package com.lunetras.controller;

import com.lunetras.dto.AlunoRequest;
import com.lunetras.dto.AlunoResponse;
import com.lunetras.service.AlunoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/alunos")
@CrossOrigin(origins = "*")
public class AlunoController {

    private final AlunoService alunoService;

    public AlunoController(AlunoService alunoService) {
        this.alunoService = alunoService;
    }

    @PostMapping
    public ResponseEntity<AlunoResponse> criarAluno(
            @RequestBody AlunoRequest dto) {

        AlunoResponse aluno = alunoService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(aluno);
    }

    @GetMapping
    public ResponseEntity<List<AlunoResponse>> listarAlunos() {
        return ResponseEntity.ok(alunoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlunoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(alunoService.buscarPorId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerAluno(@PathVariable Long id) {
        alunoService.remover(id);
        return ResponseEntity.noContent().build();
    }
}