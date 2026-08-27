import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { Title } from '@angular/platform-browser';

this.titleService.setTitle('Cospa LOG');
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  usuario: string = '';
  senha: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  onSubmit(): void {
    if (!this.usuario.trim() || !this.senha.trim()) {
      this.errorMessage = 'Preencha usuário e senha.';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.authService.login({ username: this.usuario.trim(), senha: this.senha }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/modules']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erro de autenticação retornado:', err);

        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Usuário ou senha incorretos.';
        } else if (err.status === 0) {
          this.errorMessage = 'Não foi possível conectar ao servidor (verifique sua conexão ou CORS).';
        } else {
          this.errorMessage = err.error?.mensagem || err.error?.message || 'Erro ao realizar login.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  onImgError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
  }
}