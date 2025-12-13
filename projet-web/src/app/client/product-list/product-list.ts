import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss']
})
export class ProductList implements OnInit {
  // Signaux
  allProducts = signal<Product[]>([]);
  searchTerm = signal('');
  selectedCategory = signal('all');
  priceFilter = signal(100);
  sortBy = signal('name');
  sortOrder = signal<'asc' | 'desc'>('asc');
  isLoading = signal(true);
  showPromoOnly = signal(false);
  
  // Catégories disponibles
  categories = [
    { id: 'all', name: 'Toutes les catégories', icon: 'apps' },
    { id: 'face', name: 'Teint', icon: 'face' },
    { id: 'eyes', name: 'Yeux', icon: 'visibility' },
    { id: 'lips', name: 'Lèvres', icon: 'favorite' },
    { id: 'brows', name: 'Sourcils', icon: 'brush' }
  ];
  
  // Produits filtrés
  filteredProducts = signal<Product[]>([]);

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    // Charger les produits depuis Firebase
    await this.loadProducts();
    
    // Écouter les paramètres d'URL
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      } else {
        this.selectedCategory.set('all');
      }
      
      // Gérer le filtre promo
      if (params['promo'] === 'true') {
        this.showPromoOnly.set(true);
      } else {
        this.showPromoOnly.set(false);
      }
      
      this.applyFilters();
    });
  }
  addToCart(product: Product) {
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isAuthenticated()) {
      // Rediriger vers login avec l'URL actuelle en returnUrl
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }
    
    this.cartService.addToCart(product, 1);
    console.log(`${product.name} ajouté au panier`);
  }

  async loadProducts() {
    this.isLoading.set(true);
    try {
      const products = await this.productService.getAllProducts();
      this.allProducts.set(products);
      this.applyFilters();
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  applyFilters() {
    let products = [...this.allProducts()];
    
    // Filtre par promo
    if (this.showPromoOnly()) {
      products = products.filter(p => p.oldPrice && p.oldPrice > p.price);
    }
    
    // Filtre par catégorie
    if (this.selectedCategory() !== 'all') {
      products = products.filter(p => p.category === this.selectedCategory());
    }
    
    // Filtre par prix
    products = products.filter(p => p.price <= this.priceFilter());
    
    // Filtre par recherche
    const term = this.searchTerm().toLowerCase();
    if (term) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term)
      );
    }
    
    // Tri
    products.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (this.sortBy()) {
        case 'price': 
          aVal = a.price; 
          bVal = b.price; 
          break;
        case 'name': 
          aVal = a.name.toLowerCase(); 
          bVal = b.name.toLowerCase(); 
          break;
        case 'rating': 
          // Gérer rating optionnel
          aVal = a.rating || 0; 
          bVal = b.rating || 0; 
          break;
        default: 
          aVal = a.name.toLowerCase(); 
          bVal = b.name.toLowerCase();
      }
      
      return this.sortOrder() === 'asc' 
        ? (aVal > bVal ? 1 : -1)
        : (aVal < bVal ? 1 : -1);
    });
    
    this.filteredProducts.set(products);
  }

  onCategoryChange(categoryId: string) {
    this.selectedCategory.set(categoryId);
    this.updateUrlParams();
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  onSortChange(sortBy: string) {
    this.sortBy.set(sortBy);
    this.applyFilters();
  }

  toggleSortOrder() {
    this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    this.applyFilters();
  }

  updateUrlParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: this.selectedCategory() !== 'all' ? this.selectedCategory() : null },
      queryParamsHandling: 'merge'
    });
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  }

  getCategoryProductCount(categoryId: string): number {
    if (categoryId === 'all') {
      return this.allProducts().length;
    }
    return this.allProducts().filter(p => p.category === categoryId).length;
  }

  getProductImage(product: Product): string {
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