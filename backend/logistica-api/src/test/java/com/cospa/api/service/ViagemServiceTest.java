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
                null,                   // 1: id (Long)
                "Cliente Exemplo",      // 2: cliente (String)
                "Maringá - PR",         // 3: localColeta (String)
                "Curitiba - PR",        // 4: localEntrega (String)
                "ABC-1234",             // 5: placa (String)
                "Carlos Silva",         // 6: nomeMotorista (String)
                "123.456.789-00",       // 7: cpfMotorista (String) -> NOVO
                null,                   // 8: dataColetaPrevista (LocalDateTime) -> NOVO
                null,                   // 9: dataColetaReal (LocalDateTime) -> NOVO
                null,                   // 10: dataEntregaPrevista (LocalDateTime) -> NOVO
                null,                   // 11: dataEntregaReal (LocalDateTime) -> NOVO
                StatusViagem.CRIADA,    // 12: status (StatusViagem)
                "Carga frágil"          // 13: observacao (String)
        );

        Viagem viagemSalva = new Viagem();
        viagemSalva.setId(1L);
        viagemSalva.setCliente(request.cliente());
        viagemSalva.setLocalColeta(request.localColeta());
        viagemSalva.setLocalEntrega(request.localEntrega());
        viagemSalva.setPlaca(request.placa());
        viagemSalva.setNomeMotorista(request.nomeMotorista());
        viagemSalva.setCpfMotorista(request.cpfMotorista());
        viagemSalva.setStatus(StatusViagem.CRIADA);
        viagemSalva.setObservacao(request.observacao());

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