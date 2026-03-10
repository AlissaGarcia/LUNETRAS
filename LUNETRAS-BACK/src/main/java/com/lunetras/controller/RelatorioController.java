package com.lunetras.controller;

import com.lunetras.dto.EstatisticaNivel;
import com.lunetras.model.AvaliacaoPsicogenetica;
import com.lunetras.service.RelatorioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/relatorios")
public class RelatorioController {
    private final RelatorioService relatorioService;

    public RelatorioController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @GetMapping("/turma/{turmaId}/bimestre/{bimestre}/periodo/{periodoLetivo}")

    public ResponseEntity<List<AvaliacaoPsicogenetica>> relatorioTurmaBimestre(
            @PathVariable Long turmaId,
            @PathVariable Integer bimestre,
            @PathVariable Integer periodoLetivo) {

        return ResponseEntity.ok(relatorioService.relatorioPorTurmaEBimestre(turmaId, bimestre, periodoLetivo));
    }
    @GetMapping("/turma/{turmaId}/bimestre/{bimestre}/periodo/{periodoLetivo}/niveis")
    public ResponseEntity<List<EstatisticaNivel>> estatisticasPorNivel(
            @PathVariable Long turmaId,
            @PathVariable Integer bimestre,
            @PathVariable Integer periodoLetivo) {

        return ResponseEntity.ok(relatorioService.estatisticasPorNivel(turmaId, bimestre, periodoLetivo));
    }
}
