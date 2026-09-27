import { Link } from "react-router-dom";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="brand" aria-label="RESET by Stilloak home">
      <span className="brand-mark" aria-hidden="true">R</span>
      {!compact && <span><strong>RESET</strong><small>by Stilloak</small></span>}
    </Link>
  );
}
