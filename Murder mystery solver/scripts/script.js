// scripts/script.js

let currentCase = null;
let difficulty = 'easy';
let clues = [];
let visitedRooms = [];

// Sound effects
const sounds = {
  typewriter: new Audio('assets/sounds/typewriter.mp3'),
  thunder: new Audio('assets/sounds/thunder.mp3'),
  train: new Audio('assets/sounds/train.mp3'),
  paper: new Audio('assets/sounds/paper.mp3'),
  sting: new Audio('assets/sounds/sting.mp3'),
  ding: new Audio('assets/sounds/ding.mp3')
};

function playSound(name) {
  if (sounds[name]) {
    sounds[name].currentTime = 0;
    sounds[name].play();
  }
}

const cases = {
  manor: {
    title: 'Murder at the Manor',
    suspects: [
      { name: 'Emily Blackwood', description: 'Heiress with a hidden past. Claims she was at the opera.', image: 'assets/images/Suspect 1.png' },
      { name: 'James Hollow', description: 'Butler with a secret. Says he was polishing silverware.', image: 'assets/images/Suspect 2.png' }
    ],
    clues: [
      { name: 'Bloody Knife', room: 'Kitchen' },
      { name: 'Torn Letter', room: 'Library' }
    ],
    timeline: '7:00 PM - Guests arrive<br>8:00 PM - Power outage<br>8:15 PM - Victim found dead',
    murderer: 'James Hollow',
    ambient: 'thunder',
    map: 'assets/maps/manor-map.jpg',
    rooms: ['Foyer', 'Kitchen', 'Library', 'Study']
  },
  express: {
    title: 'Shadows on the Express',
    suspects: [
      { name: 'Clara Wells', description: 'Mysterious author. Was asleep in her cabin.', image: 'assets/images/Suspect 3.png' },
      { name: 'Detective Roy', description: 'Off-duty detective. Claims he was investigating a theft.', image: 'assets/images/Suspect 4.png' }
    ],
    clues: [
      { name: 'Pocket Watch', room: 'Dining Car' },
      { name: 'Ticket Stub', room: 'Sleeper Cabin' }
    ],
    timeline: '11:45 PM - Train departs<br>12:30 AM - Lights flicker<br>12:45 AM - Body discovered in first class',
    murderer: 'Clara Wells',
    ambient: 'train',
    map: 'assets/maps/express-map.jpg',
    rooms: ['Dining Car', 'Sleeper Cabin', 'Luggage Car', 'Observation Deck']
  }
};

function startIntro() {
  const introText = `London, 1895.\nThe storm roared through the night as a body was discovered at the heart of Hollow Manor.\nYou've been called in to uncover the truth.\nThe clock is ticking...`;
  let index = 0;
  const speed = 50;
  const container = document.getElementById('typewriter-text');

  function type() {
    if (index < introText.length) {
      container.innerHTML += introText.charAt(index);
      playSound('typewriter');
      index++;
      setTimeout(type, speed);
    } else {
      setTimeout(() => {
        document.getElementById('intro-screen').style.display = 'none';
        document.querySelector('main').style.display = 'block';
      }, 1000);
    }
  }
  type();
}

function loadCase(caseKey) {
  currentCase = cases[caseKey];
  visitedRooms = [];
  clues = [];

  document.getElementById('case-selector').style.display = 'none';
  document.getElementById('game-content').style.display = 'block';

  playSound(currentCase.ambient);

  // Map setup
  document.getElementById('map-image').src = currentCase.map;
  const roomButtons = document.getElementById('room-buttons');
  roomButtons.innerHTML = '';
  currentCase.rooms.forEach(room => {
    const btn = document.createElement('button');
    btn.textContent = room;
    btn.onclick = () => visitRoom(room, btn);
    roomButtons.appendChild(btn);
  });

  // Load suspects
  const container = document.getElementById('character-container');
  container.innerHTML = '';
  currentCase.suspects.forEach(sus => {
    const div = document.createElement('div');
    div.className = 'character';
    div.innerHTML = `<img src="${sus.image}" alt="${sus.name}" />
                     <h3>${sus.name}</h3>
                     <p>${sus.description}</p>`;
    container.appendChild(div);
  });

  // Load timeline
  document.getElementById('timeline-content').innerHTML = currentCase.timeline;

  // Load deduction buttons
  const deduce = document.getElementById('deduction-buttons');
  deduce.innerHTML = '';
  currentCase.suspects.forEach(sus => {
    const btn = document.createElement('button');
    btn.textContent = `Accuse ${sus.name}`;
    btn.onclick = () => makeDeduction(sus.name);
    deduce.appendChild(btn);
  });

  // Clue area
  updateClueButtons();
}

function visitRoom(room, btn) {
  if (!visitedRooms.includes(room)) {
    visitedRooms.push(room);
    btn.classList.add('visited');
    updateClueButtons();
  }
}

function updateClueButtons() {
  const clueButtons = document.getElementById('clue-buttons');
  clueButtons.innerHTML = '';
  currentCase.clues.forEach(clue => {
    if (visitedRooms.includes(clue.room)) {
      const btn = document.createElement('button');
      btn.textContent = `Collect: ${clue.name}`;
      btn.onclick = () => collectClue(clue.name);
      clueButtons.appendChild(btn);
    }
  });
}

function setDifficulty(level) {
  difficulty = level;
  alert(`Difficulty set to ${level.toUpperCase()}`);
  localStorage.setItem('mystery_difficulty', level);
}

function collectClue(clue) {
  if (!clues.includes(clue)) {
    clues.push(clue);
    const clueList = document.getElementById('clue-list');
    const item = document.createElement('li');
    item.textContent = clue;
    clueList.appendChild(item);
    playSound('paper');
  } else {
    alert('Clue already collected!');
  }
}

function makeDeduction(suspect) {
  const result = confirm(`Are you sure you want to accuse ${suspect}?`);
  if (result) {
    if (currentCase && suspect === currentCase.murderer) {
      alert(`Correct! ${suspect} was the murderer.`);
      playSound('ding');
    } else {
      alert('Wrong deduction! Keep investigating.');
      playSound('sting');
    }
  }
}

function saveGame() {
  const data = {
    caseKey: Object.keys(cases).find(k => cases[k] === currentCase),
    difficulty,
    clues,
    visitedRooms
  };
  localStorage.setItem('mystery_save', JSON.stringify(data));
  alert('Game progress saved!');
}

function loadGame() {
  const data = JSON.parse(localStorage.getItem('mystery_save'));
  if (data) {
    clues = data.clues || [];
    difficulty = data.difficulty;
    visitedRooms = data.visitedRooms || [];
    loadCase(data.caseKey);

    const clueList = document.getElementById('clue-list');
    clueList.innerHTML = '';
    clues.forEach(clue => {
      const item = document.createElement('li');
      item.textContent = clue;
      clueList.appendChild(item);
    });

    alert(`Game loaded! Difficulty: ${difficulty}, Clues: ${clues.length}`);
  } else {
    alert('No saved game found.');
  }
}

window.onload = () => {
  const savedDifficulty = localStorage.getItem('mystery_difficulty');
  if (savedDifficulty) {
    difficulty = savedDifficulty;
  }
  startIntro();
};