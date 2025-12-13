import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { OrderService, Order, OrderItem } from '../../services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit {
  cartItems = signal<CartItem[]>([]);
  checkoutForm!: FormGroup;
  paymentMethod = signal('card');
  acceptTerms = signal(false);
  isProcessing = signal(false);

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
    this.initForm();
    this.prefillUserData();
  }

  loadCart() {
    const items = this.cartService.getCartItems();
    this.cartItems.set(items);
    
    if (items.length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  prefillUserData() {
    const userData = this.authService.currentUserData();
    if (userData) {
      this.checkoutForm.patchValue({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email
      });
    }
  }

  initForm() {
    this.checkoutForm = this.fb.group({
      // Informations personnelles
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      
      // Adresse de livraison
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{4}$/)]],
      country: ['Tunis', Validators.required],
      
      // Informations de paiement (pour carte)
      cardNumber: ['', [Validators.pattern(/^[0-9]{16}$/)]],
      cardName: ['', [Validators.minLength(3)]],
      cardExpiry: ['', [Validators.pattern(/^(0[1-9]|1[0-2])\/[0-9]{2}$/)]],
      cardCVV: ['', [Validators.pattern(/^[0-9]{3}$/)]],
      
      // Notes
      notes: ['']
    });
  }

  getSubtotal(): number {
    return this.cartItems().reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0);
  }

  getShipping(): number {
    return this.getSubtotal() >= 50 ? 0 : 4.99;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping();
  }

  selectPaymentMethod(method: string) {
    this.paymentMethod.set(method);
    
    // Mettre à jour les validateurs selon le mode de paiement
    const cardFields = ['cardNumber', 'cardName', 'cardExpiry', 'cardCVV'];
    
    if (method === 'card') {
      cardFields.forEach(field => {
        this.checkoutForm.get(field)?.setValidators([Validators.required]);
        this.checkoutForm.get(field)?.updateValueAndValidity();
      });
    } else {
      cardFields.forEach(field => {
        this.checkoutForm.get(field)?.clearValidators();
        this.checkoutForm.get(field)?.updateValueAndValidity();
      });
    }
  }

  processOrder() {
    if (!this.checkoutForm.valid) {
      Object.keys(this.checkoutForm.controls).forEach(key => {
        const control = this.checkoutForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    if (!this.acceptTerms()) {
      alert('Veuillez accepter les conditions générales de vente');
      return;
    }

    this.isProcessing.set(true);

    // Créer la commande
    const userData = this.authService.currentUserData();
    const formValue = this.checkoutForm.value;
    
    console.log('📋 === PRÉPARATION COMMANDE ===');
    console.log('userData complet:', userData);
    console.log('userData?.uid:', userData?.uid);
    
    const orderItems: OrderItem[] = this.cartItems().map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.images[0] || '',
      price: item.product.price,
      quantity: item.quantity
    }));
    
    console.log('📦 Items de la commande:', orderItems.length, 'article(s)');
    
    const order: Omit<Order, 'id'> = {
      userId: userData?.uid || 'guest',
      userEmail: formValue.email,
      userName: `${formValue.firstName} ${formValue.lastName}`,
      items: orderItems,
      totalAmount: this.getTotal(),
      shippingAddress: {
        fullName: `${formValue.firstName} ${formValue.lastName}`,
        address: formValue.address,
        city: formValue.city,
        postalCode: formValue.postalCode,
        phone: formValue.phone
      },
      paymentMethod: this.paymentMethod(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('💾 userId utilisé:', order.userId);
    console.log('📤 Commande finale:', JSON.stringify(order));

    // Enregistrer dans Firebase
    this.orderService.createOrder(order).then(orderId => {
      console.log('✅ Commande créée avec succès ID:', orderId);
      console.log('✅ userId sauvegardé:', order.userId);
      this.isProcessing.set(false);
      alert('✅ Commande confirmée ! Merci pour votre achat.\nVous pouvez consulter vos commandes dans "Mon Compte".');
      this.cartService.clearCart();
      this.router.navigate(['/profile']);
    }).catch(error => {
      console.error('❌ Erreur création commande:', error);
      this.isProcessing.set(false);
      alert('❌ Erreur lors de la création de la commande. Veuillez réessayer.');
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.checkoutForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (control?.hasError('email')) {
      return 'Email invalide';
    }
    if (control?.hasError('minLength')) {
      return 'Trop court';
    }
    if (control?.hasError('pattern')) {
      if (fieldName === 'phone') return 'Format: 20123456';
      if (fieldName === 'postalCode') return 'Format: 2045';
      if (fieldName === 'cardNumber') return 'Format: 16 chiffres';
      if (fieldName === 'cardExpiry') return 'Format: MM/AA';
      if (fieldName === 'cardCVV') return 'Format: 3 chiffres';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.checkoutForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

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
}
