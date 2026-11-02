import { useState } from "react";
import { apiRequest } from "../api";

function Register({ onLogin, onBack }) {
  const [form, setForm] = useState({ studentName: "", rollNumber: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const user = await apiRequest("/auth/register", { method: "POST", body: JSON.stringify(form) });
      onLogin(user);
    } catch (registrationError) {
      setError(registrationError.message);
    }
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">Student access</p>
      <h2>Create Student Account</h2>
      <form onSubmit={submit}>
        <label>Student Name<input name="studentName" value={form.studentName} onChange={change} required /></label>
        <label>Roll Number<input name="rollNumber" value={form.rollNumber} onChange={change} required /></label>
        <label>College Email<input type="email" name="email" value={form.email} onChange={change} required /></label>
        <label>Password<input type="password" name="password" value={form.password} onChange={change} required /></label>
        <label>Confirm Password<input type="password" name="confirmPassword" value={form.confirmPassword} onChange={change} required /></label>
        <button className="primary-button wide" type="submit">Register</button>
      </form>
      {error && <p className="message error">{error}</p>}
      <button className="link-button" onClick={onBack}>Already registered? Log in</button>
    </section>
  );
}

export default Register;
