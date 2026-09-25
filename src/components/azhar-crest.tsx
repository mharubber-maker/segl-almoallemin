export function AzharCrest({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <circle cx="32" cy="32" r="30" className="fill-azhar" />
      <path
        d="M32 10c-7.2 0-13 5.8-13 13 0 4.4 2.2 8.3 5.6 10.7-.4.6-.6 1.3-.6 2.1 0 1.9 1.5 3.4 3.4 3.4h9.2c1.9 0 3.4-1.5 3.4-3.4 0-.8-.2-1.5-.6-2.1 3.4-2.4 5.6-6.3 5.6-10.7 0-7.2-5.8-13-13-13Z"
        className="fill-azhar-fg/90"
      />
      <path
        d="M22 42.5h20v2.4H22v-2.4Zm-3 3.6h26v2.2H19v-2.2Zm-2.4 3.4h30.8V52H16.6v-2.5Z"
        className="fill-azhar-fg"
      />
      <path
        d="M24 40.2c2.4-1.6 5.1-2.4 8-2.4s5.6.8 8 2.4"
        className="stroke-azhar-fg/70"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <rect x="30.2" y="36" width="3.6" height="8" rx="0.6" className="fill-azhar" />
    </svg>
  );
}
