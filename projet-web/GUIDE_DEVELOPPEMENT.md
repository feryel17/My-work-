# 📋 Guide de Développement - Makeup E-Commerce

## Ce que j'ai fait

### **1. Créé un Service ProductService**
Fichier : `src/app/services/product.service.ts`

```typescript
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private firestore: Firestore) { }
  
  async addSampleProducts() { ... }
}
```

**À quoi ça sert :**
- Un **service** est une classe qui contient la logique métier
- `providedIn: 'root'` = disponible partout dans l'app
- `firestore: Firestore` = accès à la base de données Firebase

### **2. Fonction addSampleProducts()**

```typescript
async addSampleProducts() {
  const products = [ ... ];
  
  for (const product of products) {
    await addDoc(collection(this.firestore, 'products'), {
      ...product,
      createdAt: new Date()
    });
  }
}
```

**Explication :**
- `async/await` = attend que les données s'enregistrent
- `for` = boucle sur chaque produit
- `addDoc()` = ajoute un document dans Firestore
- `collection()` = pointe vers la collection 'products'
- `createdAt: new Date()` = ajoute la date actuelle

### **3. Injecté le service dans le composant App**

Fichier modifié : `src/app/app.ts`

```typescript
export class App implements OnInit {
  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.addSampleProducts();
  }
}
```

**Explication :**
- `constructor(private productService: ProductService)` = injecte le service
- `ngOnInit()` = s'exécute au démarrage du composant
- `this.productService.addSampleProducts()` = appelle la fonction

---

## 🚀 Comment continuer tout seul

### **Pour ajouter d'autres fonctions au service :**

**Exemple 1 : Récupérer tous les produits**

```typescript
async getAllProducts(): Promise<Product[]> {
  const querySnapshot = await getDocs(collection(this.firestore, 'products'));
  const products: Product[] = [];
  
  querySnapshot.forEach((doc) => {
    products.push({
      id: doc.id,
      ...doc.data() as Product
    });
  });
  
  return products;
}
```

**Exemple 2 : Filtrer par catégorie**

```typescript
async getProductsByCategory(category: string): Promise<Product[]> {
  const q = query(
    collection(this.firestore, 'products'), 
    where('category', '==', category)
  );
  const querySnapshot = await getDocs(q);
  // ... même logique
}
```

### **Pour utiliser ces fonctions dans un composant :**

```typescript
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    this.products = await this.productService.getAllProducts();
  }
}
```

### **Structure générale à respecter :**

```
Service (ProductService)
  ├── addSampleProducts()     ← ajouter des données
  ├── getAllProducts()        ← récupérer toutes les données
  ├── getProductsByCategory() ← filtrer les données
  └── addProduct()           ← ajouter UN produit

Composant (App, ProductList, etc.)
  └── Utilise le service via constructor injection
```

---

## 📝 Checklist pour ajouter vos propres fonctions

1. **Ouvrez `product.service.ts`**
2. **Ajoutez une nouvelle fonction async**
3. **Importez les imports Firebase nécessaires** (addDoc, getDocs, query, where, etc.)
4. **Testez dans un composant** en appelant la fonction dans `ngOnInit()`

---

## 📌 Configuration Firebase - Résumé

### Fichiers clés :
- `src/app/firebase.config.ts` - Configuration Firebase avec identifiants
- `src/app/app.config.ts` - Initialisation Firebase dans l'app
- `src/app/services/product.service.ts` - Service pour gérer les produits

### Services Firebase activés :
- ✅ Authentication (Auth)
- ✅ Firestore Database (db)
- ✅ Cloud Storage (storage)

### Interface Product :
```typescript
export interface Product {
  id?: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  description: string;
  images: string[];
  featured: boolean;
  createdAt?: Date;
}
```

---

## 🎯 Prochaines étapes possibles

1. Créer des composants pour afficher les produits
2. Ajouter un panier d'achat
3. Implémenter l'authentification des utilisateurs
4. Créer un système de commandes
5. Ajouter un système d'admin pour gérer les produits

---

**Date de création :** 4 Décembre 2025
**Projet :** Makeup E-Commerce
**Framework :** Angular 21 + Firebase
