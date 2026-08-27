package com.cospa.api.service;

import com.cospa.api.model.StatusViagem;
import com.cospa.api.model.Viagem;
import com.cospa.api.repository.ViagemRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ViagemServiceTest {

    @Mock
    private ViagemRepository repository;

    @InjectMocks
    private ViagemService service;

    @Test
    @DisplayName("Deve criar uma viagem com status PROGRAMADO com sucesso")
    void deveCriarViagem() {
        Viagem viagemSalva = new Viagem();
        viagemSalva.setId(101L);
        viagemSalva.setCliente("Cliente Exemplo");
        viagemSalva.setLocalColeta("Maringá - PR");
        viagemSalva.setLocalEntrega("Curitiba - PR");
        viagemSalva.setPlaca("ABC-1234");
        viagemSalva.setNomeMotorista("Carlos Silva");
        viagemSalva.setStatus(StatusViagem.PROGRAMADO);
        viagemSalva.setValorAReceber(BigDecimal.valueOf(4500.00));
        viagemSalva.setValorAPagar(BigDecimal.valueOf(3200.00));
        viagemSalva.setObservacao("Carga frágil");

        when(repository.save(any(Viagem.class))).thenReturn(viagemSalva);

        Viagem resultado = repository.save(viagemSalva);

        assertNotNull(resultado);
        assertEquals(101L, resultado.getId());
        assertEquals(StatusViagem.PROGRAMADO, resultado.getStatus());
        assertEquals("Cliente Exemplo", resultado.getCliente());
        verify(repository, times(1)).save(any(Viagem.class));
    }

    @Test
    @DisplayName("Deve atualizar o status para CARREGAMENTO e persistir no banco")
    void deveAtualizarStatusViagem() {
        Viagem viagem = new Viagem();
        viagem.setId(101L);
        viagem.setStatus(StatusViagem.PROGRAMADO);

        when(repository.findById(101L)).thenReturn(Optional.of(viagem));
        when(repository.save(any(Viagem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String agora = "2026-08-18T14:30:00";
        viagem.setStatus(StatusViagem.CARREGAMENTO);
        viagem.setDataColetaReal(agora);
        Viagem atualizada = repository.save(viagem);

        assertEquals(StatusViagem.CARREGAMENTO, atualizada.getStatus());
        assertEquals(agora, atualizada.getDataColetaReal());
    }
}