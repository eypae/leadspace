"use client";

interface TopBarProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  onAddClient: () => void;
  onBroadcast: () => void;
  searchValue: string;
  onSearchChange: (v: string) => void;
}

export default function TopBar({
  title,
  subtitle,
  onMenuClick,
  onAddClient,
  onBroadcast,
  searchValue,
  onSearchChange,
}: TopBarProps) {
  return (
    <div className="topbar">
      {/* Hamburger — mobile only */}
      <button
        className="btn btn-ghost btn-icon"
        onClick={onMenuClick}
        aria-label="Open menu"
        style={{ display: "none" }}
        id="menu-btn"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Title */}
      <div>
        <div className="topbar-title">{title}</div>
        {subtitle && (
          <div
            style={{ fontSize: 12, color: "var(--gray-400)", marginTop: -2 }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="search-bar">
        <svg
          className="search-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          className="search-input"
          placeholder="Search clients…"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search clients"
        />
      </div>

      {/* Actions */}
      <div
        style={{ display: "flex", gap: 8, marginLeft: "auto", flexShrink: 0 }}
      >
        <button className="btn btn-secondary" onClick={onBroadcast}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m3 11 19-9-9 19-2-8-8-2z" />
          </svg>
          <span className="hide-xs">Broadcast</span>
        </button>
        <button className="btn btn-primary" onClick={onAddClient}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="hide-xs">Add client</span>
        </button>
      </div>

      {/* Mobile menu button inject — shown via CSS on small screens */}
      <style>{`
        @media (max-width: 767px) {
          #menu-btn { display: flex !important; }
          .hide-xs { display: none; }
        }
      `}</style>
    </div>
  );
}
