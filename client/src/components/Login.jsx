import { useState } from "react";
import { apiRequest } from "../api";

function Login({ role, onLogin, onRegister }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      const path = role === "student" ? "/auth/student-login" : "/auth/admin-login";
      const user = await apiRequest(path, { method: "POST", body: JSON.stringify({ identifier, password }) });
      onLogin(user);
    } catch (loginError) {
      setError(loginError.message);
    }
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">{role === "student" ? "Student access" : "Administrator access"}</p>
      <h2>{role === "student" ? "Student Login" : "Admin Login"}</h2>
      <p className="muted">Log in to continue to your dashboard.</p>
      <form onSubmit={handleSubmit}>
        <label>{role === "student" ? "Roll number or college email" : "Admin email"}
          <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} required />
        </label>
        <label>Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button className="primary-button wide" type="submit">Log In</button>
      </form>
      {error && <p className="message error">{error}</p>}
      {role === "student" && <button className="link-button" onClick={onRegister}>New student? Create an account</button>}
    </section>
  );
}

export default Login;
