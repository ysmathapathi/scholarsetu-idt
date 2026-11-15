import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, asArray, safeExternalUrl } from "../services/api";
import { EmptyState, ErrorState, FormField, PageHeader, StatusBadge, useAsyncAction, usePageTitle } from "../components/UI";

function useAdminResource(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => { setLoading(true); setError(""); api.get(path).then(setData).catch((err) => setError(err.message)).finally(() => setLoading(false)); };
  useEffect(load, [path]);
  return { data, loading, error, load };
}

function AdminDataState({ loading, error, data, retry, title, children }) {
  if (loading) return <div className="skeleton-list"><span /><span /><span /></div>;
  if (error) return <ErrorState error={error} onRetry={retry} />;
  if (!data?.length) return <EmptyState title={title}>{children}</EmptyState>;
  return null;
}

export function AdminDashboardPage() {
  usePageTitle("Admin overview");
  const { data, loading, error, load } = useAdminResource("/admin/overview");
  const counts = data?.counts || data || {};
  const metrics = [["Active scholarships", counts.activeScholarships ?? counts.active_scholarships], ["Review needed", counts.reviewNeeded ?? counts.review_needed], ["Outdated or expired", counts.outdatedOrExpired ?? counts.outdated_or_expired], ["Discoveries awaiting review", counts.discoveriesAwaitingReview ?? counts.discoveries_awaiting_review], ["Source failures", counts.sourceFailures ?? counts.source_failures]];
  return <><PageHeader eyebrow="Administration" title="Overview" description="Review current service data and items requiring authorized attention." />{loading ? <div className="stat-grid">{metrics.map(([label]) => <span className="stat-skeleton" key={label} />)}</div> : error ? <ErrorState error={error} onRetry={load} /> : <><div className="stat-grid admin-stat-grid">{metrics.map(([label, value]) => <div className="stat-card" key={label}><span>{label}</span><strong>{value == null ? "—" : value}</strong>{value == null && <small>Count unavailable</small>}</div>)}</div><section className="dashboard-section"><div className="section-title-row"><h2>Recent updates</h2><Link to="/admin/audit">View audit log →</Link></div><AdminTable rows={asArray(data?.recentUpdates || data?.recent_updates)} columns={["timestamp", "action", "record", "admin"]} /></section><section className="quick-links"><Link className="plain-card" to="/admin/scholarships">Manage scholarships →</Link><Link className="plain-card" to="/admin/discovered">Review discoveries →</Link><Link className="plain-card" to="/admin/sources">Source registry →</Link></section></>}</>;
}

function AdminTable({ rows, columns, actions }) {
  if (!rows.length) return <p className="muted">No records returned by the service.</p>;
  return <div className="table-wrap"><table><thead><tr>{columns.map((column) => <th key={column}>{column.replaceAll("_", " ")}</th>)}{actions && <th>Actions</th>}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id || index}>{columns.map((column) => <td key={column}>{column === "status" ? <StatusBadge status={row[column]} /> : row[column] ?? "—"}</td>)}{actions && <td>{actions(row)}</td>}</tr>)}</tbody></table></div>;
}

