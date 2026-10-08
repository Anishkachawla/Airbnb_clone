/** Hand-drawn line icon set (24×24, stroke = currentColor) in the spirit of Airbnb's thin outline icons. */
import type { SVGProps } from "react";

const P = {
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  user: <><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" /></>,
  heart: <path d="M12 20.3S3.5 15.4 3.5 9.3A4.6 4.6 0 0 1 12 6.8a4.6 4.6 0 0 1 8.5 2.5c0 6.1-8.5 11-8.5 11z" />,
  share: <><path d="M12 15V3.5M7.5 8 12 3.5 16.5 8" /><path d="M5 12v7.5h14V12" /></>,
  star: <path d="m12 3.2 2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.5l6-.7z" />,
  "chevron-left": <path d="M15 4.5 7.5 12l7.5 7.5" />,
  "chevron-right": <path d="M9 4.5 16.5 12 9 19.5" />,
  "chevron-down": <path d="M4.5 9 12 16.5 19.5 9" />,
  close: <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />,
  filters: <><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></>,
  map: <><path d="M3.5 6.5 9 4l6 2.5 5.5-2.5v13.5L15 20l-6-2.5-5.5 2.5z" /><path d="M9 4v13.5M15 6.5V20" /></>,
  list: <path d="M8 6.5h12M8 12h12M8 17.5h12M4 6.5h.01M4 12h.01M4 17.5h.01" />,
  minus: <path d="M6 12h12" />,
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  grid: <><circle cx="6" cy="6" r="1.4" /><circle cx="12" cy="6" r="1.4" /><circle cx="18" cy="6" r="1.4" /><circle cx="6" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="18" cy="12" r="1.4" /><circle cx="6" cy="18" r="1.4" /><circle cx="12" cy="18" r="1.4" /><circle cx="18" cy="18" r="1.4" /></>,
  home: <><path d="M3.5 11 12 4l8.5 7" /><path d="M5.5 9.5V20h13V9.5" /><path d="M10 20v-5.5h4V20" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  message: <path d="M4 5h16v11H9l-5 4z" />,
  trash: <><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" /><path d="M10.5 11v5.5M13.5 11v5.5" /></>,
  edit: <><path d="m4 20 1-4.5L16 4.5 19.5 8 8.5 19z" /><path d="M13.5 7 17 10.5" /></>,
  check: <path d="m4.5 12.5 4.5 4.5 10.5-10.5" />,
  door: <><path d="M6 20.5V3.5h12v17" /><path d="M3.5 20.5h17" /><circle cx="14.5" cy="12" r=".9" /></>,
  medal: <><circle cx="12" cy="9" r="5.5" /><path d="m9 13.8-1.5 6.7L12 18l4.5 2.5-1.5-6.7" /></>,
  flag: <path d="M5 21V4m0 0h11l-2 4 2 4H5" />,
  upload: <><path d="M12 15.5V4M7.5 8.5 12 4l4.5 4.5" /><path d="M4.5 15v4.5h15V15" /></>,
  image: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.8" /><path d="m4 18 5-5 4 4 2.5-2.5L20 19" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></>,
  moon: <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" />,
  pin: <><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></>,
  sparkle: <path d="M12 3c.6 4.4 2.3 6.1 6.5 6.7-4.2.6-5.9 2.3-6.5 6.6-.6-4.3-2.3-6-6.5-6.6C9.7 9.1 11.4 7.4 12 3zM18 15.5c.3 1.9 1 2.7 2.8 3-1.8.3-2.5 1-2.8 3-.3-2-1-2.7-2.8-3 1.8-.3 2.5-1.1 2.8-3z" />,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 8.5-8.5M16 7l2.5 2.5M14 9l2 2" /></>,
  shield: <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z" />,
  logout: <><path d="M14 4.5H5v15h9" /><path d="M10 12h10.5M17 8.5l3.5 3.5-3.5 3.5" /></>,
  question: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7v.5M12 17h.01" /></>,
  arrows: <path d="M7 4v16M7 4 4 7M7 4l3 3M17 20V4m0 16-3-3m3 3 3-3" />,
  // amenities
  wifi: <><path d="M2.5 9.5a14 14 0 0 1 19 0M5.5 12.8a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0" /><circle cx="12" cy="19" r=".8" /></>,
  kitchen: <><path d="M5 3.5v7a2 2 0 0 0 4 0v-7M7 3.5V21" /><path d="M17 21V3.5c-2 0-3.5 2.5-3.5 6S15 13 17 13" /></>,
  parking: <><rect x="4" y="4" width="16" height="16" rx="2.5" /><path d="M10 16.5v-9h3a2.5 2.5 0 0 1 0 5h-3" /></>,
  pool: <><path d="M3 17c2 0 2-1.3 4-1.3s2 1.3 4 1.3 2-1.3 4-1.3 2 1.3 4 1.3M3 20.5c2 0 2-1.3 4-1.3s2 1.3 4 1.3 2-1.3 4-1.3 2 1.3 4 1.3" /><path d="M8.5 14V5.5a2 2 0 0 1 4 0M15.5 14V5.5M8.5 9h7" /></>,
  hottub: <><path d="M3.5 12.5h17v4a3.5 3.5 0 0 1-3.5 3.5H7a3.5 3.5 0 0 1-3.5-3.5z" /><path d="M8 9.5c-1-1.2 1-2.3 0-3.5s1-2.3 0-3.5M12 9.5c-1-1.2 1-2.3 0-3.5s1-2.3 0-3.5M16 9.5c-1-1.2 1-2.3 0-3.5s1-2.3 0-3.5" /></>,
  ac: <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5" />,
  heating: <><path d="M12 21a5 5 0 0 1-5-5c0-3.5 3-5 3-8.5 2 1 3 3 3 4.5 1-1 1.5-2 1.5-3.5 1.5 1.5 2.5 4.5 2.5 7.5a5 5 0 0 1-5 5z" /></>,
  washer: <><rect x="4.5" y="3" width="15" height="18" rx="2" /><circle cx="12" cy="13" r="4.5" /><path d="M7.5 6h.01M10 6h.01" /></>,
  workspace: <><rect x="3.5" y="4.5" width="17" height="11" rx="1.5" /><path d="M8.5 20h7M12 15.5V20" /></>,
  tv: <><rect x="2.5" y="5.5" width="19" height="12.5" rx="1.5" /><path d="M8 21h8M8.5 2.5 12 5.5l3.5-3" /></>,
  beach: <><path d="M4 12a8 8 0 0 1 16 0z" /><path d="M12 12v9M3 21h18" /></>,
  fireplace: <><path d="M3.5 4h17v16.5h-17z" /><path d="M7 20.5v-9.5h10v9.5" /><path d="M12 19a2 2 0 0 1-2-2c0-1.5 2-2.5 2-4 1 1 2 2.2 2 4a2 2 0 0 1-2 2z" /></>,
  pets: <><circle cx="6" cy="10" r="1.8" /><circle cx="9.5" cy="5.8" r="1.8" /><circle cx="14.5" cy="5.8" r="1.8" /><circle cx="18" cy="10" r="1.8" /><path d="M12 12c-3 0-5.5 4-5.5 6s1.8 2.5 3 2c1.3-.5 3.7-.5 5 0 1.2.5 3-.1 3-2s-2.5-6-5.5-6z" /></>,
  gym: <path d="M3 12h18M6 8v8M3.5 9.5v5M18 8v8M20.5 9.5v5" />,
  bbq: <><path d="M4 9.5h16a8 8 0 0 1-16 0z" /><path d="M8 16.5 6 21.5M16 16.5l2 5M12 17.5v4M9 6.5c-.6-.8.6-1.6 0-2.5M12 6.5c-.6-.8.6-1.6 0-2.5M15 6.5c-.6-.8.6-1.6 0-2.5" /></>,
  mountain: <><path d="m2.5 20 7-12 4 6.5 2.5-4 5.5 9.5z" /><path d="m7.5 11.5 2 1 2-1.5" /></>,
  lake: <><path d="M3 14c2 0 2-1.3 4.5-1.3S9.5 14 12 14s2-1.3 4.5-1.3S18.5 14 21 14M3 18c2 0 2-1.3 4.5-1.3S9.5 18 12 18s2-1.3 4.5-1.3S18.5 18 21 18" /><path d="m7 10 5-6 5 6" /></>,
  ev: <><rect x="4" y="3.5" width="10" height="17" rx="1.5" /><path d="m9.5 7-2 4h3l-2 4M14 9h2.5a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 0 3 0V8l-2-2" /></>,
  alarm: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3.5" /><path d="M12 6h.01" /></>,
  // categories
  "cat-beach": <><path d="M3 20.5c2 0 2-1.2 4.5-1.2S9.5 20.5 12 20.5s2-1.2 4.5-1.2 2 1.2 4.5 1.2" /><path d="M5.5 10a7 7 0 0 1 13 0z" /><path d="M12 10l-2.5 9" /></>,
  "cat-cabin": <><path d="M2.5 12 12 4l9.5 8" /><path d="M5 10v10h14V10" /><path d="M5 13.5h14M5 17h14" /><path d="M10 20v-4.5h4V20" /></>,
  "cat-pool": <><path d="M3 15c2 0 2-1.3 4.5-1.3S9.5 15 12 15s2-1.3 4.5-1.3S18.5 15 21 15M3 19c2 0 2-1.3 4.5-1.3S9.5 19 12 19s2-1.3 4.5-1.3S18.5 19 21 19" /><path d="M7 12V5.5a2 2 0 0 1 4 0M14 12V4.5a2 2 0 0 1 4 0M7 8.5h7" /></>,
  "cat-city": <><path d="M4 21V9l5-3v15M9 21V3.5l7 3V21M16 10.5l4 2V21M2.5 21h19" /><path d="M11.5 8h2M11.5 11.5h2M11.5 15h2" /></>,
  "cat-countryside": <><path d="M2.5 20.5h19" /><path d="M4 20.5v-8L9 8l5 4.5v8" /><path d="M7.5 20.5v-4h3v4" /><circle cx="17.5" cy="10" r="3" /><path d="M17.5 13v7.5" /></>,
  "cat-lake": <><path d="M3 18c2 0 2-1.3 4.5-1.3S9.5 18 12 18s2-1.3 4.5-1.3S18.5 18 21 18" /><path d="M5 14h14l-2 3H7z" /><path d="M12 14V3.5l5 7.5h-5" /></>,
  "cat-palm": <><path d="M12 21c0-5 .5-9 2-12.5" /><path d="M14 8.5C12 5 8 4.5 5 6.5c3 0 5.5.5 9 2zM14 8.5c1-3.5 4.5-5 7.5-4-2.5 1-4.5 2-7.5 4zM14 8.5c3.5-.5 6 1.5 6.5 5-2-2-3.5-3.5-6.5-5zM14 8.5c-3.5.5-5.5 3.5-5 6.5 1.5-2.5 3-4.5 5-6.5z" /><path d="M7 21h10" /></>,
  "cat-tree": <><path d="M12 21v-7" /><path d="M12 3 5.5 11h3L5 15.5h14L15.5 11h3z" /><path d="M8.5 21h7" /></>,
  "cat-design": <><path d="M12 12a1.5 1.5 0 1 1 1.5-1.5 3 3 0 0 1-3 3 4.5 4.5 0 0 1-4.5-4.5 6 6 0 0 1 6-6 7.5 7.5 0 0 1 7.5 7.5 9 9 0 0 1-9 9" /></>,
  "cat-mansion": <><path d="M3 9 12 4l9 5" /><path d="M4.5 9h15M4.5 20.5h15M6.5 10.5v8M10 10.5v8M14 10.5v8M17.5 10.5v8M3 20.5h18" /></>,
  "cat-tiny": <><path d="M5.5 12 12 6.5l6.5 5.5" /><path d="M7.5 10.5v9h9v-9" /><path d="M11 19.5v-3.5h2v3.5M3 19.5h18" /></>,
  "cat-ski": <><circle cx="15.5" cy="4.5" r="1.8" /><path d="m3 15.5 17 6M8 11.5l4-3 2.5 3.5 3 .5M12 8.5l-1.5 5.5 3 2" /></>,
} satisfies Record<string, JSX.Element>;

export type IconName = keyof typeof P;

export function Icon({ name, size = 16, strokeWidth = 2, className, ...rest }:
  { name: IconName; size?: number; strokeWidth?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {P[name]}
    </svg>
  );
}

/** Solid star used in ratings. */
export function StarSolid({ size = 12, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className={className}>
      <path fill="currentColor" d="m12 2.5 2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.2l-5.9 3.3 1.3-6.6-4.9-4.5 6.6-.8z" />
    </svg>
  );
}
