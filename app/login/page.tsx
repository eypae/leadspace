import { Suspense } from "react";
import LoginForm from "./LoginForm";

// Suspense boundary is required here because LoginForm uses useSearchParams()
// which opts the page into client-side rendering during the build.
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100dvh",
            background: "var(--gray-50)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid var(--gray-200)",
              borderTopColor: "var(--brand-500)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
