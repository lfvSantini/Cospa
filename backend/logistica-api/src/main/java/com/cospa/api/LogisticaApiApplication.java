package com.cospa.api;

import com.cospa.api.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class LogisticaApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(LogisticaApiApplication.class, args);
    }

    // Código que atualiza a senha do admin usando o próprio BCrypt do Spring ao iniciar
    /*
    @Bean
    public CommandLineRunner resetarSenhaAdmin(UsuarioRepository repository, PasswordEncoder encoder) {
        return args -> {
            repository.findByUsername("admin").ifPresent(usuario -> {
                usuario.setSenha(encoder.encode("123456"));
                repository.save(usuario);
            });
        };
    }
    */
}