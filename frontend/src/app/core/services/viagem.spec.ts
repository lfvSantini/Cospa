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

  it('deve listar todas as viagens via GET incluindo numeroOperacional', () => {
    const dummyViagens: any[] = [
      { id: 83, numeroOperacional: '6848963', cliente: 'CLICK RODO' },
      { id: 84, numeroOperacional: '84', cliente: 'BULKY LOG' }
    ];

    service.listarTodas().subscribe(viagens => {
      expect(viagens.length).toBe(2);
      expect(viagens).toEqual(dummyViagens);
      expect(viagens[0].numeroOperacional).toBe('6848963');
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(dummyViagens);
  });

  it('deve salvar uma nova viagem via POST sem ID fixo e com numeroOperacional', () => {
    const novaViagem = { 
      numeroOperacional: '6848963', 
      numero_operacional: '6848963', 
      cliente: 'CLICK RODO' 
    };
    const viagemSalvaMock = { 
      id: 88, 
      numeroOperacional: '6848963', 
      numero_operacional: '6848963', 
      cliente: 'CLICK RODO' 
    };

    service.salvar(novaViagem, false).subscribe(res => {
      expect(res).toEqual(viagemSalvaMock);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(novaViagem);
    expect(req.request.body.id).toBeUndefined();
    req.flush(viagemSalvaMock);
  });

  it('deve atualizar viagem existente via PUT usando o idOriginal na rota e atualizando o numeroOperacional', () => {
    const idOriginal = 83;
    const viagemAtualizada = { 
      id: 83, 
      numeroOperacional: '6848963_ALTERADO', 
      numero_operacional: '6848963_ALTERADO', 
      cliente: 'CLICK RODO CDSP' 
    };

    service.salvar(viagemAtualizada, true, idOriginal).subscribe(res => {
      expect(res).toEqual(viagemAtualizada);
    });

    const req = httpMock.expectOne(`${baseUrl}/${idOriginal}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(viagemAtualizada);
    req.flush(viagemAtualizada);
  });
});