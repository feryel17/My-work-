// ============================================
// ÉTAPE 2 : Déclaration des variables et message de bienvenue
// ============================================

console.log("=== TP JavaScript : Application de Gestion de Tâches ===");
console.log("=== Bienvenue dans le gestionnaire de tâches ! ===");

// Variables principales
let tasks = []; // Tableau pour stocker les tâches
let currentFilter = 'all'; // Filtre actif

// Éléments DOM
const taskInput = document.getElementById('task-input');
const addButton = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
const clearAllButton = document.getElementById('clear-all-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const emptyMessage = document.getElementById('empty-message');

// Éléments de statistiques
const totalTasksElement = document.getElementById('total-tasks');
const completedTasksElement = document.getElementById('completed-tasks');
const pendingTasksElement = document.getElementById('pending-tasks');

// ============================================
// ÉTAPE 3 & 4 : Manipulation du DOM et gestion des événements
// ============================================

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM chargé - Initialisation de l'application...");
    loadTasksFromStorage();
    updateStats();
    renderTaskList();
    
    // ÉTAPE 4 : Écouteurs d'événements
    
    // Ajout par bouton
    addButton.addEventListener('click', addTask);
    
    // Ajout par touche Entrée
    taskInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addTask();
        }
    });
    
    // Recherche
    searchInput.addEventListener('input', function() {
        renderTaskList();
    });
    
    // Tout supprimer
    clearAllButton.addEventListener('click', clearAllTasks);
    
    // Filtres
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Retirer la classe active de tous les boutons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');
            // Mettre à jour le filtre
            currentFilter = this.getAttribute('data-filter');
            renderTaskList();
        });
    });
});

// ============================================
// ÉTAPE 5 : Fonctions pour créer dynamiquement les tâches
// ============================================

