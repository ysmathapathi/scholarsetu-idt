import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api, asArray } from "../services/api";
import { DeadlineLabel, EmptyState, ErrorState, FormField, PageHeader, SourceVerificationLabel, StatusBadge, useAsyncAction, usePageTitle } from "../components/UI";
import { useAuth } from "../context/AuthContext";

function useResource(path, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => { setLoading(true); setError(""); api.get(path).then(setData).catch((err) => setError(err.message)).finally(() => setLoading(false)); };
  useEffect(load, [path, ...dependencies]);
  return { data, loading, error, load, setData };
}

function DataState({ loading, error, onRetry, data, emptyTitle, children }) {
  if (loading) return <div className="skeleton-list"><span /><span /><span /></div>;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!data || (Array.isArray(data) && data.length === 0)) return <EmptyState title={emptyTitle}>{children}</EmptyState>;
  return null;
}

export function DashboardPage() {
  usePageTitle("Overview");
  const { user } = useAuth();
  const { data, loading, error, load } = useResource("/dashboard");
  const summary = data?.summary || data?.counts || {};
  const actions = [
    ["Eligible matches", summary.eligibleMatches ?? summary.eligible_matches, "/matches?status=eligible"],
    ["Need more information", summary.needsMoreInformation ?? summary.needs_more_information, "/matches?status=needs_more_information"],
    ["Saved scholarships", summary.saved ?? summary.savedCount, "/saved"],
    ["Upcoming deadlines", summary.upcomingDeadlines ?? summary.upcoming_deadlines, "/applications"],
  ];
  return <><PageHeader eyebrow="Student workspace" title={`Welcome${user?.name || user?.fullName ? `, ${user.name || user.fullName}` : ""}`} description="Your scholarship search, profile, and next steps in one place." actions={<Link className="button button-primary" to="/scholarships">Find scholarships</Link>} />{loading ? <div className="stat-grid">{[1, 2, 3, 4].map((n) => <span className="stat-skeleton" key={n} />)}</div> : error ? <ErrorState error={error} onRetry={load} /> : <><div className="stat-grid">{actions.map(([label, value, to]) => <Link className="stat-card" to={to} key={label}><span>{label}</span><strong>{value == null ? "—" : value}</strong>{value == null && <small>Count unavailable</small>}</Link>)}</div><section className="dashboard-section"><div className="section-title-row"><div><p className="eyebrow">Based on your profile</p><h2>Recommended matches</h2></div><Link to="/matches">View matches →</Link></div><DashboardScholarships items={asArray(data?.recommendedMatches || data?.matches)} /></section><section className="dashboard-section two-column-panels"><div className="plain-card"><h2>Upcoming deadlines</h2><DashboardDeadlines items={asArray(data?.upcomingDeadlinesList || data?.deadlines)} /></div><div className="plain-card"><h2>Your next step</h2><p>{data?.nextAction || "Review your profile to help make your scholarship search more relevant."}</p><Link className="text-link" to={data?.profileComplete ? "/matches" : "/my-profile"}>{data?.profileComplete ? "Review your matches →" : "Complete your profile →"}</Link></div></section></>}</>;
}

function DashboardScholarships({ items }) {
  return items.length ? <div className="compact-list">{items.slice(0, 4).map((item) => <div className="compact-item" key={item.id}><div><Link to={`/scholarships/${item.scholarshipId || item.id}`}>{item.title || item.scholarship?.title || "Scholarship details"}</Link><p>{item.explanation || item.scholarship?.provider || "Review the recorded requirements."}</p></div><StatusBadge status={item.status} /></div>)}</div> : <EmptyState title="No recommendations available"><span>Recommendations will appear when the service has profile and scholarship information to compare.</span></EmptyState>;
}

function DashboardDeadlines({ items }) {
  return items.length ? <ul className="simple-list">{items.map((item) => <li key={item.id}><Link to={`/scholarships/${item.scholarshipId || item.id}`}>{item.title || "Scholarship"}</Link><span><DeadlineLabel deadline={item.deadline || item.dates?.deadline} /></span></li>)}</ul> : <p className="muted">No upcoming deadlines are available.</p>;
}

