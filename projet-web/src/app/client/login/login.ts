import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService, LoginData } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit {
  // Données du formulaire
  loginData = signal<LoginData>({
    email: '',
    password: '',
    rememberMe: false
  });

  // États
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  returnUrl: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Récupérer l'URL de retour si elle existe
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
    
    // Vérifier si déjà connecté
    if (this.authService.isAuthenticated()) {
      // Rediriger selon le rôle ou vers returnUrl
      if (this.returnUrl) {
        this.router.navigateByUrl(this.returnUrl);
      } else if (this.authService.isAdmin()) {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/profile']);
      }
      return;
    }
    
    // Charger l'email sauvegardé si "Se souvenir de moi"
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      this.loginData.update(data => ({...data, email: savedEmail, rememberMe: true}));
    }
  }

  // Connexion
  async onSubmit(): Promise<void> {
    // Validation
    if (!this.loginData().email || !this.loginData().password) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.login(this.loginData());
      
      // Sauvegarder l'email si "Se souvenir de moi"
      if (this.loginData().rememberMe) {
        localStorage.setItem('savedEmail', this.loginData().email);
      } else {
        localStorage.removeItem('savedEmail');
      }
      
      // Redirection intelligente
      if (this.returnUrl) {
        // Rediriger vers la page demandée
        this.router.navigateByUrl(this.returnUrl);
      } else if (this.authService.isAdmin()) {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/profile']);
      }
      
    } catch (error) {
      // L'erreur est gérée dans le service
      this.errorMessage.set(this.authService.errorMessage());
    } finally {
      this.isLoading.set(false);
    }
  }

  // Basculer affichage mot de passe
  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  // Réinitialisation mot de passe
  async resetPassword(): Promise<void> {
    const email = this.loginData().email;
    
    if (!email) {
      this.errorMessage.set('Veuillez entrer votre email.');
      return;
    }

    if (confirm(`Envoyer un email de réinitialisation à ${email} ?`)) {
      await this.authService.resetPassword(email);
    }
  }

  // Connexion rapide (démo)
  quickLogin(role: 'admin' | 'user'): void {
    if (role === 'admin') {
      this.loginData.set({
        email: 'admin@makeupstore.com',
        password: 'admin123',
        rememberMe: false
      });
    } else {
      this.loginData.set({
        email: 'client@example.com',
        password: 'client123',
        rememberMe: false
      });
    }
  }
}