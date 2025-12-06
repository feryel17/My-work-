// ===== Partie 1 – Rappel et Syntaxe moderne =====

// Exercice 1 – Variables et portée
function exercice1() {
    const resultDiv = document.getElementById('result1');
    let output = '<h4>Résultat Ex1 :</h4>';
    
    // Différence de portée
    if (true) {
        var varVariable = "Je suis var (portée fonction)";
        let letVariable = "Je suis let (portée bloc)";
        const constVariable = "Je suis const (portée bloc)";
        
        output += `<p>Dans le bloc : ${varVariable}</p>`;
        output += `<p>Dans le bloc : ${letVariable}</p>`;
        output += `<p>Dans le bloc : ${constVariable}</p>`;
    }
    
    // var est accessible hors bloc
    output += `<p>Hors bloc (var) : ${varVariable}</p>`;
    
    // let et const ne sont PAS accessibles
    output += `<p>Hors bloc (let) : <em>ReferenceError si on essaie d'accéder</em></p>`;
    output += `<p>Hors bloc (const) : <em>ReferenceError si on essaie d'accéder</em></p>`;
    
    // Question piège : réaffecter une const
    try {
        const pi = 3.14;
        pi = 3.14159; // Erreur !
    } catch (error) {
        output += `<p><strong>Question piège :</strong> Réaffecter une const cause une erreur : ${error.message}</p>`;
    }
    
    resultDiv.innerHTML = output;
}

// Exercice 2 – Fonctions fléchées
function exercice2() {
    const resultDiv = document.getElementById('result2');
    
    // Fonction classique
    function sommeClassique(a, b) {
        return a + b;
    }
    
    // Fonction fléchée avec return explicite
    const sommeFlechee = (a, b) => {
        return a + b;
    };
    
    // Fonction fléchée avec return implicite
    const sommeImplicite = (a, b) => a + b;
    
    const output = `
        <h4>Résultat Ex2 :</h4>
        <p>Fonction classique : sommeClassique(5, 3) = ${sommeClassique(5, 3)}</p>
        <p>Fonction fléchée (explicite) : sommeFlechee(5, 3) = ${sommeFlechee(5, 3)}</p>
        <p>Fonction fléchée (implicite) : sommeImplicite(5, 3) = ${sommeImplicite(5, 3)}</p>
        <pre>
// Fonction classique
function sommeClassique(a, b) {
    return a + b;
}

// Fonction fléchée avec return explicite
const sommeFlechee = (a, b) => {
    return a + b;
};

// Fonction fléchée avec return implicite
const sommeImplicite = (a, b) => a + b;
        </pre>
    `;
    
    resultDiv.innerHTML = output;
}

// Exercice 3 – Destructuring
function exercice3() {
    const resultDiv = document.getElementById('result3');
    
    const user = { 
        name: "Noor", 
        age: 10, 
        city: "Tunis" 
    };
    
    // Destructuring
    const { name, age } = user;
    
    const output = `
        <h4>Résultat Ex3 :</h4>
        <p>Objet original : ${JSON.stringify(user)}</p>
        <p>Variables extraites :</p>
        <ul>
            <li>name = "${name}"</li>
            <li>age = ${age}</li>
        </ul>
        <pre>
// Objet original
const user = { name: "Noor", age: 10, city: "Tunis" };

// Destructuring
const { name, age } = user;
        </pre>
    `;
    
    resultDiv.innerHTML = output;
}

// Exercice 4 – Spread Operator
function exercice4() {
    const resultDiv = document.getElementById('result4');
    
    // Fusion de tableaux
    const tab1 = [1, 2, 3];
    const tab2 = [4, 5, 6];
    const fusion = [...tab1, ...tab2];
    
    // Copie d'objet
    const original = { nom: "Alice", age: 25 };
    const copie = { ...original };
    copie.age = 26; // Modification
    
    const output = `
        <h4>Résultat Ex4 :</h4>
        <p>Tableau 1 : [${tab1}]</p>
        <p>Tableau 2 : [${tab2}]</p>
        <p>Fusion avec spread : [${fusion}]</p>
        
        <p>Objet original : ${JSON.stringify(original)}</p>
        <p>Copie modifiée : ${JSON.stringify(copie)}</p>
        <p><em>Note : L'original reste inchangé</em></p>
        
        <pre>
// Fusion de tableaux
const tab1 = [1, 2, 3];
const tab2 = [4, 5, 6];
const fusion = [...tab1, ...tab2];

// Copie d'objet
const original = { nom: "Alice", age: 25 };
const copie = { ...original };
copie.age = 26; // Modification
        </pre>
    `;
    
    resultDiv.innerHTML = output;
}

// ===== Partie 2 – Objets, Classes, Tableaux =====

// Exercice 5 – Objet simple
function exercice5() {
    const resultDiv = document.getElementById('result5');
    
    // Création de l'objet livre
    const livre = {
        titre: "Le Petit Prince",
        auteur: "Antoine de Saint-Exupéry",
        annee: 1943,
        
        // Méthode getInfo()
        getInfo: function() {
            return `"${this.titre}" écrit par ${this.auteur} en ${this.annee}.`;
        }
    };
    
    const output = `
        <h4>Résultat Ex5 :</h4>
        <p>${livre.getInfo()}</p>
        <pre>
const livre = {
    titre: "Le Petit Prince",
    auteur: "Antoine de Saint-Exupéry",
    annee: 1943,
    
    getInfo: function() {
        return \`"\${this.titre}" écrit par \${this.auteur} en \${this.annee}.\`;
    }
};
        </pre>
    `;
    
    resultDiv.innerHTML = output;
}

