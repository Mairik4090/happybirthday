export class TetrisGame {
  constructor(celebrationManager, soundManager) {
    this.canvas = document.getElementById('tetris-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 300;
    this.canvas.height = 600;

    this.blockSize = 30;
    this.cols = 10;
    this.rows = 20;
    this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));

    this.currentPiece = null;
    this.score = 0;
    this.isRunning = false;

    // Standardgeschwindigkeitseinstellungen
    this.defaultSpeed = 500; // Wird basierend auf dem Schwierigkeitsgrad angepasst
    this.speed = this.defaultSpeed; // Aktuelle Fallgeschwindigkeit

    this.minSpeed = 100; // Mindestgeschwindigkeit
    this.speedIncrement = 50; // Geschwindigkeitserhöhung pro Level
    this.level = 1;

    // Zeitstempel zur Steuerung der Fallgeschwindigkeit
    this.lastTime = 0;

    // Linien und Siegbedingung
    this.linesClearedTotal = 0; // Gesamtzahl der gelöschten Linien
    this.linesToWin = 1; // Anzahl der Linien zum Sieg

    // Schwierigkeitsgrad
    this.difficulty = 'normal'; // Standard-Schwierigkeitsgrad
    this.pointMultiplier = 1; // Punktmultiplikator basierend auf Schwierigkeitsgrad

    this.celebrationManager = celebrationManager; // CelebrationManager speichern
    this.soundManager = soundManager; // SoundManager speichern

    this.setupControls();
    this.reset();
    this.draw(); // Initiales Zeichnen des leeren Gitters
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    switch (difficulty) {
      case 'easy':
        this.speed = 700; // Langsamere Fallgeschwindigkeit
        this.pointMultiplier = 1; // Basis-Punkte
        break;
      case 'normal':
        this.speed = 500; // Standard-Fallgeschwindigkeit
        this.pointMultiplier = 3; // Erhöhte Punkte
        break;
      case 'hard':
        this.speed = 50; // Schnellere Fallgeschwindigkeit
        this.pointMultiplier = 5; // Noch mehr Punkte
        break;
      default:
        this.speed = 500;
        this.pointMultiplier = 1;
        break;
    }
    // Stellen Sie sicher, dass nur Ganzzahlen verwendet werden
    this.speed = Math.floor(this.speed);
    this.pointMultiplier = Math.floor(this.pointMultiplier);
  }

  reset() {
    this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    this.score = 0;
    this.isRunning = false;
    this.speed = this.defaultSpeed;
    this.level = 1;
    this.linesClearedTotal = 0;
    this.updateScore();
    this.updateLinesRemaining();
    this.spawnPiece();
    cancelAnimationFrame(this.animationFrame);
    this.draw();
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.gameLoop();
    }
  }

  spawnPiece() {
    const pieces = [
      [[1,1,1,1]], // I
      [[1,1],[1,1]], // O
      [[1,1,1],[0,1,0]], // T
      [[1,1,1],[1,0,0]], // L
      [[1,1,1],[0,0,1]], // J
      [[1,1,0],[0,1,1]], // S
      [[0,1,1],[1,1,0]]  // Z
    ];

    this.currentPiece = {
      shape: pieces[Math.floor(Math.random() * pieces.length)],
      x: Math.floor(this.cols / 2) - 1,
      y: 0
    };
  }

  moveDown() {
    if (!this.isRunning) return;

    this.currentPiece.y++;
    if (this.checkCollision()) {
      this.currentPiece.y--;
      this.mergePiece();
      const linesCleared = this.clearLines();
      if (linesCleared > 0) {
        this.score += linesCleared * 13 * this.pointMultiplier; // Punkte angepasst durch Multiplikator
        this.updateScore();
        this.updateLevel();
        this.soundManager.play('clear'); // Spielen Sie den Soundeffekt für das Löschen
        this.checkWinCondition(); // Überprüfen, ob das Spiel gewonnen wurde
      }
      this.spawnPiece();
      if (this.checkCollision()) {
        this.gameOver();
      }
    }
  }

  checkCollision() {
    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x]) {
          const newX = this.currentPiece.x + x;
          const newY = this.currentPiece.y + y;
          if (newX < 0 || newX >= this.cols || newY >= this.rows) return true;
          if (newY >= 0 && this.grid[newY][newX]) return true;
        }
      }
    }
    return false;
  }

  mergePiece() {
    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x]) {
          const newY = this.currentPiece.y + y;
          if (newY >= 0) {
            this.grid[newY][this.currentPiece.x + x] = 1;
          }
        }
      }
    }
  }

  clearLines() {
    let linesCleared = 0;
    for (let y = this.rows - 1; y >= 0; y--) {
      if (this.grid[y].every(cell => cell)) {
        this.grid.splice(y, 1);
        this.grid.unshift(Array(this.cols).fill(0));
        linesCleared++;
        y++; // Aktuelle Zeile erneut prüfen
      }
    }

    if (linesCleared > 0) {
      this.linesClearedTotal += linesCleared; // Gesamtzahl aktualisieren
      this.updateLinesRemaining();
    }

    return linesCleared;
  }

  updateLinesRemaining() {
    const linesRemaining = Math.max(this.linesToWin - this.linesClearedTotal, 0);
    document.getElementById('lines-remaining').textContent = `Lines to Win: ${linesRemaining}`;
  }

  checkWinCondition() {
    if (this.linesClearedTotal >= this.linesToWin) {
      this.isRunning = false;
      cancelAnimationFrame(this.animationFrame);
      this.triggerCelebration();
    }
  }

  triggerCelebration() {
    this.celebrationManager.show();
    this.soundManager.play('celebration');
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Zeichne das Grid
    this.ctx.strokeStyle = '#ddd';
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.grid[y][x]) {
          this.ctx.fillStyle = '#e74c3c';
          this.ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize - 1, this.blockSize - 1);
        }
        this.ctx.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
      }
    }

    // Zeichne das aktuelle Stück
    this.ctx.fillStyle = '#3498db';
    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x]) {
          this.ctx.fillRect(
              (this.currentPiece.x + x) * this.blockSize,
              (this.currentPiece.y + y) * this.blockSize,
              this.blockSize - 1,
              this.blockSize - 1
          );
        }
      }
    }
  }

  setupControls() {
    document.addEventListener('keydown', (e) => {
      if (!this.isRunning) return;

      switch(e.key) {
        case 'ArrowLeft':
          this.currentPiece.x--;
          if (this.checkCollision()) this.currentPiece.x++;
          else this.soundManager.play('move');
          break;
        case 'ArrowRight':
          this.currentPiece.x++;
          if (this.checkCollision()) this.currentPiece.x--;
          else this.soundManager.play('move');
          break;
        case 'ArrowDown':
          this.moveDown();
          break;
        case 'ArrowUp':
          this.rotatePiece();
          break;
        case ' ':
          this.hardDrop();
          break;
      }
      this.draw();
    });
  }

  rotatePiece() {
    const rotated = [];
    for (let i = 0; i < this.currentPiece.shape[0].length; i++) {
      rotated.push([]);
      for (let j = this.currentPiece.shape.length - 1; j >= 0; j--) {
        rotated[i].push(this.currentPiece.shape[j][i]);
      }
    }
    const oldShape = this.currentPiece.shape;
    this.currentPiece.shape = rotated;
    if (this.checkCollision()) {
      this.currentPiece.shape = oldShape;
    } else {
      this.soundManager.play('rotate');
    }
  }

  hardDrop() {
    while (!this.checkCollision()) {
      this.currentPiece.y++;
    }
    this.currentPiece.y--;
    this.mergePiece();
    const linesCleared = this.clearLines();
    if (linesCleared > 0) {
      this.score += linesCleared * 13 * this.pointMultiplier;
      this.updateScore();
      this.updateLevel();
      this.soundManager.play('clear');
      this.checkWinCondition();
    }
    this.spawnPiece();
    if (this.checkCollision()) {
      this.gameOver();
    }
    this.draw();
  }

  updateScore() {
    document.getElementById('score').textContent = `Score: ${this.score}`;
  }

  updateLevel() {
    const newLevel = Math.floor(this.score / 1000) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      this.speed = Math.max(this.minSpeed, this.speed - this.speedIncrement);
    }
  }

  gameOver() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrame);
    this.soundManager.play('gameOver');
    document.getElementById('game-over').classList.remove('hidden');
  }

  gameLoop(currentTime) {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastTime;

    if (deltaTime >= this.speed) {
      this.moveDown();
      this.draw();
      this.lastTime = currentTime;
    }

    this.animationFrame = requestAnimationFrame((time) => this.gameLoop(time));
  }
}
