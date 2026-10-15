/* =========================================================
   ROMANTIC BIRTHDAY SURPRISE - JAVASCRIPT ENGINE
   Includes:
   1. Interactive 3-Step Navigation
   2. Candle Blowout Animation & Sound Effects
   3. Lightweight Built-in Confetti & Floating Rose Petals
   4. Procedural Romantic Music Box (Web Audio API - No CORS/Network issues)
   5. Interactive Heart Bursts on the Moving Rose
   ========================================================= */

(() => {
  'use strict';

  // --- DOM Elements ---
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');

  const toStep2Btn = document.getElementById('toStep2Btn');
  const birthdayCake = document.getElementById('birthdayCake');
  const cakeSubHint = document.getElementById('cakeSubHint');
  const sendLoveBtn = document.getElementById('sendLoveBtn');
  const replayBtn = document.getElementById('replayBtn');
  const roseStage = document.getElementById('roseStage');

  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicStatusText = document.getElementById('musicStatusText');
  const ambientCanvas = document.getElementById('ambientCanvas');

  // --- Application State ---
  let currentStep = 1;
  let isBlownOut = false;
  let isMusicPlaying = false;
  let audioCtx = null;
  let musicIntervalId = null;

  // =========================================================
  // 1. STEP NAVIGATION
  // =========================================================
  function goToStep(stepNum) {
    currentStep = stepNum;

    // Reset classes
    [step1, step2, step3].forEach((el, index) => {
      if (index + 1 === stepNum) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Step 3 triggers
    if (stepNum === 3) {
      triggerBigCelebrationConfetti();
      playChimeSound();
    }
  }

  // Step 1 -> Step 2
  toStep2Btn.addEventListener('click', () => {
    initAudioEngine();
    if (!isMusicPlaying) {
      startMusicBox();
    }
    goToStep(2);
  });

  // Replay
  replayBtn.addEventListener('click', () => {
    // Reset cake state
    isBlownOut = false;
    birthdayCake.classList.remove('blown-out');
    cakeSubHint.textContent = 'Хүслээ дотроо нандигнан шивнээрэй 💫';
    goToStep(1);
  });

  // =========================================================
  // 2. CANDLE BLOWOUT INTERACTION (STEP 2)
  // =========================================================
  birthdayCake.addEventListener('click', () => {
    if (isBlownOut) return;
    isBlownOut = true;

    // Trigger blowout visual effect
    birthdayCake.classList.add('blown-out');

    // Synthesize blow sound (whoosh)
    playBlowSound();

    // Text feedback
    cakeSubHint.textContent = 'Хүсэл чинь заавал биелэх болтугай! 🌟✨';
    cakeSubHint.style.color = '#fde047';
    cakeSubHint.style.fontWeight = '700';

    // Confetti burst from cake
    const rect = birthdayCake.getBoundingClientRect();
    const originX = (rect.left + rect.width / 2) / window.innerWidth;
    const originY = (rect.top + rect.height / 3) / window.innerHeight;
    fireMiniConfetti(originX, originY);

    // Transition to Step 3 after blowout smoke
    setTimeout(() => {
      goToStep(3);
    }, 1500);
  });

  // Support keyboard accessibility
  birthdayCake.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      birthdayCake.click();
    }
  });

  // =========================================================
  // 3. MOVING ROSE & LOVE BURST INTERACTION (STEP 3)
  // =========================================================
  function spawnHeartBurst(x, y) {
    const emojis = ['💖', '🌹', '✨', '💕', '🥰', '🌸', '❤️'];
    const count = 9;

    for (let i = 0; i < count; i++) {
      const heart = document.createElement('div');
      heart.className = 'burst-heart';
      heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const dist = 40 + Math.random() * 80;
      const dx = Math.cos(angle) * dist + 'px';
      const rot = (Math.random() * 80 - 40) + 'deg';

      heart.style.setProperty('--dx', dx);
      heart.style.setProperty('--rot', rot);
      heart.style.left = `${x}px`;
      heart.style.top = `${y}px`;

      document.body.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 1200);
    }

    playSparkleNote();
  }

  roseStage.addEventListener('click', (e) => {
    const rect = roseStage.getBoundingClientRect();
    const x = e.clientX || (rect.left + rect.width / 2);
    const y = e.clientY || (rect.top + rect.height / 2);
    spawnHeartBurst(x, y);
  });

  sendLoveBtn.addEventListener('click', (e) => {
    const rect = sendLoveBtn.getBoundingClientRect();
    spawnHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    fireMiniConfetti(0.5, 0.7);
  });

  // =========================================================
  // 4. BUILT-IN LIGHTWEIGHT CONFETTI ENGINE
  // =========================================================
  const confettiParticles = [];

  class ConfettiParticle {
    constructor(x, y, vx, vy, color, size, rotation, vRot) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = color;
      this.size = size;
      this.rotation = rotation;
      this.vRot = vRot;
      this.life = 1;
      this.decay = Math.random() * 0.015 + 0.008;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.16; // gravity
      this.vx *= 0.985;
      this.rotation += this.vRot;
      this.life -= this.decay;
    }

    draw(ctx) {
      if (this.life <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(1, Math.cos(this.rotation * 2));
      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.65);
      ctx.restore();
    }
  }

  function fireMiniConfetti(ratioX, ratioY) {
    const count = 55;
    const colors = ['#f43f5e', '#fb7185', '#fde047', '#fda4af', '#ffffff', '#38bdf8', '#c084fc'];
    const originX = ratioX * window.innerWidth;
    const originY = ratioY * window.innerHeight;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 11 + 3;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 9 + 6;
      confettiParticles.push(new ConfettiParticle(
        originX, originY, vx, vy, color, size, Math.random() * Math.PI, (Math.random() - 0.5) * 0.2
      ));
    }
  }

  function triggerBigCelebrationConfetti() {
    let shots = 0;
    const interval = setInterval(() => {
      fireMiniConfetti(0.25 + Math.random() * 0.5, 0.4 + Math.random() * 0.3);
      shots++;
      if (shots >= 4) clearInterval(interval);
    }, 350);
  }

  // =========================================================
  // 5. AMBIENT FALLING PETALS CANVAS
  // =========================================================
  const petals = [];
  const petalCtx = ambientCanvas.getContext('2d');

  function resizeCanvas() {
    ambientCanvas.width = window.innerWidth;
    ambientCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class RosePetal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * ambientCanvas.width;
      this.y = initial ? Math.random() * ambientCanvas.height : -20;
      this.size = Math.random() * 10 + 9;
      this.speedY = Math.random() * 1.2 + 0.8;
      this.speedX = Math.random() * 0.8 - 0.4;
      this.angle = Math.random() * Math.PI * 2;
      this.angleSpeed = (Math.random() - 0.5) * 0.025;
      this.opacity = Math.random() * 0.45 + 0.25;
      this.swayPeriod = Math.random() * 0.03 + 0.01;
      this.time = Math.random() * 100;
      this.color = ['#ff758c', '#fb7185', '#f43f5e', '#fda4af'][Math.floor(Math.random() * 4)];
    }

    update() {
      this.time += this.swayPeriod;
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.time) * 0.7;
      this.angle += this.angleSpeed;

      if (this.y > ambientCanvas.height + 30) {
        this.reset();
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;

      // Draw curved rose petal shape
      ctx.beginPath();
      ctx.moveTo(0, -this.size / 2);
      ctx.bezierCurveTo(this.size * 0.7, -this.size * 0.6, this.size * 0.8, this.size * 0.5, 0, this.size * 0.7);
      ctx.bezierCurveTo(-this.size * 0.8, this.size * 0.5, -this.size * 0.7, -this.size * 0.6, 0, -this.size / 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // Initialize petals
  const totalPetals = window.innerWidth < 600 ? 20 : 38;
  for (let i = 0; i < totalPetals; i++) {
    petals.push(new RosePetal());
  }

  // Master Canvas Animation Loop
  function animateCanvas() {
    petalCtx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);

    // Draw & update petals
    for (let i = 0; i < petals.length; i++) {
      petals[i].update();
      petals[i].draw(petalCtx);
    }

    // Draw & update confetti particles
    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.update();
      p.draw(petalCtx);
      if (p.life <= 0 || p.y > ambientCanvas.height + 50) {
        confettiParticles.splice(i, 1);
      }
    }

    requestAnimationFrame(animateCanvas);
  }
  requestAnimationFrame(animateCanvas);

  // =========================================================
  // 6. PROCEDURAL ROMANTIC MUSIC BOX & SOUND SYNTHESIS
  // (Web Audio API - 100% reliable, zero network dependency)
  // =========================================================
  function initAudioEngine() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Soft romantic music box note
  function playMusicBoxNote(freq, time, duration = 1.2) {
    if (!audioCtx || !isMusicPlaying) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Sine tone with subtle bell harmonic
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    // Warm envelope
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.09, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  // Romantic Melody: Sweet Music Box Arpeggio Loop
  // D4, F#4, A4, B4, C#5, D5, E5
  const melodyNotes = [
    587.33, 659.25, 739.99, 880.00, // D5, E5, F#5, A5
    739.99, 659.25, 587.33, 440.00, // F#5, E5, D5, A4
    493.88, 587.33, 739.99, 659.25, // B4, D5, F#5, E5
    587.33, 440.00, 493.88, 369.99  // D5, A4, B4, F#4
  ];

  let noteIndex = 0;
  function startMusicBox() {
    initAudioEngine();
    isMusicPlaying = true;
    updateMusicBtnUI();

    if (musicIntervalId) clearInterval(musicIntervalId);

    musicIntervalId = setInterval(() => {
      if (!isMusicPlaying || !audioCtx) return;
      const now = audioCtx.currentTime;
      const freq = melodyNotes[noteIndex % melodyNotes.length];
      playMusicBoxNote(freq, now, 1.4);

      // Bass note every 4 steps
      if (noteIndex % 4 === 0) {
        playMusicBoxNote(freq / 2, now + 0.05, 1.8);
      }

      noteIndex++;
    }, 420);
  }

  function stopMusicBox() {
    isMusicPlaying = false;
    updateMusicBtnUI();
    if (musicIntervalId) {
      clearInterval(musicIntervalId);
      musicIntervalId = null;
    }
  }

  function updateMusicBtnUI() {
    if (isMusicPlaying) {
      musicStatusText.textContent = 'Хөгжим: Асаалттай';
      musicToggleBtn.classList.remove('muted');
    } else {
      musicStatusText.textContent = 'Хөгжим: Хаалттай';
      musicToggleBtn.classList.add('muted');
    }
  }

  musicToggleBtn.addEventListener('click', () => {
    initAudioEngine();
    if (isMusicPlaying) {
      stopMusicBox();
    } else {
      startMusicBox();
    }
  });

  // Sound FX: Candle Blowout (Gentle airy puff sound)
  function playBlowSound() {
    if (!audioCtx) return;
    try {
      const bufferSize = audioCtx.sampleRate * 0.4;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.4);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noise.start();
    } catch (e) {
      console.log('Audio FX error:', e);
    }
  }

  // Sound FX: Celebration Chime
  function playChimeSound() {
    if (!audioCtx) return;
    try {
      const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      const now = audioCtx.currentTime;
      freqs.forEach((f, idx) => {
        playMusicBoxNote(f, now + idx * 0.1, 1.8);
      });
    } catch (e) {
      console.log('Chime sound error:', e);
    }
  }

  // Sound FX: Gentle harp sparkle note on heart tap
  function playSparkleNote() {
    if (!audioCtx) return;
    try {
      const sparkles = [880.00, 987.77, 1046.50, 1174.66, 1318.51, 1567.98];
      const randFreq = sparkles[Math.floor(Math.random() * sparkles.length)];
      playMusicBoxNote(randFreq, audioCtx.currentTime, 0.8);
    } catch (e) {}
  }

})();
