import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { 
  Firestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  query,
  where 
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

export interface Product {
  id?: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  description: string;
  images: string[];
  featured: boolean;
  rating?: number;
  reviews?: number;
  oldPrice?: number;
}

interface MakeupApiProduct {
  id: number;
  brand: string;
  name: string;
  price: string;
  image_link: string;
  product_link: string;
  description: string;
  category: string;
  product_type: string;
  tag_list: string[];
  rating: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'https://makeup-api.herokuapp.com/api/v1/products.json';

  constructor(private firestore: Firestore) { }

  // Récupérer produits depuis l'API Makeup
  async getProductsFromApi(): Promise<Product[]> {
    try {
      // Utiliser HttpClient au lieu de fetch
      const apiProducts = await new Promise<MakeupApiProduct[]>((resolve, reject) => {
        this.http.get<MakeupApiProduct[]>(this.apiUrl).subscribe(
          (data) => resolve(data),
          (error) => {
            console.warn('API Makeup indisponible, utilisation des données locales:', error);
            resolve([]); // Retourner vide au lieu de rejeter
          }
        );
      });

      if (!apiProducts || apiProducts.length === 0) {
        console.log('Aucun produit depuis l\'API, essai avec données locales');
        return this.getLocalProducts();
      }
      
      // Convertir les produits API en format local
      const products: Product[] = apiProducts
        .filter(p => p.image_link && p.price) // Filtrer les produits sans image ou prix
        .slice(0, 50) // Limiter à 50 produits
        .map((p, index) => ({
          id: `api-${p.id}`,
          name: p.name || 'Produit sans nom',
          price: parseFloat(p.price) || 10,
          category: this.mapCategory(p.product_type),
          brand: p.brand || 'Sans marque',
          stock: 20,
          description: p.description || 'Aucune description disponible',
          images: [p.image_link],
          featured: index < 8, // Les 8 premiers sont en vedette
          rating: p.rating || 4.5,
          reviews: Math.floor(Math.random() * 200) + 10,
          oldPrice: parseFloat(p.price) > 0 ? parseFloat(p.price) * 1.2 : undefined
        }));

      console.log(`${products.length} produits chargés depuis l'API`);
      return products;
      
    } catch (error) {
      console.error('Erreur lors du chargement depuis l\'API:', error);
      return this.getLocalProducts();
    }
  }

  // Produits locaux (données par défaut si API ne fonctionne pas)
  private getLocalProducts(): Product[] {
    return [
      {
        id: 'local-1',
        name: 'Rouge à Lèvres Classique',
        price: 15.99,
        category: 'lips',
        brand: 'Makeup Store',
        stock: 20,
        description: 'Rouge à lèvres longue tenue',
        images: ['https://via.placeholder.com/300x300/ff69b4/ffffff?text=Lipstick'],
        featured: true,
        rating: 4.5,
        reviews: 120
      },
      {
        id: 'local-2',
        name: 'Fond de Teint Fluide',
        price: 25.99,
        category: 'face',
        brand: 'Makeup Store',
        stock: 15,
        description: 'Fond de teint fluide couvrance moyenne',
        images: ['https://via.placeholder.com/300x300/fdbcb4/ffffff?text=Foundation'],
        featured: true,
        rating: 4.8,
        reviews: 200
      },
      {
        id: 'local-3',
        name: 'Palette de Fards à Paupières',
        price: 32.99,
        category: 'eyes',
        brand: 'Makeup Store',
        stock: 12,
        description: 'Palette de 12 couleurs pour les yeux',
        images: ['https://via.placeholder.com/300x300/8B4789/ffffff?text=Eyeshadow'],
        featured: true,
        rating: 4.7,
        reviews: 150
      },
      {
        id: 'local-4',
        name: 'Crayon à Sourcils',
        price: 12.99,
        category: 'brows',
        brand: 'Makeup Store',
        stock: 25,
        description: 'Crayon à sourcils waterproof',
        images: ['https://via.placeholder.com/300x300/8b7355/ffffff?text=Brow'],
        featured: false,
        rating: 4.3,
        reviews: 80
      },
      {
        id: 'local-5',
        name: 'Mascara Volumisant',
        price: 18.99,
        category: 'eyes',
        brand: 'Makeup Store',
        stock: 18,
        description: 'Mascara pour un volume maximal',
        images: ['https://via.placeholder.com/300x300/000000/ffffff?text=Mascara'],
        featured: true,
        rating: 4.6,
        reviews: 180
      },
      {
        id: 'local-6',
        name: 'Blush Poudre',
        price: 14.99,
        category: 'face',
        brand: 'Makeup Store',
        stock: 22,
        description: 'Blush en poudre avec fini naturel',
        images: ['https://via.placeholder.com/300x300/ff9fd0/ffffff?text=Blush'],
        featured: false,
        rating: 4.4,
        reviews: 100
      }
    ];
  }

  // Mapper les types de produits de l'API vers nos catégories
  private mapCategory(productType: string): string {
    const type = productType?.toLowerCase() || '';
    
    if (type.includes('lipstick') || type.includes('lip')) return 'lips';
    if (type.includes('eyeshadow') || type.includes('eye') || type.includes('mascara')) return 'eyes';
    if (type.includes('foundation') || type.includes('blush') || type.includes('bronzer')) return 'face';
    if (type.includes('eyebrow') || type.includes('brow')) return 'brows';
    
    return 'face'; // Catégorie par défaut
  }

  // Normalise un nom pour comparer sans accents ni casse
  private normalizeName(value: string): string {
    return (value || '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Mapper les catégories françaises vers anglais (Firestore => front)
  private mapCategoryFromFrench(category: string): string {
    const cat = category?.toLowerCase() || '';

    if (cat === 'teint') return 'face';
    if (cat === 'yeux') return 'eyes';
    if (cat === 'levres' || cat === 'lèvres') return 'lips';
    if (cat === 'sourcils') return 'brows';

    // Si déjà en anglais
    if (['face', 'eyes', 'lips', 'brows'].includes(cat)) return cat;

    return 'face'; // Catégorie par défaut
  }

  // Convertir les chemins d'images Firestore (paths Windows) en URLs web
  private normalizeImages(images: any): string[] {
    if (!images) return [];
    const arr = Array.isArray(images) ? images : [images];
    return arr.map((img: string) => {
      if (!img) return '';
      // Si c'est un chemin absolu Windows, garder seulement la partie après assets/
      const lower = img.toLowerCase();
      const idx = lower.indexOf('assets\\');
      if (idx !== -1) {
        return img.substring(idx).replace(/\\/g, '/');
      }
      const idx2 = lower.indexOf('assets/');
      if (idx2 !== -1) return img.substring(idx2);
      return img;
    }).filter(Boolean);
  }

  // 1. Récupérer TOUS les produits (Firestore -> API -> local)
  async getAllProducts(): Promise<Product[]> {
    try {
      // 1) Firestore en priorité
      const productsRef = collection(this.firestore, 'produits');
      const querySnapshot = await getDocs(productsRef);
      const products: Product[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        products.push({
          id: docSnap.id,
          name: data['nom'] || data['name'] || '',
          price: data['prix'] || data['price'] || 0,
          category: this.mapCategoryFromFrench(data['categorie_id'] || data['category']),
          brand: data['marque'] || data['brand'] || '',
          stock: data['stock'] || 0,
          description: data['description'] || '',
          images: this.normalizeImages(data['images']),
          featured: data['featured'] || false,
          rating: data['note_moyenne'] || data['rating'] || 4.5,
          reviews: data['reviews'] || 100,
          oldPrice: data['oldPrice']
        });
      });

      if (products.length > 0) {
        const unique = this.dedupeProducts(products);
        console.log(`${unique.length} produits chargés depuis Firestore (après dédoublonnage)`);
        return unique;
      }

      // 2) Sinon API
      const apiProducts = await this.getProductsFromApi();
      if (apiProducts.length > 0) {
        return apiProducts;
      }

      // 3) Fallback local
      return this.getLocalProducts();

    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      return this.getLocalProducts();
    }
  }

  // Supprimer les doublons (même nom + même prix)
  private dedupeProducts(products: Product[]): Product[] {
    const seen = new Map<string, Product>();
    products.forEach(p => {
      const key = `${p.name?.toLowerCase() || ''}::${p.price || 0}`;
      if (!seen.has(key)) {
        seen.set(key, p);
      }
    });
    return Array.from(seen.values());
  }

  // 2. Récupérer un produit par ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(this.firestore, 'produits', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as Product;
        return {
          id: docSnap.id,
          ...data
        };
      } else {
        console.log('Produit non trouvé dans Firestore');
        return null;
      }
    } catch (error) {
      console.error('Erreur:', error);
      return null;
    }
  }

  // 3. Produits par catégorie
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      return allProducts.filter(p => p.category === category);
    } catch (error) {
      console.error('Erreur:', error);
      return [];
    }
  }

  // 4. Produits en vedette
  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const allProducts = await this.getAllProducts();
      // 1) Essayer les flags featured
      const flagged = allProducts.filter(p => p.featured);

      // 2) Sélection prioritaire basée sur vos 6 produits importés (add-products.js)
      const preferredNames = [
        'fond de teint liquide perfect match',
        'palette nude revolution',
        'rouge à lèvres matte liquide',
        'rouge a levres matte liquide'
      ];

      const normalizedPreferred = preferredNames.map(name => this.normalizeName(name));

      const preferred: Product[] = [];
      for (const target of normalizedPreferred) {
        const found = allProducts.find(p => {
          const norm = this.normalizeName(p.name);
          return norm === target || norm.includes(target) || target.includes(norm);
        });
        if (found && !preferred.find(p => p.id === found.id)) {
          preferred.push(found);
        }
      }

      // 3) Compléter si besoin
      const pool = flagged.length > 0 ? flagged : allProducts;
      const merged: Product[] = [...preferred];
      for (const p of pool) {
        if (merged.length >= 8) break;
        if (!merged.find(m => m.id === p.id)) merged.push(p);
      }

      // Retourner au moins 3 produits
      if (merged.length >= 3) return merged.slice(0, 8);

      // 4) Dernier recours : tout le catalogue (au cas où)
      return allProducts.slice(0, 8);
    } catch (error) {
      console.error('Erreur:', error);
      return [];
    }
  }

  // 5. Produits similaires
  async getRelatedProducts(category: string, excludeId: string): Promise<Product[]> {
    try {
      const products = await this.getAllProducts();
      return products
        .filter(p => p.category === category && p.id !== excludeId)
        .slice(0, 4);
    } catch (error) {
      console.error('Erreur:', error);
      return [];
    }
  }

  // 6. N'AJOUTEZ PAS de produits si vous en avez déjà !
  // SUPPRIMEZ la méthode addSampleProducts() si vous avez déjà des données
}