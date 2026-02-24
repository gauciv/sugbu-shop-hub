/** Hand-drawn crayon/colored-pencil style SVG doodle illustrations */

interface DoodleProps {
  className?: string;
}

export function DoodleHeart({ className = "" }: DoodleProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 35C20 35 5.5 25.5 5.5 15.5C5.5 10.5 9.2 6.2 13.8 6.2C16.8 6.5 18.9 8.1 20 10.2C21.1 8 23.5 6.5 26.2 6.2C30.8 6.2 34.5 10.5 34.5 15.5C34.5 25.5 20 35 20 35Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.18"
        strokeDasharray="0.5 0.3"
      />
      {/* Crayon texture lines */}
      <path d="M13 13C14 11 16.5 10 18 11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      <path d="M10 17C11 15 13 14 14 15" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.2" />
    </svg>
  );
}

export function DoodleStar({ className = "" }: DoodleProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 4.5L24.2 13.8L34.5 15.2L27 22.8L28.8 33.5L20 28.8L11.2 33.5L13 22.8L5.5 15.2L15.8 13.8L20 4.5Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
        strokeDasharray="0.8 0.2"
      />
      {/* Inner shine marks */}
      <path d="M18 14L20 11L22 14" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.25" />
      <circle cx="20" cy="20" r="1.2" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

export function DoodleSparkle({ className = "" }: DoodleProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Four-point sparkle with crayon strokes */}
      <path
        d="M16 3C16.5 9 17.5 13 16 16C14.5 13 15.5 9 16 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path
        d="M16 29C15.5 23 14.5 19 16 16C17.5 19 16.5 23 16 29Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path
        d="M3 16C9 15.5 13 14.5 16 16C13 17.5 9 16.5 3 16Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path
        d="M29 16C23 16.5 19 17.5 16 16C19 14.5 23 15.5 29 16Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* Tiny accent dots */}
      <circle cx="10" cy="10" r="0.8" fill="currentColor" opacity="0.3" />
      <circle cx="22" cy="22" r="0.8" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function DoodleLeaf({ className = "" }: DoodleProps) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.5 29.5C8.5 29.5 6.5 18 14.2 10.2C21.8 2.5 33.5 4.5 33.5 4.5C33.5 4.5 31.5 16 23.8 23.8C16.2 31.5 8.5 29.5 8.5 29.5Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.12"
        strokeDasharray="0.6 0.3"
      />
      {/* Leaf veins with crayon texture */}
      <path d="M9 29C14.5 23.5 20 17.5 28 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
      <path d="M15 23C18 19 21 15 25 11" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.2" />
      <path d="M12 21C16 18 20 14 24 10" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" opacity="0.15" />
    </svg>
  );
}

export function DoodleShoppingBag({ className = "" }: DoodleProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.5 14.5H31.5L29.5 33.5H10.5L8.5 14.5Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
        strokeDasharray="0.7 0.2"
      />
      <path
        d="M14.5 14.5C14.5 14.5 14.5 6.5 20 6.5C25.5 6.5 25.5 14.5 25.5 14.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="0.5 0.3"
      />
      {/* Cute face details */}
      <circle cx="16" cy="22" r="1.8" fill="currentColor" opacity="0.4" />
      <circle cx="24" cy="22" r="1.8" fill="currentColor" opacity="0.4" />
      <path d="M17.5 26C18.5 27.5 21.5 27.5 22.5 26" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

export function DoodleFlower({ className = "" }: DoodleProps) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Center */}
      <circle cx="18" cy="14" r="4.5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.25" strokeDasharray="0.5 0.3" />
      {/* Petals with crayon feel */}
      <ellipse cx="11.5" cy="10" rx="4.5" ry="3.2" transform="rotate(-30 11.5 10)" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1" strokeDasharray="0.6 0.3" />
      <ellipse cx="24.5" cy="10" rx="4.5" ry="3.2" transform="rotate(30 24.5 10)" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1" strokeDasharray="0.6 0.3" />
      <ellipse cx="10.5" cy="17.5" rx="4.5" ry="3.2" transform="rotate(-80 10.5 17.5)" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1" strokeDasharray="0.6 0.3" />
      <ellipse cx="25.5" cy="17.5" rx="4.5" ry="3.2" transform="rotate(80 25.5 17.5)" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1" strokeDasharray="0.6 0.3" />
      {/* Stem and leaf */}
      <path d="M18 19V33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="0.8 0.3" />
      <path d="M18 26C15.5 24.5 13.5 22.5 13 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M18 29C20.5 27 22.5 25 23 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/** Decorative doodle icons for category cards and dashboard stats */

export function DoodlePackage({ className = "" }: DoodleProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.5 10.5L16 5L26.5 10.5V21.5L16 27L5.5 21.5V10.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.08"
        strokeDasharray="0.6 0.2"
      />
      <path d="M16 16V27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M5.5 10.5L16 16L26.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M11 7.5L21 13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

export function DoodleCoin({ className = "" }: DoodleProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="16" cy="16" r="11.5"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="currentColor"
        fillOpacity="0.12"
        strokeDasharray="0.7 0.3"
      />
      <text x="16" y="21" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="bold" opacity="0.5" fontFamily="Fredoka, sans-serif">$</text>
    </svg>
  );
}

export function DoodleCart({ className = "" }: DoodleProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 6H8L11 22H24L27 10H10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray="0.7 0.2"
      />
      <circle cx="13" cy="26" r="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
      <circle cx="22" cy="26" r="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

export function DoodleTrend({ className = "" }: DoodleProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 24L11 17L17 21L28 8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray="0.6 0.3"
      />
      <path d="M22 8H28V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Accent dots along the line */}
      <circle cx="11" cy="17" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="17" cy="21" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  );
}
