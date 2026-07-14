import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'mtverse - Next.js Dashboard Templates and Free HTML Templates'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#fafafa', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 800 }}>m</div>
          <span style={{ fontSize: '36px', fontWeight: 700 }}>mtverse</span>
        </div>
        <h1 style={{ fontSize: '54px', fontWeight: 800, textAlign: 'center', maxWidth: '980px', lineHeight: 1.1, margin: 0 }}>
          Next.js Dashboard Templates &amp; Free HTML Websites
        </h1>
        <p style={{ fontSize: '24px', color: '#a3a3a3', marginTop: '20px', textAlign: 'center' }}>
          Live previews | Source packages | Secure downloads
        </p>
      </div>
    ),
    { ...size },
  )
}