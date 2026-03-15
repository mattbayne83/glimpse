import { useEffect, useRef } from 'react';

interface MatrixBackgroundProps {
  className?: string;
  color?: string; // Hex color for the characters
  backgroundColor?: string; // Background color
  fontSize?: number;
  speed?: number; // Lower = faster
}

export function MatrixBackground({
  className = '',
  color = '#00FF41', // Classic Matrix green
  backgroundColor = '#0D1117',
  fontSize = 14,
  speed = 33,
}: MatrixBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters - mix of numbers, symbols, and some letters
    const chars = '0123456789ABCDEFΣΠΛΩΨΔΘΦΓ¢€£¥₿∑∏∫∂∆+-=<>[]{}|/\\';
    const charArray = chars.split('');

    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    // Animation function
    const draw = () => {
      // Very subtle fade effect - creates a soft, long trailing effect
      ctx.fillStyle = backgroundColor + 'E6'; // High alpha for gentle fade
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text properties with very low opacity
      ctx.font = `${fontSize}px monospace`;

      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = charArray[Math.floor(Math.random() * charArray.length)];

        // Subtle but visible opacity - between 0.08 and 0.18
        const opacity = (Math.random() * 0.10 + 0.08).toFixed(2);
        ctx.fillStyle = color + Math.floor(parseFloat(opacity) * 255).toString(16).padStart(2, '0');

        // Draw the character
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        // Reset drop to top randomly after it crosses the screen
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Increment Y coordinate
        drops[i]++;
      }
    };

    // Animation loop
    const interval = setInterval(draw, speed);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [color, backgroundColor, fontSize, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
