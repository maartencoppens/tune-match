type LogoProps = {
  className?: string;
};

export default function Logo({ className }: LogoProps) {
  return (
    <div
      className={["inline-flex items-center gap-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 64 64"
        className="h-14 w-14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="tmCore"
            x1="8"
            y1="8"
            x2="56"
            y2="56"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#A445F7" />
            <stop offset="1" stopColor="#31002C" />
          </linearGradient>
        </defs>

        <rect x="8" y="8" width="48" height="48" rx="14" fill="url(#tmCore)" />
        <circle cx="32" cy="32" r="10" fill="#F5E9FF" fillOpacity="0.92" />
        <circle cx="32" cy="32" r="3" fill="#1B0018" />

        <rect
          x="16"
          y="20"
          width="3"
          height="24"
          rx="1.5"
          fill="#E7C5FF"
          fillOpacity="0.85"
        />
        <rect
          x="45"
          y="20"
          width="3"
          height="24"
          rx="1.5"
          fill="#E7C5FF"
          fillOpacity="0.85"
        />
      </svg>

      <span className="text-xl font-semibold tracking-wide text-violet-100">
        Tune Match
      </span>
    </div>
  );
}
