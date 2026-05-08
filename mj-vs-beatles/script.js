/* ============================================================
   MJ VS BEATLES — script.js
   1. Firebase configuration & initialization
   2. showToast()
   3. updateUI()
   4. vote()
   5. listenToVotes()
   6. init()
============================================================ */

import { initializeApp }                        from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, runTransaction, onValue }
                                                from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";


/* ============================================================
   1. FIREBASE CONFIGURATION
============================================================ */
const firebaseConfig = {
  apiKey:            "AIzaSyD6C3dMnvHo7WZ0ZBP6gtpUigPtLszgDgQ",
  authDomain:        "midnighttok-d82f4.firebaseapp.com",
  projectId:         "midnighttok-d82f4",
  storageBucket:     "midnighttok-d82f4.firebasestorage.app",
  messagingSenderId: "1003647180117",
  appId:             "1:1003647180117:web:d7633303db2b1e15ba63dc",
  measurementId:     "G-8SEVG3EXB8",
  databaseURL:       "https://midnighttok-d82f4-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ✅ Only this line changes for each new battle
const BATTLE_REF = "battles/mj-vs-beatles";


/* ============================================================
   2. showToast()
============================================================ */
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}


/* ============================================================
   3. updateUI()
============================================================ */
function updateUI(mj, beatles) {
  const total = mj + beatles;
  if (total === 0) return;

  const pctMJ      = Math.round((mj      / total) * 100);
  const pctBeatles = 100 - pctMJ;

  document.getElementById('pct-mj').textContent      = pctMJ;
  document.getElementById('pct-beatles').textContent = pctBeatles;

  document.getElementById('bar-mj').style.width      = pctMJ      + '%';
  document.getElementById('bar-beatles').style.width = pctBeatles + '%';

  document.getElementById('result-section').classList.add('visible');

  const banner = document.getElementById('winner-banner');

  if (total >= 5) {
    if (pctMJ > pctBeatles) {
      banner.innerHTML = '🕺 Michael Jackson is winning with <strong style="color:var(--mj)">' + pctMJ + '%</strong> of the votes!';
    } else if (pctBeatles > pctMJ) {
      banner.innerHTML = '🎸 The Beatles are winning with <strong style="color:var(--beatles)">' + pctBeatles + '%</strong> of the votes!';
    } else {
      banner.innerHTML = "⚡ It's a tie! The battle is too close to call!";
    }
    banner.classList.add('show');
  }
}


/* ============================================================
   4. vote()
============================================================ */
window.vote = function(artist) {
  const localKey = 'voted_' + BATTLE_REF.replace(/\//g, '_');

  if (localStorage.getItem(localKey)) {
    showToast('You already voted in this battle!');
    return;
  }

  const artistRef = ref(db, BATTLE_REF + '/' + artist);

  runTransaction(artistRef, (current) => {
    return (current || 0) + 1;
  }).then(() => {
    localStorage.setItem(localKey, artist);

    const label = artist === 'mj' ? '🕺 Michael Jackson' : '🎸 The Beatles';
    showToast('Vote registered for ' + label + '!');

    if (artist === 'mj') {
      document.getElementById('card-mj').classList.add('selected-mj');
    } else {
      document.getElementById('card-beatles').classList.add('selected-beatles');
    }

    document.querySelectorAll('.vote-btn').forEach(btn => btn.disabled = true);

  }).catch(() => {
    showToast('Connection error. Please try again.');
  });
}


/* ============================================================
   5. listenToVotes()
============================================================ */
function listenToVotes() {
  const battleRef = ref(db, BATTLE_REF);

  onValue(battleRef, (snapshot) => {
    const data    = snapshot.val() || {};
    const mj      = data.mj      || 0;
    const beatles = data.beatles || 0;
    updateUI(mj, beatles);
  });
}


/* ============================================================
   6. INITIALIZATION
============================================================ */
(function init() {
  const localKey = 'voted_' + BATTLE_REF.replace(/\//g, '_');
  const myVote   = localStorage.getItem(localKey);

  if (myVote) {
    document.querySelectorAll('.vote-btn').forEach(btn => btn.disabled = true);

    if (myVote === 'mj') {
      document.getElementById('card-mj').classList.add('selected-mj');
    } else {
      document.getElementById('card-beatles').classList.add('selected-beatles');
    }
  }

  listenToVotes();
})();