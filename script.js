/* ===== Configuration & categories (Mise à jour V8) ===== */
const ADMIN_EMAIL = "benjamin.vitre@gmail.com";

// Triez les sous-activités
const sortArray = (arr) => arr.sort((a, b) => a.localeCompare(b, 'fr'));

const ACTIVITIES = {
  "Toutes": [],
  "Autres": [],
  "Culture": sortArray(["Cinéma", "Théâtre", "Exposition", "Concert"]),
  "Jeux": sortArray(["Jeux de cartes", "Jeux vidéo", "Jeux de société"]),
  "Sorties": sortArray(["Bar", "Restaurant", "Picnic"]),
  "Sport": sortArray(["Foot", "Padel", "Tennis", "Running", "Badminton"])
};

// Trie le dictionnaire principal par clé (activité), en gardant 'Toutes' en premier
const sortedActivityKeys = Object.keys(ACTIVITIES).filter(key => key !== "Toutes").sort((a, b) => a.localeCompare(b, 'fr'));
const tempActivities = { "Toutes": ACTIVITIES["Toutes"] };
sortedActivityKeys.forEach(key => tempActivities[key] = ACTIVITIES[key]);
Object.assign(ACTIVITIES, tempActivities);

// Ajout des emojis
const ACTIVITY_EMOJIS = {
  "Toutes": "🌍",
  "Autres": "❓",
  "Culture": "🖼️",
  "Jeux": "🎮",
  "Sorties": "🎉",
  "Sport": "⚽"
};

const SUBSUB = {
  "Jeux de cartes": ["Magic The Gathering", "Pokémon", "Yu-Gi-Oh!"],
  "Jeux vidéo": [],
  "Jeux de société": []
};
Object.keys(SUBSUB).forEach(key => {
  if (SUBSUB[key].length > 0) {
    SUBSUB[key] = sortArray(SUBSUB[key]);
  }
});

const COLOR_MAP = {
  "Autres": "#78d6a4", "Jeux": "#c085f5", "Culture": "#e67c73", "Sport": "#f27a7d", "Sorties": "#f1a66a", "Toutes": "#9aa9bf",
  "Jeux de cartes": "#c085f5", "Jeux vidéo": "#6fb2f2", "Jeux de société": "#64e3be",
  "Cinéma": "#e67c73", "Théâtre": "#cc5a4f", "Exposition": "#e39791", "Concert": "#f1b6b3",
  "Foot": "#f27a7d", "Padel": "#cc5a5e", "Tennis": "#e39799", "Running": "#f1b6b7", "Badminton": "#78d6a4",
  "Bar": "#f1a66a", "Restaurant": "#d68e4a", "Picnic": "#f5c399",
  "Magic The Gathering": "#b294f2", "Pokémon": "#f6d06f", "Yu-Gi-Oh!": "#f1a66a",
};

const MAX_PARTICIPANTS = 10;
var currentUser = null;

// =======================================================================
// FONCTIONS UTILITAIRES GLOBALES
// =======================================================================

function formatDateToWords(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date)) return dateString;
  const options = { day: 'numeric', month: 'long' };
  return date.toLocaleDateString('fr-FR', options);
}

function extractCity(locationText) {
  if (!locationText) return '';
  const parts = locationText.split(',').map(p => p.trim());
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    if (lastPart.match(/\d{5}\s/)) { return lastPart.replace(/\d{5}\s*/, '').trim(); }
    return lastPart.replace(/\d{5}/, '').trim();
  }
  const words = locationText.split(' ');
  const lastWord = words[words.length - 1];
  if (lastWord && lastWord.length > 2 && lastWord[0] === lastWord[0].toUpperCase()) { return lastWord; }
  return locationText;
}

function updateHeaderDisplay() {
  const profileLink = document.getElementById('profile-link');
  const messagerieLink = document.getElementById('messagerie-link');
  if (currentUser) {
    if (profileLink) profileLink.style.display = 'inline-block';
    if (messagerieLink) messagerieLink.style.display = 'inline-block';
  } else {
    if (profileLink) profileLink.style.display = 'none';
    if (messagerieLink) messagerieLink.style.display = 'none';
  }
}

function fillProfileFields(user) {
  if (!user) return;
  const profilePseudo = document.getElementById('profile-pseudo');
  const profileEmail = document.getElementById('profile-email');
  const profilePhone = document.getElementById('profile-phone');
  if (profilePseudo) profilePseudo.value = user.pseudo || '';
  if (profileEmail) profileEmail.value = user.email || '';
  if (profilePhone) profilePhone.value = user.phone || '';
}

function logout() {
  auth.signOut().catch(error => console.error("Erreur de déconnexion: ", error));
}

