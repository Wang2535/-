import React from 'react';

export interface AuroraBackgroundProps {
  theme?: 'green-purple' | 'blue-pink' | 'rainbow';
  intensity?: number; // 0-1
}

const gradientMap: Record<string, string> = {
  'green-purple': 'linear-gradient(135deg, #00ff88 0%, #8b5cf6 50%, #00ff88 100%)',
  'blue-pink': 'linear-gradient(135deg, #3b82f6 0%, #ec4899 50%, #3b82f6 100%)',
  'rainbow': 'linear-gradient(135deg, #ff0000 0%, #ff7f00 15%, #ffff00 30%, #00ff00 45%, #0000ff 60%, #4b0082 75%, #9400d3 100%)',
};

export function AuroraBackground({ theme = 'green-purple', intensity = 1 }: AuroraBackgroundProps) {
  const currentGradient = gradientMap[theme] || gradientMap['green-purple'];
  const opacityValue = intensity * 0.5;

  return (
    <>
      <style>{`
        @keyframes auroraMove {
          0% { transform: translate(0%, 0%); }
          25% { transform: translate(-10%, -5%); }
          50% { transform: translate(5%, -8%); }
          75% { transform: translate(-5%, 5%); }
          100% { transform: translate(0%, 0%); }
        }

        @keyframes auroraHue {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }

        @keyframes auroraBreathe {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>

      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: currentGradient,
          animation: `
            auroraMove 20s ease-in-out infinite,
            auroraHue 30s linear infinite,
            auroraBreathe 8s ease-in-out infinite
          `,
          opacity: opacityValue,
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    </>
  );
}
