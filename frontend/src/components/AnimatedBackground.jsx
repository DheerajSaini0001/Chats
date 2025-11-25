import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const AnimatedBackground = () => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const particlesRef = useRef([]);
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5; // Smaller, finer particles
                this.baseX = this.x;
                this.baseY = this.y;
                // Physics: Sine wave movement (Liquid feel)
                this.density = (Math.random() * 20) + 1;
                this.angle = Math.random() * 360;
                this.velocity = Math.random() * 0.5 + 0.2;

                // Color: Mix of Cyan and Violet
                const isCyan = Math.random() > 0.5;
                if (theme === 'dark') {
                    this.color = isCyan
                        ? `rgba(6, 182, 212, ${Math.random() * 0.5 + 0.5})`
                        : `rgba(99, 102, 241, ${Math.random() * 0.5 + 0.5})`;
                } else {
                    // Darker colors for light mode
                    this.color = isCyan
                        ? `rgba(8, 145, 178, ${Math.random() * 0.5 + 0.5})`
                        : `rgba(79, 70, 229, ${Math.random() * 0.5 + 0.5})`;
                }
            }

            update(mouse) {
                // 1. Natural Sine Wave Movement (Drifting)
                this.angle += 0.02;
                // Particles float gently up/down and left/right
                this.x += Math.cos(this.angle) * this.velocity;
                this.y += Math.sin(this.angle) * this.velocity;

                // 2. Mouse Interaction (Repulsion Field)
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 150;

                if (distance < maxDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (maxDistance - distance) / maxDistance;
                    const directionX = forceDirectionX * force * this.density;
                    const directionY = forceDirectionY * force * this.density;

                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    // Gentle return to flow if pushed too far
                    if (this.x !== this.baseX) {
                        const dx = this.x - this.baseX;
                        this.x -= dx / 50; // Slow elastic return
                    }
                    if (this.y !== this.baseY) {
                        const dy = this.y - this.baseY;
                        this.y -= dy / 50;
                    }
                }

                // 3. Screen Wrap (If they float off screen, bring them back)
                if (this.x > canvas.width + 20) this.x = -20;
                if (this.x < -20) this.x = canvas.width + 20;
                if (this.y > canvas.height + 20) this.y = -20;
                if (this.y < -20) this.y = canvas.height + 20;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        // Create particles
        const createParticles = () => {
            const particleCount = 200; // More particles for a fluid look
            particlesRef.current = [];
            for (let i = 0; i < particleCount; i++) {
                particlesRef.current.push(new Particle());
            }
        };
        createParticles();

        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Animation loop
        const animate = () => {
            // TRAIL EFFECT: Instead of clearing rect, we draw a semi-transparent square.
            // This creates the "motion blur" / trail effect.
            ctx.fillStyle = theme === 'dark' ? 'rgba(5, 5, 5, 0.1)' : 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Mouse Glow
            const gradient = ctx.createRadialGradient(
                mouseRef.current.x,
                mouseRef.current.y,
                0,
                mouseRef.current.x,
                mouseRef.current.y,
                300
            );

            if (theme === 'dark') {
                gradient.addColorStop(0, 'rgba(6, 182, 212, 0.1)'); // Cyan core
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
            } else {
                gradient.addColorStop(0, 'rgba(6, 182, 212, 0.05)'); // Lighter Cyan core
                gradient.addColorStop(1, 'rgba(255,255,255,0)');
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update particles
            particlesRef.current.forEach(particle => {
                particle.update(mouseRef.current);
                particle.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 bg-white dark:bg-[#050505] transition-colors duration-300"
        />
    );
};

export default AnimatedBackground;