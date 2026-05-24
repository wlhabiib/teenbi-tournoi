const appState = {
  data: null,
  chat: []
};

const socket = io();

const elements = {
  heroTitle: document.getElementById('heroTitle'),
  heroText: document.getElementById('heroText'),
  heroStats: document.getElementById('heroStats'),
  summaryGrid: document.getElementById('summaryGrid'),
  matchPosters: document.getElementById('matchPosters'),
  teamsGrid: document.getElementById('teamsGrid'),
  bracketView: document.getElementById('bracketView'),
  resultEntry: document.getElementById('resultEntry'),
  drawHistory: document.getElementById('drawHistory'),
  resultsGrid: document.getElementById('resultsGrid'),
  chatMessages: document.getElementById('chatMessages'),
  startDrawBtn: document.getElementById('startDrawBtn'),
  resetBtn: document.getElementById('resetBtn'),
  chatForm: document.getElementById('chatForm'),
  supporterName: document.getElementById('supporterName'),
  supporterMessage: document.getElementById('supporterMessage')
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function statusTag(status) {
  if (status === 'completed') return '<span class="tag">Terminé</span>';
  if (status === 'scheduled') return '<span class="tag tag--warning">Programmée</span>';
  return '<span class="tag tag--danger">En attente</span>';
}

function formatScore(match) {
  if (typeof match.scoreHome === 'number' && typeof match.scoreAway === 'number') {
    return `${match.scoreHome} - ${match.scoreAway}`;
  }
  return 'À jouer';
}

function renderHero() {
  const state = appState.data;
  if (!state) return;

  const completedMatches = state.matches.filter((match) => match.status === 'completed' && match.round !== 'bye').length;
  const upcomingMatches = state.matches.filter((match) => match.status === 'scheduled').length;

  elements.heroTitle.textContent = `${state.tournamentName} — ${state.editionLabel}`;
  elements.heroText.textContent = `Une plateforme d'échange, de rire et de suivi complet du tournoi organisé ${state.seasonWindow.toLowerCase()}.`;

  elements.heroStats.innerHTML = [
    { label: 'Équipes engagées', value: state.teams.length },
    { label: 'Affiches publiées', value: state.matches.filter((match) => match.round !== 'bye').length },
    { label: 'Résultats validés', value: completedMatches },
    { label: 'Matchs à venir', value: upcomingMatches }
  ].map((item) => `
    <article class="stat-card">
      <div class="small">${item.label}</div>
      <strong style="font-size:1.8rem">${item.value}</strong>
    </article>
  `).join('');
}

function renderSummary() {
  const state = appState.data;
  if (!state) return;

  elements.summaryGrid.innerHTML = [
    { title: 'Période', value: state.seasonWindow },
    { title: 'Lieu', value: state.venue },
    { title: 'Terrain', value: state.pitch },
    { title: 'Format', value: '6 équipes • 3 matchs • 1 demi • 1 finale' }
  ].map((item) => `
    <article class="stat-card">
      <div class="small">${escapeHtml(item.title)}</div>
      <strong>${escapeHtml(item.value)}</strong>
    </article>
  `).join('');

  const displayMatches = state.matches.filter((match) => match.round !== 'bye');
  if (!displayMatches.length) {
    elements.matchPosters.innerHTML = '<div class="empty-state">Les affiches apparaîtront ici dès que le premier tirage sera lancé.</div>';
    return;
  }

  elements.matchPosters.innerHTML = displayMatches.map((match) => `
    <article class="match-card">
      <div class="match-header">
        <div>
          <div class="small">${escapeHtml(match.phaseLabel)}</div>
          <h3>${escapeHtml(match.label)}</h3>
        </div>
        ${statusTag(match.status)}
      </div>
      <div class="match-teams">
        <div class="team-line"><span>${escapeHtml(match.homeTeamName || 'À définir')}</span><strong>VS</strong></div>
        <div class="team-line"><span>${escapeHtml(match.awayTeamName || 'À définir')}</span><span class="score-badge">${escapeHtml(formatScore(match))}</span></div>
      </div>
      <div class="footer-note">📍 ${escapeHtml(match.venue)} • 🕒 <span class="kickoff">${escapeHtml(match.kickoff)}</span> • 🏟️ ${escapeHtml(match.pitch)}</div>
    </article>
  `).join('');
}

function renderTeams() {
  const state = appState.data;
  if (!state) return;

  elements.teamsGrid.innerHTML = state.teams.map((team, index) => `
    <article class="team-card">
      <div class="team-meta">
        <div>
          <div class="small">Équipe ${index + 1}</div>
          <h3>${escapeHtml(team.name)}</h3>
        </div>
        <span class="pill">${escapeHtml(team.coach)}</span>
      </div>
      <p class="muted">Coach officiel : <strong>${escapeHtml(team.coach)}</strong></p>
      <ul class="players-list">
        ${team.players.map((player) => `<li>${escapeHtml(player)}</li>`).join('')}
      </ul>
    </article>
  `).join('');
}

function renderBracket() {
  const state = appState.data;
  if (!state) return;

  const round1 = state.matches.filter((match) => match.round === 'round1');
  const semifinal = state.matches.find((match) => match.round === 'semifinal');
  const bye = state.matches.find((match) => match.round === 'bye');
  const final = state.matches.find((match) => match.round === 'final');

  const blocks = [];

  blocks.push(`
    <div class="result-card">
      <h3>Premier tirage</h3>
      ${round1.length ? round1.map((match) => `
        <div class="team-line">
          <span>${escapeHtml(match.homeTeamName)} vs ${escapeHtml(match.awayTeamName)}</span>
          <span>${escapeHtml(formatScore(match))}</span>
        </div>
      `).join('') : '<div class="notice">En attente du lancement automatique.</div>'}
    </div>
  `);

  blocks.push(`
    <div class="result-card">
      <h3>Deuxième tirage à 3 équipes</h3>
      ${bye ? `<div class="team-line"><span>Qualifiée directement en finale</span><strong>${escapeHtml(bye.qualifiedTeamName || 'À définir')}</strong></div>` : '<div class="notice">La qualification automatique s’affiche après les 3 premiers résultats.</div>'}
      ${semifinal ? `<div class="team-line"><span>Demi-finale</span><strong>${escapeHtml(semifinal.homeTeamName)} vs ${escapeHtml(semifinal.awayTeamName)}</strong></div>` : ''}
    </div>
  `);

  blocks.push(`
    <div class="result-card">
      <h3>Finale</h3>
      ${final ? `
        <div class="team-line">
          <span>${escapeHtml(final.homeTeamName)} vs ${escapeHtml(final.awayTeamName)}</span>
          <strong>${escapeHtml(formatScore(final))}</strong>
        </div>
      ` : '<div class="notice">La finale se génère automatiquement après la demi-finale.</div>'}
    </div>
  `);

  elements.bracketView.innerHTML = blocks.join('');
}

function renderResultEntry() {
  const state = appState.data;
  if (!state) return;

  const manageableMatches = state.matches.filter((match) => ['round1', 'semifinal', 'final'].includes(match.round));
  if (!manageableMatches.length) {
    elements.resultEntry.innerHTML = '<div class="empty-state">Aucun match à renseigner pour le moment.</div>';
    return;
  }

  elements.resultEntry.innerHTML = manageableMatches.map((match) => `
    <article class="match-card">
      <div class="match-header">
        <div>
          <div class="small">${escapeHtml(match.phaseLabel)}</div>
          <h3>${escapeHtml(match.homeTeamName)} vs ${escapeHtml(match.awayTeamName)}</h3>
        </div>
        ${statusTag(match.status)}
      </div>
      <div class="footer-note">Score actuel : <span class="score-badge">${escapeHtml(formatScore(match))}</span></div>
      <form class="score-form" data-match-id="${escapeHtml(match.id)}">
        <label>
          <span>${escapeHtml(match.homeTeamName)}</span>
          <input type="number" min="0" name="scoreHome" value="${typeof match.scoreHome === 'number' ? match.scoreHome : ''}" required />
        </label>
        <label>
          <span>${escapeHtml(match.awayTeamName)}</span>
          <input type="number" min="0" name="scoreAway" value="${typeof match.scoreAway === 'number' ? match.scoreAway : ''}" required />
        </label>
        <button class="btn btn--gold" type="submit">Valider</button>
      </form>
    </article>
  `).join('');

  document.querySelectorAll('.score-form').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const scoreHome = Number(formData.get('scoreHome'));
      const scoreAway = Number(formData.get('scoreAway'));
      const matchId = form.dataset.matchId;

      try {
        const response = await fetch(`/api/matches/${matchId}/result`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scoreHome, scoreAway })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Impossible de valider ce résultat.');
        appState.data = data;
        renderAll();
      } catch (error) {
        window.alert(error.message);
      }
    });
  });
}

