import confetti from 'canvas-confetti';

/**
 * Celebrate YES answer with continuous confetti burst
 */
export function celebrateYes() {
  const duration = 3000; // 3 seconds
  const end = Date.now() + duration;

  const colors = ['#ec4899', '#f43f5e', '#be185d', '#ff6b9d'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

/**
 * Single confetti burst
 */
export function confettiBurst() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#ec4899', '#f43f5e', '#be185d', '#ff6b9d'],
  });
}

/**
 * Heart-shaped confetti
 */
export function heartConfetti() {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#ec4899', '#f43f5e', '#be185d'],
  };

  confetti({
    ...defaults,
    particleCount: 50,
    scalar: 2,
  });

  confetti({
    ...defaults,
    particleCount: 25,
    scalar: 3,
  });
}
