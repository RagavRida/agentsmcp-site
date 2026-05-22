/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useEffect, useRef } from "react";
import { Check, Copy, ExternalLink, Play, ArrowRight, Database, Sparkles, Cpu, Layers, Terminal, FileCode, Sliders, RefreshCw, Send, HelpCircle } from "lucide-react";

const sandboxPresets = {
  stripe: {
    name: "Stripe Webhooks",
    prompt: "Add Stripe webhook handler to check for checkout.session.completed, verify signature using process.env.STRIPE_WEBHOOK_SECRET, and update database payment state.",
    data: {
      mailbox_id: "box_stripe_webhooks",
      topic: "stripe_integration",
      tokens_in: 1250,
      tokens_out: 340,
      context_summary: "Implement Stripe webhook checking signature & DB state update.",
      critical_facts: [
        "Requires process.env.STRIPE_WEBHOOK_SECRET",
        "Target endpoint: /api/webhooks/stripe",
        "Db update function: updatePaymentStatus()"
      ],
      active_files: ["server.ts", "database.ts"],
      last_executed_cmd: "npm run test:webhook"
    }
  },
  db: {
    name: "DB Schema Migration",
    prompt: "Migrate legacy User database records to include organization_id, update unique constraints across users table, and verify with Prisma migrate.",
    data: {
      mailbox_id: "box_db_migration",
      topic: "multi_tenancy",
      tokens_in: 1840,
      tokens_out: 410,
      context_summary: "Add organization_id column to User schema and adjust unique constraints.",
      critical_facts: [
        "Unique constraint now over (email, organization_id)",
        "ORM client: Prisma ORM engine",
        "Verify migration: prisma migrate dev"
      ],
      active_files: ["schema.prisma", "user.service.ts"],
      last_executed_cmd: "npx prisma migrate dev --name init_tenants"
    }
  },
  react: {
    name: "React Modernization",
    prompt: "Refactor massive 2000-line React dashboard class component into modular functional elements with custom helper hooks, and test with RTL.",
    data: {
      mailbox_id: "box_react_refactor",
      topic: "react_modernization",
      tokens_in: 3500,
      tokens_out: 580,
      context_summary: "Refactor legacy class Dashboard to modular functional components with hooks.",
      critical_facts: [
        "Introduce useDashboardState helper hook",
        "Split chart into /components/DashboardChart.tsx",
        "Preserve RTL assertion criteria of subtrees"
      ],
      active_files: ["DashboardLegacy.tsx", "Dashboard.tsx", "useDashboardState.ts"],
      last_executed_cmd: "npm run test:dashboard"
    }
  }
};

const analyzeCustomQuery = (text: string) => {
  const lowercase = text.toLowerCase();
  
  // Extract files
  const fileMatches = text.match(/[a-zA-Z0-9_\-.]+\.(ts|js|tsx|jsx|py|json|prisma|css|html|yml|md)/g) || [];
  const activeFiles = fileMatches.length > 0 ? Array.from(new Set(fileMatches)).slice(0, 3) : ["agent_worker.ts", "package.json"];
  
  // Topic
  let topic = "general_task";
  if (lowercase.includes("stripe") || lowercase.includes("payment")) topic = "stripe_integration";
  else if (lowercase.includes("db") || lowercase.includes("database") || lowercase.includes("prisma") || lowercase.includes("sql") || lowercase.includes("migration")) topic = "database_migration";
  else if (lowercase.includes("refactor") || lowercase.includes("legacy") || lowercase.includes("clean") || lowercase.includes("convert")) topic = "code_refactoring";
  else if (lowercase.includes("test") || lowercase.includes("vitest") || lowercase.includes("jest") || lowercase.includes("cypress") || lowercase.includes("rtl")) topic = "test_suite_setup";
  else if (lowercase.includes("auth") || lowercase.includes("login") || lowercase.includes("jwt") || lowercase.includes("oauth")) topic = "auth_session_flow";
  
  // Facts
  const criticalFacts: string[] = [];
  if (lowercase.includes("stripe") || lowercase.includes("payment")) criticalFacts.push("Requires process.env.STRIPE_SECRET_KEY Validation");
  if (lowercase.includes("database") || lowercase.includes("prisma") || lowercase.includes("db") || lowercase.includes("sql")) criticalFacts.push("Persists relational state via secure query hooks");
  if (lowercase.includes("test") || lowercase.includes("rtl")) criticalFacts.push("Assert and mock async network boundaries");
  if (lowercase.includes("auth") || lowercase.includes("login")) criticalFacts.push("Encrypt refresh tokens with secure cookie configurations");
  
  // General facts based on length & keywords
  if (lowercase.includes("create") || lowercase.includes("add") || lowercase.includes("new")) {
    criticalFacts.push("Scaffold clean TypeScript interfaces");
  }
  if (lowercase.includes("api") || lowercase.includes("endpoint") || lowercase.includes("routes")) {
    criticalFacts.push("Expose resilient Express or Next.js route handlers");
  }
  
  if (criticalFacts.length === 0) {
    criticalFacts.push("Parse incoming message payload", "Propagate context to downstream agents");
  } else {
    criticalFacts.push("Cold-restart context recovery compliant");
  }
  
  // Estimated tokens
  const words = text.trim() ? text.trim().split(/\s+/).length : 5;
  const tokensIn = Math.max(120, words * 12);
  const tokensOut = Math.max(45, Math.floor(tokensIn * 0.18));
  
  // Last executed command
  let lastCmd = "npm run build";
  if (lowercase.includes("test")) lastCmd = "npm run test";
  else if (lowercase.includes("prisma") || lowercase.includes("migration")) lastCmd = "npx prisma migrate dev";
  else if (lowercase.includes("stripe")) lastCmd = "npm run start:stripe-listen";
  else if (lowercase.includes("py") || lowercase.includes("python")) lastCmd = "python main.py";
  
  return {
    mailbox_id: `box_custom_${Math.floor(1000 + Math.random() * 9000)}`,
    topic,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    context_summary: text.length > 80 ? text.substring(0, 80) + "..." : text || "User-defined custom task state",
    critical_facts: criticalFacts.slice(0, 3),
    active_files: activeFiles,
    last_executed_cmd: lastCmd
  };
};

