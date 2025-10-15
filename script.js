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
    const currentActivityEl = document.getElementById('current-activity');
    const activitySeparator = document.getElementById('activity-separator');
    const formActivitySelect = document.getElementById('form-activity-select');
    const formSubSelect = document.getElementById('sub-select');
    const subsubSelect = document.getElementById('subsub-select');
    const createBtn = document.getElementById('create-slot');
    const cityFilterSelect = document.getElementById('city-filter-select');
    const groupFilterSelect = document.getElementById('group-filter-select');
    const formGroupInput = document.getElementById('form-group-input');
    const groupSuggestions = document.getElementById('group-suggestions');
    let selectedActivity = null;

    async function populateGroupSelects() {
        if (!currentUser) return;
        const groupSnapshot = await db.collection('groups').where('members_uid', 'array-contains', currentUser.uid).get();
        const filterOptions = ['<option value="Toutes">Tous</option>'];
        const suggestionsHTML = [];
        groupSnapshot.forEach(doc => {
            const groupName = doc.data().name;
            filterOptions.push(`<option value="${doc.id}">${groupName}</option>`);
            suggestionsHTML.push(`<option value="${groupName}">`);
        });
        if (groupFilterSelect) {
            groupFilterSelect.innerHTML = filterOptions.join('');
            groupFilterSelect.value = currentFilterGroup;
            groupFilterSelect.onchange = () => {
                currentFilterGroup = groupFilterSelect.value;
                loadSlots();
            };
        }
        if (groupSuggestions) {
            groupSuggestions.innerHTML = suggestionsHTML.join('');
        }
    }

    function populateFormActivitySelect(){
        if (!formActivitySelect) return;
        formActivitySelect.innerHTML = '<option value="">-- Choisis une activité --</option>';
        Object.keys(ACTIVITIES).filter(a=>a!=='Toutes').forEach(act => {
            const emoji = ACTIVITY_EMOJIS[act] || '';
            const o = document.createElement('option'); o.value = act; o.textContent = `${emoji} ${act}`; formActivitySelect.appendChild(o);
        });
        formActivitySelect.value = selectedActivity || '';
        populateSubActivitiesForForm(formActivitySelect.value);
    }

    function renderActivities(){
        activitiesDiv.innerHTML = '';
        orderedActivityKeys.forEach(act => {
            const b = document.createElement('button');
            const classNameMap = { "Jeux": 'act-jeux', "Culture": 'act-culture', "Sport": 'act-sport', "Sorties": 'act-sorties', "Autres": 'act-autres', "Toutes": 'act-toutes' };
            const className = classNameMap[act] || `act-${act.toLowerCase().replace(/\s|\//g, '-')}`;
            b.className = 'activity-btn ' + className + (act === currentFilterActivity ? ' active' : '');
            const emoji = ACTIVITY_EMOJIS[act] || '';
            b.textContent = `${emoji} ${act}`;
            b.addEventListener('click', ()=> {
                currentFilterActivity = act;
                currentFilterSub = "Toutes";
                loadSlots();
                document.querySelectorAll('.activity-buttons > .activity-btn').forEach(btn => btn.classList.remove('active'));
                b.classList.add('active');
                if(act !== "Toutes") {
                    selectedActivity = act;
                    activitySeparator.style.display = 'inline';
                    currentActivityEl.textContent = `${emoji} ${act}`;
                    populateSubActivities(act);
                    if (formActivitySelect) { formActivitySelect.value = act; populateSubActivitiesForForm(act); }
                } else {
                    selectedActivity = null;
                    activitySeparator.style.display = 'none';
                    currentActivityEl.textContent = '';
                    subDiv.innerHTML = '';
                }
            });
            activitiesDiv.appendChild(b);
        });
        populateFormActivitySelect();
        if (currentFilterActivity !== "Toutes") { populateSubActivities(currentFilterActivity); }
    }

    function populateSubActivities(act){
        subDiv.innerHTML = '';
        const resetBtn = document.createElement('button');
        resetBtn.className = 'activity-btn';
        resetBtn.textContent = '❌ Toutes les sous-activités';
        const actColor = COLOR_MAP[act] || '#9aa9bf';
        resetBtn.style.borderColor = actColor;
        resetBtn.style.color = actColor;
        if (currentFilterSub === "Toutes") {
             resetBtn.classList.add('active');
             resetBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }
        resetBtn.addEventListener('click', () => { currentFilterSub = "Toutes"; loadSlots(); populateSubActivities(act); });
        subDiv.appendChild(resetBtn);
        const subs = ACTIVITIES[act] || [];
        subs.forEach(s => {
            const btn = document.createElement('button');
            btn.className = 'activity-btn';
            const btnColor = COLOR_MAP[s] || COLOR_MAP[act] || 'var(--muted-text)';
            btn.style.borderColor = btnColor;
            btn.style.color = btnColor;
            if (s === currentFilterSub) {
                btn.classList.add('active');
                btn.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }
            btn.textContent = s;
            btn.addEventListener('click', ()=> {
                formSubSelect.value = s;
                populateSubSub(s);
                currentFilterSub = s;
                loadSlots();
                populateSubActivities(act);
            });
            subDiv.appendChild(btn);
        });
    }

    function populateSubActivitiesForForm(act){
        formSubSelect.innerHTML = '<option value="">-- Choisis une sous-activité --</option>';
        (ACTIVITIES[act]||[]).forEach(s => {
            const o = document.createElement('option'); o.value = s; o.textContent = s; formSubSelect.appendChild(o);
        });
        populateSubSub(formSubSelect.value);
    }

    function populateSubSub(sub){
        subsubSelect.innerHTML = '<option value="">-- Optionnel --</option>';
        (SUBSUB[sub]||[]).forEach(ss=>{
            const o = document.createElement('option'); o.value = ss; o.textContent = ss; subsubSelect.appendChild(o);
        });
    }

    async function populateCityFilter() {
        if (!cityFilterSelect) return;
        const snapshot = await db.collection('slots').where('private', '==', false).get();
        const cities = new Set();
        snapshot.forEach(doc => { 
            if(doc.data().location) {
                const city = extractCity(doc.data().location);
                if (city) {
                    cities.add(city);
                }
            }
        });
        const sortedCities = Array.from(cities).sort((a, b) => a.localeCompare(b, 'fr'));
        cityFilterSelect.innerHTML = '<option value="Toutes">Toutes</option>';
        sortedCities.forEach(city => {
            const o = document.createElement('option'); o.value = city; o.textContent = city; cityFilterSelect.appendChild(o);
        });
        cityFilterSelect.value = currentFilterCity;
        cityFilterSelect.onchange = () => { currentFilterCity = cityFilterSelect.value; loadSlots(); };
    }

    async function loadSlots() {
        const list = document.getElementById('slots-list');
        const archivedList = document.getElementById('archived-slots-list');
        if (!list || !archivedList) return;
        list.innerHTML = '';
        archivedList.innerHTML = '';

        let baseQuery = db.collection('slots');
        // Appliquer les filtres de base
        if (currentFilterActivity !== "Toutes") { baseQuery = baseQuery.where('activity', '==', currentFilterActivity); }
        if (currentFilterSub !== "Toutes") { baseQuery = baseQuery.where('sub', '==', currentFilterSub); }
        if (currentFilterGroup !== "Toutes") { baseQuery = baseQuery.where('groupId', '==', currentFilterGroup); }
        
        const now = new Date().toISOString().split('T')[0];

        // Promesses pour les requêtes
        const promises = [];
        promises.push(baseQuery.where('private', '==', false).get());
        if (currentUser) {
            promises.push(baseQuery.where('private', '==', true).where('participants_uid', 'array-contains', currentUser.uid).get());
        }

        const snapshots = await Promise.all(promises);
        const slotsMap = new Map();
        snapshots.forEach(snapshot => {
            snapshot.forEach(doc => {
                slotsMap.set(doc.id, { id: doc.id, ...doc.data() });
            });
        });

        let allSlots = Array.from(slotsMap.values());

        // Filtrage par ville
        if (currentFilterCity !== "Toutes") {
            allSlots = allSlots.filter(s => extractCity(s.location) === currentFilterCity);
        }

        const currentSlots = allSlots.filter(s => s.date >= now);
        const archivedSlots = allSlots.filter(s => s.date < now);

        // Tri
        currentSlots.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
        archivedSlots.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));
        
        // Affichage
        if (currentSlots.length === 0) {
            list.innerHTML = '<li style="color:var(--muted-text); padding: 10px 0;">Aucun créneau à venir ne correspond à vos filtres.</li>';
        } else {
            currentSlots.forEach(slot => renderSlotItem(slot, list, false));
        }
        if (archivedSlots.length === 0) {
            archivedList.innerHTML = '<li style="color:var(--muted-text); padding: 10px 0;">Aucun créneau archivé.</li>';
        } else {
            archivedSlots.forEach(slot => renderSlotItem(slot, archivedList, true));
        }
    }

    renderActivities();
    loadSlots();
    populateCityFilter();
    populateGroupSelects();

    if (toggleCreate && createForm) toggleCreate.addEventListener('click', ()=> {
        const visible = createForm.style.display === 'block';
        createForm.style.display = visible ? 'none' : 'block';
        arrow.style.transform = visible ? 'rotate(0deg)' : 'rotate(90deg)';
        if (!visible) {
            populateFormActivitySelect();
            formActivitySelect.value = selectedActivity || '';
            populateSubActivitiesForForm(formActivitySelect.value);
        }
    });

    if (formActivitySelect) formActivitySelect.addEventListener('change', ()=>{
        selectedActivity = formActivitySelect.value;
        const emoji = ACTIVITY_EMOJIS[selectedActivity] || '';
        activitySeparator.style.display = 'inline';
        currentActivityEl.textContent = selectedActivity ? `${emoji} ${selectedActivity}` : 'Aucune';
        populateSubActivitiesForForm(selectedActivity);
    });

    formSubSelect.addEventListener('change', ()=> populateSubSub(formSubSelect.value));

    if (createBtn) createBtn.addEventListener('click', async ()=> {
        if (!currentUser) return alert('Connecte-toi d’abord');
        const name = (document.getElementById('slot-name')?.value||'').trim();
        const location = (document.getElementById('slot-location')?.value||'').trim();
        const date = (document.getElementById('slot-date')?.value||'').trim();
        const time = (document.getElementById('slot-time')?.value||'').trim();
        const activity = formActivitySelect.value;
        const groupName = formGroupInput.value.trim();
        const details = (document.getElementById('slot-details')?.value || '').trim();
        if (!activity) return alert('Choisis d’abord une activité (ex: Jeux)');
        if (!name || !location || !date || !time) return alert('Remplis les champs nom, lieu, date et heure');
        let groupId = null;
        if (groupName) {
            const groupQuery = await db.collection('groups').where('name', '==', groupName).get();
            if (groupQuery.empty) {
                const newGroup = {
                    name: groupName,
                    owner_uid: currentUser.uid,
                    owner_pseudo: currentUser.pseudo,
                    members_uid: [currentUser.uid],
                    members: [{ uid: currentUser.uid, pseudo: currentUser.pseudo }],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    private: true
                };
                const groupDocRef = await db.collection('groups').add(newGroup);
                groupId = groupDocRef.id;
            } else {
                groupId = groupQuery.docs[0].id;
            }
        }
        const newSlot = {
            activity: activity, sub: formSubSelect.value || '', subsub: subsubSelect.value || '',
            name: name, location: location, date: date, time: time, details: details,
            private: !!document.getElementById('private-slot')?.checked,
            groupId: groupId,
            groupName: groupName || null,
            owner: currentUser.uid, ownerPseudo: currentUser.pseudo,
            participants: [{uid: currentUser.uid, pseudo: currentUser.pseudo}],
            participants_uid: [currentUser.uid],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            invited_uids: [],
            invited_pseudos: []
        };
        db.collection('slots').add(newSlot).then(() => {
            console.log("Créneau créé !");
            createForm.reset();
            formGroupInput.value = '';
            createForm.style.display = 'none';
            if (arrow) arrow.style.transform = 'rotate(0deg)';
            loadSlots();
            populateCityFilter();
            populateGroupSelects();
        }).catch(error => { console.error("Erreur: ", error); alert("Une erreur est survenue."); });
    });
}
