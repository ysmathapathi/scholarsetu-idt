import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { FormField, PageHeader, useAsyncAction, usePageTitle } from "../components/UI";

function AuthLayout({ title, description, children }) {
  return <div className="auth-page"><section className="auth-card"><PageHeader eyebrow="ScholarSetu account" title={title} description={description} />{children}</section></div>;
}

export function LoginPage() {
  usePageTitle("Log in");
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { busy, error, run } = useAsyncAction();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState({});
  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setValidation(next);
    if (Object.keys(next).length) return;
    const result = await run(() => signIn({ email, password }));
    if (result) {
      const destination = location.state?.from;
      navigate(destination || (result.user?.profileComplete === false || result.user?.profile_complete === false ? "/onboarding" : "/dashboard"), { replace: true });
    }
  };
  return <AuthLayout title="Welcome back" description="Sign in to manage your profile and saved opportunities."><form className="stack-form" onSubmit={submit} noValidate><FormField label="Email" id="login-email" required error={validation.email}><input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></FormField><FormField label="Password" id="login-password" required error={validation.password}><div className="password-input"><input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" className="text-button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button></div></FormField><div className="form-inline"><Link to="/forgot-password">Forgot password?</Link></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary button-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form><p className="auth-switch">New to ScholarSetu? <Link to="/register">Create an account</Link></p><p className="small-print">Sign-in requires a configured ScholarSetu authentication service.</p></AuthLayout>;
}

export function RegisterPage() {
  usePageTitle("Create an account");
  const { register } = useAuth();
  const navigate = useNavigate();
  const { busy, error, run } = useAsyncAction();
  const [values, setValues] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState({});
  const change = (event) => setValues({ ...values, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!values.name.trim()) next.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email address.";
    if (values.password.length < 8) next.password = "Use at least 8 characters.";
    if (!/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) next.password = "Use at least 8 characters, including a letter and a number.";
    if (values.confirmPassword !== values.password) next.confirmPassword = "Passwords do not match.";
    setValidation(next);
    if (Object.keys(next).length) return;
    const result = await run(() => register({ name: values.name.trim(), email: values.email, password: values.password }));
    if (result) navigate("/onboarding", { replace: true });
  };
  return <AuthLayout title="Create your account" description="Start with the details needed to sign in. Your student profile comes later."><form className="stack-form" onSubmit={submit} noValidate><FormField label="Full name" id="register-name" required error={validation.name}><input id="register-name" name="name" autoComplete="name" value={values.name} onChange={change} /></FormField><FormField label="Email" id="register-email" required error={validation.email}><input id="register-email" name="email" type="email" autoComplete="email" value={values.email} onChange={change} /></FormField><FormField label="Password" id="register-password" required hint="At least 8 characters, including a letter and a number." error={validation.password}><div className="password-input"><input id="register-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={values.password} onChange={change} /><button type="button" className="text-button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button></div></FormField><FormField label="Confirm password" id="register-confirm" required error={validation.confirmPassword}><input id="register-confirm" name="confirmPassword" type="password" autoComplete="new-password" value={values.confirmPassword} onChange={change} /></FormField>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary button-full" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button></form><p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p><p className="small-print">By continuing, you understand ScholarSetu is an independent discovery tool. No unconfirmed consent is requested here.</p></AuthLayout>;
}

export function ForgotPasswordPage() {
  usePageTitle("Reset password");
  const [email, setEmail] = useState("");
  const [validation, setValidation] = useState("");
  const { busy, error, success, run } = useAsyncAction();
  const submit = async (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setValidation("Enter a valid email address."); return; }
    setValidation("");
    await run(() => api.post("/auth/forgot-password", { email }), "If an account matches that email, password reset instructions will be sent.");
  };
  return <AuthLayout title="Reset your password" description="Enter your email and we’ll send instructions if an account matches."><form className="stack-form" onSubmit={submit} noValidate><FormField label="Email" id="reset-email" required error={validation}><input id="reset-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></FormField>{error && <p className="form-error" role="alert">{error}</p>}{success && <p className="form-success" role="status">{success}</p>}<button className="button button-primary button-full" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button></form><p className="auth-switch"><Link to="/login">Return to sign in</Link></p></AuthLayout>;
}
