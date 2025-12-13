import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrls: ['./orders.scss']
})
export class AdminOrders implements OnInit {
  orders = signal<Order[]>([]);
  filteredOrders = signal<Order[]>([]);
  isLoading = signal(false);
  selectedStatus = signal<string>('all');
  selectedOrder = signal<Order | null>(null);

  statusOptions = [
    { value: 'all', label: 'Toutes', icon: '📦' },
    { value: 'pending', label: 'En attente', icon: '⏳' },
    { value: 'processing', label: 'En cours', icon: '🔄' },
    { value: 'shipped', label: 'Expédiée', icon: '🚚' },
    { value: 'delivered', label: 'Livrée', icon: '✅' },
    { value: 'cancelled', label: 'Annulée', icon: '❌' }
  ];

  constructor(
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

    await this.loadOrders();
  }

  // Charger les commandes
  async loadOrders() {
    this.isLoading.set(true);
    try {
      const orders = await this.orderService.getAllOrders();
      this.orders.set(orders);
      this.filterOrders();
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      alert('Erreur lors du chargement des commandes');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Filtrer par statut
  filterOrders() {
    const status = this.selectedStatus();
    if (status === 'all') {
      this.filteredOrders.set(this.orders());
    } else {
      this.filteredOrders.set(
        this.orders().filter(order => order.status === status)
      );
    }
  }

  // Changer le statut
  selectStatus(status: string) {
    this.selectedStatus.set(status);
    this.filterOrders();
  }

  // Voir les détails
  viewDetails(order: Order) {
    this.selectedOrder.set(order);
  }

  // Fermer les détails
  closeDetails() {
    this.selectedOrder.set(null);
  }

  // Mettre à jour le statut
  async updateStatus(orderId: string, status: Order['status']) {
    if (!confirm(`Changer le statut en "${this.getStatusLabel(status)}" ?`)) {
      return;
    }

    try {
      await this.orderService.updateOrderStatus(orderId, status);
      alert('Statut mis à jour avec succès !');
      await this.loadOrders();
      this.closeDetails();
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  }

  // Marquer comme livrée
  async markAsDelivered(orderId: string) {
    await this.updateStatus(orderId, 'delivered');
  }

  // Obtenir le label du statut
  getStatusLabel(status: string): string {
    return this.statusOptions.find(opt => opt.value === status)?.label || status;
  }

  // Obtenir l'icône du statut
  getStatusIcon(status: string): string {
    return this.statusOptions.find(opt => opt.value === status)?.icon || '📦';
  }

  // Obtenir la classe du statut
  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return classes[status] || '';
  }

  // Compter les commandes par statut
  getOrderCountByStatus(status: string): number {
    if (status === 'all') {
      return this.orders().length;
    }
    return this.orders().filter(o => o.status === status).length;
  }

  // Déconnexion
  async logout() {
    await this.authService.logout();
  }
}