export function AdminScholarshipsPage() {
  usePageTitle("Manage scholarships");
  const [query, setQuery] = useState("");
  const { data, loading, error, load } = useAdminResource(`/admin/scholarships${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  const rows = asArray(data);
  return <><PageHeader eyebrow="Administration" title="Scholarships" description="Review and manage opportunity records. Prefer archive over destructive deletion." actions={<Link className="button button-primary" to="/admin/scholarships/new">Create scholarship</Link>} /><label className="search-box admin-search"><span aria-hidden="true">⌕</span><span className="sr-only">Search scholarships</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title or provider" /></label><AdminDataState loading={loading} error={error} data={rows} retry={load} title="No scholarship records"><span>Records from the connected administration service will appear here.</span></AdminDataState>{!loading && !error && rows.length > 0 && <AdminTable rows={rows} columns={["title", "provider", "status", "deadline", "lastVerifiedAt", "updatedAt"]} actions={(row) => <Link to={`/admin/scholarships/${row.id}`}>Edit</Link>} />}</>;
}

const emptyScholarship = { title: "", provider: "", summary: "", description: "", type: "", sourceUrl: "", applicationUrl: "", status: "draft", educationLevels: "", courses: "", states: "", deadline: "", benefitAmount: "", benefitCurrency: "INR", verificationStatus: "unknown" };
export function AdminScholarshipFormPage() {
  const { id } = useParams();
  const creating = !id || id === "new";
  usePageTitle(creating ? "Create scholarship" : "Edit scholarship");
  const [values, setValues] = useState(emptyScholarship);
  const [loading, setLoading] = useState(!creating);
  const [loadError, setLoadError] = useState("");
  const [confirmPublish, setConfirmPublish] = useState(false);
  const { busy, error, success, run } = useAsyncAction();
  useEffect(() => {
    if (creating) return;
    let active = true;
    api.get(`/admin/scholarships/${encodeURIComponent(id)}`).then((result) => {
      if (!active) return;
      const record = result?.scholarship || result;
      setValues({ ...emptyScholarship, ...record, sourceUrl: record.sourceUrl || record.source?.url || "", applicationUrl: record.applicationUrl || record.application_url || "", deadline: record.deadline || record.dates?.deadline || "", educationLevels: (record.educationLevels || record.education_levels || []).join(", "), courses: (record.courses || []).join(", "), states: (record.states || []).join(", "), benefitAmount: record.benefit?.amount ?? "" });
    }).catch((err) => { if (active) setLoadError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, creating]);
  const change = (event) => setValues({ ...values, [event.target.name]: event.target.value });
  const save = async (publish = false) => {
    if (!values.title.trim() || !values.provider.trim()) { setLoadError("Title and provider are required."); return; }
    if (values.sourceUrl && !safeExternalUrl(values.sourceUrl)) { setLoadError("Enter a valid HTTP or HTTPS source URL."); return; }
    if (values.applicationUrl && !safeExternalUrl(values.applicationUrl)) { setLoadError("Enter a valid HTTP or HTTPS application URL."); return; }
    if (values.benefitAmount !== "" && (!Number.isFinite(Number(values.benefitAmount)) || Number(values.benefitAmount) < 0)) { setLoadError("Benefit amount must be a non-negative number."); return; }
    setLoadError("");
    const payload = {
      ...values,
      status: publish ? "published" : values.status,
      educationLevels: values.educationLevels.split(",").map((item) => item.trim()).filter(Boolean),
      courses: values.courses.split(",").map((item) => item.trim()).filter(Boolean),
      states: values.states.split(",").map((item) => item.trim()).filter(Boolean),
      benefit: values.benefitAmount === "" ? null : { amount: Number(values.benefitAmount), currency: values.benefitCurrency },
      dates: { deadline: values.deadline || null },
    };
    const result = await run(() => creating ? api.post("/admin/scholarships", payload) : api.put(`/admin/scholarships/${encodeURIComponent(id)}`, payload), publish ? "Scholarship published." : "Scholarship saved.");
    if (result) setConfirmPublish(false);
  };
  if (loading) return <div className="skeleton-list"><span /><span /><span /></div>;
  if (loadError && !creating && !values.title) return <ErrorState error={loadError} />;
  return <><PageHeader eyebrow="Administration" title={creating ? "Create scholarship" : "Edit scholarship"} description="Only save source-backed information. Keep unknown fields unknown." actions={<Link className="button button-secondary" to="/admin/scholarships">Back to scholarships</Link>} /><form className="form-card admin-form" onSubmit={(event) => { event.preventDefault(); save(false); }}><fieldset><legend>Basic information</legend><div className="form-grid">{[["title", "Title"], ["provider", "Provider"], ["type", "Opportunity type"], ["sourceUrl", "Source URL"], ["applicationUrl", "Official application URL"]].map(([key, label]) => <FormField key={key} id={`admin-${key}`} label={label} required={key === "title" || key === "provider"}><input id={`admin-${key}`} name={key} value={values[key] || ""} onChange={change} /></FormField>)}</div><FormField label="Summary" id="admin-summary"><textarea id="admin-summary" name="summary" rows="2" value={values.summary || ""} onChange={change} /></FormField><FormField label="Description" id="admin-description"><textarea id="admin-description" name="description" rows="5" value={values.description || ""} onChange={change} /></FormField></fieldset><fieldset><legend>Eligibility and dates</legend><div className="form-grid"><FormField label="Education levels (comma separated)" id="admin-education"><input id="admin-education" name="educationLevels" value={values.educationLevels || ""} onChange={change} /></FormField><FormField label="Courses (comma separated)" id="admin-courses"><input id="admin-courses" name="courses" value={values.courses || ""} onChange={change} /></FormField><FormField label="States (comma separated)" id="admin-states"><input id="admin-states" name="states" value={values.states || ""} onChange={change} /></FormField><FormField label="Deadline" id="admin-deadline"><input id="admin-deadline" name="deadline" type="date" value={values.deadline || ""} onChange={change} /></FormField><FormField label="Benefit amount" id="admin-benefit"><input id="admin-benefit" name="benefitAmount" type="number" min="0" value={values.benefitAmount} onChange={change} /></FormField><FormField label="Currency" id="admin-currency"><input id="admin-currency" name="benefitCurrency" value={values.benefitCurrency} onChange={change} /></FormField></div></fieldset><fieldset><legend>Publication</legend><div className="form-grid"><FormField label="Status" id="admin-status"><select id="admin-status" name="status" value={values.status} onChange={change}><option value="draft">Draft</option><option value="needs_review">Needs review</option><option value="published">Published</option><option value="closed">Closed</option><option value="archived">Archived</option></select></FormField><FormField label="Verification status" id="admin-verification"><select id="admin-verification" name="verificationStatus" value={values.verificationStatus} onChange={change}><option value="unknown">Unknown</option><option value="verified">Verified</option><option value="needs_review">Needs review</option><option value="outdated">Outdated</option></select></FormField></div><p className="small-print">Publishing should require source evidence and authorized review. The backend must enforce permissions and keep an audit trail.</p></fieldset>{(error || loadError) && <p className="form-error" role="alert">{error || loadError}</p>}{success && <p className="form-success" role="status">{success}</p>}<div className="form-actions"><button className="button button-secondary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save draft"}</button><button className="button button-primary" type="button" onClick={() => setConfirmPublish(true)} disabled={busy}>Publish</button></div></form>{confirmPublish && <div className="dialog-backdrop" role="presentation"><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="publish-title"><h2 id="publish-title">Publish this scholarship?</h2><p>Confirm that the source and criteria have been reviewed. The service must record the authorized publication action.</p><div className="dialog-actions"><button className="button button-secondary" onClick={() => setConfirmPublish(false)}>Cancel</button><button className="button button-primary" onClick={() => save(true)} disabled={busy}>{busy ? "Publishing…" : "Confirm publish"}</button></div></section></div>}</>;
}

export function DiscoveryReviewPage() {
  usePageTitle("Discovery review");
  const { data, loading, error, load } = useAdminResource("/admin/discovered");
  const items = asArray(data);
  const { busy, error: actionError, run } = useAsyncAction();
  const action = async (id, actionName) => { const result = await run(() => api.post(`/admin/discovered/${encodeURIComponent(id)}/${actionName}`, {}), "Review action submitted."); if (result) load(); };
  return <><PageHeader eyebrow="Administration" title="Discovery review" description="AI-extracted or discovered content must be reviewed by an authorized admin before publication." /><AdminDataState loading={loading} error={error} data={items} retry={load} title="No discoveries awaiting review"><span>Newly discovered records from the service will appear here.</span></AdminDataState>{actionError && <p className="form-error" role="alert">{actionError}</p>}{items.map((item) => { const source = safeExternalUrl(item.url || item.sourceUrl); return <article className="review-card" key={item.id}><div className="section-title-row"><div><p className="eyebrow">{item.domain || item.sourceName || "Source unavailable"}</p><h2>{item.title || "Untitled discovery"}</h2></div><StatusBadge status={item.state || item.status} /></div><p>Discovered: {item.discoveredAt ? new Date(item.discoveredAt).toLocaleString() : "Date unavailable"}{item.duplicate ? " · Possible duplicate" : ""}</p>{source && <a href={source} target="_blank" rel="noopener noreferrer">View original source ↗</a>}<p className="muted">Extracted content is untrusted. Review evidence and criteria in the source system; raw scraped HTML is not displayed.</p><div className="form-actions"><button className="button button-primary button-small" onClick={() => action(item.id, "approve")} disabled={busy}>Approve to draft</button><button className="button button-secondary button-small" onClick={() => action(item.id, "reject")} disabled={busy}>Reject</button><button className="button button-secondary button-small" onClick={() => action(item.id, "duplicate")} disabled={busy}>Mark duplicate</button></div></article>; })}</>;
}

export function SourcesPage() {
  usePageTitle("Source registry");
  const { data, loading, error, load } = useAdminResource("/admin/sources");
  const items = asArray(data);
  const { busy, error: actionError, run } = useAsyncAction();
  const toggle = async (item) => { const result = await run(() => api.put(`/admin/sources/${encodeURIComponent(item.id)}`, { ...item, enabled: !item.enabled }), "Source settings updated."); if (result) load(); };
  return <><PageHeader eyebrow="Administration" title="Source registry" description="Manage approved source metadata and review history. Respect site restrictions and access controls." /><AdminDataState loading={loading} error={error} data={items} retry={load} title="No sources configured"><span>Approved source records from the service will appear here.</span></AdminDataState>{actionError && <p className="form-error" role="alert">{actionError}</p>}{!loading && !error && items.length > 0 && <div className="table-wrap"><table><thead><tr><th>Source</th><th>Type</th><th>Last crawl</th><th>Last result</th><th>Enabled</th><th>Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.name || "Unnamed source"}<br />{safeExternalUrl(item.baseUrl || item.base_url) ? <a href={safeExternalUrl(item.baseUrl || item.base_url)} target="_blank" rel="noopener noreferrer">{item.baseUrl || item.base_url}</a> : "URL unavailable"}</td><td>{item.type || item.sourceType || "Not specified"}</td><td>{item.lastCrawlAt || item.last_crawl_at || "Not available"}</td><td>{item.lastError || item.last_error || item.lastSuccess || item.last_success || "Not available"}</td><td>{item.enabled ? "Enabled" : "Disabled"}</td><td><button className="button button-secondary button-small" onClick={() => toggle(item)} disabled={busy}>{item.enabled ? "Disable" : "Enable"}</button></td></tr>)}</tbody></table></div>}<p className="small-print">Crawl controls are not exposed unless supported by the backend. robots.txt is not itself legal permission.</p></>;
}

export function AuditLogPage() {
  usePageTitle("Audit log");
  const { data, loading, error, load } = useAdminResource("/admin/audit");
  const rows = asArray(data);
  return <><PageHeader eyebrow="Administration" title="Audit log" description="Read-only history of administrative changes returned by the service." /><AdminDataState loading={loading} error={error} data={rows} retry={load} title="No audit events available"><span>Administrative events will appear here when supplied by the service.</span></AdminDataState>{!loading && !error && rows.length > 0 && <AdminTable rows={rows} columns={["timestamp", "admin", "action", "record", "changeSummary", "reason"]} />}</>;
}
