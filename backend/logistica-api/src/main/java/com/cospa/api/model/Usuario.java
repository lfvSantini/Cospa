package com.cospa.api.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Table(name = "usuarios")
@Entity(name = "Usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String login;
    private String username;
    private String senha;
    private String password;

    @Enumerated(EnumType.STRING)
    private PerfilUsuario perfil;

    // Métodos utilitários e compatibilidade
    public String getNome() {
        return this.nome != null ? this.nome : (this.username != null ? this.username : this.login);
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public PerfilUsuario getPerfil() {
        return this.perfil;
    }

    public void setPerfil(PerfilUsuario perfil) {
        this.perfil = perfil;
    }

    public String getSenha() {
        return this.senha != null ? this.senha : this.password;
    }

    public void setSenha(String senha) {
        this.senha = senha;
        this.password = senha;
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

    public void setUsername(String username) {
        this.username = username;
        this.login = username;
    }

    // Implementação dos métodos do Spring Security UserDetails
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.perfil != null) {
            return List.of(new SimpleGrantedAuthority("ROLE_" + this.perfil.name()));
        }
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return this.senha != null ? this.senha : this.password;
    }

    @Override
    public String getUsername() {
        return this.username != null ? this.username : this.login;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}