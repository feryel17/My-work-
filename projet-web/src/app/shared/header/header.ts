import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartCount = 0;
  showCategories = false;
  showAccount = false;
  showMobileMenu = false;
  showMobileCategories = false;
  isLoggedIn = false;
  
  // Interval pour vérifier les mises à jour du panier
  private cartInterval: any;

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.updateCartCount();
    
    // Vérifier régulièrement les mises à jour du panier et le statut de connexion
    this.cartInterval = setInterval(() => {
      this.updateCartCount();
      this.checkLoginStatus();
    }, 2000);
    
    // Fermer les menus en cliquant à l'extérieur
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  isHomePage(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }

  ngOnDestroy(): void {
    if (this.cartInterval) {
      clearInterval(this.cartInterval);
    }
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  // Gestion du clic à l'extérieur des menus
  handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown') && !target.closest('.menu-toggle')) {
      this.showCategories = false;
      this.showAccount = false;
    }
  }

  // Vérifier le statut de connexion
  checkLoginStatus(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
  }

  // Méthodes pour les catégories
  toggleCategories(): void {
    console.log('Toggling categories. Current state:', this.showCategories);
    this.showCategories = !this.showCategories;
    if (this.showCategories) {
      this.showAccount = false;
    }
  }

  hideCategories(): void {
    this.showCategories = false;
  }

  // Méthodes pour le compte
  toggleAccount(): void {
    this.showAccount = !this.showAccount;
    if (this.showAccount) {
      this.showCategories = false;
    }
  }

  hideAccount(): void {
    this.showAccount = false;
  }

  // Méthodes pour le menu mobile
  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  hideMobileMenu(): void {
    this.showMobileMenu = false;
    this.showMobileCategories = false;
  }

  toggleMobileCategories(): void {
    this.showMobileCategories = !this.showMobileCategories;
  }

  // Mettre à jour le compteur panier
  updateCartCount(): void {
    try {
      const cartItems = JSON.parse(localStorage.getItem('makeup_cart') || '[]');
      this.cartCount = cartItems.reduce((total: number, item: any) => total + (item.quantity || 0), 0);
    } catch (error) {
      console.error('Erreur lors de la lecture du panier:', error);
      this.cartCount = 0;
    }
  }

  // Déconnexion
  async logout(): Promise<void> {
    await this.authService.logout();
    this.isLoggedIn = false;
  }

  // Navigation rapide vers le panier
  goToCart(): void {
    this.router.navigate(['/cart']);
  }
  goToLogin(): void {
  console.log('Navigating to login...');
  this.router.navigate(['/login']).then(success => {
    console.log('Navigation successful?', success);
  });
}
}