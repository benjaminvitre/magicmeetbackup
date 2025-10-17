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

/* === ici, tout le reste de ton code d'origine (handleIndexPageListeners, showMain, etc.) reste inchangé === */

/* ---------------------------------------------------------------------- */
/* FIN DU FICHIER — ÉCOUTEUR D’AUTHENTIFICATION FIREBASE (version corrigée) */
/* ---------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof auth === "undefined") return; // sécurité

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      currentUser = user;
      try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          currentUser.pseudo = userDoc.data().pseudo;
        }
      } catch (e) {
        console.error("Erreur de chargement du profil :", e);
      }

      updateHeaderDisplay();

      // ✅ Seulement sur la page d'accueil (index.html)
      if (document.getElementById('main-section') && typeof showMain === "function") {
        showMain();
        if (typeof loadSlots === 'function') {
          loadSlots('slots-list', 'slots-list');
          loadSlots('past-slots-list', 'past-slots-list');
        }
      }
    } else {
      // Si pas connecté, on affiche la section de connexion (seulement sur index.html)
      if (document.getElementById('auth-section')) {
        document.getElementById('auth-section').style.display = 'block';
        const mainSection = document.getElementById('main-section');
        if (mainSection) mainSection.style.display = 'none';
      }
    }
  });
});
