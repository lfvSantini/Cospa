import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { FinanceiroComponent } from './financeiro';
import { FinanceiroService } from '../../core/services/financeiro';

describe('FinanceiroComponent', () => {
  let component: FinanceiroComponent;
  let fixture: ComponentFixture<FinanceiroComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let financeiroServiceSpy: jasmine.SpyObj<FinanceiroService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    financeiroServiceSpy = jasmine.createSpyObj('FinanceiroService', [
      'listarContasReceber',
      'listarContasPagar',
      'listarLancamentos'
    ]);

    financeiroServiceSpy.listarContasReceber.and.returnValue(of([]));
    financeiroServiceSpy.listarContasPagar.and.returnValue(of([]));
    financeiroServiceSpy.listarLancamentos.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        FinanceiroComponent,
        HttpClientTestingModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: FinanceiroService, useValue: financeiroServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FinanceiroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve instanciar o componente com sucesso', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar por padrão na aba de Contas a Receber', () => {
    expect(component.activeTab).toBe('RECEBER');
  });

  it('deve alternar o tema entre dark e light', () => {
    const estadoInicial = component.isDarkMode;
    component.toggleTheme();
    expect(component.isDarkMode).toBe(!estadoInicial);
  });

  it('deve abrir e fechar a barra lateral', () => {
    expect(component.isSidebarOpen).toBeFalse();
    component.toggleSidebar();
    expect(component.isSidebarOpen).toBeTrue();
    component.closeSidebar();
    expect(component.isSidebarOpen).toBeFalse();
  });

  it('deve navegar de volta ao dashboard de viagens', () => {
    component.goToViagens();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('deve navegar para a seleção de módulos', () => {
    component.goToModules();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/modules']);
  });

  it('deve filtrar os itens de contas a receber pelo cliente', () => {
    const mockLista: any[] = [
      { id: '1', cliente: 'AMBEV S/A', operacao: '', numeroRota: '', status: '' },
      { id: '2', cliente: 'COCA COLA', operacao: '', numeroRota: '', status: '' }
    ];

    component.filtroReceber.cliente = 'AMBEV';
    const filtrados = component.filtrarReceber(mockLista);
    expect(filtrados.length).toBe(1);
    expect(filtrados[0].cliente).toBe('AMBEV S/A');

    component.filtroReceber.cliente = 'INEXISTENTE';
    const vazios = component.filtrarReceber(mockLista);
    expect(vazios.length).toBe(0);
  });

  it('deve alternar o menu de ações de uma linha', () => {
    const eventMock = new MouseEvent('click');
    spyOn(eventMock, 'stopPropagation');

    expect(component.openedActionMenuId).toBeNull();
    component.toggleRowActions(eventMock, '101');
    expect(component.openedActionMenuId).toBe('101');
    expect(eventMock.stopPropagation).toHaveBeenCalled();

    component.toggleRowActions(eventMock, '101');
    expect(component.openedActionMenuId).toBeNull();
  });
});