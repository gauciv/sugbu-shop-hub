/** Hand-drawn style SVG doodle illustrations for the cozy indie marketplace */

interface DoodleProps {
  className?: string;
}

export function DoodleHeart({ className = "" }: DoodleProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 35C20 35 5 25 5 15C5 10 9 6 14 6C17 6 19 8 20 10C21 8 23 6 26 6C31 6 35 10 35 15C35 25 20 35 20 35Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}

export function DoodleStar({ className = "" }: DoodleProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 4L24 14L35 15L27 23L29 34L20 29L11 34L13 23L5 15L16 14L20 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}

export function DoodleSparkle({ className = "" }: DoodleProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 2C16 2 18 10 16 16C14 10 16 2 16 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 30C16 30 14 22 16 16C18 22 16 30 16 30Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M2 16C2 16 10 14 16 16C10 18 2 16 2 16Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M30 16C30 16 22 18 16 16C22 14 30 16 30 16Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DoodleLeaf({ className = "" }: DoodleProps) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 30C8 30 6 18 14 10C22 2 34 4 34 4C34 4 32 16 24 24C16 32 8 30 8 30Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M8 30C14 24 20 18 28 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DoodleShoppingBag({ className = "" }: DoodleProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 14H32L30 34H10L8 14Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M14 14C14 14 14 6 20 6C26 6 26 14 26 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="16" cy="22" r="1.5" fill="currentColor" />
      <circle cx="24" cy="22" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function DoodleFlower({ className = "" }: DoodleProps) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="14" r="4" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
      <ellipse cx="12" cy="10" rx="4" ry="3" transform="rotate(-30 12 10)" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
      <ellipse cx="24" cy="10" rx="4" ry="3" transform="rotate(30 24 10)" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
      <ellipse cx="11" cy="17" rx="4" ry="3" transform="rotate(-80 11 17)" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
      <ellipse cx="25" cy="17" rx="4" ry="3" transform="rotate(80 25 17)" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
      <path d="M18 18V32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 26C15 24 13 22 13 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
