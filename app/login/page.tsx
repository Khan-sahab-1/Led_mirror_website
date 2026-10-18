"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/account";

  const { signIn, signUp, user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in
  if (user) {
    return (
      <div className="auth-card glass-panel text-center">
        <div className="auth-avatar-large">✓</div>
        <h2>Welcome back!</h2>
        <p className="muted">You are signed in as <strong>{user.email}</strong></p>
        <div className="flex-center gap-12 mt-20">
          <button className="btn" onClick={() => router.push(redirectPath)}>
            Continue to {redirectPath === "/checkout" ? "Checkout" : "Account"}
          </button>
          <Link href="/" className="btn secondary">Return to Store</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    try {
      if (mode === "signin") {
        const res = await signIn(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          router.push(redirectPath);
        }
      } else {
        if (!fullName.trim()) {
          setError("Please provide your full name.");
          setBusy(false);
          return;
        }
        const res = await signUp(email, password, fullName);
        if (res.error) {
          setError(res.error);
        } else {
          setNotice(res.message || "Account registered successfully!");
          if (res.message?.includes("signed in")) {
            setTimeout(() => router.push(redirectPath), 1000);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-card glass-panel">
      <div className="auth-header">
        <span className="eyebrow-luxury">GLASSSTUDIO PRIVILEGE</span>
        <h1 className="auth-title">{mode === "signin" ? "Sign In to Your Account" : "Join GlassStudio Club"}</h1>
        <p className="auth-subtitle">
          {mode === "signin"
            ? "Access order tracking, bespoke mirror consultations & saved delivery details."
            : "Create an account for expedited checkout, saved addresses and exclusive previews."}
        </p>
      </div>

      <div className="tab-pill-group">
        <button
          type="button"
          className={`tab-pill ${mode === "signin" ? "active" : ""}`}
          onClick={() => { setMode("signin"); setError(""); setNotice(""); }}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`tab-pill ${mode === "signup" ? "active" : ""}`}
          onClick={() => { setMode("signup"); setError(""); setNotice(""); }}
        >
          Create Account
        </button>
      </div>

      {error && <div className="alert-error" role="alert">{error}</div>}
      {notice && <div className="alert-success" role="status">{notice}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        {mode === "signup" && (
          <div className="input-group">
            <label htmlFor="auth-name">Full Name *</label>
            <input
              id="auth-name"
              type="text"
              required
              placeholder="e.g. Aryan Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </div>
        )}

        <div className="input-group">
          <label htmlFor="auth-email">Email Address *</label>
          <input
            id="auth-email"
            type="email"
            required
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="input-group">
          <div className="flex-between">
            <label htmlFor="auth-password">Password *</label>
            <button
              type="button"
              className="link-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <input
            id="auth-password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </div>

        <button className="btn btn-luxury w-100" type="submit" disabled={busy}>
          {busy ? (
            <span className="spinner-dots">Authenticating...</span>
          ) : mode === "signin" ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="auth-footer-links">
        <Link href="/" className="muted-link">← Return to Storefront</Link>
        {redirectPath === "/checkout" && (
          <Link href="/checkout" className="muted-link">Continue as Guest →</Link>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="auth-container">
        <Suspense fallback={<div className="text-center p-40">Loading luxury portal...</div>}>
          <LoginFormInner />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

