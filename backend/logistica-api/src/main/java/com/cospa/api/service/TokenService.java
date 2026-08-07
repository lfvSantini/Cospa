package com.cospa.api.service;

import com.cospa.api.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class TokenService {

    @Value("${api.security.token.secret:minha-chave-secreta-super-segura-com-no-minimo-32-caracteres}")
    private String secret;

    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String gerarToken(Usuario usuario) {
        try {
            return Jwts.builder()
                    .subject(usuario.getUsername())
                    .issuer("logistica-api")
                    .expiration(new Date(System.currentTimeMillis() + 8 * 3600 * 1000)) // 8 horas
                    .signWith(getSigningKey())
                    .compact();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar token JWT", e);
        }
    }

    public String validarToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return claims.getSubject();
        } catch (Exception e) {
            return "";
        }
    }
}