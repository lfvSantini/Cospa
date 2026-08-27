package com.cospa.api.controller;

import com.cospa.api.dto.LoginRequestDTO;
import com.cospa.api.dto.TokenResponseDTO;
import com.cospa.api.dto.UsuarioRequestDTO;
import com.cospa.api.model.PerfilUsuario;
import com.cospa.api.model.Usuario;
import com.cospa.api.repository.UsuarioRepository;
import com.cospa.api.service.TokenService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, TokenService tokenService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequestDTO dto) {
        var usuarioOptional = usuarioRepository.findByUsername(dto.username());

        if (usuarioOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário ou senha inválidos");
        }

        Usuario usuario = usuarioOptional.get();

        if (!passwordEncoder.matches(dto.senha(), usuario.getSenha())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário ou senha inválidos");
        }

        String token = tokenService.gerarToken(usuario);
        return ResponseEntity.ok(new TokenResponseDTO(token));
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody @Valid UsuarioRequestDTO dto) {
        if (usuarioRepository.findByUsername(dto.username()).isPresent()) {
            return ResponseEntity.badRequest().body("Username já em uso.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.nome());
        usuario.setUsername(dto.username());
        usuario.setSenha(passwordEncoder.encode(dto.senha()));
        usuario.setPerfil(dto.perfil() != null ? dto.perfil() : PerfilUsuario.ADMIN);

        usuarioRepository.save(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body("Usuário " + dto.username() + " cadastrado com sucesso!");
    }
}