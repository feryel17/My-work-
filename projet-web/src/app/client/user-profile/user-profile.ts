import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {
  userData: any = null;
  isEditing = false;
  isSaving = false;
  isEditingAddress = false;
  isSavingAddress = false;
  orders: Order[] = [];
  showOrderLogs = true;
  showPasswordForm = false;
  newPassword = '';
  confirmPassword = '';
  passwordMessage = '';
  passwordSuccess = false;

  editData = {
    firstName: '',
    lastName: ''
  };

  editAddress = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private orderService: OrderService
  ) {}

  async ngOnInit(): Promise<void> {
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Charger les données utilisateur
    this.userData = this.authService.getUserData();
    console.log('👤 Données utilisateur:', this.userData);
    
    if (this.userData) {
      this.editData.firstName = this.userData.firstName || '';
      this.editData.lastName = this.userData.lastName || '';
      this.editAddress = this.userData.address || '';
    }

    // Charger les commandes
    await this.loadOrders();
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Réinitialiser si annulation
      this.editData.firstName = this.userData?.firstName || '';
      this.editData.lastName = this.userData?.lastName || '';
    }
  }

  async saveProfile(): Promise<void> {
    if (!this.editData.firstName.trim() || !this.editData.lastName.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    this.isSaving = true;
    try {
      // Ici, vous pourriez mettre à jour les données dans Firestore
      console.log('Enregistrement du profil:', this.editData);
      this.userData.firstName = this.editData.firstName;
      this.userData.lastName = this.editData.lastName;
      this.isEditing = false;
      alert('✅ Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('❌ Erreur lors de la mise à jour du profil');
    } finally {
      this.isSaving = false;
    }
  }

  toggleAddressEdit(): void {
    this.isEditingAddress = !this.isEditingAddress;
    if (!this.isEditingAddress) {
      // Réinitialiser si annulation
      this.editAddress = this.userData?.address || '';
    }
  }

  async saveAddress(): Promise<void> {
    if (!this.editAddress.trim()) {
      alert('Veuillez entrer une adresse');
      return;
    }

    this.isSavingAddress = true;
    try {
      // Ici, vous pourriez mettre à jour l'adresse dans Firestore
      console.log('Enregistrement de l\'adresse:', this.editAddress);
      this.userData.address = this.editAddress;
      this.isEditingAddress = false;
      alert('✅ Adresse enregistrée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'adresse:', error);
      alert('❌ Erreur lors de l\'enregistrement de l\'adresse');
    } finally {
      this.isSavingAddress = false;
    }
  }

  async changePassword(): Promise<void> {
    const email = this.userData?.email;
    if (!email) {
      alert('❌ Email introuvable');
      return;
    }

    if (confirm('Un email de réinitialisation va être envoyé à ' + email + '. Continuer ?')) {
      try {
        await this.authService.resetPassword(email);
        alert('✅ Email de réinitialisation envoyé ! Vérifiez votre boîte mail.');
      } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur lors de l\'envoi de l\'email');
      }
    }
  }

  async updatePassword(): Promise<void> {
    if (!this.newPassword || !this.confirmPassword) {
      this.passwordMessage = '❌ Veuillez remplir tous les champs';
      this.passwordSuccess = false;
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordMessage = '❌ Les mots de passe ne correspondent pas';
      this.passwordSuccess = false;
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordMessage = '❌ Le mot de passe doit contenir au moins 6 caractères';
      this.passwordSuccess = false;
      return;
    }

    try {
      // Récupérer l'utilisateur actuel Firebase
      const user = this.authService.getCurrentUser();
      if (!user) {
        this.passwordMessage = '❌ Utilisateur non trouvé';
        this.passwordSuccess = false;
        return;
      }

      // Utiliser updatePassword de Firebase Auth
      await this.authService.updateUserPassword(this.newPassword);
      
      this.passwordMessage = '✅ Mot de passe mis à jour avec succès !';
      this.passwordSuccess = true;
      this.newPassword = '';
      this.confirmPassword = '';
      
      // Réinitialiser le message après 3 secondes
      setTimeout(() => {
        this.passwordMessage = '';
      }, 3000);
    } catch (error: any) {
      console.error('Erreur mise à jour mot de passe:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        this.passwordMessage = '❌ Veuillez vous reconnecter pour changer le mot de passe';
      } else if (error.code === 'auth/weak-password') {
        this.passwordMessage = '❌ Le mot de passe est trop faible';
      } else {
        this.passwordMessage = '❌ Erreur lors de la mise à jour du mot de passe';
      }
      this.passwordSuccess = false;
    }
  }

  toggleOrderLogs(): void {
    this.showOrderLogs = !this.showOrderLogs;
    console.log('📋 Logs commandes:', this.showOrderLogs ? 'Affichées' : 'Masquées');
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      // Réinitialiser les champs si on annule
      this.newPassword = '';
      this.confirmPassword = '';
      this.passwordMessage = '';
    }
    console.log('🔐 Formulaire mot de passe:', this.showPasswordForm ? 'Affiché' : 'Masqué');
  }

  async loadOrders(): Promise<void> {
    try {
      const userId = this.userData?.uid;
      console.log('🔍 Tentative chargement commandes...');
      console.log('userData complet:', this.userData);
      console.log('userId extrait:', userId);
      
      if (!userId) {
        console.error('❌ Pas de userId disponible!');
        console.error('Données complètes userData:', JSON.stringify(this.userData));
        this.orders = [];
        return;
      }
      
      console.log('🔍 Chargement des commandes pour userId:', userId);
      this.orders = await this.orderService.getUserOrders(userId);
      console.log('✅ Commandes chargées:', this.orders.length, 'trouvées');
      console.log('Détail commandes:', this.orders);
    } catch (error) {
      console.error('❌ Erreur chargement commandes:', error);
      this.orders = [];
    }
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'En attente',
      'processing': 'En traitement',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée'
    };
    return labels[status] || status;
  }

  convertToDate(dateValue: any): Date {
    if (dateValue instanceof Date) {
      return dateValue;
    }
    if (typeof dateValue === 'string') {
      return new Date(dateValue);
    }
    if (dateValue && typeof dateValue === 'object' && 'toDate' in dateValue) {
      return dateValue.toDate();
    }
    return new Date();
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
    }
  }
}
