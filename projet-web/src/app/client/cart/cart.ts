import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss']
})
export class Cart implements OnInit {
  // Signaux
  cartItems = signal<CartItem[]>([]);
  isLoading = signal(true);
  promoCode = signal('');
  promoApplied = signal(false);
  promoDiscount = signal(0);
  
  // Calculs automatiques avec computed
  subtotal = computed(() => {
    return this.cartItems().reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0);
  });
  
  shipping = computed(() => {
    return this.subtotal() >= 50 ? 0 : 4.99;
  });
  
  total = computed(() => {
    return this.subtotal() + this.shipping() - this.promoDiscount();
  });

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.isLoading.set(true);
    
    // Récupérer les items du panier
    const items = this.cartService.getCartItems();
    this.cartItems.set(items);
    
    console.log('Panier chargé:', items); // Debug
    
    this.isLoading.set(false);
  }

  // Augmenter la quantité
  increaseQuantity(productId: string) {
    const items = this.cartItems();
    const item = items.find(i => i.productId === productId);
    if (item && item.quantity < item.product.stock) {
      this.cartService.updateQuantity(productId, item.quantity + 1);
      this.refreshCart();
    }
  }

  // Diminuer la quantité
  decreaseQuantity(productId: string) {
    const items = this.cartItems();
    const item = items.find(i => i.productId === productId);
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(productId, item.quantity - 1);
      this.refreshCart();
    }
  }

  // Mettre à jour la quantité manuellement
  updateQuantity(item: CartItem, event: Event) {
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value) || 1;
    
    if (newQuantity >= 1 && newQuantity <= item.product.stock) {
      this.cartService.updateQuantity(item.productId, newQuantity);
      this.refreshCart();
    } else {
      // Remettre la valeur précédente
      input.value = item.quantity.toString();
    }
  }

  // Retirer un produit
  removeFromCart(productId: string) {
    this.cartService.removeFromCart(productId);
    this.refreshCart();
  }

  // Vider le panier
  clearCart() {
    if (confirm('Vider tout le panier ?')) {
      this.cartService.clearCart();
      this.refreshCart();
    }
  }

  // Appliquer code promo
  applyPromo() {
    const code = this.promoCode().toUpperCase();
    
    if (code === 'MAKEUP10') {
      this.promoApplied.set(true);
      this.promoDiscount.set(this.subtotal() * 0.10); // 10% de réduction
    } else if (code === 'MAKEUP20') {
      this.promoApplied.set(true);
      this.promoDiscount.set(this.subtotal() * 0.20); // 20% de réduction
    } else if (code) {
      alert('Code promo invalide');
      return;
    }
    
    this.promoCode.set('');
  }

  // Obtenir l'image du produit
  getProductImage(product: any): string {
    if (product.images && product.images.length > 0 && product.images[0]) {
      let imagePath = product.images[0];
      
      // Si le chemin commence par assets mais pas par /, ajouter le /
      if (imagePath.startsWith('assets/') && !imagePath.startsWith('/')) {
        imagePath = '/' + imagePath;
      }
      
      return imagePath;
    }
    return this.getDefaultImageByCategory(product.category);
  }

  // Obtenir l'image par défaut selon la catégorie
  getDefaultImageByCategory(category: string): string {
    switch(category) {
      case 'face': return '/assets/images/products/fond-de-teint.jpg';
      case 'eyes': return '/assets/images/products/mascara.jpg';
      case 'lips': return '/assets/images/products/rouge-levres.jpg';
      case 'brows': return '/assets/images/products/palette.jpg';
      default: return '/assets/images/products/rouge-levres.jpg';
    }
  }

  // Aller au checkout
  goToCheckout() {
    if (this.cartItems().length === 0) {
      alert('Votre panier est vide');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  // Continuer les achats
  continueShopping() {
    this.router.navigate(['/products']);
  }

  // Rafraîchir le panier
  private refreshCart() {
    const items = this.cartService.getCartItems();
    this.cartItems.set(items);
  }

  // Format prix
  formatPrice(price: number): string {
    return price.toFixed(2) + ' DT';
  }

  // Total pour un item
  getItemTotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }
}