import Link from "next/link";

export function Mark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#151a2c" />
      <path
        d="M8 12.5c0-1.4 1.2-2.5 2.6-2.5h7.2c2.3 0 4.2 1.8 4.2 4.1 0 1.7-1 3.1-2.5 3.7L22 21.2l-4.1-2.1H10.6C9.2 19.1 8 18 8 16.6v-4.1z"
        fill="#fff"
      />
      <path d="M12.2 14.2h7.1M12.2 16.4h4.6" stroke="#6d5efc" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M21.2 8.2l1.1 2.3 2.5.2-1.9 1.6.6 2.4-2.3-1.3-2.3 1.3.6-2.4-1.9-1.6 2.5-.2z" fill="#2f4bff" />
    </svg>
  );
}

export function Logo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-semibold tracking-tight" aria-label="AI Sales Agent">
      <Mark />
      {compact ? null : <span>AI Sales Agent</span>}
    </Link>
  );
}
