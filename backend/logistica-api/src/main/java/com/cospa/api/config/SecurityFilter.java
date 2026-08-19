package com.cospa.api.config;

import com.cospa.api.repository.UsuarioRepository;
import com.cospa.api.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Libera imediatamente requisições OPTIONS de preflight para evitar quebra de CORS
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        var uri = request.getRequestURI();
        // Não valida token em rotas públicas
        if (uri.contains("/auth/login") || uri.contains("/swagger-ui") || uri.contains("/v3/api-docs")) {
            filterChain.doFilter(request, response);
            return;
        }

        var token = recuperarToken(request);
        if (token != null) {
            try {
                var login = tokenService.validarToken(token);
                if (login != null && !login.isBlank()) {
                    var usuarioOptional = usuarioRepository.findByUsername(login);
                    if (usuarioOptional.isEmpty()) {
                        usuarioOptional = usuarioRepository.findByLogin(login);
                    }

                    if (usuarioOptional.isPresent()) {
                        var usuario = usuarioOptional.get();
                        var authorities = (usuario instanceof UserDetails userDetails)
                                ? userDetails.getAuthorities()
                                : List.of(new SimpleGrantedAuthority("ROLE_USER"));

                        var authentication = new UsernamePasswordAuthenticationToken(usuario, null, authorities);
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            } catch (Exception e) {
                // Token inválido ou expirado: apenas não autentica o contexto
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        var authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.replace("Bearer ", "").trim();
        }
        return null;
    }
}