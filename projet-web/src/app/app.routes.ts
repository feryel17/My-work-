import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';

// Importez tous les composants
import { Home } from './client/home/home';
import { ProductList } from './client/product-list/product-list';
import { ProductDetail } from './client/product-detail/product-detail';
import { Cart } from './client/cart/cart';
import { Checkout } from './client/checkout/checkout';
import { Login } from './client/login/login';
import { Register } from './client/register/register';
import { UserProfile } from './client/user-profile/user-profile';

export const routes: Routes = [
  { path: '', component: Home, title: 'Accueil - Makeup Store' },
  { path: 'products', component: ProductList, title: 'Produits - Makeup Store' },
  { path: 'product/:id', component: ProductDetail, title: 'Détail Produit - Makeup Store' },
  {
    path: 'cart', 
    loadComponent: () => import('./client/cart/cart').then(m => m.Cart),
    canActivate: [authGuard],
    title: 'Panier - Makeup Store'
  },
  { 
    path: 'checkout', 
    component: Checkout, 
    canActivate: [authGuard],
    title: 'Paiement - Makeup Store'
  },
 { 
    path: 'login', 
    loadComponent: () => import('./client/login/login').then(m => m.Login),
    title: 'Connexion - Makeup Store' 
  },
  
  { 
    path: 'register', 
    loadComponent: () => import('./client/register/register').then(m => m.Register),
    title: 'Inscription - Makeup Store' 
  },
  
  { 
    path: 'profile', 
    loadComponent: () => import('./client/user-profile/user-profile').then(m => m.UserProfile),
    title: 'Mon Compte - Makeup Store' 
  },

  // Routes Admin (protégées)
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./admin/dashboard/dashboard').then(m => m.AdminDashboard),
    canActivate: [adminGuard],
    title: 'Dashboard Admin - Makeup Store'
  },
  {
    path: 'admin/orders',
    loadComponent: () => import('./admin/orders/orders').then(m => m.AdminOrders),
    canActivate: [adminGuard],
    title: 'Gestion Commandes - Makeup Store'
  },
  
  // Redirection pour les pages non trouvées
  { path: '**', redirectTo: '', title: 'Page non trouvée' }
];