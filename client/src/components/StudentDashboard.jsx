import { useEffect, useState } from "react";
import { apiRequest } from "../api";

const blankForm = { category: "Classrooms", submissionType: "Complaint", subject: "", description: "" };

function StudentDashboard({ user, onLogout }) {
  const [form, setForm] = useState(blankForm);
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadComplaints() {
    try { setError(""); setComplaints(await apiRequest("/complaints/mine")); }
    catch (loadError) { setError(loadError.message); }
  }
  useEffect(() => { loadComplaints(); }, []);

  async function submit(event) {
    event.preventDefault();
    setMessage(""); setError("");
    try {
      await apiRequest("/complaints", { method: "POST", body: JSON.stringify(form) });
      setForm(blankForm); setMessage("Your submission was saved successfully."); loadComplaints();
    } catch (submitError) { setError(submitError.message); }
  }

  return (
    <div>
      <div className="dashboard-heading">
        <div><p className="eyebrow">Student dashboard</p><h2>Welcome, {user.studentName}</h2><p className="muted">{user.rollNumber}</p></div>
        <button className="secondary-button" onClick={onLogout}>Log Out</button>
      </div>
      <div className="dashboard-grid">
        <section className="card"><h3>Submit Complaint or Suggestion</h3>
          <form onSubmit={submit}>
            <label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Classrooms</option><option>Laboratories</option><option>Hostel</option><option>Transport</option><option>Canteen</option><option>Other</option></select></label>
            <label>Submission Type<select value={form.submissionType} onChange={(event) => setForm({ ...form, submissionType: event.target.value })}><option>Complaint</option><option>Suggestion</option></select></label>
            <label>Subject<input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} required /></label>
            <label>Description<textarea rows="5" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label>
            <button className="primary-button" type="submit">Submit</button>
          </form>
          {message && <p className="message success">{message}</p>}{error && <p className="message error">{error}</p>}
        </section>
        <section className="card"><div className="section-heading"><h3>My Submissions</h3><button className="secondary-button" onClick={loadComplaints}>Refresh</button></div>
          {complaints.length === 0 && <p className="muted">You have not submitted anything yet.</p>}
          {complaints.map((complaint) => <article className="submission" key={complaint._id}>
            <div className="submission-title"><h4>{complaint.subject}</h4><span className={`status ${complaint.status.toLowerCase().replace(" ", "-")}`}>{complaint.status}</span></div>
            <p>{complaint.category} · {complaint.submissionType}</p><p>{complaint.description}</p><small>{new Date(complaint.createdAt).toLocaleString()}</small>
          </article>)}
        </section>
      </div>
    </div>
  );
}

export default StudentDashboard;