function renderHistory() {
  const state = appState.data;
  if (!state) return;

  if (!state.drawHistory.length) {
    elements.drawHistory.innerHTML = '<div class="empty-state">L’historique du tirage transparent s’affichera ici avec les empreintes aléatoires utilisées.</div>';
    return;
  }

  elements.drawHistory.innerHTML = state.drawHistory.map((draw) => `
    <article class="history-card">
      <div class="result-row">
        <strong>${escapeHtml(draw.title)}</strong>
        <span class="small">${new Date(draw.timestamp).toLocaleString('fr-FR')}</span>
      </div>
      <p class="muted">Algorithme : ${escapeHtml(draw.algorithm)}</p>
      <p class="small">Seed : ${escapeHtml(draw.seed)}</p>
      ${draw.autoQualifiedTeamId ? `<p class="small">Équipe directement en finale : <strong>${escapeHtml(teamName(draw.autoQualifiedTeamId))}</strong></p>` : ''}
      <div>
        ${(draw.bytesUsed || []).map((item, index) => `
          <div class="history-byte">Étape ${index + 1} • octet ${escapeHtml(item.randomHex)} • choix ${escapeHtml(String(item.chosenIndex))} / ${escapeHtml(String(item.swapWindow))}</div>
        `).join('')}
      </div>
    </article>
  `).join('');
}

