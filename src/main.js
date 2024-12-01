import { TetrisGame } from './tetris.js';
import { CelebrationManager } from './celebration.js';
import { SoundManager } from './sound.js';

const celebration = new CelebrationManager();
const soundManager = new SoundManager();
const game = new TetrisGame(celebration, soundManager);

const startButton = document.getElementById('start-game');
const difficultyModal = document.getElementById('difficulty-modal');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const soundToggleButton = document.getElementById('sound-toggle');
const playAgainButton = document.getElementById('play-again');
const tryAgainButton = document.getElementById('try-again');
const gameOverScreen = document.getElementById('game-over');

startButton.addEventListener('click', () => {
  // Zeige das Schwierigkeitsauswahl-Modal
  difficultyModal.classList.remove('hidden');
});

difficultyButtons.forEach(button => {
  button.addEventListener('click', () => {
    const selectedDifficulty = button.getAttribute('data-difficulty');
    game.setDifficulty(selectedDifficulty);
    difficultyModal.classList.add('hidden');
    startButton.disabled = true;
    game.start();
  });
});

soundToggleButton.addEventListener('click', () => {
  soundManager.toggleMute();
  soundToggleButton.textContent = soundManager.isMuted ? '🔈' : '🔊';
});

playAgainButton.addEventListener('click', () => {
  celebration.hide();
  game.reset();
  startButton.disabled = false;
});

tryAgainButton.addEventListener('click', () => {
  gameOverScreen.classList.add('hidden');
  game.reset();
  startButton.disabled = false;
});
