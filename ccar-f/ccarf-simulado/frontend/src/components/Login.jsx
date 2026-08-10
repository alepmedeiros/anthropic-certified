import { useState } from "react";
import { api, setToken } from "../api/client";
import { wrapStyle, cardStyle, primaryButton, colors } from "../theme";

export default function Login({ onAuthenticated }) {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = mode === "login" ? await api.login(email, password) : await api.register(email, password);
      setToken(result.token);
      onAuthenticated(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = {
    display: "block",
    width: "100%",
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    color: colors.text,
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "13px",
    fontFamily: "inherit",
    marginBottom: "10px",
    boxSizing: "border-box",
  };

  return (
    <div style={wrapStyle}>
      <div style={{ fontSize: "12px", color: colors.textDim, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "4px" }}>
        CCAR-F — simulado
      </div>
      <div style={{ fontSize: "20px", fontWeight: 600, marginBottom: "1.25rem" }}>
        {mode === "login" ? "Sign in" : "Create account"}
      </div>
      <form onSubmit={submit} style={cardStyle}>
        <label style={{ fontSize: "12px", color: colors.textDim }}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <label style={{ fontSize: "12px", color: colors.textDim }}>Password</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        {error && <div style={{ color: colors.red, fontSize: "12px", marginBottom: "8px" }}>{error}</div>}
        <button type="submit" disabled={busy} style={{ ...primaryButton, width: "100%" }}>
          {busy ? "please wait..." : mode === "login" ? "sign in" : "create account"}
        </button>
      </form>
      <div style={{ fontSize: "12px", color: colors.textDim }}>
        {mode === "login" ? "No account yet? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => {
            setError(null);
            setMode(mode === "login" ? "register" : "login");
          }}
          style={{ background: "none", border: "none", color: colors.accent, cursor: "pointer", fontFamily: "inherit", padding: 0 }}
        >
          {mode === "login" ? "register" : "sign in"}
        </button>
      </div>
    </div>
  );
}
