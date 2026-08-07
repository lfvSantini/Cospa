package com.cospa.api.service;

import com.cospa.api.dto.LoginRequestDTO;
import com.cospa.api.dto.TokenResponseDTO;
import com.cospa.api.model.Usuario;
import com.cospa.api.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AutenticacaoService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AutenticacaoService(UsuarioRepository usuarioRepository, 
                               PasswordEncoder passwordEncoder, 
                               TokenService tokenService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    public TokenResponseDTO autenticar(LoginRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByUsername(dto.username())
                .orElseThrow(() -> new RuntimeException("Usuário ou senha inválidos"));

        if (!passwordEncoder.matches(dto.senha(), usuario.getSenha())) {
            throw new RuntimeException("Usuário ou senha inválidos");
        }

        String token = tokenService.gerarToken(usuario);
        return new TokenResponseDTO(token, "Bearer");
    }
}