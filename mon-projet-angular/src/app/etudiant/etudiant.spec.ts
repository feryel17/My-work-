import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EtudiantComponent } from './etudiant.component';  // ← CHEMIN CORRIGÉ

describe('EtudiantComponent', () => {  // ← NOM CORRIGÉ
  let component: EtudiantComponent;    // ← TYPE CORRIGÉ
  let fixture: ComponentFixture<EtudiantComponent>;  // ← TYPE CORRIGÉ

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtudiantComponent]  // ← IMPORT DU COMPOSANT STANDALONE
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtudiantComponent);  // ← COMPOSANT CORRECT
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Tests supplémentaires
  it('should have default student data', () => {
    expect(component.etudiant).toBeDefined();
    expect(component.etudiant.nom).toBe('Non spécifié');
    expect(component.etudiant.prenom).toBe('Non spécifié');
  });

  it('should accept student input', () => {
    const testEtudiant = {
      id: 100,
      nom: 'Test',
      prenom: 'Élève',
      age: 25,
      filiere: 'Test'
    };
    
    component.etudiant = testEtudiant;
    fixture.detectChanges();
    
    expect(component.etudiant.id).toBe(100);
    expect(component.etudiant.nom).toBe('Test');
  });
});