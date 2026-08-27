import { TestBed } from '@angular/core/testing';
import { Viagem } from './viagem';

describe('Viagem', () => {
  let service: Viagem;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Viagem);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
