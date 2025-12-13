import { Injectable, signal } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc,
  query,
  orderBy,
  where,
  deleteDoc,
  Timestamp
} from '@angular/fire/firestore';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export interface Order {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  orders = signal<Order[]>([]);
  isLoading = signal(false);

  constructor(private firestore: Firestore) {}

  // Créer une nouvelle commande
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('🔄 === CRÉATION COMMANDE SERVICE ===');
      console.log('📥 Données reçues:', orderData);
      console.log('💾 userId reçu:', orderData.userId);
      
      const order = {
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('📤 Données finales avant sauvegarde:', order);
      const docRef = await addDoc(collection(this.firestore, 'orders'), order);
      console.log('✅ Commande créée avec ID:', docRef.id);
      console.log('✅ userId sauvegardé dans Firebase:', order.userId);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erreur création commande:', error);
      throw error;
    }
  }

  // Récupérer toutes les commandes (admin)
  async getAllOrders(): Promise<Order[]> {
    this.isLoading.set(true);
    try {
      console.log('🔍 Récupération des commandes depuis Firestore...');
      const q = query(
        collection(this.firestore, 'orders'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      console.log('📦 Commandes trouvées:', querySnapshot.size);
      
      const orders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📄 Commande ID:', doc.id, 'Data:', data);
        return {
          id: doc.id,
          ...data,
          createdAt: data['createdAt']?.toDate() || new Date(),
          updatedAt: data['updatedAt']?.toDate() || new Date(),
          deliveredAt: data['deliveredAt']?.toDate()
        };
      }) as Order[];

      this.orders.set(orders);
      console.log(`✅ ${orders.length} commandes chargées avec succès`);
      
      if (orders.length === 0) {
        console.warn('⚠️ Aucune commande trouvée dans Firestore.');
      }
      
      return orders;
    } catch (error: any) {
      console.error('❌ Erreur chargement commandes:', error);
      console.error('Détails:', error.message);
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  // Récupérer les commandes d'un utilisateur
  async getUserOrders(userId: string): Promise<Order[]> {
    this.isLoading.set(true);
    try {
      console.log('🔍 Recherche des commandes pour userId:', userId);
      
      // Requête simplifiée sans orderBy pour éviter le besoin d'index
      const q = query(
        collection(this.firestore, 'orders'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      console.log('📦 Nombre de commandes trouvées:', querySnapshot.size);
      
      const orders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📄 Document ID:', doc.id);
        
        // Conversion sécurisée des Timestamps
        let createdAt: any = data['createdAt'];
        let updatedAt: any = data['updatedAt'];
        let deliveredAt: any = data['deliveredAt'];
        
        // Convertir les Timestamps Firebase en Date - FORCER la conversion
        try {
          if (createdAt && typeof createdAt.toDate === 'function') {
            createdAt = createdAt.toDate();
            console.log('✅ createdAt convertie depuis Timestamp');
          } else if (typeof createdAt === 'string') {
            createdAt = new Date(createdAt);
          } else if (!(createdAt instanceof Date)) {
            createdAt = new Date();
          }
        } catch (e) {
          console.warn('⚠️ Erreur conversion createdAt:', e);
          createdAt = new Date();
        }
        
        try {
          if (updatedAt && typeof updatedAt.toDate === 'function') {
            updatedAt = updatedAt.toDate();
          } else if (typeof updatedAt === 'string') {
            updatedAt = new Date(updatedAt);
          } else if (!(updatedAt instanceof Date)) {
            updatedAt = new Date();
          }
        } catch (e) {
          console.warn('⚠️ Erreur conversion updatedAt:', e);
          updatedAt = new Date();
        }
        
        try {
          if (deliveredAt && typeof deliveredAt.toDate === 'function') {
            deliveredAt = deliveredAt.toDate();
          } else if (typeof deliveredAt === 'string') {
            deliveredAt = new Date(deliveredAt);
          }
        } catch (e) {
          console.warn('⚠️ Erreur conversion deliveredAt:', e);
        }
        
        // Créer l'objet ordre en copiant SANS utiliser ...data pour éviter la réécriture
        const order: any = {
          id: doc.id,
          userId: data['userId'],
          userEmail: data['userEmail'],
          userName: data['userName'],
          items: data['items'] || [],
          totalAmount: data['totalAmount'],
          status: data['status'],
          shippingAddress: data['shippingAddress'],
          paymentMethod: data['paymentMethod'],
          createdAt: createdAt as Date,
          updatedAt: updatedAt as Date,
          deliveredAt: deliveredAt as Date | undefined
        };
        
        console.log('✅ Commande convertie:', order.id, 'createdAt type:', typeof order.createdAt, 'instanceof Date:', order.createdAt instanceof Date);
        return order;
      }) as Order[];

      // Trier par date de création (descendant) en mémoire
      orders.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return dateB - dateA;
      });

      console.log('✅ Commandes chargées et triées:', orders.length);
      return orders;
    } catch (error: any) {
      console.error('❌ Erreur chargement commandes utilisateur:', error);
      console.error('Message d\'erreur:', error.message);
      if (error.message?.includes('requires an index')) {
        console.warn('⚠️ Un index Firestore est requis. Crée-le via le console.');
      }
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  // Mettre à jour le statut d'une commande
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      const orderRef = doc(this.firestore, 'orders', orderId);
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      // Si livré, ajouter la date de livraison
      if (status === 'delivered') {
        updateData.deliveredAt = new Date();
      }

      await updateDoc(orderRef, updateData);
      
      // Mettre à jour localement
      this.orders.update(orders => 
        orders.map(order => 
          order.id === orderId 
            ? { ...order, status, updatedAt: new Date(), ...(status === 'delivered' ? { deliveredAt: new Date() } : {}) }
            : order
        )
      );

      console.log('Statut commande mis à jour:', orderId, status);
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      throw error;
    }
  }

  // Supprimer une commande (admin)
  async deleteOrder(orderId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firestore, 'orders', orderId));
      
      // Mettre à jour localement
      this.orders.update(orders => orders.filter(order => order.id !== orderId));
      
      console.log('Commande supprimée:', orderId);
    } catch (error) {
      console.error('Erreur suppression commande:', error);
      throw error;
    }
  }

  // Statistiques pour le dashboard admin
  getOrderStats(): {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    totalRevenue: number;
  } {
    const orders = this.orders();
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.totalAmount, 0)
    };
  }
}
