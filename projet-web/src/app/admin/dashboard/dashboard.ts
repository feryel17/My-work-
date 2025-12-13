import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  Firestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc,
  updateDoc 
} from '@angular/fire/firestore';
import { Product } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class AdminDashboard implements OnInit {
  products = signal<Product[]>([]);
  isLoading = signal(false);
  showAddProduct = signal(false);
  editingProduct = signal<Product | null>(null);
  imageFileName = '';
  editImageFileName = '';
  
  // Formulaire nouveau produit
  newProduct = signal<Partial<Product>>({
    name: '',
    price: 0,
    oldPrice: 0,
    category: 'face',
    brand: '',
    stock: 0,
    description: '',
    images: ['assets/images/products/default.jpg'],
    featured: false,
    rating: 4.5,
    reviews: 0
  });

  // Statistiques
  stats = signal({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  constructor(
    private firestore: Firestore,
    private orderService: OrderService,
    public authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Vérifier si admin
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }

    await this.loadProducts();
    await this.loadStats();
  }

  // Gérer la sélection d'image
  onImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFileName = file.name;
      console.log('📷 Image sélectionnée:', file.name);
      console.log('⚠️ Copiez ce fichier dans: src/assets/images/products/');
    }
  }

  // Gérer la sélection d'image pour l'édition
  onEditImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.editImageFileName = file.name;
      console.log('📷 Nouvelle image sélectionnée:', file.name);
      console.log('⚠️ Copiez ce fichier dans: src/assets/images/products/');
    }
  }

  // Charger les produits
  async loadProducts() {
    this.isLoading.set(true);
    try {
      console.log('🔍 Chargement des produits depuis Firestore...');
      const querySnapshot = await getDocs(collection(this.firestore, 'produits'));
      console.log('📦 Documents trouvés:', querySnapshot.size);
      
      const products = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data['nom'] || data['name'] || '',
          price: data['prix'] || data['price'] || 0,
          category: data['categorie_id'] || data['category'] || '',
          brand: data['marque'] || data['brand'] || '',
          stock: data['stock'] || 0,
          description: data['description'] || '',
          images: data['images'] || [],
          featured: data['featured'] || false,
          rating: data['note_moyenne'] || data['rating'] || 4.5,
          reviews: data['reviews'] || 0,
          oldPrice: data['oldPrice']
        } as Product;
      });

      // Filtrer les produits invalides (sans nom)
      const validProducts = products.filter(p => p.name && p.name.trim() !== '');
      
      this.products.set(validProducts);
      console.log(`✅ ${validProducts.length} produits chargés avec succès`);
      
      if (validProducts.length < products.length) {
        console.warn(`⚠️ ${products.length - validProducts.length} produit(s) invalide(s) ignoré(s)`);
      }
      
      if (validProducts.length === 0) {
        console.warn('⚠️ Aucun produit trouvé dans Firestore. Ajoutez des produits depuis le formulaire ci-dessous.');
      }
    } catch (error: any) {
      console.error('❌ Erreur chargement produits:', error);
      console.error('Détails:', error.message);
      alert(`Erreur lors du chargement des produits: ${error.message}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Charger les statistiques
  async loadStats() {
    try {
      console.log('📊 Chargement des statistiques...');
      await this.orderService.getAllOrders();
      const orderStats = this.orderService.getOrderStats();
      
      console.log('📈 Statistiques des commandes:', orderStats);

      this.stats.set({
        totalProducts: this.products().length,
        totalOrders: orderStats.total,
        totalRevenue: orderStats.totalRevenue,
        pendingOrders: orderStats.pending
      });
      
      console.log('✅ Statistiques mises à jour:', this.stats());
      
      if (orderStats.total === 0) {
        console.warn('⚠️ Aucune commande trouvée dans Firestore.');
      }
    } catch (error: any) {
      console.error('❌ Erreur chargement stats:', error);
      console.error('Détails:', error.message);
    }
  }

  // Ajouter un produit
  async addProduct() {
    const product = this.newProduct();
    
    if (!product.name || !product.price || !product.brand || !product.category) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Construire le chemin de l'image
    if (this.imageFileName) {
      product.images = [`assets/images/products/${this.imageFileName}`];
    }

    this.isLoading.set(true);
    try {
      await addDoc(collection(this.firestore, 'produits'), {
        ...product,
        createdAt: new Date()
      });

      console.log('✅ Produit ajouté avec succès');
      alert('Produit ajouté avec succès !');
      this.showAddProduct.set(false);
      this.resetForm();
      await this.loadProducts();
    } catch (error) {
      console.error('❌ Erreur ajout produit:', error);
      alert('Erreur lors de l\'ajout du produit');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Modifier un produit
  async updateProduct() {
    const product = this.editingProduct();
    if (!product || !product.id) return;

    // Mettre à jour l'image si un nouveau fichier a été sélectionné
    if (this.editImageFileName) {
      if (!product.images) {
        product.images = [];
      }
      product.images[0] = `assets/images/products/${this.editImageFileName}`;
      console.log('✅ Nouvelle image définie:', product.images[0]);
    }

    this.isLoading.set(true);
    try {
      const { id, ...productData } = product;
      await updateDoc(doc(this.firestore, 'produits', id), {
        ...productData,
        updatedAt: new Date()
      });

      console.log('✅ Produit modifié avec succès');
      alert('Produit modifié avec succès !');
      this.editImageFileName = '';
      this.editingProduct.set(null);
      await this.loadProducts();
    } catch (error) {
      console.error('❌ Erreur modification produit:', error);
      alert('Erreur lors de la modification du produit');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Supprimer un produit
  async deleteProduct(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    this.isLoading.set(true);
    try {
      await deleteDoc(doc(this.firestore, 'produits', id));
      alert('Produit supprimé avec succès !');
      await this.loadProducts();
    } catch (error) {
      console.error('Erreur suppression produit:', error);
      alert('Erreur lors de la suppression du produit');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Commencer l'édition
  startEdit(product: Product) {
    this.editingProduct.set({ ...product });
    this.editImageFileName = ''; // Réinitialiser le nom de fichier
  }

  // Annuler l'édition
  cancelEdit() {
    this.editingProduct.set(null);
    this.editImageFileName = '';
  }

  // Réinitialiser le formulaire
  resetForm() {
    this.imageFileName = '';
    this.newProduct.set({
      name: '',
      price: 0,
      oldPrice: 0,
      category: 'face',
      brand: '',
      stock: 0,
      description: '',
      images: ['assets/images/products/default.jpg'],
      featured: false,
      rating: 4.5,
      reviews: 0
    });
  }

  // Déconnexion
  async logout() {
    await this.authService.logout();
  }
}