function renderResults() {
  const state = appState.data;
  if (!state) return;

  const ordered = [
    ...state.matches.filter((match) => match.round === 'round1'),
    ...state.matches.filter((match) => match.round === 'bye'),
    ...state.matches.filter((match) => match.round === 'semifinal'),
    ...state.matches.filter((match) => match.round === 'final')
  ];

  if (!ordered.length) {
    elements.resultsGrid.innerHTML = '<div class="empty-state">Les résultats officiels seront publiés ici au fil du tournoi.</div>';
    return;
  }

  elements.resultsGrid.innerHTML = ordered.map((match) => {
    if (match.round === 'bye') {
      return `
        <article class="result-card">
          <div class="match-header">
            <div>
              <div class="small">${escapeHtml(match.phaseLabel)}</div>
              <h3>${escapeHtml(match.label)}</h3>
            </div>
            ${statusTag(match.status)}
          </div>
          <p class="muted">${escapeHtml(match.qualifiedTeamName || 'Équipe à définir')} se qualifie automatiquement en finale.</p>
        </article>
      `;
    }

    return `
      <article class="result-card">
        <div class="match-header">
          <div>
            <div class="small">${escapeHtml(match.phaseLabel)}</div>
            <h3>${escapeHtml(match.label)}</h3>
          </div>
          ${statusTag(match.status)}
        </div>
        <div class="result-teams">
          <div class="team-line"><span>${escapeHtml(match.homeTeamName)}</span><strong>${typeof match.scoreHome === 'number' ? escapeHtml(String(match.scoreHome)) : '-'}</strong></div>
          <div class="team-line"><span>${escapeHtml(match.awayTeamName)}</span><strong>${typeof match.scoreAway === 'number' ? escapeHtml(String(match.scoreAway)) : '-'}</strong></div>
        </div>
        <div class="footer-note">Vainqueur : <strong>${escapeHtml(match.winnerTeamName || 'En attente')}</strong></div>
      </article>
    `;
  }).join('');
}

function renderChat() {
  if (!appState.chat.length) {
    elements.chatMessages.innerHTML = '<div class="empty-state">Le chat public est vide pour l’instant.</div>';
    return;
  }

  elements.chatMessages.innerHTML = appState.chat.map((message) => `
    <article class="chat-message">
      <div class="chat-header">
        <strong>${escapeHtml(message.user)}</strong>
        <span class="small">${new Date(message.time).toLocaleString('fr-FR')}</span>
      </div>
      <p>${escapeHtml(message.message)}</p>
    </article>
  `).join('');

  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function teamName(id) {
  return appState.data?.teams.find((team) => team.id === id)?.name || 'Équipe';
}

function renderAll() {
  renderHero();
  renderSummary();
  renderTeams();
  renderBracket();
  renderResultEntry();
  renderHistory();
  renderResults();
  renderChat();
  elements.startDrawBtn.disabled = appState.data?.matches.some((match) => match.round === 'round1');
  elements.startDrawBtn.style.opacity = elements.startDrawBtn.disabled ? '0.6' : '1';
}

async function fetchState() {
  const response = await fetch('/api/state');
  const data = await response.json();
  appState.data = data;
  renderAll();
}

async function launchDraw() {
  try {
    const response = await fetch('/api/draw/first', { method: 'POST' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Impossible de lancer le tirage.');
    appState.data = data;
    renderAll();
    window.location.hash = '#tirage';
  } catch (error) {
    window.alert(error.message);
  }
}

async function resetTournament() {
  const confirmation = window.confirm('Réinitialiser tout le tournoi, les tirages et le chat ?');
  if (!confirmation) return;

  try {
    const response = await fetch('/api/reset', { method: 'POST' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Impossible de réinitialiser.');
    appState.data = data;
    appState.chat = data.chat || [];
    renderAll();
  } catch (error) {
    window.alert(error.message);
  }
}

function setupEvents() {
  elements.startDrawBtn.addEventListener('click', launchDraw);
  elements.resetBtn.addEventListener('click', resetTournament);
  elements.chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const user = elements.supporterName.value.trim();
    const message = elements.supporterMessage.value.trim();
    if (!user || !message) return;
    socket.emit('chat:message', { user, message });
    elements.supporterMessage.value = '';
    elements.supporterMessage.focus();
  });
}

socket.on('chat:init', (messages) => {
  appState.chat = messages || [];
  renderChat();
});

socket.on('chat:new', (message) => {
  appState.chat = [...appState.chat, message].slice(-200);
  renderChat();
});

socket.on('state:update', (state) => {
  if (state) {
    appState.data = state;
    renderAll();
  }
});

window.addEventListener('DOMContentLoaded', async () => {
  setupEvents();
  await fetchState();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
});
