import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api, asArray, queryString, safeExternalUrl } from "../services/api";
import { Breadcrumbs, DeadlineLabel, EmptyState, ErrorState, FormField, PageHeader, SourceVerificationLabel, StatusBadge, useAsyncAction, usePageTitle } from "../components/UI";
import { useAuth } from "../context/AuthContext";

function ScholarshipCard({ scholarship, onSaved }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    if (!user) return;
    setBusy(true); setError("");
    try {
      await api.post("/saved", { scholarshipId: scholarship.id });
      if (onSaved) onSaved();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const benefit = scholarship.benefit;
  const amount = benefit && benefit.amount != null
    ? new Intl.NumberFormat(undefined, { style: "currency", currency: benefit.currency || "INR", maximumFractionDigits: 0 }).format(benefit.amount)
    : null;
  return <article className="scholarship-card"><div className="card-overline"><span>{scholarship.provider || "Provider not specified"}</span><StatusBadge status={scholarship.status} /></div><h3><Link to={`/scholarships/${encodeURIComponent(scholarship.id)}`}>{scholarship.title || "Untitled scholarship"}</Link></h3><p className="card-summary">{scholarship.summary || "A summary has not been provided by the source."}</p><div className="tag-row">{(scholarship.educationLevels || scholarship.education_levels || []).slice(0, 3).map((tag) => <span className="tag" key={tag}>{tag}</span>)}{(scholarship.courses || []).slice(0, 2).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div><div className="card-meta">{amount && <span>{amount}{benefit.type ? ` · ${benefit.type}` : ""}</span>}<DeadlineLabel deadline={scholarship.dates?.deadline || scholarship.deadline} /></div><div className="card-footer"><SourceVerificationLabel source={scholarship.source} /><div className="card-actions"><Link className="text-link" to={`/scholarships/${encodeURIComponent(scholarship.id)}`}>View details <span aria-hidden="true">→</span></Link>{user && <button className="bookmark-button" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save"}</button>}</div></div>{error && <small className="field-error" role="alert">{error}</small>}</article>;
}

export function LandingPage() {
  usePageTitle("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => { setLoading(true); setError(""); api.get("/scholarships?limit=3").then((data) => setItems(asArray(data).slice(0, 3))).catch((err) => setError(err.message)).finally(() => setLoading(false)); };
  useEffect(load, []);
  return <div className="landing-page">
    <section className="hero-section"><div className="hero-inner"><div className="hero-copy"><p className="eyebrow">A clearer way to find support</p><h1>Find scholarships that fit your future.</h1><p className="hero-description">Discover scholarships and financial-assistance schemes matched to your education, location, and eligibility — with clear requirements and official application links.</p><div className="hero-actions"><Link className="button button-primary" to="/scholarships">Find scholarships</Link><Link className="button button-secondary" to="/register">Create your profile</Link></div><p className="hero-caption">One profile. Relevant scholarships. Clear next steps.</p></div><div className="preview-card" aria-label="Illustration of a scholarship discovery dashboard"><div className="preview-top"><span className="preview-dot" /><span className="preview-dot" /><span className="preview-dot" /><span className="preview-title">Your scholarship workspace</span></div><div className="preview-content"><div className="preview-greeting">A more focused search</div><div className="preview-line preview-line-long" /><div className="preview-line preview-line-short" /><div className="preview-opportunity"><span className="preview-icon">✓</span><div><strong>Criteria, made clearer</strong><small>Review the requirements that matter</small></div></div><div className="preview-opportunity"><span className="preview-icon preview-icon-soft">↗</span><div><strong>Official next steps</strong><small>Apply directly with the provider</small></div></div><div className="preview-footnote">Illustrative interface · No eligibility decision shown</div></div></div></div></section>
    <section className="section section-narrow"><p className="eyebrow">The challenge</p><h2>Finding support shouldn’t mean piecing together a maze.</h2><div className="three-grid"><article className="plain-card"><span className="step-number">01</span><h3>Opportunities are scattered</h3><p>Relevant support can be difficult to discover across different provider websites.</p></article><article className="plain-card"><span className="step-number">02</span><h3>Criteria are hard to interpret</h3><p>Requirements may be spread across pages and documents, with details that need clarification.</p></article><article className="plain-card"><span className="step-number">03</span><h3>Deadlines are easy to miss</h3><p>Keeping important dates and official application links in one place takes effort.</p></article></div></section>
    <section className="section benefits-section"><div className="section-heading"><p className="eyebrow">A more useful starting point</p><h2>Make the next step easier to see.</h2></div><div className="benefit-grid"><div><span className="benefit-mark">01</span><h3>One profile</h3><p>Keep relevant education and location details together, and choose what you share.</p></div><div><span className="benefit-mark">02</span><h3>Relevant matches</h3><p>Understand how recorded requirements compare with the information in your profile.</p></div><div><span className="benefit-mark">03</span><h3>Clear explanations</h3><p>See what is met, what is missing, and what needs confirmation.</p></div><div><span className="benefit-mark">04</span><h3>Official next steps</h3><p>Review source information and continue through the provider’s official portal.</p></div></div></section>
    <section className="section section-narrow"><div className="section-heading"><p className="eyebrow">How it works</p><h2>From your profile to a clearer next step.</h2></div><div className="steps-row"><article><span>1</span><h3>Create your profile</h3><p>Add the details needed to understand your search.</p></article><article><span>2</span><h3>Compare criteria</h3><p>Review how your profile compares with recorded criteria.</p></article><article><span>3</span><h3>Check and apply</h3><p>Confirm requirements and apply with the official provider.</p></article></div><Link className="text-link" to="/how-it-works">Learn how it works →</Link></section>
    <section className="section featured-section"><div className="section-heading"><div><p className="eyebrow">Explore</p><h2>Scholarships in the directory</h2><p>Information is supplied by the service and may change. Always confirm details with the provider.</p></div><Link className="text-link" to="/scholarships">Explore all scholarships →</Link></div>{loading ? <div className="skeleton-grid" aria-label="Loading scholarships"><span /><span /><span /></div> : error ? <ErrorState error={error} onRetry={load} /> : items.length ? <div className="scholarship-grid">{items.map((item) => <ScholarshipCard key={item.id} scholarship={item} />)}</div> : <EmptyState title="No featured scholarships available"><span>Explore the directory to search current records. No sample opportunities are presented as verified.</span><Link className="text-link" to="/scholarships">Browse the directory →</Link></EmptyState>}</section>
    <section className="trust-section"><div><p className="eyebrow">Understand what you’re seeing</p><h2>Transparent information, with realistic expectations.</h2><p>ScholarSetu helps organize sourced information and compare it with your profile. Criteria can change, sources may need review, and providers always make final eligibility and selection decisions.</p><Link className="text-link" to="/about">Our approach and limitations →</Link></div><div className="trust-points"><p><span>✓</span> Source links and check dates where available</p><p><span>✓</span> Criteria-based explanations, not award promises</p><p><span>✓</span> Applications continue through the official provider</p></div></section>
    <section className="final-cta"><p className="eyebrow">Start with what you need</p><h2>Find the support that helps you move forward.</h2><div className="hero-actions"><Link className="button button-white" to="/scholarships">Explore scholarships</Link><Link className="button button-outline-white" to="/register">Create your profile</Link></div></section>
  </div>;
}

export function HowItWorksPage() {
  usePageTitle("How it works");
  return <div className="content-page"><div className="narrow-page"><Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "How it works" }]} /><PageHeader eyebrow="A practical guide" title="How ScholarSetu works" description="A clearer way to discover opportunities, understand recorded requirements, and find the official next step." /><div className="explainer-steps">{[["01", "Create your profile", "Add education, domicile, and other relevant details. You can leave information unknown when you do not have it."], ["02", "Compare your profile", "ScholarSetu compares your information with the criteria currently recorded for each opportunity."], ["03", "Understand the result", "See which criteria appear satisfied, which do not, and which need more information or review."], ["04", "Visit the official portal", "Confirm current requirements with the provider and apply through its official application portal."]].map(([n, title, text]) => <article className="explainer-step" key={n}><span className="step-number">{n}</span><div><h2>{title}</h2><p>{text}</p></div></article>)}</div><section className="callout"><h2>What do the statuses mean?</h2><dl className="status-explanations"><div><dt><StatusBadge status="eligible" /></dt><dd>All required recorded criteria are confirmed as satisfied. This is not a provider decision.</dd></div><div><dt><StatusBadge status="not_eligible" /></dt><dd>At least one confirmed mandatory criterion does not match the recorded profile.</dd></div><div><dt><StatusBadge status="needs_more_information" /></dt><dd>A mandatory profile or opportunity detail is missing or unclear.</dd></div><div><dt><StatusBadge status="needs_review" /></dt><dd>Information is ambiguous, conflicting, or requires an authorized review.</dd></div></dl></section><p className="notice">Criteria and deadlines can change. Providers make all final eligibility and selection decisions.</p><div className="hero-actions"><Link className="button button-primary" to="/register">Create your profile</Link><Link className="button button-secondary" to="/scholarships">Browse scholarships</Link></div></div></div>;
}

export function ScholarshipListPage() {
  usePageTitle("Explore scholarships");
  const [searchParams, setSearchParams] = useSearchParams();
  const [draftQuery, setDraftQuery] = useState(searchParams.get("q") || "");
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileFilters, setMobileFilters] = useState(false);
  const query = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "";
  useEffect(() => { setDraftQuery(query); }, [query]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (draftQuery.trim()) next.set("q", draftQuery.trim()); else next.delete("q");
      if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draftQuery, searchParams, setSearchParams]);
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    const queryText = queryString({ q: query, status, sort, page: searchParams.get("page") || "" });
    api.get(`/scholarships${queryText ? `?${queryText}` : ""}`)
      .then((result) => { if (active) { setData(asArray(result)); setTotal(typeof result?.total === "number" ? result.total : null); } })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, status, sort, searchParams]);
  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  };
  const clear = () => { setDraftQuery(""); setSearchParams({}); };
  return <div className="content-page"><div className="wide-page"><Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Scholarships" }]} /><PageHeader eyebrow="Discovery" title="Explore scholarships" description="Search opportunities and review their requirements and source information. Confirm current details with the provider." /><div className="search-row"><label className="search-box"><span className="sr-only">Search scholarships</span><span aria-hidden="true">⌕</span><input value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} placeholder="Search title, provider, course, or keyword" /></label><button className="button button-secondary filter-toggle" onClick={() => setMobileFilters(!mobileFilters)} aria-expanded={mobileFilters}>Filters</button></div><div className={`discovery-layout${mobileFilters ? " filters-visible" : ""}`}><aside className="filter-panel"><div className="filter-head"><h2>Filters</h2><button className="text-button" onClick={clear}>Clear all</button></div><FormField label="Opportunity status" id="status-filter"><select id="status-filter" value={status} onChange={(event) => updateParam("status", event.target.value)}><option value="">All statuses</option><option value="open">Open</option><option value="upcoming">Upcoming</option><option value="closed">Closed</option></select></FormField><FormField label="Sort by" id="sort-filter"><select id="sort-filter" value={sort} onChange={(event) => updateParam("sort", event.target.value)}><option value="">Default</option><option value="deadline">Deadline soonest</option><option value="verified">Recently verified</option><option value="newest">Recently added</option></select></FormField><p className="filter-note">Additional filters appear when supported by the scholarship service.</p></aside><section className="results-panel" aria-live="polite"><div className="results-header"><p>{total !== null ? `${total} results` : "Scholarship results"}</p><span>{query && `Search: “${query}”`}</span></div>{loading ? <div className="skeleton-list"><span /><span /><span /></div> : error ? <ErrorState error={error} onRetry={() => setSearchParams(new URLSearchParams(searchParams))} /> : data.length ? <div className="scholarship-grid">{data.map((item) => <ScholarshipCard key={item.id} scholarship={item} />)}</div> : <EmptyState title="No scholarships found"><span>Try a different search or clear the filters. Results are provided by the connected service.</span></EmptyState>}{!loading && !error && data.length > 0 && <div className="pagination"><button className="button button-secondary button-small" disabled={!searchParams.get("page") || searchParams.get("page") === "1"} onClick={() => updateParam("page", String(Math.max(1, Number(searchParams.get("page") || 1) - 1)))}>Previous</button><span>Page {searchParams.get("page") || "1"}</span><button className="button button-secondary button-small" disabled={total !== null && data.length >= total} onClick={() => updateParam("page", String(Number(searchParams.get("page") || 1) + 1))}>Next</button></div>}</section></div></div></div>;
}

