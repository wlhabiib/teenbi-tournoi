const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STORE_PATH)) {
    const initialState = {
      tournamentName: 'Tournoi de Fraternité du Quartier',
      editionLabel: 'Édition Tabaski',
      brand: {
        primary: '#0f0f0f',
        secondary: '#d4af37',
        accent: '#f7d774'
      },
      venue: 'Esplanade du Quartier',
      pitch: 'Terrain Principal',
      seasonWindow: 'Surlendemain de la fête de Tabaski',
      teams: [],
      matches: [],
      drawHistory: [],
      chat: []
    };

    fs.writeFileSync(STORE_PATH, JSON.stringify(initialState, null, 2), 'utf-8');
  }
}

function readState() {
  ensureStore();
  return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
}

function writeState(state) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), 'utf-8');
}

function buildTeamMap(teams) {
  return teams.reduce((acc, team) => {
    acc[team.id] = team;
    return acc;
  }, {});
}

function withResolvedNames(state) {
  const teamMap = buildTeamMap(state.teams);
  return {
    ...state,
    matches: state.matches.map((match) => ({
      ...match,
      homeTeamName: match.homeTeamId ? teamMap[match.homeTeamId]?.name || 'Équipe à définir' : null,
      awayTeamName: match.awayTeamId ? teamMap[match.awayTeamId]?.name || 'Équipe à définir' : null,
      winnerTeamName: match.winnerId ? teamMap[match.winnerId]?.name || 'Équipe qualifiée' : null,
      qualifiedTeamName: match.qualifiedTeamId ? teamMap[match.qualifiedTeamId]?.name || 'Équipe qualifiée' : null
    }))
  };
}

function secureShuffle(list) {
  const array = [...list];
  const bytesUsed = [];

  for (let i = array.length - 1; i > 0; i -= 1) {
    const buffer = crypto.randomBytes(4);
    const randomNumber = buffer.readUInt32BE(0);
    const j = randomNumber % (i + 1);
    bytesUsed.push({
      swapWindow: i + 1,
      randomHex: buffer.toString('hex'),
      chosenIndex: j
    });
    [array[i], array[j]] = [array[j], array[i]];
  }

  return { shuffled: array, bytesUsed };
}

function nextMatchTimes(roundKey) {
  const schedule = {
    round1: [
      '09:00',
      '11:00',
      '16:00'
    ],
    semifinal: ['18:00'],
    final: ['20:00']
  };

  return schedule[roundKey] || ['À confirmer'];
}

function makeRoundOneMatches(state, orderedTeamIds) {
  const times = nextMatchTimes('round1');
  const createdAt = new Date().toISOString();

  return [0, 1, 2].map((index) => ({
    id: `round1-match-${index + 1}`,
    round: 'round1',
    label: `Match ${index + 1}`,
    phaseLabel: 'Premiers matchs',
    homeTeamId: orderedTeamIds[index * 2],
    awayTeamId: orderedTeamIds[index * 2 + 1],
    venue: state.venue,
    pitch: `${state.pitch} ${index + 1}`,
    kickoff: times[index],
    createdAt,
    status: 'scheduled',
    scoreHome: null,
    scoreAway: null,
    winnerId: null,
    qualifiedTeamId: null,
    notes: 'Affiche officielle du premier tirage'
  }));
}

function maybeGenerateSemifinalAndBye(state) {
  const round1Matches = state.matches.filter((match) => match.round === 'round1');
  const allRound1Done = round1Matches.length === 3 && round1Matches.every((match) => match.winnerId);
  const semifinalExists = state.matches.some((match) => match.round === 'semifinal' || match.round === 'bye');

  if (!allRound1Done || semifinalExists) {
    return state;
  }

  const winners = round1Matches.map((match) => match.winnerId);
  const { shuffled, bytesUsed } = secureShuffle(winners);
  const seed = crypto.createHash('sha256').update(`${Date.now()}-${crypto.randomBytes(12).toString('hex')}`).digest('hex');
  const timestamp = new Date().toISOString();

  const byeTeamId = shuffled[0];
  const semiTeams = shuffled.slice(1);

  state.drawHistory.push({
    id: `draw-semifinal-${Date.now()}`,
    round: 'semifinal-draw',
    title: 'Deuxième tirage automatique des 3 vainqueurs',
    timestamp,
    seed,
    algorithm: 'Fisher-Yates avec octets cryptographiques',
    participants: winners,
    orderedTeams: shuffled,
    autoQualifiedTeamId: byeTeamId,
    pairings: [
      {
        homeTeamId: semiTeams[0],
        awayTeamId: semiTeams[1]
      }
    ],
    bytesUsed
  });

  state.matches.push({
    id: 'bye-final',
    round: 'bye',
    label: 'Qualification automatique',
    phaseLabel: 'Accès direct à la finale',
    homeTeamId: null,
    awayTeamId: null,
    venue: state.venue,
    pitch: state.pitch,
    kickoff: 'En attente de la demi-finale',
    createdAt: timestamp,
    status: 'completed',
    scoreHome: null,
    scoreAway: null,
    winnerId: null,
    qualifiedTeamId: byeTeamId,
    notes: 'Équipe qualifiée automatiquement en finale après le tirage à 3.'
  });

  state.matches.push({
    id: 'semifinal-match-1',
    round: 'semifinal',
    label: 'Demi-finale',
    phaseLabel: 'Demi-finale',
    homeTeamId: semiTeams[0],
    awayTeamId: semiTeams[1],
    venue: state.venue,
    pitch: `${state.pitch} Prestige`,
    kickoff: nextMatchTimes('semifinal')[0],
    createdAt: timestamp,
    status: 'scheduled',
    scoreHome: null,
    scoreAway: null,
    winnerId: null,
    qualifiedTeamId: null,
    notes: 'Match issu du deuxième tirage automatique.'
  });

  return state;
}

