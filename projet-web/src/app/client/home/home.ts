import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Product, ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit{

  // Produits en vedette (à afficher)
  featuredProducts: Product[] = [];  // Tableau vide pour les produits

  // Catégories principales
  categories = [
    { 
      id: 'face', 
      name: 'Teint', 
      icon: 'face',  // Icône Material
      description: 'Fond de teint, poudre, blush',
      image: 'assets/images/categories/teint.jpg'  // CHEMIN À MODIFIER
    },
    { 
      id: 'eyes', 
      name: 'Yeux', 
      icon: 'visibility',
      description: 'Mascara, fard à paupières, eyeliner',
      image: 'assets/images/categories/yeux.jpg'  // CHEMIN À MODIFIER
    },
    { 
      id: 'lips', 
      name: 'Lèvres', 
      icon: 'lips',
      description: 'Rouge à lèvres, gloss, crayon',
      image: 'assets/images/categories/levres.jpg'  // CHEMIN À MODIFIER
    }
  ];

  // Promotions
  promotions = [
    {
      title: 'Offre spéciale',
      description: '-30% sur toutes les palettes yeux',
      buttonText: 'Profiter',
      link: '/products',
      queryParams: { promo: 'true' }
    },
    {
      title: 'Nouveautés',
      description: 'Découvrez notre nouvelle collection',
      buttonText: 'Découvrir',
      link: '/products',
      queryParams: { sort: 'newest' }
    }
  ];

  // Messages d'erreur/chargement
  isLoading = true;  // Pour montrer un chargement
  errorMessage = ''; // Pour les erreurs

  //3.constructeur (injection des services)
  constructor(
    private productService: ProductService, //service pour les produits
    private router: Router,                   //service pour la navigation
    private cartService: CartService,
    private authService: AuthService
  ) {}

  //4.ngOnInit
  ngOnInit(): void {
    this.loadFeaturedProducts(); // appelle la fonction pour charger les produits en vedette
  }


  //5.Fonction pour charger les produits en vedette
  loadFeaturedProducts(): void {
    this.isLoading = true;  //activer l'animation de chargement
    // Appelle la fonction qui récupère les produits depuis Firebase
    this.useFirebaseData();
  }

  //donner depuis firebase
  useFirebaseData(): void {
    //appelle le service pour recuperer les produits 
    // `getFeaturedProducts()` retourne une Promise (implémentée dans ProductService).
    this.productService.getFeaturedProducts()
      .then((products) => {
        if (products && products.length > 0) {
          this.featuredProducts = products; // stocke les produits récupérés
          this.isLoading = false;           // désactiver l'animation de chargement
        } else {
          // Fallback : charger quelques produits génériques
          this.loadFallbackProducts();
        }
      })
      .catch((error) => {
        this.errorMessage = 'Erreur lors du chargement des produits.'; // message d'erreur
        this.isLoading = false;           // désactiver l'animation de chargement
        console.error('Erreur lors de la récupération des produits en vedette:', error);
      });
  }

  // Fallback si aucun produit vedette n'est trouvé
  private loadFallbackProducts(): void {
    this.productService.getAllProducts()
      .then((products) => {
        if (products && products.length > 0) {
          // Prendre les 4 premiers produits comme mise en avant
          this.featuredProducts = products.slice(0, 4);
          this.isLoading = false;
        } else {
          this.setStaticFeatured();
        }
      })
      .catch((error) => {
        console.error('Erreur lors du fallback produits:', error);
        this.setStaticFeatured();
      });
  }

  // Fallback final : 3 produits statiques pour toujours afficher quelque chose
  private setStaticFeatured(): void {
    this.featuredProducts = [
      {
        id: 'static-1',
        name: 'Rouge à Lèvres Mat',
        price: 32.9,
        category: 'lips',
        brand: 'MakeupStore',
        stock: 20,
        description: 'Tenue longue, couleur intense',
        images: ['https://via.placeholder.com/400x400/ff6699/ffffff?text=Rouge+L%C3%A8vres'],
        featured: true,
        rating: 4.7,
        reviews: 124,
        oldPrice: 39.9
      },
      {
        id: 'static-2',
        name: 'Fond de Teint Fluide',
        price: 58.0,
        category: 'face',
        brand: 'GlowSkin',
        stock: 15,
        description: 'Fini naturel, couvrance modulable',
        images: ['https://via.placeholder.com/400x400/f5c6a5/ffffff?text=Fond+de+Teint'],
        featured: true,
        rating: 4.8,
        reviews: 210,
        oldPrice: 65.0
      },
      {
        id: 'static-3',
        name: 'Palette Yeux 12 Teintes',
        price: 76.5,
        category: 'eyes',
        brand: 'EyeArt',
        stock: 18,
        description: 'Pigmentation intense, teintes chaudes & froides',
        images: ['https://via.placeholder.com/400x400/8b4bb4/ffffff?text=Palette+Yeux'],
        featured: true,
        rating: 4.6,
        reviews: 162,
        oldPrice: 89.0
      }
    ];
    this.isLoading = false;
    this.errorMessage = '';
  }

  //fonction pour naviguer vers une catégorie
  goToCategory(categoryId: string): void {
    //naviguer vers la liste des produits avec le filtre de catégorie
    this.router.navigate(['/products'], { queryParams: { category: categoryId } });
  }

  //fonction pour naviguer vers les produits
  goToProducts(): void {
    this.router.navigate(['/products']); //va a la page produits
  }

  // Naviguer vers la page d'un produit
  goToProduct(productId: string | undefined): void {
    if (!productId) return;
    this.router.navigate(['/product', productId]);
  }

  // Naviguer vers une promotion (link + queryParams)
  goToPromo(promo: any): void {
    if (!promo || !promo.link) return;
    this.router.navigate([promo.link], { queryParams: promo.queryParams });
  }

  //fonction pour ajouter au panier
  addToCart(product: any): void {
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isAuthenticated()) {
      // Rediriger vers login
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: '/' }
      });
      return;
    }
    
    // Ajouter au panier via le service
    this.cartService.addToCart(product, 1);
    console.log(`Produit ajouté au panier: ${product.name}`);
  }

  // Obtenir l'image du produit avec gestion des chemins
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

  // Handle image error
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/products/rouge-levres.jpg';
  }
}
