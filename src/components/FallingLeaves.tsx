import { useEffect, useRef } from 'react';

export default function FallingLeaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Leaf definition
    interface Leaf {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      rotation: number;
      spinSpeed: number;
      sway: number;
      swaySpeed: number;
      color: string;
      opacity: number;
    }

    const leaves: Leaf[] = [];
    const maxLeaves = 22; // Keep it elegant and clean, not cluttered

    // Soft organic botanical colors
    const colors = [
      'rgba(52, 211, 153, 0.45)',  // Emerald 400
      'rgba(16, 185, 129, 0.35)',  // Emerald 500
      'rgba(5, 150, 105, 0.3)',    // Emerald 600
      'rgba(110, 231, 183, 0.4)',  // Emerald 300
      'rgba(147, 197, 253, 0.15)', // Bluish green blend tint
      'rgba(167, 243, 208, 0.35)', // Sage mint tint
    ];

    function createLeaf(isInitial = false): Leaf {
      return {
        x: Math.random() * width,
        y: isInitial ? Math.random() * height : -20,
        size: Math.random() * 12 + 8, // 8px to 20px
        speedY: Math.random() * 0.8 + 0.5, // Gentle falling speed
        speedX: Math.random() * 0.4 - 0.2,
        rotation: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() * 0.02 - 0.01) * 1.5,
        sway: Math.random() * 100, // sway phase offset
        swaySpeed: Math.random() * 0.02 + 0.01,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.4 + 0.3,
      };
    }

    // Initialize initial leaves list
    for (let i = 0; i < maxLeaves; i++) {
      leaves.push(createLeaf(true));
    }

    // SVG render: draw a beautiful leaf outline
    function drawLeafPath(ctx: CanvasRenderingContext2D, size: number) {
      ctx.beginPath();
      // Draw standard double curved leaf
      ctx.moveTo(0, -size / 2);
      ctx.quadraticCurveTo(size / 2, -size / 4, 0, size / 2);
      ctx.quadraticCurveTo(-size / 2, -size / 4, 0, -size / 2);
      ctx.closePath();
      ctx.fill();

      // Draw subtle stem vein
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(0, size / 2);
      ctx.stroke();
    }

    function render() {
      ctx!.clearRect(0, 0, width, height);

      for (let i = 0; i < leaves.length; i++) {
        const leaf = leaves[i];

        // Update physics
        leaf.y += leaf.speedY;
        leaf.rotation += leaf.spinSpeed;
        leaf.sway += leaf.swaySpeed;
        
        // Horizontal swaying motion mimicking realistic wind resistance
        const windSway = Math.sin(leaf.sway) * 1.2;
        leaf.x += leaf.speedX + windSway;

        // Reset if leaf flies off client bounds
        if (leaf.y > height + 20 || leaf.x < -20 || leaf.x > width + 20) {
          leaves[i] = createLeaf(false);
          continue;
        }

        // Draw leaf
        ctx!.save();
        ctx!.translate(leaf.x, leaf.y);
        ctx!.rotate(leaf.rotation);
        
        // Apply scaling for 3D tumbling rotation feel using sine values
        const scaleX = Math.sin(leaf.sway * 0.5) * 0.6 + 0.7;
        ctx!.scale(scaleX, 1);

        ctx!.fillStyle = leaf.color;
        ctx!.globalAlpha = leaf.opacity;

        drawLeafPath(ctx!, leaf.size);
        ctx!.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 w-full h-full block overflow-hidden"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