function maybeGenerateFinal(state) {
  const semifinal = state.matches.find((match) => match.round === 'semifinal');
  const bye = state.matches.find((match) => match.round === 'bye');
  const finalExists = state.matches.some((match) => match.round === 'final');

  if (!semifinal || !bye || !semifinal.winnerId || !bye.qualifiedTeamId || finalExists) {
    return state;
  }

  state.matches.push({
    id: 'final-match-1',
    round: 'final',
    label: 'Finale',
    phaseLabel: 'Finale',
    homeTeamId: bye.qualifiedTeamId,
    awayTeamId: semifinal.winnerId,
    venue: state.venue,
    pitch: `${state.pitch} Finale`,
    kickoff: nextMatchTimes('final')[0],
    createdAt: new Date().toISOString(),
    status: 'scheduled',
    scoreHome: null,
    scoreAway: null,
    winnerId: null,
    qualifiedTeamId: null,
    notes: 'Le vainqueur de la demi-finale rejoint l’équipe déjà qualifiée.'
  });

  return state;
}

app.get('/api/state', (req, res) => {
  const state = readState();
  res.json(withResolvedNames(state));
});

app.post('/api/draw/first', (req, res) => {
  const state = readState();
  const hasInitialDraw = state.matches.some((match) => match.round === 'round1');

  if (hasInitialDraw) {
    return res.status(400).json({ error: 'Le premier tirage a déjà été effectué.' });
  }

  if (!Array.isArray(state.teams) || state.teams.length !== 6) {
    return res.status(400).json({ error: 'Le tournoi doit contenir exactement 6 équipes.' });
  }

  const participants = state.teams.map((team) => team.id);
  const { shuffled, bytesUsed } = secureShuffle(participants);
  const seed = crypto.createHash('sha256').update(`${Date.now()}-${crypto.randomBytes(16).toString('hex')}`).digest('hex');
  const timestamp = new Date().toISOString();

  state.drawHistory.push({
    id: `draw-round1-${Date.now()}`,
    round: 'round1-draw',
    title: 'Premier tirage automatique des 6 équipes',
    timestamp,
    seed,
    algorithm: 'Fisher-Yates avec octets cryptographiques',
    participants,
    orderedTeams: shuffled,
    pairings: [
      { homeTeamId: shuffled[0], awayTeamId: shuffled[1] },
      { homeTeamId: shuffled[2], awayTeamId: shuffled[3] },
      { homeTeamId: shuffled[4], awayTeamId: shuffled[5] }
    ],
    bytesUsed
  });

  state.matches = [...state.matches, ...makeRoundOneMatches(state, shuffled)];
  writeState(state);

  return res.json(withResolvedNames(state));
});

app.post('/api/matches/:id/result', (req, res) => {
  const { id } = req.params;
  const { scoreHome, scoreAway } = req.body || {};

  if (typeof scoreHome !== 'number' || typeof scoreAway !== 'number') {
    return res.status(400).json({ error: 'Les scores doivent être numériques.' });
  }

  if (scoreHome === scoreAway) {
    return res.status(400).json({ error: 'Le tournoi est à élimination directe : pas de match nul.' });
  }

  const state = readState();
  const match = state.matches.find((item) => item.id === id);

  if (!match) {
    return res.status(404).json({ error: 'Match introuvable.' });
  }

  match.scoreHome = scoreHome;
  match.scoreAway = scoreAway;
  match.status = 'completed';
  match.winnerId = scoreHome > scoreAway ? match.homeTeamId : match.awayTeamId;

  maybeGenerateSemifinalAndBye(state);
  maybeGenerateFinal(state);
  writeState(state);

  return res.json(withResolvedNames(state));
});

app.post('/api/reset', (req, res) => {
  const state = readState();
  state.matches = [];
  state.drawHistory = [];
  state.chat = [
    {
      id: `welcome-${Date.now()}`,
      user: 'Organisation',
      message: 'Le tournoi a été réinitialisé. Nouveau départ, nouvelle ambiance !',
      time: new Date().toISOString()
    }
  ];
  writeState(state);
  io.emit('state:update', withResolvedNames(state));
  io.emit('chat:init', state.chat);
  return res.json(withResolvedNames(state));
});

io.on('connection', (socket) => {
  const state = readState();
  socket.emit('chat:init', state.chat);
  socket.emit('state:update', withResolvedNames(state));

  socket.on('chat:message', (payload) => {
    const user = String(payload?.user || '').trim().slice(0, 30);
    const message = String(payload?.message || '').trim().slice(0, 240);

    if (!user || !message) {
      return;
    }

    const currentState = readState();
    const chatMessage = {
      id: crypto.randomUUID(),
      user,
      message,
      time: new Date().toISOString()
    };

    currentState.chat.push(chatMessage);
    currentState.chat = currentState.chat.slice(-200);
    writeState(currentState);
    io.emit('chat:new', chatMessage);
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Tournoi PWA démarrée sur http://localhost:${PORT}`);
});
