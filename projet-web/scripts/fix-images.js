// Script pour corriger les images des produits dans Firebase
// Exécuter avec: node scripts/fix-images.js

const admin = require('firebase-admin');

// Configuration Firebase (à remplacer par vos vraies credentials)
const serviceAccount = {
  // Téléchargez votre fichier de clé privée depuis Firebase Console
  // Firebase Console > Paramètres du projet > Comptes de service > Générer une nouvelle clé privée
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixProductImages() {
  console.log('🔧 Correction des images des produits...\n');

  try {
    const snapshot = await db.collection('produits').get();
    
    let fixedCount = 0;
    
    for (const doc of snapshot.docs) {
      const product = doc.data();
      const productId = doc.id;
      
      // Vérifier si l'image est invalide (URL externe cassée ou vide)
      if (!product.images || 
          product.images.length === 0 || 
          !product.images[0] || 
          product.images[0].includes('makeup-api.herokuapp.com')) {
        
        // Assigner une image par défaut selon la catégorie
        let defaultImage = 'assets/images/products/rouge-levres.jpg';
        
        if (product.category === 'face') {
          defaultImage = 'assets/images/products/fond-de-teint.jpg';
        } else if (product.category === 'eyes') {
          defaultImage = 'assets/images/products/mascara.jpg';
        } else if (product.category === 'lips') {
          defaultImage = 'assets/images/products/rouge-levres.jpg';
        } else if (product.category === 'brows') {
          defaultImage = 'assets/images/products/mascara.jpg';
        }
        
        await db.collection('produits').doc(productId).update({
          images: [defaultImage]
        });
        
        console.log(`✅ ${product.name} - Image corrigée: ${defaultImage}`);
        fixedCount++;
      } else {
        console.log(`✓ ${product.name} - Image OK`);
      }
    }
    
    console.log(`\n🎉 Terminé! ${fixedCount} produit(s) corrigé(s)`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
  
  process.exit();
}

fixProductImages();
