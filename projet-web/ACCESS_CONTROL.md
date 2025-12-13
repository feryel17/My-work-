# 🔐 Système de Contrôle d'Accès

## Vue d'ensemble

Le système de contrôle d'accès est maintenant complet avec trois niveaux d'utilisateurs :

### 🌐 Visiteurs (Non connectés)
**Accès autorisé :**
- ✅ Page d'accueil (`/`)
- ✅ Liste des produits (`/products`)
- ✅ Détails des produits (`/product/:id`)
- ✅ Catégories (via menu déroulant)

**Accès refusé :**
- ❌ Panier (`/cart`) - Redirige vers `/login`
- ❌ Checkout (`/checkout`) - Redirige vers `/login`
- ❌ Profil utilisateur (`/profile`) - Redirige vers `/login`

**Comportement UI :**
- Le lien "Panier" dans le header est masqué pour les visiteurs
- Un message s'affiche pour se connecter si besoin

---

### 👤 Utilisateurs authentifiés
**Accès autorisé :**
- ✅ Toutes les pages visiteurs
- ✅ Panier (`/cart`)
- ✅ Checkout (`/checkout`)
- ✅ Profil utilisateur (`/profile`)

**Accès refusé :**
- ❌ Dashboard Admin (`/admin/dashboard`) - Redirige vers `/login`
- ❌ Gestion des commandes (`/admin/orders`) - Redirige vers `/login`

**Comportement UI :**
- Le lien "Panier" apparaît dans le header
- Badge avec nombre d'articles dans le panier
- Menu compte avec profil et déconnexion

**Enregistrement dans Firebase :**
```typescript
// Collection: users
{
  uid: string,
  email: string,
  firstName: string,
  lastName: string,
  role: 'user',  // Automatique lors de l'inscription
  createdAt: Date
}
```

**Commandes :**
```typescript
// Collection: orders
{
  id: string,
  userId: string,  // UID de l'utilisateur
  userEmail: string,
  userName: string,
  items: OrderItem[],
  totalAmount: number,
  shippingAddress: {...},
  paymentMethod: 'card' | 'cash',
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  notes: string,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 👑 Administrateur
**Email admin :** `admin@makeup.com`

**Accès autorisé :**
- ✅ Toutes les pages utilisateurs
- ✅ Dashboard Admin (`/admin/dashboard`)
- ✅ Gestion des commandes (`/admin/orders`)

**Comportement UI :**
- Lien "Dashboard Admin" apparaît dans le header (violet)
- Accès à la gestion des produits (ajout/modification/suppression)
- Visualisation et gestion de toutes les commandes
- Statistiques en temps réel

---

## 🛡️ Guards de sécurité

### 1. authGuard
**Fichier :** `src/app/guards/auth.guard.ts`

**Rôle :** Protège les routes nécessitant une authentification

**Routes protégées :**
- `/cart`
- `/checkout`
- `/profile`

**Comportement :**
```typescript
if (!authService.isAuthenticated()) {
  // Redirige vers /login avec l'URL de retour
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url }
  });
}
```

**Exemple de flux :**
1. Visiteur clique sur "Ajouter au panier"
2. Tente d'accéder à `/cart`
3. authGuard détecte qu'il n'est pas connecté
4. Redirige vers `/login?returnUrl=/cart`
5. Après connexion réussie, redirige vers `/cart`

### 2. adminGuard
**Fichier :** `src/app/guards/admin.guard.ts`

**Rôle :** Protège les routes réservées aux administrateurs

**Routes protégées :**
- `/admin/dashboard`
- `/admin/orders`

**Comportement :**
```typescript
if (!authService.isAdmin()) {
  router.navigate(['/login']);
  return false;
}
```

---

## 🔄 Flux de connexion intelligente

### Connexion standard
```typescript
// login.ts
async onSubmit() {
  await authService.login(loginData);
  
  // Vérifie s'il y a une URL de retour
  if (this.returnUrl) {
    router.navigateByUrl(this.returnUrl);
  } 
  // Sinon, redirige selon le rôle
  else if (authService.isAdmin()) {
    router.navigate(['/admin/dashboard']);
  } else {
    router.navigate(['/profile']);
  }
}
```

### Scénario 1 : Navigation directe vers login
1. Utilisateur clique sur "Se connecter"
2. Connexion réussie
3. **Admin →** `/admin/dashboard`
4. **User →** `/profile`

### Scénario 2 : Redirection depuis guard
1. Visiteur tente d'accéder à `/cart`
2. authGuard redirige vers `/login?returnUrl=/cart`
3. Connexion réussie
4. **Redirige vers** `/cart` (peu importe le rôle)

---

## 🎨 Adaptations UI

### Header (src/app/shared/header/header.html)

**Panier visible uniquement si connecté :**
```html
<a *ngIf="authService.isAuthenticated()" 
   class="nav-item" 
   routerLink="/cart">
  <span class="nav-cart-wrapper">
    Panier
    <span class="nav-cart-badge" *ngIf="cartCount > 0">
      {{cartCount}}
    </span>
  </span>
