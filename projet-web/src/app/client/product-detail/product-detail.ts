import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss']
})
export class ProductDetail implements OnInit {
  // Signaux
  product = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  selectedImageIndex = signal(0);
  quantity = signal(1);
  isLoading = signal(true);
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadProduct();
  }

  async loadProduct() {
    this.isLoading.set(true);
    const productId = this.route.snapshot.paramMap.get('id');
    
    if (!productId) {
      this.router.navigate(['/products']);
      return;
    }

    try {
      // 1. Récupérer tous les produits
      const allProducts = await this.productService.getAllProducts();
      
      // 2. Trouver le produit spécifique
      const product = allProducts.find(p => p.id === productId);
      
      if (!product) {
        this.router.navigate(['/products']);
        return;
      }
      
      this.product.set(product);
      
      // 3. Charger les produits similaires (même catégorie)
      const related = allProducts
        .filter(p => p.category === product.category && p.id !== productId)
        .slice(0, 4); // Limite à 4 produits
      
      this.relatedProducts.set(related);
      
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Méthodes
  selectImage(index: number) {
    this.selectedImageIndex.set(index);
  }

  increaseQuantity() {
    const product = this.product();
    if (product && this.quantity() < product.stock) {
      this.quantity.set(this.quantity() + 1);
    }
  }

  decreaseQuantity() {
    if (this.quantity() > 1) {
      this.quantity.set(this.quantity() - 1);
    }
  }

  addToCart() {
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isAuthenticated()) {
      // Rediriger vers login avec returnUrl
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: `/product/${this.product()?.id}` }
      });
      return;
    }
    
    const product = this.product();
    if (product) {
      this.cartService.addToCart(product, this.quantity());
      alert(`${this.quantity()} × ${product.name} ajouté au panier`);
    }
  }

  getProductImage(product: Product, index: number = 0): string {
    if (product.images && product.images.length > index && product.images[index]) {
      let imagePath = product.images[index];
      
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

  getCategoryName(category: string): string {
    const categories: { [key: string]: string } = {
      'face': 'Teint',
      'eyes': 'Yeux',
      'lips': 'Lèvres',
      'brows': 'Sourcils',
      'nails': 'Ongles',
      'brushes': 'Pinceaux'
    };
    return categories[category] || category;
  }
}