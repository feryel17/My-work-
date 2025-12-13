import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService, RegisterData } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  formData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  errors = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  isLoading = signal(false);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async onSubmit() {
    // Réinitialiser les erreurs
    this.errors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    };

    // Validation
    let isValid = true;

    if (!this.formData.firstName.trim()) {
      this.errors.firstName = 'Le prénom est requis';
      isValid = false;
    }

    if (!this.formData.lastName.trim()) {
      this.errors.lastName = 'Le nom est requis';
      isValid = false;
    }

    if (!this.formData.email.trim()) {
      this.errors.email = 'L\'email est requis';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
      this.errors.email = 'Email invalide';
      isValid = false;
    }

    if (!this.formData.password) {
      this.errors.password = 'Le mot de passe est requis';
      isValid = false;
    } else if (this.formData.password.length < 6) {
      this.errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      isValid = false;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      this.errors.confirmPassword = 'Les mots de passe ne correspondent pas';
      isValid = false;
    }

    if (isValid) {
      this.isLoading.set(true);
      
      const registerData: RegisterData = {
        firstName: this.formData.firstName,
        lastName: this.formData.lastName,
        email: this.formData.email,
        password: this.formData.password,
        confirmPassword: this.formData.confirmPassword
      };
      
      try {
        console.log('🔄 Tentative d\'inscription pour:', registerData.email);
        await this.authService.register(registerData, '/login');
        console.log('✅ Inscription terminée avec succès');
      } catch (error: any) {
        console.error('❌ Erreur d\'inscription:', error);
        alert('Erreur d\'inscription: ' + (this.authService.errorMessage() || error.message));
      } finally {
        this.isLoading.set(false);
      }
    }
  }
}
