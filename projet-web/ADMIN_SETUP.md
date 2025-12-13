# 🛠️ Guide d'Installation Admin

## Configuration de l'Admin dans Firebase

### Étape 1: Créer un utilisateur admin dans Firebase Authentication

1. Allez dans la console Firebase: https://console.firebase.google.com/
2. Sélectionnez votre projet **makeup-ecommerce-9d064**
3. Dans le menu, allez sur **Authentication** > **Users**
4. Cliquez sur **Add user**
5. Entrez les informations suivantes:
   - **Email**: admin@makeupstore.com (ou votre email)
   - **Password**: admin123 (ou votre mot de passe sécurisé)
6. Cliquez sur **Add user**
7. **Notez l'UID de l'utilisateur** (vous en aurez besoin pour l'étape suivante)

### Étape 2: Créer le document admin dans Firestore

1. Dans la console Firebase, allez sur **Firestore Database**
2. Si la collection `users` n'existe pas, créez-la:
   - Cliquez sur **Start collection**
   - Nom de la collection: `users`
   
3. Créez un document avec l'**UID de l'utilisateur** comme ID de document:
   - Document ID: `[UID de l'étape 1]` (ex: `xYz123abc...`)
   - Ajoutez les champs suivants:

```
uid: [même UID que l'ID du document]
email: admin@makeupstore.com
firstName: Admin
lastName: Store
role: admin
createdAt: [Date actuelle - utilisez le timestamp]
```

### Exemple de structure dans Firestore:

```
Collection: users
  Document: xYz123abc456def789
    - uid: "xYz123abc456def789"
    - email: "admin@makeupstore.com"
    - firstName: "Admin"
    - lastName: "Store"
    - role: "admin"
    - createdAt: Timestamp (12/11/2025)
```

### Étape 3: Configuration des règles Firestore (Important!)

Dans **Firestore Database** > **Rules**, ajoutez ces règles:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Règles pour les utilisateurs
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Règles pour les produits
    match /products/{productId} {
      allow read: if true; // Tout le monde peut lire
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Règles pour les commandes
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

## Utilisation

### Se connecter en tant qu'Admin:

1. Lancez l'application: `ng serve`
2. Allez sur http://localhost:4200/login
3. Entrez les identifiants:
   - **Email**: admin@makeupstore.com
   - **Password**: admin123
4. Cliquez sur **Se connecter**
5. Vous serez automatiquement redirigé vers `/admin/dashboard`

### Fonctionnalités Admin:

#### Dashboard (/admin/dashboard)
- 📊 Statistiques globales (produits, commandes, revenus)
- ➕ Ajouter des produits
- ✏️ Modifier des produits
- 🗑️ Supprimer des produits
- ⭐ Marquer un produit comme "en vedette"

#### Gestion des Commandes (/admin/orders)
- 📦 Voir toutes les commandes
- 🔍 Filtrer par statut (en attente, en cours, expédiée, livrée, annulée)
- 👁️ Voir les détails complets d'une commande
- 🔄 Changer le statut d'une commande
- ✅ Marquer comme livrée

### Navigation Admin:

```
/admin/dashboard  → Gestion des produits
/admin/orders     → Gestion des commandes
```

## Sécurité

- ✅ Les routes admin sont protégées par un Guard
- ✅ Seuls les utilisateurs avec `role: 'admin'` peuvent y accéder
- ✅ La redirection est automatique lors de la connexion
- ✅ Les règles Firestore protègent les données côté serveur

## Dépannage

### Problème: "Accès refusé" sur les routes admin
**Solution**: Vérifiez que le document dans Firestore a bien `role: "admin"`

### Problème: Erreur lors de la connexion
**Solution**: Vérifiez que l'email et le mot de passe sont corrects dans Firebase Authentication

### Problème: Impossible de modifier/supprimer des produits
**Solution**: Vérifiez les règles Firestore et assurez-vous qu'elles permettent les opérations d'écriture pour les admins

### Problème: Les commandes ne s'affichent pas
**Solution**: Assurez-vous que la collection `orders` existe dans Firestore

## Création d'autres admins

Pour créer d'autres comptes admin, répétez les étapes 1 et 2 avec de nouveaux emails.
