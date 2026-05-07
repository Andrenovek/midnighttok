/* ============================================================
   RAP BATTLE — script.js
   Sections:
   1. Configuration (localStorage key)
   2. getData()    — reads saved votes
   3. saveData()   — saves votes
   4. showToast()  — displays on-screen notification
   5. updateUI()   — updates bar, percentages, winner banner
   6. vote()       — registers the user's vote
   7. init()       — initializes the page
============================================================ */


/* ============================================================
   1. CONFIGURATION
   Change this key when creating a new battle (e.g. 'kendrick_vs_cole_v1')
   This ensures each battle has its own separate vote count.
============================================================ */
const STORAGE_KEY = 'rap_battle_drake_travis_v1';


/* ============================================================
   2. getData()
   Reads vote data from localStorage.
   Returns: { drake: 0, travis: 0, voted: false, myVote: null }
============================================================ */
function getData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { drake: 0, travis: 0, voted: false, myVote: null };
  } catch (e) {
    return { drake: 0, travis: 0, voted: false, myVote: null };
  }
}


/* ============================================================
   3. saveData()
   Saves the data object to localStorage.
============================================================ */
function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save votes:', e);
  }
}


/* ============================================================
   4. showToast()
   Displays a temporary notification at the bottom of the screen.
   Parameter: msg (string) — text to display
============================================================ */
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}


/* ============================================================
   5. updateUI()
   Updates the interface based on vote data.
   - Shows the results bar
   - Updates percentages
   - Displays winner banner (if enough votes)
   - Disables buttons if the user already voted
============================================================ */
function updateUI(data) {
  const total = data.drake + data.travis;

  // No votes yet: don't show results
  if (total === 0) return;

  // Calculate percentages
  const pctDrake  = Math.round((data.drake  / total) * 100);
  const pctTravis = 100 - pctDrake;

  // Update numbers on screen
  document.getElementById('pct-drake').textContent  = pctDrake;
  document.getElementById('pct-travis').textContent = pctTravis;

  // Update bar widths
  document.getElementById('bar-drake').style.width  = pctDrake + '%';
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

  // If user already voted: disable buttons and highlight chosen card
  if (data.voted) {
    document.querySelectorAll('.vote-btn').forEach(btn => btn.disabled = true);

    if (data.myVote === 'drake') {
      document.getElementById('card-drake').classList.add('selected-drake');
    } else {
      document.getElementById('card-travis').classList.add('selected-travis');
    }
  }
}


/* ============================================================
   6. vote()
   Called when the user clicks "Vote".
   Parameter: artist (string) — 'drake' or 'travis'
============================================================ */
function vote(artist) {
  const data = getData();

  // Prevent double voting
  if (data.voted) {
    showToast('You already voted in this battle!');
    return;
  }

  // Register vote
  data[artist]++;
  data.voted  = true;
  data.myVote = artist;
  saveData(data);

  // Visual feedback
  const label = artist === 'drake' ? '🦉 Drake' : '🌵 Travis Scott';
  showToast('Vote registered for ' + label + '!');

  // Update interface
  updateUI(data);
}


/* ============================================================
   7. INITIALIZATION
   Runs when the page loads.
   - Seeds initial (simulated) votes on first visit so the bar
     is visible right away. Remove this block to start from 0 x 0.
============================================================ */
(function init() {
  const data = getData();


  updateUI(data);
})();