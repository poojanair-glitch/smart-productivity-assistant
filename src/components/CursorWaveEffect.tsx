'use client';

import React, { useState, useEffect } from 'react';

export default function CursorWaveEffect() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [waves, setWaves] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [lastPos, setLastPos] = useState({ x: -100, y: -100 });
  const [isCursorHovered, setIsCursorHovered] = useState(false);
  const [isCursorHidden, setIsCursorHidden] = useState(true);

  useEffect(() => {
    // Add custom-cursor-active class to body to hide native cursor on desktop
    document.body.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (isCursorHidden) setIsCursorHidden(false);
      
      // Calculate movement distance to spawn waves
      setLastPos((prev) => {
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 25) { // Spawn waves slightly more frequently for a richer trail
          const newWave = { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY };
          setWaves((prevWaves) => [...prevWaves.slice(-12), newWave]); // keep last 12 waves
          return { x: e.clientX, y: e.clientY };
        }
        return prev;
      });
    };

    const handleMouseLeave = () => setIsCursorHidden(true);
    const handleMouseEnter = () => setIsCursorHidden(false);
    const handleHoverStart = () => setIsCursorHovered(true);
    const handleHoverEnd = () => setIsCursorHovered(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    const updateHoverListeners = () => {
      const clickables = document.querySelectorAll('a, button, input, textarea, [role="button"], select, .clickable');
      clickables.forEach(el => {
        el.addEventListener('mouseenter', handleHoverStart);
        el.addEventListener('mouseleave', handleHoverEnd);
      });
    };

    updateHoverListeners();
    const observer = new MutationObserver(updateHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      observer.disconnect();
      document.body.classList.remove('custom-cursor-active');
    };
  }, [isCursorHidden]);

  if (isCursorHidden) return null;

  return (
    <>
      {/* Dynamic Cursor-Following Spotlight Glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-55 dark:opacity-35 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.08), transparent 80%)`
        }}
      />

      {/* Wave ripples where cursor passes */}
      {waves.map((wave) => (
        <div 
          key={wave.id} 
          className="ripple-wave-element hidden md:block"
          style={{
            left: `${wave.x}px`,
            top: `${wave.y}px`
          }}
        />
      ))}

      {/* Custom Cursor follower */}
      <div 
        className="cursor-dot hidden md:block"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          width: isCursorHovered ? '10px' : '6px',
          height: isCursorHovered ? '10px' : '6px',
          backgroundColor: '#8B5CF6',
          boxShadow: '0 0 10px #8B5CF6'
        }}
      />
      <div 
        className="cursor-ring hidden md:block"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          width: isCursorHovered ? '48px' : '32px',
          height: isCursorHovered ? '48px' : '32px',
          borderColor: '#8B5CF6',
          backgroundColor: isCursorHovered ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.04)',
        }}
      />
    </>
  );
}
