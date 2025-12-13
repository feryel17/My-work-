import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// VOS CLÉS FIREBASE (déjà correctes)
const firebaseConfig = {
  apiKey: "AIzaSyDSr0KLIkCO5n9_3UiPE9cpLcikqAn80Iw",
  authDomain: "makeup-ecommerce-9d064.firebaseapp.com",
  projectId: "makeup-ecommerce-9d064",
  storageBucket: "makeup-ecommerce-9d064.firebasestorage.app",
  messagingSenderId: "553649359368",
  appId: "1:553649359368:web:7558d574094b2e2c49dfbd",
  measurementId: "G-29YK6BTM2D"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 6 PRODUITS SELON VOTRE CAHIER DE CHARGES
const produits = [
  {
    // PRODUIT 1 - TEINT
    nom: "Fond de teint liquide Perfect Match",
    prix: 32.90,
    description: "Fond de teint longue tenue 24h, fini naturel et couvrant. Idéal pour les peaux mixtes à grasses. Résistant à l'eau.",
    stock: 45,
    marque: "L'Oréal Paris",
    categorie_id: "teint",
    images: ["C:\\roua\\projet_dev_web\\makeup-ecommerce\\src\\assets\\images\\products\\fond-de-teint.jpg"],
    note_moyenne: 4.5,
    couleurs_disponibles: ["Beige clair", "Beige naturel", "Beige doré"]
  },
  {
    // PRODUIT 2 - TEINT
    nom: "Blush poudré Rose Poudré",
    prix: 19.50,
    description: "Blush en poudre ultra-fine pour un effet bonne mine naturel. Texture légère qui fond sur la peau. Tenue 12h.",
    stock: 68,
    marque: "NYX Professional",
    categorie_id: "teint",
    images: ["C:\\roua\\projet_dev_web\\makeup-ecommerce\\src\\assets\\images\\products\\blush.jpg"],
    note_moyenne: 4.2,
    couleurs_disponibles: ["Rose poudré", "Pêche nude", "Corail éclat"]
  },
  {
    // PRODUIT 3 - YEUX
    nom: "Palette Nude Revolution",
    prix: 42.99,
    description: "Palette de 16 fards à paupières nude et smokey. Textures matte, satinée et métallique. Pigmentation intense.",
    stock: 32,
    marque: "Makeup Revolution",
    categorie_id: "yeux",
    images: ["C:\\roua\\projet_dev_web\\makeup-ecommerce\\src\\assets\\images\\products\\palette.jpg"],
    note_moyenne: 4.8,
    couleurs_disponibles: ["Nude", "Taupe", "Marron", "Or"]
  },
  {
    // PRODUIT 4 - YEUX
    nom: "Mascara Volume Extrême The Falsies",
    prix: 14.99,
    description: "Mascara waterproof pour un volume intense et des cils recourbés. Brosse incurvée pour un effet 'faux cils'.",
    stock: 92,
    marque: "Maybelline",
    categorie_id: "yeux",
    images: ["C:\\roua\\projet_dev_web\\makeup-ecommerce\\src\\assets\\images\\products\\mascara.jpg"],
    note_moyenne: 4.3,
    couleurs_disponibles: ["Noir intense", "Brun naturel"]
  },
  {
    // PRODUIT 5 - LÈVRES
    nom: "Rouge à lèvres matte liquide",
    prix: 24.50,
    description: "Rouge à lèvres liquide fini matte ultra-confortable. Tenue longue durée 16h sans sécher les lèvres.",
    stock: 57,
    marque: "Kylie Cosmetics",
    categorie_id: "levres",
    images: ["C:\\roua\\projet_dev_web\\makeup-ecommerce\\src\\assets\\images\\products\\rouge-levres.jpg"],
    note_moyenne: 4.7,
    couleurs_disponibles: ["Rouge passion", "Rose nude", "Bordeaux vamp"]
  },
  {
    // PRODUIT 6 - LÈVRES
    nom: "Gloss brillant non collant",
    prix: 16.90,
    description: "Gloss à l'effet miroir, non collant et hydratant. Enrichi en vitamines pour nourrir les lèvres.",
    stock: 84,
    marque: "Fenty Beauty",
    categorie_id: "levres",
    images: ["C:\\roua\\projet_dev_web\\makeup-ecommerce\\src\\assets\\images\\products\\gloss.jpg"],
    note_moyenne: 4.4,
    couleurs_disponibles: ["Rose transparent", "Nude brillant", "Corail éclat"]
  }
];

async function ajouterProduits() {
  try {
    console.log('🚀 Connexion à Firebase...');
    console.log('🛍️ Projet: makeup-ecommerce-9d064');
    console.log('🎯 Ajout de 6 produits selon le cahier des charges\n');
    
    let produitsAjoutes = 0;
    const erreurs = [];
    
    for (const [index, produit] of produits.entries()) {
      try {
        console.log(`➕ Ajout du produit ${index + 1}/6: ${produit.nom}`);
        console.log(`   📍 Catégorie: ${produit.categorie_id}`);
        console.log(`   💰 Prix: ${produit.prix}€`);
        
        // Ajout dans la collection "produits" (comme spécifié dans le cahier des charges)
        await addDoc(collection(db, 'produits'), {
          ...produit,
          date_creation: new Date(),
          date_modification: new Date(),
          // Champs supplémentaires optionnels
          statut: "actif",
          // Pour la compatibilité avec votre ancien code si besoin
          name: produit.nom, // alias
          price: produit.prix, // alias
          category: produit.categorie_id // alias
        });
        
        produitsAjoutes++;
        console.log(`✅ Succès: ${produit.nom}\n`);
        
      } catch (erreurProduit) {
        erreurs.push({ produit: produit.nom, erreur: erreurProduit.message });
        console.log(`❌ Erreur sur ${produit.nom}:`, erreurProduit.message);
      }
      
      // Pause pour éviter les limites Firebase
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // RÉSUMÉ
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DE L\'IMPORTATION');
    console.log('='.repeat(60));
    console.log(`✅ Produits ajoutés: ${produitsAjoutes}/6`);
    console.log(`❌ Erreurs: ${erreurs.length}`);
    
    if (erreurs.length > 0) {
      console.log('\n📋 Détails des erreurs:');
      erreurs.forEach((err, i) => {
        console.log(`${i + 1}. ${err.produit}: ${err.erreur}`);
      });
    }
    
    console.log('\n🔗 Vérifiez vos produits sur Firebase Console:');
    console.log('https://console.firebase.google.com/project/makeup-ecommerce-9d064/firestore');
    console.log('\n💡 Conseil: Les produits sont dans la collection "produits"');
    
  } catch (erreur) {
    console.error('💥 ERREUR CRITIQUE:', erreur);
    console.log('\n⚠️ Vérifiez que:');
    console.log('1. Firestore est activé dans Firebase Console');
    console.log('2. Les règles Firestore sont en mode test');
    console.log('3. Votre collection "produits" existe');
  }
}

// EXÉCUTION
console.log('🎨 E-COMMERCE MAQUILLAGE - Importation des produits');
console.log('='.repeat(50));
console.log('📋 Conformité cahier de charges:');
console.log('   • Collection: "produits"');
console.log('   • 6 produits (teint, yeux, lèvres)');
console.log('   • Champs: nom, prix, description, stock, marque, categorie_id');
console.log('='.repeat(50) + '\n');

ajouterProduits();