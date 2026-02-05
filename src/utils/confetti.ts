import confetti from 'canvas-confetti';

/**
 * Trigger a celebration confetti animation
 * Perfect for when someone says YES! 💕
 */
export function celebrateYes() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: ReturnType<typeof setInterval> = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Fire confetti from two sides
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#ec4899', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#ec4899', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3'],
    });
  }, 250);
}

/**
 * Trigger a single burst of confetti
 * Used for immediate celebration
 */
export function confettiBurst() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#ec4899', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ff0000', '#ff69b4'],
  });
}

/**
 * Trigger heart-shaped confetti
 * Perfect for Valentine's theme
 */
export function heartConfetti() {
  const scalar = 2;
  const heart = confetti.shapeFromPath({
    path: 'M167,72.8c2.9-17.9-6.8-36.9-24.2-42.8c-16.6-5.6-35.4,1.4-44.8,16.8c-9.4-15.4-28.2-22.4-44.8-16.8c-17.4,5.9-27.1,24.9-24.2,42.8c5.3,32.6,68.9,66.9,68.9,66.9S232.7,105.4,167,72.8z',
  });

  const defaults = {
    spread: 360,
    ticks: 60,
    gravity: 0,
    decay: 0.96,
    startVelocity: 20,
    shapes: [heart],
    scalar,
    colors: ['#ec4899', '#f43f5e', '#fb7185'],
  };

  function shoot() {
    confetti({
      ...defaults,
      particleCount: 30,
    });

    confetti({
      ...defaults,
      particleCount: 5,
      flat: true,
    });

    confetti({
      ...defaults,
      particleCount: 15,
      scalar: scalar / 2,
      shapes: ['circle'],
    });
  }

  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
}
