export function Logo({ className = "", size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="吹水台 CheuiSui"
      className={className}
    >
      {/* Neon glow filter */}
      <defs>
        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Main speech bubble */}
      <path
        d="M8 10C8 7.79 9.79 6 12 6H36C38.21 6 40 7.79 40 10V28C40 30.21 38.21 32 36 32H18L10 40V32H12C9.79 32 8 30.21 8 28V10Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        filter="url(#neon-glow)"
      />
      {/* Secondary smaller bubble */}
      <path
        d="M30 14C30 12.9 30.9 12 32 12H42C43.1 12 44 12.9 44 14V22C44 23.1 43.1 24 42 24H38L34 28V24H32C30.9 24 30 23.1 30 22V14Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.6"
        filter="url(#neon-glow)"
      />
      {/* Chat dots in main bubble */}
      <circle cx="18" cy="19" r="2" fill="currentColor" opacity="0.9" />
      <circle cx="24" cy="19" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="30" cy="19" r="2" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
