export default function BrandLogo({
  className = "h-9 w-9",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Calendar body in brand teal */}
      <rect x="2" y="5" width="32" height="28" rx="8" fill="#0f766e" />

      {/* Calendar header bar in brand warm amber */}
      <path
        d="M2 13C2 8.58172 5.58172 5 10 5H26C30.4183 5 34 8.58172 34 13V14H2V13Z"
        fill="#f59e0b"
      />

      {/* Calendar binder pins */}
      <rect x="9" y="2" width="3" height="6" rx="1.5" fill="#ffffff" />
      <rect x="24" y="2" width="3" height="6" rx="1.5" fill="#ffffff" />

      {/* Checkmark symbol */}
      <path
        d="M11 23.5L15.5 27.5L25 18"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
