# 🎨 Makeup E-Commerce - Documentation Complète

## 📋 Fonctionnalités Implémentées

### 👥 Partie Client
- ✅ Inscription et connexion utilisateur
- ✅ Navigation des produits par catégorie
- ✅ Détails des produits
- ✅ Panier d'achat
- ✅ Processus de commande (checkout)
- ✅ Profil utilisateur
- ✅ Historique des commandes

### 🛠️ Partie Admin
- ✅ Tableau de bord avec statistiques
- ✅ Gestion des produits (CRUD complet)
  - Ajouter un produit
  - Modifier un produit
  - Supprimer un produit
  - Marquer comme "en vedette"
- ✅ Gestion des commandes
  - Voir toutes les commandes
  - Filtrer par statut
  - Voir détails complets
  - Changer le statut
  - Marquer comme livrée
- ✅ Authentification avec redirection automatique
- ✅ Protection des routes admin avec Guard

## 🚀 Installation et Lancement

### Prérequis
- Node.js (v18 ou supérieur)
- npm (v9 ou supérieur)
- Angular CLI (v21 ou supérieur)

### Installation

```bash
# Naviguer dans le dossier du projet
cd makeup-ecommerce

# Installer les dépendances
npm install

# Lancer le serveur de développement
ng serve

# Ou avec npm
npm start
```

L'application sera accessible sur **http://localhost:4200/**

## 🔐 Configuration Admin

### 1. Créer l'utilisateur admin dans Firebase

#### Via Console Firebase:
1. Allez sur https://console.firebase.google.com/
2. Sélectionnez le projet **makeup-ecommerce-9d064**
3. **Authentication** > **Users** > **Add user**
4. Email: `admin@makeupstore.com`
5. Password: `admin123` (ou votre mot de passe)
6. **Copiez l'UID généré**

### 2. Créer le document dans Firestore

1. **Firestore Database** > Collection `users`
2. Créez un document avec l'**UID comme ID**
3. Ajoutez les champs:

```javascript
{
  uid: "votre-uid-ici",
  email: "admin@makeupstore.com",
  firstName: "Admin",
  lastName: "Store",
  role: "admin",
  createdAt: [Date actuelle]
}
```

### 3. Configurer les règles Firestore

