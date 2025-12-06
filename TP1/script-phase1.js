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

// ===== Initialisation =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('TP JavaScript Avancé - Partie 1 chargée !');
});