const educationSteps = [
  { title: "Education", fields: [{ key: "domicileState", label: "State of domicile", hint: "This is your permanent/home state, not necessarily where you currently live." }, { key: "educationLevel", label: "Education level" }, { key: "institution", label: "Institution", optional: true }, { key: "course", label: "Course or stream" }, { key: "studyYear", label: "Current study year" }] },
  { title: "Academics", fields: [{ key: "qualifyingExam", label: "Qualifying exam", optional: true }, { key: "qualifyingExamYear", label: "Qualifying exam year", optional: true }, { key: "marks", label: "Marks or grade", optional: true }, { key: "gradingType", label: "Grading type", optional: true }] },
  { title: "Financial details", fields: [{ key: "annualFamilyIncome", label: "Annual family income", optional: true }] },
  { title: "Review", fields: [] },
];

function ProfileForm({ initial, onSave, saving, error, success, onCancel, editable = true }) {
  const [values, setValues] = useState(initial || {});
  useEffect(() => setValues(initial || {}), [initial]);
  const change = (event) => setValues({ ...values, [event.target.name]: event.target.value });
  return <form className="form-card profile-form" onSubmit={(event) => { event.preventDefault(); onSave(values); }}><div className="form-grid">{[
    ["fullName", "Full name"], ["email", "Email address"], ["domicileState", "State of domicile"], ["educationLevel", "Education level"], ["institution", "Institution"], ["course", "Course or stream"], ["studyYear", "Current study year"], ["qualifyingExam", "Qualifying exam"], ["qualifyingExamYear", "Qualifying exam year"], ["marks", "Marks or grade"], ["gradingType", "Grading type"], ["annualFamilyIncome", "Annual family income"],
  ].map(([key, label]) => <FormField key={key} id={`profile-${key}`} label={label} hint={key === "domicileState" ? "Your domicile may differ from your current residence." : undefined}><input id={`profile-${key}`} name={key} value={values[key] ?? ""} onChange={change} disabled={!editable} /></FormField>)}</div><p className="small-print">Unknown information can remain blank. Do not enter Aadhaar, bank details, external account passwords, or identity documents.</p>{error && <p className="form-error" role="alert">{error}</p>}{success && <p className="form-success" role="status">{success}</p>}{editable && <div className="form-actions"><button type="button" className="button button-secondary" onClick={onCancel}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button></div>}</form>;
}

export function OnboardingPage() {
  usePageTitle("Set up your profile");
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({});
  const [error, setError] = useState("");
  const { user, setUser } = useAuth();
  const { busy, error: saveError, success, run } = useAsyncAction();
  const current = educationSteps[step];
  const update = (key, value) => setValues({ ...values, [key]: value });
  const next = () => {
    const missing = current.fields.find((field) => !field.optional && !values[field.key]?.trim());
    if (missing) { setError(`${missing.label} is required. Choose “Not sure” if the field is unknown.`); return; }
    setError("");
    if (step < educationSteps.length - 1) setStep(step + 1);
  };
  const save = async () => {
    const result = await run(() => api.put("/users/profile", values), "Your profile has been saved.");
    if (result) {
      const profile = result.profile || result;
      setUser({ ...user, profileComplete: profile.profileComplete ?? profile.profile_complete ?? true });
      window.location.assign("/dashboard");
    }
  };
  return <><PageHeader eyebrow={`Step ${step + 1} of ${educationSteps.length}`} title="Set up your profile" description="Share only relevant details. Missing information stays blank; grades are never converted between scales." /><div className="progress-track" aria-label={`Step ${step + 1} of ${educationSteps.length}`}><span style={{ width: `${((step + 1) / educationSteps.length) * 100}%` }} /></div><div className="wizard-card"><h2>{current.title}</h2>{step < 3 ? <div className="form-grid">{current.fields.map((field) => <FormField key={field.key} id={`onboarding-${field.key}`} label={field.label} hint={field.hint || (field.optional ? "Optional — leave blank if unknown." : undefined)} required={!field.optional}><input id={`onboarding-${field.key}`} value={values[field.key] || ""} onChange={(event) => update(field.key, event.target.value)} /></FormField>)}</div> : <><p>Review your profile details before saving. Any information you left blank remains unknown.</p><dl className="review-list">{educationSteps.slice(0, 3).flatMap((group) => group.fields).map((field) => <div key={field.key}><dt>{field.label}</dt><dd>{values[field.key] || "Not provided"}</dd></div>)}</dl></>}{error && <p className="form-error" role="alert">{error}</p>}{saveError && <p className="form-error" role="alert">{saveError}</p>}{success && <p className="form-success" role="status">{success}</p>}<div className="form-actions">{step > 0 && <button className="button button-secondary" onClick={() => { setStep(step - 1); setError(""); }}>Back</button>}{step < 3 ? <button className="button button-primary" onClick={next}>Continue</button> : <button className="button button-primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save profile"}</button>}</div><p className="small-print">Sensitive additional criteria are not requested in this setup. Optional information may affect matching.</p></div></>;
}

