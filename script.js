let noteCreationInterval = 800; // Tempo inicial para criar notas
let noteSpeed = 12; // Velocidade inicial das notas
let difficultyIncreaseInterval; // Intervalo para aumentar a dificuldade
const backgroundVideo = document.getElementById('background-video'); // Certifique-se de ter um ID correspondente no HTML
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;

backgroundVideo.style.filter = 'brightness(30%)';

if (highScore > 999) {
  highScore = 0;
  localStorage.setItem('highScore', highScore); // Reseta para 0 se estiver muito alto
}

function checkHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore); // Armazena o novo recorde no localStorage
  }
}

function displayHighScore() {
  document.getElementById('high-score').textContent = `Recorde: ${highScore}`;
}

backgroundVideo.addEventListener('canplay', function() {
  console.log('O vídeo está pronto para ser reproduzido.');
});

function increaseDifficulty() {
  // Diminui o intervalo de criação de notas até um limite mínimo
  if (noteCreationInterval > 260) {
    noteCreationInterval -= 55; // Diminui o tempo entre as notas
    clearInterval(noteInterval);
    noteInterval = setInterval(createNote, noteCreationInterval);
  }

  // Aumenta a velocidade das notas até um limite máximo
  if (noteSpeed < 27) {
    noteSpeed += 1.5; // Aumenta a velocidade de movimento das notas
  }
}

const lines = {
  'a': document.getElementById('line-a'),
  's': document.getElementById('line-s'),
  'd': document.getElementById('line-d'),
  'f': document.getElementById('line-f'),
};

const keys = ['a', 's', 'd', 'f'];
let score = 0;
let notes = [];
let mistakes = 0;
const maxMistakes = 6;

let noteInterval;
let moveInterval;

function createNote() {
  const key = keys[Math.floor(Math.random() * keys.length)];
  const note = document.createElement('div');
  note.classList.add('note');
  note.dataset.key = key;
  note.dataset.missed = 'false';
  note.dataset.hit = 'false';  // Adiciona atributo para indicar se já foi acertada
  note.style.top = '-60px';
  lines[key].appendChild(note);
  notes.push(note);
}

function moveNotes() {
  notes.forEach((note, index) => {
    const top = parseInt(note.style.top || -60);
    if (top > 470 && note.dataset.missed === 'false') {
      note.dataset.missed = 'true';
      lines[note.dataset.key].classList.add('flash');
      setTimeout(() => {
        lines[note.dataset.key].classList.remove('flash');
      }, 200);
      note.remove();
      notes.splice(index, 1);
      registerMistake();
    } else if (note.dataset.missed === 'false') {
      note.style.top = `${top + noteSpeed}px`; // Usa a velocidade dinâmica aqui
    }
  });
}

function checkKeyPress(event) {
  const key = event.key.toLowerCase();
  if (keys.includes(key)) {
    const line = lines[key];
    const note = notes.find(n => n.dataset.key === key && n.dataset.hit === 'false' && n.dataset.missed === 'false');
    if (note) {
      const notePosition = parseInt(note.style.top);
      if (notePosition > 370 && notePosition < 520) {
        note.dataset.hit = 'true';  // Marca a nota como acertada
        note.remove();  // Remove a nota da interface
        notes = notes.filter(n => n !== note);  // Remove a nota da lista de notas
        score++;
        document.getElementById('score').textContent = `Score: ${score}`;

        // Adiciona o flash branco ao acertar
        line.classList.add('flash-white');
        setTimeout(() => {
          line.classList.remove('flash-white');
        }, 200);

        // Inicia o vídeo quando a pontuação atingir 50
        if (score === 100) {
          startBackgroundVideo();
        }
      }
    }
  }
}

function startBackgroundVideo() {
  backgroundVideo.style.display = 'block';  // Torna o vídeo visível
  backgroundVideo.play(); // Inicia o vídeo
}

function registerMistake() {
  mistakes++;
  if (mistakes >= maxMistakes) {
    endGame();
  }
}

function endGame() {
  clearInterval(noteInterval);
  clearInterval(moveInterval);
  clearInterval(difficultyIncreaseInterval);
  
  // Verifica e atualiza o recorde antes de exibir o Game Over
  checkHighScore();
  document.getElementById('final-score').textContent = score;
  document.getElementById('high-score').textContent = `Recorde: ${highScore}`;
  
  document.getElementById('game-over').classList.remove('hidden');
  document.getElementById('game-container').classList.add('hidden');
  document.getElementById('score').classList.add('hidden');
}

function restartGame() {
  score = 0;
  mistakes = 0;
  noteCreationInterval = 800;
  noteSpeed =12;
  
  document.getElementById('score').textContent = `Score: ${score}`;
  document.getElementById('high-score').textContent = `Recorde: ${highScore}`; // Exibe o recorde ao reiniciar
  
  document.getElementById('game-over').classList.add('hidden');
  document.getElementById('game-container').classList.remove('hidden');
  document.getElementById('score').classList.remove('hidden');
  
  notes.forEach(note => note.remove());
  notes = [];
  
  clearInterval(noteInterval);
  clearInterval(moveInterval);
  clearInterval(difficultyIncreaseInterval);

  backgroundVideo.pause();
  backgroundVideo.currentTime = 0; // Reinicia o vídeo para o início
  backgroundVideo.style.display = 'none'; // Oculta o vídeo
  
  startGame();
}

document.addEventListener('keydown', checkKeyPress);

function startGame() {
  noteInterval = setInterval(() => {
    createNote();
  }, noteCreationInterval);

  moveInterval = setInterval(() => {
    moveNotes();
  }, 50);

  // Aumenta a dificuldade a cada 8 segundos
  difficultyIncreaseInterval = setInterval(increaseDifficulty, 8000);
  
  displayHighScore(); // Exibe o recorde ao iniciar o jogo
}

startGame();
