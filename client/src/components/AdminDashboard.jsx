import { useEffect, useState } from "react";
import { apiRequest } from "../api";

const statuses = ["Pending", "In Progress", "Resolved"];
const categories = ["", "Classrooms", "Laboratories", "Hostel", "Transport", "Canteen", "Other"];

function AdminDashboard({ user, onLogout, onNewAdmin }) {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [filters, setFilters] = useState({ category: "", status: "" });
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const query = new URLSearchParams(filters).toString();
      const [items, totals] = await Promise.all([apiRequest(`/admin/complaints?${query}`), apiRequest("/admin/stats")]);
      setComplaints(items); setStats(totals);
    } catch (loadError) { setError(loadError.message); }
  }
  useEffect(() => { load(); }, [filters.category, filters.status]);

  async function updateStatus(id) {
    try {
      const complaint = complaints.find((item) => item._id === id);
      const status = selectedStatuses[id] || complaint.status;
      await apiRequest(`/admin/complaints/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
      setMessage("Complaint status updated successfully.");
      setError("");
      load();
    } catch (updateError) { setError(updateError.message); }
  }

  return <div>
    <div className="dashboard-heading"><div><p className="eyebrow">Administrator dashboard</p><h2>Review Submissions</h2><p className="muted">{user.adminName || user.email}</p></div><button className="secondary-button" onClick={onLogout}>Log Out</button></div>
    <div className="stats">{[["Total", stats.total], ["Pending", stats.pending], ["In Progress", stats.inProgress], ["Resolved", stats.resolved]].map(([label, value]) => <div className="stat" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
    <div className="admin-actions"><button className="secondary-button" onClick={onNewAdmin}>New Admin</button></div>
    <section className="card"><div className="section-heading"><h3>All Submissions</h3><div className="filters"><select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>{categories.map((category) => <option key={category} value={category}>{category || "All categories"}</option>)}</select><select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></div></div>
      {message && <p className="message success">{message}</p>}{error && <p className="message error">{error}</p>}{complaints.length === 0 && <p className="muted">No submissions match these filters.</p>}
      {complaints.map((complaint) => <article className="admin-submission" key={complaint._id}><div><h4>{complaint.subject}</h4><p><strong>{complaint.studentName}</strong> · {complaint.rollNumber}</p><p>{complaint.category} · {complaint.submissionType}</p><p>{complaint.description}</p><small>{new Date(complaint.createdAt).toLocaleString()}</small></div><div className="status-control"><select value={selectedStatuses[complaint._id] || complaint.status} onChange={(event) => setSelectedStatuses({ ...selectedStatuses, [complaint._id]: event.target.value })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select><button className="primary-button save-status" onClick={() => updateStatus(complaint._id)}>Save Status</button></div></article>)}
    </section>
  </div>;
}

export default AdminDashboard;