export function ProfilePage() {
  usePageTitle("My profile");
  const { data, loading, error, load } = useResource("/users/profile");
  const { busy, error: saveError, success, run } = useAsyncAction();
  const [editing, setEditing] = useState(false);
  const profile = data?.profile || data;
  const save = async (values) => {
    const result = await run(() => api.put("/users/profile", values), "Profile updated. Scholarship results may change based on your updated details.");
    if (result) { setEditing(false); load(); }
  };
  return <><PageHeader eyebrow="Your information" title="My profile" description="Keep your details up to date. Changes can affect how opportunities compare with your profile." actions={profile && !loading && <button className="button button-primary" onClick={() => setEditing(true)}>Edit profile</button>} />{loading ? <div className="skeleton-list"><span /><span /><span /></div> : error ? <ErrorState error={error} onRetry={load} /> : <ProfileForm initial={profile || {}} onSave={save} saving={busy} error={saveError} success={success} onCancel={() => setEditing(false)} editable={editing} />}<div className="notice notice-spaced">To request account or data deletion, use the contact process. Data deletion tools are not available from this screen.</div></>;
}

const matchTabs = [["All", ""], ["Eligible", "eligible"], ["Needs more information", "needs_more_information"], ["Not eligible", "not_eligible"], ["Needs review", "needs_review"]];
export function MatchesPage() {
  usePageTitle("My matches");
  const location = useLocation();
  const initialStatus = new URLSearchParams(location.search).get("status") || "";
  const scholarshipId = new URLSearchParams(location.search).get("scholarship") || "";
  const [status, setStatus] = useState(initialStatus);
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (scholarshipId) query.set("scholarshipId", scholarshipId);
  const resultQuery = query.toString();
  const { data, loading, error, load } = useResource(`/eligibility/results${resultQuery ? `?${resultQuery}` : ""}`, [status, scholarshipId]);
  const items = asArray(data);
  return <><PageHeader eyebrow="Personalized discovery" title="My matches" description="Review the criteria comparison, including missing information and conditions that need confirmation." actions={<Link className="button button-secondary" to="/my-profile">Update profile</Link>} /><div className="tabs" role="tablist" aria-label="Filter match results">{matchTabs.map(([label, value]) => <button key={label} role="tab" aria-selected={status === value} className={status === value ? "tab active-tab" : "tab"} onClick={() => setStatus(value)}>{label}</button>)}</div><DataState loading={loading} error={error} onRetry={load} data={items} emptyTitle="No match results available"><span>Results will appear after the service compares your profile with recorded scholarship criteria.</span></DataState>{!loading && !error && items.length > 0 && <div className="match-list">{items.map((item) => <article className="match-card" key={`${item.scholarshipId || item.id}-${item.status}`}><div className="match-card-head"><div><p className="eyebrow">{item.provider || "Provider not specified"}</p><h2><Link to={`/scholarships/${item.scholarshipId || item.id}`}>{item.title || item.scholarship?.title || "Scholarship"}</Link></h2></div><StatusBadge status={item.status} /></div><p>{item.explanation || "The service did not provide an explanation."}</p>{item.status === "eligible" && <p className="notice">Based on the details in your profile and the criteria currently recorded, you appear to meet the listed requirements. The provider makes the final decision.</p>}<CriteriaGroup title="Satisfied criteria" items={item.satisfiedCriteria || item.satisfied_criteria} /><CriteriaGroup title="Failed criteria" items={item.failedCriteria || item.failed_criteria} /><CriteriaGroup title="Missing or unclear" items={item.missingCriteria || item.missing_criteria} /><div className="match-card-foot"><DeadlineLabel deadline={item.deadline || item.scholarship?.dates?.deadline} /><SourceVerificationLabel source={item.source || item.scholarship?.source} /><Link className="text-link" to={`/scholarships/${item.scholarshipId || item.id}`}>Details →</Link></div></article>)}</div>}</>;
}

