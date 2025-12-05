import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-etudiant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './etudiant.component.html',
  styleUrls: ['./etudiant.component.css']
})
export class EtudiantComponent {
  @Input() etudiant: any = {
    id: 0,
    nom: 'Non spécifié',
    prenom: 'Non spécifié',
    age: 0,
    filiere: 'Non spécifiée'
  };
}