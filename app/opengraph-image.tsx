import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Jon Gerton - Claude Code Educator & Toolsmith';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #1E293B 0%, #0F766E 100%)',
        color: 'white', fontFamily: 'sans-serif', padding: '60px',
      }}>
        <div style={{ fontSize: 72, fontWeight: 700 }}>Jon Gerton</div>
        <div style={{ fontSize: 32, marginTop: 20, opacity: 0.9 }}>
          Tools you can install. Skills you can build.
        </div>
        <div style={{
          position: 'absolute', bottom: 40, left: 60,
          fontSize: 48, fontFamily: 'monospace', color: '#22C55E', fontWeight: 700,
        }}>
          {'>_'}
        </div>
      </div>
    ),
    { ...size }
  );
}
