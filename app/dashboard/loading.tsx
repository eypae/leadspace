export default function DashboardLoading() {
  return (
    <div className="app-shell">
      {/* Sidebar skeleton */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div
            style={{
              width: 120,
              height: 20,
              background: "var(--gray-100)",
              borderRadius: "var(--radius-md)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>
        <div className="sidebar-nav">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                height: 34,
                margin: "3px 8px",
                background: "var(--gray-50)",
                borderRadius: "var(--radius-md)",
                animation: "pulse 1.5s ease-in-out infinite",
                animationDelay: `${i * 80}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main skeleton */}
      <div className="main-content">
        <div className="topbar" style={{ gap: 12 }}>
          <div
            style={{
              width: 100,
              height: 20,
              background: "var(--gray-100)",
              borderRadius: "var(--radius-full)",
            }}
          />
          <div
            style={{
              flex: 1,
              maxWidth: 280,
              height: 34,
              background: "var(--gray-100)",
              borderRadius: "var(--radius-full)",
            }}
          />
          <div
            style={{
              width: 80,
              height: 34,
              background: "var(--gray-100)",
              borderRadius: "var(--radius-md)",
            }}
          />
          <div
            style={{
              width: 100,
              height: 34,
              background: "var(--gray-100)",
              borderRadius: "var(--radius-md)",
            }}
          />
        </div>
        <div style={{ flex: 1, background: "var(--gray-0)" }} />
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}
