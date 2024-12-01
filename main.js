import { TetrisGame } from './tetris.js';
import { CelebrationManager } from './celebration.js';

const celebration = new CelebrationManager();
const game = new TetrisGame(celebration);

const startButton = document.getElementById('start-game');

startButton.addEventListener('click', () => {
    // Schwierigkeitsgrad auslesen
    const difficultySelect = document.getElementById('difficulty');
    const selectedDifficulty = difficultySelect.value; // 'easy', 'normal' oder 'hard'
    game.setDifficulty(selectedDifficulty);
    game.start();
    startButton.disabled = true;
});

document.getElementById('play-again').addEventListener('click', () => {
    celebration.hide();
    game.reset();
    startButton.disabled = false;
});
