import { Injectable, signal } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updatePassword
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  getDoc, 
  setDoc,
  Timestamp
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { CartService } from './cart';

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData extends LoginData {
  firstName: string;
  lastName: string;
  confirmPassword: string;
}

export interface UserData {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  role: 'admin' | 'user';
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // États de l'authentification
  currentUser = signal<User | null>(null);
  currentUserData = signal<UserData | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private cartService: CartService
  ) {
    // Écouter les changements d'état d'authentification
    this.initAuthListener();
  }

  // Initialiser l'écouteur d'authentification
  private initAuthListener(): void {
    onAuthStateChanged(this.auth, async (user) => {
      this.currentUser.set(user);
      if (user) {
        // Charger les données utilisateur depuis Firestore
        await this.loadUserData(user.uid);
      } else {
        this.currentUserData.set(null);
      }
      console.log('État auth changé:', user ? 'Connecté' : 'Déconnecté');
    });
  }

  // Charger les données utilisateur depuis Firestore
  private async loadUserData(uid: string): Promise<void> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;
        // S'assurer que le uid est toujours présent
        userData.uid = uid;
        this.currentUserData.set(userData);
        console.log('✅ Données utilisateur chargées:', userData);
      } else {
        console.warn('⚠️ Document utilisateur non trouvé pour uid:', uid);
      }
    } catch (error) {
      console.error('❌ Erreur chargement données utilisateur:', error);
    }
  }

  // Connexion
  async login(loginData: LoginData): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth, 
        loginData.email, 
        loginData.password
      );
      
      // Sauvegarder dans localStorage si "Se souvenir de moi"
      if (loginData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      // Charger les données utilisateur
      await this.loadUserData(userCredential.user.uid);
      
      // Vider le panier pour ce nouvel utilisateur (premier accès)
      this.cartService.clearCart();
      
      console.log('Connexion réussie pour:', loginData.email);
      // La redirection est gérée par le composant Login
      
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      
      // Messages d'erreur personnalisés
      switch (error.code) {
        case 'auth/user-not-found':
          this.errorMessage.set('Aucun compte trouvé avec cet email.');
          break;
        case 'auth/wrong-password':
          this.errorMessage.set('Mot de passe incorrect.');
          break;
        case 'auth/invalid-email':
          this.errorMessage.set('Format d\'email invalide.');
          break;
        case 'auth/too-many-requests':
          this.errorMessage.set('Trop de tentatives. Réessayez plus tard.');
          break;
        case 'auth/invalid-credential':
          this.errorMessage.set('Email ou mot de passe incorrect.');
          break;
        default:
          this.errorMessage.set('Erreur de connexion. Veuillez réessayer.');
      }
      throw error;
      
    } finally {
      this.isLoading.set(false);
    }
  }

  // Inscription
  async register(registerData: RegisterData, redirectTo: string = '/profile'): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      this.errorMessage.set('Les mots de passe ne correspondent pas.');
      this.isLoading.set(false);
      throw new Error('Les mots de passe ne correspondent pas.');
    }

    try {
      console.log('🔄 Création du compte Firebase Auth pour:', registerData.email);
      
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        registerData.email,
        registerData.password
      );
      
      console.log('✅ Compte Firebase Auth créé, UID:', userCredential.user.uid);
      
      // Créer le document utilisateur dans Firestore
      const userData: UserData = {
        uid: userCredential.user.uid,
        email: registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        role: 'user',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      console.log('🔄 Enregistrement dans Firestore users...');
      await setDoc(doc(this.firestore, 'users', userCredential.user.uid), userData);
      console.log('✅ Document Firestore créé avec succès');
      
      this.currentUserData.set(userData);
      
      console.log('✅ Inscription réussie:', registerData.email);
      
      // Déconnecter l'utilisateur après l'inscription pour forcer la page de login
      await signOut(this.auth);
      this.currentUser.set(null);
      this.currentUserData.set(null);
      
      this.router.navigate([redirectTo]);
      
    } catch (error: any) {
      console.error('❌ Erreur d\'inscription:', error);
      console.error('Code erreur:', error.code);
      console.error('Message erreur:', error.message);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.errorMessage.set('Cet email est déjà utilisé.');
          break;
        case 'auth/weak-password':
          this.errorMessage.set('Le mot de passe est trop faible (minimum 6 caractères).');
          break;
        case 'auth/invalid-email':
          this.errorMessage.set('Format d\'email invalide.');
          break;
        case 'permission-denied':
          this.errorMessage.set('Erreur de permissions Firestore. Vérifiez les règles de sécurité.');
          break;
        default:
          this.errorMessage.set('Erreur d\'inscription: ' + error.message);
      }
      
      throw error;
      
    } finally {
      this.isLoading.set(false);
    }
  }

  // Déconnexion
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      localStorage.removeItem('rememberMe');
      
      // Vider le panier lors de la déconnexion
      this.cartService.clearCart();
      
      this.router.navigate(['/login']);
      console.log('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  }

  // Réinitialisation de mot de passe
  async resetPassword(email: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await sendPasswordResetEmail(this.auth, email);
      alert('Email de réinitialisation envoyé !');
      
    } catch (error: any) {
      console.error('Erreur réinitialisation:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          this.errorMessage.set('Aucun compte trouvé avec cet email.');
          break;
        case 'auth/invalid-email':
          this.errorMessage.set('Format d\'email invalide.');
          break;
        default:
          this.errorMessage.set('Erreur. Veuillez réessayer.');
      }
      
    } finally {
      this.isLoading.set(false);
    }
  }

  // Vérifier si connecté
  isAuthenticated(): boolean {
    return !!this.currentUser();
  }

  // Vérifier si admin
  isAdmin(): boolean {
    return this.currentUserData()?.role === 'admin';
  }

  // Récupérer l'utilisateur actuel
  getUser(): User | null {
    return this.currentUser();
  }

  // Récupérer l'utilisateur actuel (alias)
  getCurrentUser(): User | null {
    return this.currentUser();
  }

  // Mettre à jour le mot de passe
  async updateUserPassword(newPassword: string): Promise<void> {
    try {
      const user = this.currentUser();
      if (!user) {
        throw new Error('Aucun utilisateur connecté');
      }
      
      await updatePassword(user, newPassword);
      console.log('✅ Mot de passe mis à jour avec succès');
      alert('✅ Mot de passe mis à jour avec succès !');
    } catch (error: any) {
      console.error('❌ Erreur mise à jour mot de passe:', error);
      throw error;
    }
  }

  // Récupérer les données utilisateur
  getUserData(): UserData | null {
    return this.currentUserData();
  }
}