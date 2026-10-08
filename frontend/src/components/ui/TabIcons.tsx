/** Small original flat illustrations for the header tabs (All / Homes / Experiences / Services). */

export function GlobeIcon({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <ellipse cx="24" cy="44" rx="11" ry="2.5" fill="#000" opacity=".12" />
      <path d="M17 43h14l-2-4H19z" fill="#8B5A2B" />
      <path d="M24 39v-4" stroke="#8B5A2B" strokeWidth="2.5" />
      <path d="M9 21a15 15 0 0 0 28 7" fill="none" stroke="#B9873F" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="23" cy="20" r="13" fill="#4AA8E0" />
      <path d="M15 12c3 1 4 4 7 3s2 5-1 6-2 5-5 4-4-6-3-8 1-4 2-5zM27 9c3 0 7 3 8 7-2 1-4-1-5 1s1 5-1 7-4 1-4-2 3-4 1-6-1-6 1-7z" fill="#7BC043" />
      <ellipse cx="18" cy="13" rx="4" ry="2" fill="#fff" opacity=".35" transform="rotate(-30 18 13)" />
    </svg>
  );
}

export function HouseIcon({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <ellipse cx="22" cy="44" rx="16" ry="2.5" fill="#000" opacity=".12" />
      <circle cx="38" cy="18" r="6" fill="#5DAA4A" />
      <circle cx="35" cy="13" r="5" fill="#6FBF57" />
      <path d="M37 22v20" stroke="#7A4E2D" strokeWidth="2" />
      <path d="M8 24h26v19H8z" fill="#F2E3C6" />
      <path d="M8 24h26v3H8z" fill="#E0CBA3" />
      <path d="M4 25 21 11l17 14z" fill="#D9534F" />
      <path d="M4 25 21 11l3 2.5L9 25z" fill="#E8716D" />
      <path d="M27 13h4v6l-4-3z" fill="#8A6A55" />
      <rect x="17" y="31" width="7" height="12" rx="1" fill="#9C5B34" />
      <rect x="27" y="29" width="5" height="5" rx="1" fill="#9AD0F0" />
      <rect x="10" y="29" width="5" height="5" rx="1" fill="#9AD0F0" />
    </svg>
  );
}

export function BalloonIcon({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <path d="M24 3c-9 0-15 7-15 15 0 7 6 12 10 17h10c4-5 10-10 10-17 0-8-6-15-15-15z" fill="#E8483B" />
      <path d="M24 3c-4 0-6 7-6 15 0 7 2 12 3 17h6c1-5 3-10 3-17 0-8-2-15-6-15z" fill="#F7A23B" />
      <path d="M24 3c-1.5 0-2 7-2 15 0 7 .7 12 1 17h2c.3-5 1-10 1-17 0-8-.5-15-2-15z" fill="#E8483B" />
      <ellipse cx="17" cy="12" rx="3" ry="5" fill="#fff" opacity=".25" transform="rotate(20 17 12)" />
      <path d="M19 35l1.5 5M29 35l-1.5 5" stroke="#6B4A2E" strokeWidth="1.2" />
      <rect x="19.5" y="40" width="9" height="5" rx="1.5" fill="#A0663A" />
    </svg>
  );
}

export function BellIcon({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <ellipse cx="24" cy="42" rx="18" ry="3" fill="#000" opacity=".12" />
      <rect x="21.5" y="8" width="5" height="4" rx="1.5" fill="#4A4F57" />
      <path d="M8 36c0-11 7-23 16-23s16 12 16 23z" fill="#7D8590" />
      <path d="M8 36c0-11 7-23 16-23-6 3-10 12-10 23z" fill="#A9B0BA" />
      <ellipse cx="17" cy="22" rx="2.5" ry="5" fill="#fff" opacity=".45" transform="rotate(25 17 22)" />
      <rect x="4" y="35" width="40" height="5" rx="2.5" fill="#2F3338" />
    </svg>
  );
}
