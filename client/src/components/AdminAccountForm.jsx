import { useState } from "react";
import { apiRequest } from "../api";

function AdminAccountForm({ onBack }) {
  const [form, setForm] = useState({ adminName: "", email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await apiRequest("/admin/accounts", { method: "POST", body: JSON.stringify(form) });
      setForm({ adminName: "", email: "", password: "", confirmPassword: "" });
      setMessage("New admin account created successfully.");
    } catch (createError) {
      setError(createError.message);
    }
  }

  return (
    <section className="card admin-account-card">
      <h3>Create New Admin Account</h3>
      <form onSubmit={submit}>
        <label>Admin Name
          <input name="adminName" value={form.adminName} onChange={change} required />
        </label>
        <label>Admin Email
          <input type="email" name="email" value={form.email} onChange={change} required />
        </label>
        <label>Password
          <input type="password" name="password" value={form.password} onChange={change} required />
        </label>
        <label>Confirm Password
          <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={change} required />
        </label>
        <button className="primary-button" type="submit">Create Account</button>
      </form>
      {message && <p className="message success">{message}</p>}
      {error && <p className="message error">{error}</p>}
      <button className="secondary-button wide back-button" onClick={onBack}>Back to Admin Dashboard</button>
    </section>
  );
}

export default AdminAccountForm;
