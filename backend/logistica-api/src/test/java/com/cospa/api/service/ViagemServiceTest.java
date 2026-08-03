package com.cospa.api.service;

import com.cospa.api.dto.ViagemRequestDTO;
import com.cospa.api.dto.ViagemResponseDTO;
import com.cospa.api.model.StatusViagem;
import com.cospa.api.model.Viagem;
import com.cospa.api.repository.ViagemRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
    @DisplayName("Deve criar uma viagem com status CRIADA com sucesso")
    void deveCriarViagem() {
        ViagemRequestDTO request = new ViagemRequestDTO(
                "Maringá - PR",
                "Curitiba - PR",
                "Carlos Silva",
                "TransLog",
                "Carga frágil"
        );

        Viagem viagemSalva = new Viagem();
        viagemSalva.setId(1L);
        viagemSalva.setLocalColeta(request.localColeta());
        viagemSalva.setLocalEntrega(request.localEntrega());
        viagemSalva.setNomeMotorista(request.nomeMotorista());
        viagemSalva.setTransportadora(request.transportadora());
        viagemSalva.setStatus(StatusViagem.CRIADA);

        when(repository.save(any(Viagem.class))).thenReturn(viagemSalva);

        ViagemResponseDTO response = service.salvar(request);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals(StatusViagem.CRIADA, response.status());
        verify(repository, times(1)).save(any(Viagem.class));
    }

    @Test
    @DisplayName("Deve atualizar o status para EM_CARREGAMENTO e registrar o horário de início")
    void deveAtualizarStatusECadastrarHorario() {
        Viagem viagem = new Viagem();
        viagem.setId(1L);
        viagem.setStatus(StatusViagem.CRIADA);

        when(repository.findById(1L)).thenReturn(Optional.of(viagem));
        when(repository.save(any(Viagem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ViagemResponseDTO response = service.atualizarStatus(1L, StatusViagem.EM_CARREGAMENTO);

        assertEquals(StatusViagem.EM_CARREGAMENTO, response.status());
        assertNotNull(viagem.getInicioCarregamento());
    }
}