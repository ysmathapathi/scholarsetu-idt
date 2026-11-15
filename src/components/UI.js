import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoadingScreen({ label = "Loading…" }) {
  return <div className="loading-screen" role="status"><span className="spinner" />{label}</div>;
}

export function InlineLoader() {
  return <span className="inline-loader" role="status">Loading…</span>;
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state-card error-state" role="alert">
      <strong>We couldn’t load this information.</strong>
      <p>{error || "Please try again in a moment."}</p>
      {onRetry && <button className="button button-secondary button-small" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", children, action }) {
  return <div className="state-card empty-state"><span className="empty-mark" aria-hidden="true">—</span><h2>{title}</h2>{children && <p>{children}</p>}{action}</div>;
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="page-header">
      <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export function Breadcrumbs({ items }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb"><ol>{items.map((item, index) => <li key={`${item.label}-${index}`}>{index < items.length - 1 ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav>;
}

export function FormField({ label, id, error, hint, children, required }) {
  return <div className={`form-field${error ? " has-error" : ""}`}><label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>{children}{hint && <small className="field-hint">{hint}</small>}{error && <small className="field-error" role="alert">{error}</small>}</div>;
}

export function StatusBadge({ status }) {
  const labels = {
    eligible: "Eligible", not_eligible: "Not eligible", needs_more_information: "Needs more information",
    needs_review: "Needs review", open: "Open", upcoming: "Upcoming", closed: "Closed",
    unknown: "Status unavailable", published: "Published", draft: "Draft", archived: "Archived",
    interested: "Interested", preparing_documents: "Preparing documents", ready_to_apply: "Ready to apply",
    applied: "Applied", awaiting_result: "Awaiting result", awarded: "Awarded",
    not_selected: "Not selected", withdrawn: "Withdrawn", verified: "Verified",
    outdated: "Outdated", needs_review_source: "Needs review",
  };
  const key = String(status || "unknown").toLowerCase();
  return <span className={`status-badge status-${key}`}>{labels[key] || String(status || "Unknown").replaceAll("_", " ")}</span>;
}

export function DeadlineLabel({ deadline }) {
  if (!deadline) return <span className="muted">Deadline not available</span>;
  const date = new Date(`${deadline}T00:00:00`);
  if (Number.isNaN(date.getTime())) return <span className="muted">Deadline not available</span>;
  return <span>Deadline: {date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>;
}

export function SourceVerificationLabel({ source }) {
  if (!source) return <span className="muted">Source details unavailable</span>;
  const verified = source.verificationStatus || source.verification_status || "unknown";
  const checkedAt = source.lastCheckedAt || source.last_checked_at;
  return <span className="source-label"><StatusBadge status={verified} />{checkedAt ? ` Checked ${new Date(checkedAt).toLocaleDateString()}` : " Check date unavailable"}</span>;
}

export function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(onClose, 4500);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);
  return message ? <div className="toast" role="status">{message}<button aria-label="Dismiss message" onClick={onClose}>×</button></div> : null;
}

export function ConfirmDialog({ title, message, confirmLabel = "Confirm", onConfirm, onCancel, busy }) {
  return <div className="dialog-backdrop" role="presentation"><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><h2 id="dialog-title">{title}</h2><p>{message}</p><div className="dialog-actions"><button className="button button-secondary" onClick={onCancel} disabled={busy}>Cancel</button><button className="button button-danger" onClick={onConfirm} disabled={busy}>{busy ? "Please wait…" : confirmLabel}</button></div></section></div>;
}

const studentLinks = [
  ["Overview", "/dashboard"], ["Find Scholarships", "/scholarships"], ["My Matches", "/matches"],
  ["Saved", "/saved"], ["Application Tracker", "/applications"], ["Notifications", "/notifications"],
  ["My Profile", "/my-profile"], ["Settings", "/settings"],
];
const adminLinks = [
  ["Overview", "/admin"], ["Scholarships", "/admin/scholarships"],
  ["Discovery Review", "/admin/discovered"], ["Sources", "/admin/sources"], ["Audit Log", "/admin/audit"],
];

export function PublicHeader() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return <header className="public-header"><div className="header-inner"><Link className="brand" to="/" aria-label="ScholarSetu home"><span className="brand-mark">S</span>ScholarSetu</Link><button className="menu-toggle" aria-expanded={open} aria-label="Toggle navigation" onClick={() => setOpen(!open)}>☰</button><nav className={open ? "public-nav nav-open" : "public-nav"} aria-label="Main navigation"><NavLink to="/">Home</NavLink><NavLink to="/scholarships">Explore Scholarships</NavLink><NavLink to="/how-it-works">How It Works</NavLink><NavLink to="/about">About</NavLink>{user ? <><Link className="button button-secondary button-small" to="/dashboard">My account</Link><button className="text-button" onClick={async () => { await signOut(); navigate("/"); }}>Sign out</button></> : <><Link to="/login">Log in</Link><Link className="button button-primary button-small" to="/register">Create account</Link></>}</nav></div></header>;
}