// =======================================================================
// NOUVELLES FONCTIONS D'AUTHENTIFICATION ET D'UI
// =======================================================================

/**
 * Gère l'affichage/masquage des mots de passe.
 */
function setupPasswordToggle(checkboxId, passwordInputId, confirmPasswordInputId = null) {
    const checkbox = document.getElementById(checkboxId);
    const passwordInput = document.getElementById(passwordInputId);
    const confirmPasswordInput = confirmPasswordInputId ? document.getElementById(confirmPasswordInputId) : null;

    if (checkbox && passwordInput) {
        checkbox.addEventListener('change', () => {
            const isChecked = checkbox.checked;
            passwordInput.type = isChecked ? 'text' : 'password';
            if (confirmPasswordInput) {
                confirmPasswordInput.type = isChecked ? 'text' : 'password';
            }
        });
    }
}


/**
 * Gère les événements de connexion et d'inscription.
 */
function handleAuth() {
    const loginBtn = document.getElementById('login');
    const signupBtn = document.getElementById('signup');
    const pseudoInput = document.getElementById('pseudo');
    const passwordInput = document.getElementById('password-signup');
    const confirmPasswordInput = document.getElementById('password-confirm-signup');

    // --- Validation pour activer le bouton d'inscription ---
    function validateSignupForm() {
        const isPseudoValid = pseudoInput && pseudoInput.value.trim() !== '';
        const arePasswordsMatching = passwordInput && confirmPasswordInput && passwordInput.value === confirmPasswordInput.value && passwordInput.value !== '';
        if (signupBtn) {
            signupBtn.disabled = !(isPseudoValid && arePasswordsMatching);
        }
    }

    if (pseudoInput) pseudoInput.addEventListener('input', validateSignupForm);
    if (passwordInput) passwordInput.addEventListener('input', validateSignupForm);
    if (confirmPasswordInput) confirmPasswordInput.addEventListener('input', validateSignupForm);


    // --- Logique de Connexion ---
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const email = document.getElementById('email-login').value;
            const password = document.getElementById('password-login').value;
            auth.signInWithEmailAndPassword(email, password)
                .catch(error => {
                    console.error("Erreur de connexion: ", error);
                    alert("Erreur de connexion : " + error.message);
                });
        });
    }

    // --- Logique d'Inscription ---
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            const pseudo = document.getElementById('pseudo').value;
            const email = document.getElementById('email-signup').value;
            const password = document.getElementById('password-signup').value;

            auth.createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                    // Sauvegarde des informations utilisateur dans Firestore
                    return db.collection('users').doc(userCredential.user.uid).set({
                        pseudo: pseudo,
                        email: email,
                        phone: '' // Initialise le champ téléphone
                    });
                })
                .then(() => {
                    console.log("Compte créé avec succès !");
                })
                .catch(error => {
                    console.error("Erreur d'inscription: ", error);
                    alert("Erreur d'inscription : " + error.message);
                });
        });
    }
}

// =======================================================================
// ÉCOUTEUR PRINCIPAL
// =======================================================================

document.addEventListener("DOMContentLoaded", () => {
    // Initialise les fonctionnalités d'authentification et d'UI
    handleAuth();
    setupPasswordToggle('show-password-login', 'password-login');
    setupPasswordToggle('show-password-signup', 'password-signup', 'password-confirm-signup');

    if (typeof auth === "undefined") {
        console.error("Firebase Auth n'est pas initialisé.");
        return;
    }

    auth.onAuthStateChanged(async (user) => {
        const authSection = document.getElementById('auth-section');
        const mainSection = document.getElementById('main-section');

        if (user) {
            currentUser = user;
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    currentUser.pseudo = userDoc.data().pseudo;
                } else {
                     console.log("Le document utilisateur n'existe pas, déconnexion...");
                     logout();
                     return;
                }
            } catch (e) {
                console.error("Erreur de chargement du profil :", e);
            }

            updateHeaderDisplay();

            // Cache la section d'authentification et montre le contenu principal
            if (authSection) authSection.style.display = 'none';
            if (mainSection) mainSection.style.display = 'block';

            // Charge le contenu spécifique à la page d'accueil
            if (document.getElementById('slots-list')) {
                 if (typeof loadSlots === 'function') {
                    // Ces fonctions ne sont pas définies dans le code fourni,
                    // mais je garde l'appel au cas où elles existent ailleurs.
                    // loadSlots('slots-list', 'slots-list');
                    // loadSlots('past-slots-list', 'past-slots-list');
                 }
            }

        } else {
            currentUser = null;
            updateHeaderDisplay();
            // Montre la section d'authentification et cache le contenu principal
            if (authSection) authSection.style.display = 'flex';
            if (mainSection) mainSection.style.display = 'none';
        }
    });
});
