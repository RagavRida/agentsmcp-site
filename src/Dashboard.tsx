/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useMemo, useState, FormEvent, ReactNode } from "react";

const API_URL = "https://hdnxa5c8yr.us-east-1.awsapprunner.com";

interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  githubLogin: string | null;
  avatarUrl: string | null;
  createdAt: string;
}
interface SessionKey {
  id: string;
  prefix: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
}
interface SessionUsage {
  agents: number;
  maxAgents: number | null;
  threads: number;
  maxThreads: number | null;
  messagesToday: number;
  maxMessagesPerDay: number | null;
}
interface SessionData {
  user: SessionUser;
  keys: SessionKey[];
  usage: SessionUsage;
}

type Tab = "keys" | "usage" | "account";

export default function Dashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("keys");

  // First-time signup banner — the OAuth callback appends ?apiKey=...
  // exactly once for fresh signups so the user can copy it.
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [freshKeyCopied, setFreshKeyCopied] = useState(false);

  // Create-key modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdKeyCopied, setCreatedKeyCopied] = useState(false);

  // Revoke confirmation
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // ----- bootstrap: pull token from URL or localStorage -----
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    const urlApiKey = params.get("apiKey");
    if (urlApiKey) setFreshKey(urlApiKey);

    if (urlToken) {
      localStorage.setItem("agentsmcp_session", urlToken);
      setToken(urlToken);
      // Strip both token + apiKey from URL — they shouldn't sit in history.
      window.history.replaceState({}, "", "/dashboard");
    } else {
      const stored = localStorage.getItem("agentsmcp_session");
      if (stored) setToken(stored);
    }
  }, []);

  // ----- fetch session data when we have a token -----
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/auth/session`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        if (res.status === 401) {
          localStorage.removeItem("agentsmcp_session");
          setToken(null);
          setError("Session expired. Sign in again.");
          return;
        }
        if (!res.ok) {
          setError(`Couldn't load dashboard (${res.status})`);
          return;
        }
        const json = (await res.json()) as SessionData;
        setData(json);
      } catch {
        if (!cancelled) setError("Connection failed. Refresh to retry.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const logout = () => {
    localStorage.removeItem("agentsmcp_session");
    window.location.href = "/";
  };

  const refreshSession = async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setData((await res.json()) as SessionData);
  };

  const createKey = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || createLoading) return;
    setCreateLoading(true);
    setCreateError(null);
    try {
      const res = await fetch(`${API_URL}/auth/keys`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: createName.trim() || "default" }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (j.error === "plan_limit") {
          setCreateError(
            `Plan limit reached: ${j.current ?? "?"} / ${j.limit ?? "?"} keys. Upgrade or revoke an existing key.`
          );
        } else {
          setCreateError(j.error ?? `Failed (${res.status})`);
        }
        return;
      }
      setCreatedKey(j.apiKey);
      await refreshSession();
    } catch {
      setCreateError("Connection failed.");
    } finally {
      setCreateLoading(false);
    }
  };

  const revokeKey = async (keyId: string) => {
    if (!token) return;
    setRevokingId(keyId);
    try {
      const res = await fetch(`${API_URL}/auth/keys/${keyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        // Session-bearer can't be revoked here (that endpoint is for the
        // sk_live_ key in use). Fine — UI just won't allow revoking the
        // last key anyway.
        console.warn("revoke failed:", j);
      }
      await refreshSession();
    } finally {
      setRevokingId(null);
    }
  };

  const closeCreateModal = () => {
    setCreateOpen(false);
    setCreateName("");
    setCreatedKey(null);
    setCreatedKeyCopied(false);
    setCreateError(null);
  };

  // ----- early returns -----

  if (!token && !loading) {
    return (
      <DashboardEmptyAuth />
    );
  }

  if (loading) {
    return (
      <DashboardShell user={null} onLogout={logout}>
        <div className="text-center text-[#737373] text-sm py-24">Loading…</div>
      </DashboardShell>
    );
  }

  if (error || !data) {
    return (
      <DashboardShell user={null} onLogout={logout}>
        <div className="text-center text-[#ef4444] text-sm py-24">
          {error ?? "Something went wrong."}
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell user={data.user} onLogout={logout}>
      {/* First-time signup banner */}
      {freshKey && (
        <div className="mb-6 bg-[#22c55e]/5 border border-[#22c55e]/40 rounded-[6px] p-4 space-y-3">
          <div className="flex items-center gap-2 text-[#22c55e] font-mono text-xs uppercase tracking-wider">
            <CheckIcon />
            <span>Welcome to AgentMailbox — your account is ready</span>
          </div>
          <p className="text-sm text-[#e5e5e5]">
            Your first API key:
          </p>
          <div className="bg-[#0a0a0a] border border-[#22c55e]/50 rounded-[4px] p-3 flex items-center gap-2">
            <code className="font-mono text-xs text-[#22c55e] break-all flex-1">{freshKey}</code>
            <CopyButton
              text={freshKey}
              copied={freshKeyCopied}
              onCopy={() => {
                navigator.clipboard.writeText(freshKey);
                setFreshKeyCopied(true);
                setTimeout(() => setFreshKeyCopied(false), 1500);
              }}
            />
          </div>
          <p className="text-xs text-[#f59e0b] font-mono">⚠️ Save this key — it won't be shown again.</p>
          <button
            onClick={() => setFreshKey(null)}
            className="text-xs text-[#525252] font-mono hover:text-[#737373] transition focus:outline-none"
          >
            I've saved it — dismiss →
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#262626] -mx-6 md:-mx-8 px-6 md:px-8 mb-6">
        {(["keys", "usage", "account"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium transition border-b-2 focus:outline-none capitalize ${
              tab === t
                ? "text-[#e5e5e5] border-[#22c55e]"
                : "text-[#737373] border-transparent hover:text-[#a3a3a3]"
            }`}
          >
            {t === "keys" ? "API Keys" : t === "usage" ? "Usage" : "Account"}
          </button>
        ))}
      </div>

      {tab === "keys" && (
        <KeysTab
          keys={data.keys}
          onCreate={() => setCreateOpen(true)}
          onRevoke={revokeKey}
          revokingId={revokingId}
        />
      )}
      {tab === "usage" && <UsageTab usage={data.usage} plan={data.user.plan} />}
      {tab === "account" && (
        <AccountTab user={data.user} onLogout={logout} />
      )}

      {/* Create-key modal */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCreateModal();
          }}
        >
          <div className="relative w-full max-w-md bg-[#0d0d0d] border border-[#262626] rounded-[6px] p-6 md:p-8 space-y-4">
            <button
              type="button"
              onClick={closeCreateModal}
              className="absolute top-4 right-4 text-[#525252] hover:text-[#e5e5e5] transition focus:outline-none"
              aria-label="Close"
            >
              <XIcon />
            </button>
            {!createdKey ? (
              <>
                <h2 className="text-xl font-medium tracking-tight text-[#e5e5e5]">
                  Create a new API key
                </h2>
                <p className="text-sm text-[#737373]">
                  Give it a name to remember what it's for (e.g.
                  "claude-desktop", "production-bot").
                </p>
                <form onSubmit={createKey} className="space-y-3">
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="key name (optional)"
                    autoFocus
                    disabled={createLoading}
                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-[4px] px-3 py-2.5 text-sm text-[#e5e5e5] placeholder:text-[#525252] focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="w-full bg-[#22c55e] text-[#0a0a0a] hover:bg-[#1faa53] transition px-5 py-2.5 text-sm font-medium rounded-[4px] flex items-center justify-center gap-2 focus:outline-none disabled:opacity-60"
                  >
                    {createLoading ? "Creating…" : "Create key"}
                  </button>
                </form>
                {createError && (
                  <p className="text-sm text-[#ef4444] font-mono">{createError}</p>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-[#22c55e] font-mono text-xs uppercase tracking-wider">
                  <CheckIcon />
                  <span>Key created</span>
                </div>
                <p className="text-sm text-[#e5e5e5]">Your new API key:</p>
                <div className="bg-[#0a0a0a] border border-[#22c55e]/50 rounded-[4px] p-3 flex items-center gap-2">
                  <code className="font-mono text-xs text-[#22c55e] break-all flex-1">
                    {createdKey}
                  </code>
                  <CopyButton
                    text={createdKey}
                    copied={createdKeyCopied}
                    onCopy={() => {
                      navigator.clipboard.writeText(createdKey);
                      setCreatedKeyCopied(true);
                      setTimeout(() => setCreatedKeyCopied(false), 1500);
                    }}
                  />
                </div>
                <p className="text-xs text-[#f59e0b] font-mono">⚠️ Save this key — it won't be shown again.</p>
                <button
                  onClick={closeCreateModal}
                  className="w-full bg-[#22c55e]/10 hover:bg-[#22c55e]/20 border border-[#22c55e]/30 text-[#22c55e] rounded-[4px] py-2 text-sm font-medium transition focus:outline-none"
                >
                  I've saved it
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function DashboardShell({
  user,
  onLogout,
  children,
}: {
  user: SessionUser | null;
  onLogout: () => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] selection:bg-[#22c55e]/20 selection:text-[#22c55e] font-sans">
      <header className="py-4 border-b border-[#262626]">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12 flex justify-between items-center gap-4">
          <a href="/" className="flex items-center gap-2.5 hover:opacity-80 transition">
            <span className="font-semibold text-[#e5e5e5] tracking-tight text-base uppercase">
              AgentMailbox
            </span>
            <span className="text-[10px] font-mono border border-[#262626] bg-[#121212] px-1.5 py-0.5 rounded-xs text-[#22c55e]">
              dashboard
            </span>
          </a>
          {user && (
            <div className="flex items-center gap-3">
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.githubLogin ?? user.email}
                  className="w-7 h-7 rounded-full border border-[#262626]"
                />
              )}
              <span className="hidden sm:inline text-sm text-[#a3a3a3]">
                {user.githubLogin ?? user.email}
              </span>
              <button
                onClick={onLogout}
                className="text-sm text-[#737373] hover:text-[#e5e5e5] transition focus:outline-none"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 md:px-12 py-12">
        {children}
      </main>
    </div>
  );
}

function DashboardEmptyAuth() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] font-sans flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-medium tracking-tight">Sign in to AgentMailbox</h1>
        <p className="text-sm text-[#737373]">
          Sign in with GitHub to view your dashboard.
        </p>
        <a
          href={`${API_URL}/auth/github`}
          className="inline-flex items-center gap-2 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-[#e5e5e5] px-4 py-2.5 rounded-[6px] text-sm font-medium transition"
        >
          <GitHubIcon />
          Sign in with GitHub
        </a>
        <p className="pt-4">
          <a href="/" className="text-xs text-[#525252] hover:text-[#737373] transition">
            ← Back to site
          </a>
        </p>
      </div>
    </div>
  );
}

function KeysTab({
  keys,
  onCreate,
  onRevoke,
  revokingId,
}: {
  keys: SessionKey[];
  onCreate: () => void;
  onRevoke: (id: string) => void;
  revokingId: string | null;
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-[#e5e5e5]">API Keys</h2>
          <p className="text-sm text-[#737373]">
            Use these in your MCP config or SDK. Full key shown once at creation.
          </p>
        </div>
        <button
          onClick={onCreate}
          className="bg-[#22c55e] text-[#0a0a0a] hover:bg-[#1faa53] transition px-4 py-2 text-sm font-medium rounded-[4px] focus:outline-none"
        >
          + New key
        </button>
      </div>

      {keys.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[#262626] rounded-[6px]">
          <p className="text-[#737373] text-sm">No keys yet.</p>
          <button
            onClick={onCreate}
            className="mt-3 bg-[#22c55e] text-[#0a0a0a] hover:bg-[#1faa53] transition px-4 py-2 text-sm font-medium rounded-[4px] focus:outline-none"
          >
            Generate your first key
          </button>
        </div>
      ) : (
        <div className="border border-[#262626] rounded-[6px] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#121212] text-[#737373] font-mono text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Prefix</th>
                <th className="text-left px-4 py-2.5 font-medium">Name</th>
                <th className="text-left px-4 py-2.5 font-medium hidden md:table-cell">Created</th>
                <th className="text-left px-4 py-2.5 font-medium hidden md:table-cell">Last used</th>
                <th className="text-right px-4 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-[#0d0d0d] transition">
                  <td className="px-4 py-3 font-mono text-xs text-[#22c55e]">{k.prefix}…</td>
                  <td className="px-4 py-3 text-[#a3a3a3]">{k.name}</td>
                  <td className="px-4 py-3 text-[#737373] hidden md:table-cell">
                    {new Date(k.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-[#737373] hidden md:table-cell">
                    {k.lastUsedAt
                      ? new Date(k.lastUsedAt).toLocaleDateString()
                      : "never"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {keys.length > 1 ? (
                      <button
                        onClick={() => onRevoke(k.id)}
                        disabled={revokingId === k.id}
                        className="text-xs text-[#737373] hover:text-[#ef4444] transition font-mono disabled:opacity-50 focus:outline-none cursor-pointer"
                      >
                        {revokingId === k.id ? "revoking…" : "revoke"}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (window.confirm("This is your only key. Revoke it? You can create a new one after.")) {
                            onRevoke(k.id);
                          }
                        }}
                        disabled={revokingId === k.id}
                        className="text-xs text-[#737373] hover:text-[#ef4444] transition font-mono disabled:opacity-50 focus:outline-none cursor-pointer"
                      >
                        {revokingId === k.id ? "revoking…" : "revoke"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UsageTab({ usage, plan }: { usage: SessionUsage; plan: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-[#e5e5e5]">Usage</h2>
        <p className="text-sm text-[#737373]">
          Plan: <span className="text-[#22c55e] font-mono uppercase">{plan}</span> · resets daily at UTC midnight
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UsageCard label="Agents" current={usage.agents} max={usage.maxAgents} />
        <UsageCard label="Threads" current={usage.threads} max={usage.maxThreads} />
        <UsageCard
          label="Messages today"
          current={usage.messagesToday}
          max={usage.maxMessagesPerDay}
        />
      </div>
      <p className="text-xs text-[#525252] font-mono">
        Hit a cap?{" "}
        <a
          href="https://github.com/RagavRida/agentsmcp#self-hosted"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#22c55e] hover:underline"
        >
          Self-host for unlimited
        </a>{" "}
        — same code, MIT licensed.
      </p>
    </div>
  );
}

function UsageCard({
  label,
  current,
  max,
}: {
  label: string;
  current: number;
  max: number | null;
}) {
  const isUnlimited = max === null || max < 0;
  const pct = useMemo(() => {
    if (isUnlimited || !max) return 0;
    return Math.min(100, Math.round((current / max) * 100));
  }, [current, max, isUnlimited]);
  const barColor =
    pct >= 90 ? "bg-[#ef4444]" : pct >= 70 ? "bg-[#f59e0b]" : "bg-[#22c55e]";
  return (
    <div className="bg-[#0d0d0d] border border-[#262626] rounded-[6px] p-4 space-y-2">
      <p className="text-xs text-[#737373] font-mono uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-medium text-[#e5e5e5]">
        {current}
        <span className="text-sm text-[#525252] ml-1">
          {isUnlimited ? "/ ∞" : `/ ${max}`}
        </span>
      </p>
      {!isUnlimited && (
        <div className="h-1.5 bg-[#171717] rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function AccountTab({
  user,
  onLogout,
}: {
  user: SessionUser;
  onLogout: () => void;
}) {
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-lg font-medium text-[#e5e5e5]">Account</h2>
      <div className="bg-[#0d0d0d] border border-[#262626] rounded-[6px] p-6 space-y-4">
        <div className="flex items-center gap-4">
          {user.avatarUrl && (
            <img
              src={user.avatarUrl}
              alt={user.githubLogin ?? user.email}
              className="w-14 h-14 rounded-full border border-[#262626]"
            />
          )}
          <div>
            <p className="text-base text-[#e5e5e5]">
              {user.name ?? user.githubLogin ?? user.email}
            </p>
            <p className="text-sm text-[#737373]">{user.email}</p>
            {user.githubLogin && (
              <a
                href={`https://github.com/${user.githubLogin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#22c55e] hover:underline font-mono"
              >
                github.com/{user.githubLogin}
              </a>
            )}
          </div>
        </div>
        <div className="border-t border-[#262626] pt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-[#737373] font-mono uppercase tracking-wider">Plan</p>
            <p className="text-[#22c55e] font-mono uppercase">{user.plan}</p>
          </div>
          <div>
            <p className="text-xs text-[#737373] font-mono uppercase tracking-wider">Member since</p>
            <p className="text-[#a3a3a3]">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="text-sm text-[#737373] hover:text-[#ef4444] transition font-mono focus:outline-none"
      >
        Logout
      </button>
    </div>
  );
}

// ============================================================================
// Icons + small bits
// ============================================================================

function CheckIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.13c-3.2.69-3.87-1.36-3.87-1.36-.52-1.34-1.27-1.7-1.27-1.7-1.04-.71.08-.69.08-.69 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.73-1.53-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.15 1.18a10.97 10.97 0 015.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.77.11 3.06.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.26 5.69.41.36.78 1.06.78 2.13v3.16c0 .31.21.66.79.55C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function CopyButton({
  text: _text,
  copied,
  onCopy,
}: {
  text: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <button
      onClick={onCopy}
      className="shrink-0 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 rounded-[4px] px-3 py-1.5 text-xs font-medium transition flex items-center gap-1.5 focus:outline-none"
      aria-label="Copy"
    >
      {copied ? (
        <>
          <CheckIcon />
          <span>Copied</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span>Copy</span>
        </>
      )}
    </button>
  );
}
