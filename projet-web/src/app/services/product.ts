import { Injectable, signal } from '@angular/core';

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  description: string;
  category: string;
  brand: string;
  stock: number;
  images: string[];
  featured: boolean;
  rating?: number;
  reviews?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Signal pour les produits
  private products = signal<Product[]>([
    {
      id: '1',
      name: 'Rouge à Lèvres Matte - Ruby Red',
      price: 24.99,
      oldPrice: 29.99,
      description: 'Rouge à lèvres mat longue tenue, couleur intense qui ne sèche pas les lèvres.',
      category: 'lips',
      brand: 'NYX',
      stock: 50,
      images: ['C:\\roua\\projet_dev_web\\makeup-ecommerce\\src\\assets\\images\\products\\rouge.jpg'],
      featured: true,
      rating: 4.5,
      reviews: 128
    },
    {
      id: '2',
      name: 'Palette Fard à Paupières Nude',
      price: 39.99,
      description: 'Palette de 12 couleurs nude et mates pour un maquillage des yeux parfait.',
      category: 'eyes',
      brand: 'Urban Decay',
      stock: 30,
      images: ['https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&fit=crop'],
      featured: true,
      rating: 4.8,
      reviews: 256
    },
    {
      id: '3',
      name: 'Fond de Teint Fluide - Beige Naturel',
      price: 29.99,
      description: 'Fond de teint fluide à couvrance moyenne, fini naturel et longue tenue.',
      category: 'face',
      brand: 'L\'Oréal',
      stock: 45,
      images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&fit=crop'],
      featured: true,
      rating: 4.3,
      reviews: 89
    },
    {
      id: '4',
      name: 'Mascara Volume Intense',
      price: 19.99,
      description: 'Mascara donnant un effet volume intense sans paquets, résistant à l\'eau.',
      category: 'eyes',
      brand: 'Maybelline',
      stock: 60,
      images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&fit=crop'],
      featured: false,
      rating: 4.6,
      reviews: 312
    },
    {
      id: '5',
      name: 'Blush Poudre - Rose Poudré',
      price: 22.99,
      oldPrice: 27.99,
      description: 'Blush en poudre donnant un effet naturel et healthy, fini mat.',
      category: 'face',
      brand: 'MAC',
      stock: 25,
      images: ['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&fit=crop'],
      featured: true,
      rating: 4.7,
      reviews: 176
    },
    {
      id: '6',
      name: 'Crayon à Sourcils - Brun Clair',
      price: 15.99,
      description: 'Crayon à sourcils précis, facile à appliquer, tenue toute la journée.',
      category: 'eyes',
      brand: 'Benefit',
      stock: 40,
      images: ['https://images.unsplash.com/photo-1522338242990-e8c0f8f51e8b?w=500&fit=crop'],
      featured: false,
      rating: 4.4,
      reviews: 92
    },
    {
      id: '7',
      name: 'Vernis à Ongles - Rouge Passion',
      price: 12.99,
      description: 'Vernis longue tenue, séchage rapide, fini brillant intense.',
      category: 'nails',
      brand: 'OPI',
      stock: 80,
      images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&fit=crop'],
      featured: false,
      rating: 4.2,
      reviews: 143
    },
    {
      id: '8',
      name: 'Set de Pinceaux Professionnels',
      price: 49.99,
      oldPrice: 59.99,
      description: 'Set de 12 pinceaux en fibres synthétiques de haute qualité.',
      category: 'brushes',
      brand: 'Sigma',
      stock: 20,
      images: ['https://images.unsplash.com/photo-1563178406-4cdc2923acbc?w=500&fit=crop'],
      featured: true,
      rating: 4.9,
      reviews: 87
    }
  ]);

  // Méthodes pour récupérer les produits
  getProducts() {
    return this.products();
  }

  getProductById(id: string) {
    return this.products().find(product => product.id === id);
  }

  getProductsByCategory(category: string) {
    if (category === 'all') return this.products();
    return this.products().filter(product => product.category === category);
  }

  getFeaturedProducts() {
    return this.products().filter(product => product.featured);
  }

  getCategoryProductCount(categoryId: string): number {
    if (categoryId === 'all') {
      return this.products().length;
    }
    return this.products().filter(p => p.category === categoryId).length;
  }

  // Récupérer un produit par ID (asynchrone)
  async fetchProductById(id: string): Promise<Product | null> {
    try {
      // Note: Avec Firestore, vous auriez besoin d'importer doc et getDoc
      // Pour l'instant, simulez avec les produits existants
      const products = await this.getProducts();
      return products.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      return null;
    }
  }

  // Récupérer des produits similaires
  async getRelatedProducts(category: string, excludeId: string): Promise<Product[]> {
    try {
      const products = await this.getProducts();
      return products
        .filter(p => p.category === category && p.id !== excludeId)
        .slice(0, 4); // Limite à 4 produits
    } catch (error) {
      console.error('Erreur lors de la récupération des produits similaires:', error);
      return [];
    }
  }

  // Méthode pour ajouter des produits d'exemple (déjà dans app.ts)
  async addSampleProducts() {
    console.log('Produits déjà initialisés');
    return Promise.resolve();
  }
}