import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ViagemService } from './viagem';
import { environment } from '../../../environments/environment';

describe('ViagemService', () => {
  let service: ViagemService;
  let httpMock: HttpTestingController;

  const baseUrl = environment.apiUrl.endsWith('/api') 
    ? `${environment.apiUrl}/viagens` 
    : `${environment.apiUrl}/api/viagens`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ViagemService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ViagemService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado com sucesso', () => {
    expect(service).toBeTruthy();
  });

  it('deve listar todas as viagens via GET', () => {
    const dummyViagens: any[] = [{ id: 1, cliente: 'TESTE' }];

    service.listarTodas().subscribe(viagens => {
      expect(viagens.length).toBe(1);
      expect(viagens).toEqual(dummyViagens);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(dummyViagens);
  });

  it('deve salvar uma nova viagem via POST', () => {
    const novaViagem = { id: 10, cliente: 'CLIENTE A' };

    service.salvar(novaViagem, false).subscribe(res => {
      expect(res).toEqual(novaViagem);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(novaViagem);
    req.flush(novaViagem);
  });

  it('deve atualizar viagem existente via PUT usando o idOriginal na rota', () => {
    const idOriginal = 10;
    const viagemAtualizada = { id: 20, cliente: 'CLIENTE ALTERADO' };

    service.salvar(viagemAtualizada, true, idOriginal).subscribe(res => {
      expect(res).toEqual(viagemAtualizada);
    });

    const req = httpMock.expectOne(`${baseUrl}/${idOriginal}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(viagemAtualizada);
    req.flush(viagemAtualizada);
  });
});