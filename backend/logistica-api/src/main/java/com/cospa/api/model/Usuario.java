package com.cospa.api.model;

import jakarta.persistence.*;
import lombok.*;

@Table(name = "usuarios")
@Entity(name = "Usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String login;
    private String username;
    private String senha;
    private String password;

    // Métodos manuais para compatibilidade garantida
    public String getSenha() {
        return this.senha != null ? this.senha : this.password;
    }

    public void setSenha(String senha) {
        this.senha = senha;
        this.password = senha;
    }

    public String getPassword() {
        return this.password != null ? this.password : this.senha;
    }

    public void setPassword(String password) {
        this.password = password;
        this.senha = password;
    }

    public String getLogin() {
        return this.login != null ? this.login : this.username;
    }

    public void setLogin(String login) {
        this.login = login;
        this.username = login;
    }

    public String getUsername() {
        return this.username != null ? this.username : this.login;
    }

    public void setUsername(String username) {
        this.username = username;
        this.login = username;
    }
}