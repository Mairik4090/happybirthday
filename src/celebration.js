export class CelebrationManager {
  constructor() {
    this.container = document.getElementById('celebration');
    this.createConfetti();
  }

  createConfetti() {
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#ff9ff3'];
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = -10 + 'px';
      confetti.style.animationDuration = 3 + Math.random() * 2 + 's';
      confetti.style.animationDelay = Math.random() * 5 + 's';
      this.container.appendChild(confetti);
    }
  }

  show() {
    this.container.classList.remove('hidden');
    // Starten der Konfetti-Animation
    const confettis = this.container.querySelectorAll('.confetti');
    confettis.forEach(confetti => {
      confetti.style.animationPlayState = 'running';
    });
  }

  hide() {
    this.container.classList.add('hidden');
    // Zurücksetzen der Konfetti-Animation
    const confettis = this.container.querySelectorAll('.confetti');
    confettis.forEach(confetti => {
      confetti.style.animationPlayState = 'paused';
    });
  }
}
