export class SoundManager {
  constructor() {
    this.isMuted = false;
    this.sounds = {
      move: new Audio('/src/coin-collect-retro-8-bit-sound-effect-145251.mp3'),
      rotate: new Audio('/src/coin-collect-retro-8-bit-sound-effect-145251.mp3'),
      clear: new Audio('/src/collect-points-190037.mp3'),
      celebration: new Audio('/src/happy-birthday-to-you-bossa-nova-style-arrangement-21399.mp3'),
      gameOver: new Audio('/src/dead-8bit-41400.mp3')
    };

    // Standardlautstärke einstellen
    Object.values(this.sounds).forEach(sound => {
      sound.volume = 0.5;
    });
  }

  play(soundName) {
    if (!this.isMuted && this.sounds[soundName]) {
      this.sounds[soundName].currentTime = 0;
      this.sounds[soundName].play().catch(() => {
        // Ignoriere Autoplay-Fehler
      });
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
  }
}