/**
 * ÉTAPE 5 : Crée un élément de tâche dans le DOM
 */
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.setAttribute('data-id', task.id);
    
    li.innerHTML = `
        <div class="task-content">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text ${task.completed ? 'completed' : ''}">${escapeHTML(task.text)}</span>
        </div>
        <div class="task-actions">
            <button class="action-btn edit-btn" title="Modifier">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" title="Supprimer">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // ÉTAPE 5 : Événements pour les boutons de la tâche
    const checkbox = li.querySelector('.task-checkbox');
    const editButton = li.querySelector('.edit-btn');
    const deleteButton = li.querySelector('.delete-btn');
    const taskText = li.querySelector('.task-text');
    
    // Cocher/décocher
    checkbox.addEventListener('change', function() {
        toggleTaskCompletion(task.id);
    });
    
    // Supprimer
    deleteButton.addEventListener('click', function() {
        deleteTask(task.id);
    });
    
    // Modifier
    editButton.addEventListener('click', function() {
        editTask(task.id, taskText);
    });
    
    // Double-clic pour modifier
    taskText.addEventListener('dblclick', function() {
        editTask(task.id, taskText);
    });
    
    return li;
}

// ============================================
// ÉTAPE 6 : Fonctions principales
// ============================================

/**
 * ÉTAPE 6 : Fonction pour ajouter une tâche
 */
function addTask() {
    const text = taskInput.value.trim();
    
    if (text === '') {
        alert("Veuillez entrer une tâche !");
        taskInput.focus();
        return;
    }
    
    // Créer un objet tâche (ÉTAPE 8)
    const newTask = {
        id: Date.now(), // ID unique basé sur le timestamp
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // Ajouter au tableau (ÉTAPE 7)
    tasks.push(newTask);
    
    // Réinitialiser l'input
    taskInput.value = '';
    taskInput.focus();
    
    // Mettre à jour l'affichage
    renderTaskList();
    updateStats();
    saveTasksToStorage();
    
    console.log(`Tâche ajoutée : "${text}"`);
}

/**
 * ÉTAPE 6 : Fonction pour supprimer une tâche
 */
function deleteTask(taskId) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
        // Filtrer le tableau pour exclure la tâche à supprimer
        tasks = tasks.filter(task => task.id !== taskId);
        
        // Mettre à jour l'affichage
        renderTaskList();
        updateStats();
        saveTasksToStorage();
        
        console.log(`Tâche ${taskId} supprimée`);
    }
}

/**
 * ÉTAPE 5 & 6 : Fonction pour marquer une tâche comme terminée/incomplète
 */
function toggleTaskCompletion(taskId) {
    // Trouver la tâche
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        // Inverser l'état
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        
        // Mettre à jour l'affichage
        renderTaskList();
        updateStats();
        saveTasksToStorage();
        
        const status = tasks[taskIndex].completed ? "terminée" : "en cours";
        console.log(`Tâche ${taskId} marquée comme ${status}`);
    }
}

/**
 * Fonction pour modifier une tâche
 */
function editTask(taskId, taskTextElement) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        const newText = prompt("Modifier la tâche :", tasks[taskIndex].text);
        
        if (newText !== null && newText.trim() !== '') {
            tasks[taskIndex].text = newText.trim();
            
            // Mettre à jour l'affichage
            renderTaskList();
            saveTasksToStorage();
            
            console.log(`Tâche ${taskId} modifiée : "${newText}"`);
        }
    }
}

/**
 * ÉTAPE 10 : Fonction pour tout supprimer
 */
function clearAllTasks() {
    if (tasks.length === 0) {
        alert("Il n'y a aucune tâche à supprimer !");
        return;
    }
    
    if (confirm("Êtes-vous sûr de vouloir supprimer TOUTES les tâches ?")) {
        tasks = [];
        renderTaskList();
        updateStats();
        saveTasksToStorage();
        
        console.log("Toutes les tâches ont été supprimées");
    }
}

// ============================================
// ÉTAPE 7 : Gestion du tableau et affichage
// ============================================

/**
 * ÉTAPE 7 : Fonction pour afficher la liste des tâches
 */
function renderTaskList() {
    // Vider la liste actuelle
    taskList.innerHTML = '';
    
    // Filtrer les tâches selon le filtre actif
    let filteredTasks = [...tasks];
    
    // Appliquer le filtre
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    // Appliquer la recherche
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task => 
            task.text.toLowerCase().includes(searchTerm)
        );
    }
    
    // Afficher les tâches filtrées
    if (filteredTasks.length === 0) {
        emptyMessage.style.display = 'block';
    } else {
        emptyMessage.style.display = 'none';
        filteredTasks.forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });
    }
    
    console.log(`${filteredTasks.length} tâches affichées (filtre: ${currentFilter})`);
}

/**
 * ÉTAPE 10 : Mettre à jour les statistiques
 */
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    
    totalTasksElement.textContent = total;
    completedTasksElement.textContent = completed;
    pendingTasksElement.textContent = pending;
    
    console.log(`Statistiques : Total=${total}, Terminées=${completed}, En cours=${pending}`);
}

// ============================================
// ÉTAPE 9 : Persistance avec LocalStorage
// ============================================

/**
 * ÉTAPE 9 : Sauvegarder les tâches dans le LocalStorage
 */
function saveTasksToStorage() {
    try {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
        console.log("Tâches sauvegardées dans le LocalStorage");
    } catch (error) {
        console.error("Erreur lors de la sauvegarde :", error);
    }
}

/**
 * ÉTAPE 9 : Charger les tâches depuis le LocalStorage
 */
function loadTasksFromStorage() {
    try {
        const savedTasks = localStorage.getItem('todoTasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            console.log(`${tasks.length} tâches chargées depuis le LocalStorage`);
        } else {
            console.log("Aucune tâche sauvegardée trouvée");
        }
    } catch (error) {
        console.error("Erreur lors du chargement :", error);
        tasks = [];
    }
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Échapper le HTML pour éviter les injections
 */
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Générer des tâches d'exemple (pour le test)
 */
function generateSampleTasks() {
    const sampleTasks = [
        "Apprendre JavaScript",
        "Faire le TP de gestion de tâches",
        "Réviser les fonctions ES6",
        "Créer un projet personnel",
        "Préparer la présentation"
    ];
    
    sampleTasks.forEach((task, index) => {
        tasks.push({
            id: Date.now() + index,
            text: task,
            completed: index % 3 === 0, // Toutes les 3 tâches sont complétées
            createdAt: new Date().toISOString()
        });
    });
    
    renderTaskList();
    updateStats();
    saveTasksToStorage();
    console.log("Tâches d'exemple générées");
}

// Pour tester rapidement, décommentez la ligne suivante :
// generateSampleTasks();