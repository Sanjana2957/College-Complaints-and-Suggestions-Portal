import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import AdminAccountForm from "./AdminAccountForm";

function AdminAccountPage({ onBack }) {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    apiRequest("/auth/me")
      .then((user) => setIsAdmin(user.role === "admin"))
      .catch(() => setIsAdmin(false))
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <p className="loading">Checking administrator access...</p>;

  if (!isAdmin) {
    return (
      <section className="auth-card">
        <p className="eyebrow">Administrator access</p>
        <h2>New Admin</h2>
        <p className="message error">Only an authenticated administrator can create a new admin account.</p>
        <button className="secondary-button wide" onClick={onBack}>Back to Admin Login</button>
      </section>
    );
  }

  return <AdminAccountForm onBack={onBack} />;
}

export default AdminAccountPage;