// Exercice 6 – Classe ES6
function exercice6() {
    const resultDiv = document.getElementById('result6');
    
    // Définition de la classe Etudiant
    class Etudiant {
        constructor(nom, note) {
            this.nom = nom;
            this.note = note;
        }
        
        getMention() {
            if (this.note >= 16) return "Très bien";
            if (this.note >= 14) return "Bien";
            if (this.note >= 10) return "Passable";
            return "Échec";
        }
    }
    
    // Création d'instances
    const etudiants = [
        new Etudiant("Alice", 18),
        new Etudiant("Bob", 13),
        new Etudiant("Charlie", 9),
        new Etudiant("Diana", 15)
    ];
    
    let output = '<h4>Résultat Ex6 :</h4><ul>';
    
    etudiants.forEach(etudiant => {
        output += `<li>${etudiant.nom} - Note: ${etudiant.note} - Mention: ${etudiant.getMention()}</li>`;
    });
    
    output += '</ul>';
    output += `
        <pre>
class Etudiant {
    constructor(nom, note) {
        this.nom = nom;
        this.note = note;
    }
    
    getMention() {
        if (this.note >= 16) return "Très bien";
        if (this.note >= 14) return "Bien";
        if (this.note >= 10) return "Passable";
        return "Échec";
    }
}

// Instanciation
const etudiant1 = new Etudiant("Alice", 18);
const etudiant2 = new Etudiant("Bob", 13);
// ...
        </pre>
    `;
    
    resultDiv.innerHTML = output;
}

// Exercice 7 – Tableaux avancés
function exercice7() {
    const resultDiv = document.getElementById('result7');
    
    const notes = [12, 5, 17, 9, 20];
    
    // 1. Calcul de la moyenne avec reduce
    const somme = notes.reduce((acc, note) => acc + note, 0);
    const moyenne = somme / notes.length;
    
    // 2. Tri décroissant
    const notesTriées = [...notes].sort((a, b) => b - a);
    
    // 3. Filtre des notes ≥10
    const notesSup10 = notes.filter(note => note >= 10);
    
    const output = `
        <h4>Résultat Ex7 :</h4>
        <p>Tableau original : [${notes.join(', ')}]</p>
        
        <h5>1. Moyenne :</h5>
        <p>Somme = ${somme}, Nombre = ${notes.length}</p>
        <p>Moyenne = ${moyenne.toFixed(2)}</p>
        
        <h5>2. Tri décroissant :</h5>
        <p>[${notesTriées.join(', ')}]</p>
        
        <h5>3. Notes ≥ 10 :</h5>
        <p>[${notesSup10.join(', ')}]</p>
        
        <pre>
const notes = [12, 5, 17, 9, 20];

// 1. Moyenne avec reduce
const somme = notes.reduce((acc, note) => acc + note, 0);
const moyenne = somme / notes.length;

// 2. Tri décroissant
const notesTriées = [...notes].sort((a, b) => b - a);

// 3. Filtre des notes ≥10
const notesSup10 = notes.filter(note => note >= 10);
        </pre>
    `;
    
    resultDiv.innerHTML = output;
}

// ===== Partie 3 – Asynchronisme et API =====

// Exercice 8 – Promesse simple
function exercice8() {
    const resultDiv = document.getElementById('result8');
    
    const wait = ms => new Promise(res => setTimeout(res, ms));
    
    // Utilisation de la promesse avec async/await
    async function simulerTelechargement() {
        let output = '<h4>Résultat Ex8 :</h4>';
        output += '<p>Début du téléchargement...</p>';
        resultDiv.innerHTML = output;
        
        await wait(2000); // Attente de 2 secondes
        
        output += '<p>Téléchargement terminé !</p>';
        resultDiv.innerHTML = output;
        
        return "Fin";
    }
    
    simulerTelechargement();
}

// Exercice 9 – Fetch + async/await
function exercice9() {
    const resultDiv = document.getElementById('result9');
    
    async function fetchPosts() {
        resultDiv.innerHTML = '<h4>Résultat Ex9 :</h4><p>Chargement des posts...</p>';
        
        try {
            // Récupération des données depuis l'API
            const response = await fetch('https://jsonplaceholder.typicode.com/posts');
            const posts = await response.json();
            
            // Affichage des 5 premiers titres
            let output = '<h4>Résultat Ex9 :</h4>';
            output += '<h5>Titres des 5 premiers posts :</h5><ol>';
            
            posts.slice(0, 5).forEach((post, index) => {
                output += `<li>${post.title}</li>`;
            });
            
            output += '</ol>';
            output += `
                <p><em>${posts.length} posts récupérés au total</em></p>
                <pre>
async function fetchPosts() {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const posts = await response.json();
    
    // Afficher les 5 premiers titres
    posts.slice(0, 5).forEach(post => {
        console.log(post.title);
    });
}
                </pre>
            `;
            
            resultDiv.innerHTML = output;
            
        } catch (error) {
            resultDiv.innerHTML = `<h4>Erreur :</h4><p>${error.message}</p>`;
        }
    }
    
    fetchPosts();
}

// ===== Initialisation =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('TP JavaScript Avancé - Chargé !');
});