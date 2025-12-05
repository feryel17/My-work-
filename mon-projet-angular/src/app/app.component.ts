import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EtudiantComponent } from './etudiant/etudiant.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, EtudiantComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'project0';
  currentDate = new Date();
  message = 'Bonjour Angular !';
  messageVisible = false;

  // Définition des étudiants
  etudiant1 = {
    id: 1,
    nom: 'Dupont',
    prenom: 'Jean',
    age: 22,
    filiere: 'Informatique'
  };

  etudiant2 = {
    id: 2,
    nom: 'Martin',
    prenom: 'Marie',
    age: 21,
    filiere: 'Mathématiques'
  };

  etudiant3 = {
    id: 3,
    nom: 'Durand',
    prenom: 'Pierre',
    age: 23,
    filiere: 'Physique'
  };

  // Méthode pour afficher/masquer le message
  showMessage() {
    this.messageVisible = !this.messageVisible;
  }
}