export function ScholarshipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  usePageTitle(scholarship?.title || "Scholarship details");
  const load = () => { setLoading(true); setError(""); api.get(`/scholarships/${encodeURIComponent(id)}`).then((result) => setScholarship(result?.scholarship || result)).catch((err) => setError(err.message)).finally(() => setLoading(false)); };
  useEffect(load, [id]);
  const save = async () => {
    if (!user) { navigate("/login", { state: { from: `/scholarships/${id}` } }); return; }
    setBusy(true); setActionError(""); setActionMessage("");
    try {
      if (saved) await api.delete(`/saved/${encodeURIComponent(id)}`);
      else await api.post("/saved", { scholarshipId: id });
      setSaved(!saved);
    } catch (err) { setActionError(err.message); }
    finally { setBusy(false); }
  };
  const checkEligibility = async () => {
    if (!user) navigate("/login", { state: { from: `/scholarships/${id}` } });
    else if (user.profileComplete === false || user.profile_complete === false) navigate("/onboarding");
    else {
      setBusy(true);
      setActionError("");
      setActionMessage("");
      try {
        await api.post("/eligibility/check", { scholarshipId: id });
        navigate(`/matches?scholarship=${encodeURIComponent(id)}`);
      } catch (err) {
        setActionError(err.message);
      } finally {
        setBusy(false);
      }
    }
  };
  if (loading) return <div className="content-page"><div className="wide-page"><div className="skeleton-detail" /></div></div>;
  if (error) return <div className="content-page"><div className="wide-page"><Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Scholarships", to: "/scholarships" }, { label: "Details" }]} /><ErrorState error={error} onRetry={load} /></div></div>;
  if (!scholarship) return null;
  const sourceUrl = safeExternalUrl(scholarship.source?.url);
  const applicationUrl = safeExternalUrl(scholarship.applicationUrl || scholarship.application_url);
  const dates = scholarship.dates || {};
  const groups = scholarship.eligibility || scholarship.criteria || {};
  const listEntries = (value) => Array.isArray(value) ? value : value ? [value] : [];
  return <div className="content-page"><div className="wide-page"><Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Scholarships", to: "/scholarships" }, { label: scholarship.title || "Details" }]} /><div className="detail-heading"><div><p className="eyebrow">{scholarship.provider || "Provider not specified"}</p><h1>{scholarship.title || "Scholarship details"}</h1><StatusBadge status={scholarship.status} /></div><button className="button button-secondary" onClick={save} disabled={busy}>{busy ? "Saving…" : saved ? "Remove saved" : "Save scholarship"}</button></div>{actionError && <p role="alert" className="field-error">{actionError}</p>}<div className="detail-grid"><article className="detail-main"><section className="detail-section"><h2>Overview</h2><p>{scholarship.description || scholarship.summary || "No description has been provided."}</p></section><section className="detail-section"><h2>Eligibility criteria</h2>{Object.keys(groups).length ? <div className="criteria-list">{Object.entries(groups).map(([key, value]) => <div key={key}><strong>{key.replaceAll(/([A-Z])/g, " $1").replaceAll("_", " ")}</strong><span>{Array.isArray(value) ? value.join(", ") : typeof value === "object" ? JSON.stringify(value) : String(value ?? "Not stated")}</span></div>)}</div> : <p className="muted">Eligibility criteria are not available in the current record. Confirm requirements with the provider.</p>}</section>{listEntries(scholarship.documents).length > 0 && <section className="detail-section"><h2>Documents</h2><ul>{listEntries(scholarship.documents).map((item, index) => <li key={index}>{typeof item === "string" ? item : item.name || item.title || "Document details unavailable"}</li>)}</ul></section>}{listEntries(scholarship.applicationSteps || scholarship.application_steps).length > 0 && <section className="detail-section"><h2>Application steps</h2><ol>{listEntries(scholarship.applicationSteps || scholarship.application_steps).map((item, index) => <li key={index}>{typeof item === "string" ? item : item.description || item.title || "Step details unavailable"}</li>)}</ol></section>}<section className="detail-section"><h2>Important dates</h2><div className="date-summary"><p><strong>Opens:</strong> {dates.opensAt || dates.opens_at || "Date unavailable"}</p><p><strong>Deadline:</strong> {dates.deadline || scholarship.deadline || "Date unavailable"}</p></div></section></article><aside className="detail-aside"><div className="summary-card"><h2>At a glance</h2><dl><div><dt>Benefit</dt><dd>{scholarship.benefit?.amount != null ? `${scholarship.benefit.currency || "INR"} ${scholarship.benefit.amount}${scholarship.benefit.type ? ` · ${scholarship.benefit.type}` : ""}` : "Not available"}</dd></div><div><dt>Deadline</dt><dd><DeadlineLabel deadline={dates.deadline || scholarship.deadline} /></dd></div><div><dt>Education</dt><dd>{listEntries(scholarship.educationLevels || scholarship.education_levels).join(", ") || "Not specified"}</dd></div><div><dt>Location</dt><dd>{listEntries(scholarship.states).join(", ") || "Not specified"}</dd></div><div><dt>Provider</dt><dd>{scholarship.provider || "Not specified"}</dd></div><div><dt>Source</dt><dd>{sourceUrl ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer">{scholarship.source?.name || "View source"}</a> : scholarship.source?.name || "Not available"}</dd></div></dl><SourceVerificationLabel source={scholarship.source} />{applicationUrl ? <a className="button button-primary button-full" href={applicationUrl} target="_blank" rel="noopener noreferrer">Visit official application portal ↗</a> : <p className="muted">Official application link not available.</p>}    <button className="button button-secondary button-full" onClick={checkEligibility} disabled={busy}>{busy ? "Checking…" : "Check my eligibility"}</button>{user && <button className="button button-secondary button-full" onClick={async () => { setBusy(true); setActionError(""); setActionMessage(""); try { await api.post("/applications", { scholarshipId: id, status: "interested" }); setActionMessage("Added to your application tracker."); } catch (err) { setActionError(err.message); } finally { setBusy(false); } }} disabled={busy}>Add to application tracker</button>}{actionMessage && <p className="form-success" role="status">{actionMessage}</p>}<p className="small-print">ScholarSetu does not submit applications or make final eligibility decisions.</p></div></aside></div></div></div>;
}

