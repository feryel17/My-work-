import { Injectable, signal } from '@angular/core';
import { Product } from './product.service';

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  addedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Signal pour les items du panier
  private cartItems = signal<CartItem[]>(this.loadCartFromStorage());
  
  // Observables publics
  items = this.cartItems.asReadonly();
  itemCount = signal(0);
  totalPrice = signal(0);

  itemCount$ = this.itemCount.asReadonly();
  constructor() {
    // Mettre à jour les compteurs quand le panier change
    this.updateCartSummary();
  }

  // Charger depuis le localStorage
  private loadCartFromStorage(): CartItem[] {
    try {
      const savedCart = localStorage.getItem('makeup_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        // Convertir les dates string en objets Date
        return parsed.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
    }
    return [];
  }

  // Sauvegarder dans le localStorage
  private saveCartToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem('makeup_cart', JSON.stringify(items));
      this.cartItems.set(items);
      this.updateCartSummary();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du panier:', error);
    }
  }

  // Mettre à jour les totaux
  private updateCartSummary(): void {
    const items = this.cartItems();
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0);
    
    this.itemCount.set(count);
    this.totalPrice.set(total);
  }

  // Ajouter au panier
  addToCart(product: Product, quantity: number = 1): void {
    const items = [...this.cartItems()];
    const existingItemIndex = items.findIndex(item => item.productId === product.id);

    if (existingItemIndex >= 0) {
      // Mettre à jour la quantité
      items[existingItemIndex].quantity += quantity;
    } else {
      // Ajouter un nouvel item
      items.push({
        productId: product.id!,
        product: product,
        quantity: quantity,
        addedAt: new Date()
      });
    }

    this.saveCartToStorage(items);
  }
  

  // Retirer du panier
  removeFromCart(productId: string): void {
    const items = this.cartItems().filter(item => item.productId !== productId);
    this.saveCartToStorage(items);
  }

  // Mettre à jour la quantité
  updateQuantity(productId: string, quantity: number): void {
    if (quantity < 1) {
      this.removeFromCart(productId);
      return;
    }

    const items = [...this.cartItems()];
    const itemIndex = items.findIndex(item => item.productId === productId);
    
    if (itemIndex >= 0) {
      items[itemIndex].quantity = quantity;
      this.saveCartToStorage(items);
    }
  }

  // Vider le panier
  clearCart(): void {
    this.saveCartToStorage([]);
  }

  // Obtenir un item par ID
  getItem(productId: string): CartItem | undefined {
    return this.cartItems().find(item => item.productId === productId);
  }

  // Vérifier si un produit est dans le panier
  isInCart(productId: string): boolean {
    return this.cartItems().some(item => item.productId === productId);
  }

  // Calculer le total pour un produit
  getItemTotal(productId: string): number {
    const item = this.getItem(productId);
    return item ? item.product.price * item.quantity : 0;
  }
  getCartItems(): CartItem[] {
  return this.cartItems();
}
}