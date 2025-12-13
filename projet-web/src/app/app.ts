import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/header/header';
import { FooterComponent } from './shared/footer/footer';
import { CartService } from './services/cart';
import { ProductService } from './services/product.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = 'makeup-ecommerce';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('App initialisé');
    console.log('CartService:', this.cartService);
    
    // Test direct
    this.testCart();
  }

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  async testCart() {
    try {
      const products = await this.productService.getAllProducts();
      if (products.length > 0) {
        console.log('Produit disponible pour test:', products[0]);
        
        // Test direct d'ajout
        this.cartService.addToCart(products[0], 1);
        console.log('Test panier effectué');
      }
    } catch (error) {
      console.error('Test panier échoué:', error);
    }
  }
}