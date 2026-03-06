package com.lunetras.controller;

import com.lunetras.model.AvaliacaoPsicogenetica;
import com.lunetras.service.RelatorioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

public class RelatorioController {
    private RelatorioService relatorioService;

    @GetMapping("/turma/{turmaId}/bimestre/{bimestre}")
    public ResponseEntity<List<AvaliacaoPsicogenetica>> relatorioTurmaBimestre(
            @PathVariable Long turmaId,
            @PathVariable Integer bimestre) {

        return ResponseEntity.ok(
                relatorioService.relatorioPorTurmaEBimestre(turmaId, bimestre)
        );
    }
}