Dans **Firestore Database** > **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                    (resource.data.userId == request.auth.uid || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 📱 Utilisation

### Connexion Admin

1. Allez sur http://localhost:4200/login
2. Entrez:
   - Email: `admin@makeupstore.com`
   - Password: `admin123`
3. Vous serez redirigé vers `/admin/dashboard`

### Routes Admin

| Route | Description |
|-------|-------------|
| `/admin/dashboard` | Dashboard avec gestion des produits |
| `/admin/orders` | Gestion des commandes |

### Routes Client

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil |
| `/products` | Liste des produits |
| `/product/:id` | Détail d'un produit |
| `/cart` | Panier |
| `/checkout` | Paiement |
| `/login` | Connexion |
| `/register` | Inscription |
| `/profile` | Profil utilisateur |

## 📂 Structure du Projet

```
src/app/
├── admin/
│   ├── dashboard/          # Gestion des produits
│   │   ├── dashboard.ts
│   │   ├── dashboard.html
│   │   └── dashboard.scss
│   └── orders/            # Gestion des commandes
│       ├── orders.ts
│       ├── orders.html
│       └── orders.scss
│
├── client/
│   ├── home/              # Page d'accueil
│   ├── product-list/      # Liste des produits
│   ├── product-detail/    # Détail produit
│   ├── cart/              # Panier
│   ├── checkout/          # Paiement
│   ├── login/             # Connexion
│   ├── register/          # Inscription
│   └── user-profile/      # Profil utilisateur
│
├── services/
│   ├── auth.ts            # Service d'authentification
│   ├── product.service.ts # Service produits
│   ├── order.service.ts   # Service commandes
│   └── cart.ts            # Service panier
│
├── guards/
│   └── admin.guard.ts     # Protection routes admin
│
├── shared/
│   ├── header/            # En-tête
│   ├── footer/            # Pied de page
│   └── product-card/      # Carte produit
│
├── app.routes.ts          # Configuration des routes
└── firebase.config.ts     # Configuration Firebase
```

## 🎯 Fonctionnalités Détaillées

### Dashboard Admin
- **Statistiques en temps réel**
  - Nombre total de produits
  - Nombre total de commandes
  - Revenu total
  - Commandes en attente

- **Gestion des produits**
  - Formulaire d'ajout avec tous les champs
  - Modification rapide via modal
  - Suppression avec confirmation
  - Vue en tableau avec images
  - Indication des produits en vedette
  - Alerte stock faible (< 10)

### Gestion des Commandes
- **Filtres par statut**
  - Toutes les commandes
  - En attente ⏳
  - En cours 🔄
  - Expédiée 🚚
  - Livrée ✅
  - Annulée ❌

- **Actions disponibles**
  - Voir détails complets
  - Changer le statut
  - Bouton rapide "Marquer livrée"
  - Visualisation des produits commandés
  - Informations client et livraison

### Système d'Authentification
- **Login intelligent**
  - Détection automatique du rôle
  - Redirection selon admin/user
  - "Se souvenir de moi"
  - Gestion des erreurs détaillée

- **Sécurité**
  - Guard pour routes admin
  - Vérification du rôle dans Firestore
  - Déconnexion sécurisée
  - Protection des données sensibles

## 🔧 Services Développés

### AuthService
```typescript
// Méthodes principales
login(loginData)           // Connexion avec redirection auto
register(registerData)     // Inscription
logout()                   // Déconnexion
isAdmin()                  // Vérifier si admin
isAuthenticated()          // Vérifier si connecté
```

### OrderService
```typescript
// Méthodes principales
createOrder(orderData)              // Créer commande
getAllOrders()                      // Toutes les commandes (admin)
getUserOrders(userId)               // Commandes utilisateur
updateOrderStatus(id, status)       // Changer statut
deleteOrder(id)                     // Supprimer
getOrderStats()                     // Statistiques
```

### ProductService
```typescript
// Méthodes principales
getProductsFromApi()                // Charger depuis API
getLocalProducts()                  // Données locales
getFeaturedProducts()               // Produits en vedette
getProductsByCategory(category)     // Par catégorie
```

## 🎨 Design et UX

- ✨ Design moderne et responsive
- 🎨 Gradient violet/bleu pour l'admin
- 📱 Mobile-first approach
- 🔔 Feedback utilisateur (alertes, confirmations)
- ⚡ Animations fluides
- 🎯 Navigation intuitive
- 📊 Tableaux et cartes bien organisés

## 🧪 Tests et Validation

### Scénarios à tester

#### Admin
1. ✅ Connexion admin
2. ✅ Ajout d'un produit
3. ✅ Modification d'un produit
4. ✅ Suppression d'un produit
5. ✅ Visualisation des commandes
6. ✅ Changement de statut de commande

#### Client
1. ✅ Inscription
2. ✅ Connexion
3. ✅ Navigation produits
4. ✅ Ajout au panier
5. ✅ Processus de commande
6. ✅ Visualisation profil

## 📝 Notes Importantes

### Base de données Firebase
- **Authentication**: Gestion des utilisateurs
- **Firestore Collections**:
  - `users` : Informations utilisateurs (avec role)
  - `products` : Catalogue de produits
  - `orders` : Commandes clients

### Variables d'environnement
Configuration Firebase dans `firebase.config.ts`:
```typescript
projectId: "makeup-ecommerce-9d064"
```

## 🐛 Dépannage

### Problème: Routes admin inaccessibles
**Solution**: Vérifiez que le rôle est bien "admin" dans Firestore

### Problème: Erreur de compilation
**Solution**: 
```bash
npm install
ng serve
```

### Problème: Données Firestore non chargées
**Solution**: Vérifiez les règles Firestore et la connexion internet

### Problème: Login ne redirige pas
**Solution**: Vérifiez que le document user existe dans Firestore avec le bon UID

## 🚀 Prochaines Étapes Possibles

- [ ] Upload d'images pour les produits
- [ ] Graphiques de statistiques avancées
- [ ] Notifications en temps réel
- [ ] Export des données (PDF, Excel)
- [ ] Gestion des catégories
- [ ] Système de promotions
- [ ] Chat support client
- [ ] Multi-langues

## 📞 Support

Pour toute question ou problème, consultez:
- [ADMIN_SETUP.md](ADMIN_SETUP.md) - Guide détaillé admin
- [GUIDE_DEVELOPPEMENT.md](GUIDE_DEVELOPPEMENT.md) - Guide développement

---

✨ **Makeup E-Commerce** - Plateforme complète avec gestion admin
