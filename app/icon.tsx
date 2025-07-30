import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#2563eb', // blue-600
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '6px',
        }}
      >
        {/* カレンダーアイコンSVG */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="white" strokeWidth="2" fill="none"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke="white" strokeWidth="2"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke="white" strokeWidth="2"/>
          <line x1="3" y1="10" x2="21" y2="10" stroke="white" strokeWidth="2"/>
          <rect x="7" y="14" width="2" height="2" fill="white"/>
          <rect x="11" y="14" width="2" height="2" fill="white"/>
          <rect x="15" y="14" width="2" height="2" fill="white"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}