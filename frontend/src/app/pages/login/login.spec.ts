import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { LoginComponent } from './login';
import { AuthService } from '../../core/services/auth';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve instanciar o componente com sucesso', () => {
    expect(component).toBeTruthy();
  });

  it('deve possuir a variável de versão definida', () => {
    expect(component.appVersion).toBeDefined();
    expect(component.appVersion).toContain('v');
  });

  it('deve exibir mensagem de validação ao submeter campos vazios', () => {
    component.usuario = '';
    component.senha = '';
    component.onSubmit();
    expect(component.errorMessage).toBe('Preencha usuário e senha.');
  });
});