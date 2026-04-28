/**
 * FooterBlock — Renderer (Server Component, read-only)
 *
 * Logo usa next/image cuando logoImageUrl está definido.
 * Todos los hrefs pasan por sanitizeUrl().
 * La sección newsletter se delega a FooterNewsletter ('use client').
 */
import Image from 'next/image'
import { sanitizeUrl } from '../../../lib/sanitize-url'
import { FooterNewsletter } from './FooterNewsletter'

export type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'tiktok' | 'linkedin'

export interface FooterBlockProps {
  logoText: string
  logoSubtext: string
  logoImageUrl: string
  tagline: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  socialLinks: Array<{ platform: SocialPlatform; url: string }>
  columns: Array<{ heading: string; links: Array<{ label: string; url: string }> }>
  copyright: string
  legalLinks: Array<{ label: string; url: string }>
  backgroundColor: string
  textColor: string
  accentColor: string
  showNewsletter: boolean
  newsletterTitle: string
  newsletterSubtitle: string
  newsletterPlaceholder: string
  newsletterButtonText: string
  newsletterBackgroundColor: string
  // inyectado desde BlockRenderer
  siteId?: string
}

const socialIconMap: Record<SocialPlatform, string> = {
  instagram: 'IG',
  facebook: 'FB',
  twitter: 'TW',
  youtube: 'YT',
  tiktok: 'TK',
  linkedin: 'LI',
}

export function FooterBlock({
  logoText,
  logoSubtext,
  logoImageUrl,
  tagline,
  contactEmail,
  contactPhone,
  contactAddress,
  socialLinks,
  columns,
  copyright,
  legalLinks,
  backgroundColor,
  textColor,
  accentColor,
  showNewsletter,
  newsletterTitle,
  newsletterSubtitle,
  newsletterPlaceholder,
  newsletterButtonText,
  newsletterBackgroundColor,
  siteId,
}: FooterBlockProps) {
  const mutedColor = `${textColor}99`

  return (
    <footer style={{ backgroundColor, color: textColor, fontFamily: 'inherit' }}>
      {/* Newsletter band — cliente interactivo */}
      {showNewsletter && (
        <FooterNewsletter
          title={newsletterTitle}
          subtitle={newsletterSubtitle}
          placeholder={newsletterPlaceholder}
          buttonText={newsletterButtonText}
          textColor={textColor}
          accentColor={accentColor}
          newsletterBackgroundColor={newsletterBackgroundColor}
          siteId={siteId}
        />
      )}

      {/* Main footer grid */}
      <div style={{ padding: '56px 24px 40px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(160px, 1fr))`,
          gap: '32px 24px',
        }}>
          {/* Brand column */}
          <div>
            {logoImageUrl ? (
              <div style={{ position: 'relative', height: 40, width: 120, marginBottom: 8 }}>
                <Image
                  src={logoImageUrl}
                  alt={logoText}
                  fill
                  sizes="120px"
                  style={{ objectFit: 'contain', objectPosition: 'left' }}
                />
              </div>
            ) : (
              <div style={{ marginBottom: logoSubtext ? 4 : 12 }}>
                <span style={{ color: accentColor, fontWeight: 800, fontSize: '1.3rem' }}>
                  {logoText}
                </span>
              </div>
            )}
            {logoSubtext && (
              <p style={{ color: mutedColor, fontSize: '0.8rem', margin: '0 0 12px' }}>
                {logoSubtext}
              </p>
            )}
            {tagline && (
              <p style={{ color: mutedColor, fontSize: '0.875rem', lineHeight: 1.6, margin: '0 0 20px', maxWidth: 220 }}>
                {tagline}
              </p>
            )}
            {/* Contact info */}
            {contactEmail && (
              <p style={{ color: mutedColor, fontSize: '0.8rem', margin: '0 0 4px' }}>
                {contactEmail}
              </p>
            )}
            {contactPhone && (
              <p style={{ color: mutedColor, fontSize: '0.8rem', margin: '0 0 4px' }}>
                {contactPhone}
              </p>
            )}
            {contactAddress && (
              <p style={{ color: mutedColor, fontSize: '0.8rem', margin: '0 0 16px' }}>
                {contactAddress}
              </p>
            )}
            {/* Social links */}
            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {socialLinks.map((link, i) => (
                  <a
                    key={i}
                    href={sanitizeUrl(link.url)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      backgroundColor: `${accentColor}33`,
                      color: accentColor,
                      fontWeight: 700,
                      fontSize: '0.65rem',
                      textDecoration: 'none',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {socialIconMap[link.platform]}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Nav columns */}
          {columns.map((col, ci) => (
            <div key={ci}>
              <h4 style={{
                color: accentColor,
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}>
                {col.heading}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {col.links.map((link, li) => (
                  <li key={li} style={{ marginBottom: 10 }}>
                    <a href={sanitizeUrl(link.url)} style={{
                      color: mutedColor,
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                    }}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px' }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}>
          <p style={{ color: mutedColor, fontSize: '0.8rem', margin: 0 }}>
            {copyright}
          </p>
          {legalLinks.length > 0 && (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {legalLinks.map((link, i) => (
                <a key={i} href={sanitizeUrl(link.url)} style={{ color: mutedColor, fontSize: '0.8rem', textDecoration: 'none' }}>
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
