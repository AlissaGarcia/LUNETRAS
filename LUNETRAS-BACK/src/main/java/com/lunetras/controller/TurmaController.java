package com.lunetras.controller;

import com.lunetras.dto.TurmaRequest;
import com.lunetras.dto.TurmaResponse;
import com.lunetras.service.TurmaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/turmas")
public class TurmaController {

    private final TurmaService turmaService;

    public TurmaController(TurmaService turmaService) {
        this.turmaService = turmaService;
    }

    @PostMapping
    public ResponseEntity<TurmaResponse> criar(@RequestBody @Valid TurmaRequest request) {
        TurmaResponse response = turmaService.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @GetMapping
    public ResponseEntity<List<TurmaResponse>> listarTodas() {
        return ResponseEntity.ok(turmaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TurmaResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(turmaService.buscarPorId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        turmaService.remover(id);
        return ResponseEntity.noContent().build();
    }
    @PatchMapping("/{turmaId}/professor/{professorId}")
    public ResponseEntity<TurmaResponse> vincularProfessor(
            @PathVariable Long turmaId,
            @PathVariable Long professorId) {

        return ResponseEntity.ok(turmaService.vincularProfessor(turmaId, professorId));
    }
}