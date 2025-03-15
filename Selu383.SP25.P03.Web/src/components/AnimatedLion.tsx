// src/components/AnimatedLion.tsx - Optimized version
import { useState, useEffect, useRef } from "react";
import { Box } from "@mantine/core";

interface AnimatedLionProps {
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

const AnimatedLion = ({
  size = 80,
  primaryColor = "#d4af37",
  secondaryColor = "#8B4513",
}: AnimatedLionProps) => {
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [breathing, setBreathing] = useState(0);
  const [blinking, setBlinking] = useState(false);
  const lionRef = useRef<SVGSVGElement>(null);

  // Combined useEffect for all animations and interactions
  useEffect(() => {
    // Handle mouse movement for eye tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (!lionRef.current) return;

      const lionRect = lionRef.current.getBoundingClientRect();
      const lionCenterX = lionRect.left + lionRect.width / 2;
      const lionCenterY = lionRect.top + lionRect.height / 2;

      const mouseX = e.clientX - lionCenterX;
      const mouseY = e.clientY - lionCenterY;

      const maxMove = 3;
      const normalizedX = Math.max(Math.min(mouseX / 100, 1), -1) * maxMove;
      const normalizedY = Math.max(Math.min(mouseY / 100, 1), -1) * maxMove;

      setEyePosition({ x: normalizedX, y: normalizedY });
    };

    // Breathing animation interval
    const breathingInterval = setInterval(() => {
      setBreathing((prev) => (prev + 0.05) % (2 * Math.PI));
    }, 50);

    // Blinking animation setup
    const randomBlink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);

      // Random time until next blink (between 3-8 seconds)
      const nextBlinkTime = 3000 + Math.random() * 5000;
      setTimeout(randomBlink, nextBlinkTime);
    };

    // Initial delay before first blink
    const initialTimeout = setTimeout(randomBlink, 2000);

    // Event listeners
    document.addEventListener("mousemove", handleMouseMove);

    // Cleanup
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      clearInterval(breathingInterval);
      clearTimeout(initialTimeout);
    };
  }, []);

  // Calculate breathing effect
  const breathScale = 1 + Math.sin(breathing) * 0.01;

  return (
    <Box
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "visible",
      }}
    >
      <svg
        ref={lionRef}
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: `scale(${breathScale})`,
          transition: "transform 0.1s ease-in-out",
        }}
      >
        {/* Main mane */}
        <path
          d="M50 10C28 10 10 28 10 50C10 72 28 90 50 90C72 90 90 72 90 50C90 28 72 10 50 10Z"
          fill={primaryColor}
          stroke={secondaryColor}
          strokeWidth="1.5"
        />

        {/* Mane details - outer */}
        <path
          d="M18 30C12 35 10 45 12 50C15 55 20 55 22 60C25 65 18 70 15 75C25 70 30 65 35 62C30 70 25 80 30 85C40 75 50 70 60 68C65 75 70 85 80 85C85 80 80 70 75 65C80 68 85 70 93 75C90 70 82 65 85 60C88 55 93 55 95 50C98 45 95 35 90 30C85 35 75 38 70 50C72 35 70 25 65 20C60 25 57 35 55 45C53 35 50 25 45 20C40 25 38 35 40 50C35 38 25 35 18 30Z"
          fill={secondaryColor}
          stroke={secondaryColor}
          strokeWidth="0.5"
        />

        {/* Face */}
        <ellipse cx="50" cy="50" rx="22" ry="20" fill="#F5DEB3" />
        <ellipse cx="50" cy="50" rx="18" ry="16" fill="#F8E0AB" />

        {/* Ears */}
        <path
          d="M30 35C25 30 28 25 33 28C35 30 33 35 30 35Z"
          fill="#F8E0AB"
          stroke="#8B4513"
          strokeWidth="0.5"
        />
        <path
          d="M70 35C75 30 72 25 67 28C65 30 67 35 70 35Z"
          fill="#F8E0AB"
          stroke="#8B4513"
          strokeWidth="0.5"
        />

        {/* Nose */}
        <path
          d="M50 55C47 55 44 56 43 58C42 60 45 63 50 63C55 63 58 60 57 58C56 56 53 55 50 55Z"
          fill="#000000"
        />

        {/* Nostrils */}
        <ellipse cx="47" cy="58" rx="1.5" ry="1" fill="#3A3A3A" />
        <ellipse cx="53" cy="58" rx="1.5" ry="1" fill="#3A3A3A" />

        {/* Mouth */}
        <path
          d="M45 63C47 67 53 67 55 63"
          stroke="#000000"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Left eye - white */}
        <ellipse
          cx="42"
          cy="48"
          rx="5"
          ry={blinking ? 0.5 : 4.5}
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="0.5"
        />

        {/* Right eye - white */}
        <ellipse
          cx="58"
          cy="48"
          rx="5"
          ry={blinking ? 0.5 : 4.5}
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="0.5"
        />

        {/* Left eye - pupil */}
        <circle
          cx={42 + eyePosition.x}
          cy={blinking ? 48 : 48 + eyePosition.y}
          r={blinking ? 0 : 2.5}
          fill="#000000"
        />

        {/* Right eye - pupil */}
        <circle
          cx={58 + eyePosition.x}
          cy={blinking ? 48 : 48 + eyePosition.y}
          r={blinking ? 0 : 2.5}
          fill="#000000"
        />

        {/* Left eye - highlight */}
        <circle
          cx={40 + eyePosition.x * 0.5}
          cy={47 + eyePosition.y * 0.5}
          r={blinking ? 0 : 1}
          fill="#FFFFFF"
        />

        {/* Right eye - highlight */}
        <circle
          cx={56 + eyePosition.x * 0.5}
          cy={47 + eyePosition.y * 0.5}
          r={blinking ? 0 : 1}
          fill="#FFFFFF"
        />

        {/* Whiskers */}
        <path
          d="M40 57C33 56 26 55 20 56"
          stroke="#000000"
          strokeWidth="0.5"
          strokeLinecap="round"
        />
        <path
          d="M40 60C34 61 28 63 24 65"
          stroke="#000000"
          strokeWidth="0.5"
          strokeLinecap="round"
        />
        <path
          d="M41 54C36 52 30 50 25 50"
          stroke="#000000"
          strokeWidth="0.5"
          strokeLinecap="round"
        />

        <path
          d="M60 57C67 56 74 55 80 56"
          stroke="#000000"
          strokeWidth="0.5"
          strokeLinecap="round"
        />
        <path
          d="M60 60C66 61 72 63 76 65"
          stroke="#000000"
          strokeWidth="0.5"
          strokeLinecap="round"
        />
        <path
          d="M59 54C64 52 70 50 75 50"
          stroke="#000000"
          strokeWidth="0.5"
          strokeLinecap="round"
        />

        {/* Eyebrows - reacts to mouse movement */}
        <path
          d="M37 ${Math.max(43 + eyePosition.y * 0.3, 41)}C40 ${Math.max(42 + eyePosition.y * 0.3, 40)} 44 ${Math.max(42 + eyePosition.y * 0.3, 40)} 47 ${Math.max(43 + eyePosition.y * 0.3, 41)}"
          stroke={secondaryColor}
          strokeWidth="1"
          strokeLinecap="round"
        />

        <path
          d="M53 ${Math.max(43 + eyePosition.y * 0.3, 41)}C56 ${Math.max(42 + eyePosition.y * 0.3, 40)} 60 ${Math.max(42 + eyePosition.y * 0.3, 40)} 63 ${Math.max(43 + eyePosition.y * 0.3, 41)}"
          stroke={secondaryColor}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  );
};

export default AnimatedLion;
