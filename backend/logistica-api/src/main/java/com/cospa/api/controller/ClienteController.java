package com.cospa.api.controller;

import com.cospa.api.model.Cliente;
import com.cospa.api.model.ClienteDocumento;
import com.cospa.api.repository.ClienteDocumentoRepository;
import com.cospa.api.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ClienteDocumentoRepository clienteDocumentoRepository;

    private final String UPLOAD_DIR = "uploads/clientes/";

    @GetMapping
    public ResponseEntity<List<Cliente>> listarTodos() {
        return ResponseEntity.ok(clienteRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Cliente> criar(@RequestBody Cliente cliente) {
        return ResponseEntity.ok(clienteRepository.save(cliente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> atualizar(@PathVariable Long id, @RequestBody Cliente dados) {
        return clienteRepository.findById(id).map(c -> {
            c.setNome(dados.getNome());
            c.setCnpjCpf(dados.getCnpjCpf());
            c.setRazaoSocial(dados.getRazaoSocial());
            c.setContato(dados.getContato());
            c.setTelefone(dados.getTelefone());
            c.setEmail(dados.getEmail());
            c.setObservacoes(dados.getObservacoes());
            c.setAtivo(dados.getAtivo());
            return ResponseEntity.ok(clienteRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!clienteRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        clienteRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Listar documentos do cliente (CNPJ / Contratos)
    @GetMapping("/{id}/documentos")
    public ResponseEntity<List<ClienteDocumento>> listarDocumentos(@PathVariable Long id) {
        return ResponseEntity.ok(clienteDocumentoRepository.findByClienteId(id));
    }

    // Upload de documento para o cliente
    @PostMapping("/{id}/documentos")
    public ResponseEntity<ClienteDocumento> uploadDocumento(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("tipo") String tipo) throws IOException {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        File pasta = new File(UPLOAD_DIR);
        if (!pasta.exists()) {
            pasta.mkdirs();
        }

        String nomeOriginal = file.getOriginalFilename();
        String extensao = "";
        if (nomeOriginal != null && nomeOriginal.contains(".")) {
            extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
        }
        String nomeUnico = UUID.randomUUID().toString() + extensao;
        Path destino = Paths.get(UPLOAD_DIR + nomeUnico);

        Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

        ClienteDocumento doc = new ClienteDocumento();
        doc.setCliente(cliente);
        doc.setTipo(tipo);
        doc.setNomeArquivo(nomeOriginal);
        doc.setUrlArquivo("/" + UPLOAD_DIR + nomeUnico);

        return ResponseEntity.ok(clienteDocumentoRepository.save(doc));
    }

    @DeleteMapping("/documentos/{docId}")
    public ResponseEntity<Void> deletarDocumento(@PathVariable Long docId) {
        return clienteDocumentoRepository.findById(docId).map(doc -> {
            try {
                Path path = Paths.get(doc.getUrlArquivo().substring(1));
                Files.deleteIfExists(path);
            } catch (Exception ignored) {}
            clienteDocumentoRepository.delete(doc);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}