const worksWithList = [
  {
    name: "Cursor",
    icon: (
      <svg className="w-4 h-4 text-[#737373] group-hover:text-[#22c55e] transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor">
        {/* Real Cursor Brand Style: Diagonal sleek arrow cursor with code split line */}
        <path d="M19.43 12.98L7.14 4.14c-1.12-.8-2.6.01-2.6 1.4v12.87c0 .94 1.14 1.41 1.8 0.75l3.23-3.23 4.28 4.28c.39.39 1.02.39 1.41 0l2.83-2.83a1 1 0 0 0 0-1.41l-4.28-4.28 5.62-1.3c.78-.18.73-1.28-.02-1.4zM10.83 14L6.04 18.8V6.15l10.83 7.85-4.5 1.04a1 1 0 0 0-.66.66l-.88 3.35L10.83 14z" />
      </svg>
    )
  },
  {
    name: "Claude Desktop",
    icon: (
      <svg className="w-4 h-4 text-[#737373] group-hover:text-[#22c55e] transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor">
        {/* Authentic Claude: 5-branched dandelion-like organic splat */}
        <path d="M12 2C11.1 2 10.3 3.1 10.5 4.3c.1.9.8 1.6 1.5 2.1.8.5 1.5.5 2.1 0 .7-.5.9-1.3.6-2.1C14.3 3.1 13.1 2 12 2zm-5.4 3.1c-.8.5-1.2 1.8-.7 2.8.4.8 1.3 1.2 2.2 1.1s1.5-.7 1.6-1.5c.1-.8-.4-1.5-1.2-1.9-.9-.4-2-.1-2.1.2l.2.3zm10.8 0c-.2-.3-1.3-.6-2.1-.2-.8.4-1.3 1.1-1.2 1.9s.8 1.4 1.6 1.5 1.8-.3 2.2-1.1c.5-.9.1-2.2-.7-2.8zM4.3 10.5C3.1 10.3 2 11.1 2 12s1.1 1.7 2.3 1.5c.9-.1 1.6-.8 2.1-1.5.5-1 0-2.3-1-2.3-.3 0-.8.1-1.1.2zm15.4 0c-.3-.1-.8-.2-1.1-.2-1 0-1.5 1.3-1 2.3.5.7 1.2 1.4 2.1 1.5 1.2.2 2.3-.6 2.3-1.5s-1.1-1.7-2.3-1.5zM6.1 15.5c-.5-.8-1.8-1.2-2.8-.7-.8.4-1.2 1.3-1.1 2.2s.7 1.5 1.5 1.6c.8.1 1.5-.4 1.9-1.2.4-.9.1-2 .2-2.1l-.3-.12zm11.8 0l-.3.1c.1.1-.2 1.2.2 2.1.4.8 1.1 1.3 1.9 1.2s1.5-.7 1.6-1.5-.3-1.8-1.1-2.2c-.9-.5-2.2-.1-2.8.7H17.9zm-5.9 3c-1.1 0-2.3.9-2.1 2.1c.1 1.2 1.3 2 2.1 2s1.7-1.1 1.5-2.3c-.1-.9-.8-1.6-1.5-2.1a1.2 1.2 0 0 0-1 .3z" />
      </svg>
    )
  },
  {
    name: "Antigravity",
    icon: (
      <svg className="w-4 h-4 text-[#22c55e] group-hover:text-[#e5e5e5] transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor">
        {/* Authentic Google Gemini: 4-pointed glowing stellar spark */}
        <path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z" />
      </svg>
    )
  },
  {
    name: "Claude Code",
    icon: (
      <svg className="w-4 h-4 text-[#737373] group-hover:text-[#22c55e] transition-colors duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Custom Terminal prompt + Mini Spark */}
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
        <path d="m19 4 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" fill="currentColor" stroke="none" />
      </svg>
    )
  },
  {
    name: "Continue",
    icon: (
      <svg className="w-4 h-4 text-[#737373] group-hover:text-[#22c55e] transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor">
        {/* Real Continue Ribbon Arrow symbol */}
        <path d="M18.8 10L6.4 3.1A2.2 2.2 0 0 0 3 5.1v13.8a2.2 2.2 0 0 0 3.4 1.9l12.4-7a2.2 2.2 0 0 0 0-3.8zM5 16.9V7.1l8.7 4.9L5 16.9z" />
        <path d="M21 4h2v16h-2z" />
      </svg>
    )
  },
  {
    name: "Windsurf",
    icon: (
      <svg className="w-4 h-4 text-[#737373] group-hover:text-[#22c55e] transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor">
        {/* Real Codeium / Windsurf icon representation - curved sail nodes */}
        <path d="M2.35 12c0-5.33 4.32-9.65 9.65-9.65s9.65 4.32 9.65 9.65-4.32 9.65-9.65 9.65c-2.8 0-5.33-1.2-7.1-3.15l1.42-1.42A7.6 7.6 0 0 0 12 19.65c4.22 0 7.65-3.43 7.65-7.65s-3.43-7.65-7.65-7.65S4.35 7.78 4.35 12c0 1.25.3 2.44.83 3.5l-1.63 1c-.78-1.37-1.2-2.93-1.2-4.5z" />
        <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
      </svg>
    )
  },
  {
    name: "Cline",
    icon: (
      <svg className="w-4 h-4 text-[#737373] group-hover:text-[#22c55e] transition-colors duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Real Cline robotic shield profile */}
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <circle cx="12" cy="11" r="3" />
        <path d="M9 16c1-1 2-2 3-2s2 1 3 2" />
      </svg>
    )
  },
  {
    name: "Codex",
    icon: (
      <svg className="w-4 h-4 text-[#737373] group-hover:text-[#22c55e] transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor">
        {/* Real OpenAI Codex / GPT Flower swirl logo */}
        <path d="M20.2 12.2c-.3-.2-.5-.4-.8-.5.1-.3.1-.6.1-.9 0-.8-.3-1.6-.9-2.1-.5-.5-1.3-.8-2.1-.8l-1.1.1c0-.4-.1-.8-.3-1.1-.3-.6-.9-1.1-1.6-1.3-.7-.2-1.4-.1-2.1.2l-.9.5c-.3-.3-.6-.5-.9-.6A3.1 3.1 0 0 0 7.5 5a3 3 0 0 0-3 3c0 .3.1.6.1.9-.3.1-.5.3-.8.5A3 3 0 0 0 2.5 12a3 3 0 0 0 .9 2.1c.3.2.5.4.8.5-.1.3-.1.6-.1.9 0 .8.3 1.6.9 2.1.5.5 1.3.8 2.1.8l1.1-.1c0 .4.1.8.3 1.1.3.6.9 1.1 1.6 1.3.7.2 1.4.1 2.1-.2l.9-.5c.3.3.6.5.9.6.7.2 1.5.1 2.1-.2.7-.3 1.1-.9 1.3-1.6l.1-1.1c.4 0 .8.1 1.1.3.6.3 1.1.9 1.3 1.6.2.7.1 1.4-.2 2.1l-.5.9c.3.3.5.6.6.9.2.7.1 1.5-.2 2.1" opacity="0.15" />
        <path d="M11.9 2c-3.2 0-5.8 2.6-5.8 5.8 0 .8.2 1.5.5 2.1l-.8.5c-.7.4-1.2 1-1.5 1.8s-.2 1.6.2 2.3l.8 1.4c-.6.2-1.1.6-1.5 1.1-.6.7-1 1.6-1 2.6 0 1.9 1.2 3.5 2.9 4.1l2.4-1.4c.5.5 1.2.9 1.9 1.1l-.4 2.8c1.3.4 2.7.4 4 0l-.4-2.8c.7-.2 1.4-.6 1.9-1.1l2.4 1.4c1.7-.6 2.9-2.2 2.9-4.1 0-1-.3-1.9-1-2.6-.4-.5-.9-.9-1.5-1.1l.8-1.4c.4-.7.5-1.5.2-2.3s-.8-1.4-1.5-1.8l-.8-.5c.3-.6.5-1.3.5-2.1C17.7 4.6 15.1 2 11.9 2zm0 1.5c2.4 0 4.3 1.9 4.3 4.3 0 .7-.2 1.3-.5 1.8l-.8-.5c-.6-.4-1.3-.6-2.1-.6H11V5.7h1.9l-.1.1v-.3H11V3.5h.9z" />
      </svg>
    )
  },
  {
    name: "AMP",
    icon: (
      <svg className="w-4 h-4 text-[#22c55e] group-hover:text-[#e5e5e5] transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor">
        {/* Authentic Envelope + Mailbox fast lightning bolt */}
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 2l-7 4.5L5 6h14zm1 12H4V8l8 5 8-5v10z" />
        <path d="M11 9.5h2v3h-2zm-2.5 0h2v3h-2zm5 0h2v3h-2z" opacity="0.5" />
      </svg>
    )
  }
];

const AGENTSMCP_API_BASE = "https://hdnxa5c8yr.us-east-1.awsapprunner.com";

// Lightweight check at module load — true if a JWT is in localStorage. Used
// to flip the nav between logged-out (GitHub button) and logged-in (avatar
// + Dashboard link). Full validation happens on /dashboard via /auth/session.
function readStoredSession(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem("agentsmcp_session"));
}

