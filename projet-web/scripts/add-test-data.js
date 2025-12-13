// Script pour ajouter des données de test dans Firebase
// Exécutez ce code depuis la console du navigateur sur votre application

// 1. Ajouter des produits de test
async function addTestProducts() {
  const { collection, addDoc, getFirestore } = await import('firebase/firestore');
  const db = getFirestore();
  
  const products = [
    {
      name: "Rouge à Lèvres Mat Longue Tenue",
      price: 89.99,
      oldPrice: 120,
      category: "lipstick",
      brand: "Maybelline",
      stock: 50,
      description: "Rouge à lèvres mat avec une tenue jusqu'à 16 heures. Formule confortable qui ne dessèche pas les lèvres.",
      images: ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500"],
      featured: true,
      rating: 4.5,
      reviews: 128,
      createdAt: new Date()
    },
    {
      name: "Fond de Teint Hydratant FPS 30",
      price: 199.99,
      oldPrice: 250,
      category: "foundation",
      brand: "L'Oréal",
      stock: 35,
      description: "Fond de teint avec protection solaire pour une peau parfaite et protégée toute la journée.",
      images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500"],
      featured: true,
      rating: 4.8,
      reviews: 256,
      createdAt: new Date()
    },
    {
      name: "Mascara Volume XXL",
      price: 79.99,
      oldPrice: 95,
      category: "mascara",
      brand: "NYX",
      stock: 45,
      description: "Mascara pour des cils volumineux et courbés. Résiste à l'eau.",
      images: ["https://images.unsplash.com/photo-1631214524020-7e18db4a8b1a?w=500"],
      featured: false,
      rating: 4.3,
      reviews: 89,
      createdAt: new Date()
    },
    {
      name: "Palette Ombres à Paupières Nude",
      price: 149.99,
      oldPrice: 180,
      category: "eyeshadow",
      brand: "Urban Decay",
      stock: 25,
      description: "12 teintes nude pour un maquillage naturel ou sophistiqué.",
      images: ["https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500"],
      featured: true,
      rating: 4.9,
      reviews: 342,
      createdAt: new Date()
    },
    {
      name: "Blush Poudre Éclat",
      price: 69.99,
      category: "blush",
      brand: "MAC",
      stock: 60,
      description: "Blush poudre pour un teint frais et éclatant.",
      images: ["https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=500"],
      featured: false,
      rating: 4.4,
      reviews: 75,
      createdAt: new Date()
    },
    {
      name: "Eye-Liner Waterproof Noir",
      price: 59.99,
      category: "eyeliner",
      brand: "Sephora",
      stock: 5,
      description: "Eye-liner résistant à l'eau pour un regard intense.",
      images: ["https://images.unsplash.com/photo-1583241800698-b8c7be4c3ffb?w=500"],
      featured: false,
      rating: 4.2,
      reviews: 54,
      createdAt: new Date()
    }
  ];

  console.log('🚀 Ajout des produits de test...');
  
  for (const product of products) {
    try {
      const docRef = await addDoc(collection(db, 'products'), product);
      console.log(`✅ Produit ajouté: ${product.name} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`❌ Erreur pour ${product.name}:`, error);
    }
  }
  
  console.log('🎉 Produits ajoutés avec succès!');
}

// 2. Ajouter des commandes de test
async function addTestOrders() {
  const { collection, addDoc, getFirestore } = await import('firebase/firestore');
  const db = getFirestore();
  
  const orders = [
    {
      userId: "test-user-1",
      userEmail: "client1@example.com",
      userName: "Marie Dubois",
      items: [
        {
          productId: "prod1",
          productName: "Rouge à Lèvres Mat",
          productImage: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500",
          quantity: 2,
          price: 89.99
        },
        {
          productId: "prod2",
          productName: "Mascara Volume XXL",
          productImage: "https://images.unsplash.com/photo-1631214524020-7e18db4a8b1a?w=500",
          quantity: 1,
          price: 79.99
        }
      ],
      totalAmount: 259.97,
      status: "pending",
      shippingAddress: {
        fullName: "Marie Dubois",
        address: "123 Rue de la Paix",
        city: "Paris",
        postalCode: "75001",
        phone: "0612345678"
      },
      paymentMethod: "Carte bancaire",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      userId: "test-user-2",
      userEmail: "client2@example.com",
      userName: "Sophie Martin",
      items: [
        {
          productId: "prod3",
          productName: "Fond de Teint Hydratant",
          productImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500",
          quantity: 1,
          price: 199.99
        }
      ],
      totalAmount: 199.99,
      status: "processing",
      shippingAddress: {
        fullName: "Sophie Martin",
        address: "45 Avenue des Champs",
        city: "Lyon",
        postalCode: "69001",
        phone: "0623456789"
      },
      paymentMethod: "PayPal",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Il y a 1 jour
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      userId: "test-user-3",
      userEmail: "client3@example.com",
      userName: "Emma Laurent",
      items: [
        {
          productId: "prod4",
          productName: "Palette Ombres à Paupières",
          productImage: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500",
          quantity: 1,
          price: 149.99
        },
        {
          productId: "prod5",
          productName: "Blush Poudre",
          productImage: "https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=500",
          quantity: 1,
          price: 69.99
        }
      ],
      totalAmount: 219.98,
      status: "shipped",
      shippingAddress: {
        fullName: "Emma Laurent",
        address: "78 Boulevard Saint-Michel",
        city: "Marseille",
        postalCode: "13001",
        phone: "0634567890"
      },
      paymentMethod: "Carte bancaire",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      userId: "test-user-4",
      userEmail: "client4@example.com",
      userName: "Julie Petit",
      items: [
        {
          productId: "prod1",
          productName: "Rouge à Lèvres Mat",
          productImage: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500",
          quantity: 1,
          price: 89.99
        }
      ],
      totalAmount: 89.99,
      status: "delivered",
      shippingAddress: {
        fullName: "Julie Petit",
        address: "12 Rue Victor Hugo",
        city: "Toulouse",
        postalCode: "31000",
        phone: "0645678901"
      },
      paymentMethod: "Carte bancaire",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Il y a 10 jours
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ];

  console.log('🚀 Ajout des commandes de test...');
  
  for (const order of orders) {
    try {
      const docRef = await addDoc(collection(db, 'orders'), order);
      console.log(`✅ Commande ajoutée: ${order.userName} - ${order.status} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`❌ Erreur pour ${order.userName}:`, error);
    }
  }
  
  console.log('🎉 Commandes ajoutées avec succès!');
}

// 3. Ajouter tout
async function addAllTestData() {
  console.log('🎯 Ajout de toutes les données de test...');
  await addTestProducts();
  await addTestOrders();
  console.log('✨ Toutes les données de test ont été ajoutées!');
}

// Instructions d'utilisation:
console.log(`
╔════════════════════════════════════════════════════════════╗
║  Script d'ajout de données de test                        ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Pour ajouter des données de test, exécutez:              ║
║                                                            ║
║  1. Produits seulement:                                   ║
║     addTestProducts()                                      ║
║                                                            ║
║  2. Commandes seulement:                                  ║
║     addTestOrders()                                        ║
║                                                            ║
║  3. Tout (produits + commandes):                          ║
║     addAllTestData()                                       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

// Exporter les fonctions pour utilisation dans la console
window.addTestProducts = addTestProducts;
window.addTestOrders = addTestOrders;
window.addAllTestData = addAllTestData;
