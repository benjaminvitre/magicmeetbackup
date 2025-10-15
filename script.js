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
let currentFilterActivity = "Toutes";
let currentFilterSub = "Toutes";
let currentFilterCity = "Toutes";
let currentFilterGroup = "Toutes";
let currentUser = null;

// =======================================================================
// FONCTIONS UTILITAIRES GLOBALES
// =======================================================================

function formatDateToWords(dateString){
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
    const lastWord = words[words.length -1];
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

function renderSlotItem(slot, targetListElement) {
    const li = document.createElement('li'); li.className='slot-item';
    const info = document.createElement('div'); info.className='slot-info';
    const activityLine = document.createElement('div'); activityLine.className = 'subsub-line';
    let actPill = document.createElement('span');
    actPill.className = 'subsub-box';
    actPill.textContent = slot.activity;
    actPill.style.border = `1px solid ${COLOR_MAP[slot.activity] || '#9aa9bf'}`;
    actPill.style.color = COLOR_MAP[slot.activity] || '#9aa9bf';
    activityLine.appendChild(actPill);
    if (slot.sub) {
        let subPill = document.createElement('span');
        subPill.className = 'subsub-box';
        subPill.textContent = slot.sub;
        subPill.style.border = `1px solid ${COLOR_MAP[slot.sub] || COLOR_MAP[slot.activity] || '#9aa9bf'}`;
        subPill.style.color = COLOR_MAP[slot.sub] || COLOR_MAP[slot.activity] || '#9aa9bf';
        activityLine.appendChild(subPill);
    }
    if (slot.subsub) {
        let subsubPill = document.createElement('span');
        subsubPill.className = 'subsub-box';
        subsubPill.textContent = slot.subsub;
        subsubPill.style.border = `1px solid ${COLOR_MAP[slot.subsub] || COLOR_MAP[slot.sub] || COLOR_MAP[slot.activity] || '#9aa9bf'}`;
        subsubPill.style.color = COLOR_MAP[slot.subsub] || COLOR_MAP[slot.sub] || COLOR_MAP[slot.activity] || '#9aa9bf';
        activityLine.appendChild(subsubPill);
    }
    info.appendChild(activityLine);
    const title = document.createElement('strong'); title.textContent = slot.name;
    const formattedDate = formatDateToWords(slot.date);
    const when = document.createElement('div');
    if (slot.location) {
        const locationLink = document.createElement('a');
        locationLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(slot.location)}`;
        locationLink.textContent = `📍 ${slot.location}`;
        locationLink.target = '_blank';
        locationLink.rel = 'noopener noreferrer';
        when.appendChild(locationLink);
        const dateSpan = document.createElement('span');
        dateSpan.textContent = ` — 🗓️ ${formattedDate} à ${slot.time}`;
        when.appendChild(dateSpan);
    } else {
        when.textContent = `🗓️ ${formattedDate} à ${slot.time}`;
    }
    const owner = document.createElement('small');
    owner.innerHTML = 'par ';
    const ownerPseudoSpan = document.createElement('span');
    if (currentUser && slot.owner !== currentUser.uid) {
        ownerPseudoSpan.className = 'clickable-pseudo';
        ownerPseudoSpan.onclick = () => startChat(slot.owner, slot.ownerPseudo);
    }
    ownerPseudoSpan.textContent = slot.ownerPseudo;
    owner.appendChild(ownerPseudoSpan);

    if (slot.private) owner.innerHTML += ' <span class="private-slot-lock">🔒 Privé</span>';
    info.appendChild(title); info.appendChild(when);
    const participantsCount = (slot.participants || []).length;
    const participantsBox = document.createElement('div'); participantsBox.className = 'participants-box';
    participantsBox.innerHTML = `👤 ${participantsCount} personne${participantsCount > 1 ? 's' : ''}`;
    const gaugeBar = document.createElement('div'); gaugeBar.className = 'gauge-bar';
    const gaugeFill = document.createElement('div'); gaugeFill.className = 'gauge-fill';
    const fillPercent = Math.min(100, (participantsCount / MAX_PARTICIPANTS) * 100);
    gaugeFill.style.width = `${fillPercent}%`;
    gaugeBar.appendChild(gaugeFill);
    participantsBox.appendChild(gaugeBar);
    info.appendChild(participantsBox);
    const participantsList = document.createElement('div'); participantsList.className = 'participants-list';
    const isParticipant = currentUser && (slot.participants_uid || []).includes(currentUser.uid);
    const isOwner = currentUser && slot.owner === currentUser.uid;
    if (slot.private && !isOwner && !isParticipant) {
        participantsList.textContent = 'Participants cachés.';
    } else {
        participantsList.innerHTML = 'Membres: ';
        slot.participants.forEach((p, index) => {
            const pseudoSpan = document.createElement('span');
            if (currentUser && p.uid !== currentUser.uid) {
                pseudoSpan.className = 'clickable-pseudo';
                pseudoSpan.onclick = () => startChat(p.uid, p.pseudo);
            }
            pseudoSpan.textContent = p.pseudo;
            participantsList.appendChild(pseudoSpan);
            if (index < slot.participants.length - 1) {
                participantsList.append(', ');
            }
        });
        if (isOwner && slot.invited_pseudos && slot.invited_pseudos.length > 0) {
            const invitedText = document.createElement('div');
            invitedText.className = 'participants-list';
            invitedText.style.marginTop = '4px';
            invitedText.textContent = 'Invités: ' + slot.invited_pseudos.join(', ');
            info.appendChild(invitedText);
        }
    }
    info.appendChild(participantsList);
    info.appendChild(owner);
    const actions = document.createElement('div'); actions.className='actions-box';
    const slotRef = db.collection('slots').doc(slot.id);
    const reloadLists = () => {
        if (typeof loadSlots === 'function' && document.getElementById('slots-list')) {
            loadSlots('slots-list', 'slots-list');
            loadSlots('past-slots-list', 'past-slots-list');
        }
        if (typeof loadUserSlots === 'function' && document.getElementById('user-slots')) loadUserSlots();
        if (typeof loadJoinedSlots === 'function' && document.getElementById('joined-slots')) loadJoinedSlots();
    };
    if (currentUser) {
        if (targetListElement.id === 'slots-list' || targetListElement.id === 'user-slots') {
            if (!isParticipant){
                const joinBtn = document.createElement('button');
                joinBtn.className = 'action-btn join-btn';
                joinBtn.textContent = '✅ Rejoindre';
                if (!slot.private || isOwner){
                    joinBtn.onclick = ()=> {
                        if (participantsCount >= MAX_PARTICIPANTS) return alert('Désolé, ce créneau est complet.');
                        slotRef.update({
                            participants: firebase.firestore.FieldValue.arrayUnion({uid: currentUser.uid, pseudo: currentUser.pseudo}),
                            participants_uid: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
                        }).then(() => {
                            alert('Créneau rejoint !');
                            reloadLists();
                        });
                    };
                    actions.appendChild(joinBtn);
                } else {
                    joinBtn.textContent = '🔒 Privé';
                    joinBtn.disabled = true;
                    actions.appendChild(joinBtn);
                }
            } else if (isParticipant && !isOwner) {
                const leaveBtn = document.createElement('button');
                leaveBtn.className = 'action-btn leave-btn';
                leaveBtn.textContent = '❌ Quitter';
                leaveBtn.onclick = ()=> {
                    slotRef.update({
                        participants: firebase.firestore.FieldValue.arrayRemove({uid: currentUser.uid, pseudo: currentUser.pseudo}),
                        participants_uid: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
                    }).then(reloadLists);
                };
                actions.appendChild(leaveBtn);
            }
        }
        if (targetListElement.id === 'joined-slots') {
            const leaveBtn = document.createElement('button');
            leaveBtn.className = 'action-btn leave-btn';
            leaveBtn.textContent = '❌ Quitter';
            leaveBtn.onclick = () => {
                 slotRef.update({
                    participants: firebase.firestore.FieldValue.arrayRemove({uid: currentUser.uid, pseudo: currentUser.pseudo}),
                    participants_uid: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
                }).then(reloadLists);
            };
            actions.appendChild(leaveBtn);
        }
        if (isOwner){
            const editBtn = document.createElement('button'); 
            editBtn.textContent='✏️'; 
            editBtn.title='Modifier';
            editBtn.className = 'action-btn ghost-action-btn';
            editBtn.onclick = () => openEditModal(slot);
            actions.appendChild(editBtn);
            const del = document.createElement('button'); del.textContent='🗑️'; del.title='Supprimer';
            del.className = 'action-btn ghost-action-btn';
            del.onclick = ()=> {
                if (!confirm('Supprimer ce créneau ?')) return;
                slotRef.delete().then(reloadLists);
            };
            actions.appendChild(del);
        }
    }
    const share = document.createElement('button'); share.textContent='🔗'; share.title='Partager';
    share.className = 'action-btn ghost-action-btn';
    share.onclick = ()=> {
        const link = `${window.location.origin}${window.location.pathname}?slot=${slot.id}`;
        navigator.clipboard.writeText(link).then(()=>alert('Lien copié !'));
    };
    actions.appendChild(share);
    li.appendChild(info);
    li.appendChild(actions);

    if (isOwner && slot.private && targetListElement.id === 'user-slots') {
        const inviteForm = document.createElement('div');
        inviteForm.className = 'invite-form';
        inviteForm.innerHTML = `
            <input type="text" id="invite-input-${slot.id}" placeholder="Inviter par pseudo">
            <button id="invite-btn-${slot.id}" class="action-btn">Inviter</button>
        `;
        li.appendChild(inviteForm);

        const inviteBtn = li.querySelector(`#invite-btn-${slot.id}`);
        const inviteInput = li.querySelector(`#invite-input-${slot.id}`);

        inviteBtn.addEventListener('click', async () => {
            const pseudoToInvite = inviteInput.value.trim();
            if (!pseudoToInvite) return;
            const userQuery = await db.collection('users').where('pseudo', '==', pseudoToInvite).get();
            if (userQuery.empty) return alert("Utilisateur non trouvé.");
            const userToInviteId = userQuery.docs[0].id;
            const userToInvitePseudo = userQuery.docs[0].data().pseudo;
            await slotRef.update({
                invited_uids: firebase.firestore.FieldValue.arrayUnion(userToInviteId),
                invited_pseudos: firebase.firestore.FieldValue.arrayUnion(userToInvitePseudo)
            });
            inviteInput.value = '';
            loadUserSlots();
        });
    }
    targetListElement.appendChild(li);
}

