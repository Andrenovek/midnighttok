/* ============================================================
   GREEN DAY VS LINKIN PARK — script.js
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
const BATTLE_REF = "battles/greenday-vs-linkin";


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
function updateUI(greenday, linkin) {
  const total = greenday + linkin;
  if (total === 0) return;

  const pctGreenday = Math.round((greenday / total) * 100);
  const pctLinkin   = 100 - pctGreenday;

  document.getElementById('pct-greenday').textContent = pctGreenday;
  document.getElementById('pct-linkin').textContent   = pctLinkin;

  document.getElementById('bar-greenday').style.width = pctGreenday + '%';
  document.getElementById('bar-linkin').style.width   = pctLinkin   + '%';

  document.getElementById('result-section').classList.add('visible');

  const banner = document.getElementById('winner-banner');

  if (total >= 5) {
    if (pctGreenday > pctLinkin) {
      banner.innerHTML = '🌿 Green Day is winning with <strong style="color:var(--greenday)">' + pctGreenday + '%</strong> of the votes!';
    } else if (pctLinkin > pctGreenday) {
      banner.innerHTML = '⚡ Linkin Park is winning with <strong style="color:var(--linkin)">' + pctLinkin + '%</strong> of the votes!';
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

    const label = artist === 'greenday' ? '🌿 Green Day' : '⚡ Linkin Park';
    showToast('Vote registered for ' + label + '!');

    if (artist === 'greenday') {
      document.getElementById('card-greenday').classList.add('selected-greenday');
    } else {
      document.getElementById('card-linkin').classList.add('selected-linkin');
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
    const greenday = data.greenday || 0;
    const linkin   = data.linkin   || 0;
    updateUI(greenday, linkin);
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

    if (myVote === 'greenday') {
      document.getElementById('card-greenday').classList.add('selected-greenday');
    } else {
      document.getElementById('card-linkin').classList.add('selected-linkin');
    }
  }

  listenToVotes();
})();