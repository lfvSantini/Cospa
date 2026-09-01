package com.cospa.api.controller;

import com.cospa.api.model.Motorista;
import com.cospa.api.model.Veiculo;
import com.cospa.api.model.VeiculoDocumento;
import com.cospa.api.repository.MotoristaRepository;
import com.cospa.api.repository.VeiculoDocumentoRepository;
import com.cospa.api.repository.VeiculoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/veiculos")
@CrossOrigin(
        origins = "*",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class VeiculoController {

    private static final Logger log = LoggerFactory.getLogger(VeiculoController.class);

    @Autowired
    private VeiculoRepository repository;

    @Autowired
    private VeiculoDocumentoRepository veiculoDocumentoRepository;

    @Autowired
    private MotoristaRepository motoristaRepository;

    @Value("${app.upload.dir:/app/uploads}")
    private String uploadDirConfig;

    private Path getUploadPath() {
        Path path = Paths.get(uploadDirConfig).toAbsolutePath().normalize();
        if (!Files.exists(path)) {
            try {
                Files.createDirectories(path);
            } catch (Exception e) {
                path = Paths.get(System.getProperty("user.dir"), "uploads").toAbsolutePath().normalize();
                try {
                    Files.createDirectories(path);
                } catch (Exception ignored) {}
            }
        }
        return path;
    }

    private String getMapString(Map<String, Object> map, String key, String defaultValue) {
        if (map == null || !map.containsKey(key) || map.get(key) == null) {
            return defaultValue;
        }
        String val = String.valueOf(map.get(key)).trim();
        return val.isEmpty() ? defaultValue : val;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> listarTodos() {
        try {
            List<Veiculo> veiculos = repository.findAll();
            return ResponseEntity.ok(veiculos);
        } catch (Exception e) {
            log.error("Erro ao listar veiculos: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar veiculos: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Veiculo> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/motoristas")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Motorista>> listarMotoristasDoVeiculo(@PathVariable Long id) {
        return repository.findById(id)
                .map(veiculo -> ResponseEntity.ok(veiculo.getMotoristas()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody Map<String, Object> payload) {
        try {
            String placa = getMapString(payload, "placa", "");
            if (placa.isBlank()) {
                return ResponseEntity.badRequest().body("A placa do veículo é obrigatória.");
            }

            String placaFormatada = placa.toUpperCase();
            if (repository.findByPlaca(placaFormatada).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Placa " + placaFormatada + " já cadastrada no sistema.");
            }

            Veiculo veiculo = new Veiculo();
            veiculo.setPlaca(placaFormatada);
            veiculo.setTipoVeiculo(getMapString(payload, "tipoVeiculo", "Truck"));
            veiculo.setTipoCarroceria(getMapString(payload, "tipoCarroceria", "Bau Seco"));
            veiculo.setAdicional(getMapString(payload, "adicional", ""));
            veiculo.setNumeroEixos(getMapString(payload, "numeroEixos", ""));
            veiculo.setCubagemBau(getMapString(payload, "cubagemBau", ""));
            veiculo.setCapacidadePeso(getMapString(payload, "capacidadePeso", ""));
            veiculo.setNumeroPaletes(getMapString(payload, "numeroPaletes", ""));
            veiculo.setAnoFabricacao(getMapString(payload, "anoFabricacao", ""));
            veiculo.setDataVencimento(getMapString(payload, "dataVencimento", ""));
            veiculo.setFornecedor(getMapString(payload, "fornecedor", "Sem Agência (Frota Própria)"));
            veiculo.setNumeroAntt(getMapString(payload, "numeroAntt", ""));
            veiculo.setTipoRastreador(getMapString(payload, "tipoRastreador", ""));
            veiculo.setSituacao(getMapString(payload, "situacao", "ATIVO"));

            Veiculo salvo = repository.save(veiculo);
            return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Placa já existente no banco de dados.");
        } catch (Exception e) {
            log.error("Erro ao cadastrar veiculo: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao salvar veiculo no banco: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return repository.findById(id).map(veiculo -> {
            String placa = getMapString(payload, "placa", "");
            if (!placa.isBlank()) {
                String placaFormatada = placa.toUpperCase();
                repository.findByPlaca(placaFormatada).ifPresent(outro -> {
                    if (!outro.getId().equals(id)) {
                        throw new IllegalArgumentException("Placa já vinculada a outro veículo.");
                    }
                });
                veiculo.setPlaca(placaFormatada);
            }
            veiculo.setTipoVeiculo(getMapString(payload, "tipoVeiculo", veiculo.getTipoVeiculo()));
            veiculo.setTipoCarroceria(getMapString(payload, "tipoCarroceria", veiculo.getTipoCarroceria()));
            veiculo.setAdicional(getMapString(payload, "adicional", ""));
            veiculo.setNumeroEixos(getMapString(payload, "numeroEixos", ""));
            veiculo.setCubagemBau(getMapString(payload, "cubagemBau", ""));
            veiculo.setCapacidadePeso(getMapString(payload, "capacidadePeso", ""));
            veiculo.setNumeroPaletes(getMapString(payload, "numeroPaletes", ""));
            veiculo.setAnoFabricacao(getMapString(payload, "anoFabricacao", ""));
            veiculo.setDataVencimento(getMapString(payload, "dataVencimento", ""));
            veiculo.setFornecedor(getMapString(payload, "fornecedor", "Sem Agência (Frota Própria)"));
            veiculo.setNumeroAntt(getMapString(payload, "numeroAntt", ""));
            veiculo.setTipoRastreador(getMapString(payload, "tipoRastreador", ""));
            veiculo.setSituacao(getMapString(payload, "situacao", "ATIVO"));
            return ResponseEntity.ok(repository.save(veiculo));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/{id}/documentos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocumento(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "nome", required = false) String nome,
            @RequestParam(value = "descricao", required = false) String descricao,
            @RequestParam(value = "tipo", required = false) String tipo) {

        return repository.findById(id).map(veiculo -> {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("Arquivo vazio.");
            }

            try {
                String tipoDocFinal = (descricao != null && !descricao.isBlank()) ? descricao :
                        (nome != null && !nome.isBlank()) ? nome :
                                (tipo != null && !tipo.isBlank()) ? tipo : "Documento Veículo";

                String extensao = "";
                String nomeOriginal = file.getOriginalFilename();
                if (nomeOriginal != null && nomeOriginal.contains(".")) {
                    extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
                }

                String nomeArquivo = "veiculo_" + id + "_" + UUID.randomUUID().toString().substring(0, 8) + extensao;
                Path uploadFolder = getUploadPath();
                Path destino = uploadFolder.resolve(nomeArquivo).normalize();

                Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

                String urlRelativa = "/uploads/" + nomeArquivo;

                VeiculoDocumento doc = new VeiculoDocumento();
                doc.setDescricao(tipoDocFinal.toUpperCase());
                doc.setUrl(urlRelativa);
                doc.setNomeArquivo(nomeOriginal != null ? nomeOriginal : nomeArquivo);
                doc.setDataEnvio(LocalDateTime.now());
                doc.setVeiculo(veiculo);

                if (veiculo.getDocumentos() == null) {
                    veiculo.setDocumentos(new ArrayList<>());
                }
                veiculo.getDocumentos().add(doc);

                VeiculoDocumento salvo = veiculoDocumentoRepository.save(doc);
                repository.save(veiculo);

                return ResponseEntity.ok(salvo);
            } catch (Exception e) {
                log.error("Erro ao salvar documento do veiculo {}: ", id, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Erro ao processar documento: " + e.getMessage());
            }
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/documentos/{docId}")
    public ResponseEntity<Void> deletarDocumento(@PathVariable Long docId) {
        return veiculoDocumentoRepository.findById(docId).map(doc -> {
            try {
                if (doc.getUrl() != null) {
                    String nomeArquivo = doc.getUrl().substring(doc.getUrl().lastIndexOf('/') + 1);
                    Path arquivoFisico = getUploadPath().resolve(nomeArquivo);
                    Files.deleteIfExists(arquivoFisico);
                }
            } catch (Exception ignored) {}

            veiculoDocumentoRepository.delete(doc);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{veiculoId}/motoristas/{motoristaId}")
    public ResponseEntity<?> vincularMotorista(@PathVariable Long veiculoId, @PathVariable Long motoristaId) {
        return repository.findById(veiculoId).map(veiculo -> {
            return motoristaRepository.findById(motoristaId).map(motorista -> {
                if (!motorista.getVeiculos().contains(veiculo)) {
                    motorista.getVeiculos().add(veiculo);
                    motoristaRepository.save(motorista);
                }
                return ResponseEntity.ok(veiculo);
            }).orElse(ResponseEntity.notFound().build());
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{veiculoId}/motoristas/{motoristaId}")
    public ResponseEntity<Void> desvincularMotorista(@PathVariable Long veiculoId, @PathVariable Long motoristaId) {
        return repository.findById(veiculoId).map(veiculo -> {
            return motoristaRepository.findById(motoristaId).map(motorista -> {
                motorista.getVeiculos().removeIf(v -> v.getId().equals(veiculoId));
                motoristaRepository.save(motorista);
                return ResponseEntity.noContent().<Void>build();
            }).orElse(ResponseEntity.notFound().build());
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}