// =======================================================================
// FONCTIONS PRINCIPALES PAR PAGE
// =======================================================================

function handleIndexPageListeners() {
    const signupBtn = document.getElementById('signup');
    const loginBtn = document.getElementById('login');
    const pseudoInput = document.getElementById('pseudo');
    const pseudoStatus = document.getElementById('pseudo-status');
    if (pseudoInput && signupBtn) {
        pseudoInput.addEventListener('input', async () => {
            const pseudo = pseudoInput.value.trim();
            if (pseudo.length < 3) {
                pseudoStatus.textContent = '';
                signupBtn.disabled = true;
                return;
            }
            try {
                const querySnapshot = await db.collection('users').where('pseudo', '==', pseudo).get();
                if (!querySnapshot.empty) {
                    pseudoStatus.textContent = 'Ce pseudo est déjà pris 😞';
                    pseudoStatus.style.color = '#e67c73';
                    signupBtn.disabled = true;
                } else {
                    pseudoStatus.textContent = 'Pseudo disponible ! 😊';
                    pseudoStatus.style.color = '#78d6a4';
                    signupBtn.disabled = false;
                }
            } catch (error) {
                console.error("ERREUR lors de la vérification du pseudo:", error);
            }
        });
    }
    if (signupBtn) signupBtn.addEventListener('click', () => {
        const pseudo = document.getElementById('pseudo').value.trim();
        const email = document.getElementById('email-signup').value.trim();
        const password = document.getElementById('password-signup').value.trim();
        const passwordConfirm = document.getElementById('password-confirm-signup').value.trim();
        
        if (password !== passwordConfirm) { return alert('Les mots de passe ne correspondent pas.'); }
        if (!pseudo || !email || !password) { return alert('Remplis tous les champs.'); }
        if (signupBtn.disabled) { return alert('Le pseudo n\'est pas disponible.'); }

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                return db.collection('users').doc(userCredential.user.uid).set({
                    pseudo: pseudo, email: email, phone: ''
                });
            })
            .catch((error) => {
                console.error("ERREUR GLOBALE LORS DE L'INSCRIPTION:", error);
                alert("Erreur lors de l'inscription : " + error.message);
            });
    });
    if (loginBtn) loginBtn.addEventListener('click', () => {
        const email = document.getElementById('email-login').value.trim();
        const password = document.getElementById('password-login').value.trim();
        if (!email || !password) return alert('Remplis tous les champs.');
        auth.signInWithEmailAndPassword(email, password)
            .catch((error) => { alert("Erreur de connexion : " + error.message); });
    });
    const showPassLoginCheckbox = document.getElementById('show-password-login');
    const passwordLoginInput = document.getElementById('password-login');
    if (showPassLoginCheckbox && passwordLoginInput) {
        showPassLoginCheckbox.addEventListener('change', () => {
            passwordLoginInput.type = showPassLoginCheckbox.checked ? 'text' : 'password';
        });
    }
    const showPassSignupCheckbox = document.getElementById('show-password-signup');
    const passwordSignupInput = document.getElementById('password-signup');
    const passwordConfirmInput = document.getElementById('password-confirm-signup');
    if (showPassSignupCheckbox && passwordSignupInput && passwordConfirmInput) {
        showPassSignupCheckbox.addEventListener('change', () => {
            const type = showPassSignupCheckbox.checked ? 'text' : 'password';
            passwordSignupInput.type = type;
            passwordConfirmInput.type = type;
        });
    }
}

function showMain(){
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-section').style.display = 'block';
    const toggleCreate = document.getElementById('toggle-create-form');
    const createForm = document.getElementById('create-slot-form');
    const arrow = document.querySelector('.arrow');
    const activitiesDiv = document.getElementById('activities');
    const subDiv = document.getElementById('subactivities');
    const current
