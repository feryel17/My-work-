# 🔍 Guide de Dépannage - Dashboard Admin

## Problème : L'admin ne voit pas les produits

### Vérifications :

#### 1. **Ouvrir la Console du Navigateur**
- Appuyez sur `F12` dans votre navigateur
- Allez dans l'onglet **Console**
- Cherchez les messages avec des icônes 🔍 📦 ✅ ❌

#### 2. **Vérifier les logs**
Vous devriez voir :
```
🔍 Chargement des produits depuis Firestore...
📦 Documents trouvés: X
✅ X produits chargés avec succès
```

Si vous voyez :
```
📦 Documents trouvés: 0
⚠️ Aucun produit trouvé dans Firestore
```
→ **Cela signifie que votre collection `products` est vide**

### Solution : Ajouter des produits

#### **Option 1 : Via l'interface Admin**
1. Connectez-vous en tant qu'admin
2. Sur le dashboard, cliquez sur "➕ Ajouter un produit"
3. Remplissez le formulaire
4. Cliquez sur "Ajouter le produit"

#### **Option 2 : Via la console Firebase**
1. Allez sur https://console.firebase.google.com/
2. Sélectionnez votre projet
3. Allez dans **Firestore Database**
4. Créez la collection `products` si elle n'existe pas
5. Ajoutez un document avec ces champs :

```javascript
{
  name: "Rouge à Lèvres Mat",
  price: 89.99,
  oldPrice: 120,
  category: "lipstick",
  brand: "Maybelline",
  stock: 50,
  description: "Rouge à lèvres mat longue tenue",
  images: ["https://via.placeholder.com/300"],
  featured: true,
  rating: 4.5,
  reviews: 128,
  createdAt: [Timestamp - Date actuelle]
}
```

#### **Option 3 : Script automatique (Données de test)**
1. Lancez votre application : `ng serve`
2. Connectez-vous en tant qu'admin
3. Ouvrez la console du navigateur (F12)
4. Copiez-collez le contenu du fichier `scripts/add-test-data.js`
5. Exécutez : `addTestProducts()`

---

## Problème : L'admin ne voit pas les commandes

### Vérifications :

#### 1. **Ouvrir la Console du Navigateur**
Cherchez les logs :
```
🔍 Récupération des commandes depuis Firestore...
📦 Commandes trouvées: X
✅ X commandes chargées avec succès
```

Si vous voyez :
```
📦 Commandes trouvées: 0
⚠️ Aucune commande trouvée dans Firestore
```
→ **Cela signifie que votre collection `orders` est vide**

### Solution : Ajouter des commandes de test

#### **Option 1 : Passer une commande en tant que client**
1. Déconnectez-vous de l'admin
2. Créez un compte utilisateur normal
3. Ajoutez des produits au panier
4. Finalisez une commande
5. Reconnectez-vous en admin
6. La commande devrait apparaître

#### **Option 2 : Via la console Firebase**
1. Allez sur https://console.firebase.google.com/
2. Sélectionnez votre projet
3. Allez dans **Firestore Database**
4. Créez la collection `orders` si elle n'existe pas
5. Ajoutez un document avec cette structure :

```javascript
{
  userId: "test-user-123",
  userEmail: "client@example.com",
  userName: "Marie Dubois",
  items: [
    {
      productId: "prod-123",
      productName: "Rouge à Lèvres Mat",
      productImage: "https://via.placeholder.com/300",
      quantity: 2,
      price: 89.99
    }
  ],
  totalAmount: 179.98,
  status: "pending",
  shippingAddress: {
    fullName: "Marie Dubois",
    address: "123 Rue de la Paix",
    city: "Paris",
    postalCode: "75001",
    phone: "0612345678"
  },
  paymentMethod: "Carte bancaire",
  createdAt: [Timestamp - Date actuelle],
  updatedAt: [Timestamp - Date actuelle]
}
```

#### **Option 3 : Script automatique (Données de test)**
1. Lancez votre application
2. Connectez-vous en tant qu'admin
3. Ouvrez la console du navigateur (F12)
4. Copiez-collez le contenu du fichier `scripts/add-test-data.js`
5. Exécutez : `addTestOrders()`

#### **Option 4 : Ajouter tout d'un coup**
Dans la console du navigateur :
```javascript
addAllTestData()
```
Cela ajoutera :
- ✅ 6 produits de test
- ✅ 4 commandes de test

---

## Problème : Erreur "Permission denied"

### Cause :
Les règles Firestore n'autorisent pas l'accès

### Solution :
Configurez les règles Firestore :

1. Firebase Console > **Firestore Database** > **Rules**
2. Remplacez par ces règles :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products - Tout le monde peut lire, seuls les admins peuvent écrire
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders - L'utilisateur peut voir ses commandes, l'admin peut tout voir
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

3. Cliquez sur **Publier**

---

## Problème : Les statistiques affichent 0

### Cause :
Les collections sont vides ou les données ne sont pas chargées

### Vérification :
Dans la console du navigateur, cherchez :
```
📊 Chargement des statistiques...
📈 Statistiques des commandes: { total: 0, pending: 0, ... }
✅ Statistiques mises à jour: { totalProducts: 0, totalOrders: 0, ... }
```

### Solution :
1. Ajoutez des produits (voir ci-dessus)
2. Ajoutez des commandes (voir ci-dessus)
3. Rechargez la page admin
4. Les statistiques se mettront à jour automatiquement

---

## Checklist Complète de Dépannage

### ✅ Configuration Firebase
- [ ] Projet Firebase créé
- [ ] Firestore activé
- [ ] Règles Firestore configurées
- [ ] Authentication activée (Email/Password)

### ✅ Compte Admin
- [ ] Utilisateur créé dans Firebase Authentication
- [ ] Document créé dans collection `users` avec `role: "admin"`
- [ ] UID correspond entre Authentication et Firestore

### ✅ Collections Firestore
- [ ] Collection `users` existe avec au moins 1 document admin
- [ ] Collection `products` existe avec des produits
- [ ] Collection `orders` existe avec des commandes (optionnel au début)

### ✅ Application
- [ ] `ng serve` fonctionne sans erreurs
- [ ] Connexion admin réussie
- [ ] Redirection vers `/admin/dashboard`
- [ ] Console du navigateur sans erreurs

---

## Commandes Utiles

### Vérifier l'état de l'application
```bash
# Lancer l'application
cd makeup-ecommerce
ng serve

# Ouvrir dans le navigateur
# http://localhost:4200/login
```

### Tester la connexion admin
1. Email: `admin@makeupstore.com`
2. Password: `admin123`
3. Devrait rediriger vers `/admin/dashboard`

### Voir les logs détaillés
1. Ouvrir la console (F12)
2. Onglet **Console**
3. Chercher les emojis : 🔍 📦 ✅ ❌ ⚠️

---

## Support

Si le problème persiste :

1. **Vérifiez la console du navigateur** pour les erreurs
2. **Vérifiez la console Firebase** pour les règles
3. **Vérifiez que les collections existent** dans Firestore
4. **Testez avec des données de test** (script fourni)

---

## Résumé Rapide

**Pour voir les produits :**
→ Ajoutez des produits via le formulaire admin OU via Firebase Console OU via le script `addTestProducts()`

**Pour voir les commandes :**
→ Passez une commande en tant que client OU ajoutez manuellement dans Firestore OU via le script `addTestOrders()`

**Pour tout ajouter rapidement :**
```javascript
// Dans la console du navigateur (F12)
addAllTestData()
```
