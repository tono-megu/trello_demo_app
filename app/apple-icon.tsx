import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', // blue gradient
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '32px',
        }}
      >
        {/* カレンダーアイコンSVG - 大きいサイズ */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="white" strokeWidth="1.5" fill="none"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke="white" strokeWidth="1.5"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke="white" strokeWidth="1.5"/>
          <line x1="3" y1="10" x2="21" y2="10" stroke="white" strokeWidth="1.5"/>
          <rect x="7" y="14" width="2" height="2" fill="white"/>
          <rect x="11" y="14" width="2" height="2" fill="white"/>
          <rect x="15" y="14" width="2" height="2" fill="white"/>
          <rect x="7" y="18" width="2" height="2" fill="white"/>
          <rect x="11" y="18" width="2" height="2" fill="white"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}