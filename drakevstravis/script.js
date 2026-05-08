/* ============================================================
   RAP BATTLE — script.js
   Sections:
   1. Firebase configuration & initialization
   2. showToast()  — displays on-screen notification
   3. updateUI()   — updates bar, percentages, winner banner
   4. vote()       — registers the user's vote in Firebase
   5. listenToVotes() — listens to real-time updates from Firebase
   6. init()       — initializes the page
============================================================ */

import { initializeApp }                   from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, runTransaction, onValue }
                                           from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";


/* ============================================================
   1. FIREBASE CONFIGURATION
   These are your project credentials from the Firebase console.
============================================================ */
const firebaseConfig = {
  apiKey:            "AIzaSyD6C3dMnvHo7WZ0ZBP6gtpUigPtLszgDgQ",
  authDomain:        "midnighttok-d82f4.firebaseapp.com",
  projectId:         "midnighttok-d82f4",
  storageBucket:     "midnighttok-d82f4.firebasestorage.app",
  messagingSenderId: "1003747180117",
  appId:             "1:1003747180117:web:d7633303db2b1e15ba63dc",
  measurementId:     "G-8SEVG3EXB8",
  databaseURL:       "https://midnighttok-d82f4-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// Reference to the votes node in the database
// Each battle has its own path — change this for new battles
const BATTLE_REF = "battles/drake-vs-travis";


/* ============================================================
   2. showToast()
   Displays a temporary notification at the bottom of the screen.
============================================================ */
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');

  setTimeout(() => toast.classList.remove('show'), 2500);
}


/* ============================================================
   3. updateUI()
   Updates the bar, percentages and winner banner
   based on data coming from Firebase.
============================================================ */
function updateUI(drake, travis) {
  const total = drake + travis;
  if (total === 0) return;

  const pctDrake  = Math.round((drake  / total) * 100);
  const pctTravis = 100 - pctDrake;

  // Update percentages
  document.getElementById('pct-drake').textContent  = pctDrake;
  document.getElementById('pct-travis').textContent = pctTravis;

  // Update bar widths
  document.getElementById('bar-drake').style.width  = pctDrake  + '%';
  document.getElementById('bar-travis').style.width = pctTravis + '%';

  // Show results section
  document.getElementById('result-section').classList.add('visible');

  // Winner banner (shown after 5+ votes)
  const banner = document.getElementById('winner-banner');

  if (total >= 5) {
    if (pctDrake > pctTravis) {
      banner.innerHTML = '🦉 Drake is winning with <strong style="color:var(--drake)">' + pctDrake + '%</strong> of the votes!';
    } else if (pctTravis > pctDrake) {
      banner.innerHTML = '🌵 Travis Scott is winning with <strong style="color:var(--travis)">' + pctTravis + '%</strong> of the votes!';
    } else {
      banner.innerHTML = "⚡ It's a tie! The battle is too close to call!";
    }
    banner.classList.add('show');
  }
}


/* ============================================================
   4. vote()
   Called when the user clicks "Vote".
   Uses Firebase runTransaction to safely increment the counter
   even if multiple people vote at the exact same time.
============================================================ */
window.vote = function(artist) {

  // Check if user already voted (stored locally per device)
  const localKey = 'voted_' + BATTLE_REF.replace(/\//g, '_');
  if (localStorage.getItem(localKey)) {
    showToast('You already voted in this battle!');
    return;
  }

  // Increment the correct counter in Firebase
  const artistRef = ref(db, BATTLE_REF + '/' + artist);

  runTransaction(artistRef, (current) => {
    return (current || 0) + 1;
  }).then(() => {
    // Save vote locally so the user can't vote twice
    localStorage.setItem(localKey, artist);

    // Visual feedback
    const label = artist === 'drake' ? '🦉 Drake' : '🌵 Travis Scott';
    showToast('Vote registered for ' + label + '!');

    // Highlight the chosen card
    if (artist === 'drake') {
      document.getElementById('card-drake').classList.add('selected-drake');
    } else {
      document.getElementById('card-travis').classList.add('selected-travis');
    }

    // Disable both vote buttons
    document.querySelectorAll('.vote-btn').forEach(btn => btn.disabled = true);

  }).catch(() => {
    showToast('Connection error. Please try again.');
  });
}


/* ============================================================
   5. listenToVotes()
   Opens a real-time listener on Firebase.
   Every time any user votes, ALL open pages update instantly.
============================================================ */
function listenToVotes() {
  const battleRef = ref(db, BATTLE_REF);

  onValue(battleRef, (snapshot) => {
    const data   = snapshot.val() || {};
    const drake  = data.drake  || 0;
    const travis = data.travis || 0;
    updateUI(drake, travis);
  });
}


/* ============================================================
   6. INITIALIZATION
   - Restores voted state if the user already voted on this device
   - Starts listening to Firebase for real-time vote updates
============================================================ */
(function init() {
  const localKey  = 'voted_' + BATTLE_REF.replace(/\//g, '_');
  const myVote    = localStorage.getItem(localKey);

  // If user already voted on this device, disable buttons and highlight card
  if (myVote) {
    document.querySelectorAll('.vote-btn').forEach(btn => btn.disabled = true);

    if (myVote === 'drake') {
      document.getElementById('card-drake').classList.add('selected-drake');
    } else {
      document.getElementById('card-travis').classList.add('selected-travis');
    }
  }

  // Start real-time listener
  listenToVotes();
})();