function CriteriaGroup({ title, items }) {
  if (!Array.isArray(items) || !items.length) return null;
  return <section className="criteria-group"><h3>{title}</h3><ul>{items.map((item, index) => <li key={`${item.field || "criteria"}-${index}`}><strong>{item.field ? `${item.field}: ` : ""}</strong>{item.message || item.description || String(item)}</li>)}</ul></section>;
}

export function SavedPage() {
  usePageTitle("Saved scholarships");
  const { data, loading, error, load } = useResource("/saved");
  const { busy, error: actionError, run } = useAsyncAction();
  const items = asArray(data).map((item) => item.scholarship || item);
  const remove = async (id) => { const result = await run(() => api.delete(`/saved/${encodeURIComponent(id)}`), "Scholarship removed from saved items."); if (result !== null) load(); };
  return <><PageHeader eyebrow="Your shortlist" title="Saved scholarships" description="Bookmark opportunities to return to them later. Saving does not submit an application." /><DataState loading={loading} error={error} onRetry={load} data={items} emptyTitle="No saved scholarships yet"><span>Save a scholarship from the directory to keep it here.</span></DataState>{actionError && <p className="form-error" role="alert">{actionError}</p>}{!loading && !error && items.length > 0 && <div className="saved-list">{items.map((item) => <article className="saved-item" key={item.id}><div><p className="eyebrow">{item.provider || "Provider not specified"}</p><h2><Link to={`/scholarships/${item.id}`}>{item.title || "Scholarship"}</Link></h2><StatusBadge status={item.status} /><p><DeadlineLabel deadline={item.deadline || item.dates?.deadline} /></p></div><button className="button button-secondary button-small" onClick={() => remove(item.id)} disabled={busy}>Remove saved</button></article>)}</div>}</>;
}

const applicationStatuses = ["interested", "preparing_documents", "ready_to_apply", "applied", "awaiting_result", "awarded", "not_selected", "withdrawn"];
export function ApplicationsPage() {
  usePageTitle("Application tracker");
  const { data, loading, error, load } = useResource("/applications");
  const items = asArray(data);
  const [filter, setFilter] = useState("");
  const { busy, error: actionError, run } = useAsyncAction();
  const updateStatus = async (item, status) => { const result = await run(() => api.put(`/applications/${encodeURIComponent(item.id)}`, { status }), "Tracker status updated."); if (result) load(); };
  const visible = filter ? items.filter((item) => item.status === filter) : items;
  return <><PageHeader eyebrow="Your own records" title="Application tracker" description="Track your own application progress. Provider decisions are not synchronized unless an authorized integration is available." actions={<Link className="button button-primary" to="/saved">Choose a saved scholarship</Link>} /><FormField label="Filter by status" id="application-filter"><select id="application-filter" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">All statuses</option>{applicationStatuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></FormField><p className="small-print">Do not enter sensitive identity or bank details in notes.</p><DataState loading={loading} error={error} onRetry={load} data={visible} emptyTitle="No tracked applications"><span>Add an opportunity to your tracker from a scholarship detail or saved item when the service supports it.</span></DataState>{actionError && <p className="form-error" role="alert">{actionError}</p>}{!loading && !error && visible.length > 0 && <div className="table-wrap"><table><thead><tr><th>Scholarship</th><th>Your status</th><th>Deadline</th><th>Actions</th></tr></thead><tbody>{visible.map((item) => <tr key={item.id}><td><Link to={`/scholarships/${item.scholarshipId || item.scholarship?.id}`}>{item.title || item.scholarship?.title || "Scholarship"}</Link></td><td><StatusBadge status={item.status} /></td><td><DeadlineLabel deadline={item.deadline || item.scholarship?.deadline} /></td><td><select aria-label={`Update status for ${item.title || "application"}`} value={item.status || "interested"} disabled={busy} onChange={(event) => updateStatus(item, event.target.value)}>{applicationStatuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></td></tr>)}</tbody></table></div>}</>;
}