export default function App() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Auth modal state — covers Sign Up + Sign In flows from the nav.
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");

  // Logged-in session indicator (read on mount). The dashboard does its own
  // /auth/session validation; here we just decide whether to show the nav's
  // logged-in shape.
  const [hasSession] = useState<boolean>(readStoredSession);

  // Sign Up state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupKey, setSignupKey] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);

  // Sign In state — paste an existing key, validate against /auth/me.
  const [signinKey, setSigninKey] = useState("");
  const [signinError, setSigninError] = useState<string | null>(null);
  const [signinLoading, setSigninLoading] = useState(false);
  const [signinUser, setSigninUser] = useState<{
    email: string;
    plan: string;
    usage: {
      agents: number;
      maxAgents: number;
      threads: number;
      maxThreads: number;
      messagesToday: number;
      maxMessagesPerDay: number;
    };
  } | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => {
        setIsSubscribed(false);
      }, 4000);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = signupEmail.trim();
    if (!trimmed || signupLoading) return;
    setSignupError(null);
    setSignupLoading(true);
    try {
      const res = await fetch(`${AGENTSMCP_API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.apiKey) {
        setSignupKey(data.apiKey);
        setSignupEmail("");
      } else {
        const code = data?.error ?? "unknown_error";
        const map: Record<string, string> = {
          email_required: "Please enter your email address.",
          invalid_email: "That email doesn't look right.",
          email_already_registered:
            "An account with this email already exists. Use a different one or recover your key.",
          rate_limit_exceeded:
            "Too many requests from this network — try again in a minute.",
        };
        setSignupError(map[code] ?? `Couldn't register: ${code}`);
      }
    } catch {
      setSignupError("Connection failed. Check your network and try again.");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (!signupKey) return;
    navigator.clipboard.writeText(signupKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 1500);
  };

  const resetSignup = () => {
    setSignupKey(null);
    setSignupError(null);
    setSignupEmail("");
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = signinKey.trim();
    if (!trimmed || signinLoading) return;
    if (!trimmed.startsWith("sk_live_")) {
      setSigninError("Keys start with sk_live_ — check what you pasted.");
      return;
    }
    setSigninError(null);
    setSigninLoading(true);
    try {
      const res = await fetch(`${AGENTSMCP_API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${trimmed}` },
      });
      if (res.status === 401) {
        setSigninError("Key is invalid or revoked. Sign up for a new one.");
        return;
      }
      if (!res.ok) {
        setSigninError(`Couldn't sign in (${res.status}). Try again.`);
        return;
      }
      const data = await res.json();
      setSigninUser({
        email: data.email,
        plan: data.plan,
        usage: data.usage,
      });
    } catch {
      setSigninError("Connection failed. Check your network and try again.");
    } finally {
      setSigninLoading(false);
    }
  };

  const openAuthModal = (mode: "signup" | "signin") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    // Don't reset signup success state — user might want to copy the key
    // again after closing. Only clear the sign-in scratchpad.
    setSigninError(null);
    setSignupError(null);
  };

  // ESC closes the modal.
  useEffect(() => {
    if (!authModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [authModalOpen]);

  // Interactive Sandbox state declarations
  const [sandboxPreset, setSandboxPreset] = useState<"stripe" | "db" | "react" | "custom">("stripe");
  const [customPrompt, setCustomPrompt] = useState("");
  const [sandboxStage, setSandboxStage] = useState<"idle" | "compressing" | "done">("idle");
  const [sandboxProgress, setSandboxProgress] = useState(0);
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([]);
  const [activeSandboxAgent, setActiveSandboxAgent] = useState<"Cursor" | "Claude Desktop" | "Antigravity" | "Continue">("Cursor");
  
  // Loaded active data based on current state
  const [activeSandboxData, setActiveSandboxData] = useState<any>(sandboxPresets.stripe.data);

  // Sync state whenever preset changes
  useEffect(() => {
    if (sandboxPreset !== "custom") {
      setActiveSandboxData(sandboxPresets[sandboxPreset].data);
    } else {
      setActiveSandboxData(analyzeCustomQuery(customPrompt));
    }
  }, [sandboxPreset, customPrompt]);

  const runSimulation = () => {
    setSandboxStage("compressing");
    setSandboxProgress(0);
    setSandboxLogs(["[INIT] Booting AgentMailbox orchestrator client...", "[CONNECT] Establishing secure context channel with central server..."]);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setSandboxProgress(currentProgress);
      
      if (currentProgress === 20) {
        setSandboxLogs(prev => [...prev, `[INGEST] Ingesting thread query: "${sandboxPreset === "custom" ? (customPrompt || "Custom thread task") : sandboxPresets[sandboxPreset].prompt.substring(0, 50)}..."`]);
      } else if (currentProgress === 40) {
        setSandboxLogs(prev => [...prev, "[ANALYZE] Running context-summary compression on thread history..."]);
      } else if (currentProgress === 60) {
        const finalData = sandboxPreset === "custom" ? analyzeCustomQuery(customPrompt) : sandboxPresets[sandboxPreset].data;
        setSandboxLogs(prev => [...prev, `[FACTOR] Compacted thread data: ${finalData.tokens_in} tokens in ──▶ ${finalData.tokens_out} tokens active. (${Math.round((1 - finalData.tokens_out / finalData.tokens_in) * 100)}% ratio decreased)`]);
      } else if (currentProgress === 80) {
        setSandboxLogs(prev => [...prev, "[SERIALIZE] Context structured into secure mailbox JSON state payload!"]);
      } else if (currentProgress === 100) {
        clearInterval(interval);
        setSandboxStage("done");
        setSandboxLogs(prev => [...prev, "[SUCCESS] Cold-restart migration metadata payload successfully generated!"]);
      }
    }, 250);
  };

  const currentPayloadJSON = JSON.stringify(activeSandboxData, null, 2);

  // Helper code adapters
  const getAgentCodeRepresentation = () => {
    if (activeSandboxAgent === "Cursor") {
      return JSON.stringify({
        "cursor.rules": {
          "mailboxId": activeSandboxData.mailbox_id,
          "projectTopic": activeSandboxData.topic,
          "factRules": activeSandboxData.critical_facts.map((f: string) => `Constraint/Fact Rule: ${f}`),
          "activeFiles": activeSandboxData.active_files,
          "lastVerifiedCommand": activeSandboxData.last_executed_cmd,
          "mcpSyncUrl": "http://localhost:3000/api/mailbox/sync"
        }
      }, null, 2);
    } else if (activeSandboxAgent === "Claude Desktop") {
      return JSON.stringify({
        "mcpServers": {
          "agentsmcp-server": {
            "command": "npx",
            "args": ["-y", "agentsmcp-server"],
            "env": {
              "AGENTS_MCP_TOKEN": "************",
              "ACTIVE_MAILBOX_ID": activeSandboxData.mailbox_id,
              "PERSISTENT_TOPIC": activeSandboxData.topic
            }
          }
        }
      }, null, 2);
    } else if (activeSandboxAgent === "Antigravity") {
      return JSON.stringify({
        "skill": {
          "name": "agentsmcp-sync",
          "active": true,
          "mailboxId": activeSandboxData.mailbox_id,
          "context": {
            "topic": activeSandboxData.topic,
            "files": activeSandboxData.active_files,
            "criticalFacts": activeSandboxData.critical_facts
          }
        }
      }, null, 2);
    } else {
      return JSON.stringify({
        "models": { "active": "default" },
        "contextProviders": [
          {
            "name": "agentsmcp",
            "params": {
              "mailboxId": activeSandboxData.mailbox_id,
              "apiUrl": "https://api.agentsmcp.com/v1",
              "activeTopic": activeSandboxData.topic
            }
          }
        ]
      }, null, 2);
    }
  };

  // Hero Snippet Text
  const heroCode = `{
  "thread_id": "thread_8f29c1",
  "status": "restored",
  "last_active": "2026-05-21T16:43:29Z",
  "messages": 14,
  "context_tokens": 4096,
  "active_skills": ["agentsmcp-fs-reader", "workspace-sync"],
  "last_agent": "Cursor-agent",
  "current_agent": "Claude-Desktop"
}`;

  // How It Works snippets
  const step2Code = `import { AgentMailbox } from "agentsmcp";

// Initialize durable mailbox
const mailbox = new AgentMailbox({
  mailboxId: "RagavRida/agentsmcp",
  token: process.env.AGENTS_MCP_TOKEN
});

await mailbox.connect();`;

  const step3Code = `// Fetch continuous thread context
const { context, success } = await mailbox.receive();

if (success) {
  console.log(\`Restored \${context.messages.length} messages gracefully.\`);
}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] selection:bg-[#22c55e]/20 selection:text-[#22c55e] pb-24 font-sans">
      
      {/* HEADER */}
      <header className="py-6 border-b border-[#262626]">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12 flex justify-between items-center gap-4" id="site-header">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-[#e5e5e5] tracking-tight text-base uppercase">AgentMailbox</span>
            <span className="text-[10px] font-mono border border-[#262626] bg-[#121212] px-1.5 py-0.5 rounded-xs text-[#22c55e]">v0.1.4</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5 text-sm text-[#737373]">
            <a href="https://github.com/RagavRida/agentsmcp" target="_blank" rel="noopener noreferrer" className="hidden md:flex hover:text-[#e5e5e5] transition items-center gap-1">
              GitHub <ExternalLink size={12} />
            </a>
            <a href="https://www.npmjs.com/package/agentsmcp" target="_blank" rel="noopener noreferrer" className="hidden md:inline hover:text-[#e5e5e5] transition">
              npm
            </a>
            {hasSession ? (
              <a
                href="/dashboard"
                className="bg-[#22c55e] text-[#0a0a0a] hover:bg-[#1faa53] transition px-3 py-1.5 text-sm font-medium rounded-[4px] focus:outline-none"
                id="nav-dashboard"
              >
                Dashboard
              </a>
            ) : (
              <>
                <a
                  href={`${AGENTSMCP_API_BASE}/auth/github`}
                  className="inline-flex items-center gap-2 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-[#e5e5e5] px-3 py-1.5 rounded-[4px] text-sm font-medium transition"
                  id="nav-github"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.13c-3.2.69-3.87-1.36-3.87-1.36-.52-1.34-1.27-1.7-1.27-1.7-1.04-.71.08-.69.08-.69 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.73-1.53-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.15 1.18a10.97 10.97 0 015.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.77.11 3.06.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.26 5.69.41.36.78 1.06.78 2.13v3.16c0 .31.21.66.79.55C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
                  </svg>
                  <span className="hidden sm:inline">Sign in with GitHub</span>
                  <span className="sm:hidden">GitHub</span>
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24 max-w-[1100px] mx-auto px-6 md:px-12 block" id="section-hero">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Hero text */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <span className="text-[#22c55e] font-mono text-xs uppercase tracking-wider block font-semibold">
                Every agent has a mailbox. No agent ever starts cold.
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-semibold tracking-[-0.02em] leading-[1.1] text-[#e5e5e5]" id="hero-headline">
                Your context follows you. <br />
                <span className="text-[#737373]">Not the tool.</span>
              </h1>
            </div>
            
            <p className="text-base md:text-[18px] text-[#737373] leading-[1.6] max-w-xl" id="hero-subheadline">
              AgentMailbox is a context-sync protocol for AI agents. Durable threads, cold-restart by construction, and cross-platform continuity.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => handleCopy("npm install agentsmcp", "hero-install")}
                className="bg-[#22c55e] text-[#0a0a0a] hover:bg-[#1faa53] transition px-5 py-3 text-sm font-medium rounded-[4px] text-center flex items-center justify-center gap-2 focus:outline-none"
                id="btn-primary-install"
              >
                {copiedId === "hero-install" ? (
                  <>
                    <Check size={14} className="stroke-[3]" />
                    <span>Copied CLI command</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} className="opacity-85" />
                    <span>npm install agentsmcp</span>
                  </>
                )}
              </button>
              
              <a
                href="https://github.com/RagavRida/agentsmcp"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#262626] bg-[#121212]/30 hover:bg-[#121212] text-[#e5e5e5] hover:border-[#525252] transition px-5 py-3 text-sm font-medium rounded-[4px] text-center flex items-center justify-center gap-2 focus:outline-none"
                id="btn-secondary-github"
              >
                <span>View on GitHub</span>
                <ExternalLink size={14} className="opacity-80" />
              </a>
            </div>

            {/* Works with labels */}
            <div className="pt-6 space-y-3">
              <span className="text-[11px] font-mono tracking-wider text-[#525252] uppercase block">Works with</span>
              <div className="relative w-full overflow-hidden border border-[#262626] py-3 bg-[#121212]/20 rounded-[4px] select-none">
                <div className="animate-marquee gap-8 md:gap-12">
                  {/* First iteration */}
                  {worksWithList.map((item, idx) => (
                    <div key={`stream1-${idx}`} className="flex items-center gap-2.5 group cursor-default shrink-0 pr-4">
                      {item.icon}
                      <span className="text-xs md:text-sm text-[#737373] group-hover:text-[#e5e5e5] transition-colors duration-200 font-mono tracking-tight font-medium">
                        {item.name}
                      </span>
                    </div>
                  ))}
                  {/* Second iteration to tile seamlessly */}
                  {worksWithList.map((item, idx) => (
                    <div key={`stream2-${idx}`} className="flex items-center gap-2.5 group cursor-default shrink-0 pr-4">
                      {item.icon}
                      <span className="text-xs md:text-sm text-[#737373] group-hover:text-[#e5e5e5] transition-colors duration-200 font-mono tracking-tight font-medium">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Static terminal snippet */}
          <div className="lg:col-span-5 relative">
            <div className="flex items-center justify-between px-4 py-2 bg-[#121212] border border-b-0 border-[#262626] rounded-t-[4px]" id="terminal-header">
              <span className="text-xs font-mono text-[#525252]">agent.receive() output</span>
              <button
                onClick={() => handleCopy(heroCode, "hero-snippet")}
                className="text-[#525252] hover:text-[#e5e5e5] transition focus:outline-none p-1"
                title="Copy context state"
              >
                {copiedId === "hero-snippet" ? <Check size={13} className="text-[#22c55e]" /> : <Copy size={13} />}
              </button>
            </div>
            <pre className="border-l-2 border-[#22c55e] border-y border-r border-[#262626] p-5 font-mono text-sm bg-[#171717] text-[#e5e5e5] overflow-x-auto rounded-b-[4px]" id="hero-terminal-code">
              <code>{heroCode}</code>
            </pre>
            <div className="absolute -bottom-4 -right-4 -z-10 w-full h-full border border-dashed border-[#262626] pointer-events-none rounded-[4px]"></div>
          </div>

        </div>
      </section>

      {/* 2. PROBLEM SECTION */}
      <section className="py-24 max-w-[1100px] mx-auto px-6 md:px-12 border-t border-[#171717]" id="section-problem">
        <div className="space-y-12">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#e5e5e5]" id="problem-title">
              Context dies. Your agents start from zero.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="problem-cards-group">
            {/* Card 1 */}
            <div className="border border-[#262626] p-6 bg-[#0a0a0a] rounded-[4px] space-y-3 flex flex-col justify-between" id="problem-card-1">
              <div className="space-y-3">
                <span className="font-mono text-xs text-[#525252] block">01 / DISCONNECTED</span>
                <h3 className="text-lg font-medium text-[#e5e5e5] tracking-tight">Session Amnesia</h3>
                <p className="text-[#737373] text-sm leading-[1.6]">
                  Every new session starts blank. Cursor, Claude Desktop, Antigravity — none remember what happened last time.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="border border-[#262626] p-6 bg-[#0a0a0a] rounded-[4px] space-y-3 flex flex-col justify-between" id="problem-card-2">
              <div className="space-y-3">
                <span className="font-mono text-xs text-[#525252] block">02 / SILOED</span>
                <h3 className="text-lg font-medium text-[#e5e5e5] tracking-tight">Framework Lock-in</h3>
                <p className="text-[#737373] text-sm leading-[1.6]">
                  AutoGen, CrewAI, LangGraph all have messaging, but none interoperate. Your agents are trapped inside respective stacks.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="border border-[#262626] p-6 bg-[#0a0a0a] rounded-[4px] space-y-3 flex flex-col justify-between" id="problem-card-3">
              <div className="space-y-3">
                <span className="font-mono text-xs text-[#525252] block">03 / INNEFICIENT</span>
                <h3 className="text-lg font-medium text-[#e5e5e5] tracking-tight">Manual Context Transfer</h3>
                <p className="text-[#737373] text-sm leading-[1.6]">
                  Copy-pasting summaries between tools. Maintaining <code className="font-mono text-[13px] bg-[#171717] px-1 text-[#e5e5e5]">MEMORY.md</code> files by hand. It does not scale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOLUTION SECTION */}
      <section className="py-24 max-w-[1100px] mx-auto px-6 md:px-12 border-t border-[#171717]" id="section-solution">
        <div className="space-y-12">
          <div className="flex items-center gap-3">
            <span className="text-[#22c55e] font-mono text-xs">◆</span>
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#e5e5e5]" id="solution-title">
              One primitive. Every agent. Every restart.
            </h2>
          </div>

          <div className="p-6 md:p-8 bg-[#121212]/40 border border-[#262626] rounded-[4px]" id="solution-diagram-container">
            {/* Stack on mobile, inline flex schema on desktop */}
            <div className="text-xs md:text-sm font-mono space-y-6 md:space-y-0 md:flex md:items-center md:justify-between tracking-tight text-[#737373]">
              
              <div className="bg-[#171717] px-4 py-3 border border-[#262626] rounded-[2px] flex flex-col gap-1 min-w-[150px]">
                <span className="text-[10px] text-[#525252]">Active Tool (9am)</span>
                <span className="font-semibold text-[#e5e5e5]">Cursor</span>
              </div>

              <div className="flex flex-col items-center justify-center py-1 px-4 text-center md:flex-1">
                <span className="text-[#22c55e] font-semibold text-sm">──▶</span>
                <span className="text-[10px] uppercase font-mono tracking-wider pt-1 hover:text-[#e5e5e5]">State Sync</span>
              </div>

              <div className="bg-[#121212] px-5 py-4 border border-[#22c55e] rounded-[2px] flex flex-col gap-1 min-w-[200px] shadow-[0_0_15px_rgba(34,197,94,0.03)]">
                <span className="text-[10px] text-[#22c55e] font-semibold tracking-wide uppercase">AgentMailbox Server</span>
                <span className="font-semibold text-[#e5e5e5]">Durable Thread DB</span>
              </div>

              <div className="flex flex-col items-center justify-center py-1 px-4 text-center md:flex-1">
                <span className="text-[#22c55e] font-semibold text-sm">──▶</span>
                <span className="text-[10px] uppercase font-mono tracking-wider pt-1 hover:text-[#e5e5e5]">Hydre State</span>
              </div>

              <div className="bg-[#171717] px-4 py-3 border border-[#262626] rounded-[2px] flex flex-col gap-1 min-w-[170px]">
                <span className="text-[10px] text-[#525252]">Next Session (Lunch)</span>
                <span className="font-semibold text-[#e5e5e5]">Claude Desktop</span>
              </div>

              <div className="flex flex-col items-center justify-center py-1 px-4 text-center md:flex-1">
                <span className="text-[#22c55e] font-semibold text-sm">──▶</span>
                <span className="text-[10px] uppercase font-mono tracking-wider pt-1 hover:text-[#e5e5e5]">Continue</span>
              </div>

              <div className="bg-[#171717] px-4 py-3 border border-[#262626] rounded-[2px] flex flex-col gap-1 min-w-[150px]">
                <span className="text-[10px] text-[#525252]">Later Session (Evening)</span>
                <span className="font-semibold text-[#e5e5e5]">Antigravity</span>
              </div>

            </div>
          </div>

          <p className="text-sm uppercase tracking-wider text-[#22c55e] font-semibold block pt-2" id="solution-tagline">
            Every message carries the thread's full state.
          </p>
        </div>
      </section>

      {/* INTERACTIVE PROTOCOL PLAYGROUND SANDBOX */}
      <section className="py-24 max-w-[1100px] mx-auto px-6 md:px-12 border-t border-[#171717]" id="section-sandbox-playground">
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[#22c55e] font-mono text-xs uppercase tracking-wider block font-semibold flex items-center gap-1.5">
                <Sparkles size={12} className="animate-pulse" />
                Live Interactive Protocol Simulator
              </span>
              <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#e5e5e5]" id="sandbox-heading">
                Interactive Protocol Sandbox
              </h2>
              <p className="text-[#737373] text-sm max-w-xl">
                Simulate how the AgentMailbox engine ingests a long interactive session query, runs the local fact-compactor, and automatically builds compliant configuration rules for another agent.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Controls Column */}
            <div className="lg:col-span-12 xl:col-span-5 flex flex-col justify-between border border-[#262626] bg-[#121212]/15 p-6 rounded-[4px] space-y-6">
              <div className="space-y-4">
                <span className="text-[11px] font-mono tracking-wider text-[#525252] uppercase block">1. Select or input a system thread prompt</span>
                
                {/* Preset selectors */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
                  {(Object.keys(sandboxPresets) as Array<keyof typeof sandboxPresets>).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSandboxPreset(key);
                        setSandboxStage("idle");
                        setSandboxProgress(0);
                        setSandboxLogs([]);
                      }}
                      className={`text-xs font-mono py-2 px-1.5 rounded-[3px] border transition focus:outline-none ${
                        sandboxPreset === key
                          ? "bg-[#22c55e]/10 border-[#22c55e] text-[#22c55e] font-medium"
                          : "border-[#262626] text-[#737373] hover:border-[#525252] hover:text-[#e5e5e5]"
                      }`}
                    >
                      {sandboxPresets[key].name}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setSandboxPreset("custom");
                      setSandboxStage("idle");
                      setSandboxProgress(0);
                      setSandboxLogs([]);
                    }}
                    className={`text-xs font-mono py-2 px-1.5 rounded-[3px] border transition focus:outline-none ${
                      sandboxPreset === "custom"
                        ? "bg-[#22c55e]/10 border-[#22c55e] text-[#22c55e] font-medium"
                        : "border-[#262626] text-[#737373] hover:border-[#525252] hover:text-[#e5e5e5]"
                    }`}
                  >
                    Custom Prompt
                  </button>
                </div>

                {/* Prompt display/textarea */}
                {sandboxPreset !== "custom" ? (
                  <div className="p-4 bg-[#0a0a0a] border border-[#262626] rounded-[3px] text-xs text-[#737373] italic font-sans leading-relaxed min-h-[90px]">
                    "{sandboxPresets[sandboxPreset].prompt}"
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Type a custom query (e.g., 'Update database with new oauth login and test endpoint server.py')"
                      className="w-full bg-[#0a0a0a] border border-[#262626] rounded-[3px] p-3 text-xs text-[#e5e5e5] placeholder-[#525252] outline-none focus:border-[#525252] transition min-h-[90px] font-sans resize-none"
                    />
                  </div>
                )}

                {/* Simulation trigger */}
                <div className="pt-2">
                  <button
                    onClick={runSimulation}
                    disabled={sandboxStage === "compressing" || (sandboxPreset === "custom" && !customPrompt.trim())}
                    className="w-full bg-[#22c55e] text-[#0a0a0a] hover:bg-[#1faa53] disabled:opacity-40 disabled:cursor-not-allowed transition py-2.5 px-4 text-xs font-medium rounded-[3px] flex items-center justify-center gap-2 font-mono uppercase tracking-wider focus:outline-none"
                  >
                    {sandboxStage === "compressing" ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Compacting Thread...</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} fill="currentColor" />
                        <span>Run Protocol Pipeline</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress and status logger */}
              <div className="space-y-3 pt-4 border-t border-[#262626]/60">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider">
                  <span className="text-[#525252]">Engine Pipeline Logs</span>
                  <span className={`${sandboxStage === "done" ? "text-[#22c55e]" : sandboxStage === "compressing" ? "text-yellow-500" : "text-[#737373]"}`}>
                    {sandboxStage === "done" ? "COMPLETED" : sandboxStage === "compressing" ? `${sandboxProgress}% COMPRESSING` : "STANDBY"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-[#262626] rounded-full overflow-hidden">
                  <div 
                    className="bg-[#22c55e] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${sandboxProgress}%` }}
                  />
                </div>

                {/* Log terminal logs display */}
                <div className="bg-[#0a0a0a] border border-[#262626] p-3 rounded-[3px] font-mono text-[10px] text-[#737373] h-[130px] overflow-y-auto space-y-1.5 scrollbar-none">
                  {sandboxLogs.length === 0 ? (
                    <div className="text-[#525252] italic">Waiting to simulate core agent mail compaction flow...</div>
                  ) : (
                    sandboxLogs.map((log, idx) => (
                      <div key={idx} className={log.includes("[SUCCESS]") ? "text-[#22c55e]" : log.includes("[FACTOR]") ? "text-purple-400" : ""}>
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Serialization Visualization Column */}
            <div className="lg:col-span-12 xl:col-span-7 flex flex-col justify-between border border-[#262626] bg-[#121212]/5 p-6 rounded-[4px] space-y-6">
              {sandboxStage !== "done" ? (
                // Standby visualization
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 min-h-[300px]">
                  <div className="p-4 bg-[#121212] border border-dashed border-[#262626] rounded-full relative">
                    <Database size={28} className="text-[#525252] animate-pulse" />
                    <Sparkles size={12} className="absolute top-2 right-2 text-[#22c55e]/40" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#e5e5e5]">Ready for state simulation</h4>
                    <p className="text-xs text-[#737373] max-w-xs mx-auto">
                      Press <span className="text-[#e5e5e5] font-semibold">Run Protocol Pipeline</span> to witness the local AST summarizer convert input contexts down by up to ~80% footprint volume.
                    </p>
                  </div>
                </div>
              ) : (
                // Finished visual results pane
                <div className="flex-1 flex flex-col space-y-6">
                  
                  {/* Performance metrics row */}
                  <div className="grid grid-cols-3 gap-3 border-b border-[#262626]/40 pb-4">
                    <div className="p-2 bg-[#121212]/60 border border-[#262626] rounded-[3px] text-center">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-[#525252] block">Tokens In</span>
                      <span className="text-sm font-mono text-[#e5e5e5] font-semibold">{activeSandboxData.tokens_in}</span>
                    </div>
                    <div className="p-2 bg-[#121212]/60 border border-[#262626] rounded-[3px] text-center">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-[#525252] block">Tokens Out</span>
                      <span className="text-sm font-mono text-[#22c55e] font-semibold">{activeSandboxData.tokens_out}</span>
                    </div>
                    <div className="p-2 bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-[3px] text-center">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-[#22c55e]/60 block flex items-center justify-center gap-1">
                        Volume Saved
                      </span>
                      <span className="text-xs font-mono text-[#22c55e] font-bold">
                        -{Math.round((1 - activeSandboxData.tokens_out / activeSandboxData.tokens_in) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Dual pane visualizer: Mailbox Payload on left, Target output on right */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Compacted Mailbox Output */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-[#121212] px-3 py-1.5 border border-[#262626] border-b-0 rounded-t-[3px]">
                        <span className="text-[9px] font-mono text-[#525252] uppercase font-bold flex items-center gap-1">
                          <Database size={10} className="text-[#22c55e]" /> Compacted Mailbox
                        </span>
                        <button
                          onClick={() => handleCopy(currentPayloadJSON, "sandbox-json")}
                          className="text-[#525252] hover:text-[#e5e5e5] transition focus:outline-none p-0.5"
                          title="Copy Mailbox JSON"
                        >
                          {copiedId === "sandbox-json" ? <Check size={11} className="text-[#22c55e]" /> : <Copy size={11} />}
                        </button>
                      </div>
                      <pre className="border border-[#262626] p-3 font-mono text-[10px] bg-[#171717]/60 text-[#737373] rounded-b-[3px] h-[220px] overflow-y-auto scrollbar-none">
                        <code>{currentPayloadJSON}</code>
                      </pre>
                    </div>

                    {/* Restored Target Agent Payload Output */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-[#121212] px-3 py-1.5 border border-[#262626] border-b-0 rounded-t-[3px] overflow-x-auto whitespace-nowrap">
                        <div className="flex gap-1.5 scrollbar-none mr-2">
                          {["Cursor", "Claude Desktop", "Antigravity", "Continue"].map((agent) => (
                            <button
                              key={agent}
                              onClick={() => {
                                setActiveSandboxAgent(agent as any);
                              }}
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded transition focus:outline-none ${
                                activeSandboxAgent === agent
                                  ? "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/20"
                                  : "text-[#525252] hover:text-[#e5e5e5]"
                              }`}
                            >
                              {agent}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => handleCopy(getAgentCodeRepresentation(), "sandbox-agent")}
                          className="text-[#525252] hover:text-[#e5e5e5] transition focus:outline-none p-0.5"
                          title="Copy Target Config"
                        >
                          {copiedId === "sandbox-agent" ? <Check size={11} className="text-[#22c55e]" /> : <Copy size={11} />}
                        </button>
                      </div>
                      <pre className="border border-[#262626] p-3 font-mono text-[10px] bg-[#171717]/60 text-[#737373] rounded-b-[3px] h-[220px] overflow-y-auto scrollbar-none">
                        <code>{getAgentCodeRepresentation()}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Flow footer line explaining state recovery code */}
                  <div className="p-3 bg-[#121212]/30 border border-[#262626]/40 rounded-[3px] text-[10px] text-[#737373] leading-relaxed flex items-center gap-2">
                    <span className="shrink-0 font-mono text-[9px] bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] px-1 py-0.5 rounded">HANDOFF RECOVERY</span>
                    <span>
                      The target schema above gets automatically injected into your downstream workspace settings so <strong className="text-white">{activeSandboxAgent}</strong> instantly inherits historical session state facts.
                    </span>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section className="py-24 max-w-[1100px] mx-auto px-6 md:px-12 border-t border-[#171717]" id="section-features">
        <div className="space-y-12">
          <div>
            <span className="text-[#525252] font-mono text-xs block mb-2">SPECS & PROTOCOL RULES</span>
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#e5e5e5]" id="features-title">
              Built specifically for autonomous systems.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 gap-y-16 pt-4" id="features-grid">
            
            <div className="space-y-2 border-l border-[#262626] pl-4" id="feature-1">
              <h3 className="font-medium text-[#e5e5e5] text-base">Cold-Restart by Construction</h3>
              <p className="text-[#737373] text-sm leading-[1.6]">
                Crash mid-task, resume on restart. The thread IS the state. No volatile process dependencies left dangling.
              </p>
            </div>

            <div className="space-y-2 border-l border-[#262626] pl-4" id="feature-2">
              <h3 className="font-medium text-[#e5e5e5] text-base">Email Semantics for Agents</h3>
              <p className="text-[#737373] text-sm leading-[1.6]">
                TO / CC / BCC / ReplyAll. Orchestrators delegate context smoothly, observers stay fully informed without interrupting executions.
              </p>
            </div>

            <div className="space-y-2 border-l border-[#262626] pl-4" id="feature-3">
              <h3 className="font-medium text-[#e5e5e5] text-base">Context Compression</h3>
              <p className="text-[#737373] text-sm leading-[1.6]">
                Threads grow, context windows do not. Older messages automatically fold into highly structured, semantically grouped summaries.
              </p>
            </div>

            <div className="space-y-2 border-l border-[#262626] pl-4" id="feature-4">
              <h3 className="font-medium text-[#e5e5e5] text-base">Cross-Platform Skills</h3>
              <p className="text-[#737373] text-sm leading-[1.6]">
                Native skill extensions for Cursor, Antigravity, and Claude Code. Install once, leverage your shared state history globally.
              </p>
            </div>

            <div className="space-y-2 border-l-2 border-[#22c55e] pl-4" id="feature-5">
              <span className="text-[10px] font-mono bg-[#22c55e]/10 px-1.5 py-0.5 rounded text-[#22c55e] border border-[#22c55e]/20 tracking-wide uppercase inline-block mb-1">Standard</span>
              <h3 className="font-medium text-[#e5e5e5] text-base">MCP Native</h3>
              <p className="text-[#737373] text-sm leading-[1.6]">
                Any MCP-aware client becomes a compliant, synchronized sync peer automatically. 8 tools, 2 schemas, zero extra integration code.
              </p>
            </div>

            <div className="space-y-2 border-l border-[#262626] pl-4" id="feature-6">
              <h3 className="font-medium text-[#e5e5e5] text-base">Multi-Language SDKs</h3>
              <p className="text-[#737373] text-sm leading-[1.6]">
                Highly tailored JavaScript/TypeScript and Python clients. Consistent functional API parity. Fully MIT licensed and audited.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section className="py-24 max-w-[1100px] mx-auto px-6 md:px-12 border-t border-[#171717]" id="section-how-it-works">
        <div className="space-y-16">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#e5e5e5]" id="how-it-works-title">
            Integration in three steps
          </h2>

          <div className="space-y-16" id="how-it-works-steps">
            
            {/* Step 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12" id="step-1-layout">
              <div className="lg:col-span-4 space-y-2">
                <span className="font-mono text-[36px] font-semibold text-[#22c55e] block leading-none">01</span>
                <h3 className="text-lg font-medium text-[#e5e5e5]">Install Protocol System</h3>
                <p className="text-[#737373] text-sm leading-relaxed">
                  Install the primary SDK package along with the local mailbox orchestrator server.
                </p>
              </div>
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between px-4 py-2 bg-[#121212] border border-b-0 border-[#262626] rounded-t-[4px]">
                  <span className="text-xs font-mono text-[#525252]">Shell CLI</span>
                  <button
                    onClick={() => handleCopy("npm install agentsmcp && npx agentsmcp-server", "install-step")}
                    className="text-[#525252] hover:text-[#e5e5e5] transition focus:outline-none p-1"
                  >
                    {copiedId === "install-step" ? <Check size={13} className="text-[#22c55e]" /> : <Copy size={13} />}
                  </button>
                </div>
                <pre className="border border-[#262626] p-5 font-mono text-sm bg-[#171717] text-[#e5e5e5] overflow-x-auto rounded-b-[4px]">
                  <code>npm install agentsmcp && npx agentsmcp-server</code>
                </pre>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12" id="step-2-layout">
              <div className="lg:col-span-4 space-y-2">
                <span className="font-mono text-[36px] font-semibold text-[#22c55e] block leading-none">02</span>
                <h3 className="text-lg font-medium text-[#e5e5e5]">Connect & Sync Instance</h3>
                <p className="text-[#737373] text-sm leading-relaxed">
                  Establish a secure context bridge referencing the appropriate thread partition key.
                </p>
              </div>
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between px-4 py-2 bg-[#121212] border border-b-0 border-[#262626] rounded-t-[4px]">
                  <span className="text-xs font-mono text-[#525252]">TypeScript (TypeScript/Node)</span>
                  <button
                    onClick={() => handleCopy(step2Code, "step2-code")}
                    className="text-[#525252] hover:text-[#e5e5e5] transition focus:outline-none p-1"
                  >
                    {copiedId === "step2-code" ? <Check size={13} className="text-[#22c55e]" /> : <Copy size={13} />}
                  </button>
                </div>
                <pre className="border-l-2 border-[#22c55e] border-y border-r border-[#262626] p-5 font-mono text-sm bg-[#171717] text-[#e5e5e5] overflow-x-auto rounded-b-[4px]">
                  <code>{step2Code}</code>
                </pre>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12" id="step-3-layout">
              <div className="lg:col-span-4 space-y-2">
                <span className="font-mono text-[36px] font-semibold text-[#22c55e] block leading-none">03</span>
                <h3 className="text-lg font-medium text-[#e5e5e5]">Restore Continuity State</h3>
                <p className="text-[#737373] text-sm leading-relaxed">
                  Call the asynchronous receive agent parameters to fully hydrate previous message histories into execution prompts.
                </p>
              </div>
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between px-4 py-2 bg-[#121212] border border-b-0 border-[#262626] rounded-t-[4px]">
                  <span className="text-xs font-mono text-[#525252]">TypeScript (Hydration Context)</span>
                  <button
                    onClick={() => handleCopy(step3Code, "step3-code")}
                    className="text-[#525252] hover:text-[#e5e5e5] transition focus:outline-none p-1"
                  >
                    {copiedId === "step3-code" ? <Check size={13} className="text-[#22c55e]" /> : <Copy size={13} />}
                  </button>
                </div>
                <pre className="border border-[#262626] p-5 font-mono text-sm bg-[#171717] text-[#e5e5e5] overflow-x-auto rounded-b-[4px]">
                  <code>{step3Code}</code>
                </pre>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. CROSS-PLATFORM SECTION */}
      <section className="py-24 max-w-[1100px] mx-auto px-6 md:px-12 border-t border-[#171717]" id="section-cross-platform">
        <div className="space-y-12">
          <div>
            <span className="text-[#525252] font-mono text-xs block mb-2">INTEGRATION STRATEGY</span>
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#e5e5e5]" id="cross-platform-title">
              One install. Every platform.
            </h2>
          </div>

          <div className="border border-[#262626] rounded-[4px] bg-[#121212]/20 divide-y divide-[#262626]" id="platform-commands-list">
            
            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-4 font-mono text-sm text-[#e5e5e5] font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                Antigravity / Gemini
              </div>
              <div className="md:col-span-8 font-mono text-xs text-[#737373] bg-[#171717]/50 p-3 rounded border border-[#262626]/40 flex justify-between items-center overflow-x-auto">
                <code>npx skills add RagavRida/agentsmcp</code>
                <button
                  onClick={() => handleCopy("npx skills add RagavRida/agentsmcp", "cmd-anti")}
                  className="text-[#525252] hover:text-[#e5e5e5] transition ml-4 shrink-0 focus:outline-none"
                >
                  {copiedId === "cmd-anti" ? <Check size={12} className="text-[#22c55e]" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-4 font-mono text-sm text-[#e5e5e5] font-medium">
                Cursor
              </div>
              <div className="md:col-span-8 text-sm text-[#737373]">
                Copy context rules directory configuration files to <code className="font-mono text-xs bg-[#171717] px-1.5 py-0.5 border border-[#262626]/60 rounded text-[#e5e5e5]">.cursor/rules/</code>
              </div>
            </div>

            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-4 font-mono text-sm text-[#e5e5e5] font-medium">
                Claude Desktop
              </div>
              <div className="md:col-span-8 text-sm text-[#737373]">
                Add MCP custom adapter configuration mapping directly into <code className="font-mono text-xs bg-[#171717] px-1.5 py-0.5 border border-[#262626]/60 rounded text-[#e5e5e5]">claude_desktop_config.json</code>
              </div>
            </div>

            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-4 font-mono text-sm text-[#e5e5e5] font-medium">
                Claude Code
              </div>
              <div className="md:col-span-8 text-sm text-[#737373]">
                Add MCP dynamic configuration to system global configuration settings
              </div>
            </div>

            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-4 font-mono text-sm text-[#e5e5e5] font-medium">
                Continue
              </div>
              <div className="md:col-span-8 text-sm text-[#737373]">
                Same unified MCP client config adapter mappings
              </div>
            </div>

            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-4 font-mono text-sm text-[#e5e5e5] font-medium">
                Python Env
              </div>
              <div className="md:col-span-8 font-mono text-xs text-[#737373] bg-[#171717]/50 p-3 rounded border border-[#262626]/40 flex justify-between items-center overflow-x-auto">
                <code>pip install agentsmcp</code>
                <button
                  onClick={() => handleCopy("pip install agentsmcp", "cmd-py")}
                  className="text-[#525252] hover:text-[#e5e5e5] transition ml-4 shrink-0 focus:outline-none"
                >
                  {copiedId === "cmd-py" ? <Check size={12} className="text-[#22c55e]" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. PROTOCOL STACK SECTION */}
      <section className="py-24 max-w-[1100px] mx-auto px-6 md:px-12 border-t border-[#171717]" id="section-protocol-stack">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[#525252] font-mono text-xs uppercase tracking-wider block">Network Architecture</span>
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#e5e5e5]" id="protocol-stack-title">
              The missing layer in the agent stack
            </h2>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <div className="border border-[#262626] rounded-[4px] p-6 space-y-4 bg-[#121212]/10" id="protocol-stack-layers">
              
              <div className="flex items-start gap-4">
                <span className="font-mono text-xs text-[#525252] mt-1 pt-0.5">LAYER 4</span>
                <div>
                  <h4 className="font-semibold text-sm text-[#737373] tracking-wide">A2A Protocol</h4>
                  <p className="text-[#525252] text-xs">Agent ↔ Agent Discovery Scheme (Google / Linux Foundation)</p>
                </div>
              </div>

              <div className="border-t border-[#262626] pt-4 flex items-start gap-4">
                <span className="font-mono text-xs text-[#22c55e] mt-1 pt-0.5">LAYER 3</span>
                <div>
                  <h4 className="font-bold text-sm text-[#22c55e] tracking-wide flex items-center gap-2">
                    AgentMailbox
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                  </h4>
                  <p className="text-[#e5e5e5] text-xs font-medium">Agent ↔ Agent Durable Context Protocol Layer</p>
                </div>
              </div>

              <div className="border-t border-[#262626] pt-4 flex items-start gap-4">
                <span className="font-mono text-xs text-[#525252] mt-1 pt-0.5">LAYER 2</span>
                <div>
                  <h4 className="font-semibold text-sm text-[#737373] tracking-wide">MCP Protocol</h4>
                  <p className="text-[#525252] text-xs">Agent ↔ Tool Integration Architecture (Anthropic)</p>
                </div>
              </div>

              <div className="border-t border-[#262626] pt-4 flex items-start gap-4">
                <span className="font-mono text-xs text-[#525252] mt-1 pt-0.5">LAYER 1</span>
                <div>
                  <h4 className="font-semibold text-sm text-[#737373] tracking-wide">AG-UI</h4>
                  <p className="text-[#525252] text-xs">Agent ↔ User Complex Frontend Orchestrations (CopilotKit)</p>
                </div>
              </div>

            </div>

            <p className="text-sm italic text-[#737373] text-center md:text-left" id="protocol-summary-phrase">
              "A2A finds. MCP acts. <span className="text-[#e5e5e5] font-medium not-italic">AgentMailbox remembers.</span>"
            </p>
          </div>

        </div>
      </section>

      {/* 8. COMPARISON SECTION */}
      <section className="py-24 max-w-[1100px] mx-auto px-6 md:px-12 border-t border-[#171717]" id="section-comparison">
        <div className="space-y-12">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#e5e5e5]" id="comparison-title">
            Comparative Matrix
          </h2>

          <div className="overflow-x-auto border border-[#262626] rounded-[4px] bg-[#0a0a0a]" id="comparison-table-wrapper">
            <table className="w-full text-left border-collapse font-sans text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[#262626] bg-[#121212]/30 text-[#737373] font-mono">
                  <th className="p-4 font-medium tracking-wide">Feature</th>
                  <th className="p-4 font-semibold text-[#e5e5e5] text-center bg-[#171717]/60">AgentMailbox</th>
                  <th className="p-4 font-medium text-center">Google A2A</th>
                  <th className="p-4 font-medium text-center">AutoGen</th>
                  <th className="p-4 font-medium text-center">CrewAI</th>
                  <th className="p-4 font-medium text-center">LangGraph</th>
                  <th className="p-4 font-medium text-center">Memory MCP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626] text-[#737373]">
                <tr>
                  <td className="p-4 text-[#e5e5e5] font-medium">Cross-Framework</td>
                  <td className="p-4 text-[#22c55e] font-semibold text-center bg-[#171717]/30">Yes</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                </tr>
                <tr>
                  <td className="p-4 text-[#e5e5e5] font-medium">Persistent Threads</td>
                  <td className="p-4 text-[#22c55e] font-semibold text-center bg-[#171717]/30">Yes</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                </tr>
                <tr>
                  <td className="p-4 text-[#e5e5e5] font-medium">Context Compression</td>
                  <td className="p-4 text-[#22c55e] font-semibold text-center bg-[#171717]/30">Yes</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                </tr>
                <tr>
                  <td className="p-4 text-[#e5e5e5] font-medium">Cold-Restart</td>
                  <td className="p-4 text-[#22c55e] font-semibold text-center bg-[#171717]/30">Yes</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                </tr>
                <tr>
                  <td className="p-4 text-[#e5e5e5] font-medium">MCP-Native</td>
                  <td className="p-4 text-[#22c55e] font-semibold text-center bg-[#171717]/30">Yes</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                </tr>
                <tr>
                  <td className="p-4 text-[#e5e5e5] font-medium">Email Semantics</td>
                  <td className="p-4 text-[#22c55e] font-semibold text-center bg-[#171717]/30">Yes</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                  <td className="p-4 text-center">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 9. PRICING SECTION */}
      <section className="py-24 max-w-[1100px] mx-auto px-6 md:px-12 border-t border-[#171717]" id="section-pricing">
        <div className="space-y-12">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#e5e5e5]" id="pricing-title">
            Simple, honest pricing model
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#262626] border-y border-[#262626] py-8 md:py-12" id="pricing-grid">
            
            {/* Free */}
            <div className="py-6 md:py-2 md:px-8 first:pl-0 space-y-6 flex flex-col justify-between" id="tier-free">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-[#e5e5e5]">Free</h3>
                  <p className="text-[#737373] text-xs font-mono uppercase mt-1">Self-Hosted Community</p>
                </div>
                <div className="text-2xl font-semibold text-[#e5e5e5]">
                  $0 <span className="text-xs text-[#737373] font-normal">/ forever</span>
                </div>
                <ul className="text-sm text-[#737373] col-span-1 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#22c55e]"></span>
                    Full developer SDK (TS & Python)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#22c55e]"></span>
                    Native sync MCP Adapter
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#22c55e]"></span>
                    Persistent SQLite architecture
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#22c55e]"></span>
                    Unlimited local active agents
                  </li>
                </ul>
              </div>
              <div className="pt-4">
                <a href="https://github.com/RagavRida/agentsmcp" target="_blank" rel="noopener noreferrer" className="text-[#22c55e] hover:text-[#1faa53] text-sm font-medium tracking-tight transition inline-flex items-center gap-1.5 focus:outline-none">
                  Get Started →
                </a>
              </div>
            </div>

            {/* Cloud Pro */}
            <div className="py-6 md:py-2 px-0 md:px-8 space-y-6 flex flex-col justify-between" id="tier-cloud">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-[#e5e5e5]">Cloud Pro</h3>
                  <p className="text-[#737373] text-xs font-mono uppercase mt-1">Managed Context Protocol</p>
                </div>
                <div className="text-2xl font-semibold text-[#e5e5e5]">
                  $29 <span className="text-xs text-[#737373] font-normal">/ month</span>
                </div>
                <ul className="text-sm text-[#737373] space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#525252]"></span>
                    Managed server (99.9% SLG)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#525252]"></span>
                    Continuous LLM-based compression
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#525252]"></span>
                    Durable Postgres synchronization
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#525252]"></span>
                    Up to 50 active agents & webhooks
                  </li>
                </ul>
              </div>
              <div className="pt-4 text-sm text-[#525252] font-medium uppercase font-mono tracking-wide">
                Coming Soon
              </div>
            </div>

            {/* Enterprise */}
            <div className="py-6 md:py-2 px-0 md:pl-8 space-y-6 flex flex-col justify-between" id="tier-enterprise">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-[#e5e5e5]">Enterprise</h3>
                  <p className="text-[#737373] text-xs font-mono uppercase mt-1">Dedicated Multi-tenant</p>
                </div>
                <div className="text-2xl font-semibold text-[#e5e5e5]">
                  Custom <span className="text-xs text-[#737373] font-normal">/ dynamic</span>
                </div>
                <ul className="text-sm text-[#737373] space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#525252]"></span>
                    Isolated dedicated cloud infrastructure
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#525252]"></span>
                    Security SSO & IAM integration
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#525252]"></span>
                    Real-time transaction compliance logs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#525252]"></span>
                    SOC2 Type II validation schemas
                  </li>
                </ul>
              </div>
              <div className="pt-4">
                <a href="mailto:22.691raghavendra@gmail.com" className="text-[#e5e5e5] hover:text-[#22c55e] text-sm font-medium tracking-tight transition inline-flex items-center gap-1.5 focus:outline-none">
                  Contact Us →
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 10. OPEN SOURCE SECTION */}
      <section className="py-24 max-w-[1100px] mx-auto px-6 md:px-12 border-t border-[#171717]" id="section-open-source">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          <div className="lg:col-span-5 space-y-4">
            <span className="text-[#525252] font-mono text-xs uppercase tracking-wider block">MIT License Structure</span>
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#e5e5e5]" id="open-source-title">
              MIT Licensed. <br />Fully Open Source.
            </h2>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="open-source-links">
              
              <a href="https://github.com/RagavRida/agentsmcp" target="_blank" rel="noopener noreferrer" className="border border-[#262626] p-5 hover:border-[#525252] rounded-[4px] transition block bg-[#121212]/10" id="link-github">
                <span className="text-xs font-mono text-[#525252] block mb-1">REPOSITORIES</span>
                <span className="font-medium text-[#e5e5e5] hover:text-[#22c55e] transition text-sm">GitHub</span>
                <span className="text-xs text-[#737373] block mt-1">RagavRida/agentsmcp</span>
              </a>

              <a href="https://www.npmjs.com/package/agentsmcp" target="_blank" rel="noopener noreferrer" className="border border-[#262626] p-5 hover:border-[#525252] rounded-[4px] transition block bg-[#121212]/10" id="link-npm">
                <span className="text-xs font-mono text-[#525252] block mb-1">PACKAGE managers</span>
                <span className="font-medium text-[#e5e5e5] hover:text-[#22c55e] transition text-sm">npm</span>
                <span className="text-xs text-[#737373] block mt-1">agentsmcp</span>
              </a>

              <a href="https://pypi.org/project/agentsmcp" target="_blank" rel="noopener noreferrer" className="border border-[#262626] p-5 hover:border-[#525252] rounded-[4px] transition block bg-[#121212]/10" id="link-pypi">
                <span className="text-xs font-mono text-[#525252] block mb-1">DURABLE DISTRIBUTION</span>
                <span className="font-medium text-[#e5e5e5] hover:text-[#22c55e] transition text-sm">PyPI</span>
                <span className="text-xs text-[#737373] block mt-1">agentsmcp</span>
              </a>

            </div>

            <div className="bg-[#121212]/30 border-l-2 border-[#262626] p-4 text-sm text-[#737373]" id="contributing-text">
              <span className="text-xs font-mono text-[#525252] block mb-1">CONTRIBUTING SCHEMAS</span>
              "Looking for: compressor adapters, storage adapters, framework adapters, real-world demos."
            </div>
          </div>

        </div>
      </section>

      {/* 11. FOOTER SECTION */}
      <footer className="pt-24 max-w-[1100px] mx-auto px-6 md:px-12 border-t border-[#171717]" id="section-footer">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12" id="footer-layout">
          
          <div className="md:col-span-6 space-y-4">
            <span className="font-semibold text-lg hover:text-[#22c55e] transition text-[#e5e5e5] block">AgentMailbox</span>
            <p className="text-xs text-[#525252] font-mono leading-relaxed max-w-sm">
              Built by RagavRida. <br />
              All rights reserved. Standard MIT license definitions.
            </p>
          </div>

          <div className="md:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono text-[#525252] block">NEWSLETTER DEPLOYMENTS</span>
              <p className="text-sm text-[#737373] leading-relaxed">
                Receive lightweight protocol updates and schema specifications. Single mail alerts only.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 items-stretch max-w-md" id="newsletter-form">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter workspace email address"
                className="bg-[#121212]/40 border border-[#262626] px-4 py-3 placeholder-[#525252] focus:outline-none focus:border-[#525252] text-sm text-[#e5e5e5] flex-1 rounded-none outline-none transition"
              />
              <button
                type="submit"
                className="text-[#22c55e] hover:text-[#1faa53] text-sm font-semibold px-4 py-3 transition border border-[#262626] bg-[#0a0a0a] rounded-none cursor-pointer focus:outline-none"
              >
                {isSubscribed ? "Subscribed ✔" : "Subscribe"}
              </button>
            </form>
            {isSubscribed && (
              <p className="text-xs text-[#22c55e] font-mono">
                Successfully subscribed your agent-mailbox adapter!
              </p>
            )}
          </div>

        </div>

        <div className="border-t border-[#171717] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#525252] font-mono" id="footer-bottom-links">
          <div className="flex flex-wrap gap-4 md:gap-6 justify-center sm:justify-start">
            <a href="https://github.com/RagavRida/agentsmcp" target="_blank" rel="noopener noreferrer" className="hover:text-[#e5e5e5] transition">GitHub</a>
            <span className="hidden sm:inline">·</span>
            <a href="https://www.npmjs.com/package/agentsmcp" target="_blank" rel="noopener noreferrer" className="hover:text-[#e5e5e5] transition">npm</a>
            <span className="hidden sm:inline">·</span>
            <a href="https://pypi.org/project/agentsmcp" target="_blank" rel="noopener noreferrer" className="hover:text-[#e5e5e5] transition">PyPI</a>
            <span className="hidden sm:inline">·</span>
            <span className="cursor-not-allowed hover:text-[#e5e5e5] transition" title="Documentation is packaged directly within the npm package">Docs</span>
            <span className="hidden sm:inline">·</span>
            <span className="cursor-not-allowed hover:text-[#e5e5e5] transition" title="Skills system definition index">Skills.sh</span>
            <span className="hidden sm:inline">·</span>
            <a href="https://github.com/RagavRida/agentsmcp/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:text-[#e5e5e5] transition">License</a>
          </div>
          <div>
            <span>© 2026 AgentMailbox Protocol</span>
          </div>
        </div>
      </footer>

      {/* AUTH MODAL — triggered from nav (Sign in / Get API Key) */}
      {authModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAuthModal();
          }}
        >
          <div className="relative w-full max-w-md bg-[#0d0d0d] border border-[#262626] rounded-[6px] shadow-2xl shadow-black/40 p-6 md:p-8" id="auth-modal">

            {/* Close X */}
            <button
              type="button"
              onClick={closeAuthModal}
              className="absolute top-4 right-4 text-[#525252] hover:text-[#e5e5e5] transition focus:outline-none"
              aria-label="Close"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-[#262626] -mx-6 md:-mx-8 px-6 md:px-8" id="auth-tabs">
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className={`px-3 py-2 text-sm font-medium transition border-b-2 focus:outline-none ${
                  authMode === "signup"
                    ? "text-[#e5e5e5] border-[#22c55e]"
                    : "text-[#737373] border-transparent hover:text-[#a3a3a3]"
                }`}
              >
                Sign up
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("signin")}
                className={`px-3 py-2 text-sm font-medium transition border-b-2 focus:outline-none ${
                  authMode === "signin"
                    ? "text-[#e5e5e5] border-[#22c55e]"
                    : "text-[#737373] border-transparent hover:text-[#a3a3a3]"
                }`}
              >
                Sign in
              </button>
            </div>

            {authMode === "signup" ? (
              !signupKey ? (
                <>
                  <h2 id="auth-modal-title" className="text-xl font-medium tracking-tight text-[#e5e5e5] mb-2">
                    Get your free API key
                  </h2>
                  <p className="text-sm text-[#737373] mb-5">
                    No credit card. 10 agents · 500 messages/day · 7-day retention.
                  </p>
                  <form onSubmit={handleSignup} className="space-y-3" id="signup-form">
                    <input
                      id="signup-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      disabled={signupLoading}
                      autoFocus
                      className="w-full bg-[#0a0a0a] border border-[#262626] rounded-[4px] px-3 py-2.5 text-sm text-[#e5e5e5] placeholder:text-[#525252] focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={signupLoading || !signupEmail.trim()}
                      className="w-full bg-[#22c55e] text-[#0a0a0a] hover:bg-[#1faa53] transition px-5 py-2.5 text-sm font-medium rounded-[4px] flex items-center justify-center gap-2 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {signupLoading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4"/>
                            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                          </svg>
                          <span>Generating…</span>
                        </>
                      ) : (
                        <>Get Free API Key</>
                      )}
                    </button>
                  </form>
                  {signupError && (
                    <p className="mt-3 text-sm text-[#ef4444] font-mono" id="signup-error">
                      {signupError}
                    </p>
                  )}
                  <p className="mt-4 text-xs text-[#525252] font-mono">
                    We email your key once — no marketing.
                  </p>
                </>
              ) : (
                <div className="space-y-4" id="signup-result">
                  <div className="flex items-center gap-2 text-[#22c55e] font-mono text-xs uppercase tracking-wider">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Account created</span>
                  </div>
                  <p className="text-sm text-[#e5e5e5]">Your API key:</p>
                  <div className="bg-[#0a0a0a] border border-[#22c55e]/50 rounded-[4px] p-3 flex items-center gap-2">
                    <code className="font-mono text-xs text-[#22c55e] break-all flex-1">
                      {signupKey}
                    </code>
                    <button
                      onClick={handleCopyKey}
                      className="shrink-0 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 rounded-[4px] px-3 py-1.5 text-xs font-medium transition flex items-center gap-1.5 focus:outline-none"
                      aria-label="Copy API key"
                    >
                      {keyCopied ? (
                        <>
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#f59e0b] font-mono flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>Save this key — it won't be shown again.</span>
                  </p>
                  <div className="border-t border-[#262626] pt-4 space-y-2">
                    <p className="text-xs text-[#737373] font-mono uppercase tracking-wider">Next steps</p>
                    <ul className="text-sm text-[#a3a3a3] space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-[#22c55e]">→</span>
                        <a href="https://github.com/RagavRida/agentsmcp#cursor" target="_blank" rel="noopener noreferrer" className="hover:text-[#e5e5e5] transition">
                          Cursor — paste into MCP settings
                        </a>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#22c55e]">→</span>
                        <a href="https://github.com/RagavRida/agentsmcp#claude-desktop" target="_blank" rel="noopener noreferrer" className="hover:text-[#e5e5e5] transition">
                          Claude Desktop — edit claude_desktop_config.json
                        </a>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#22c55e]">→</span>
                        <a href="https://github.com/RagavRida/agentsmcp#python" target="_blank" rel="noopener noreferrer" className="hover:text-[#e5e5e5] transition">
                          Python / TypeScript SDK
                        </a>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={resetSignup}
                    className="text-xs text-[#525252] font-mono hover:text-[#737373] transition focus:outline-none"
                  >
                    Register another account →
                  </button>
                </div>
              )
            ) : (
              // ----- Sign In tab -----
              !signinUser ? (
                <>
                  <h2 id="auth-modal-title" className="text-xl font-medium tracking-tight text-[#e5e5e5] mb-2">
                    Sign in with your API key
                  </h2>
                  <p className="text-sm text-[#737373] mb-5">
                    Paste your <code className="font-mono text-[#22c55e]">sk_live_</code> key to view your account and usage.
                  </p>
                  <form onSubmit={handleSignIn} className="space-y-3" id="signin-form">
                    <input
                      id="signin-key"
                      type="password"
                      required
                      autoComplete="off"
                      spellCheck={false}
                      placeholder="sk_live_..."
                      value={signinKey}
                      onChange={(e) => setSigninKey(e.target.value)}
                      disabled={signinLoading}
                      autoFocus
                      className="w-full font-mono bg-[#0a0a0a] border border-[#262626] rounded-[4px] px-3 py-2.5 text-sm text-[#e5e5e5] placeholder:text-[#525252] focus:outline-none focus:border-[#22c55e]/50 focus:ring-1 focus:ring-[#22c55e]/30 transition disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={signinLoading || !signinKey.trim()}
                      className="w-full bg-[#22c55e] text-[#0a0a0a] hover:bg-[#1faa53] transition px-5 py-2.5 text-sm font-medium rounded-[4px] flex items-center justify-center gap-2 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {signinLoading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4"/>
                            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                          </svg>
                          <span>Verifying…</span>
                        </>
                      ) : (
                        <>Sign in</>
                      )}
                    </button>
                  </form>
                  {signinError && (
                    <p className="mt-3 text-sm text-[#ef4444] font-mono" id="signin-error">
                      {signinError}
                    </p>
                  )}
                  <p className="mt-4 text-xs text-[#525252] font-mono">
                    Lost your key? Switch to <button type="button" onClick={() => setAuthMode("signup")} className="text-[#22c55e] hover:underline focus:outline-none">Sign up</button> and register a new account.
                  </p>
                </>
              ) : (
                <div className="space-y-4" id="signin-result">
                  <div className="flex items-center gap-2 text-[#22c55e] font-mono text-xs uppercase tracking-wider">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Signed in</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-[#e5e5e5]">{signinUser.email}</p>
                    <p className="text-xs text-[#737373] font-mono uppercase tracking-wider">{signinUser.plan} plan</p>
                  </div>

                  <div className="border-t border-[#262626] pt-4 grid grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="text-[#737373] font-mono uppercase">Agents</p>
                      <p className="text-[#e5e5e5] font-medium">
                        {signinUser.usage.agents}
                        <span className="text-[#525252]"> / {signinUser.usage.maxAgents}</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[#737373] font-mono uppercase">Threads</p>
                      <p className="text-[#e5e5e5] font-medium">
                        {signinUser.usage.threads}
                        <span className="text-[#525252]"> / {signinUser.usage.maxThreads}</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[#737373] font-mono uppercase">Msgs today</p>
                      <p className="text-[#e5e5e5] font-medium">
                        {signinUser.usage.messagesToday}
                        <span className="text-[#525252]"> / {signinUser.usage.maxMessagesPerDay}</span>
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#262626] pt-4 space-y-2">
                    <p className="text-xs text-[#737373] font-mono uppercase tracking-wider">
                      Thread dashboard
                    </p>
                    <p className="text-sm text-[#a3a3a3]">
                      Visual view of your agents, threads, and messages is coming soon. For now your data lives behind the API.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSigninUser(null);
                      setSigninKey("");
                    }}
                    className="text-xs text-[#525252] font-mono hover:text-[#737373] transition focus:outline-none"
                  >
                    Sign in with another key →
                  </button>
                </div>
              )
            )}

          </div>
        </div>
      )}

    </div>
  );
}