</a>
```

**Dashboard admin visible uniquement pour admin :**
```html
<a *ngIf="authService.isAdmin()" 
   class="dropdown-item admin-link" 
   routerLink="/admin/dashboard">
  <i class="material-icons">dashboard</i>
  Dashboard Admin
</a>
```

---

## 📋 Routes configurées

### Routes publiques (pas de guard)
```typescript
{ path: '', component: Home },
{ path: 'products', component: ProductList },
{ path: 'product/:id', component: ProductDetail },
{ path: 'login', component: Login },
{ path: 'register', component: Register }
```

### Routes protégées par authGuard
```typescript
{ 
  path: 'cart', 
  component: Cart,
  canActivate: [authGuard]
},
{ 
  path: 'checkout', 
  component: Checkout,
  canActivate: [authGuard]
},
{ 
  path: 'profile', 
  component: UserProfile,
  canActivate: [authGuard]
}
```

### Routes protégées par adminGuard
```typescript
{ 
  path: 'admin/dashboard', 
  component: Dashboard,
  canActivate: [adminGuard]
},
{ 
  path: 'admin/orders', 
  component: Orders,
  canActivate: [adminGuard]
}
```

---

## ✅ Test du système

### Test 1 : Navigation visiteur
1. Ouvrir l'application sans connexion
2. ✅ Vérifier que le panier n'apparaît pas dans le header
3. ✅ Naviguer vers `/products` → OK
4. ✅ Cliquer sur un produit → OK
5. ❌ Essayer d'accéder à `/cart` → Redirige vers login
6. ❌ Essayer d'accéder à `/checkout` → Redirige vers login

### Test 2 : Inscription et commande
1. Créer un nouveau compte via `/register`
2. ✅ Vérifier que l'utilisateur apparaît dans Firebase users (role: 'user')
3. ✅ Le panier apparaît dans le header
4. Ajouter des produits au panier
5. Aller au checkout et valider
6. ✅ Vérifier que la commande apparaît dans Firebase orders avec le bon userId
7. ✅ Se connecter en admin et vérifier que la commande apparaît dans `/admin/orders`

### Test 3 : Connexion admin
1. Se connecter avec `admin@makeup.com`
2. ✅ Redirige vers `/admin/dashboard`
3. ✅ Lien "Dashboard Admin" visible dans header
4. ✅ Accès à la gestion des produits
5. ✅ Accès aux commandes avec toutes les commandes utilisateurs

### Test 4 : ReturnUrl
1. Se déconnecter
2. Essayer d'accéder à `/checkout`
3. ✅ Redirige vers `/login?returnUrl=/checkout`
4. Se connecter
5. ✅ Redirige automatiquement vers `/checkout`

---

## 🔧 Configuration Firebase

### Collections utilisées
1. **users** - Comptes utilisateurs (admin + users)
2. **produits** - Catalogue de produits
3. **orders** - Commandes clients

### Règles de sécurité recommandées
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Produits - lecture publique
    match /produits/{productId} {
      allow read: if true;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 🎯 Résumé des modifications

### Fichiers créés
1. `src/app/guards/auth.guard.ts` - Guard d'authentification

### Fichiers modifiés
1. `src/app/app.routes.ts` - Ajout de authGuard sur cart/checkout
2. `src/app/shared/header/header.html` - Masquage conditionnel du panier
3. `src/app/client/login/login.ts` - Gestion du returnUrl
4. `src/app/services/auth.ts` - Retrait de la redirection automatique
5. `src/app/client/checkout/checkout.ts` - Enregistrement des commandes dans Firebase

### Résultat
✅ Système de contrôle d'accès à trois niveaux opérationnel
✅ Redirection intelligente selon le contexte
✅ Expérience utilisateur fluide
✅ Sécurité renforcée
✅ Toutes les commandes enregistrées avec userId