export function NotificationsPage() {
  usePageTitle("Notifications");
  const { data, loading, error, load } = useResource("/notifications");
  const items = asArray(data);
  const { busy, error: actionError, run } = useAsyncAction();
  const markRead = async (item) => { const result = await run(() => api.put(`/notifications/${encodeURIComponent(item.id)}/read`, {}), "Notification marked as read."); if (result) load(); };
  const markAll = async () => { const result = await run(() => api.put("/notifications/read-all", {}), "Notifications marked as read."); if (result) load(); };
  return <><PageHeader eyebrow="Updates" title="Notifications" description="See account updates and reminders returned by the service." actions={items.some((item) => !item.read) && <button className="button button-secondary" onClick={markAll} disabled={busy}>Mark all read</button>} />{actionError && <p className="form-error" role="alert">{actionError}</p>}<DataState loading={loading} error={error} onRetry={load} data={items} emptyTitle="You’re all caught up"><span>Notifications will appear here when the service provides them.</span></DataState>{!loading && !error && items.length > 0 && <div className="notification-list">{items.map((item) => <article className={item.read ? "notification-item" : "notification-item unread"} key={item.id}><div><h2>{item.title || "Update"}</h2><p>{item.message || "Notification details unavailable."}</p><small>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "Time unavailable"}</small></div><div>{item.link && <Link className="text-link" to={item.link}>View →</Link>}{!item.read && <button className="text-button" onClick={() => markRead(item)} disabled={busy}>Mark read</button>}</div></article>)}</div>}</>;
}

export function SettingsPage() {
  usePageTitle("Settings");
  const { user, signOut } = useAuth();
  const { busy, error, success, run } = useAsyncAction();
  return <><PageHeader eyebrow="Account" title="Settings" description="Manage account access and review how your information is used." /><section className="settings-card"><h2>Account details</h2><dl className="review-list"><div><dt>Name</dt><dd>{user?.name || user?.fullName || "Not available"}</dd></div><div><dt>Email</dt><dd>{user?.email || "Not available"}</dd></div></dl></section><section className="settings-card"><h2>Password</h2><p>Password changes are not configured in this frontend. Use the supported account recovery flow.</p><Link to="/forgot-password" className="text-link">Reset password →</Link></section><section className="settings-card"><h2>Privacy and data</h2><p>Review the draft privacy information, or contact the service about data correction or deletion.</p><div className="inline-links"><Link to="/privacy">Privacy information</Link><Link to="/contact">Contact</Link></div><p className="small-print">Data export and account deletion are not enabled here.</p></section><section className="settings-card"><h2>Sign out</h2><p>End this session on this device.</p>{error && <p className="form-error" role="alert">{error}</p>}{success && <p className="form-success" role="status">{success}</p>}<button className="button button-secondary" disabled={busy} onClick={() => run(() => signOut(), "You have signed out.")}>{busy ? "Signing out…" : "Sign out"}</button></section></>;
}
