package com.lunetras.dto;

import com.lunetras.model.NivelPsicogenetico;

public class EstatisticaNivel {
    private NivelPsicogenetico nivel;
    private Long quantidade;

    public EstatisticaNivel(NivelPsicogenetico nivel, Long quantidade) {
        this.nivel = nivel;
        this.quantidade = quantidade;
    }

    public NivelPsicogenetico getNivel() {
        return nivel;
    }

    public Long getQuantidade() {
        return quantidade;
    }
}

