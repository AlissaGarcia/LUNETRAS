package com.lunetras.controller;

import com.lunetras.model.AvaliacaoPsicogenetica;
import com.lunetras.service.AvaliacaoPsicogeneticaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/avaliacoes")
public class AvaliacaoPsicogeneticaController {
    private final AvaliacaoPsicogeneticaService avaliacaoService;

    public AvaliacaoPsicogeneticaController(
            AvaliacaoPsicogeneticaService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    @PostMapping
    public ResponseEntity<AvaliacaoPsicogenetica> criar(
            @RequestBody AvaliacaoPsicogenetica avaliacao) {

        AvaliacaoPsicogenetica criada =
                avaliacaoService.criar(avaliacao);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(criada);
    }
}
