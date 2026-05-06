/* ============================================================
   BATALHA DO RAP — script.js
   Organização:
   1. Configuração (chave do localStorage)
   2. getData()    — lê os votos salvos
   3. saveData()   — salva os votos
   4. showToast()  — exibe notificação na tela
   5. updateUI()   — atualiza barra, %, banner de vencedor
   6. vote()       — registra o voto do usuário
   7. init()       — inicializa a página
============================================================ */


/* ============================================================
   1. CONFIGURAÇÃO
   Altere a chave se criar uma nova batalha (ex: 'kendrick_vs_cole_v1')
   Isso garante que cada batalha tenha seus próprios votos.
============================================================ */
const STORAGE_KEY = 'rap_battle_drake_travis_v1';


/* ============================================================
   2. getData()
   Lê os dados de votos do localStorage.
   Retorna objeto: { drake: 0, travis: 0, voted: false, myVote: null }
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
   Salva o objeto de dados no localStorage.
============================================================ */
function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Não foi possível salvar os votos:', e);
  }
}


/* ============================================================
   4. showToast()
   Exibe uma notificação temporária na parte inferior da tela.
   Parâmetro: msg (string) — texto a exibir
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
   Atualiza a interface com base nos dados de votos.
   - Mostra a barra de resultado
   - Atualiza as porcentagens
   - Exibe o banner de vencedor (se tiver votos suficientes)
   - Desabilita botões se o usuário já votou
============================================================ */
function updateUI(data) {
  const total = data.drake + data.travis;

  // Sem votos ainda: não exibe resultado
  if (total === 0) return;

  // Calcula porcentagens
  const pctDrake  = Math.round((data.drake  / total) * 100);
  const pctTravis = 100 - pctDrake;

  // Atualiza os números na tela
  document.getElementById('pct-drake').textContent  = pctDrake;
  document.getElementById('pct-travis').textContent = pctTravis;

  // Atualiza a largura da barra
  document.getElementById('bar-drake').style.width = pctDrake + '%';

  // Exibe a seção de resultado
  document.getElementById('result-section').classList.add('visible');

  // Banner de vencedor (exibido a partir de 5 votos)
  const banner = document.getElementById('winner-banner');

  if (total >= 5) {
    if (pctDrake > pctTravis) {
      banner.innerHTML = '🦉 Drake está vencendo com <strong style="color:var(--drake)">' + pctDrake + '%</strong> dos votos!';
    } else if (pctTravis > pctDrake) {
      banner.innerHTML = '🌵 Travis Scott está vencendo com <strong style="color:var(--travis)">' + pctTravis + '%</strong> dos votos!';
    } else {
      banner.innerHTML = '⚡ Empate total! A batalha tá acirrada!';
    }
    banner.classList.add('show');
  }

  // Se o usuário já votou: desabilita botões e destaca o card escolhido
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
   Chamada quando o usuário clica em "Votar".
   Parâmetro: artist (string) — 'drake' ou 'travis'
============================================================ */
function vote(artist) {
  const data = getData();

  // Impede voto duplo
  if (data.voted) {
    showToast('Você já votou nessa batalha!');
    return;
  }

  // Registra o voto
  data[artist]++;
  data.voted  = true;
  data.myVote = artist;
  saveData(data);

  // Feedback visual
  const label = artist === 'drake' ? '🦉 Drake' : '🌵 Travis Scott';
  showToast('Voto registrado para ' + label + '!');

  // Atualiza a interface
  updateUI(data);
}


/* ============================================================
   7. INICIALIZAÇÃO
   Roda quando a página carrega.
   - Se for o primeiro acesso, semeia votos iniciais (simulados)
     para que a barra já apareça com um placar inicial.
   - Depois atualiza a interface com os dados atuais.
============================================================ */
(function init() {
  const data = getData();

  // Voto inicial simulado para mostrar a barra logo ao entrar
  // Remova esse bloco se quiser começar do zero (0 x 0)


  updateUI(data);
})();