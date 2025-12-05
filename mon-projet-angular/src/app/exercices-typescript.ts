// ===== PARTIE 1 : BASES DE TYPESCRIPT =====

// 1. Variables avec types primitifs
const nom: string = "Jean Dupont";
const age: number = 22;
const isEtudiant: boolean = true;
const notes: number[] = [15, 18, 14, 16];
const anyValue: any = "Peut être n'importe quoi";

// 2. Interface Etudiant
interface Etudiant {
  id: number;
  nom: string;
  prenom: string;
  age: number;
  notes?: number[]; // Optionnel
}

// 3. Fonction typée
function calculerMoyenne(notes: number[]): number {
  if (notes.length === 0) return 0;
  const somme = notes.reduce((acc, note) => acc + note, 0);
  return somme / notes.length;
}

// 4. Classe EtudiantImpl
class EtudiantImpl implements Etudiant {
  constructor(
    public id: number,
    public nom: string,
    public prenom: string,
    public age: number,
    public notes: number[] = []
  ) {}

  afficherInfos(): string {
    const moyenne = this.notes.length > 0 ? calculerMoyenne(this.notes) : 0;
    return `${this.prenom} ${this.nom}, ${this.age} ans - Moyenne: ${moyenne.toFixed(2)}`;
  }
}

// ===== PARTIE 2 : TYPESCRIPT AVANCÉ =====

// 1. Types génériques
function inverserTableau<T>(tableau: T[]): T[] {
  return [...tableau].reverse();
}

// 2. Unions de types et types optionnels
function afficherInfo(info: string | number | Etudiant): void {
  if (typeof info === 'string') {
    console.log(`String: ${info}`);
  } else if (typeof info === 'number') {
    console.log(`Number: ${info}`);
  } else {
    console.log(`Etudiant: ${info.nom} ${info.prenom}`);
  }
}

// 3. Énumérations
enum Filiere {
  INFORMATIQUE = 'Informatique',
  MATHEMATIQUES = 'Mathématiques',
  PHYSIQUE = 'Physique',
  CHIMIE = 'Chimie'
}

// ===== TESTS =====

// Création d'instances
const etudiantTS = new EtudiantImpl(1, "Dupont", "Jean", 22, [15, 18, 14]);
console.log(etudiantTS.afficherInfos());

// Test des fonctions génériques
const nombres = [1, 2, 3, 4, 5];
const mots = ["Bonjour", "Angular", "TypeScript"];
console.log("Nombres inversés:", inverserTableau(nombres));
console.log("Mots inversés:", inverserTableau(mots));

// Test des unions
afficherInfo("Hello");
afficherInfo(42);
afficherInfo(etudiantTS);

// Test des énumérations
console.log("Filière:", Filiere.INFORMATIQUE);

// exercices-typescript.ts
export type { Etudiant, Filiere };
export { EtudiantImpl, calculerMoyenne };