export function AboutPage() {
  usePageTitle("About");
  return <div className="content-page"><div className="narrow-page"><Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "About" }]} /><PageHeader eyebrow="About ScholarSetu" title="A clearer way to explore financial support" description="ScholarSetu organizes scholarship and financial-assistance information so students can understand possible next steps." /><section className="prose-section"><h2>What we do</h2><p>We help students discover opportunities, review the criteria currently recorded for them, and find links to official provider information.</p><h2>What we don’t do</h2><p>ScholarSetu does not award scholarships, guarantee eligibility or selection, represent a government, or submit applications on a student’s behalf. Only the provider can confirm current requirements and make final decisions.</p><h2>Sources and corrections</h2><p>Source links, verification status, and check dates are shown when supplied by the service. If you find incorrect information or a broken link, <Link to="/contact">send a correction report</Link> for review.</p></section><div className="notice">Always verify current requirements and apply through the official provider.</div></div></div>;
}

export function ContactPage() {
  usePageTitle("Contact");
  const { busy, error, success, run } = useAsyncAction();
  const [values, setValues] = useState({ name: "", email: "", topic: "incorrect_information", reference: "", message: "" });
  const [validation, setValidation] = useState({});
  const change = (event) => setValues({ ...values, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email address.";
    if (!values.message.trim()) next.message = "Enter a message.";
    if (values.message.length > 5000) next.message = "Keep your message under 5,000 characters.";
    setValidation(next);
    if (!Object.keys(next).length) await run(() => api.post("/contact", values), "Your message was sent. Thank you for helping improve the directory.");
  };
  return <div className="content-page"><div className="narrow-page"><Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Contact" }]} /><PageHeader eyebrow="Contact" title="Send a message" description="Report incorrect information or a broken link, ask about your account, or share feedback." /><form className="form-card" onSubmit={submit} noValidate><FormField label="Name" id="contact-name" hint="Optional"><input id="contact-name" name="name" value={values.name} onChange={change} autoComplete="name" /></FormField><FormField label="Email" id="contact-email" required error={validation.email}><input id="contact-email" name="email" type="email" value={values.email} onChange={change} autoComplete="email" required /></FormField><FormField label="Topic" id="contact-topic"><select id="contact-topic" name="topic" value={values.topic} onChange={change}><option value="incorrect_information">Incorrect information</option><option value="broken_link">Broken link</option><option value="account_issue">Account issue</option><option value="feedback">Feedback</option></select></FormField><FormField label="Scholarship reference or URL" id="contact-reference" hint="Optional"><input id="contact-reference" name="reference" value={values.reference} onChange={change} /></FormField><FormField label="Message" id="contact-message" required error={validation.message}><textarea id="contact-message" name="message" rows="5" maxLength="5000" value={values.message} onChange={change} required /></FormField>{error && <p className="form-error" role="alert">{error}</p>}{success && <p className="form-success" role="status">{success}</p>}<button className="button button-primary" disabled={busy}>{busy ? "Sending…" : "Send message"}</button></form></div></div>;
}

export function PrivacyPage() {
  usePageTitle("Privacy");
  return <div className="content-page"><div className="narrow-page"><Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Privacy" }]} /><PageHeader eyebrow="Privacy" title="Your information deserves care" description="This draft explains the intended data categories. The product owner and legal reviewer must confirm all practices before publication." /><div className="review-banner"><strong>Draft for owner and legal review</strong><span>Not a statement of confirmed legal compliance or operational practice.</span></div><section className="prose-section"><h2>Information that may be requested</h2><p>The profile may request education, domicile, course, study year, marks or grading type, and annual family income when needed for opportunity criteria. Optional fields should be clearly identified. The application does not request Aadhaar, bank details, external-portal passwords, or identity-document uploads.</p><h2>Why information is used</h2><p>Profile information is intended to compare against scholarship criteria and show relevant results. The actual use, storage, and access controls must be confirmed by the service operator.</p><h2>Authentication, storage, and third parties</h2><p>Authentication provider, hosting and storage locations, access controls, retention periods, third-party services, and any analytics or cookies must be documented by the product owner before launch.</p><h2>Your choices</h2><p>Contact the service through the available correction process to ask about access, correction, export, or deletion. The available processes and response timelines must be confirmed by the operator.</p><h2>Security and changes</h2><p>No online service can promise absolute security. This notice should be updated to reflect actual practices and reviewed before it is treated as final.</p></section></div></div>;
}