export function PublicFooter() {
  return <footer className="public-footer"><div className="footer-inner"><div><Link className="brand" to="/"><span className="brand-mark">S</span>ScholarSetu</Link><p className="footer-note">Find the support that helps you move forward.</p></div><div className="footer-links"><Link to="/about">About</Link><Link to="/how-it-works">How it works</Link><Link to="/privacy">Privacy</Link><Link to="/contact">Contact</Link></div><p className="disclaimer">ScholarSetu is an independent discovery tool and is not a government portal. Always verify requirements and apply through the official provider.</p><small>© {new Date().getFullYear()} ScholarSetu</small></div></footer>;
}

function Sidebar({ links, title, closeDrawer }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  return <aside className="app-sidebar"><Link to="/" className="brand"><span className="brand-mark">S</span>ScholarSetu</Link><p className="sidebar-label">{title}</p><nav aria-label={`${title} navigation`}>{links.map(([label, path]) => <NavLink key={path} to={path} end={path === "/admin" || path === "/dashboard"} onClick={closeDrawer}>{label}</NavLink>)}</nav><button className="sidebar-signout" onClick={async () => { await signOut(); navigate("/"); }}>Sign out</button></aside>;
}

export function StudentAppShell({ children }) {
  const [drawer, setDrawer] = useState(false);
  const { user } = useAuth();
  return <div className="app-shell"><div className={drawer ? "drawer-backdrop drawer-open" : "drawer-backdrop"} onClick={() => setDrawer(false)} aria-hidden="true" /><Sidebar links={studentLinks} title="Student workspace" closeDrawer={() => setDrawer(false)} /><div className="app-main"><header className="app-topbar"><button className="menu-toggle app-menu-toggle" onClick={() => setDrawer(!drawer)} aria-label="Open navigation" aria-expanded={drawer}>☰</button><span>Student workspace</span><Link to="/my-profile" className="user-chip">{user?.name || user?.fullName || user?.email || "My account"}</Link></header><main className="app-content">{children}</main></div>{drawer && <div className="mobile-sidebar"><Sidebar links={studentLinks} title="Student workspace" closeDrawer={() => setDrawer(false)} /></div>}</div>;
}

export function AdminAppShell({ children }) {
  const [drawer, setDrawer] = useState(false);
  return <div className="app-shell admin-shell"><div className={drawer ? "drawer-backdrop drawer-open" : "drawer-backdrop"} onClick={() => setDrawer(false)} aria-hidden="true" /><Sidebar links={adminLinks} title="Administration" closeDrawer={() => setDrawer(false)} /><div className="app-main"><header className="app-topbar"><button className="menu-toggle app-menu-toggle" onClick={() => setDrawer(!drawer)} aria-label="Open navigation" aria-expanded={drawer}>☰</button><span>Administration</span><span className="admin-flag">Admin workspace</span></header><main className="app-content">{children}</main></div>{drawer && <div className="mobile-sidebar"><Sidebar links={adminLinks} title="Administration" closeDrawer={() => setDrawer(false)} /></div>}</div>;
}

export function PublicLayout({ children }) {
  return <><PublicHeader /><main>{children}</main><PublicFooter /></>;
}

export function useAsyncAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const run = async (action, successMessage) => {
    setBusy(true); setError(""); setSuccess("");
    try {
      const result = await action();
      if (successMessage) setSuccess(successMessage);
      return result;
    } catch (err) {
      setError(err.message || "The request could not be completed.");
      return null;
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, success, run, setError, setSuccess };
}

export function usePageTitle(title) {
  useEffect(() => { document.title = title ? `${title} | ScholarSetu` : "ScholarSetu"; }, [title]);
}

export function useReturnTo() {
  const location = useLocation();
  return `${location.pathname}${location.search}`;
}
