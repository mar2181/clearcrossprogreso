import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'ClearCross Progreso';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(to bottom, #001a4d 0%, #003366 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Main title */}
        <div
          style={{
            fontSize: '80px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '20px',
            letterSpacing: '-2px',
          }}
        >
          ClearCross Progreso
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '40px',
            color: '#a0d8ff',
            textAlign: 'center',
            marginBottom: '30px',
            fontWeight: '500',
          }}
        >
          Compare Dental Prices
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '32px',
            color: '#e0e0e0',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: '1.4',
          }}
        >
          Find and compare verified providers in Nuevo Progreso, Mexico
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            width: '200px',
            height: '4px',
            background: 'linear-gradient(to right, #3ab54a, #a0d8ff)',
            borderRadius: '2px',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
